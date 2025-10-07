// src/app/app/projects/[projectId]/features/new/page.tsx
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";

import { createFeature } from "@/app/app/projects/[projectId]/features/new/actions";
import { fetchProjectModules } from "@/lib/data";
import { handleUnauthorized } from "@/lib/server-auth-helpers";
import { getSession } from "@/lib/session";
import type { Module } from "@/lib/model-definitions/module";
import { RoutesEnum } from "@/lib/utils";
import { FeatureForm } from "@/ui/components/projects/FeatureForm.client";

type Params = { projectId: string };
type SearchParams = { moduleId?: string };

export default async function NewFeaturePage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams?: SearchParams;
}) {
  const session = await getSession();
  if (!session?.token) redirect(RoutesEnum.LOGIN);

  const { projectId } = params;
  const preselectedModule = searchParams?.moduleId;
  const t = await getTranslations("app.projects.feature.new");

  let res: Awaited<
    ReturnType<typeof fetchProjectModules>
  >;
  try {
    res = await fetchProjectModules(session.token, projectId, {
      limit: 500,
      sort: "-updatedAt",
    });
  } catch (error) {
    await handleUnauthorized(error);
    if (error instanceof Response && error.status === 403) {
      redirect(RoutesEnum.ERROR_UNAUTHORIZED);
    }
    throw error;
  }

  const modules: Module[] = res.items ?? [];

  return (
    <div className="p-6 md:p-10 max-w-2xl">
      <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-6">
        {t("title")}
      </h1>
      <FeatureForm
        mode="create"
        action={createFeature.bind(null, projectId)}
        modules={modules.map((module) => ({
          id: module.id,
          name: module.name,
          path: module.path,
        }))}
        defaultValues={{ moduleId: preselectedModule }}
      />
    </div>
  );
}
