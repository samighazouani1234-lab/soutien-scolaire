import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const apiKey = process.env.TOGETHER_API_KEY;

    if (!apiKey) {
      return NextResponse.json({
        answer: "Erreur : clé TOGETHER_API_KEY manquante dans Vercel.",
      });
    }

    const { question } = await req.json();

    if (!question) {
      return NextResponse.json({ answer: "Question manquante." });
    }

    const response = await fetch("https://api.together.xyz/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "meta-llama/Llama-3.3-70B-Instruct-Turbo",
        messages: [
          {
            role: "system",
            content:
              "Tu es un professeur expert français. Tu crées des cours premium, clairs, complets, structurés, avec exercices corrigés.",
          },
          {
            role: "user",
            content: question,
          },
        ],
        temperature: 0.7,
        max_tokens: 3500,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      return NextResponse.json({
        answer: result?.error?.message || "Erreur Together AI.",
      });
    }

    return NextResponse.json({
      answer: result.choices?.[0]?.message?.content || "Aucune réponse IA.",
    });
  } catch {
    return NextResponse.json({
      answer: "Erreur serveur IA.",
    });
  }
}
