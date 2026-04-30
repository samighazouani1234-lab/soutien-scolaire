"use client";

import { useState } from "react";

export default function Home() {
  const [matiere, setMatiere] = useState("");
  const [niveau, setNiveau] = useState("");
  const [chapitre, setChapitre] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  async function generateCourse() {
    if (!matiere || !niveau || !chapitre) {
      alert("Remplis tous les champs");
      return;
    }

    setLoading(true);
    setAnswer("");

    const question = `
Crée un cours PREMIUM.

Matière : ${matiere}
Niveau : ${niveau}
Chapitre : ${chapitre}

Structure :
1. Objectifs
2. Cours détaillé
3. Définitions
4. Méthode
5. Exemples corrigés
6. Exercices
7. Corrections
8. Évaluation /20
9. Résumé
`;

    const res = await fetch("/api/ia", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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
          body * { visibility: hidden; }
          #print-area, #print-area * { visibility: visible; }
          #print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white;
            color: black;
            padding: 40px;
          }
          .no-print { display: none !important; }
        }
      `}</style>

      <main style={styles.page}>
        <section style={styles.hero} className="no-print">
          <nav style={styles.nav}>
            <div style={styles.logo}>🎓 EduAI</div>
            <a href="#generate" style={styles.navButton}>Commencer</a>
          </nav>

          <div style={styles.grid}>
            <div>
              <span style={styles.badge}>IA scolaire premium</span>
              <h1 style={styles.title}>
                Génère des cours haut de gamme avec l’IA.
              </h1>
              <p style={styles.subtitle}>
                Cours détaillés, exercices corrigés, évaluations et export PDF.
              </p>
            </div>

            <div id="generate" style={styles.card}>
              <h2>Créer un cours</h2>

              <select style={styles.input} onChange={(e) => setMatiere(e.target.value)}>
                <option value="">Matière</option>
                <option>Mathématiques</option>
                <option>Physique</option>
                <option>Chimie</option>
              </select>

              <select style={styles.input} onChange={(e) => setNiveau(e.target.value)}>
                <option value="">Niveau</option>
                <option>Collège</option>
                <option>Lycée</option>
                <option>Prépa</option>
                <option>Grandes écoles</option>
              </select>

              <input
                style={styles.input}
                placeholder="Chapitre"
                onChange={(e) => setChapitre(e.target.value)}
              />

              <button onClick={generateCourse} style={styles.button}>
                {loading ? "Génération..." : "✨ Générer le cours"}
              </button>
            </div>
          </div>
        </section>

        {answer && (
          <section style={styles.resultWrap}>
            <div style={styles.resultHeader} className="no-print">
              <h2>📘 Cours généré</h2>
              <button onClick={downloadPDF} style={styles.pdfButton}>
                📄 Télécharger PDF
              </button>
            </div>

            <div id="print-area" style={styles.result}>
              <h1>{matiere} — {niveau}</h1>
              <h2 style={{ color: "#2563eb" }}>{chapitre}</h2>
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
    minHeight: "100vh",
    background: "#020617",
    color: "white",
    fontFamily: "Arial, sans-serif",
  },
  hero: {
    minHeight: "100vh",
    padding: 28,
    background:
      "radial-gradient(circle at top left,#22d3ee55,transparent 30%), radial-gradient(circle at top right,#a855f755,transparent 30%), linear-gradient(135deg,#020617,#0f172a)",
  },
  nav: {
    maxWidth: 1200,
    margin: "0 auto",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logo: { fontSize: 28, fontWeight: 900 },
  navButton: {
    background: "white",
    color: "#020617",
    padding: "12px 20px",
    borderRadius: 999,
    fontWeight: 900,
    textDecoration: "none",
  },
  grid: {
    maxWidth: 1200,
    margin: "90px auto",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))",
    gap: 50,
    alignItems: "center",
  },
  badge: {
    background: "rgba(255,255,255,0.12)",
    padding: "10px 16px",
    borderRadius: 999,
    color: "#a5f3fc",
    fontWeight: 900,
  },
  title: {
    fontSize: "clamp(48px,8vw,82px)",
    lineHeight: 1,
    letterSpacing: -3,
  },
  subtitle: {
    fontSize: 21,
    color: "#cbd5e1",
    lineHeight: 1.6,
  },
  card: {
    background: "rgba(255,255,255,0.95)",
    color: "#0f172a",
    padding: 32,
    borderRadius: 34,
    boxShadow: "0 35px 100px rgba(0,0,0,0.45)",
  },
  input: {
    width: "100%",
    padding: 16,
    marginTop: 14,
    borderRadius: 16,
    border: "1px solid #cbd5e1",
    boxSizing: "border-box",
  },
  button: {
    width: "100%",
    marginTop: 20,
    padding: 17,
    border: "none",
    borderRadius: 18,
    background: "linear-gradient(90deg,#22d3ee,#a855f7)",
    color: "white",
    fontWeight: 900,
    cursor: "pointer",
  },
  resultWrap: {
    maxWidth: 1000,
    margin: "0 auto",
    padding: 32,
  },
  resultHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 20,
  },
  pdfButton: {
    background: "#22c55e",
    color: "white",
    padding: "14px 20px",
    borderRadius: 16,
    border: "none",
    fontWeight: 900,
    cursor: "pointer",
  },
  result: {
    background: "white",
    color: "#0f172a",
    padding: 32,
    borderRadius: 26,
    marginTop: 20,
  },
  pre: {
    whiteSpace: "pre-wrap",
    lineHeight: 1.7,
    fontFamily: "Arial, sans-serif",
  },
};
