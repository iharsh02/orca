import { z } from "zod";
import { pub } from "../orpc.js";

const Todo = z.object({
  id: z.string(),
  title: z.string(),
  done: z.boolean(),
});

const todos = new Map<string, z.infer<typeof Todo>>();

export const list = pub.handler(() => Array.from(todos.values()));

export const create = pub
  .input(z.object({ title: z.string().min(1) }))
  .output(Todo)
  .handler(({ input }) => {
    const todo = { id: crypto.randomUUID(), title: input.title, done: false };
    todos.set(todo.id, todo);
    return todo;
  });

export const toggle = pub
  .input(z.object({ id: z.string() }))
  .output(Todo)
  .handler(({ input, errors }) => {
    const todo = todos.get(input.id);
    if (!todo) throw errors.NOT_FOUND();
    todo.done = !todo.done;
    return todo;
  });
