import * as fs from 'fs/promises';
import { Anthropic } from '@anthropic-ai/sdk';

const SYSTEM_PROMPT = `
You are an expert in Web development, including CSS, JavaScript, React, Tailwind, Node.JS and Hugo / Markdown. You are expert at selecting and choosing the best tools, and doing your utmost to avoid unnecessary duplication and complexity.

You will be given a file with @b comments your task is to follow the instructions in the @b comments and update the file.

Respond with the entire file contents do not abbreviate or summarize the file make sure to remove the @b comments

put the file in a <file> tag at the end of the response
`;



const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

if (!ANTHROPIC_API_KEY) {
  throw new Error('ANTHROPIC_API_KEY environment variable is not set');
}

const client = new Anthropic({
  apiKey: ANTHROPIC_API_KEY,
});

export async function updateFile(filePath: string): Promise<void> {
  try {
    // Read the file contents
    const fileContents = await fs.readFile(filePath, 'utf-8');
		console.log(fileContents);

    // Make the API call
    const message = await client.messages.create({
      model: "claude-3-5-sonnet-20240620",
      max_tokens: 4096,
      temperature: 0,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: fileContents
            }
          ]
        }
      ]
    });

		console.debug(message.content[0].text);

    // Extract the updated file contents from the response
    const updatedContents = extractFileContents(message.content[0].text);

    // Write the updated contents back to the file
    await fs.writeFile(filePath, updatedContents, 'utf-8');

    console.log(`File ${filePath} has been updated successfully.`);
  } catch (error) {
    console.error(`Error updating file ${filePath}:`, error);
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

