import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { fetchGetUserProfile } from "@/lib/data";
import { handleUnauthorized } from "@/lib/server-auth-helpers";
import { getSession } from "@/lib/session";
import type { User } from "@/lib/model-definitions/user";
import { RoutesEnum } from "@/lib/utils";
import SettingsGeneralClient from "@/ui/components/settings/SettingsGeneralClient";

export default async function GeneralSettingsPage() {
  const session = await getSession();
  if (!session?.token) redirect(RoutesEnum.LOGIN);

  const t = await getTranslations("app.settings.general");

  let profile: User | null = null;
  try {
    profile = await fetchGetUserProfile(session.token);
    console.log("Profile is: ",profile);    
  } catch (error) {
    await handleUnauthorized(error);
    profile = null;
  }

  const initial = {
    apiTokenMasked: profile?.githubIdentity?.accessToken ?? t("api.placeholder"),
    hasGithubToken: Boolean(profile?.githubIdentity),
  };

  return (
    <div className="p-6 md:p-10 max-w-3xl space-y-6">
      <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
        {t("pageTitle")}
      </h1>
      <SettingsGeneralClient initial={initial} />
    </div>
  );
}
