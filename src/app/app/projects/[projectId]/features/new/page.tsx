// src/app/app/projects/[projectId]/features/new/page.tsx
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { RoutesEnum } from "@/lib/utils";
import { fetchProjectModules } from "@/lib/data";
import type { Module } from "@/lib/model-definitions/module";
import NewFeatureFormClient from "@/ui/components/projects/NewFeatureFormClient";

type Params = { projectId: string };

export default async function NewFeaturePage({ params }: { params: Params }) {
  const session = await getSession();
  if (!session?.token) redirect(RoutesEnum.LOGIN);

  const { projectId } = params;

  // Trae módulos del proyecto (sin parent => todos; ajusta limit según escala)
  const res = await fetchProjectModules(session.token, projectId, {
    // parent omitido => todos
    limit: 200,
    sort: "sortOrder",
  });
  const modules: Module[] = Array.isArray(res) ? res : res.items ?? [];

  return (
    <div className="p-6 md:p-10 max-w-2xl">
      <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-6">
        New Feature
      </h1>
      <NewFeatureFormClient projectId={projectId} modules={modules} />
    </div>
  );
}
