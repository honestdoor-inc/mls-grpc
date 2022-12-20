import { Dates, Keys } from "@hd/utils";

import { Context } from ".";
import { OrgResoMetadataProperty } from "@hd/reso-client";
import { pipe } from "fp-ts/lib/function";

export function transformer(_ctx: Context, data: OrgResoMetadataProperty) {
  return pipe(
    data,
    Keys.replace("VIVA_", ""),
    Keys.camelCase,
    Keys.sort,
    Dates.format([
      "listingContractDate",
      "leaseExpiration",
      "originalEntryTimestamp",
      "photosChangeTimestamp",
      "statusChangeTimestamp",
      "modificationTimestamp",
    ])
  );
}
