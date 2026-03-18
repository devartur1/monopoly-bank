"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import posthog from "posthog-js";

export default function CreateGame() {
  const t = useTranslations("CreatePage");
  const [createdBy, setCreatedBy] = useState("");
  const [initialBalance, setInitialBalance] = useState(1500);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/games", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ createdBy, initialBalance }),
      });
      const data = await res.json();
      if (res.ok) {
        // ✅ Сохраняем имя для этого gameId
        localStorage.setItem(`player_${data.gameId}`, createdBy);
        // Identify the user and capture game creation
        posthog.identify(createdBy, { name: createdBy });
        posthog.capture("game_created", {
          game_id: data.gameId,
          created_by: createdBy,
          initial_balance: initialBalance,
        });
        router.push(`/game/${data.gameId}`);
      } else {
        posthog.capture("game_creation_failed", {
          error: data.error || "Failed to create game",
          created_by: createdBy,
          initial_balance: initialBalance,
        });
        alert(data.error || "Failed to create game");
      }
    } catch (error) {
      posthog.captureException(error);
      alert("Error creating game");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-md">
      <h1 className="text-2xl font-bold mb-4">{t("title")}</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">{t("nameLabel")}</label>
          <input
            type="text"
            value={createdBy}
            onChange={(e) => setCreatedBy(e.target.value)}
            required
            className="w-full border p-2 rounded"
          />
        </div>
        <div>
          <label className="block mb-1">{t("balanceLabel")}</label>
          <input
            type="number"
            value={initialBalance}
            onChange={(e) => setInitialBalance(Number(e.target.value))}
            required
            min={1}
            className="w-full border p-2 rounded"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white p-3 rounded disabled:bg-gray-400"
        >
          {loading ? t("creating") : t("createButton")}
        </button>
      </form>
    </div>
  );
}
