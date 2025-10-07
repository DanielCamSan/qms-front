import Link from "next/link";
import {
  getFormatter,
  getTranslations,
} from "next-intl/server";
import {
  notFound,
  redirect,
} from "next/navigation";

import { FeatureStatus } from "@/lib/definitions";
import { fetchModuleById } from "@/lib/data";
import { handleUnauthorized } from "@/lib/server-auth-helpers";
import { getSession } from "@/lib/session";
import type { Feature } from "@/lib/model-definitions/feature";
import type { Module } from "@/lib/model-definitions/module";
import { RoutesEnum } from "@/lib/utils";

type Params = {
  projectId: string;
  moduleId: string;
};

export default async function ModuleDetailPage({
  params,
}: {
  params: Params;
}) {
  const session = await getSession();
  if (!session?.token) redirect(RoutesEnum.LOGIN);

  const t = await getTranslations("app.projects.module");
  const tFeatureStatus = await getTranslations("app.common.featureStatus");
  const formatter = await getFormatter();

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

  const children: Module[] = currentModule.childrens ?? [];
  const features: Feature[] = currentModule.features ?? [];

  const formattedUpdatedAt = formatter.dateTime(
    new Date(currentModule.updatedAt),
    { dateStyle: "medium" }
  );

  return (
    <div className="grid gap-6">
      <header className="rounded-xl border bg-white p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
          <h1 className="text-2xl font-bold">{currentModule.name}</h1>
          <p className="text-sm text-muted-foreground">
            {t("header.project", { id: projectId })}
          </p>
          <p className="text-xs text-muted-foreground">
            {t("header.updated", { date: formattedUpdatedAt })}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2 text-right text-xs text-muted-foreground">
            {currentModule.parentModuleId ? (
              <Link
                href={`/app/projects/${projectId}/modules/${currentModule.parentModuleId}`}
                className="inline-flex items-center rounded border px-2 py-1 transition-colors hover:bg-muted"
              >
                {t("actions.backToParent")}
              </Link>
            ) : (
              <span className="rounded border px-2 py-1">
                {t("badges.root")}
              </span>
            )}
          </div>
        </div>

        <div className="mt-4 text-sm text-muted-foreground">
          {currentModule.description ?? t("description.empty")}
        </div>
      </header>

      <section className="rounded-xl border bg-white p-4">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="font-semibold">{t("children.title")}</h2>
          <Link
            href={`/app/projects/${projectId}/modules/new?parent=${currentModule.id}`}
            className="text-xs text-primary hover:underline"
          >
            {t("actions.addChild")}
          </Link>
        </div>

        {children.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {t("children.empty")}
          </p>
        ) : (
          <ul className="space-y-2">
            {children.map((child) => (
              <li key={child.id}>
                <Link
                  href={`/app/projects/${projectId}/modules/${child.id}`}
                  className="flex items-center justify-between rounded-lg border border-transparent px-3 py-2 text-sm transition-colors hover:border-muted hover:bg-muted/40"
                >
                  <span>{child.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {t("children.sortOrder", {
                      order: child.sortOrder ?? 0,
                    })}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-xl border bg-white p-4">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="font-semibold">{t("features.title")}</h2>
          <Link
            href={`/app/projects/${projectId}/features/new?moduleId=${currentModule.id}`}
            className="text-xs text-primary hover:underline"
          >
            {t("actions.addFeature")}
          </Link>
        </div>

        {features.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {t("features.empty")}
          </p>
        ) : (
          <ul className="space-y-2">
            {features.map((feature) => (
              <li key={feature.id}>
                <Link
                  href={`/app/projects/${projectId}/features/${feature.id}`}
                  className="flex items-center justify-between rounded-lg border border-transparent px-3 py-2 text-sm transition-colors hover:border-muted hover:bg-muted/40"
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{feature.name}</span>
                    {feature.description && (
                      <span className="text-xs text-muted-foreground">
                        {feature.description}
                      </span>
                    )}
                  </div>
                  <FeatureStatusBadge
                    status={feature.status}
                    label={tFeatureStatus(feature.status)}
                  />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function FeatureStatusBadge({
  status,
  label,
}: {
  status: Feature["status"];
  label: string;
}) {
  const tone =
    status === FeatureStatus.DONE
      ? "border-blue-200 bg-blue-100 text-blue-800"
      : status === FeatureStatus.IN_PROGRESS
      ? "border-amber-200 bg-amber-100 text-amber-800"
      : "border-slate-200 bg-slate-100 text-slate-800";

  return (
    <span className={`rounded-full border px-2 py-0.5 text-[10px] ${tone}`}>
      {label}
    </span>
  );
}
