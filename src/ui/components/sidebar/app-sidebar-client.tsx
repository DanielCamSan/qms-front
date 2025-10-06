'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, FolderTree, Settings, Sun, Moon, LogOut } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import LogoutButton from '@/ui/components/auth/logout-button';

export type AppSidebarItem = {
  key: string;
  label: string;
  href: string;
  icon: 'home' | 'projects' | 'settings';
};

export default function AppSidebarClient({
  items,
  footerOnly = false,
}: {
  items?: AppSidebarItem[];
  footerOnly?: boolean;
}) {
  const t = useTranslations('app.sidebar');
  const pathname = usePathname();
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains('dark'));
  }, []);

  const toggleTheme = () => {
    setDark((d) => {
      const next = !d;
      document.documentElement.classList.toggle('dark', next);
      return next;
    });
  };

  const IconMap = { home: Home, projects: FolderTree, settings: Settings } as const;

  if (footerOnly) {
    return (
      <div className="mt-auto space-y-2 px-2">
        {/* Theme */}
        <button
          onClick={toggleTheme}
          className="w-full flex items-center justify-between
                     text-sm px-2 py-2 rounded-md
                     hover:bg-[color:var(--color-cream-100)]
                     text-[color:var(--color-foreground)]"
        >
          <span>{dark ? t('lightMode') : t('darkMode')}</span>
          {dark ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* Logout: no pasamos props al componente */}
        <div className="w-full">
          <div className="w-full flex items-center gap-2 text-sm px-2 py-2 rounded-md
                          hover:bg-[color:var(--color-cream-100)]
                          text-[color:var(--color-foreground)]">
            <LogOut size={16} className="mr-2" />
            <LogoutButton />
          </div>
        </div>
      </div>
    );
  }

  return (
    <nav className="flex-1 mt-2 space-y-1">
      {items!.map((item) => {
        const Icon = IconMap[item.icon];
        const active = item.href === '/app'
          ? pathname === '/app'
          : pathname.startsWith(item.href);

        return (
          <Link
            key={item.key}
            href={item.href}
            className={[
              'flex items-center gap-3 px-2 py-2 rounded-md text-sm transition-colors',
              active
                ? 'bg-primary/15 text-[color:var(--color-foreground)] border-r-2 border-primary'
                : 'text-[color:var(--color-muted-fg)] hover:bg-[color:var(--color-cream-100)]',
            ].join(' ')}
          >
            <Icon size={18} className={active ? '' : 'opacity-80'} />
            <span className={active ? 'font-medium' : ''}>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
