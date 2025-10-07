// src/app/app/projects/page.tsx
import Link from "next/link";
import { getSession } from "@/lib/session";
import { fetchProjectsMine } from "@/lib/data";
import ProjectsList from "@/ui/components/projects/projectListClient";

type SearchParams = {
  page?: string;
  q?: string;
  sort?: string; // e.g. "-updatedAt"
  limit?: string;
};

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  const session = await getSession();
  const token = session?.token ?? "";

  // Parseo de params (con defaults sanos)
  const page = Number(searchParams?.page ?? 1);
  const limit = Number(searchParams?.limit ?? 20);
  const q = searchParams?.q ?? "";
  const sort = searchParams?.sort ?? "-updatedAt";

  // Llamada SSR al backend
  const result = await fetchProjectsMine(token, { page, limit, q, sort });

  // Soporta tanto {items,total,page,limit} como array liso (por si tu back aún no pagina)
  const items = Array.isArray(result) ? result : result.items ?? [];
  const total = Array.isArray(result) ? items.length : result.total ?? items.length;
  const curPage = Array.isArray(result) ? 1 : result.page ?? page;
  const curLimit = Array.isArray(result) ? items.length : result.limit ?? limit;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Projects</h1>

        <div className="flex items-center gap-2">
          {/* (Opcional) mini search control */}
          {/* <form className="hidden md:block">
            <input
              name="q"
              defaultValue={q}
              placeholder="Search projects…"
              className="rounded-lg border px-3 py-1.5 text-sm"
            />
          </form> */}
          <Link
            href="/app/projects/new"
            className="rounded-lg bg-background px-3 py-2 text-sm border hover:bg-white"
          >
            Add Project
          </Link>
        </div>
      </div>

      {/* Lista/árbol (client component) */}
      <ProjectsList
        items={items}
        pagination={{
          total,
          page: curPage,
          limit: curLimit,
          q,
          sort,
        }}
      />
    </div>
  );
}
