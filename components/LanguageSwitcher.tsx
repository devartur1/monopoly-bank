"use client";

import { usePathname, useRouter } from "@/i18n/routing";
import { useLocale } from "next-intl";
import { useState } from "react";

export default function LanguageSwitcher() {
  const pathname = usePathname();
  const router = useRouter();
  const currentLocale = useLocale();
  const [isOpen, setIsOpen] = useState(false);

  const languages = [
    { code: "ru", label: "Русский" },
    { code: "en", label: "English" },
  ];

  const switchLanguage = (locale: string) => {
    router.replace(pathname, { locale });
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 px-3 py-1 border rounded hover:bg-gray-50"
      >
        <span className="text-sm">
          {currentLocale === "ru" ? "Рус" : "Eng"}
        </span>
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 bg-white border rounded shadow-lg z-10">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => switchLanguage(lang.code)}
              className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                currentLocale === lang.code ? "bg-blue-50 text-blue-600" : ""
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
