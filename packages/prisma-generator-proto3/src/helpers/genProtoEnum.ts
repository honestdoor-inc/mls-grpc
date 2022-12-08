import { DMMF } from "@prisma/generator-helper";

export const genProtoEnum = ({ name, values }: DMMF.DatamodelEnum) => {
  const enumValues = values.map(({ name }, i) => `  ${name} = ${i};`).join("\n");

  return `enum ${name} { \n${enumValues}\n}`;
};
