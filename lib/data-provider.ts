
import fs from 'fs/promises';
import path from 'path';
import { parse } from 'csv-parse/sync';

export class DataProvider {
    static async loadData(filePath: string): Promise<any[]> {
        const fullPath = path.join(process.cwd(), '../tests', filePath);
        const content = await fs.readFile(fullPath, 'utf-8');
        
        if (filePath.endsWith('.json')) {
            return JSON.parse(content);
        } else if (filePath.endsWith('.csv')) {
            return parse(content, {
                columns: true,
                skip_empty_lines: true
            });
        }
        
        throw new Error('Unsupported file format. Use .json or .csv');
    }
}
