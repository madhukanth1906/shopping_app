import { NextResponse } from 'next/server';
import { databases, DATABASE_ID, PRODUCTS_COLLECTION_ID } from '@/lib/appwrite';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export async function POST(req) {
  try {
    let body;
    try {
      body = await req.json();
    } catch (e) {
      body = { messages: [] };
    }
    const { messages = [] } = body;

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

    // Convert standard messages to Gemini format
    const geminiMessages = messages.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content || "..." }]
    }));

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    const geminiRes = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: geminiMessages
      })
    });

    const data = await geminiRes.json();
    console.log("GEMINI RAW RESPONSE:", JSON.stringify(data, null, 2));
    
    // Map back to OpenAI format expected by frontend
    const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I am having trouble finding a recommendation right now.";
    
    return NextResponse.json({
      choices: [
        {
          message: {
            role: "assistant",
            content: aiText
          }
        }
      ]
    });
  } catch (error) {
    console.error("AI Stylist Error:", error);
    return NextResponse.json({ error: "Failed to connect to the stylist." }, { status: 500 });
  }
}
