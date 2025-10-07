// src/ui/components/projects/project-detail.client.tsx
"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useState } from "react";

import type { Module } from "@/lib/model-definitions/module";
import type { Project } from "@/lib/model-definitions/project";

export default function ProjectDetailClient({
  project,
  rootModules,
}: {
  project: Project;
  rootModules: Module[];
}) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const t = useTranslations("app.projects.detail");

  return (
    <section className="rounded-xl border bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-semibold">{t("modules.title")}</h2>
      </div>

      {rootModules.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {t("modules.empty")}
        </p>
      ) : (
        <ul className="space-y-2">
          {rootModules.map((module) => (
            <li key={module.id}>
              <details
                className="group rounded-lg border border-transparent px-3 py-2 transition-colors hover:border-muted"
                open={expanded[module.id]}
                onToggle={(event) =>
                  setExpanded((prev) => ({
                    ...prev,
                    [module.id]: (event.target as HTMLDetailsElement).open,
                  }))
                }
              >
                <summary className="flex cursor-pointer items-center justify-between gap-3">
                  <Link
                    href={`/app/projects/${project.id}/modules/${module.id}`}
                    className="text-sm font-medium hover:underline"
                  >
                    {module.name}
                  </Link>
                  <span className="text-xs text-muted-foreground">
                    {t("modules.sortOrder", {
                      order: module.sortOrder ?? 0,
                    })}
                  </span>
                </summary>

                <div className="ml-5 mt-2 text-sm text-muted-foreground">
                  {module.description ?? t("modules.noDescription")}
                </div>
              </details>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
