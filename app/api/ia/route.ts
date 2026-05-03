import { NextResponse } from "next/server";

const MODEL = process.env.TOGETHER_MODEL || "meta-llama/Llama-3.3-70B-Instruct-Turbo";

export async function POST(req: Request) {
  let matiere = "Mathématiques";
  let niveau = "Terminale";
  let chapitre = "Limites";

  try {
    const body = await req.json();
    matiere = body?.matiere || matiere;
    niveau = body?.niveau || niveau;
    chapitre = body?.chapitre || chapitre;

    const apiKey = process.env.TOGETHER_API_KEY;
    if (!apiKey) return NextResponse.json({ content: fallbackCourse(matiere, niveau, chapitre) });

    const prompt = `
Tu es un professeur expert en ${matiere}. Crée un cours LONG, exigeant et adapté au niveau ${niveau} sur "${chapitre}".

Réponds avec ces titres EXACTS :
### INTRODUCTION
### OBJECTIFS
### COURS_DETAILLE
### TABLEAUX
### METHODES
### EXEMPLES_CORRIGES
### EXERCICES_CORRIGES
### A_RETENIR

Contraintes :
- Cours très détaillé, pas un résumé.
- Adapté précisément au niveau ${niveau}.
- Minimum 6 exemples corrigés.
- Minimum 15 exercices corrigés dans la réponse IA.
- Pas de quiz QCM ici.
- Pas de markdown code.
`;

    const response = await fetch("https://api.together.xyz/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.35,
        max_tokens: 6500
      })
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("Together course error:", result);
      return NextResponse.json({ content: fallbackCourse(matiere, niveau, chapitre) });
    }

    const content = result?.choices?.[0]?.message?.content;
    return NextResponse.json({
      content: typeof content === "string" && content.trim()
        ? content
        : fallbackCourse(matiere, niveau, chapitre)
    });
  } catch (error) {
    console.error("Course API error:", error);
    return NextResponse.json({ content: fallbackCourse(matiere, niveau, chapitre) });
  }
}

function fallbackCourse(matiere: string, niveau: string, chapitre: string) {
  return `### INTRODUCTION
Ce cours de ${matiere}, niveau ${niveau}, porte sur ${chapitre}. Il est conçu pour construire une vraie maîtrise : comprendre les notions, savoir choisir une méthode, lire un tableau ou un graphe, rédiger correctement et réussir des exercices progressifs.

### OBJECTIFS
- Comprendre les définitions du chapitre.
- Savoir appliquer les propriétés.
- Savoir interpréter un tableau ou un graphe.
- Résoudre des exercices progressifs.
- Rédiger une correction complète.
- Préparer une évaluation.

### COURS_DETAILLE
Le chapitre ${chapitre} doit être travaillé en trois temps : compréhension, application, entraînement. Il faut d’abord identifier les objets du cours, puis apprendre les propriétés importantes. Ensuite, chaque exercice doit être relié à une méthode.

Pour réussir, il faut toujours :
1. Lire l’énoncé.
2. Identifier les données.
3. Repérer la notion du cours.
4. Vérifier les conditions d’application.
5. Appliquer la méthode.
6. Conclure clairement.

### TABLEAUX
| Notion | Rôle | Méthode | Piège |
|---|---|---|---|
| Définition | Donner le sens précis | La citer avant utilisation | Approximation |
| Propriété | Résoudre plus vite | Vérifier les conditions | Application automatique |
| Graphe | Visualiser | Lire axes et variations | Interprétation trop rapide |
| Exercice | S’entraîner | Corriger ses erreurs | Sauter les étapes |

### METHODES
Méthode 1 : Identifier la notion.
Méthode 2 : Vérifier les conditions.
Méthode 3 : Appliquer la propriété.
Méthode 4 : Rédiger une conclusion.

### EXEMPLES_CORRIGES
Exemple 1 : application directe.
Correction : on applique la définition puis on conclut.

Exemple 2 : exercice avec méthode.
Correction : on identifie la propriété, on vérifie les conditions et on applique.

### EXERCICES_CORRIGES
Exercice 1 : donner une définition du chapitre.
Correction courte : citer la définition.
Correction détaillée : préciser les conditions et le contexte.

### A_RETENIR
Comprendre, appliquer, rédiger, corriger.`;
}
