# api

Hono server exposing an [oRPC](https://orpc.unnoq.com) RPC API.

## Develop

From the repo root:

```
pnpm --filter api dev      # tsx watch, http://localhost:3001 (override with PORT)
pnpm --filter api build    # tsc -> dist/
pnpm --filter api start    # run the compiled server
```

## Layout

- `src/orpc.ts` — base procedure builder (`pub`), request context, shared error map.
- `src/router/` — procedures grouped by domain; `router/index.ts` is the root router.
- `src/index.ts` — Hono app; mounts the oRPC `RPCHandler` at `/rpc/*` with CORS.

Procedures are called over HTTP POST, e.g. `POST /rpc/todo/create` with body
`{"json":{"title":"..."}}`.

## Type-safe client

The root router type is exported for consumers (e.g. the `web` app):

```ts
import type { AppRouter } from "api/router";
import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";

const link = new RPCLink({ url: "http://localhost:3001/rpc" });
const client: RouterClient<AppRouter> = createORPCClient(link);

await client.todo.create({ title: "ship orpc" }); // fully typed
```
