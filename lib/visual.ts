
import fs from 'fs/promises';
import path from 'path';
import { Page } from 'playwright';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';

const SNAPSHOTS_DIR = path.join(process.cwd(), '../tests/snapshots');

export class VisualTester {
    static async compare(page: Page, snapshotName: string): Promise<{ match: boolean; diffPath?: string }> {
        const baselinePath = path.join(SNAPSHOTS_DIR, 'baseline', `${snapshotName}.png`);
        const diffPath = path.join(SNAPSHOTS_DIR, 'diffs', `${snapshotName}.diff.png`);
        const actualPath = path.join(SNAPSHOTS_DIR, 'actual', `${snapshotName}.png`);

        // Ensure directories exist
        await fs.mkdir(path.dirname(baselinePath), { recursive: true });
        await fs.mkdir(path.dirname(diffPath), { recursive: true });
        await fs.mkdir(path.dirname(actualPath), { recursive: true });

        // Capture current screenshot
        const screenshotBuffer = await page.screenshot();
        await fs.writeFile(actualPath, screenshotBuffer);

        // Check if baseline exists
        try {
            await fs.access(baselinePath);
        } catch {
            // If no baseline, save current as baseline and pass
            await fs.writeFile(baselinePath, screenshotBuffer);
            console.log(`[Visual] Created new baseline for ${snapshotName}`);
            return { match: true };
        }

        // Compare
        const baselineBuffer = await fs.readFile(baselinePath);
        const baselinePNG = PNG.sync.read(baselineBuffer);
        const actualPNG = PNG.sync.read(screenshotBuffer);
        
        const { width, height } = baselinePNG;
        const diffPNG = new PNG({ width, height });

        const numDiffPixels = pixelmatch(
            baselinePNG.data, 
            actualPNG.data, 
            diffPNG.data, 
            width, 
            height, 
            { threshold: 0.1 }
        );

        if (numDiffPixels > 0) {
            const diffBuffer = PNG.sync.write(diffPNG);
            await fs.writeFile(diffPath, diffBuffer);
            console.log(`[Visual] Diff detected: ${numDiffPixels} pixels differ.`);
            return { match: false, diffPath };
        }

        return { match: true };
    }
}
