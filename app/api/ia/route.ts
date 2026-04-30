import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { question } = await req.json();

    const response = await fetch("https://api.together.xyz/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.TOGETHER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "mistralai/Mixtral-8x7B-Instruct-v0.1",
        messages: [
          {
            role: "user",
            content: question,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    const data = await response.json();

    return NextResponse.json({
      answer: data.choices?.[0]?.message?.content || "Erreur IA",
    });

  } catch (error) {
    return NextResponse.json({ answer: "Erreur serveur IA" });
  }
}
