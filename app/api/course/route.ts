import { NextResponse } from "next/server";

const MODEL =
  process.env.TOGETHER_MODEL || "meta-llama/Llama-3.3-70B-Instruct-Turbo";

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

    if (!apiKey) {
      return NextResponse.json({
        content: fallbackCourse(matiere, niveau, chapitre),
      });
    }

    const youtubeSearch = `https://www.youtube.com/results?search_query=${encodeURIComponent(
      `${matiere} ${niveau} ${chapitre} cours exercices corrigés`
    )}`;

    const khanSearch = `https://fr.khanacademy.org/search?page_search_query=${encodeURIComponent(
      `${matiere} ${chapitre}`
    )}`;

    const prompt = `
Tu es un professeur expert, exigeant et pédagogue.

Crée un cours scolaire TRÈS DÉTAILLÉ en français.

Matière : ${matiere}
Niveau : ${niveau}
Chapitre : ${chapitre}

IMPORTANT :
- Le cours doit être adapté au niveau ${niveau}.
- Le niveau doit être sérieux, pas trop facile.
- Ajoute des schémas textuels, des tableaux, des graphiques décrits et des exercices corrigés.
- Ne fais pas un simple plan.
- Ne mets jamais "Erreur" dans la réponse.
- Ne mets pas de quiz QCM dans le cours.

Réponds avec ces séparateurs EXACTS :

### INTRODUCTION
Introduction pédagogique de 10 à 15 lignes.

### OBJECTIFS
Liste de 6 à 8 objectifs précis et ambitieux.

### COURS
Cours complet et détaillé :
- définitions
- propriétés
- formules
- interprétations
- points de vigilance
- erreurs fréquentes
- démonstration courte si utile
- explications pas à pas

### TABLEAUX
Ajoute au moins 2 tableaux en texte clair.
Exemple de format :
| Notion | Signification | Méthode | Erreur à éviter |

### SCHEMAS_GRAPHES
Ajoute des schémas textuels et descriptions de graphes.
Pour les mathématiques, ajoute si utile :
- repère
- courbe
- tableau de variations
- arbre de probabilités
- diagramme
Pour physique/chimie :
- schéma d'expérience
- circuit
- forces
- tableau de mesures
- graphique attendu

### METHODES
Méthodes détaillées étape par étape, niveau ${niveau}.
Ajoute au moins 3 méthodes.

### EXEMPLES
4 exemples corrigés, progressifs, avec rédaction claire.

### EXERCICES
8 exercices progressifs :
1 facile
2 moyens
3 difficiles
2 type examen
Chaque exercice doit avoir une correction courte et une correction détaillée.

### A_RETENIR
Résumé structuré en fiches :
- définitions
- formules
- méthode
- pièges

### VIDEO
Propose des ressources vidéo sous forme de liens :
- Recherche YouTube : ${youtubeSearch}
- Recherche Khan Academy : ${khanSearch}
- Mots-clés à chercher : "${matiere} ${niveau} ${chapitre} exercices corrigés"
Ajoute aussi un mini-script vidéo de 6 à 8 minutes avec un vrai déroulé.

Règles de qualité :
- Le contenu doit être riche.
- Pas de réponse courte.
- Pas de généralités vagues.
- Adapte les exemples au chapitre exact "${chapitre}".
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
        temperature: 0.45,
        max_tokens: 5200,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("Together API error:", result);
      return NextResponse.json({
        content: fallbackCourse(matiere, niveau, chapitre),
      });
    }

    const content = result?.choices?.[0]?.message?.content;

    if (!content || typeof content !== "string") {
      return NextResponse.json({
        content: fallbackCourse(matiere, niveau, chapitre),
      });
    }

    return NextResponse.json({ content });
  } catch (error) {
    console.error("Course API error:", error);
    return NextResponse.json({
      content: fallbackCourse(matiere, niveau, chapitre),
    });
  }
}

function fallbackCourse(
  matiere = "Mathématiques",
  niveau = "Terminale",
  chapitre = "Limites"
) {
  const youtubeSearch = `https://www.youtube.com/results?search_query=${encodeURIComponent(
    `${matiere} ${niveau} ${chapitre} cours exercices corrigés`
  )}`;

  const khanSearch = `https://fr.khanacademy.org/search?page_search_query=${encodeURIComponent(
    `${matiere} ${chapitre}`
  )}`;

  return `### INTRODUCTION
Ce cours sur ${chapitre} en ${matiere}, niveau ${niveau}, a pour objectif de construire une compréhension solide et exploitable en exercice. On ne cherche pas seulement à apprendre une formule : il faut comprendre les définitions, les méthodes, les pièges et la manière de rédiger une solution complète.

Le chapitre sera travaillé en plusieurs étapes : d'abord les notions essentielles, ensuite les méthodes, puis des exemples corrigés et enfin des exercices progressifs. Le but est de pouvoir passer d'une question simple à une question de type examen.

### OBJECTIFS
- Maîtriser les définitions principales du chapitre.
- Identifier rapidement la méthode adaptée à un exercice.
- Savoir rédiger une solution complète.
- Éviter les erreurs classiques.
- Lire et exploiter un tableau ou un graphique.
- Résoudre des exercices progressifs.
- Préparer une évaluation ou un examen.
- Expliquer la méthode avec ses propres mots.

### COURS
1. Notion principale
Le chapitre ${chapitre} repose sur des définitions précises. Une définition doit être comprise avant d'être utilisée. En exercice, il faut toujours relier l'énoncé à une propriété du cours.

2. Méthode générale
On commence par lire l'énoncé, repérer les données, identifier la notion du cours, appliquer la méthode, puis conclure. Une réponse sans justification est rarement suffisante au niveau ${niveau}.

3. Points de vigilance
- Ne pas confondre définition et propriété.
- Ne pas appliquer une formule sans vérifier les conditions.
- Ne pas oublier la conclusion.
- Ne pas recopier un résultat sans expliquer les étapes.

4. Rédaction attendue
Une bonne rédaction contient :
- une phrase d'introduction ;
- les calculs ou raisonnements ;
- une justification ;
- une conclusion claire.

### TABLEAUX
| Élément du cours | Rôle | Comment l'utiliser | Erreur fréquente |
|---|---|---|---|
| Définition | Donner le sens précis | La citer avant de l'appliquer | L'utiliser approximativement |
| Propriété | Résoudre plus vite | Vérifier ses conditions | L'appliquer hors contexte |
| Exemple | Comprendre la méthode | Le refaire seul | Le lire sans pratiquer |
| Exercice | S'entraîner | Corriger ses erreurs | Aller trop vite |

| Niveau d'exercice | Objectif | Attendu |
|---|---|---|
| Facile | Vérifier la compréhension | Définition ou application directe |
| Moyen | Appliquer une méthode | Étapes claires |
| Difficile | Combiner plusieurs idées | Raisonnement structuré |
| Type examen | Rédiger proprement | Méthode + justification + conclusion |

### SCHEMAS_GRAPHES
Schéma de méthode :

[Lecture de l'énoncé]
        ↓
[Repérer les données]
        ↓
[Choisir la notion du cours]
        ↓
[Appliquer la méthode]
        ↓
[Rédiger la conclusion]

Graphique à construire si le chapitre s'y prête :
- Axe horizontal : variable ou grandeur étudiée.
- Axe vertical : résultat, valeur ou mesure.
- Placer les points importants.
- Interpréter les variations ou les tendances.

### METHODES
Méthode 1 : Identifier la notion
1. Lire la question.
2. Souligner les mots importants.
3. Relier ces mots à une définition du cours.

Méthode 2 : Résoudre un exercice
1. Écrire les données.
2. Choisir la formule ou propriété.
3. Appliquer étape par étape.
4. Vérifier la cohérence du résultat.

Méthode 3 : Rédiger
1. Expliquer ce que l'on fait.
2. Justifier chaque transformation.
3. Conclure avec une phrase complète.

### EXEMPLES
Exemple 1 — Application directe
Question : donner la définition principale du chapitre.
Correction courte : on cite la définition exacte.
Correction détaillée : il faut donner les conditions et expliquer les mots importants.

Exemple 2 — Application de méthode
Question : résoudre un cas simple lié au chapitre.
Correction courte : appliquer la propriété adaptée.
Correction détaillée : on identifie les données, on applique la propriété, puis on conclut.

Exemple 3 — Raisonnement
Question : expliquer pourquoi une méthode est valable.
Correction courte : on vérifie les conditions.
Correction détaillée : une propriété ne s'applique que si ses hypothèses sont vérifiées.

Exemple 4 — Type examen
Question : résoudre et rédiger entièrement.
Correction courte : méthode + calcul + conclusion.
Correction détaillée : chaque étape doit être justifiée.

### EXERCICES
1. Facile
Question : Énonce la définition principale du chapitre ${chapitre}.
Correction courte : reprendre la définition.
Correction détaillée : préciser les conditions d'utilisation.

2. Moyen
Question : Applique la méthode principale à un cas simple.
Correction courte : utiliser la propriété adaptée.
Correction détaillée : écrire les données, appliquer, conclure.

3. Moyen
Question : Explique une erreur fréquente du chapitre.
Correction courte : identifier la confusion.
Correction détaillée : comparer la bonne méthode et l'erreur.

4. Difficile
Question : Résous un exercice en plusieurs étapes.
Correction courte : organiser la résolution.
Correction détaillée : découper le problème et justifier chaque étape.

5. Difficile
Question : Interprète un tableau ou un graphique lié au chapitre.
Correction courte : lire les informations utiles.
Correction détaillée : expliquer ce que chaque donnée indique.

6. Difficile
Question : Rédige une solution complète.
Correction courte : utiliser la méthode du cours.
Correction détaillée : écrire une réponse structurée.

7. Type examen
Question : Problème complet.
Correction courte : appliquer plusieurs notions.
Correction détaillée : rédiger avec soin et conclure.

8. Type examen
Question : Question de synthèse.
Correction courte : résumer la méthode.
Correction détaillée : expliquer la logique du chapitre.

### A_RETENIR
- Une définition doit être précise.
- Une propriété s'applique seulement si ses conditions sont vérifiées.
- Une méthode doit être rédigée.
- Les erreurs viennent souvent d'une lecture trop rapide.
- Les exercices progressifs permettent de consolider le chapitre.

### VIDEO
Ressources vidéo :
- Recherche YouTube : ${youtubeSearch}
- Recherche Khan Academy : ${khanSearch}
- Mots-clés : "${matiere} ${niveau} ${chapitre} exercices corrigés"

Mini-script vidéo :
0:00 Introduction au chapitre
0:45 Définition principale
1:45 Exemple simple
3:00 Méthode complète
4:30 Exercice guidé
6:00 Résumé et pièges à éviter`;
}
