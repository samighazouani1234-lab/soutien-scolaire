import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({ ok: true });
}

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
        },
        {
          question: "Pourquoi faut-il vérifier les conditions d'une propriété ?",
          choices: [
            "Parce qu'elle peut être fausse hors de ses hypothèses",
            "Parce que cela évite de rédiger",
            "Parce que c'est facultatif",
            "Parce que le résultat suffit"
          ],
          answer: 0,
          explanation: "Une propriété mathématique ou scientifique ne s'applique que si ses conditions sont respectées.",
          difficulty: "difficile"
        },
        {
          question: "Que doit contenir une bonne correction ?",
          choices: [
            "La méthode, les étapes et la conclusion",
            "Seulement le résultat",
            "Une réponse au hasard",
            "Une phrase sans calcul"
          ],
          answer: 0,
          explanation: "Une correction complète explique la méthode et justifie les étapes.",
          difficulty: "moyen"
        }
      ]
    });
  } catch {
    return NextResponse.json({
      title: "Quiz",
      questions: []
    });
  }
}
