import type { InferRouterInputs, InferRouterOutputs } from "@orpc/server";
import { pub } from "../orpc.js";
import * as todo from "./todo.js";

export const router = {
  health: pub.handler(() => ({ status: "ok", now: new Date().toISOString() })),
  todo,
};

export type AppRouter = typeof router;
export type AppInputs = InferRouterInputs<AppRouter>;
export type AppOutputs = InferRouterOutputs<AppRouter>;
