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
        model: "meta-llama/Llama-3.3-70B-Instruct-Turbo",
        messages: [
          {
            role: "system",
            content: `
Tu es un professeur de soutien scolaire en France.

Tu dois toujours répondre avec cette structure :

1. 📘 COURS DÉTAILLÉ
- Explication claire
- Définitions
- Méthode

2. ✏️ EXERCICES
- 3 exercices (facile, moyen, difficile)

3. ✅ CORRECTIONS
- Corriger chaque exercice

4. 🎓 ÉVALUATION
- 4 questions

5. 📊 BARÈME SUR 10

Style simple, pédagogique, niveau collège/lycée.
`,
          },
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
      answer:
        data.choices?.[0]?.message?.content ||
        data.error?.message ||
        "Erreur IA",
    });

  } catch (error) {
    return NextResponse.json(
      { answer: "Erreur serveur IA." },
      { status: 500 }
    );
  }
}
