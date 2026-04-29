import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { question } = await req.json();

    if (!question) {
      return NextResponse.json({ answer: "Question manquante." });
    }

    const res = await fetch("https://api.together.xyz/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.TOGETHER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "meta-llama/Llama-3.3-70B-Instruct-Turbo",
        messages: [
          {
            role: "system",
            content:
              "Tu es un excellent professeur français. Tu crées des cours complets avec exercices et corrections.",
          },
          {
            role: "user",
            content: question,
          },
        ],
        temperature: 0.7,
        max_tokens: 3000,
      }),
    });

    const data = await res.json();

    return NextResponse.json({
      answer: data?.choices?.[0]?.message?.content || "Erreur IA",
    });

  } catch {
    return NextResponse.json({
      answer: "Erreur serveur",
    });
  }
}
