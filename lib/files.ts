
import fs from 'fs/promises';
import path from 'path';

const TESTS_DIR = path.join(process.cwd(), '../tests');

export interface FileItem {
  name: string;
  type: 'file' | 'directory';
  path: string;
}

export async function listFiles(dirPath: string = ''): Promise<FileItem[]> {
  const fullPath = path.join(TESTS_DIR, dirPath);
  
  try {
    const stats = await fs.stat(fullPath);
    if (!stats.isDirectory()) {
        throw new Error('Path is not a directory');
    }

    const items = await fs.readdir(fullPath, { withFileTypes: true });
    
    return items.map(item => ({
      name: item.name,
      type: item.isDirectory() ? 'directory' : 'file',
      path: path.join(dirPath, item.name).replace(/\\/g, '/')
    }));
  } catch (error) {
    // If directory doesn't exist, create it
    if ((error as any).code === 'ENOENT' && dirPath === '') {
        await fs.mkdir(TESTS_DIR, { recursive: true });
        return [];
    }
    throw error;
  }
}

export async function saveTestFile(filePath: string, content: any) {
  const fullPath = path.join(TESTS_DIR, filePath);
  await fs.mkdir(path.dirname(fullPath), { recursive: true });
  
  if (typeof content === 'string') {
      await fs.writeFile(fullPath, content);
  } else {
      await fs.writeFile(fullPath, JSON.stringify(content, null, 2));
  }
}

export async function deleteTestFile(filePath: string) {
  const fullPath = path.join(TESTS_DIR, filePath);
  await fs.unlink(fullPath);
}

export async function readTestFile(filePath: string) {
  const fullPath = path.join(TESTS_DIR, filePath);
  const content = await fs.readFile(fullPath, 'utf-8');
  try {
      return JSON.parse(content);
  } catch (e) {
      return { raw: content };
  }
}
export async function getTestsWithTags() {
    const files = await listFiles();
    const result: { [tag: string]: any[] } = {};
    
    for (const file of files) {
        if (file.type === 'file') {
            try {
                const content = await readTestFile(file.path);
                let tags: string[] = [];
                
                if (content.tags && Array.isArray(content.tags)) {
                    tags = content.tags;
                } else if (content.raw) {
                    // Simple regex for @tag in scripts
                    const matches = content.raw.match(/@tag\s+(\w+)/g);
                    if (matches) {
                        tags = matches.map((m: string) => m.replace('@tag ', ''));
                    }
                }
                
                if (tags.length === 0) tags = ['untagged'];
                
                for (const tag of tags) {
                    if (!result[tag]) result[tag] = [];
                    result[tag].push({
                        name: file.name,
                        path: file.path,
                        type: file.name.endsWith('.json') ? 'json' : 'script'
                    });
                }
            } catch (e) {
                console.error(`Error parsing ${file.path}:`, e);
            }
        }
    }
    return result;
}
