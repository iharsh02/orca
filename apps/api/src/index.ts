import { serve } from "@hono/node-server";
import { RPCHandler } from "@orpc/server/fetch";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { router } from "./router/index.js";

const handler = new RPCHandler(router);

const app = new Hono();

app.use("/rpc/*", cors());

app.use("/rpc/*", async (c, next) => {
  const { matched, response } = await handler.handle(c.req.raw, {
    prefix: "/rpc",
    context: { headers: c.req.raw.headers },
  });

  if (matched) {
    return c.newResponse(response.body, response);
  }

  await next();
});

app.get("/", (c) => c.text("orca api — oRPC mounted at /rpc"));

const port = Number(process.env.PORT ?? 3001);

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`);
});
