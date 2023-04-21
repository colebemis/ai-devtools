import { types } from "@babel/core";
import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import fs from "fs";
import { z } from "zod";

const PORT = 1234;

const app = express();

app.use(cors({ maxAge: 600 }));
app.use(bodyParser.json());

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

app.post("/", (req, res) => {
  const { filename, location } = bodySchema.parse(req.body);
  const code = getTextInRange(filename, location as types.SourceLocation);
  console.log(code);
  res.send("OK");
});

// TODO: Don't hardcode port number
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
