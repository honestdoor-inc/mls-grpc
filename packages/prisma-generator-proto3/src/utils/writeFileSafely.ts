import { formatFile } from "./formatFile";
import fs from "fs";
import path from "path";

export const writeFileSafely = async (writeLocation: string, content: any) => {
  fs.mkdirSync(path.dirname(writeLocation), {
    recursive: true,
  });

  // fs.writeFileSync(writeLocation, await formatFile(content))
  fs.writeFileSync(writeLocation, content);
};
