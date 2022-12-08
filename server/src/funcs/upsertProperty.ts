import { SUC, SUD } from "../types";
import { UpsertPropertyRequest, UpsertPropertyResponse } from "@honestdoor/proto-ts";

// import { zod } from "database";

export async function upsertProperty(
  call: SUC<UpsertPropertyRequest>,
  callback: SUD<UpsertPropertyResponse>
) {
  const request = call.request;

  const response = new UpsertPropertyResponse();

  console.log(request.toObject());

  // const parsed = zod.propertySchema.safeParse();

  // response.setData(parsed);

  return callback(null, response);
}
