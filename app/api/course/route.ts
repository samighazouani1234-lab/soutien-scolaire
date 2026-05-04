import { NextResponse } from "next/server";

export const runtime = "nodejs";

type CoursePayload = {
  matiere?: string;
  niveau?: string;
  chapitre?: string;
};

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as CoursePayload;

  const matiere = safe(body.matiere || "Mathématiques");
  const niveau = safe(body.niveau || "Terminale");
  const chapitre = safe(body.chapitre || "Limites");

  const fallback = buildFallbackCourse(matiere, niveau, chapitre);
  const apiKey = process.env.TOGETHER_API_KEY;

  if (!apiKey) {
    return NextResponse.json(fallback);
  }

  try {
    const prompt = `
Tu es un professeur expert français.
Crée un cours très détaillé, fiable, adapté au niveau.

Matière: ${matiere}
Niveau: ${niveau}
Chapitre: ${chapitre}

Réponds uniquement en JSON strict, sans markdown, avec exactement cette structure:
{
  "introduction": "texte",
  "objectives": ["objectif 1"],
  "lessons": ["paragraphe détaillé 1"],
  "table": [["Notion","Formule ou idée","Utilisation","Piège à éviter"]],
  "methods": ["méthode étape par étape"],
  "examples": [{"title":"titre","statement":"énoncé","solution":"solution détaillée"}],
  "summary": ["point essentiel"]
}

Contraintes:
- contenu cohérent avec le chapitre exact
- pas de phrases génériques
- niveau adapté à ${niveau}
- au moins 5 lessons, 4 méthodes, 5 exemples
`;

    const response = await fetch("https://api.together.xyz/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.TOGETHER_MODEL || "meta-llama/Llama-3.3-70B-Instruct-Turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.25,
        max_tokens: 5000,
      }),
    });

    const json = await response.json();

    if (!response.ok) {
      return NextResponse.json(fallback);
    }

    const raw = json?.choices?.[0]?.message?.content;
    const parsed = parseJson(raw);

    if (!parsed) {
      return NextResponse.json(fallback);
    }

    return NextResponse.json(normalizeCourse(parsed, fallback));
  } catch {
    return NextResponse.json(fallback);
  }
}

export async function GET() {
  return NextResponse.json({ ok: true });
}

function safe(value: string) {
  return String(value).replace(/[<>]/g, "").trim();
}

function parseJson(raw: unknown) {
  if (typeof raw !== "string") return null;

  try {
    return JSON.parse(raw);
  } catch {
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
      return JSON.parse(match[0]);
    } catch {
      return null;
    }
  }
}

function normalizeCourse(value: any, fallback: any) {
  return {
    introduction: typeof value.introduction === "string" ? value.introduction : fallback.introduction,
    objectives: Array.isArray(value.objectives) ? value.objectives.map(String).slice(0, 8) : fallback.objectives,
    lessons: Array.isArray(value.lessons) ? value.lessons.map(String).slice(0, 12) : fallback.lessons,
    table: Array.isArray(value.table) ? value.table.slice(0, 8).map((row: any) => Array.isArray(row) ? row.map(String).slice(0, 4) : []) : fallback.table,
    methods: Array.isArray(value.methods) ? value.methods.map(String).slice(0, 8) : fallback.methods,
    examples: Array.isArray(value.examples) ? value.examples.slice(0, 8).map((ex: any) => ({
      title: String(ex?.title || "Exemple"),
      statement: String(ex?.statement || ""),
      solution: String(ex?.solution || ""),
    })) : fallback.examples,
    summary: Array.isArray(value.summary) ? value.summary.map(String).slice(0, 8) : fallback.summary,
  };
}

function buildFallbackCourse(matiere: string, niveau: string, chapitre: string) {
  const low = `${matiere} ${chapitre}`.toLowerCase();

  if (low.includes("dérivation") || low.includes("derivation")) {
    return {
      introduction: "La dérivation permet d’étudier localement une fonction. Elle relie calcul algébrique et lecture graphique grâce à la tangente.",
      objectives: [
        "Calculer une dérivée simple.",
        "Utiliser les formules de dérivation.",
        "Interpréter f'(a) comme coefficient directeur.",
        "Étudier le signe de f'.",
        "Construire un tableau de variations.",
        "Déterminer l’équation d’une tangente."
      ],
      lessons: [
        "Le nombre dérivé f'(a) est le coefficient directeur de la tangente à la courbe de f au point d’abscisse a.",
        "La fonction dérivée f' donne, pour chaque x, la pente locale de la courbe.",
        "Si f'(x)>0 sur un intervalle, alors f est croissante sur cet intervalle. Si f'(x)<0, f est décroissante.",
        "Les dérivées usuelles à connaître sont : (x²)'=2x, (x³)'=3x², (ax+b)'=a.",
        "La tangente en a a pour équation y=f'(a)(x-a)+f(a)."
      ],
      table: [
        ["Puissance", "(xⁿ)' = n xⁿ⁻¹", "Dériver un polynôme", "Oublier de diminuer l’exposant"],
        ["Somme", "(u+v)' = u'+v'", "Dériver terme à terme", "Mélanger les termes"],
        ["Produit", "(uv)' = u'v+uv'", "Dériver un produit", "Écrire u'v'"],
        ["Tangente", "y=f'(a)(x-a)+f(a)", "Équation de tangente", "Confondre f(a) et f'(a)"]
      ],
      methods: [
        "Identifier la forme de la fonction.",
        "Appliquer la bonne formule de dérivation.",
        "Étudier le signe de la dérivée.",
        "Construire le tableau de variations.",
        "Rédiger une conclusion claire."
      ],
      examples: [
        { title: "Dériver x²+3x", statement: "Calculer f'(x) pour f(x)=x²+3x.", solution: "f'(x)=2x+3." },
        { title: "Tangente", statement: "Trouver la tangente à f(x)=x² en a=2.", solution: "f'(x)=2x donc f'(2)=4 et f(2)=4. Tangente: y=4(x-2)+4=4x-4." }
      ],
      summary: [
        "f'(a) est la pente de la tangente.",
        "Le signe de f' donne les variations.",
        "Une tangente s’écrit y=f'(a)(x-a)+f(a)."
      ]
    };
  }

  return {
    introduction: `Ce cours porte sur ${chapitre} en ${matiere}, niveau ${niveau}. Il est structuré pour comprendre, appliquer et réussir les exercices.`,
    objectives: [
      "Comprendre les définitions.",
      "Identifier les propriétés.",
      "Appliquer les méthodes.",
      "Lire les représentations.",
      "Rédiger une solution complète."
    ],
    lessons: [
      "On commence par analyser l’énoncé et repérer les données utiles.",
      "Une propriété doit être appliquée seulement lorsque ses conditions sont vérifiées.",
      "La méthode choisie doit être adaptée à la question posée.",
      "Une réponse correcte contient des étapes justifiées et une conclusion.",
      "La correction permet d’identifier les erreurs et de progresser."
    ],
    table: [
      ["Définition", "Sens précis", "Comprendre l’énoncé", "Apprendre sans comprendre"],
      ["Propriété", "Règle utilisable", "Résoudre", "Oublier les conditions"],
      ["Méthode", "Suite d’étapes", "Rédiger", "Sauter les justifications"],
      ["Conclusion", "Phrase finale", "Répondre", "Donner seulement un calcul"]
    ],
    methods: [
      "Lire l’énoncé.",
      "Repérer les données.",
      "Choisir la propriété.",
      "Appliquer la méthode.",
      "Conclure."
    ],
    examples: [
      { title: "Application directe", statement: "Utiliser une définition du chapitre.", solution: "On cite la définition puis on l’applique au cas donné." }
    ],
    summary: [
      "Comprendre avant d’appliquer.",
      "Vérifier les conditions.",
      "Rédiger clairement."
    ]
  };
}
