import { NextResponse } from "next/server";

const MODEL =
  process.env.TOGETHER_MODEL || "meta-llama/Llama-3.3-70B-Instruct-Turbo";

export async function POST(req: Request) {
  try {
    const apiKey = process.env.TOGETHER_API_KEY;

    const {
      matiere = "Mathématiques",
      niveau = "Terminale",
      chapitre = "Limites",
      courseText = "",
      count = 12,
    } = await req.json();

    if (!apiKey) {
      return NextResponse.json(localHardQuiz(matiere, niveau, chapitre));
    }

    const source =
      courseText && String(courseText).trim().length > 100
        ? `Cours source à respecter :\n${String(courseText).slice(0, 10000)}`
        : `Le quiz doit porter précisément sur ${chapitre}, niveau ${niveau}.`;

    const prompt = `
Tu es un professeur exigeant.

Crée un quiz DIFFICILE et adapté au niveau ${niveau}.

Matière : ${matiere}
Chapitre : ${chapitre}

${source}

Réponds uniquement en JSON valide.

Format exact :
{
  "title": "Quiz avancé - ${chapitre}",
  "questions": [
    {
      "question": "Question précise, non triviale",
      "choices": ["Choix A", "Choix B", "Choix C", "Choix D"],
      "answer": 0,
      "explanation": "Correction détaillée mais concise",
      "difficulty": "difficile"
    }
  ]
}

Règles :
- ${count} questions.
- Niveau sérieux, adapté à ${niveau}.
- Pas de questions évidentes.
- Pas de question générique du type “que faut-il faire en premier”.
- Inclure des questions de raisonnement.
- Inclure des questions de pièges classiques.
- Inclure des questions d'application numérique ou symbolique si la matière s'y prête.
- 4 choix par question.
- answer est un nombre entre 0 et 3.
- Difficultés : moyen, difficile, expert.
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
        temperature: 0.35,
        max_tokens: 3200,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("Together Quiz error:", result);
      return NextResponse.json(localHardQuiz(matiere, niveau, chapitre));
    }

    const text = result?.choices?.[0]?.message?.content || "";
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");

    if (start === -1 || end === -1) {
      return NextResponse.json(localHardQuiz(matiere, niveau, chapitre));
    }

    const parsed = JSON.parse(text.slice(start, end + 1));

    if (!Array.isArray(parsed.questions) || parsed.questions.length === 0) {
      return NextResponse.json(localHardQuiz(matiere, niveau, chapitre));
    }

    return NextResponse.json(parsed);
  } catch {
    return NextResponse.json(localHardQuiz());
  }
}

function localHardQuiz(
  matiere = "Mathématiques",
  niveau = "Terminale",
  chapitre = "Limites"
) {
  return {
    title: `Quiz avancé - ${chapitre}`,
    questions: [
      {
        question: `Dans un exercice avancé sur ${chapitre}, pourquoi doit-on vérifier les conditions d'application d'une propriété ?`,
        choices: [
          "Parce qu'une propriété peut être fausse hors de ses hypothèses",
          "Parce que cela remplace tous les calculs",
          "Parce que la conclusion devient inutile",
          "Parce que les exemples suffisent toujours"
        ],
        answer: 0,
        explanation:
          "Une propriété mathématique, physique ou chimique n'est valable que dans un cadre précis. Vérifier les conditions évite une application incorrecte.",
        difficulty: "difficile"
      },
      {
        question: `Quelle erreur est la plus grave au niveau ${niveau} dans le chapitre ${chapitre} ?`,
        choices: [
          "Rédiger une conclusion",
          "Appliquer une formule sans justification",
          "Écrire les données",
          "Faire un schéma"
        ],
        answer: 1,
        explanation:
          "Au niveau demandé, l'application d'une formule doit être justifiée par les conditions du problème.",
        difficulty: "difficile"
      },
      {
        question: "Dans une correction détaillée, quel élément distingue une réponse solide d'une réponse incomplète ?",
        choices: [
          "La présence d'un raisonnement justifié",
          "La longueur uniquement",
          "L'absence de calcul",
          "Le hasard"
        ],
        answer: 0,
        explanation:
          "Une réponse solide explique la méthode, justifie les étapes et conclut clairement.",
        difficulty: "expert"
      }
    ]
  };
}
