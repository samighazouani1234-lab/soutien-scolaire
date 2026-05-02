import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const apiKey = process.env.TOGETHER_API_KEY;

    const { chapitre } = await req.json();

    const prompt = `
Génère 5 questions QCM sur le chapitre: ${chapitre}.

Format STRICT JSON:
[
  {
    "question": "...",
    "options": ["A", "B", "C", "D"],
    "answer": "bonne réponse exacte"
  }
]
`;

    const response = await fetch("https://api.together.xyz/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "meta-llama/Llama-3.3-70B-Instruct-Turbo-Free",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 800,
      }),
    });

    const result = await response.json();

    return NextResponse.json({
      quiz: result.choices?.[0]?.message?.content || "[]",
    });

  } catch {
    return NextResponse.json({
      quiz: "[]",
    });
  }
}
