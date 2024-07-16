import chalk from 'chalk';
import { runBottles } from './core';
import { parseArgs } from 'node:util';

async function main() {
  try {
    const { values, positionals } = parseArgs({
      options: {
        help: {
          type: 'boolean',
          short: 'h',
          default: false
        },
        verbose: {
          type: 'boolean',
          short: 'v',
          default: false
        }
      },
      allowPositionals: true
    });

    if (values.help) {
      printHelp();
      return;
    }

    const projectPath = positionals[0] || process.cwd();
    await runBottles(projectPath, values.verbose);
  } catch (error) {
    console.error(chalk.red('An error occurred:'), error);
    process.exit(1);
  }
}

function printHelp() {
  console.log(`
Usage: bottles [options] [project_path]

Options:
  -h, --help     Show this help message
  -v, --verbose  Run with verbose logging

If no project path is provided, the current working directory will be used.
  `);
}

main();