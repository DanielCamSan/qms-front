// src/app/app/projects/[projectId]/features/[featureId]/page.tsx
import { redirect, notFound } from "next/navigation";
import { getSession } from "@/lib/session";
import { RoutesEnum } from "@/lib/utils";
import { fetchFeatureById } from "@/lib/data";
import type { Feature } from "@/lib/model-definitions/feature";
import { FeatureStatus } from "@/lib/definitions";

type Params = { projectId: string; featureId: string };

export default async function FeatureDetailPage({ params }: { params: Params }) {
  const session = await getSession();
  if (!session?.token) redirect(RoutesEnum.LOGIN);

  const { projectId, featureId } = params;

  let feature: Feature | null = null;
  try {
    feature = await fetchFeatureById(session.token, featureId);
  } catch {
    notFound();
  }
  if (!feature) notFound();

  return (
    <div className="grid gap-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{feature.name}</h1>
          <p className="text-sm text-[color:var(--color-muted-fg)]">
            Project: {projectId} • Last update: {new Date(feature.updatedAt).toLocaleDateString()}
          </p>
        </div>
        <FeatureStatusBadge status={feature.status} />
      </header>

      <section className="rounded-xl border bg-white p-4">
        <h2 className="font-semibold mb-2">Description</h2>
        <p className="text-sm">{feature.description || "No description"}</p>
      </section>

      {!!feature.issueElements?.length && (
        <section className="rounded-xl border bg-white p-4">
          <h2 className="font-semibold mb-2">Linked Issues / PRs</h2>
          <ul className="list-disc list-inside text-sm">
            {feature.issueElements.map((i) => (
              <li key={i.id}>
                {i.githubIssueUrl && <a className="underline" href={i.githubIssueUrl} target="_blank">Issue</a>}{" "}
                {i.pullRequestUrl && (
                  <>
                    {i.githubIssueUrl ? "• " : ""}
                    <a className="underline" href={i.pullRequestUrl} target="_blank">PR</a>
                  </>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {!!feature.versions?.length && (
        <section className="rounded-xl border bg-white p-4">
          <h2 className="font-semibold mb-2">Versions</h2>
          <ul className="text-sm space-y-1">
            {feature.versions.map((v) => (
              <li key={v.id} className="flex items-center justify-between">
                <span>v{v.versionNumber}{v.isRollback ? " (rollback)" : ""}</span>
                <span className="text-muted-foreground">{new Date(v.createdAt).toLocaleDateString()}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function FeatureStatusBadge({ status }: { status: Feature["status"] }) {
  const tone =
    status === FeatureStatus.DONE
      ? "bg-blue-100 text-blue-800 border-blue-200"
      : status === FeatureStatus.IN_PROGRESS
      ? "bg-amber-100 text-amber-800 border-amber-200"
      : "bg-gray-100 text-gray-800 border-gray-200";
  return (
    <span className={`rounded-full border px-2 py-0.5 text-xs ${tone}`}>{status}</span>
  );
}
