import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const apiKey = process.env.TOGETHER_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Clé Together manquante" });
    }

    const { matiere, niveau, chapitre, mode } = await req.json();

    const prompt = `
Crée un quiz scolaire en français.

Matière: ${matiere}
Niveau: ${niveau}
Chapitre: ${chapitre}
Mode: ${mode === "evaluation" ? "évaluation finale" : "quiz d'entraînement"}

Réponds UNIQUEMENT en JSON valide, sans texte autour.

Format exact:
{
  "title": "Titre du quiz",
  "questions": [
    {
      "question": "Question ici",
      "choices": ["A", "B", "C", "D"],
      "answer": 0,
      "explanation": "Correction courte et claire"
    }
  ]
}

Nombre de questions: ${mode === "evaluation" ? 10 : 6}
Niveau progressif.
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
        temperature: 0.9,
        max_tokens: 2200,
      }),
    });

    const result = await response.json();
    const text = result.choices?.[0]?.message?.content || "";

    const jsonStart = text.indexOf("{");
    const jsonEnd = text.lastIndexOf("}");
    const clean = text.slice(jsonStart, jsonEnd + 1);

    return NextResponse.json(JSON.parse(clean));
  } catch {
    return NextResponse.json({ error: "Erreur génération quiz" });
  }
}
