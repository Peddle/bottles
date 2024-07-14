import * as fs from 'fs/promises';
import { Anthropic } from '@anthropic-ai/sdk';
import chalk from 'chalk';
import boxen from 'boxen';

const SYSTEM_PROMPT = `
You are an expert in Web development, including CSS, JavaScript, React, Tailwind, Node.JS and Hugo / Markdown. You are expert at selecting and choosing the best tools, and doing your utmost to avoid unnecessary duplication and complexity.

You will be given a file with its name and contents. Your task is to follow the instructions in the @b comments and update the file.

Respond with the entire file contents. Do not abbreviate or summarize the file. Make sure to remove the @b comments.

Put the file in a <file> tag at the end of the response.
`;

const PLANNING_PROMPT = `
You are an expert in Web development planning. Your task is to create a detailed plan for updating multiple files based on the given file names, contents, and instructions.

Instructions are provided in the @b comments.

Provide a step-by-step plan that outlines the changes to be made for each file, including:
1. What parts of the file need to be modified
2. What new code or content needs to be added
3. Any potential challenges or considerations
`;

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

if (!ANTHROPIC_API_KEY) {
  throw new Error('ANTHROPIC_API_KEY environment variable is not set');
}

const client = new Anthropic({
  apiKey: ANTHROPIC_API_KEY,
});

interface FileUpdate {
  filePath: string;
  contents: string;
}

interface PlanningResult {
  filePath: string;
  plan: string;
}

export async function updateFiles(fileUpdates: FileUpdate[]): Promise<void> {
  try {
    console.log(chalk.blue('Starting file update process...'));

    // Step 1: Plan the file updates
    const plan = await planFileUpdates(fileUpdates);
		console.log(chalk.blue(boxen(`Plan:\n${plan}`, { padding: 1, borderColor: 'blue' })));

    // Step 2: Execute the file updates
    const conversationHistory: any[] = [];
    for (let i = 0; i < fileUpdates.length; i++) {
      const fileUpdate = fileUpdates[i];

      try {
        const updatedContents = await executeFileUpdate(fileUpdate.filePath, fileUpdate.contents, plan, conversationHistory);
        await writeFileContents(fileUpdate.filePath, updatedContents);
        console.log(chalk.green(`File ${fileUpdate.filePath} has been updated successfully.`));
      } catch (error) {
        console.error(chalk.red(`Error updating file ${fileUpdate.filePath}:`), error);
      }
    }

    console.log(chalk.blue('File update process completed.'));
  } catch (error) {
    console.error(chalk.red('Error in updateFiles:'), error);
    throw error;
  }
}

async function planFileUpdates(fileUpdates: FileUpdate[]): Promise<string> {
  const planningMessage = await client.messages.create({
    model: "claude-3-5-sonnet-20240620",
    max_tokens: 4096,
    temperature: 0,
    system: PLANNING_PROMPT,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: fileUpdates.map(fu => `File name: ${fu.filePath}\n\nFile contents:\n${fu.contents}`).join('\n\n')
          }
        ]
      }
    ]
  });

  return planningMessage.content[0].text;
}

async function executeFileUpdate(filePath: string, fileContents: string, plan: string, conversationHistory: any[]): Promise<string> {
  const executionMessage = await client.messages.create({
    model: "claude-3-5-sonnet-20240620",
    max_tokens: 4096,
    temperature: 0,
    system: SYSTEM_PROMPT,
    messages: [
      ...conversationHistory,
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `File name: ${filePath}\n\nFile contents:\n${fileContents}\n\nUpdate plan:\n${plan}`
          }
        ]
      }
    ]
  });

  return extractFileContents(executionMessage.content[0].text);
}

export async function readFileContents(filePath: string): Promise<string> {
  try {
    return await fs.readFile(filePath, 'utf-8');
  } catch (error) {
    console.error(chalk.red(`Error reading file ${filePath}:`), error);
    throw error;
  }
}

async function writeFileContents(filePath: string, contents: string): Promise<void> {
  try {
    await fs.writeFile(filePath, contents, 'utf-8');
  } catch (error) {
    console.error(chalk.red(`Error writing file ${filePath}:`), error);
    throw error;
  }
}

function extractFileContents(responseContent: string): string {
  const fileTagRegex = /<file>([\s\S]*?)<\/file>/;
  const match = responseContent.match(fileTagRegex);
  if (match && match[1]) {
    return match[1].trim();
  }
  throw new Error('Unable to extract file contents from the API response');
}
