// src/ui/components/projects/project-detail.client.tsx
"use client";

import Link from "next/link";
import { useState } from "react";
import type { Project } from "@/lib/model-definitions/project";
import type { Module } from "@/lib/model-definitions/module";

export default function ProjectDetailClient({
  project,
  rootModules,
}: {
  project: Project;
  rootModules: Module[];
}) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  return (
    <>
      <section className="rounded-xl border bg-white p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">Modules</h2>
        </div>

        {rootModules.length === 0 ? (
          <p className="text-sm text-muted-foreground">No modules yet.</p>
        ) : (
          <ul className="space-y-2">
            {rootModules.map((m) => (
              <li key={m.id}>
                <details
                  open={expanded[m.id]}
                  onToggle={(e) =>
                    setExpanded((prev) => ({
                      ...prev,
                      [m.id]: (e.target as HTMLDetailsElement).open,
                    }))
                  }
                  className="group"
                >
                  <summary className="cursor-pointer flex items-center justify-between">
                    <Link
                      href={`/app/projects/${project.id}/modules/${m.id}`}
                      className="hover:underline"
                    >
                      {m.name}
                    </Link>
                    <span className="text-xs text-muted-foreground">
                      #{m.sortOrder ?? 0}
                    </span>
                  </summary>

                  {/* Aquí podrías cargar hijos/feats lazy (client fetch) si quieres */}
                  <div className="ml-5 mt-2 text-sm text-muted-foreground">
                    {m.description || "No description"}
                  </div>
                </details>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Si en tu backend existieran “features sueltas del proyecto”, se renderizarían aquí.
          Con tu schema actual (Feature -> Module), las features viven dentro de módulos. */}
    </>
  );
}
