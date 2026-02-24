import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// GET
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> } // 👈
) {
    try {
        const { id } = await params; // 👈
        const client = await clientPromise;
        const db = client.db('monopoly');
        const txns = await db
            .collection('transactions')
            .find({ gameId: new ObjectId(id) })
            .sort({ timestamp: -1 })
            .toArray();
        return NextResponse.json(txns);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> } // 👈
) {
    try {
        const { id } = await params; // 👈
        const { fromPlayerId, toPlayerId, amount } = await req.json();
        if (!fromPlayerId || !toPlayerId || amount <= 0) {
            return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db('monopoly');
        const gameId = new ObjectId(id);
        const fromId = new ObjectId(fromPlayerId);
        const toId = new ObjectId(toPlayerId);

        // Атомарное обновление балансов двух игроков
        const result = await db.collection('games').updateOne(
            { _id: gameId },
            {
                $inc: {
                    'players.$[from].balance': -amount,
                    'players.$[to].balance': amount,
                },
            },
            {
                arrayFilters: [{ 'from._id': fromId }, { 'to._id': toId }],
            }
        );

        if (result.modifiedCount !== 1) {
            console.log('Update failed: modifiedCount =', result.modifiedCount);
            return NextResponse.json({ error: 'Transfer failed (players not found or same)' }, { status: 400 });
        }

        // Запись в историю
        await db.collection('transactions').insertOne({
            gameId,
            fromPlayerId: fromId,
            toPlayerId: toId,
            amount,
            timestamp: new Date(),
        });

        return NextResponse.json({ success: true }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}