import { Dates, Fields, Keys } from "@hd/utils";

import { Board } from "@hd/db";
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
    ]),
    Fields.add("board", Board.VIVA),
    (data) => ({
      ...data,
      media: data.media?.map((media: any) => ({
        ...media,
        order: Number(media.order),
      })),
    })
  );
}
