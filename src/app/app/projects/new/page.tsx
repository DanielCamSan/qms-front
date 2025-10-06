// src/app/app/projects/new/page.tsx (Server)
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { RoutesEnum } from "@/lib/utils";
import { getTranslations } from "next-intl/server";
import NewProjectFormClient from "@/ui/components/projects/NewProjectFormClient";

export default async function NewProjectPage() {
  const session = await getSession();
  if (!session?.token) redirect(RoutesEnum.LOGIN);

  const t = await getTranslations("app.projects.new");

  return (
    <div className="p-6 md:p-10 max-w-2xl">
      <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-6">
        {t("title")}
      </h1>
      <NewProjectFormClient />
    </div>
  );
}
