import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";

export default function Home() {
  const t = useTranslations("Common");
  return (
    <div className="container mx-auto p-4 mt-2">
      <Link href="/create" className="bg-blue-500 text-white px-6 py-3 rounded">
        {t("createNewGame")}
      </Link>
    </div>
  );
}
