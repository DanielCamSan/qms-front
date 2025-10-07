// src/app/app/projects/[projectId]/modules/new/page.tsx
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { RoutesEnum } from "@/lib/utils";
import { fetchProjectModules } from "@/lib/data";
import type { Module } from "@/lib/model-definitions/module";
import NewModuleFormClient from "@/ui/components/projects/NewModuleFormClient";

type Params = { projectId: string };

export default async function NewModulePage({ params }: { params: Params }) {
  const session = await getSession();
  if (!session?.token) redirect(RoutesEnum.LOGIN);

  const { projectId } = params;

  // Cargar posibles padres (root) — opcional
  const modulesRes = await fetchProjectModules(session.token, projectId, {
    parent: null,
    limit: 100,
    sort: "sortOrder",
  });
  const rootModules: Module[] = Array.isArray(modulesRes)
    ? modulesRes
    : modulesRes.items ?? [];

  return (
    <div className="p-6 md:p-10 max-w-2xl">
      <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-6">
        New Module
      </h1>

      <NewModuleFormClient projectId={projectId} rootModules={rootModules} />
    </div>
  );
}
