import camelCase from "lodash/camelCase";

function mapKeys(fn: (key: string) => string) {
  return (obj: any): any => {
    if (typeof obj !== "object" || obj === null) {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => mapKeys(fn)(item));
    }

    return Object.keys(obj).reduce((acc: any, key) => {
      acc[fn(key)] = mapKeys(fn)(obj[key]);
      return acc;
    }, {});
  };
}

function keysSort(obj: any): any {
  if (typeof obj !== "object" || obj === null) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => keysSort(item));
  }

  return Object.keys(obj)
    .sort()
    .reduce((acc: any, key) => {
      acc[key] = keysSort(obj[key]);
      return acc;
    }, {});
}

function keysReplace(prefix: string, replacement: string) {
  return mapKeys((key) => key.replace(prefix, replacement));
}

export const Keys = {
  sort: keysSort,
  replace: keysReplace,
  camelCase: mapKeys(camelCase),
} as const;

export type Keys = typeof Keys;
