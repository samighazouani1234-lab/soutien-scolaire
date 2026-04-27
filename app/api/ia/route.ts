import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { question } = await req.json();

  return NextResponse.json({
    answer: `📘 Cours sur : ${question}

🎯 Objectif :
Comprendre ce chapitre simplement.

🧠 Explication :
On commence par définir le sujet, puis on applique une méthode étape par étape.

✅ Exemple :
Pour "${question}", il faut identifier les mots importants, puis résoudre avec une méthode claire.

✏️ Exercice :
Explique "${question}" avec tes propres mots et donne un exemple.

📝 Correction :
Une bonne réponse contient une définition, une méthode et un exemple.

📊 Évaluation :
1. Définis le sujet.
2. Donne un exemple.
3. Résous un exercice simple.`
  });
}
