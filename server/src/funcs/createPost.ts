import { CreatePostRequest, CreatePostResponse } from "@honestdoor/proto-ts";
import { SUC, SUD } from "../types";

import { PropertyCreateOneSchema } from "database";

export async function createPost(call: SUC<CreatePostRequest>, callback: SUD<CreatePostResponse>) {
  const request = call.request;

  const response = new CreatePostResponse();

  await PropertyCreateOneSchema.parseAsync(request);

  response.setId("1");

  return callback(null, response);
}
