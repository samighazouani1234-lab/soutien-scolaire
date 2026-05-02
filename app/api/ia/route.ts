import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const apiKey = process.env.TOGETHER_API_KEY;
    if (!apiKey) return NextResponse.json({ content: "Erreur : TOGETHER_API_KEY manquante dans Vercel." });

    const { matiere, niveau, chapitre } = await req.json();

    const prompt = `
Crée un cours scolaire premium en français.
Matière : ${matiere}
Niveau : ${niveau}
Chapitre : ${chapitre}

Réponds avec ces séparateurs EXACTS :
### INTRODUCTION
### OBJECTIFS
### COURS
### DEFINITIONS
### METHODES
### EXEMPLES
### SCHEMA_TEXTE
### A_RETENIR
### VIDEO

Important : ne mets PAS de quiz. Le quiz est généré sur une autre page.
`;

    const response = await fetch("https://api.together.xyz/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "mistralai/Mistral-7B-Instruct-v0.2",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 2500,
      }),
    });

    const result = await response.json();
    if (!response.ok) return NextResponse.json({ content: result?.error?.message || "Erreur Together AI." });

    return NextResponse.json({ content: result.choices?.[0]?.message?.content || "Aucune réponse IA." });
  } catch {
    return NextResponse.json({ content: "Erreur serveur IA." });
  }
}
