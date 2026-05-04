import { NextResponse } from "next/server";

export const runtime = "nodejs";

type QuizQuestion = {
  question: string;
  choices: string[];
  answer: number;
  explanation: string;
  difficulty: string;
};

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));

  const matiere = String(body?.matiere || "Mathématiques");
  const niveau = String(body?.niveau || "Terminale");
  const chapitre = String(body?.chapitre || "Limites");

  return NextResponse.json({
    questions: buildQuiz(matiere, niveau, chapitre),
  });
}

export async function GET() {
  return NextResponse.json({ ok: true });
}

function buildQuiz(matiere: string, niveau: string, chapitre: string): QuizQuestion[] {
  const low = chapitre.toLowerCase();

  if (low.includes("dérivation") || low.includes("derivation")) {
    return [
      {
        question: "Quelle est la dérivée de f(x)=x²+3x ?",
        choices: ["2x+3", "x+3", "2x", "x²+3"],
        answer: 0,
        explanation: "On dérive terme à terme : (x²)'=2x et (3x)'=3.",
        difficulty: "Moyen"
      },
      {
        question: "Que représente f'(a) graphiquement ?",
        choices: ["Le coefficient directeur de la tangente", "L’aire sous la courbe", "L’ordonnée à l’origine", "La valeur maximale"],
        answer: 0,
        explanation: "Le nombre dérivé f'(a) est la pente de la tangente à la courbe au point d’abscisse a.",
        difficulty: "Moyen"
      },
      {
        question: "Si f'(x)<0 sur un intervalle, alors f est :",
        choices: ["Décroissante", "Croissante", "Constante", "Positive"],
        answer: 0,
        explanation: "Une dérivée négative indique que la fonction décroît.",
        difficulty: "Facile"
      },
      {
        question: "Quelle est l’équation de la tangente à f en a ?",
        choices: ["y=f'(a)(x-a)+f(a)", "y=f(a)(x-a)+f'(a)", "y=f'(x)+a", "y=ax+f'(a)"],
        answer: 0,
        explanation: "La formule de la tangente est y=f'(a)(x-a)+f(a).",
        difficulty: "Difficile"
      }
    ];
  }

  return [
    {
      question: `Quelle est la première étape pour résoudre un exercice sur ${chapitre} ?`,
      choices: ["Lire et identifier les données", "Deviner", "Sauter la correction", "Écrire seulement le résultat"],
      answer: 0,
      explanation: `En ${matiere}, niveau ${niveau}, il faut d’abord analyser l’énoncé.`,
      difficulty: "Facile"
    },
    {
      question: "Pourquoi vérifier les conditions d’une propriété ?",
      choices: ["Parce qu’elle peut être fausse hors de ses hypothèses", "Pour éviter de rédiger", "Parce que c’est inutile", "Pour aller plus vite"],
      answer: 0,
      explanation: "Une propriété ne s’applique que si ses conditions sont respectées.",
      difficulty: "Moyen"
    }
  ];
}
