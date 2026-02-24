import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// ✅ Добавлен async и await для params
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> } // Указываем, что params - это Promise
) {
    try {
        const { id } = await params; // 👈 Ожидаем params
        const client = await clientPromise;
        const db = client.db('monopoly');
        const game = await db.collection('games').findOne({ _id: new ObjectId(id) });
        if (!game) return NextResponse.json({ error: 'Game not found' }, { status: 404 });
        return NextResponse.json(game);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}