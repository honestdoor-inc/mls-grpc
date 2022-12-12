import { CollectionOfProperty, OrgResoMetadataProperty, filterBuilder } from "reso-client";
import { PropertyApi, replicationInterceptor } from "reso-client";

import Axios from "axios";
import { Context } from "./";

const { VREB_ENDPOINT, VREB_ACCESS_TOKEN } = process.env;

const axiosInstance = Axios.create({
  headers: {
    authorization: `Bearer ${VREB_ACCESS_TOKEN}`,
  },
});

axiosInstance.interceptors.request.use(replicationInterceptor);

const propertyApi = new PropertyApi(undefined, VREB_ENDPOINT, axiosInstance);

export async function fetcher(
  ctx: Context
): Promise<{ ctx: Context; data: OrgResoMetadataProperty[] | null }> {
  const filter = filterBuilder().query("StandardStatus", "eq", "Active").build();

  if (!ctx.nextLink) {
    const res = await propertyApi.propertyGet({
      $top: ctx.batchSize,
      $filter: filter,
    });

    ctx.nextLink = res?.data?.["@odata.nextLink"] || null;

    return {
      ctx,
      data: res?.data?.value || [],
    };
  }

  const nextLink = ctx.nextLink;

  if (nextLink) {
    const res = await axiosInstance.get<CollectionOfProperty>(nextLink);

    ctx.nextLink = res?.data?.["@odata.nextLink"] || null;

    return {
      ctx,
      data: res?.data?.value || [],
    };
  }

  return {
    ctx,
    data: [],
  };
}
