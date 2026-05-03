import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const matiere = String(body?.matiere || "Mathématiques");
    const niveau = String(body?.niveau || "Terminale");
    const chapitre = String(body?.chapitre || "Limites");

    return NextResponse.json({
      title: `Quiz avancé - ${chapitre}`,
      questions: [
        {
          question: `Pourquoi faut-il vérifier les conditions d'une propriété en ${matiere} ?`,
          choices: [
            "Parce qu'une propriété peut être fausse hors de ses hypothèses",
            "Parce que cela remplace tous les calculs",
            "Parce que la conclusion devient inutile",
            "Parce que les exemples suffisent toujours"
          ],
          answer: 0,
          explanation: `Au niveau ${niveau}, il faut toujours justifier l'utilisation d'une propriété.`,
          difficulty: "difficile"
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
