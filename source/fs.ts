import * as fs from 'fs/promises';
import * as path from 'path';
import ignore from 'ignore';

async function scanProject(projectPath: string): Promise<string[]> {
  const gitignorePath = path.join(projectPath, '.gitignore');
  let ig: ReturnType<typeof ignore>;

  try {
    const gitignoreContent = await fs.readFile(gitignorePath, 'utf-8');
    ig = ignore().add(gitignoreContent);
  } catch (error) {
    console.warn('No .gitignore file found. Scanning all files.');
    ig = ignore();
  }

  async function scanDirectory(dirPath: string): Promise<string[]> {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    const files: string[] = [];

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      const relativePath = path.relative(projectPath, fullPath);

      if (ig.ignores(relativePath)) {
        continue;
      }

      if (entry.isDirectory()) {
        files.push(...(await scanDirectory(fullPath)));
      } else {
        files.push(fullPath);
      }
    }

    return files;
  }

  return scanDirectory(projectPath);
}

async function scanFile(filePath: string): Promise<boolean> {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const lines = content.split('\n');

    for (const line of lines) {
      if (line.trim().startsWith('//@b') || line.trim().startsWith('// @b')) {
        return true;
      }
    }

    return false;
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return false;
  }
}

export async function getFilesWithBComments(projectPath: string): Promise<string[]> {
  const allFiles = await scanProject(projectPath);
  const filesWithBComments: string[] = [];

  for (const file of allFiles) {
    const hasBComment = await scanFile(file);
    if (hasBComment) {
      filesWithBComments.push(file);
    }
  }

  return filesWithBComments;
}

