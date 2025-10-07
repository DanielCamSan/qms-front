// src/ui/components/projects/projectsListClient.tsx
"use client";

import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import type { Project } from "@/lib/model-definitions/project";
import { ProjectStatus } from "@/lib/definitions";
import { generatePagination } from "@/lib/utils"; // tu helper de paginación

type Props = {
  items: Pick<Project, "id" | "name" | "status" | "updatedAt" | "slug" | "visibility">[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    q?: string;
    sort?: string;
  };
};

export default function ProjectsList({ items, pagination }: Props) {
  const { total, page, limit, q = "", sort = "-updatedAt" } = pagination;
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const totalPages = Math.max(1, Math.ceil(total / Math.max(1, limit)));

  const goToPage = (p: number) => {
    const sp = new URLSearchParams(params.toString());
    sp.set("page", String(p));
    sp.set("limit", String(limit));
    if (q) sp.set("q", q); else sp.delete("q");
    if (sort) sp.set("sort", sort); else sp.delete("sort");
    router.push(`${pathname}?${sp.toString()}`);
  };

  return (
    <div className="rounded-xl border bg-white p-4">
      {items.length === 0 ? (
        <EmptyState />
      ) : (
        items.map((p) => (
          <details key={p.id} className="group border-b last:border-0 py-3">
            <summary className="flex items-center justify-between cursor-pointer">
              <Link
                href={`/app/projects/${p.id}`}
                className="font-medium hover:underline"
              >
                {p.name}
              </Link>
              <div className="flex items-center gap-3 text-xs">
                <ProjectStatusBadge status={p.status} />
                <span className="text-muted-foreground">
                  {new Date(p.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </summary>

            {/* Aquí podrías cargar módulos/features lazy en el futuro */}
          </details>
        ))
      )}

      {/* Paginación */}
      {totalPages > 1 && (
        <nav className="mt-4 flex items-center justify-center gap-2">
          <button
            className="rounded border px-2 py-1 text-sm disabled:opacity-50"
            onClick={() => goToPage(Math.max(1, page - 1))}
            disabled={page <= 1}
          >
            Prev
          </button>

          <ul className="flex items-center gap-1">
            {generatePagination(page, totalPages).map((it, idx) =>
              it === "..." ? (
                <li key={`ellipsis-${idx}`} className="px-2 text-sm opacity-60">
                  …
                </li>
              ) : (
                <li key={it}>
                  <button
                    className={[
                      "rounded px-3 py-1 text-sm border",
                      it === page ? "bg-primary text-primary-foreground" : "hover:bg-muted",
                    ].join(" ")}
                    onClick={() => goToPage(it as number)}
                  >
                    {it}
                  </button>
                </li>
              )
            )}
          </ul>

          <button
            className="rounded border px-2 py-1 text-sm disabled:opacity-50"
            onClick={() => goToPage(Math.min(totalPages, page + 1))}
            disabled={page >= totalPages}
          >
            Next
          </button>
        </nav>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <p className="text-sm text-muted-foreground">No projects found.</p>
      <Link
        href="/app/projects/new"
        className="mt-3 inline-block rounded-lg border px-3 py-1.5 text-sm hover:bg-muted"
      >
        Create your first project
      </Link>
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
    <span className={`rounded-full px-2 py-0.5 border text-[10px] ${tone}`}>
      {status}
    </span>
  );
}
