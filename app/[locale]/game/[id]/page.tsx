"use client";

import { useState, useEffect } from "react";
import { useRouter } from "@/i18n/routing";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import DigitalKeyboard from "@/components/DigitalKeyboard";

interface Player {
  _id: string;
  name: string;
  balance: number;
}

interface Game {
  _id: string;
  createdBy: string;
  players: Player[];
}

interface Transaction {
  _id: string;
  fromPlayerId: string;
  toPlayerId: string;
  amount: number;
  timestamp: string;
}

export default function GamePage() {
  const BANK_NAME = "Bank";
  const { id } = useParams();
  const router = useRouter();
  const t = useTranslations("GamePage");
  const [game, setGame] = useState<Game | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [selectedReceiver, setSelectedReceiver] = useState<Player | null>(null);
  const [isBankTransfer, setIsBankTransfer] = useState(false);
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [amount, setAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"balances" | "history">(
    "balances",
  );

  // Загрузка игры
  useEffect(() => {
    if (!id) return;
    const fetchGame = async () => {
      try {
        const res = await fetch(`/api/games/${id}`);
        const data = await res.json();
        setGame(data);
        // Сохраняем ID текущей игры для обратной ссылки
        localStorage.setItem("lastGameId", id as string);

        const savedName = localStorage.getItem(`player_${id}`);
        if (savedName) {
          const player = data.players.find((p: Player) => p.name === savedName);
          if (player) {
            setCurrentPlayer(player);
          } else {
            // Имя есть в localStorage, но игрок не найден — перенаправляем на страницу присоединения
            router.push(`/game/${id}/join`);
          }
        } else {
          // Нет сохранённого имени — редирект на страницу присоединения
          router.push(`/game/${id}/join`);
        }
      } catch (error) {
        console.error("Failed to fetch game", error);
      } finally {
        setLoading(false);
      }
    };
    fetchGame();
    const interval = setInterval(fetchGame, 5000);
    return () => clearInterval(interval);
  }, [id, router]);

  // Загрузка истории
  useEffect(() => {
    if (!id) return;
    const fetchTransactions = async () => {
      try {
        const res = await fetch(`/api/games/${id}/transactions`);
        setTransactions(await res.json());
      } catch (error) {
        console.error("Failed to fetch transactions", error);
      }
    };
    fetchTransactions();
    const interval = setInterval(fetchTransactions, 5000);
    return () => clearInterval(interval);
  }, [id]);

  const handlePlayerClick = (receiver: Player) => {
    if (!currentPlayer) {
      alert("Сначала войдите в игру");
      return;
    }
    if (receiver._id === currentPlayer._id) {
      alert("Нельзя перевести деньги самому себе");
      return;
    }
    setSelectedReceiver(receiver);
    setIsBankTransfer(false);
    setShowKeyboard(true);
  };

  const handleBankIssue = (receiver: Player) => {
    if (!currentPlayer) {
      alert("Сначала войдите в игру");
      return;
    }
    // Проверяем, что текущий игрок — создатель (на всякий случай)
    if (currentPlayer.name !== game?.createdBy) {
      alert("Только создатель может выдавать деньги из банка");
      return;
    }
    if (receiver.name === BANK_NAME) {
      alert("Нельзя выдать деньги банку");
      return;
    }
    setSelectedReceiver(receiver);
    setIsBankTransfer(true);
    setShowKeyboard(true);
  };

  const handleTransfer = async () => {
    if (!currentPlayer || !selectedReceiver) return;
    if (amount <= 0) {
      alert("Введите сумму больше 0");
      return;
    }

    // Дополнительная проверка для режима банка
    if (isBankTransfer && currentPlayer.name !== game?.createdBy) {
      alert("Только создатель может выдавать деньги из банка");
      return;
    }

    // Определяем отправителя
    let fromId: string;
    if (isBankTransfer) {
      const bank = game?.players.find((p) => p.name === BANK_NAME);
      if (!bank) {
        alert("Банк не найден");
        return;
      }
      fromId = bank._id;
    } else {
      fromId = currentPlayer._id;
    }

    try {
      const res = await fetch(`/api/games/${id}/transactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromPlayerId: fromId,
          toPlayerId: selectedReceiver._id,
          amount,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setShowKeyboard(false);
        setAmount(0);
        // Обновить данные
        const gameRes = await fetch(`/api/games/${id}`);
        setGame(await gameRes.json());
        const txRes = await fetch(`/api/games/${id}/transactions`);
        setTransactions(await txRes.json());
      } else {
        alert(`Ошибка: ${data.error || "Transfer failed"}`);
      }
    } catch (error) {
      alert("Сетевая ошибка");
    }
  };

  if (loading) return <div className="p-4">{t("loading")}</div>;
  if (!game) return <div className="p-4">{t("gameNotFound")}</div>;

  return (
    <div className="container mx-auto p-4 max-w-lg">
      <div className="flex border-b mb-4">
        <button
          className={`px-4 py-2 ${activeTab === "balances" ? "border-b-2 border-blue-500" : ""}`}
          onClick={() => setActiveTab("balances")}
        >
          {t("balancesTab")}
        </button>
        <button
          className={`px-4 py-2 ${activeTab === "history" ? "border-b-2 border-blue-500" : ""}`}
          onClick={() => setActiveTab("history")}
        >
          {t("historyTab")}
        </button>
      </div>

      {activeTab === "balances" && (
        <div>
          {currentPlayer && (
            <p className="mb-2 text-gray-600">
              {t("youAre")}{" "}
              <span className="font-bold">{currentPlayer.name}</span> (
              {t("balance")} {currentPlayer.balance})
            </p>
          )}
          <p className="mb-4 text-sm text-gray-500">{t("clickToTransfer")}</p>

          {currentPlayer && (
            <p className="text-sm text-green-600 mb-2">
              {currentPlayer.name === game?.createdBy
                ? t("creatorHint")
                : t("playerHint")}
            </p>
          )}

          <div className="space-y-2">
            {[...game.players]
              .sort((a, b) => {
                if (a.name === BANK_NAME) return -1;
                if (b.name === BANK_NAME) return 1;
                return a.name.localeCompare(b.name);
              })
              .map((player) => {
                const isCurrent = currentPlayer?._id === player._id;
                const isBank = player.name === BANK_NAME;
                const isCreator = currentPlayer?.name === game?.createdBy;
                const showBankIssue = isCreator && !isBank && !isCurrent;

                return (
                  <div key={player._id} className="flex items-center gap-2">
                    <div
                      className={`
                        flex-1 p-4 border rounded flex justify-between items-center
                        ${isCurrent ? "bg-gray-100 cursor-default" : "bg-white cursor-pointer hover:bg-blue-50"}
                      `}
                      onClick={() => !isCurrent && handlePlayerClick(player)}
                    >
                      <span className="font-medium">{player.name}</span>
                      <span className="font-mono">{player.balance}</span>
                    </div>
                    {showBankIssue && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBankIssue(player);
                        }}
                        className="px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-xl"
                        title={t("issueFromBank")}
                      >
                        💰
                      </button>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {activeTab === "history" && (
        <div>
          <h2 className="text-xl font-semibold mb-2">{t("historyTitle")}</h2>
          {transactions.length === 0 ? (
            <p className="text-gray-500">{t("noTransactions")}</p>
          ) : (
            <ul className="space-y-2">
              {transactions.map((tx) => {
                const from =
                  game.players.find((p) => p._id === tx.fromPlayerId)?.name ||
                  BANK_NAME;
                const to =
                  game.players.find((p) => p._id === tx.toPlayerId)?.name ||
                  BANK_NAME;
                return (
                  <li key={tx._id} className="border p-2 rounded text-sm">
                    {t("from")} {from} → {t("to")} {to}:{" "}
                    <span className="font-mono">{tx.amount}</span>
                    <span className="text-gray-400 text-xs ml-2">
                      {new Date(tx.timestamp).toLocaleTimeString()}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}

      {showKeyboard && selectedReceiver && currentPlayer && (
        <DigitalKeyboard
          value={amount}
          onChange={setAmount}
          onConfirm={handleTransfer}
          onClose={() => {
            setShowKeyboard(false);
            setSelectedReceiver(null);
            setIsBankTransfer(false);
            setAmount(0);
          }}
        />
      )}
    </div>
  );
}
