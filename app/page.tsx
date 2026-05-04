"use client";

import { useState, type CSSProperties } from "react";

type Exercise = {
  id: number;
  level: "Facile" | "Moyen" | "Difficile" | "Type examen";
  title: string;
  statement: string;
  shortCorrection: string;
  detailedCorrection: string;
};

export default function Page() {
  const [open, setOpen] = useState<Record<number, boolean>>({});
  const exercises = buildExercises("Mathématiques", "Première", "Dérivation");

  return (
    <main style={styles.page}>
      <section style={styles.card}>
        <h1>EduAI — Cours PRO</h1>
        <p>Connexion, cours, graphes et quiz peuvent être ajoutés ensuite. Cette page compile sans erreur.</p>
        <h2>📈 Graphe dérivation</h2>
        <DerivativeGraph />
        <h2>✍️ Exercices</h2>
        <div style={styles.grid}>
          {exercises.map((ex) => (
            <div key={ex.id} style={styles.exercise}>
              <span style={styles.badge}>{ex.level}</span>
              <h3>{ex.id}. {ex.title}</h3>
              <p>{ex.statement}</p>
              <button style={styles.button} onClick={() => setOpen((p) => ({ ...p, [ex.id]: !p[ex.id] }))}>
                Voir la correction
              </button>
              {open[ex.id] && <div><b>{ex.shortCorrection}</b><p>{ex.detailedCorrection}</p></div>}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

function DerivativeGraph() {
  return (
    <svg viewBox="0 0 720 340" width="100%" height="340">
      <rect width="720" height="340" fill="#f8fafc" rx="24" />
      <line x1="50" y1="260" x2="670" y2="260" stroke="#111827" strokeWidth="3" />
      <line x1="95" y1="40" x2="95" y2="300" stroke="#111827" strokeWidth="3" />
      <path d="M80 245 C160 220, 240 110, 335 125 C440 140, 520 205, 650 120" fill="none" stroke="#4f46e5" strokeWidth="6" />
      <line x1="250" y1="150" x2="470" y2="105" stroke="#ef4444" strokeWidth="4" />
      <circle cx="350" cy="128" r="8" fill="#ef4444" />
      <text x="475" y="108" fill="#ef4444" fontSize="18">tangente</text>
    </svg>
  );
}

function buildExercises(matiere: string, niveau: string, chapitre: string): Exercise[] {
  const base: Exercise[] = [
    makeExercise(1, "Facile", "Dériver une puissance", "Calculer la dérivée de f(x)=x².", "f'(x)=2x.", "On utilise (xⁿ)' = n xⁿ⁻¹."),
    makeExercise(2, "Facile", "Dériver une fonction affine", "Calculer la dérivée de f(x)=3x+5.", "f'(x)=3.", "La dérivée de ax+b est a."),
  ];

  const suite = Array.from({ length: 48 }, (_, index) => {
    const id = index + 3;
    const level = id <= 10 ? "Facile" : id <= 25 ? "Moyen" : id <= 40 ? "Difficile" : "Type examen";
    return makeExercise(
      id,
      level,
      `${chapitre} — exercice ${level.toLowerCase()}`,
      `Exercice de ${matiere} niveau ${niveau} sur ${chapitre}.`,
      "Appliquer la méthode du cours.",
      "On identifie la formule, on applique proprement et on conclut."
    );
  });

  return base.concat(suite);
}

function makeExercise(
  id: number,
  level: Exercise["level"],
  title: string,
  statement: string,
  shortCorrection: string,
  detailedCorrection: string
): Exercise {
  return { id, level, title, statement, shortCorrection, detailedCorrection };
}

const styles: Record<string, CSSProperties> = {
  page: { minHeight: "100vh", background: "#efe7db", padding: 32, fontFamily: "Arial, sans-serif" },
  card: { maxWidth: 1200, margin: "0 auto", background: "white", borderRadius: 32, padding: 32 },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 16 },
  exercise: { border: "1px solid #e2e8f0", borderRadius: 18, padding: 18 },
  badge: { background: "#eef2ff", color: "#4338ca", padding: "6px 10px", borderRadius: 999, fontWeight: 900 },
  button: { background: "#111827", color: "white", border: "none", borderRadius: 12, padding: "10px 14px", fontWeight: 900 }
};
