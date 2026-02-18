
import { TestRunner } from './test-runner';

export class RunManager {
    private static instance: RunManager;
    private activeRunners: Map<string, TestRunner> = new Map();

    private constructor() {}

    public static getInstance(): RunManager {
        if (!RunManager.instance) {
            RunManager.instance = new RunManager();
        }
        return RunManager.instance;
    }

    public register(runId: string, runner: TestRunner) {
        this.activeRunners.set(runId, runner);
    }

    public unregister(runId: string) {
        this.activeRunners.delete(runId);
    }

    public async stop(runId: string) {
        const runner = this.activeRunners.get(runId);
        if (runner) {
            await runner.abort();
            this.activeRunners.delete(runId);
            return true;
        }
        return false;
    }

    public async stopAll() {
        const promises = Array.from(this.activeRunners.values()).map(r => r.abort());
        await Promise.all(promises);
        this.activeRunners.clear();
    }
}

export const runManager = RunManager.getInstance();
