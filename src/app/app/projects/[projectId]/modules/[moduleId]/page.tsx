type Params = { projectId: string; moduleId: string };

export default async function ModuleDetailPage({ params }: { params: Params }) {
  const { projectId, moduleId } = params;

  // TODO: fetch real module with nested submódulos/features
  const module = {
    id: moduleId,
    name: 'Checkout',
    features: [{ id: '3ds2', name: '3DS v2' }],
    children: [{ id: 'payments', name: 'Payments Submodule' }],
  };

  return (
    <div className="grid gap-6">
      <header>
        <h1 className="text-2xl font-bold">{module.name}</h1>
        <p className="text-sm text-[color:var(--color-muted-fg)]">
          Project: {projectId}
        </p>
      </header>

      <section className="rounded-xl border bg-white p-4">
        <h2 className="font-semibold mb-2">Submodules</h2>
        {module.children?.length ? (
          <ul className="list-disc list-inside">
            {module.children.map((c) => (
              <li key={c.id}>{c.name}</li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-[color:var(--color-muted-fg)]">No submodules</p>
        )}
      </section>

      <section className="rounded-xl border bg-white p-4">
        <h2 className="font-semibold mb-2">Features</h2>
        {module.features?.length ? (
          <ul className="list-disc list-inside">
            {module.features.map((f) => (
              <li key={f.id}>{f.name}</li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-[color:var(--color-muted-fg)]">No features</p>
        )}
      </section>
    </div>
  );
}
