import { AxiosRequestConfig } from "axios";

export * from "./generated";

declare module "./generated" {
  interface CollectionOfProperty {
    "@odata.context": string | null | undefined;
    "@odata.nextLink": string | null | undefined;
  }
}

export function replicationInterceptor(config: AxiosRequestConfig<any>) {
  if (config.url) {
    config.url = appendToURLPath(config.url, "/replication");
  }

  return config;
}

export function appendToURLPath(url: string, path: string) {
  const queryIndex = url.indexOf("?");
  return url.slice(0, queryIndex) + path + url.slice(queryIndex);
}

export interface Filter {
  field: string;
  operator: Operator;
  value: string;
}

export type Operator =
  | "eq"
  | "gt"
  | "lt"
  | "ge"
  | "le"
  | "ne"
  | "in"
  | "not in"
  | "like"
  | "not like";

export class FilterBuilder {
  private andFilters: Filter[];
  private orFilters: Filter[];

  constructor() {
    this.andFilters = [];
    this.orFilters = [];
  }

  public query(field: string, operator: Operator, value: string) {
    this.andFilters.push({
      field,
      operator,
      value,
    });

    return this;
  }

  public and(field: string, operator: Operator, value: string) {
    return this.query(field, operator, value);
  }

  public or(field: string, operator: Operator, value: string) {
    this.orFilters.push({
      field,
      operator,
      value,
    });

    return this;
  }

  public build() {
    const andFilters = this.andFilters.map((filter) => {
      const { field, operator, value } = filter;

      return `${field} ${operator} '${value}'`;
    });

    const orFilters = this.orFilters.map((filter) => {
      const { field, operator, value } = filter;

      return `${field} ${operator} '${value}'`;
    });

    const and = andFilters.join(" and ");
    const or = orFilters.join(" or ");

    if (and && or) {
      return `${and} and (${or})`;
    }

    if (and) {
      return and;
    }

    if (or) {
      return or;
    }

    return "";
  }
}

export function filterBuilder() {
  return new FilterBuilder();
}
