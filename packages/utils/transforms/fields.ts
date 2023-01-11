function addField(key: string, value: any) {
  return (obj: any): any => {
    return {
      ...obj,
      [key]: value,
    };
  };
}

export const Fields = {
  add: addField,
} as const;

export type Fields = typeof Fields;
