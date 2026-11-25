import { Button } from "@repo/ui/components/button";

export default function Page() {
  return (
    <main className="flex min-h-svh p-6">
      <div className="flex max-w-md min-w-0 flex-col gap-4 text-sm leading-loose">
        <div>
          <h1 className="font-medium">Project ready!</h1>
          <p>Add components with shadcn and start building.</p>
          <Button className="mt-2">Button</Button>
        </div>
        <p className="font-mono text-muted-foreground text-xs">
          (Press <kbd>d</kbd> to toggle dark mode)
        </p>
      </div>
    </main>
  );
}
