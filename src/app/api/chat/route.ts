import { NextResponse } from "next/server";

const GROQ_API_KEY = process.env.GROQ_API_KEY || (process.env.OPENAI_API_KEY?.startsWith('gsk_') ? process.env.OPENAI_API_KEY : undefined);

const SYSTEM_PROMPT = `You are AgriLens AI, an expert agricultural assistant specializing in crop health, precision farming, soil analysis, and agronomy. 
You provide concise, professional, and highly intelligent answers to farmers and agronomists based on satellite and drone telemetry data. 
Keep your responses relatively brief (1-3 paragraphs) as they will be displayed in a dashboard widget. Do not use markdown headers, just bolding for emphasis.`;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid messages format" }, { status: 400 });
    }

    const payload = {
      model: "llama-3.1-8b-instant", // Updated from deprecated model
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...messages
      ],
      temperature: 0.7,
      max_tokens: 1024,
    };

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Groq API Error:", errorText);
      return NextResponse.json({ error: "Failed to communicate with Groq API" }, { status: 500 });
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error("Chat API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
