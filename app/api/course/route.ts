import { NextResponse } from "next/server";

const MODEL =
  process.env.TOGETHER_MODEL || "meta-llama/Llama-3.3-70B-Instruct-Turbo";

export async function POST(req: Request) {
  try {
    const apiKey = process.env.TOGETHER_API_KEY;

    const { matiere, niveau, chapitre } = await req.json();

    if (!apiKey) {
      return NextResponse.json({
        content: fallbackCourse(matiere, niveau, chapitre),
      });
    }

    const prompt = `
Tu es un professeur expert et un concepteur de cours premium.

Crée un cours scolaire en français.

Matière : ${matiere}
Niveau : ${niveau}
Chapitre : ${chapitre}

Réponds avec ces séparateurs EXACTS :

### INTRODUCTION
Une introduction claire, motivante et courte.

### OBJECTIFS
4 à 6 objectifs précis.

### COURS
Cours détaillé, progressif, avec définitions, propriétés, formules si nécessaire et explications simples.

### METHODES
Méthodes étape par étape pour résoudre les exercices du chapitre.

### EXEMPLES
Exemples corrigés courts et clairs.

### EXERCICES
5 exercices progressifs, sans QCM :
- facile
- moyen
- difficile
- type examen
- défi

### A_RETENIR
Résumé clair et utile.

### VIDEO
Script court pour une vidéo pédagogique : titre, durée, plan minute par minute.

Règles :
- Ne mets pas de quiz QCM dans le cours.
- Ne mets pas de JSON.
- Ne mets pas de message d'erreur.
- Adapte le vocabulaire au niveau ${niveau}.
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
        temperature: 0.65,
        max_tokens: 3200,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      return NextResponse.json({
        content: fallbackCourse(matiere, niveau, chapitre),
      });
    }

    return NextResponse.json({
      content:
        result?.choices?.[0]?.message?.content ||
        fallbackCourse(matiere, niveau, chapitre),
    });
  } catch {
    return NextResponse.json({
      content: fallbackCourse("Mathématiques", "Terminale", "Limites"),
    });
  }
}

function fallbackCourse(matiere = "Mathématiques", niveau = "Terminale", chapitre = "Limites") {
  return `### INTRODUCTION
Bienvenue dans ce cours sur ${chapitre}. L’objectif est de comprendre les idées principales, de savoir les appliquer et de progresser avec des exercices gradués.

### OBJECTIFS
- Comprendre les notions essentielles du chapitre.
- Savoir reconnaître les situations classiques.
- Appliquer une méthode claire.
- S’entraîner avec des exercices progressifs.
- Être capable d’expliquer son raisonnement.

### COURS
Le chapitre ${chapitre} en ${matiere} demande d’abord de maîtriser les définitions. Une fois les notions comprises, on applique les propriétés et les méthodes dans des exercices. La clé est de ne pas apprendre uniquement par cœur : il faut comprendre pourquoi chaque étape est utilisée.

### METHODES
1. Lire précisément l’énoncé.
2. Identifier les données utiles.
3. Repérer la notion du cours concernée.
4. Choisir la méthode adaptée.
5. Rédiger chaque étape clairement.
6. Vérifier que la réponse est cohérente.

### EXEMPLES
Exemple guidé :
On repère la définition utile, puis on applique la propriété du cours. On simplifie progressivement et on conclut par une phrase claire.

### EXERCICES
1. Facile : donner la définition principale du chapitre.
2. Moyen : appliquer la méthode sur un exemple direct.
3. Difficile : résoudre un exercice avec plusieurs étapes.
4. Type examen : rédiger une solution complète.
5. Défi : expliquer la méthode à un autre élève.

### A_RETENIR
Pour réussir ${chapitre}, il faut comprendre les définitions, appliquer les méthodes et corriger ses erreurs.

### VIDEO
Titre : Comprendre ${chapitre}
Durée : 6 minutes
Plan : introduction, définition, méthode, exemple, résumé.`;
}
