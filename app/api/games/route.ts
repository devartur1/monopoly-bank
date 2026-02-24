import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(req: NextRequest) {
    try {
        const { createdBy, initialBalance, bankBalance = 1000000 } = await req.json();
        if (!createdBy || !initialBalance) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }
        const client = await clientPromise;
        const db = client.db('monopoly');
        const games = db.collection('games');

        const game = {
            createdBy,
            initialBalance: Number(initialBalance),
            players: [
                { _id: new ObjectId(), name: createdBy, balance: Number(initialBalance) }, // 👈 создатель
                { _id: new ObjectId(), name: 'Банк', balance: Number(bankBalance) }
            ],
            createdAt: new Date(),
        };
        const result = await games.insertOne(game);
        return NextResponse.json({ gameId: result.insertedId }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}