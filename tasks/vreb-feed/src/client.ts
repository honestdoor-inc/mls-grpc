import { PropertyApi, replicationInterceptor } from "reso-client";

import Axios from "axios";

const { VREB_ENDPOINT, VREB_ACCESS_TOKEN } = process.env;

const axiosInstance = Axios.create({
  headers: {
    authorization: `Bearer ${VREB_ACCESS_TOKEN}`,
  },
});

axiosInstance.interceptors.request.use(replicationInterceptor);

const propertyApi = new PropertyApi(undefined, VREB_ENDPOINT, axiosInstance);

export { propertyApi };
