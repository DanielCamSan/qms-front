"use client";

import { useState } from "react";
import { Button } from "@/ui/components/button";
import { Switch } from "@/ui/components/form/switch";
import { useTranslations } from "next-intl";

type Props = {
  initial: {
    apiTokenMasked: string;
    darkMode: boolean;
  };
};

export default function SettingsGeneralClient({ initial }: Props) {
  const t = useTranslations("app.settings.general");
  const [darkMode, setDarkMode] = useState(initial.darkMode);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    // TODO: integrar server action para guardar preferencias
    console.log("general draft:", { darkMode });
  }

  return (
    <form
      onSubmit={onSubmit}
      className="grid gap-8 bg-surface border border-[color:var(--color-border)] rounded-2xl p-6"
    >
      {/* API Token */}
      <section>
        <h2 className="text-lg font-semibold">{t("api.title")}</h2>
        <p className="text-sm text-[color:var(--color-muted-fg)] mb-3">
          {t("api.subtitle")}
        </p>
        <div className="flex items-center justify-between rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-cream-100)] px-4 py-3">
          <code className="text-sm">{initial.apiTokenMasked}</code>
          <Button type="button" variant="secondary" disabled>
            {t("copy", { default: "Copy" })} (soon)
          </Button>
        </div>
      </section>

      {/* Preferences */}
      <section>
        <h2 className="text-lg font-semibold">{t("preferences.title", { default: "Preferences" })}</h2>
        <div className="mt-3 flex items-center justify-between rounded-lg border border-[color:var(--color-border)] px-4 py-3">
          <div>
            <p className="text-sm font-medium">
              {t("preferences.darkMode.label", { default: "Dark mode" })}
            </p>
            <p className="text-xs text-[color:var(--color-muted-fg)]">
              {t("preferences.darkMode.desc", { default: "Use dark theme in the app" })}
            </p>
          </div>
          <Switch
            checked={darkMode}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDarkMode(e.target.checked)}
          />
        </div>
      </section>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled>
          {t("save", { default: "Save changes" })} (soon)
        </Button>
        <span className="text-xs text-[color:var(--color-muted-fg)]">
          {t("hint", { default: "Settings will be saved when the backend is ready." })}
        </span>
      </div>
    </form>
  );
}
