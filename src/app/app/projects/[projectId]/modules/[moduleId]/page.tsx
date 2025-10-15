import Link from "next/link";
import { getFormatter, getTranslations } from "next-intl/server";
import { notFound, redirect } from "next/navigation";

import {
  FeatureStatus,
  StructureModuleNode,
  StructureFeatureItem,
} from "@/lib/definitions";
import {
  fetchModuleById,
  fetchModuleStructure, // 👈 nuevo fetch
} from "@/lib/data";
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
  // 👇 Next 15+: params asíncrono
  params: Promise<Params>;
}) {
  const { projectId, moduleId } = await params;

  const session = await getSession();
  if (!session?.token) redirect(RoutesEnum.LOGIN);

  const t = await getTranslations("app.projects.module");
  const tFeatureStatus = await getTranslations("app.common.featureStatus");
  const formatter = await getFormatter();

  // 1) Datos del módulo (metadata)
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

  // 2) Estructura recursiva SOLO de este módulo (para respetar orden intercalado)
  let structureNode: StructureModuleNode;
  try {
    const { node } = await fetchModuleStructure(session.token, moduleId);
    structureNode = node;
    console.log(structureNode);
    
  } catch (error) {
    await handleUnauthorized(error);
    if (error instanceof Response && error.status === 403) {
      redirect(RoutesEnum.ERROR_UNAUTHORIZED);
    }
    throw error;
  }

  const formattedUpdatedAt = formatter.dateTime(
    new Date(currentModule.updatedAt),
    { dateStyle: "medium" }
  );

  return (
    <div className="grid gap-6">
      {/* Header */}
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

      {/* Items (orden real: módulos + features intercalados) */}
      <section className="rounded-xl border bg-white p-4">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="font-semibold">{t("children.title")}</h2>
          <div className="flex gap-3">
            <Link
              href={`/app/projects/${projectId}/modules/new?parent=${currentModule.id}`}
              className="text-xs text-primary hover:underline"
            >
              {t("actions.addChild")}
            </Link>
            <Link
              href={`/app/projects/${projectId}/features/new?moduleId=${currentModule.id}`}
              className="text-xs text-primary hover:underline"
            >
              {t("actions.addFeature")}
            </Link>
          </div>
        </div>

        {structureNode.items.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("children.empty")}</p>
        ) : (
          <ul className="space-y-2">
            {structureNode.items.map((item) =>
              item.type === "module" ? (
                <li key={item.id}>
                  <Link
                    href={`/app/projects/${projectId}/modules/${item.id}`}
                    className="flex items-center justify-between rounded-lg border border-transparent px-3 py-2 text-sm transition-colors hover:border-muted hover:bg-muted/40"
                  >
                    <span>{item.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {t("children.sortOrder", {
                        order: item.sortOrder ?? 0,
                      })}
                    </span>
                  </Link>
                </li>
              ) : (
                <li key={item.id}>
                  <Link
                    href={`/app/projects/${projectId}/features/${item.id}`}
                    className="flex items-center justify-between rounded-lg border border-transparent px-3 py-2 text-sm transition-colors hover:border-muted hover:bg-muted/40"
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">{item.name}</span>
                      {/* El endpoint no trae description: omitimos/subtitulo opcional */}
                    </div>
                    <FeatureStatusBadge
                      status={item.status as Feature["status"]}
                      label={tFeatureStatus(item.status as Feature["status"])}
                    />
                  </Link>
                </li>
              )
            )}
          </ul>
        )}
      </section>
    </div>
  );
}

/* ---------- UI helpers ---------- */

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
