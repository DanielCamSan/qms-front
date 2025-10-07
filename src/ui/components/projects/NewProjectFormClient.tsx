// src/ui/components/projects/NewProjectFormClient.tsx
"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useFormStatus } from "react-dom";

import { ProjectStatus, Visibility } from "@/lib/definitions";
import { createProjectAction } from "@/lib/actions";

// Opcional: reemplaza por tus componentes si ya los tienes
function Input(props: React.InputHTMLAttributes<HTMLInputElement> & { label?: string }) {
  const { label, ...rest } = props;
  return (
    <label className="block space-y-1">
      {label && <span className="text-sm font-medium">{label}</span>}
      <input
        {...rest}
        className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary ${props.className ?? ""}`}
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
        className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary ${props.className ?? ""}`}
      />
    </label>
  );
}
function Select(props: React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string }) {
  const { label, children, ...rest } = props;
  return (
    <label className="block space-y-1">
      {label && <span className="text-sm font-medium">{label}</span>}
      <select
        {...rest}
        className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white"
      >
        {children}
      </select>
    </label>
  );
}
function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg border px-3 py-2 text-sm bg-primary text-primary-foreground disabled:opacity-50"
    >
      {pending ? "Creating..." : "Create"}
    </button>
  );
}

export default function NewProjectFormClient() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  // Envolvemos la server action para poder redirigir según el resultado
  const onSubmitAction = useCallback(async (formData: FormData) => {
    setError(null);
    const res = await createProjectAction(formData);
    if (res?.success && res.id) {
      router.replace(`/app/projects/${res.id}`);
    } else {
      setError(res?.error ?? "Something went wrong creating the project.");
    }
  }, [router]);

  return (
    <form
      action={onSubmitAction}
      className="bg-surface border border-[color:var(--color-border)] rounded-2xl p-6 space-y-4"
    >
      <Input
        name="name"
        label="Project name"
        placeholder="e.g. QMS Implementation"
        required
      />

      <Textarea
        name="description"
        label="Description"
        placeholder="Optional description…"
        rows={4}
      />

      <Input
        name="repositoryUrl"
        label="Repository URL"
        placeholder="https://github.com/org/repo"
        type="url"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select name="status" label="Status" defaultValue={ProjectStatus.ACTIVE}>
          <option value={ProjectStatus.ACTIVE}>ACTIVE</option>
          <option value={ProjectStatus.ON_HOLD}>ON_HOLD</option>
          <option value={ProjectStatus.FINISHED}>FINISHED</option>
        </Select>

        <Select name="visibility" label="Visibility" defaultValue={Visibility.PRIVATE}>
          <option value={Visibility.PRIVATE}>PRIVATE</option>
          <option value={Visibility.PUBLIC}>PUBLIC</option>
        </Select>
      </div>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      <div className="mt-2 flex items-center gap-3">
        <SubmitButton />
        <span className="text-xs text-[color:var(--color-muted-fg)]">
          You can edit details later.
        </span>
      </div>
    </form>
  );
}
