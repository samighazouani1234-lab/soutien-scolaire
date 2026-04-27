import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { question } = await req.json();

  return NextResponse.json({
    answer: `📘 COURS COMPLET : ${question}

🎯 Objectifs
- Comprendre la notion
- Savoir appliquer une méthode
- Réussir des exercices
- Se préparer à une évaluation

━━━━━━━━━━━━━━━━━━━━

1️⃣ COURS DÉTAILLÉ

Définition :
Une fraction représente une partie d’un tout. Elle s’écrit sous la forme a/b.

Exemple :
3/4 signifie que l’on prend 3 parts sur 4 parts égales.

Vocabulaire :
- Le nombre du haut s’appelle le numérateur
- Le nombre du bas s’appelle le dénominateur
- Le dénominateur ne doit jamais être égal à 0

Méthode pour additionner des fractions :
1. Vérifier si les dénominateurs sont identiques
2. Si oui, additionner les numérateurs
3. Garder le même dénominateur
4. Simplifier si possible

Exemple :
2/5 + 1/5 = 3/5

━━━━━━━━━━━━━━━━━━━━

2️⃣ EXERCICES

🟢 Exercice 1 — Facile
Calcule :
1/4 + 2/4

🟡 Exercice 2 — Moyen
Calcule :
2/3 + 1/6

🔴 Exercice 3 — Difficile
Un gâteau est partagé en 8 parts.
Sarah mange 3/8 du gâteau et Karim mange 2/8.
Quelle fraction du gâteau a été mangée ?

━━━━━━━━━━━━━━━━━━━━

3️⃣ CORRECTIONS

✅ Correction exercice 1 :
1/4 + 2/4 = 3/4

✅ Correction exercice 2 :
2/3 = 4/6
4/6 + 1/6 = 5/6

✅ Correction exercice 3 :
3/8 + 2/8 = 5/8
Ils ont mangé 5/8 du gâteau.

━━━━━━━━━━━━━━━━━━━━

4️⃣ ÉVALUATION /10

Question 1 — 2 points
Qu’est-ce qu’une fraction ?

Question 2 — 2 points
Comment s’appelle le nombre du haut ?

Question 3 — 3 points
Calcule : 3/7 + 2/7

Question 4 — 3 points
Calcule : 1/2 + 1/4

━━━━━━━━━━━━━━━━━━━━

5️⃣ BARÈME

- Définitions : 2 points
- Méthode : 2 points
- Calculs : 4 points
- Présentation : 2 points`
  });
}
