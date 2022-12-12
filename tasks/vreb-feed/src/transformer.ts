import { Dates, Keys } from "utils";

import { Context } from "./";
import { OrgResoMetadataProperty } from "reso-client";
import { pipe } from "fp-ts/lib/function";

export function transformer(ctx: Context, data: OrgResoMetadataProperty): any {
  return pipe(
    data,
    Keys.replace("VIVA_", ""),
    Keys.camelCase,
    Keys.sort,
    Dates.format(["listingContractDate", "leaseExpiration"])
  );
}
