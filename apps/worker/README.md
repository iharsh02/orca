# worker

Long-running jobs: creating databases, deploying, connecting domains, agent
runs.

Empty for now. No job runner is installed and there is no source code yet, so
this package has no scripts. When you add code under `src/`, add `build`
(`tsc`) and `check-types` (`tsc --noEmit`) scripts back to `package.json`.

## Picking a runner

Copy `.env.example` to `.env` and fill in the block for the runner you pick.
The snippets below are starting points. Check them against the provider's
current docs before using them.

### Trigger.dev (managed, nothing to host)

```
pnpm --filter worker add @trigger.dev/sdk
pnpm --filter worker add -D trigger.dev
pnpm --filter worker exec trigger init
```

```ts
import { task } from "@trigger.dev/sdk";

export const deploy = task({
  id: "deploy",
  run: async (payload: { projectId: string }) => {},
});
```

Docs: https://trigger.dev/docs/manual-setup

### Inngest (managed, served over HTTP)

```
pnpm --filter worker add inngest
```

```ts
import { Inngest } from "inngest";

export const inngest = new Inngest({ id: "orca" });

export const deploy = inngest.createFunction(
  { id: "deploy" },
  { event: "orca/deploy" },
  async ({ event }) => {},
);
```

Inngest calls your functions over HTTP, so mount its `serve()` handler in a
Hono app (here, or in `apps/api`). Docs: https://www.inngest.com/docs

### BullMQ + Redis (self-hosted, e.g. Upstash)

```
pnpm --filter worker add bullmq ioredis
```

```ts
import { Worker } from "bullmq";
import { Redis } from "ioredis";

const connection = new Redis(process.env.REDIS_URL ?? "", {
  maxRetriesPerRequest: null,
});

new Worker(
  "orca",
  async (job) => {
    if (job.name === "deploy") {
    }
  },
  { connection },
);
```

This needs a long-running process, so add `dev`/`start` scripts for it.
Producers (e.g. `apps/api`) enqueue with `new Queue("orca", { connection })`.
Docs: https://docs.bullmq.io
