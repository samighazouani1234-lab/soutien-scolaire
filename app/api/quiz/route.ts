*import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const matiere = String(body?.matiere || "Mathématiques");
    const niveau = String(body?.niveau || "Terminale");
    const chapitre = String(body?.chapitre || "Limites");

    return NextResponse.json({
      title: `Quiz - ${chapitre}`,
      questions: [
        {
          question: `Quelle méthode utiliser pour réussir ${chapitre} ?`,
          choices: [
            "Lire, identifier, appliquer, conclure",
            "Deviner",
            "Sauter la correction",
            "Répondre sans justification"
          ],
          answer: 0,
          explanation: `Au niveau ${niveau}, une réponse de ${matiere} doit être justifiée.`,
          difficulty: "moyen"
        }
      ]
    });
  } catch {
    return NextResponse.json({ title: "Quiz", questions: [] });
  }
}

export async function GET() {
  return NextResponse.json({ ok: true });
}
