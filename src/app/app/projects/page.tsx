type Feature = { id: string; name: string; status: 'active'|'completed'|'on-hold' };
type Module = { id: string; name: string; children?: Module[]; features?: Feature[] };
type Project = { id: string; name: string; updatedAt: string; status: Feature['status']; modules?: Module[]; features?: Feature[] };

const data: Project[] = [
  { id: 'p1', name: 'E-commerce Platform', status: 'active', updatedAt: '2024-03-14', modules: [
      { id: 'm1', name: 'Checkout', features: [{ id:'f1', name:'3DS v2', status:'active'}] }
  ]},
  { id: 'p2', name: 'Company Website Redesign', status: 'completed', updatedAt: '2024-02-27' }
];

export default function ProjectsPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Projects</h1>
        <a href="/app/projects/new" className="rounded-lg px-3 py-2 text-sm border">Add Project</a>
      </div>

      <div className="rounded-xl border bg-white p-4">
        {/* Renderiza el árbol con tu componente Tree o con <details> para MVP */}
        {data.map((p) => (
          <details key={p.id} className="group border-b last:border-0 py-3">
            <summary className="flex items-center justify-between cursor-pointer">
              <a href={`/app/projects/${p.id}`} className="font-medium hover:underline">{p.name}</a>
              <div className="flex items-center gap-3 text-xs">
                <span className={`rounded-full px-2 py-0.5 border ${p.status==='active'?'bg-green-100':p.status==='completed'?'bg-blue-100':'bg-yellow-100'}`}>{p.status}</span>
                <span className="text-[color:var(--color-muted-fg)]">{p.updatedAt}</span>
              </div>
            </summary>

            {/* Módulos */}
            {p.modules?.map((m) => (
              <details key={m.id} className="ml-4 mt-2">
                <summary className="cursor-pointer">
                  <a href={`/app/projects/${p.id}/modules/${m.id}`} className="hover:underline">{m.name}</a>
                </summary>
                {/* Features dentro del módulo */}
                <ul className="ml-6 mt-2 list-disc text-sm">
                  {m.features?.map((f) => (
                    <li key={f.id}>
                      <a href={`/app/projects/${p.id}/features/${f.id}`} className="hover:underline">{f.name}</a>
                    </li>
                  ))}
                </ul>
              </details>
            ))}

            {/* Features sueltas en el proyecto */}
            {p.features && (
              <ul className="ml-4 mt-2 list-disc text-sm">
                {p.features.map((f) => (
                  <li key={f.id}>
                    <a href={`/app/projects/${p.id}/features/${f.id}`} className="hover:underline">{f.name}</a>
                  </li>
                ))}
              </ul>
            )}
          </details>
        ))}
      </div>
    </div>
  );
}
