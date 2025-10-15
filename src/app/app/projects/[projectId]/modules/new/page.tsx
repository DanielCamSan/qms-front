// src/app/app/projects/[projectId]/modules/new/page.tsx
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";

import { createModule } from "@/app/app/projects/[projectId]/modules/new/actions";
import { fetchProjectModules } from "@/lib/data";
import { handleUnauthorized } from "@/lib/server-auth-helpers";
import { getSession } from "@/lib/session";
import type { Module } from "@/lib/model-definitions/module";
import { RoutesEnum } from "@/lib/utils";
import { ModuleForm } from "@/ui/components/projects/ModuleForm.client";

type Params = { projectId: string };
type SearchParams = { parent?: string };

export default async function NewModulePage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams?: SearchParams;
}) {
  const session = await getSession();
  if (!session?.token) redirect(RoutesEnum.LOGIN);

  const { projectId } = await params;
  const preselectedParent = (await searchParams)?.parent;
  const t = await getTranslations("app.projects.module.new");

  let modulesRes: Awaited<
    ReturnType<typeof fetchProjectModules>
  >;
  try {
    modulesRes = await fetchProjectModules(session.token, projectId, {
      parent: null,
      limit: 100,
      sort: "sortOrder",
    });
  } catch (error) {
    await handleUnauthorized(error);
    if (error instanceof Response && error.status === 403) {
      redirect(RoutesEnum.ERROR_UNAUTHORIZED);
    }
    throw error;
  }

  const rootModules: Module[] = modulesRes.items ?? [];

  return (
    <div className="p-6 md:p-10 max-w-2xl">
      <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-6">
        {t("title")}
      </h1>

      <ModuleForm
        mode="create"
        action={createModule.bind(null, projectId)}
        parentOptions={rootModules.map((module) => ({
          id: module.id,
          name: module.name,
          path: module.path,
        }))}
        defaultValues={{ parentModuleId: preselectedParent ?? null }}
      />
    </div>
  );
}
