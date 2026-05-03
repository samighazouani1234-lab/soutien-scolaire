import { NextResponse } from "next/server";

const MODEL =
  process.env.TOGETHER_MODEL || "meta-llama/Llama-3.3-70B-Instruct-Turbo";

export async function POST(req: Request) {
  try {
    const apiKey = process.env.TOGETHER_API_KEY;
    const { matiere, niveau, chapitre, courseText, count = 10 } = await req.json();

    if (!apiKey) {
      return NextResponse.json(localQuiz(matiere, niveau, chapitre));
    }

    const source =
      courseText && String(courseText).trim().length > 80
        ? `Cours source à respecter :\n${String(courseText).slice(0, 9000)}`
        : `Crée le quiz précisément sur le chapitre ${chapitre}.`;

    const prompt = `
Tu es un professeur expert.

Matière : ${matiere}
Niveau : ${niveau}
Chapitre : ${chapitre}

${source}

Réponds uniquement en JSON valide, sans markdown, sans texte avant/après.

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
- ${count} questions.
- 4 choix par question.
- answer est un nombre entre 0 et 3.
- questions adaptées au niveau ${niveau}.
- difficultés progressives : facile, moyen, difficile, expert.
- évite les questions génériques.
- si un cours source existe, le quiz doit s’appuyer dessus.
`;

    const response = await fetch("https://api.together.xyz/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.45,
        max_tokens: 2800,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      return NextResponse.json(localQuiz(matiere, niveau, chapitre));
    }

    const text = result?.choices?.[0]?.message?.content || "";
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");

    if (start === -1 || end === -1) {
      return NextResponse.json(localQuiz(matiere, niveau, chapitre));
    }

    const parsed = JSON.parse(text.slice(start, end + 1));

    if (!Array.isArray(parsed.questions) || parsed.questions.length === 0) {
      return NextResponse.json(localQuiz(matiere, niveau, chapitre));
    }

    return NextResponse.json(parsed);
  } catch {
    return NextResponse.json(localQuiz("Mathématiques", "Terminale", "Limites"));
  }
}

function localQuiz(matiere = "Mathématiques", niveau = "Terminale", chapitre = "Limites") {
  return {
    title: `Quiz - ${chapitre}`,
    questions: [
      {
        question: `Dans le chapitre "${chapitre}", que faut-il faire en premier face à un exercice ?`,
        choices: [
          "Identifier les données et la méthode",
          "Répondre au hasard",
          "Ignorer l’énoncé",
          "Écrire uniquement le résultat"
        ],
        answer: 0,
        explanation: "On commence par analyser l’énoncé, les données et la méthode à utiliser.",
        difficulty: "facile"
      },
      {
        question: "Quelle stratégie permet de progresser durablement ?",
        choices: [
          "Lire sans s’entraîner",
          "Comprendre, pratiquer, corriger",
          "Copier les réponses",
          "Éviter les exercices difficiles"
        ],
        answer: 1,
        explanation: "La progression vient de l’entraînement et de la correction des erreurs.",
        difficulty: "moyen"
      },
      {
        question: `Pourquoi les exemples corrigés sont-ils utiles en ${matiere} ?`,
        choices: [
          "Ils montrent la méthode de résolution",
          "Ils remplacent le cours",
          "Ils évitent de réfléchir",
          "Ils servent uniquement à décorer"
        ],
        answer: 0,
        explanation: "Un exemple corrigé montre comment appliquer la méthode pas à pas.",
        difficulty: "moyen"
      }
    ]
  };
}
