export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <div className="border-b">
        <nav className="flex gap-4 text-sm">
          <a href="/app/settings/profile" className="hover:underline">Profile</a>
          <a href="/app/settings/general" className="hover:underline">General</a>
        </nav>
      </div>
      {children}
    </div>
  );
}
