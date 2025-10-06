import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { RoutesEnum } from "@/lib/utils";
import { getTranslations } from "next-intl/server";
import SettingsGeneralClient from "@/ui/components/settings/SettingsGeneralClient";


export default async function GeneralSettingsPage() {
  const session = await getSession();
  if (!session?.token) redirect(RoutesEnum.LOGIN);

  const t = await getTranslations("app.settings.general");

  // Valores simulados: API token oculto y preferencia dark mode
  const initial = {
    apiTokenMasked: "sk_live_•••••••••••••••••••••••",
    darkMode: false,
  };

  return (
    <div className="p-6 md:p-10 max-w-3xl">
      <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-6">
        {t("title", { default: "General" })}
      </h1>
      <SettingsGeneralClient initial={initial} />
    </div>
  );
}
