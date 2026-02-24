'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateGame() {
    const [createdBy, setCreatedBy] = useState('');
    const [initialBalance, setInitialBalance] = useState(1500);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('/api/games', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ createdBy, initialBalance }),
            });
            const data = await res.json();
            if (res.ok) {
                // ✅ Сохраняем имя для этого gameId
                localStorage.setItem(`player_${data.gameId}`, createdBy);
                router.push(`/game/${data.gameId}`);
            } else alert(data.error || 'Failed to create game');
        } catch (error) {
            alert('Error creating game');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-4 max-w-md">
            <h1 className="text-2xl font-bold mb-4">Создать игру</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block mb-1">Ваше имя</label>
                    <input type="text" value={createdBy} onChange={(e) => setCreatedBy(e.target.value)} required className="w-full border p-2 rounded" />
                </div>
                <div>
                    <label className="block mb-1">Начальный баланс игроков</label>
                    <input type="number" value={initialBalance} onChange={(e) => setInitialBalance(Number(e.target.value))} required min={1} className="w-full border p-2 rounded" />
                </div>
                <button type="submit" disabled={loading} className="w-full bg-blue-500 text-white p-3 rounded disabled:bg-gray-400">
                    {loading ? 'Создание...' : 'Создать'}
                </button>
            </form>
        </div>
    );
}