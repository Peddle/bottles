import { execSync } from 'child_process';

export function getCurrentBranch(): string {
  try {
    return execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
  } catch (error) {
    throw new Error('Failed to get current Git branch');
  }
}

export function hasUncommittedChanges(): boolean {
  try {
    const status = execSync('git status --porcelain', { encoding: 'utf8' });
    return status.length > 0;
  } catch (error) {
    throw new Error('Failed to check for uncommitted changes');
  }
}

export function commitChanges(message: string): void {
  try {
    execSync('git add .', { encoding: 'utf8' });
    execSync(`git commit -m "${message}"`, { encoding: 'utf8' });
  } catch (error) {
    throw new Error('Failed to commit changes');
  }
}

export function getLastCommitDiff(): string {
  try {
    return execSync('git show --color', { encoding: 'utf8' });
  } catch (error) {
    throw new Error('Failed to get diff of the last commit');
  }
}
