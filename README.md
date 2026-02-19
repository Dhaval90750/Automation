# Automation Platform

A powerful, all-in-one automation testing platform built with Next.js, Playwright, and AI.

## Features

- **Universal Language Support**: Run test scripts in **Python**, **JavaScript/TypeScript**, **Ruby**, **Go**, **Bash**, and more. The platform dynamically executes the appropriate runner based on file extensions.
- **Visual Regression Testing**: Pixel-perfect UI comparison using `pixelmatch`. Automatically captures baselines and detects visual differences.
- **AI Copilot**: Generate test steps, Selectors, and code using natural language prompts powered by Google Gemini.
- **Interactive Recorder**: Record browser interactions and convert them into robust Playwright scripts.
- **Web Scraper**: Extract data and generate test scenarios from any URL.
- **Workflow Builder**: Create complex automation workflows with a node-based editor (Testing, Conditions, Loops, Webhooks).
- **Cron Scheduler**: Schedule tests to run automatically at specific intervals.
- **Data-Driven Testing**: Parametrize tests using JSON or CSV data sources.
- **CI/CD Integration**: Generate GitHub Actions workflows for your tests.

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.8+ (for Python tests)
- Playwright Browsers (`npx playwright install`)

### Installation

1.  Clone the repository:

    ```bash
    git clone https://github.com/Dhaval90750/Automation.git
    cd Automation
    ```

2.  Install dependencies:

    ```bash
    npm install
    ```

3.  Set up environment variables:
    Create a `.env.local` file in the root directory:

    ```env
    GEMINI_API_KEY=your_api_key_here
    ```

4.  Run the development server:

    ```bash
    npm run dev
    ```

    Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Running Tests

1.  Navigate to the **Command Center**.
2.  Select a test file from the explorer or create a new one.
3.  Click **Run Test**.
4.  View real-time logs and results in the terminal.

### Visual Regression

To perform a visual check in your test steps (JSON mode or Workflow):

```json
{
  "type": "visual_check",
  "name": "homepage-baseline"
}
```

- **First Run**: Creates a baseline image in `tests/snapshots/baseline`.
- **Subsequent Runs**: Compares against the baseline. Fails if differences are detected.
- **Review**: Check `public/artifacts/diffs` for the diff image.

### Universal Script Execution

The platform automatically detects the language:

- `.py`: Executes with `python -m pytest` or `python`.
- `.js`/`.ts`: Executes with `npx playwright test`.
- `.rb`: Executes with `ruby`.
- `.sh`: Executes with `bash`.
- ...and more!

## Project Structure

- `app/`: Next.js application routes and components.
- `lib/`: Core logic (Test Runner, Visual Tester, Workflow Engine).
- `components/`: Reusable UI components.
- `public/artifacts/`: Test artifacts (screenshots, videos, traces).
- `tests/`: Default directory for test scripts.

## License

MIT
