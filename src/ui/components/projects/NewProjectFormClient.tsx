// src/ui/components/projects/NewProjectFormClient.tsx
"use client";

import { useTransition, useState } from "react";
import { Input } from "@/ui/components/form/input";
import { Button } from "@/ui/components/button";

export default function NewProjectFormClient() {
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState("");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    // TODO: call createProject server action
    console.log("draft new project:", { name });
  }

  return (
    <form
      onSubmit={onSubmit}
      className="bg-surface border border-[color:var(--color-border)] rounded-2xl p-6"
    >
      <Input
        name="name"
        label="Project name"
        placeholder="e.g. QMS Implementation"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <div className="mt-6 flex items-center gap-3">
        <Button type="submit" disabled>
          {isPending ? "Creating..." : "Create"} (soon)
        </Button>
        <span className="text-xs text-[color:var(--color-muted-fg)]">
          This will be enabled once actions are ready.
        </span>
      </div>
    </form>
  );
}
