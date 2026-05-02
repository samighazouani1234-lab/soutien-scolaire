import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const apiKey = process.env.TOGETHER_API_KEY;
    const { matiere, niveau, chapitre, count = 10 } = await req.json();

    if (!apiKey) return NextResponse.json({ title: `Quiz - ${chapitre}`, questions: fallbackQuiz(chapitre) });

    const prompt = `
Crée un quiz UNIQUEMENT sur ce chapitre :
Matière : ${matiere}
Niveau : ${niveau}
Chapitre : ${chapitre}

Réponds uniquement en JSON valide, sans markdown, sans texte autour.
Format exact :
{
  "title": "Quiz - ${chapitre}",
  "questions": [
    {
      "question": "Question liée précisément au chapitre ${chapitre}",
      "choices": ["Choix A", "Choix B", "Choix C", "Choix D"],
      "answer": 0,
      "explanation": "Correction courte liée au chapitre",
      "difficulty": "facile"
    }
  ]
}
Règles : ${count} questions, 4 choix, answer entre 0 et 3, difficultés progressives.
`;

    const response = await fetch("https://api.together.xyz/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "mistralai/Mistral-7B-Instruct-v0.2",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.5,
        max_tokens: 2600,
      }),
    });

    const result = await response.json();
    if (!response.ok) return NextResponse.json({ title: `Quiz - ${chapitre}`, questions: fallbackQuiz(chapitre) });

    const text = result.choices?.[0]?.message?.content || "";
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start === -1 || end === -1) return NextResponse.json({ title: `Quiz - ${chapitre}`, questions: fallbackQuiz(chapitre) });

    const parsed = JSON.parse(text.slice(start, end + 1));
    if (!Array.isArray(parsed.questions)) return NextResponse.json({ title: `Quiz - ${chapitre}`, questions: fallbackQuiz(chapitre) });

    return NextResponse.json(parsed);
  } catch {
    return NextResponse.json({ title: "Quiz local", questions: fallbackQuiz() });
  }
}

function fallbackQuiz(chapitre = "le chapitre") {
  return [
    {
      question: `Quelle est la première étape pour comprendre ${chapitre} ?`,
      choices: ["Lire les définitions", "Deviner", "Sauter les exemples", "Ignorer la méthode"],
      answer: 0,
      explanation: "On commence par les définitions et les propriétés du chapitre.",
      difficulty: "facile",
    },
    {
      question: `Pourquoi faire des exercices sur ${chapitre} ?`,
      choices: ["Pour éviter le cours", "Pour appliquer la méthode", "Pour deviner", "Pour ne pas corriger"],
      answer: 1,
      explanation: "Les exercices permettent d’appliquer la méthode et de vérifier la compréhension.",
      difficulty: "moyen",
    },
    {
      question: `Quel réflexe adopter face à un exercice sur ${chapitre} ?`,
      choices: ["Identifier la méthode", "Répondre au hasard", "Ignorer les données", "Changer de chapitre"],
      answer: 0,
      explanation: "Il faut d’abord reconnaître la méthode utile avant de rédiger.",
      difficulty: "difficile",
    }
  ];
}
