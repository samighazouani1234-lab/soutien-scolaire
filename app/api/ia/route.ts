import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const apiKey = process.env.TOGETHER_API_KEY;

    if (!apiKey) {
      return NextResponse.json({
        content: "Erreur : clé API manquante.",
      });
    }

    const { matiere, niveau, chapitre } = await req.json();

    const prompt = `
Cours scolaire clair et structuré.

Matière: ${matiere}
Niveau: ${niveau}
Chapitre: ${chapitre}

Structure:
### INTRODUCTION
### COURS
### EXEMPLES
### A_RETENIR
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
        max_tokens: 1500,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      return NextResponse.json({
        content: "Erreur API Together",
      });
    }

    return NextResponse.json({
      content: result.choices?.[0]?.message?.content || "Erreur génération",
    });

  } catch {
    return NextResponse.json({
      content: "Erreur serveur",
    });
  }
}
