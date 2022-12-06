import { ServerUnaryCall, sendUnaryData } from "grpc";

export type SUC<T> = ServerUnaryCall<T>;
export type SUD<T> = sendUnaryData<T>;
