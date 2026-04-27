import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { question } = await req.json();

  return NextResponse.json({
    answer: `📘 Cours sur : ${question}

1. Explication simple :
Le sujet "${question}" doit être compris étape par étape.

2. Exemple :
On commence par identifier les notions importantes, puis on applique la méthode.

3. Exercice :
Explique le sujet "${question}" avec tes propres mots.

4. Correction :
Il faut donner une définition claire, un exemple et une méthode.

5. Évaluation :
Réponds à 3 questions sur ce chapitre pour vérifier ta compréhension.`
  });
}
