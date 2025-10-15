import Link from "next/link";
import { getFormatter, getTranslations } from "next-intl/server";
import { notFound, redirect } from "next/navigation";

import { FeaturePriority, FeatureStatus } from "@/lib/definitions";
import { fetchFeatureById } from "@/lib/data";
import { getSession } from "@/lib/session";
import type { Feature } from "@/lib/model-definitions/feature";
import { RoutesEnum } from "@/lib/utils";
import { handlePageError } from "@/lib/handle-page-error";

type Params = {
  projectId: string;
  featureId: string;
};

export default async function FeatureDetailPage({
  params,
}: {
  params: Params;
}) {
  const session = await getSession();
  if (!session?.token) redirect(RoutesEnum.LOGIN);

  const t = await getTranslations("app.projects.feature");
  const tStatus = await getTranslations("app.common.featureStatus");
  const tPriority = await getTranslations("app.common.featurePriority");
  const formatter = await getFormatter();

  const { projectId, featureId } = await params;

  let feature: Feature | null = null;
  try {
    feature = await fetchFeatureById(session.token, featureId);
  } catch (error) {
    await handlePageError(error);
  }
  if (!feature) notFound();

  const formattedUpdatedAt = formatter.dateTime(new Date(feature.updatedAt), {
    dateStyle: "medium",
  });

  return (
    <div className="grid gap-6">
      <header className="rounded-xl border bg-white p-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">{feature.name}</h1>
            <p className="text-sm text-muted-foreground">
              {t("header.project", { id: projectId })}
            </p>
            <p className="text-xs text-muted-foreground">
              {t("header.updated", { date: formattedUpdatedAt })}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <FeatureStatusBadge
              status={feature.status}
              label={tStatus(feature.status)}
            />
            <FeaturePriorityBadge
              priority={feature.priority ?? FeaturePriority.MEDIUM}
              label={tPriority(feature.priority ?? FeaturePriority.MEDIUM)}
            />
            <Link
              href={`/app/projects/${projectId}/modules/${feature.moduleId}`}
              className="text-xs text-primary hover:underline"
            >
              {t("header.viewModule")}
            </Link>
          </div>
        </div>
      </header>

      <section className="rounded-xl border bg-white p-4">
        <h2 className="mb-2 font-semibold">{t("description.title")}</h2>
        <p className="text-sm text-muted-foreground">
          {feature.description ?? t("description.empty")}
        </p>
      </section>

      <section className="rounded-xl border bg-white p-4">
        <h2 className="mb-2 font-semibold">{t("issues.title")}</h2>
        {feature.issueElements?.length ? (
          <ul className="space-y-2 text-sm">
            {feature.issueElements.map((issue) => (
              <li key={issue.id} className="flex flex-wrap items-center gap-2">
                {issue.githubIssueUrl && (
                  <a
                    href={issue.githubIssueUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary underline"
                  >
                    {t("issues.issueLink")}
                  </a>
                )}
                {issue.pullRequestUrl && (
                  <a
                    href={issue.pullRequestUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary underline"
                  >
                    {t("issues.pullRequestLink")}
                  </a>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">{t("issues.empty")}</p>
        )}
      </section>

      <section className="rounded-xl border bg-white p-4">
        <h2 className="mb-2 font-semibold">{t("versions.title")}</h2>
        {feature.versions?.length ? (
          <ul className="space-y-2 text-sm">
            {feature.versions.map((version) => (
              <li
                key={version.id}
                className="flex items-center justify-between rounded-lg border border-transparent px-3 py-2 transition-colors hover:border-muted"
              >
                <div>
                  <span className="font-medium">
                    {t("versions.label", {
                      version: version.versionNumber,
                    })}
                  </span>
                  {version.isRollback && (
                    <span className="ml-2 text-xs text-amber-600">
                      {t("versions.rollback")}
                    </span>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">
                  {formatter.dateTime(new Date(version.createdAt), {
                    dateStyle: "medium",
                  })}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">{t("versions.empty")}</p>
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
    <span className={`rounded-full border px-2 py-0.5 text-xs ${tone}`}>
      {label}
    </span>
  );
}

function FeaturePriorityBadge({
  priority,
  label,
}: {
  priority: FeaturePriority;
  label: string;
}) {
  const tone =
    priority === FeaturePriority.HIGH
      ? "border-rose-200 bg-rose-100 text-rose-800"
      : priority === FeaturePriority.LOW
      ? "border-emerald-200 bg-emerald-100 text-emerald-800"
      : "border-sky-200 bg-sky-100 text-sky-800";

  return (
    <span className={`rounded-full border px-2 py-0.5 text-[10px] ${tone}`}>
      {label}
    </span>
  );
}
