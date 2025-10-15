import { getTranslations } from "next-intl/server";
import { notFound, redirect } from "next/navigation";

import {
  deleteFeature,
  updateFeature,
} from "@/app/app/projects/[projectId]/features/[featureId]/edit/actions";
import { fetchFeatureById, fetchProjectModules } from "@/lib/data";

import { getSession } from "@/lib/session";
import type { Feature } from "@/lib/model-definitions/feature";
import type { Module } from "@/lib/model-definitions/module";
import { RoutesEnum } from "@/lib/utils";
import { FeatureForm } from "@/ui/components/projects/FeatureForm.client";
import { handlePageError } from "@/lib/handle-page-error";

type Params = { projectId: string; featureId: string };

export default async function EditFeaturePage({
  params,
}: {
  params: Params;
}) {
  const session = await getSession();
  if (!session?.token) redirect(RoutesEnum.LOGIN);

  const t = await getTranslations("app.projects.feature.edit");
  const { projectId, featureId } = params;

  let feature: Feature | null = null;
  try {
    feature = await fetchFeatureById(session.token, featureId);
  } catch (error) {
  await handlePageError(error);
}
  if (!feature) notFound();

  let modulesRes: Awaited<
    ReturnType<typeof fetchProjectModules>
  >;
  try {
    modulesRes = await fetchProjectModules(session.token, projectId, {
      limit: 500,
      sort: "-updatedAt",
    });
  }  catch (error) {
  await handlePageError(error);
}

  const modules: Module[] = modulesRes!.items ?? [];

  return (
    <div className="max-w-3xl space-y-6 p-6 md:p-10">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold md:text-3xl">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">
          {t("subtitle", { name: feature.name })}
        </p>
      </header>

      <FeatureForm
        mode="edit"
        action={updateFeature.bind(null, projectId, featureId)}
        modules={modules.map((module) => ({
          id: module.id,
          name: module.name,
          path: module.path,
        }))}
        defaultValues={{
          name: feature.name,
          description: feature.description,
          moduleId: feature.moduleId,
          priority: feature.priority,
          status: feature.status,
        }}
        currentModuleId={feature.moduleId}
      />

      <form
        action={deleteFeature.bind(null, projectId, featureId, feature.moduleId)}
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
