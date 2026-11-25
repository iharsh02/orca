import { os } from "@orpc/server";

export interface Context {
  headers: Headers;
}

export const pub = os.$context<Context>().errors({
  NOT_FOUND: {},
  UNAUTHORIZED: {},
});
