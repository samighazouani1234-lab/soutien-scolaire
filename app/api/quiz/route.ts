import { NextResponse } from "next/server";

const MODEL = process.env.TOGETHER_MODEL || "meta-llama/Llama-3.3-70B-Instruct-Turbo";

export async function POST(req: Request) {
  try {
    const apiKey = process.env.TOGETHER_API_KEY;
    const { matiere = "Mathématiques", niveau = "Terminale", chapitre = "Limites", courseText = "", count = 12 } = await req.json();

    if (!apiKey) return NextResponse.json(localQuiz(chapitre, niveau));

    const prompt = `
Crée un quiz difficile niveau ${niveau} sur ${chapitre}.
Cours source : ${String(courseText).slice(0, 8000)}

JSON strict :
{
 "title":"Quiz avancé - ${chapitre}",
 "questions":[
  {"question":"...","choices":["A","B","C","D"],"answer":0,"explanation":"...","difficulty":"difficile"}
 ]
}
Règles : ${count} questions, niveau moyen/difficile/expert, pas de questions évidentes, answer entre 0 et 3.
`;

    const response = await fetch("https://api.together.xyz/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: MODEL, messages: [{ role: "user", content: prompt }], temperature: 0.3, max_tokens: 3500 })
    });

    const result = await response.json();
    const text = result?.choices?.[0]?.message?.content || "";
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (!response.ok || start < 0 || end < 0) return NextResponse.json(localQuiz(chapitre, niveau));
    const parsed = JSON.parse(text.slice(start, end + 1));
    return NextResponse.json(Array.isArray(parsed.questions) ? parsed : localQuiz(chapitre, niveau));
  } catch {
    return NextResponse.json(localQuiz());
  }
}

function localQuiz(chapitre = "Limites", niveau = "Terminale") {
  return {
    title: `Quiz avancé - ${chapitre}`,
    questions: [
      {
        question: `Quelle erreur faut-il éviter dans un exercice avancé sur ${chapitre} ?`,
        choices: ["Appliquer une propriété sans vérifier ses conditions", "Rédiger la conclusion", "Faire un schéma", "Lire l’énoncé"],
        answer: 0,
        explanation: "Au niveau demandé, une propriété doit toujours être appliquée dans ses conditions.",
        difficulty: "difficile"
      }
    ]
  };
}
