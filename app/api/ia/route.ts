import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const apiKey = process.env.TOGETHER_API_KEY;

    if (!apiKey) {
      return NextResponse.json({
        title: "Quiz local",
        questions: fallbackQuiz(),
      });
    }

    const { matiere, niveau, chapitre, count = 10 } = await req.json();

    const prompt = `
Génère un quiz scolaire en français.

Matière : ${matiere}
Niveau : ${niveau}
Chapitre : ${chapitre}

Réponds UNIQUEMENT avec un JSON valide.
Aucun texte avant ou après.

Format exact :
{
  "title": "Quiz sur ${chapitre}",
  "questions": [
    {
      "question": "Question claire",
      "choices": ["Choix A", "Choix B", "Choix C", "Choix D"],
      "answer": 0,
      "explanation": "Correction courte",
      "difficulty": "facile"
    }
  ]
}

Règles :
- ${count} questions
- 4 choix par question
- answer est un nombre entre 0 et 3
- niveau progressif
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
        temperature: 0.6,
        max_tokens: 2200,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      return NextResponse.json({
        title: "Quiz local",
        questions: fallbackQuiz(),
      });
    }

    const text = result.choices?.[0]?.message?.content || "";
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");

    if (start === -1 || end === -1) {
      return NextResponse.json({
        title: "Quiz local",
        questions: fallbackQuiz(),
      });
    }

    const clean = text.slice(start, end + 1);
    const parsed = JSON.parse(clean);

    if (!parsed.questions || !Array.isArray(parsed.questions)) {
      return NextResponse.json({
        title: "Quiz local",
        questions: fallbackQuiz(),
      });
    }

    return NextResponse.json(parsed);
  } catch {
    return NextResponse.json({
      title: "Quiz local",
      questions: fallbackQuiz(),
    });
  }
}

function fallbackQuiz() {
  return [
    {
      question: "Que mesure une force en physique ?",
      choices: ["Une masse", "Une interaction", "Une température", "Une vitesse"],
      answer: 1,
      explanation: "Une force modélise une interaction entre deux systèmes.",
      difficulty: "facile",
    },
    {
      question: "Quelle est l’unité de la force ?",
      choices: ["Joule", "Newton", "Watt", "Pascal"],
      answer: 1,
      explanation: "L’unité de la force est le newton, noté N.",
      difficulty: "facile",
    },
    {
      question: "Quelle relation correspond à la deuxième loi de Newton ?",
      choices: ["P = mg", "F = ma", "E = mc²", "U = RI"],
      answer: 1,
      explanation: "La deuxième loi de Newton s’écrit généralement F = m × a.",
      difficulty: "moyen",
    },
  ];
}
