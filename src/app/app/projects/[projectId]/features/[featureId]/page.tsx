type Params = { projectId: string; featureId: string };

export default async function FeatureDetailPage({ params }: { params: Params }) {
  const { projectId, featureId } = params;

  // TODO: fetch real feature details
  const feature = {
    id: featureId,
    name: '3DS v2',
    status: 'active',
    owner: 'N. Ortega',
    updatedAt: '2025-01-10',
    description: 'Strong Customer Authentication for card payments.',
  };

  return (
    <div className="grid gap-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{feature.name}</h1>
          <p className="text-sm text-[color:var(--color-muted-fg)]">
            Project: {projectId} • Last update: {feature.updatedAt}
          </p>
        </div>
        <span className="rounded-full border px-2 py-0.5 text-xs bg-[color:var(--color-cream-100)]">
          {feature.status}
        </span>
      </header>

      <section className="rounded-xl border bg-white p-4">
        <h2 className="font-semibold mb-2">Description</h2>
        <p className="text-sm">{feature.description}</p>
      </section>

      <section className="rounded-xl border bg-white p-4">
        <h2 className="font-semibold mb-2">Owner</h2>
        <p className="text-sm">{feature.owner}</p>
      </section>
    </div>
  );
}
