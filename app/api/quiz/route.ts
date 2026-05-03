import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const apiKey = process.env.TOGETHER_API_KEY;

    if (!apiKey) {
      return NextResponse.json({
        error: "TOGETHER_API_KEY manquante dans Vercel."
      });
    }

    const { matiere, niveau, chapitre, courseText, count = 10 } = await req.json();

    const source = courseText && String(courseText).trim().length > 80
      ? `Cours source à respecter :\n${String(courseText).slice(0, 9000)}`
      : `Crée le quiz précisément sur le chapitre ${chapitre}.`;

    const prompt = `
Tu es un professeur expert.

Matière : ${matiere}
Niveau : ${niveau}
Chapitre : ${chapitre}

${source}

Réponds uniquement en JSON valide, sans markdown, sans texte avant ni après.

Format exact :
{
  "title": "Quiz - ${chapitre}",
  "questions": [
    {
      "question": "Question précise et scolaire",
      "choices": ["Choix A", "Choix B", "Choix C", "Choix D"],
      "answer": 0,
      "explanation": "Correction courte et claire",
      "difficulty": "facile"
    }
  ]
}

Règles :
- ${count} questions
- 4 choix par question
- answer est un nombre entre 0 et 3
- pas de question générique
- questions adaptées au niveau ${niveau}
- difficultés progressives : facile, moyen, difficile, expert
`;

    const response = await fetch("https://api.together.xyz/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "meta-llama/Llama-3.3-70B-Instruct-Turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.45,
        max_tokens: 2600
      })
    });

    const result = await response.json();

    if (!response.ok) {
      return NextResponse.json({
        error: result?.error?.message || "Erreur Together API."
      });
    }

    const text = result.choices?.[0]?.message?.content || "";
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");

    if (start === -1 || end === -1) {
      return NextResponse.json({ error: "Réponse IA invalide." });
    }

    const clean = text.slice(start, end + 1);
    const parsed = JSON.parse(clean);

    if (!Array.isArray(parsed.questions) || parsed.questions.length === 0) {
      return NextResponse.json({ error: "Quiz IA invalide." });
    }

    return NextResponse.json(parsed);
  } catch {
    return NextResponse.json({
      error: "Erreur génération quiz."
    });
  }
}
