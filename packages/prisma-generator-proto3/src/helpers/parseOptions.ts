export interface ProtoOptions {
  ignore?: boolean;
}

// @TODO - add options validation using zod
export function parseDoc(doc: string | undefined): ProtoOptions | undefined {
  if (!doc) return;

  const match = doc.match(/@proto3\((.*)\)/);

  if (!match) return;

  const options = match[1];

  try {
    return JSON.parse(options);
  } catch (e) {
    console.error("Error parsing proto options", e);
  }
}
