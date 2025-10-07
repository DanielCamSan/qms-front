"use client";

import { useActionState, useCallback, useState, useTransition } from "react";
import { Button } from "@/ui/components/button";
import { Switch } from "@/ui/components/form/switch";
import { useTranslations } from "next-intl";

import {
  type GeneralFormState,
  updateGeneralPreferencesAction,
} from "@/app/app/settings/general/actions";

type Props = {
  initial: {
    apiTokenMasked: string;
    darkMode: boolean;
  };
};

export default function SettingsGeneralClient({ initial }: Props) {
  const t = useTranslations("app.settings.general");
  const [darkMode, setDarkMode] = useState(initial.darkMode);
  const [copied, setCopied] = useState(false);
  const [pendingCopy, startCopyTransition] = useTransition();

  const INITIAL_STATE: GeneralFormState = {};
  const [state, dispatch] = useActionState(
    updateGeneralPreferencesAction,
    INITIAL_STATE
  );

  const handleCopy = useCallback(() => {
    startCopyTransition(async () => {
      try {
        if (typeof navigator === "undefined" || !navigator.clipboard) {
          setCopied(false);
          return;
        }
        await navigator.clipboard.writeText(initial.apiTokenMasked ?? "");
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      } catch {
        setCopied(false);
      }
    });
  }, [initial.apiTokenMasked]);

  return (
    <form
      action={(formData) => {
        formData.set("darkMode", darkMode ? "true" : "false");
        return dispatch(formData);
      }}
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
          <Button
            type="button"
            variant="secondary"
            onClick={handleCopy}
            disabled={pendingCopy}
          >
            {copied ? t("copySuccess") : t("copy")}
          </Button>
        </div>
      </section>

      {/* Preferences */}
      <section>
        <h2 className="text-lg font-semibold">{t("preferences.title")}</h2>
        <div className="mt-3 flex items-center justify-between rounded-lg border border-[color:var(--color-border)] px-4 py-3">
          <div>
            <p className="text-sm font-medium">
              {t("preferences.darkMode.label")}
            </p>
            <p className="text-xs text-[color:var(--color-muted-fg)]">
              {t("preferences.darkMode.desc")}
            </p>
          </div>
          <Switch
            name="darkMode"
            checked={darkMode}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDarkMode(e.target.checked)}
          />
        </div>
      </section>

      {state.success && (
        <p className="text-sm text-green-700" role="status">
          {t("alerts.success")}
        </p>
      )}
      {!state.success && state.message === "error" && (
        <p className="text-sm text-red-600" role="alert">
          {t("alerts.error")}
        </p>
      )}

      <div className="flex items-center gap-3">
        <Button type="submit">
          {t("save")}
        </Button>
        <span className="text-xs text-[color:var(--color-muted-fg)]">
          {t("hint")}
        </span>
      </div>
    </form>
  );
}
