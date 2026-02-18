
import { chromium, Page } from 'playwright';
import db from './db';
import { VisualTester } from './visual';

export type ActionType = 'goto' | 'click' | 'type' | 'wait' | 'assertion' | 'api_request' | 'api_assert';

export interface TestStep {
  id: string;
  action: ActionType | 'visual_assert';
  selector?: string;
  value?: string;
  description?: string;
  snapshot_name?: string;
  api_body?: string; // JSON string for API body
}

interface TestRunResult {
  success: boolean;
  logs: string[];
  duration: number;
}

export class TestRunner {
  private logs: string[] = [];
  private lastApiResponse: { status: number; body: any } | null = null;
  private options: { headless?: boolean } = { headless: false };
  private browser: any = null;
  private page: Page | null = null;
  private aborted: boolean = false;

  constructor(options?: { headless?: boolean }) {
      if (options) this.options = { ...this.options, ...options };
  }

  private log(message: string) {
    const timestamp = new Date().toISOString();
    this.logs.push(`[${timestamp}] ${message}`);
    console.log(`[TestRunner] ${message}`);
  }

  public async abort() {
      this.aborted = true;
      this.log("Abort signal received. Closing browser...");
      if (this.browser) {
          try {
              await this.browser.close();
          } catch (e) {}
      }
  }

  private substituteVariables(text: string | undefined, data: any): string | undefined {
    if (!text || typeof text !== 'string') return text;
    return text.replace(/\$\{(\w+)\}/g, (_, key) => {
        return data[key] || `\${${key}}`;
    });
  }

  async runFlow(flowId: number, steps: TestStep[], data: any = {}): Promise<TestRunResult> {
    const startTime = Date.now();
    
    // Update Run Status to Running
    const runStmt = db.prepare('INSERT INTO test_runs (flow_id, status, logs) VALUES (?, ?, ?)');
    const result = runStmt.run(flowId, 'running', JSON.stringify([]));
    const runId = result.lastInsertRowid;

    let browser;
    let success = true;

    // Override the instance log method to also update the DB
    const runLog = (message: string) => {
        this.log(message); // Log to instance logs and console
        db.prepare('UPDATE test_runs SET logs = ? WHERE id = ?').run(JSON.stringify(this.logs), runId);
    };

    runLog(`Starting Test Flow ID: ${flowId}`);

    try {
      this.browser = await chromium.launch({ headless: this.options.headless }); // Use configured headless mode
      this.page = await this.browser.newPage();

      for (const step of steps) {
        if (this.aborted) {
            runLog("Test execution aborted by user.");
            break;
        }
        // Variable substitution
        step.value = this.substituteVariables(step.value, data);
        step.selector = this.substituteVariables(step.selector, data);

        runLog(`Executing Step: ${step.action} - ${step.description || ''}`);
        await this.executeStep(this.page!, step, runLog);
      }

      if (!this.aborted) runLog('Test Flow Completed Successfully');
    } catch (error: any) {
      if (this.aborted) {
          runLog("Test execution stopped.");
      } else {
          runLog(`Test Failed: ${error.message}`);
          success = false;
      }
    } finally {
      if (this.browser) {
          try { await this.browser.close(); } catch (e) {}
      }
      this.browser = null;
      this.page = null;
      
      const duration = Date.now() - startTime;
      
      // Update Run Status
      const updateStmt = db.prepare('UPDATE test_runs SET status = ?, logs = ?, duration_ms = ? WHERE id = ?');
      updateStmt.run(success ? 'passed' : 'failed', JSON.stringify(this.logs), duration, runId);
      
      return { success, logs: this.logs, duration };
    }
  }

  private resolveSelector(selector: string): string {
    if (!selector) return selector;
    
    // Check if it's a POM reference (PageName.SelectorName)
    if (selector.includes('.')) {
        const [pageName, selectorName] = selector.split('.');
        if (pageName && selectorName) {
            try {
                const stmt = db.prepare(`
                    SELECT s.selector 
                    FROM selectors s 
                    JOIN pages p ON s.page_id = p.id 
                    WHERE p.name = ? AND s.name = ?
                `);
                const result = stmt.get(pageName, selectorName) as { selector: string } | undefined;
                
                if (result) {
                    this.log(`Resolved POM: ${selector} -> ${result.selector}`);
                    return result.selector;
                }
            } catch (e) {
                this.log(`POM Resolution Failed: ${e}`);
            }
        }
    }
    return selector;
  }

  private async executeStep(page: Page, step: TestStep, log: (msg: string) => void = this.log.bind(this)) {
    let resolvedSelector = step.selector ? this.resolveSelector(step.selector) : undefined;
    
    // Attempt execution
    try {
        await this.performAction(page, step, resolvedSelector);
    } catch (e: any) {
        if (resolvedSelector && (e.message.includes('waiting for selector') || e.message.includes('Timeout'))) {
            log(`Step Failed: ${e.message}. Attempting Self-Healing...`);
            
            // Self-Healing Strategy: Look for text match
            const healingSelector = await this.healSelector(page, step);
            if (healingSelector) {
                log(`Healed Selector: ${resolvedSelector} -> ${healingSelector}`);
                // Update in DB could happen here to save the fix for future
                await this.performAction(page, step, healingSelector);
                return;
            }
        }
        throw e;
    }
  }

  private async performAction(page: Page, step: TestStep, selector: string | undefined) {
    const { action, value, snapshot_name } = step;
    
    switch (action) {
      case 'visual_assert':
        const name = snapshot_name || `step-${step.id}`;
        const result = await VisualTester.compare(page, name);
        if (!result.match) {
            throw new Error(`Visual Regression Failed. Diff saved at ${result.diffPath}`);
        }
        break;
      case 'api_request':
        // selector = method (GET, POST), value = url, api_body = body
        const method = (selector || 'GET').toUpperCase();
        const url = value || '';
        let requestOptions: any = { method };
        if (step.api_body) {
            try {
                requestOptions.data = JSON.parse(step.api_body);
            } catch (e) {
                requestOptions.data = step.api_body;
            }
        }
        
        const response = await page.request.fetch(url, requestOptions);
        let respBody;
        try {
            respBody = await response.json();
        } catch {
            respBody = await response.text();
        }
        
        this.lastApiResponse = {
            status: response.status(),
            body: respBody
        };
        
        this.log(`API ${method} ${url} -> ${response.status()}`);
        break;

      case 'api_assert':
        if (!this.lastApiResponse) throw new Error("No previous API response to assert against.");
        
        // selector = 'status' or 'body'
        if (selector === 'status') {
            const expectedStatus = parseInt(value || '200');
            if (this.lastApiResponse.status !== expectedStatus) {
                throw new Error(`API Status Assertion Failed. Expected ${expectedStatus}, got ${this.lastApiResponse.status}`);
            }
        } else if (selector === 'body') {
            // Check if body contains value (string match or json subset?)
            // Simple string includes for now
            const bodyStr = JSON.stringify(this.lastApiResponse.body);
            if (!bodyStr.includes(value!)) {
                throw new Error(`API Body Assertion Failed. Body did not contain "${value}"`);
            }
        }
        break;

      case 'goto':
        await page.goto(value!, { waitUntil: 'domcontentloaded' });
        break;
      case 'click':
        await page.click(selector!);
        break;
      case 'type':
        await page.fill(selector!, value!);
        break;
      case 'wait':
        await page.waitForTimeout(parseInt(value || '1000'));
        break;
      case 'assertion':
        const content = await page.textContent('body');
        if (!content?.includes(value!)) {
          throw new Error(`Assertion Failed: Text "${value}" not found.`);
        }
        break;
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  }

  // AI-Assisted Self Healing (Heuristic based for now)
  private async healSelector(page: Page, step: TestStep): Promise<string | null> {
      // 1. Try to find by Text Content if it's a click/type action
      if (['click', 'type'].includes(step.action) && step.description) {
          // Extract potential text from description or value
          // e.g. "Click Login" -> try looking for "Login"
          const keywords = step.description.split(' ').filter(w => w.length > 3);
          for (const word of keywords) {
              try {
                  const el = await page.getByText(word, { exact: false }).first();
                  if (await el.isVisible()) {
                      this.log(`Healing found element by text: "${word}"`);
                      return `text=${word}`;
                  }
              } catch (e) {}
          }
      }
      return null;
  }
}
