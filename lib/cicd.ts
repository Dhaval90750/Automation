
export interface CIConfig {
    provider: 'github';
    trigger: 'push' | 'schedule' | 'both';
    scheduleCron?: string;
    branch?: string;
}

export class CICDGenerator {
    static generate(config: CIConfig): string {
        if (config.provider === 'github') {
            return this.generateGithub(config);
        }
        return '';
    }

    private static generateGithub(config: CIConfig): string {
        const triggers: string[] = [];
        
        if (config.trigger === 'push' || config.trigger === 'both') {
            triggers.push(`
  push:
    branches: [ ${config.branch || 'main'} ]
  pull_request:
    branches: [ ${config.branch || 'main'} ]`);
        }

        if (config.trigger === 'schedule' || config.trigger === 'both') {
            triggers.push(`
  schedule:
    - cron: '${config.scheduleCron || '0 0 * * *'}'`);
        }

        return `name: Playwright Tests
on:${triggers.join('')}

jobs:
  test:
    timeout-minutes: 60
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - uses: actions/setup-node@v3
      with:
        node-version: 18
    - name: Install dependencies
      run: npm ci
    - name: Install Playwright Browsers
      run: npx playwright install --with-deps
    - name: Run Playwright tests
      run: npx playwright test
    - uses: actions/upload-artifact@v3
      if: always()
      with:
        name: playwright-report
        path: playwright-report/
        retention-days: 30
`;
    }
}
