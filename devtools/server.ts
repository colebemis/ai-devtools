import { types } from "@babel/core";
import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import fs from "fs";
import { z } from "zod";
import { Configuration, OpenAIApi } from "openai";
import dotenv from "dotenv";

const app = express();

app.use(cors({ maxAge: 600 }));
app.use(bodyParser.json());

// Load environment variables from .env file
dotenv.config();

// Create an OpenAI API client
const OPENAI_MODEL = "text-davinci-003";

const configuration = new Configuration({
  organization: "org-ZYoPGVTVD0k5w6tAahZnpGe8",
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

const bodySchema = z.object({
  command: z.string(),
  filename: z.string(),
  location: z.object({
    start: z.object({
      line: z.number(),
      column: z.number(),
    }),
    end: z.object({
      line: z.number(),
      column: z.number(),
    }),
  }),
});

app.post("/", async (req, res) => {
  const { command, filename, location } = bodySchema.parse(req.body);

  const code = getTextInRange(filename, location as types.SourceLocation);

  const prompt = `Only respond with code. Don't include an explanation.
  
${code}

${command}`;

  try {
    const { data } = await openai.createCompletion({
      model: OPENAI_MODEL,
      prompt,
      max_tokens: 256,
      temperature: 0.5,
    });

    const { choices } = data;

    if (choices.length == 0) {
      // TODO: Handle no choices
      return;
    }

    const { text } = choices[0];

    if (text) {
      replaceTextInRange(filename, location as types.SourceLocation, text);
    }
  } catch (error) {
    console.error(error);
  }

  res.send("OK");
});

// TODO: Don't hardcode port number
const PORT = 1234;
app.listen(PORT, () => {
  console.log(`Devtools server listening on port ${PORT}`);
});

function getTextInRange(filename: string, location: types.SourceLocation) {
  // Read the contents of the file into an array of lines
  const sourceLines = fs.readFileSync(filename, "utf8").split("\n");

  // Extract the lines that are within the selected range
  const lines = sourceLines.slice(location.start.line - 1, location.end.line);

  // Remove any text before the start column of the first line
  lines[0] = lines[0].slice(location.start.column);

  // Remove any text after the end column of the last line
  lines[lines.length - 1] = lines[lines.length - 1].slice(
    0,
    location.end.column
  );

  // Join the lines back together into a single string
  const text = lines.join("\n");

  return text;
}

function replaceTextInRange(
  filename: string,
  location: types.SourceLocation,
  newText: string
) {
  // Read the contents of the file into an array of lines
  const sourceLines = fs.readFileSync(filename, "utf8").split("\n");

  // Get the start and end lines of the selected range
  const startLine = sourceLines[location.start.line - 1];
  const endLine = sourceLines[location.end.line - 1];

  // Construct the new line by concatenating the text before the start column,
  // the new text, and the text after the end column
  const newLine = `${startLine.slice(
    0,
    location.start.column
  )}${newText}${endLine.slice(location.end.column)}`;

  // Replace the selected lines with the new line
  sourceLines.splice(
    location.start.line - 1,
    location.end.line - location.start.line + 1,
    newLine
  );

  fs.writeFileSync(filename, sourceLines.join("\n"));
}
