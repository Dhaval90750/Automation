
import { NextResponse } from 'next/server';

import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();
    let steps: any[] = [];

    // 1. Try Gemini API first if Key matches heuristic (simple check)
    if (process.env.GEMINI_API_KEY) {
        try {
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            
            const systemPrompt = `
                You are an automation expert. Convert the user's natural language request into a valid JSON array of Playwright automation steps.
                
                The output MUST be a valid JSON object with the following structure:
                {
                    "steps": [ ... array of steps as defined before ... ],
                    "pythonCode": "string containing the full python playwright script"
                }
                
                Step Schema:
                {
                    "id": string,
                    "action": "goto" | "click" | "type" | "wait" | "assertion",
                    "selector": string (optional, for click/type),
                    "value": string (optional, for goto/type/wait/assertion),
                    "description": string
                }
                
                Python Code Rules:
                - Use \`playwright.sync_api\`.
                - Include full script with \`from playwright.sync_api import sync_playwright\`.
                - Wrap in \`run(playwright)\` function and \`with sync_playwright() as playwright:\` block.
                - Include helpful comments.
                
                Example Input: "Login to example.com with user demo"
                Example Output:
                {
                    "steps": [
                        { "id": "1", "action": "goto", "value": "https://example.com", "description": "Navigate to URL" },
                        { "id": "2", "action": "type", "selector": "input[name='user']", "value": "demo", "description": "Enter username" },
                        { "id": "3", "action": "click", "selector": "button:has-text('Login')", "description": "Click Login" }
                    ],
                    "pythonCode": "from playwright.sync_api import sync_playwright\\n\\ndef run(playwright):\\n    browser = playwright.chromium.launch(headless=False)\\n    page = browser.new_page()\\n    page.goto('https://example.com')\\n    page.fill(\"input[name='user']\", 'demo')\\n    page.click(\"button:has-text('Login')\")\\n    browser.close()\\n\\nwith sync_playwright() as playwright:\\n    run(playwright)"
                }
            `;

            const result = await model.generateContent([systemPrompt, prompt]);
            const response = await result.response;
            const text = response.text();
            
            
            // Clean up code blocks if present (Gemini might wrap the whole JSON in ```json ... ```)
            const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
            let data: any;
            try {
                 data = JSON.parse(cleanText);
            } catch (e) {
                 // specific handling if JSON is broken, but return raw text anyway
                 return NextResponse.json({ success: false, error: "Failed to parse AI response", raw: text });
            }
            
            return NextResponse.json({ 
                success: true, 
                steps: data.steps, 
                pythonCode: data.pythonCode, 
                raw: text, // Return raw response for UI display
                message: "Generated automation steps and Python code." 
            });

        } catch (error) {
            console.error("Gemini API Error:", error);
            // Fallthrough to rule-based
        }
    }

    // 2. Fallback: Rule-based Parsing (if no API key or API fails)
    const lowerPrompt = prompt.toLowerCase();
    const commands = lowerPrompt.split(/,|\sand\s|\sthen\s/); 
    
    commands.forEach((cmd: string, index: number) => {
        cmd = cmd.trim();
        const id = (index + 1).toString();

        if (cmd.startsWith('go to') || cmd.startsWith('open') || cmd.startsWith('navigate')) {
            const urlMatch = cmd.match(/https?:\/\/[^\s]+/) || cmd.match(/www\.[^\s]+/);
            let url = urlMatch ? urlMatch[0] : '';
            if (url && !url.startsWith('http')) url = 'https://' + url;
            if (!url && cmd.includes('google')) url = 'https://google.com';
            
            if (url) {
                steps.push({ id, action: 'goto', value: url, description: `Navigate to ${url}` });
            }
        }
        else if (cmd.includes('click') || cmd.includes('press')) {
            const target = cmd.replace(/click|press|on/g, '').trim();
            let selector = `text=${target}`;
            if (target.toLowerCase() === 'login') selector = 'button:has-text("Login")';
            steps.push({ id, action: 'click', selector, description: `Click "${target}"` });
        }
        else if (cmd.includes('type') || cmd.includes('enter') || cmd.includes('fill')) {
            const parts = cmd.split(/ in | into /);
            const value = parts[0].replace(/type|enter|fill/g, '').trim().replace(/^["']|["']$/g, '');
            const field = parts[1]?.trim() || 'input';
            steps.push({ id, action: 'type', selector: 'input', value, description: `Type "${value}"` });
        }
    });

    if (steps.length === 0) {
         steps.push({ id: '1', action: 'goto', value: 'https://example.com', description: 'Navigate to Example (Fallback)' });
    }

    return NextResponse.json({ success: true, steps, message: "Generated steps (Rule-Based Fallback)." });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
