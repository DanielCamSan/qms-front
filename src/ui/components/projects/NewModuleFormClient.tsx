// src/ui/components/projects/NewModuleFormClient.tsx
"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import type { Module } from "@/lib/model-definitions/module";
import { createModuleAction } from "@/lib/actions";

function Input(props: React.InputHTMLAttributes<HTMLInputElement> & { label?: string }) {
  const { label, ...rest } = props;
  return (
    <label className="block space-y-1">
      {label && <span className="text-sm font-medium">{label}</span>}
      <input
        {...rest}
        className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
      />
    </label>
  );
}

function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string }) {
  const { label, ...rest } = props;
  return (
    <label className="block space-y-1">
      {label && <span className="text-sm font-medium">{label}</span>}
      <textarea
        {...rest}
        className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
      />
    </label>
  );
}

export default function NewModuleFormClient({
  projectId,
  rootModules,
}: {
  projectId: string;
  rootModules: Module[];
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const onSubmit = useCallback(async (formData: FormData) => {
    setError(null);
    setPending(true);
    try {
      const res = await createModuleAction(projectId, formData);
      if (res?.success && res.id) {
        router.replace(`/app/projects/${projectId}/modules/${res.id}`);
      } else {
        setError(res?.error ?? "Failed to create module");
      }
    } finally {
      setPending(false);
    }
  }, [projectId, router]);

  return (
    <form action={onSubmit} className="bg-surface border border-[color:var(--color-border)] rounded-2xl p-6 space-y-4">
      <Input name="name" label="Module name" placeholder="e.g. Checkout" required />

      <Textarea name="description" label="Description" placeholder="Optional…" rows={4} />

      <label className="block space-y-1">
        <span className="text-sm font-medium">Parent Module</span>
        <select
          name="parentModuleId"
          className="w-full rounded-lg border px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary"
          defaultValue=""
        >
          <option value="">(Root)</option>
          {rootModules.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
        <p className="text-xs text-muted-foreground">
          Deja “(Root)” para crear un módulo raíz.
        </p>
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="mt-2 flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg border px-3 py-2 text-sm bg-primary text-primary-foreground disabled:opacity-50"
        >
          {pending ? "Creating..." : "Create module"}
        </button>
      </div>
    </form>
  );
}
