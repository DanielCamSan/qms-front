import Link from "next/link";
import {
  getFormatter,
  getTranslations,
} from "next-intl/server";
import {
  notFound,
  redirect,
} from "next/navigation";

import { ProjectStatus } from "@/lib/definitions";
import {
  fetchProjectById,
  fetchProjectModules,
} from "@/lib/data";
import { handleUnauthorized } from "@/lib/server-auth-helpers";
import { getSession } from "@/lib/session";
import type { Module } from "@/lib/model-definitions/module";
import type { Project } from "@/lib/model-definitions/project";
import ProjectDetailClient from "@/ui/components/projects/project-detail.client";
import { RoutesEnum } from "@/lib/utils";

type Params = { projectId: string };

export default async function ProjectDetailPage({
  params,
}: {
  params: Params;
}) {
  const session = await getSession();
  if (!session?.token) redirect(RoutesEnum.LOGIN);

  const t = await getTranslations("app.projects.detail");
  const tStatus = await getTranslations("app.common.projectStatus");
  const formatter = await getFormatter();

  const { projectId } = params;

  let project: Project | null = null;
  try {
    project = await fetchProjectById(session.token, projectId);
  } catch (error) {
    await handleUnauthorized(error);
    if (error instanceof Response) {
      if (error.status === 404) notFound();
      if (error.status === 403) redirect(RoutesEnum.ERROR_UNAUTHORIZED);
    }
    throw error;
  }

  if (!project) notFound();

  let modulesResult: Awaited<
    ReturnType<typeof fetchProjectModules>
  >;
  try {
    modulesResult = await fetchProjectModules(session.token, projectId, {
      parent: null,
      sort: "sortOrder",
      limit: 100,
    });
  } catch (error) {
    await handleUnauthorized(error);
    if (error instanceof Response && error.status === 403) {
      redirect(RoutesEnum.ERROR_UNAUTHORIZED);
    }
    throw error;
  }

  const modules: Module[] = modulesResult.items ?? [];

  const formattedUpdatedAt = formatter.dateTime(
    new Date(project.updatedAt),
    { dateStyle: "medium" }
  );

  return (
    <div className="grid gap-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{project.name}</h1>
          <p className="text-sm text-muted-foreground">
            {t("updated", { date: formattedUpdatedAt })}
          </p>
        </div>
        <ProjectStatusBadge
          status={project.status}
          label={tStatus(project.status)}
        />
      </header>

      <ProjectDetailClient project={project} rootModules={modules} />

      <div>
        <Link
          href={`/app/projects/${project.id}/modules/new`}
          className="inline-flex items-center rounded-lg border px-3 py-2 text-sm transition-colors hover:bg-muted"
        >
          {t("actions.addModule")}
        </Link>
      </div>
    </div>
  );
}

function ProjectStatusBadge({
  status,
  label,
}: {
  status: Project["status"];
  label: string;
}) {
  const tone =
    status === ProjectStatus.ACTIVE
      ? "border-green-200 bg-green-100 text-green-800"
      : status === ProjectStatus.FINISHED
      ? "border-blue-200 bg-blue-100 text-blue-800"
      : "border-yellow-200 bg-yellow-100 text-yellow-800";

  return (
    <span className={`rounded-full border px-2 py-0.5 text-xs ${tone}`}>
      {label}
    </span>
  );
}
