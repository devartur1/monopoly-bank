"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { useState, useEffect } from "react";

export default function AboutPage() {
  const t = useTranslations("AboutPage");
  const commonT = useTranslations("Common");
  const [gameId, setGameId] = useState<string | null>(null);

  useEffect(() => {
    const lastGameId = localStorage.getItem("lastGameId");
    setGameId(lastGameId);
  }, []);

  const backLink = gameId ? `/game/${gameId}` : "/";
  const backText = gameId ? commonT("backToGame") : commonT("backToHome");

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-4">{t("title")}</h1>
      <p className="mb-4">{t("description")}</p>

      <h2 className="text-2xl font-semibold mt-6 mb-2">{t("howItWorks")}</h2>
      <ul className="list-disc pl-5 mb-4">
        {t.raw("features").map((feature: string, index: number) => (
          <li key={index}>{feature}</li>
        ))}
      </ul>

      <h2 className="text-2xl font-semibold mt-6 mb-2">{t("contacts")}</h2>
      <p className="mb-4">
        {t("contactEmail")}{" "}
        <a href="mailto:artur@me.com" className="text-blue-500 hover:underline">
          artur@me.com
        </a>
      </p>

      <div className="mt-6">
        <Link href={backLink} className="text-blue-500 hover:underline">
          {backText}
        </Link>
      </div>
    </div>
  );
}
