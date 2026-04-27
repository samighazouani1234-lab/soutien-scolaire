import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { topic } = await req.json();

  return NextResponse.json({
    content: `
📘 CHAPITRE : ${topic}

🎯 Objectifs du cours
- Comprendre les notions essentielles du chapitre
- Savoir appliquer les méthodes
- S'entraîner avec des exercices progressifs
- Vérifier ses acquis avec une évaluation

━━━━━━━━━━━━━━━━━━━━

1️⃣ COURS DÉTAILLÉ

Définition :
Le chapitre "${topic}" doit être compris étape par étape. On commence par identifier les notions importantes, puis on apprend les méthodes de résolution.

Méthode générale :
1. Lire attentivement l’énoncé
2. Repérer les données utiles
3. Choisir la bonne formule ou méthode
4. Faire les calculs proprement
5. Vérifier le résultat

Exemple expliqué :
On applique la méthode sur un exercice simple, puis on augmente progressivement la difficulté.

━━━━━━━━━━━━━━━━━━━━

2️⃣ EXERCICES AUTOMATIQUES

🟢 Exercice 1 — Facile
Explique avec tes mots la notion principale du chapitre "${topic}".

🟡 Exercice 2 — Moyen
Résous un exercice simple lié au chapitre "${topic}".

🔴 Exercice 3 — Difficile
Résous un problème complet en plusieurs étapes.

━━━━━━━━━━━━━━━━━━━━

3️⃣ CORRECTIONS

✅ Correction exercice 1 :
Il faut donner une définition claire, avec un exemple simple.

✅ Correction exercice 2 :
On applique la méthode du cours :
- on identifie les données
- on choisit la méthode
- on calcule
- on vérifie

✅ Correction exercice 3 :
La correction doit détailler chaque étape du raisonnement.

━━━━━━━━━━━━━━━━━━━━

4️⃣ ÉVALUATION DU CHAPITRE

Question 1 :
Quelle est la définition principale du chapitre "${topic}" ?

Question 2 :
Quelle méthode faut-il utiliser pour résoudre un exercice ?

Question 3 :
Résous un exercice d’application.

Question 4 :
Explique ton raisonnement.

━━━━━━━━━━━━━━━━━━━━

5️⃣ BARÈME /10

- Définitions : 2 points
- Méthode : 2 points
- Calculs / application : 3 points
- Raisonnement : 2 points
- Présentation : 1 point

━━━━━━━━━━━━━━━━━━━━

📌 Conseil :
Relis le cours, refais les exercices sans regarder les corrections, puis passe à l’évaluation.
`
  });
}
