import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { getPostHogClient } from "@/lib/posthog-server";

export async function POST(req: NextRequest) {
  try {
    const {
      createdBy,
      initialBalance,
      bankBalance = 1000000,
    } = await req.json();
    if (!createdBy || !initialBalance) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }
    const client = await clientPromise;
    const db = client.db("monopoly");
    const games = db.collection("games");

    const game = {
      createdBy,
      initialBalance: Number(initialBalance),
      players: [
        {
          _id: new ObjectId(),
          name: createdBy,
          balance: Number(initialBalance),
        }, // 👈 создатель
        { _id: new ObjectId(), name: "Bank", balance: Number(bankBalance) },
      ],
      createdAt: new Date(),
    };
    const result = await games.insertOne(game);

    const posthog = getPostHogClient();
    posthog.capture({
      distinctId: createdBy,
      event: "game_created_server",
      properties: {
        game_id: result.insertedId.toString(),
        created_by: createdBy,
        initial_balance: Number(initialBalance),
        bank_balance: Number(bankBalance),
      },
    });
    await posthog.shutdown();

    return NextResponse.json({ gameId: result.insertedId }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
