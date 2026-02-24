'use client';

import {useState, useEffect} from 'react';
import {useParams, useRouter} from 'next/navigation';
import DigitalKeyboard from '@/components/DigitalKeyboard';


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
    const {id} = useParams();
    const [game, setGame] = useState<Game | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
    const [selectedReceiver, setSelectedReceiver] = useState<Player | null>(null); // кто будет получателем
    const [showKeyboard, setShowKeyboard] = useState(false);
    const [amount, setAmount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'balances' | 'history'>('balances');
    const [isBankTransfer, setIsBankTransfer] = useState(false);

    const router = useRouter();

    // Загрузка игры
    useEffect(() => {
        if (!id) return;
        const fetchGame = async () => {
            try {
                const res = await fetch(`/api/games/${id}`);
                const data = await res.json();
                setGame(data);


                const savedName = localStorage.getItem(`player_${id}`);
                if (savedName) {
                    const player = data.players.find((p: Player) => p.name === savedName);
                    if (player) {
                        setCurrentPlayer(player);
                    } else {
                        // Имя есть в localStorage, но игрок не найден в игре (возможно, удалили или переименовали)
                        // В таком случае лучше перенаправить на страницу присоединения
                        router.push(`/game/${id}/join`);
                    }
                } else {
                    // Нет сохранённого имени — редирект на страницу ввода
                    router.push(`/game/${id}/join`);
                }
            } catch (error) {
                console.error('Failed to fetch game', error);
            } finally {
                setLoading(false);
            }
        };
        fetchGame();
        const interval = setInterval(fetchGame, 5000);
        return () => clearInterval(interval);
    }, [id]);

    // Загрузка истории
    useEffect(() => {
        if (!id) return;
        const fetchTransactions = async () => {
            try {
                const res = await fetch(`/api/games/${id}/transactions`);
                setTransactions(await res.json());
            } catch (error) {
                console.error('Failed to fetch transactions', error);
            }
        };
        fetchTransactions();
        const interval = setInterval(fetchTransactions, 5000);
        return () => clearInterval(interval);
    }, [id]);


    // Обработчик для обычного перевода (от себя к другому игроку/банку)
    const handlePlayerClick = (receiver: Player) => {
        if (!currentPlayer) {
            alert('Сначала войдите в игру');
            return;
        }
        if (receiver._id === currentPlayer._id) {
            alert('Нельзя перевести деньги самому себе');
            return;
        }
        setSelectedReceiver(receiver);
        setIsBankTransfer(false);
        setShowKeyboard(true);
    };

// Обработчик для выдачи из банка (от банка к игроку)
    const handleBankIssue = (receiver: Player) => {
        if (!currentPlayer) {
            alert('Сначала войдите в игру');
            return;
        }
        // Проверяем, что текущий игрок — создатель (на всякий случай)
        if (currentPlayer.name !== game?.createdBy) {
            alert('Только создатель может выдавать деньги из банка');
            return;
        }
        if (receiver.name === 'Банк') {
            alert('Нельзя выдать деньги банку');
            return;
        }
        setSelectedReceiver(receiver);
        setIsBankTransfer(true);
        setShowKeyboard(true);
    };

    const handleTransfer = async () => {
        if (!currentPlayer || !selectedReceiver) return;
        if (amount <= 0) {
            alert('Введите сумму больше 0');
            return;
        }

        // Дополнительная проверка для режима банка
        if (isBankTransfer && currentPlayer.name !== game?.createdBy) {
            alert('Только создатель может выдавать деньги из банка');
            return;
        }

        // Определяем отправителя
        let fromId: string;
        if (isBankTransfer) {
            const bank = game?.players.find(p => p.name === 'Банк');
            if (!bank) {
                alert('Банк не найден');
                return;
            }
            fromId = bank._id;
        } else {
            fromId = currentPlayer._id;
        }

        try {
            const res = await fetch(`/api/games/${id}/transactions`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
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
                alert(`Ошибка: ${data.error || 'Transfer failed'}`);
            }
        } catch (error) {
            alert('Сетевая ошибка');
        }
    };

    if (loading) return <div className="p-4">Загрузка...</div>;
    if (!game) return <div className="p-4">Игра не найдена</div>;

    return (
        <div className="container mx-auto p-4 max-w-lg">
            <h1 className="text-2xl font-bold mb-4">Монополия Банк</h1>

            {/* Вкладки */}
            <div className="flex border-b mb-4">
                <button
                    className={`px-4 py-2 ${activeTab === 'balances' ? 'border-b-2 border-blue-500' : ''}`}
                    onClick={() => setActiveTab('balances')}
                >
                    Остатки
                </button>
                <button
                    className={`px-4 py-2 ${activeTab === 'history' ? 'border-b-2 border-blue-500' : ''}`}
                    onClick={() => setActiveTab('history')}
                >
                    История
                </button>
            </div>

            {/* Вкладка с балансами */}
            {activeTab === 'balances' && (
                <div>
                    {currentPlayer && (
                        <p className="mb-2 text-gray-600">
                            Вы: <span className="font-bold">{currentPlayer.name}</span> (баланс: {currentPlayer.balance})
                        </p>
                    )}
                    <p className="mb-1 text-sm text-gray-500">
                        👆 Нажмите на игрока, чтобы перевести ему от себя
                    </p>

                    {/* Определяем, является ли текущий игрок создателем */}
                    {currentPlayer && (
                        <p className="text-sm text-green-600 mb-2">
                            {currentPlayer.name === game?.createdBy
                                ? '🔑 Вы создатель. Зелёная кнопка 💰 выдает деньги из банка.'
                                : '👤 Вы обычный игрок. Переводы только от себя.'}
                        </p>
                    )}

                    <div className="space-y-2">
                        {[...game.players]
                            .sort((a, b) => {
                                // Банк всегда первый
                                if (a.name === 'Банк') return -1;
                                if (b.name === 'Банк') return 1;
                                // Остальные игроки можно сортировать по имени (опционально)
                                return a.name.localeCompare(b.name);
                            })
                            .map((player) => {
                                // ... остальная логика для каждого игрока
                                const isCurrent = currentPlayer?._id === player._id;
                                const isBank = player.name === 'Банк';
                                const isCreator = currentPlayer?.name === game?.createdBy;
                                const showBankIssue = isCreator && !isBank && !isCurrent;

                                return (
                                    <div key={player._id} className="flex items-center gap-2">
                                        {/* Карточка игрока */}
                                        <div
                                            className={`
              flex-1 p-4 border rounded flex justify-between items-center
              ${isCurrent ? 'bg-gray-100 cursor-default' : 'bg-white cursor-pointer hover:bg-blue-50'}
            `}
                                            onClick={() => !isCurrent && handlePlayerClick(player)}
                                        >
                                            <span className="font-medium">{player.name}</span>
                                            <span className="font-mono">{player.balance}</span>
                                        </div>

                                        {/* Кнопка выдачи из банка (только для создателя) */}
                                        {showBankIssue && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleBankIssue(player);
                                                }}
                                                className="px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-xl"
                                                title="Выдать из банка"
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

            {/* Вкладка с историей */}
            {activeTab === 'history' && (
                <div>
                    <h2 className="text-xl font-semibold mb-2">История переводов</h2>
                    {transactions.length === 0 ? (
                        <p className="text-gray-500">Пока нет транзакций</p>
                    ) : (
                        <ul className="space-y-2">
                            {transactions.map((tx) => {
                                const from = game.players.find((p) => p._id === tx.fromPlayerId)?.name || 'Банк';
                                const to = game.players.find((p) => p._id === tx.toPlayerId)?.name || 'Банк';
                                return (
                                    <li key={tx._id} className="border p-2 rounded text-sm">
                                        {from} → {to}: <span className="font-mono">{tx.amount}</span> ₽
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

            {/* Цифровая клавиатура (открывается при клике на получателя) */}
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