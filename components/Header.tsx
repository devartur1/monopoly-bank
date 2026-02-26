"use client";

import LanguageSwitcher from "./LanguageSwitcher";
import { useTranslations } from "next-intl";

export default function Header() {
  const t = useTranslations("Common");
  return (
    <header className="border-b bg-white shadow-sm">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {t("appName")} 🎲
        <LanguageSwitcher />
      </div>
    </header>
  );
}
