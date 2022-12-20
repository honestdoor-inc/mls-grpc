import fs from "fs";
import path from "path";
import xml2js from "xml2js";

function loadXML(filename: string): string {
  return fs.readFileSync(path.join(__dirname, filename)).toString();
}

interface RetsXMLParsed {
  RETS: {
    DELIMITER: [{ $: { value: "09" } }];
    COLUMNS: [string];
    DATA: string[];
  };
}

async function main() {
  const xml = loadXML("../.data/test.xml");

  const json = (await xml2js.parseStringPromise(xml).then((json) => json)) as RetsXMLParsed;

  const parsed = json.RETS.DATA.map((row) => {
    const columns = json.RETS.COLUMNS[0].split("\t");
    const values = row.split("\t");

    return columns.reduce((acc, column, index) => {
      acc[column] = values[index];
      return acc;
    }, {} as Record<string, string>);
  });

  console.dir(parsed, { depth: null });
}

main();
