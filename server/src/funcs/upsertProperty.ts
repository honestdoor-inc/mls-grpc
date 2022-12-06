import { SUC, SUD } from "../types";
import { UpsertPropertyRequest, UpsertPropertyResponse } from "@honestdoor/proto-ts";

import { zod } from "database";

export async function upsertProperty(
  call: SUC<UpsertPropertyRequest>,
  callback: SUD<UpsertPropertyResponse>
) {
  const request = call.request;

  const response = new UpsertPropertyResponse();

  const _parsed = zod.propertySchema.safeParse(request.toObject());

  response.setSuccess(_parsed.success);

  return callback(null, response);
}
