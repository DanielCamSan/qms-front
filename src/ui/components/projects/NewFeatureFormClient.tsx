// src/ui/components/projects/NewFeatureFormClient.tsx
"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import type { Module } from "@/lib/model-definitions/module";
import { FeaturePriority, FeatureStatus } from "@/lib/definitions";
import { createFeatureAction } from "@/lib/actions";

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

export default function NewFeatureFormClient({
  projectId,
  modules,
}: {
  projectId: string;
  modules: Module[];
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = useCallback(async (formData: FormData) => {
    setError(null);
    setPending(true);
    try {
      const res = await createFeatureAction(projectId, formData);
      if (res?.success && res.id) {
        // lleva al detalle de la feature recién creada
        router.replace(`/app/projects/${projectId}/features/${res.id}`);
      } else {
        setError(res?.error ?? "Failed to create feature");
      }
    } finally {
      setPending(false);
    }
  }, [projectId, router]);

  return (
    <form action={onSubmit} className="bg-surface border border-[color:var(--color-border)] rounded-2xl p-6 space-y-4">
      <Input name="name" label="Feature name" placeholder="e.g. 3DS v2" required />
      <Textarea name="description" label="Description" placeholder="Optional…" rows={4} />

      {/* Module selector */}
      <label className="block space-y-1">
        <span className="text-sm font-medium">Module</span>
        <select
          name="moduleId"
          className="w-full rounded-lg border px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary"
          defaultValue=""
          required
        >
          <option value="" disabled>
            Select a module…
          </option>
          {modules.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
      </label>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="block space-y-1">
          <span className="text-sm font-medium">Status</span>
          <select
            name="status"
            className="w-full rounded-lg border px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary"
            defaultValue={FeatureStatus.PENDING}
          >
            <option value={FeatureStatus.PENDING}>PENDING</option>
            <option value={FeatureStatus.IN_PROGRESS}>IN_PROGRESS</option>
            <option value={FeatureStatus.DONE}>DONE</option>
          </select>
        </label>

        <label className="block space-y-1">
          <span className="text-sm font-medium">Priority</span>
          <select
            name="priority"
            className="w-full rounded-lg border px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary"
            defaultValue={FeaturePriority.MEDIUM}
          >
            <option value={FeaturePriority.LOW}>LOW</option>
            <option value={FeaturePriority.MEDIUM}>MEDIUM</option>
            <option value={FeaturePriority.HIGH}>HIGH</option>
          </select>
        </label>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="mt-2 flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg border px-3 py-2 text-sm bg-primary text-primary-foreground disabled:opacity-50"
        >
          {pending ? "Creating..." : "Create feature"}
        </button>
      </div>
    </form>
  );
}
