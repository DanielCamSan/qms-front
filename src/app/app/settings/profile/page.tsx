// Server Component
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { RoutesEnum } from "@/lib/utils";
import { getTranslations } from "next-intl/server";
import SettingsProfileClient from "@/ui/components/settings/SettingProfileClient";


export default async function ProfileSettingsPage() {
  const session = await getSession();
  if (!session?.token) {
    redirect(RoutesEnum.LOGIN);
  }

  // Trae traducciones server-side si prefieres pasarlas como props
  const t = await getTranslations("app.settings.profile");

  // Si tienes user en la sesión, úsalo. Si no, trae de tu DB aquí.
  const user = {
    name: 'PEDRO',//session.user?.name ?? "",
    email: 'pedro@email.com'//session.user?.email ?? "",
  };

  return (
    <div className="p-6 md:p-10">
      <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-6">
        {t("title", { default: "Profile" }) /* opcional */}
      </h1>

      {/* Pasa datos seguros al cliente */}
      <SettingsProfileClient
        defaultName={user.name}
        defaultEmail={user.email}
      />
    </div>
  );
}
