import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { getPostHogClient } from '@/lib/posthog-server';

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> } // 👈 Тип как Promise
) {
    try {
        const { id } = await params; // 👈 Ожидаем
        const { name } = await req.json();
        if (!name) return NextResponse.json({ error: 'Name required' }, { status: 400 });

        const client = await clientPromise;
        const db = client.db('monopoly');
        const games = db.collection('games');
        const gameId = new ObjectId(id);

        // ... остальной код без изменений
        const game = await games.findOne({ _id: gameId });
        if (!game) return NextResponse.json({ error: 'Game not found' }, { status: 404 });

        if (game.players.some((p: any) => p.name.toLowerCase() === name.toLowerCase())) {
            return NextResponse.json({ error: 'Player with that name already exists' }, { status: 400 });
        }

        const newPlayer = { _id: new ObjectId(), name, balance: game.initialBalance };
        await games.updateOne({ _id: gameId }, { $push: { players: newPlayer } } as any);

        const posthog = getPostHogClient();
        posthog.capture({
            distinctId: name,
            event: 'player_joined_server',
            properties: {
                game_id: id,
                player_name: name,
                initial_balance: game.initialBalance,
                created_by: game.createdBy,
            },
        });
        await posthog.shutdown();

        return NextResponse.json({ player: newPlayer }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}