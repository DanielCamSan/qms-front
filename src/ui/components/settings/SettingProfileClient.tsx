"use client";

import { useState } from "react";
import { Input } from "@/ui/components/form/input";
import { Button } from "@/ui/components/button";
import { useTranslations } from "next-intl";

type Props = {
  defaultName: string;
  defaultEmail: string;
};

export default function SettingsProfileClient({ defaultName, defaultEmail }: Props) {
  const t = useTranslations("app.settings.profile");
  const [name, setName] = useState(defaultName);
  const [email, setEmail] = useState(defaultEmail);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  function onSubmitProfile(e: React.FormEvent) {
    e.preventDefault();
    // TODO: integrar server action updateProfile
    console.log("profile draft:", { name, email });
  }

  function onSubmitPassword(e: React.FormEvent) {
    e.preventDefault();
    // TODO: integrar server action updatePassword
    console.log("password draft:", { currentPassword, newPassword, confirmPassword });
  }

  return (
    <div className="grid gap-8">
      {/* Bloque Perfil */}
      <form
        onSubmit={onSubmitProfile}
        className="bg-surface border border-[color:var(--color-border)] rounded-2xl p-6"
      >
        <h2 className="text-lg font-semibold mb-4">{t("title", { default: "Profile" })}</h2>

        <div className="grid gap-4">
          <Input
            name="name"
            label={t("name.title")}
            placeholder="John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            name="email"
            type="email"
            label={t("email.title")}
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="mt-6 flex items-center gap-3">
          <Button type="submit" disabled>
            {t("save", { default: "Save changes" })} (soon)
          </Button>
          <span className="text-xs text-[color:var(--color-muted-fg)]">
            {t("hint", { default: "Changes will be available soon." })}
          </span>
        </div>
      </form>

      {/* Bloque Contraseña */}
      <form
        onSubmit={onSubmitPassword}
        className="bg-surface border border-[color:var(--color-border)] rounded-2xl p-6"
      >
        <h2 className="text-lg font-semibold mb-4">{t("password.title", { default: "Password" })}</h2>

        <div className="grid gap-4">
          <Input
            name="currentPassword"
            type="password"
            label={t("password.current", { default: "Current password" })}
            placeholder="********"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
          <Input
            name="newPassword"
            type="password"
            label={t("password.new", { default: "New password" })}
            placeholder="********"
            description={t("password.rules", {
              default: "(At least 8 characters, with letters and numbers)",
            })}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <Input
            name="confirmPassword"
            type="password"
            label={t("password.confirm", { default: "Confirm password" })}
            placeholder="********"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

        <div className="mt-6 flex items-center gap-3">
          <Button type="submit" disabled>
            {t("save", { default: "Update password" })} (soon)
          </Button>
          <span className="text-xs text-[color:var(--color-muted-fg)]">
            {t("hint", { default: "This action will be enabled soon." })}
          </span>
        </div>
      </form>
    </div>
  );
}
