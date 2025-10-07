// src/app/app/projects/[projectId]/modules/[moduleId]/page.tsx
import { redirect, notFound } from "next/navigation";
import { getSession } from "@/lib/session";
import { RoutesEnum } from "@/lib/utils";
import { fetchModuleById } from "@/lib/data";
import type { Module } from "@/lib/model-definitions/module";
import Link from "next/link";

type Params = { projectId: string; moduleId: string };

export default async function ModuleDetailPage({ params }: { params: Params }) {
  const session = await getSession();
  if (!session?.token) redirect(RoutesEnum.LOGIN);

  const { projectId, moduleId } = params;

  let mod: Module | null = null;
  try {
    mod = await fetchModuleById(session.token, moduleId);
  } catch {
    notFound();
  }
  if (!mod) notFound();

  return (
    <div className="grid gap-6">
      <header>
        <h1 className="text-2xl font-bold">{mod.name}</h1>
        <p className="text-sm text-[color:var(--color-muted-fg)]">
          Project: {projectId}
        </p>
      </header>

      <section className="rounded-xl border bg-white p-4">
        <h2 className="font-semibold mb-2">Submodules</h2>
        {mod.childrens?.length ? (
          <ul className="list-disc list-inside">
            {mod.childrens.map((c) => (
              <li key={c.id}>
                <Link href={`/app/projects/${projectId}/modules/${c.id}`} className="hover:underline">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-[color:var(--color-muted-fg)]">No submodules</p>
        )}
      </section>

      <section className="rounded-xl border bg-white p-4">
        <h2 className="font-semibold mb-2">Features</h2>
        {mod.features?.length ? (
          <ul className="list-disc list-inside">
            {mod.features.map((f) => (
              <li key={f.id}>
                <Link href={`/app/projects/${projectId}/features/${f.id}`} className="hover:underline">
                  {f.name}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-[color:var(--color-muted-fg)]">No features</p>
        )}
      </section>
    </div>
  );
}
