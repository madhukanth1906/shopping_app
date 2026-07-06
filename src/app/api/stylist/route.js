import { NextResponse } from 'next/server';
import { databases, DATABASE_ID, PRODUCTS_COLLECTION_ID } from '@/lib/appwrite';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

export async function POST(req) {
  try {
    const { messages } = await req.json();

    // Fetch all products to give context to the AI
    const response = await databases.listDocuments(DATABASE_ID, PRODUCTS_COLLECTION_ID);
    const productsContext = response.documents.map(p => 
      `ID: ${p.$id}, Name: ${p.name}, Category: ${p.category}, Price: ${p.price}, Desc: ${p.description}`
    ).join('\n');

    const systemPrompt = `You are a VIP Personal Stylist for a premium women's fashion boutique called Azhagii.
Your goal is to recommend the absolute perfect dress based on the user's needs (occasion, body type, color preferences).
You MUST ONLY recommend products from the following catalog. Do not make up products. If nothing fits perfectly, recommend the closest match.
Keep your responses elegant, concise, and luxurious. Include the Product Name and Price in your recommendation.

CATALOG:
${productsContext}`;

    const apiMessages = [
      { role: "system", content: systemPrompt },
      ...messages
    ];

    const orRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "google/gemma-2-9b-it:free",
        messages: apiMessages,
      })
    });

    const data = await orRes.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("AI Stylist Error:", error);
    return NextResponse.json({ error: "Failed to connect to the stylist." }, { status: 500 });
  }
}
