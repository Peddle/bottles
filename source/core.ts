import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import chalk from 'chalk';
@b i dont want to use simple git i already have my own minimal git implementation
import { simpleGit, SimpleGit, SimpleGitOptions } from 'simple-git';

interface FileWithComments {
  filePath: string;
  comments: string[];
}

interface UpdatePlan {
  filePath: string;
  instructions: string[];
}

export async function runBottles(directory: string): Promise<void> {
  try {
    const filesWithComments = await getFilesWithComments(directory);
    const updatePlans = await planUpdates(filesWithComments);
    await executeUpdates(updatePlans);
  } catch (error) {
    console.error(chalk.red('An error occurred:'), error);
  }
}

async function getFilesWithComments(directory: string): Promise<FileWithComments[]> {
  const files = fs.readdirSync(directory);
  const filesWithComments: FileWithComments[] = [];

  for (const file of files) {
    const filePath = path.join(directory, file);
    const stats = fs.statSync(filePath);

    if (stats.isDirectory()) {
      filesWithComments.push(...await getFilesWithComments(filePath));
    } else if (stats.isFile()) {
      const content = fs.readFileSync(filePath, 'utf-8');
      const lines = content.split('\n');
      const comments = lines.filter(line => line.trim().startsWith('@b')).map(line => line.trim().substring(2).trim());

      if (comments.length > 0) {
        filesWithComments.push({ filePath, comments });
      }
    }
  }

  return filesWithComments;
}

async function planUpdates(filesWithComments: FileWithComments[]): Promise<UpdatePlan[]> {
  const updatePlans: UpdatePlan[] = [];

  for (const file of filesWithComments) {
    updatePlans.push({
      filePath: file.filePath,
      instructions: file.comments
    });
  }

  return updatePlans;
}

async function executeUpdates(updatePlans: UpdatePlan[]): Promise<void> {
  const gitOptions: SimpleGitOptions = {
    baseDir: process.cwd(),
    binary: 'git',
    maxConcurrentProcesses: 6,
  };
  const git: SimpleGit = simpleGit(gitOptions);

  for (const plan of updatePlans) {
    console.log(chalk.blue(`Updating file: ${plan.filePath}`));
    console.log(chalk.yellow('Instructions:'));
    plan.instructions.forEach(instruction => console.log(chalk.yellow(`- ${instruction}`)));

    // Here you would implement the logic to update the file based on the instructions
    // For now, we'll just log a placeholder message
    console.log(chalk.green('File updated successfully (placeholder)'));

    // Stage the changes
    await git.add(plan.filePath);

    // Commit the changes
    const commitMessage = `Updated ${path.basename(plan.filePath)} based on @b comments`;
    await git.commit(commitMessage);

    console.log(chalk.green(`Changes committed: ${commitMessage}`));
  }

  console.log(chalk.green('All updates completed and committed.'));
}

export function getGitRootDirectory(): string {
  try {
    return execSync('git rev-parse --show-toplevel', { encoding: 'utf-8' }).trim();
  } catch (error) {
    console.error(chalk.red('Error: Not a git repository or git is not installed.'));
    process.exit(1);
  }
}
