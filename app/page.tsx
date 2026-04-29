"use client";

import { useRef, useState } from "react";
import { data } from "../data/courses";

export default function Home() {
  const [matiere, setMatiere] = useState("");
  const [niveau, setNiveau] = useState("");
  const [chapitre, setChapitre] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const resultRef = useRef<HTMLDivElement>(null);

  const niveaux =
    matiere && (data as any)[matiere]
      ? Object.values((data as any)[matiere]).flatMap((cat: any) =>
          Object.keys(cat)
        )
      : [];

  const chapitres = (() => {
    if (!matiere || !niveau) return [];
    const selected = (data as any)[matiere];

    for (const cat in selected) {
      if (selected[cat][niveau]) return selected[cat][niveau];
    }

    return [];
  })();

  async function generateCourse() {
    if (!matiere || !niveau || !chapitre) {
      alert("Choisis une matière, un niveau et un chapitre");
      return;
    }

    setLoading(true);
    setAnswer("");

    const question = `
Crée un cours scolaire premium.

Matière : ${matiere}
Niveau : ${niveau}
Chapitre : ${chapitre}

Structure obligatoire :
1. Objectifs du chapitre
2. Cours détaillé
3. Définitions importantes
4. Méthode étape par étape
5. Exemples corrigés
6. Exercices progressifs
7. Corrections détaillées
8. Évaluation finale avec barème sur 20
9. Résumé à retenir
`;

    const res = await fetch("/api/ia", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ question }),
    });

    const json = await res.json();
    setAnswer(json.answer || "Erreur IA");
    setLoading(false);
  }

  function downloadPDF() {
    window.print();
  }

  return (
    <>
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }

          .print-area, .print-area * {
            visibility: visible;
          }

          .print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white !important;
            color: black !important;
            padding: 40px;
          }

          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <main style={styles.page}>
        <section style={styles.hero} className="no-print">
          <nav style={styles.nav}>
            <div style={styles.logo}>🤖 EduAI</div>
            <a href="#generator" style={styles.cta}>
              Générer un cours
            </a>
          </nav>

          <div style={styles.heroGrid}>
            <div>
              <span style={styles.badge}>✨ IA scolaire premium</span>

              <h1 style={styles.title}>
                Génère des cours haut de gamme avec l’IA.
              </h1>

              <p style={styles.subtitle}>
                Cours détaillés, exercices corrigés, évaluations et export PDF
                en quelques secondes.
              </p>

              <div style={styles.tags}>
                <span style={styles.tag}>🎓 Collège → Prépa</span>
                <span style={styles.tag}>📚 Maths · Physique · Chimie</span>
                <span style={styles.tag}>📄 PDF exportable</span>
              </div>
            </div>

            <div id="generator" style={styles.card}>
              <h2 style={styles.cardTitle}>Créer un cours</h2>

              <select
                style={styles.input}
                value={matiere}
                onChange={(e) => {
                  setMatiere(e.target.value);
                  setNiveau("");
                  setChapitre("");
                }}
              >
                <option value="">Choisir une matière</option>
                {Object.keys(data).map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>

              <select
                style={styles.input}
                value={niveau}
                onChange={(e) => {
                  setNiveau(e.target.value);
                  setChapitre("");
                }}
              >
                <option value="">Choisir un niveau</option>
                {niveaux.map((n: any) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>

              <select
                style={styles.input}
                value={chapitre}
                onChange={(e) => setChapitre(e.target.value)}
              >
                <option value="">Choisir un chapitre</option>
                {chapitres.map((c: any) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              <button onClick={generateCourse} style={styles.button}>
                {loading ? "Génération en cours..." : "✨ Générer le cours"}
              </button>
            </div>
          </div>
        </section>

        {answer && (
          <section style={styles.resultSection}>
            <div style={styles.resultHeader} className="no-print">
              <h2>📘 Cours généré</h2>

              <button onClick={downloadPDF} style={styles.pdfButton}>
                📄 Télécharger en PDF
              </button>
            </div>

            <div ref={resultRef} className="print-area" style={styles.result}>
              <h1 style={styles.pdfTitle}>
                {matiere} — {niveau}
              </h1>
              <h2 style={styles.pdfSubtitle}>{chapitre}</h2>
              <pre style={styles.pre}>{answer}</pre>
            </div>
          </section>
        )}
      </main>
    </>
  );
}

const styles: any = {
  page: {
    margin: 0,
    fontFamily: "Arial, sans-serif",
    background: "#020617",
    color: "white",
    minHeight: "100vh",
  },

  hero: {
    minHeight: "100vh",
    padding: 28,
    backgroundImage: `
      linear-gradient(
        120deg,
        rgba(88,28,135,0.9),
        rgba(37,99,235,0.78),
        rgba(14,165,233,0.35)
      ),
      url('/hero.png')
    `,
    backgroundSize: "cover",
    backgroundPosition: "center",
  },

  nav: {
    maxWidth: 1280,
    margin: "0 auto",
    padding: "18px 24px",
    borderRadius: 26,
    background: "rgba(15,23,42,0.55)",
    backdropFilter: "blur(18px)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    border: "1px solid rgba(255,255,255,0.18)",
  },

  logo: {
    fontSize: 30,
    fontWeight: 900,
  },

  cta: {
    background: "linear-gradient(90deg,#facc15,#fb7185)",
    color: "#111827",
    padding: "13px 20px",
    borderRadius: 18,
    fontWeight: 900,
    textDecoration: "none",
  },

  heroGrid: {
    maxWidth: 1280,
    margin: "90px auto 0",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))",
    gap: 50,
    alignItems: "center",
  },

  badge: {
    display: "inline-block",
    background: "rgba(255,255,255,0.18)",
    padding: "12px 18px",
    borderRadius: 999,
    fontWeight: 900,
    border: "1px solid rgba(255,255,255,0.25)",
  },

  title: {
    fontSize: "clamp(48px,8vw,86px)",
    lineHeight: 1,
    letterSpacing: -3,
    margin: "30px 0",
    textShadow: "0 12px 40px rgba(0,0,0,0.4)",
  },

  subtitle: {
    fontSize: 22,
    lineHeight: 1.6,
    color: "#e0f2fe",
    maxWidth: 680,
  },

  tags: {
    display: "flex",
    gap: 14,
    flexWrap: "wrap",
    marginTop: 34,
  },

  tag: {
    background: "rgba(255,255,255,0.16)",
    padding: "16px 20px",
    borderRadius: 20,
    fontWeight: 900,
    border: "1px solid rgba(255,255,255,0.22)",
  },

  card: {
    background: "rgba(255,255,255,0.95)",
    color: "#0f172a",
    padding: 36,
    borderRadius: 36,
    boxShadow: "0 35px 100px rgba(0,0,0,0.32)",
  },

  cardTitle: {
    fontSize: 34,
    marginTop: 0,
  },

  input: {
    width: "100%",
    padding: 17,
    marginTop: 14,
    borderRadius: 18,
    border: "1px solid #cbd5e1",
    fontSize: 16,
    boxSizing: "border-box",
  },

  button: {
    width: "100%",
    marginTop: 22,
    padding: 18,
    border: "none",
    borderRadius: 20,
    background: "linear-gradient(90deg,#7c3aed,#2563eb,#06b6d4)",
    color: "white",
    fontWeight: 900,
    cursor: "pointer",
    fontSize: 16,
  },

  resultSection: {
    maxWidth: 1100,
    margin: "0 auto",
    padding: "60px 24px",
  },

  resultHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: 20,
    alignItems: "center",
    flexWrap: "wrap",
    marginBottom: 20,
  },

  pdfButton: {
    background: "linear-gradient(90deg,#22c55e,#06b6d4)",
    color: "white",
    padding: "14px 20px",
    border: "none",
    borderRadius: 18,
    fontWeight: 900,
    cursor: "pointer",
  },

  result: {
    background: "white",
    color: "#0f172a",
    padding: 34,
    borderRadius: 28,
    boxShadow: "0 25px 80px rgba(0,0,0,0.3)",
  },

  pdfTitle: {
    marginTop: 0,
    fontSize: 34,
  },

  pdfSubtitle: {
    color: "#2563eb",
  },

  pre: {
    whiteSpace: "pre-wrap",
    fontFamily: "Arial, sans-serif",
    lineHeight: 1.7,
    fontSize: 16,
  },
};
