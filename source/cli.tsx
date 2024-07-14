import React from 'react';
import {getFilesWithBComments, readFileContents, writeFileContents} from './fs.ts';
import {planFileUpdates, executeFileUpdate} from './llm.ts';
import chalk from 'chalk';

// Main function to orchestrate the file update process
async function main() {
  const projectPath = process.cwd();
  try {
    const files = await getFilesWithComments(projectPath);
    const updatePlan = await planUpdates(files);
    await executeUpdates(files, updatePlan);
    console.log(chalk.green('\nAll files updated successfully.'));
  } catch (error) {
    console.error('An error occurred:', error);
  }
}

// Function to find files with @b comments and read their contents
async function getFilesWithComments(projectPath: string) {
  const filesWithBComments = await getFilesWithBComments(projectPath);
  console.log('\nFiles with @b comments:');
  return Promise.all(filesWithBComments.map(async (file: string) => {
    console.log(chalk.green(file));
    return {
      filePath: file,
      contents: await readFileContents(file)
    }
  }));
}

// Function to plan file updates using the LLM
async function planUpdates(files: any[]) {
  console.log('\nPlanning file updates...');
  return planFileUpdates(files);
}

// Function to execute file updates based on the update plan
async function executeUpdates(files: any[], updatePlan: any) {
  console.log('\nExecuting file updates...');
  const updatePromises = files.map(async (file: any) => {
    try {
      console.log(chalk.blue(`Updating ${file.filePath}...`));
      const updatedContents = await executeFileUpdate(file.filePath, file.contents, updatePlan);
      await writeFileContents(file.filePath, updatedContents);
      console.log(chalk.green(`${file.filePath} updated successfully.`));
    } catch (error) {
      console.error(chalk.red(`Error updating ${file.filePath}:`), error);
    }
  });

  await Promise.all(updatePromises);
  console.log(chalk.green('\nAll file updates completed.'));
}

main();
