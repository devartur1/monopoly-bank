// components/Footer.tsx
"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";

export default function Footer() {
  const t = useTranslations("Common");

  return (
    <footer
      className="fixed bottom-0 left-0 right-0 bg-gray-100 border-t"
      style={{
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      <div className="container mx-auto px-4 text-center text-gray-600 text-xs pt-2 pb-2">
        <p>
          © {new Date().getFullYear()} {t("copyright")}
        </p>
        <p className="mt-2">
          <Link href="/about" className="text-blue-500 hover:underline">
            {t("aboutLink")}
          </Link>
        </p>
      </div>
    </footer>
  );
}
