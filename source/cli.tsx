import React from 'react';
import {render} from 'ink';
// import meow from 'meow';
import App from './app';
import {getFilesWithBComments} from './fs.ts';
import {updateFile} from './llm.ts';
import chalk from 'chalk';

// Example usage
async function main() {
  const projectPath = process.cwd();
  try {
    const filesWithBComments = await getFilesWithBComments(projectPath);

    console.log('\nFiles with @b comments:');
    for (const file of filesWithBComments) {
      console.log(chalk.green(file));
			await updateFile(file);
    }
  } catch (error) {
    console.error('An error occurred:', error);
  }
}

main();

