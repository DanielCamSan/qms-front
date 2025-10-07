// src/app/app/projects/[projectId]/page.tsx
import { getTranslations } from "next-intl/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { RoutesEnum } from "@/lib/utils";
import { fetchProjectById, fetchProjectModules } from "@/lib/data";
import type { Project } from "@/lib/model-definitions/project";
import type { Module } from "@/lib/model-definitions/module";
import { ProjectStatus } from "@/lib/definitions";
import ProjectDetailClient from "@/ui/components/projects/project-detail.client";

type Params = { projectId: string };

export default async function ProjectDetailPage({ params }: { params: Params }) {
  const session = await getSession();
  if (!session?.token) redirect(RoutesEnum.LOGIN);

  const t = await getTranslations("app.projects.detail");
  const { projectId } = params;

  // fetch project (detalle)
  let project: Project | null = null;
  try {
    project = await fetchProjectById(session.token, projectId);
  } catch (err) {
    // 404 del backend → notFound()
    notFound();
  }
  if (!project) notFound();

  // fetch módulos raíz del proyecto (parent=null)
  const modulesResult = await fetchProjectModules(session.token, projectId, {
    parent: null,
    sort: "sortOrder",
    limit: 100,
  });

  const modules: Module[] = Array.isArray(modulesResult)
    ? modulesResult
    : modulesResult.items ?? [];

  return (
    <div className="grid gap-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{project.name}</h1>
          <p className="text-sm text-[color:var(--color-muted-fg)]">
            {t("updated")} {new Date(project.updatedAt).toLocaleDateString()}
          </p>
        </div>
        <ProjectStatusBadge status={project.status} />
      </header>

      {/* Cliente: render modular y acciones */}
      <ProjectDetailClient project={project} rootModules={modules} />

      {/* CTA: crear módulo */}
      <div>
        <Link
          href={`/app/projects/${project.id}/modules/new`}
          className="inline-flex items-center rounded-lg border px-3 py-2 text-sm hover:bg-muted"
        >
         Add module
        </Link>
      </div>
    </div>
  );
}

function ProjectStatusBadge({ status }: { status: Project["status"] }) {
  const tone =
    status === ProjectStatus.ACTIVE
      ? "bg-green-100 text-green-800 border-green-200"
      : status === ProjectStatus.FINISHED
      ? "bg-blue-100 text-blue-800 border-blue-200"
      : "bg-yellow-100 text-yellow-800 border-yellow-200"; // ON_HOLD

  return (
    <span className={`rounded-full border px-2 py-0.5 text-xs ${tone}`}>
      {status}
    </span>
  );
}
