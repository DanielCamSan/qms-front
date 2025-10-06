import { getTranslations } from 'next-intl/server';
import Link from 'next/link';

type Params = { projectId: string };

export default async function ProjectDetailPage({ params }: { params: Params }) {
  const t = await getTranslations('app.projects.detail');
  const { projectId } = params;

  // TODO: fetch real project (modules/features)
  const project = {
    id: projectId,
    name: 'E-commerce Platform',
    status: 'active',
    updatedAt: '2025-01-10',
    modules: [{ id: 'checkout', name: 'Checkout' }, { id: 'catalog', name: 'Catalog' }],
    features: [{ id: '3ds2', name: '3DS v2' }, { id: 'audit-log', name: 'Audit Log' }],
  };

  return (
    <div className="grid gap-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{project.name}</h1>
          <p className="text-sm text-[color:var(--color-muted-fg)]">
            {t('updated')} {project.updatedAt}
          </p>
        </div>
        <span className="rounded-full border px-2 py-0.5 text-xs bg-[color:var(--color-cream-100)]">
          {project.status}
        </span>
      </header>

      <section className="rounded-xl border bg-white p-4">
        <h2 className="font-semibold mb-3">{t('modules')}</h2>
        <ul className="list-disc list-inside">
          {project.modules.map((m) => (
            <li key={m.id}>
              <Link href={`/app/projects/${project.id}/modules/${m.id}`} className="hover:underline">
                {m.name}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-xl border bg-white p-4">
        <h2 className="font-semibold mb-3">{t('features')}</h2>
        <ul className="list-disc list-inside">
          {project.features.map((f) => (
            <li key={f.id}>
              <Link href={`/app/projects/${project.id}/features/${f.id}`} className="hover:underline">
                {f.name}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
