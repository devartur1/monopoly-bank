// app/game/[id]/join/page.tsx
"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "@/i18n/routing";
import posthog from "posthog-js";

export default function JoinGamePage() {
  const { id } = useParams();
  const router = useRouter();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Введите имя");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/games/${id}/players`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });

      const data = await res.json();

      if (res.ok) {
        // Сохраняем имя в localStorage для этого gameId
        localStorage.setItem(`player_${id}`, name.trim());
        // Identify the player and capture join event
        posthog.identify(name.trim(), { name: name.trim() });
        posthog.capture("game_joined", {
          game_id: id,
          player_name: name.trim(),
        });
        // Перенаправляем на страницу игры
        router.push(`/game/${id}`);
      } else {
        posthog.capture("game_join_failed", {
          game_id: id,
          player_name: name.trim(),
          error: data.error || "Ошибка при подключении",
        });
        setError(data.error || "Ошибка при подключении");
      }
    } catch (err) {
      posthog.captureException(err);
      setError("Сетевая ошибка");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-md">
      <h1 className="text-2xl font-bold mb-4">Присоединение к игре</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block mb-1 font-medium">
            Ваше имя
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border p-2 rounded"
            placeholder="Введите имя"
            autoFocus
          />
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white p-3 rounded disabled:bg-gray-400"
        >
          {loading ? "Подключение..." : "Присоединиться"}
        </button>
      </form>

      {/* Место для будущих опций (цвет, иконка) */}
      <div className="mt-6 p-4 border rounded bg-gray-50">
        <p className="text-gray-500 text-sm">
          В будущем здесь можно будет выбрать цвет имени и иконку.
        </p>
      </div>
    </div>
  );
}
