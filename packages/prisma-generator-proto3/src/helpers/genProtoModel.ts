import { DMMF } from "@prisma/generator-helper";
import { parseDoc } from "./parseOptions";

export const genProtoModel = ({ name, fields }: DMMF.Model) => {
  const protoFields = fields.map(genField).filter(Boolean).join("\n");

  return `message ${name} { \n${protoFields}\n}`;
};

export function genField(field: DMMF.Field, i: number) {
  const { name, kind, type, isList, isRequired, isId, documentation } = field;

  const options = parseDoc(documentation);

  if (options?.ignore) return;

  const els = [];

  if (isId) return;

  if (!isRequired && !isList) {
    els.push("optional");
  }

  if (isList) {
    els.push("repeated");
  }

  if (type === "String") {
    els.push("string");
  } else if (type === "Int") {
    els.push("int32");
  } else if (type === "Float") {
    els.push("float");
  } else if (type === "Boolean") {
    els.push("bool");
  } else if (type === "DateTime") {
    els.push("string");
  } else if (kind === "enum") {
    els.push(type);
  } else {
    els.push(type);
  }

  return `  ${els.join(" ")} ${name} = ${i};`;
}
