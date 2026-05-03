import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const chapitre = String(body?.chapitre || "Quiz");

    return NextResponse.json({
      title: `Quiz - ${chapitre}`,
      questions: [
        {
          question: `Quelle méthode utiliser pour réussir ${chapitre} ?`,
          choices: ["Lire, identifier, appliquer, conclure", "Deviner", "Sauter la correction", "Répondre sans justification"],
          answer: 0,
          explanation: "Une résolution solide suit une méthode claire.",
          difficulty: "moyen"
        }
      ]
    });
  } catch {
    return NextResponse.json({ title: "Quiz", questions: [] });
  }
}
