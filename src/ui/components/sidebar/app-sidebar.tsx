// app-sidebar.tsx
import { getSession } from '@/lib/session';
import { getTranslations } from 'next-intl/server';
import AppSidebarClient, { AppSidebarItem } from './app-sidebar-client';
import ResponsiveMenu from '@/ui/components/navbar/responsive-menu';

export default async function AppSidebar() {
  const t = await getTranslations('app.sidebar');
  const session = await getSession();

  const items: AppSidebarItem[] = [
    { key: 'home',     label: t('home'),           href: '/app',          icon: 'home' },
    { key: 'projects', label: t('projectSection'), href: '/app/projects', icon: 'projects' },
    { key: 'settings', label: t('settingSection'), href: '/app/settings', icon: 'settings' },
  ];

  const userName  = 'pepe';//session?.user?.name  ?? 'UserName';
  const userEmail = 'pepe@test.com';//session?.user?.email ?? 'user@demo.com';

  return (
    <>
      {/* Desktop */}
      <aside className="
        hidden md:flex fixed top-0 left-0 bottom-0 w-64
        flex-col justify-between
        bg-surface border-r border-[color:var(--color-border)]
        px-4 py-6
      ">
        {/* Header */}
        <div className="flex items-center gap-3 px-2 pb-4">
          <div className="h-10 w-10 rounded-xl bg-primary/15
                          flex items-center justify-center
                          text-[color:var(--color-foreground)] font-semibold">
            {userName.slice(0,1).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">{userName}</p>
            <p className="text-xs text-[color:var(--color-muted-fg)] truncate">{userEmail}</p>
          </div>
        </div>

        {/* Nav */}
        <AppSidebarClient items={items} />

        {/* Footer */}
        <AppSidebarClient footerOnly />
      </aside>

      {/* Mobile Drawer trigger (usa tu ResponsiveMenu) */}
      <div className="md:hidden fixed top-3 left-3 z-50">
        <ResponsiveMenu closeButton>
          <div className="w-64 h-auto bg-surface border-r border-[color:var(--color-border)] px-4 py-6 flex flex-col">
            {/* Header */}
            <div className="flex items-center gap-3 px-2 pb-4">
              <div className="h-10 w-10 rounded-xl bg-primary/15
                              flex items-center justify-center
                              text-[color:var(--color-foreground)] font-semibold">
                {userName.slice(0,1).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate">{userName}</p>
                <p className="text-xs text-[color:var(--color-muted-fg)] truncate">{userEmail}</p>
              </div>
            </div>

            <AppSidebarClient items={items} />
            <AppSidebarClient footerOnly />
          </div>
        </ResponsiveMenu>
      </div>
    </>
  );
}
