import React from 'react';
import {render} from 'ink';
// import meow from 'meow';
import App from './app';
import {getFilesWithBComments} from './fs.ts';
import {updateFiles} from './llm.ts';
import chalk from 'chalk';
import {readFileContents} from './llm';

// Example usage
async function main() {
  const projectPath = process.cwd();
  try {
    const filesWithBComments = await getFilesWithBComments(projectPath);

    console.log('\nFiles with @b comments:');
		const files = await Promise.all(filesWithBComments.map(async (file: string) => {
			console.log(chalk.green(file));
			return {
				filePath: file,
				contents: await readFileContents(file)
			}
		}));
		await updateFiles(files);
   } catch (error) {
    console.error('An error occurred:', error);
  }
}

main();

