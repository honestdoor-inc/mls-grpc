// import { formatFile } from './formatFile'
import fs from "fs-extra";
import path from "path";

export async function writeFileSafely(writeLocation: string, content: any) {
  fs.mkdirSync(path.dirname(writeLocation), {
    recursive: true,
  });

  // fs.writeFileSync(writeLocation, await formatFile(content))
  fs.writeFileSync(writeLocation, content);
}

export async function appendFileSafely(writeLocation: string, content: string) {
  fs.mkdirSync(path.dirname(writeLocation), {
    recursive: true,
  });

  fs.appendFileSync(writeLocation, `${content}\n\n`);
}
