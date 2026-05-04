import { NextResponse } from "next/server";

export const runtime = "nodejs";

const MODEL =
  process.env.TOGETHER_MODEL || "meta-llama/Llama-3.3-70B-Instruct-Turbo";

export async function POST(req: Request) {
  let matiere = "Mathématiques";
  let niveau = "Terminale";
  let chapitre = "Limites";

  try {
    const body = await req.json();
    matiere = String(body?.matiere || matiere);
    niveau = String(body?.niveau || niveau);
    chapitre = String(body?.chapitre || chapitre);

    const apiKey = process.env.TOGETHER_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ content: fallbackCourse(matiere, niveau, chapitre) });
    }

    const prompt = `
Tu es un professeur français expert.

Crée un cours scolaire fiable, détaillé, adapté au niveau ${niveau}.

Matière : ${matiere}
Chapitre : ${chapitre}

Réponds uniquement avec ces titres exacts :

### INTRODUCTION
### OBJECTIFS
### COURS
### TABLEAUX
### METHODES
### EXEMPLES
### EXERCICES
### A_RETENIR

Règles :
- pas de HTML
- pas de JSON
- pas de titre coupé
- pas de bloc de code
- cours détaillé
- 6 exemples corrigés
- 15 exercices corrigés
- contenu adapté au chapitre exact
`;

    const response = await fetch("https://api.together.xyz/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.25,
        max_tokens: 5200,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      return NextResponse.json({ content: fallbackCourse(matiere, niveau, chapitre) });
    }

    const content = result?.choices?.[0]?.message?.content;

    return NextResponse.json({
      content:
        typeof content === "string" && content.trim()
          ? sanitizeCourse(content)
          : fallbackCourse(matiere, niveau, chapitre),
    });
  } catch {
    return NextResponse.json({ content: fallbackCourse(matiere, niveau, chapitre) });
  }
}

export async function GET() {
  return NextResponse.json({ ok: true });
}

function sanitizeCourse(raw: string) {
  return raw
    .replace(/\r/g, "")
    .replace(/```[\s\S]*?```/g, "")
    .replace(/<\/?[^>]+(>|$)/g, "")
    .replaceAll("### COURS_DETAILLE", "### COURS")
    .replaceAll("### COURS\n_DETAILLE", "### COURS")
    .replaceAll("### EXEMPLES_CORRIGES", "### EXEMPLES")
    .replaceAll("### EXERCICES_CORRIGES", "### EXERCICES")
    .replace(/^_DETAILLE\s*$/gm, "")
    .trim();
}

function fallbackCourse(matiere: string, niveau: string, chapitre: string) {
  return `### INTRODUCTION
Ce cours porte sur ${chapitre} en ${matiere}, niveau ${niveau}. Il aide à comprendre les notions, appliquer les méthodes et réussir les exercices.

### OBJECTIFS
- Comprendre les définitions.
- Identifier les propriétés.
- Appliquer les méthodes.
- Lire un tableau ou un graphe.
- Rédiger correctement.
- Réussir des exercices.

### COURS
Le chapitre ${chapitre} doit être travaillé avec méthode. Il faut lire l’énoncé, repérer les données, choisir une propriété, vérifier ses conditions et rédiger une conclusion.

### TABLEAUX
Le site affiche un tableau de synthèse propre et adapté au chapitre.

### METHODES
1. Lire l’énoncé.
2. Repérer les données.
3. Choisir la méthode.
4. Conclure.

### EXEMPLES
Exemple : appliquer une propriété du cours.
Correction : vérifier les conditions, appliquer et conclure.

### EXERCICES
Exercice : résoudre une question du chapitre.
Correction courte : appliquer la méthode.
Correction détaillée : détailler les étapes et conclure.

### A_RETENIR
Comprendre, pratiquer, corriger.`;
}
