import { getTranslations } from "next-intl/server";
import { notFound, redirect } from "next/navigation";

import {
  deleteModule,
  updateModule,
} from "@/app/app/projects/[projectId]/modules/[moduleId]/edit/actions";
import { fetchModuleById, fetchProjectModules } from "@/lib/data";
import { handleUnauthorized } from "@/lib/server-auth-helpers";
import { getSession } from "@/lib/session";
import type { Module } from "@/lib/model-definitions/module";
import { RoutesEnum } from "@/lib/utils";
import { ModuleForm } from "@/ui/components/projects/ModuleForm.client";

type Params = { projectId: string; moduleId: string };

export default async function EditModulePage({
  params,
}: {
  params: Params;
}) {
  const session = await getSession();
  if (!session?.token) redirect(RoutesEnum.LOGIN);

  const t = await getTranslations("app.projects.module.edit");
  const { projectId, moduleId } = params;

  let currentModule: Module | null = null;
  try {
    currentModule = await fetchModuleById(session.token, moduleId);
  } catch (error) {
    await handleUnauthorized(error);
    if (error instanceof Response) {
      if (error.status === 404) notFound();
      if (error.status === 403) redirect(RoutesEnum.ERROR_UNAUTHORIZED);
    }
    throw error;
  }
  if (!currentModule) notFound();

  let modulesRes: Awaited<
    ReturnType<typeof fetchProjectModules>
  >;
  try {
    modulesRes = await fetchProjectModules(session.token, projectId, {
      limit: 500,
    });
  } catch (error) {
    await handleUnauthorized(error);
    if (error instanceof Response && error.status === 403) {
      redirect(RoutesEnum.ERROR_UNAUTHORIZED);
    }
    throw error;
  }

  const moduleOptions: Module[] = modulesRes.items ?? [];

  return (
    <div className="max-w-3xl space-y-6 p-6 md:p-10">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold md:text-3xl">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">
          {t("subtitle", { name: currentModule.name })}
        </p>
      </header>

      <ModuleForm
        mode="edit"
        action={updateModule.bind(null, projectId, moduleId)}
        defaultValues={{
          name: currentModule.name,
          description: currentModule.description,
          parentModuleId: currentModule.parentModuleId,
        }}
        parentOptions={moduleOptions.map((item) => ({
          id: item.id,
          name: item.name,
          path: item.path,
        }))}
        disabledOptionId={currentModule.id}
      />

      <form
        action={deleteModule.bind(null, projectId, moduleId)}
        className="rounded-2xl border border-destructive/50 bg-destructive/5 p-4"
      >
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-sm font-semibold text-destructive">
              {t("dangerZone.title")}
            </h2>
            <p className="text-xs text-muted-foreground">
              {t("dangerZone.description")}
            </p>
          </div>
          <button
            type="submit"
            className="inline-flex items-center rounded-lg border border-destructive bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground transition-colors"
          >
            {t("dangerZone.delete")}
          </button>
        </div>
      </form>
    </div>
  );
}
