function formatDate(keys: string[]) {
  return (obj: any): any => {
    if (typeof obj !== "object" || obj === null) {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => formatDate(keys)(item));
    }

    return Object.keys(obj).reduce((acc: any, key) => {
      if (keys.includes(key)) {
        acc[key] = new Date(obj[key]).toISOString();
      } else {
        acc[key] = formatDate(keys)(obj[key]);
      }
      return acc;
    }, {});
  };
}

export const Dates = {
  format: formatDate,
} as const;

export type Dates = typeof Dates;
