"use client";

import { useState } from "react";
import { data } from "../data/courses";

export default function Home() {
  const [matiere, setMatiere] = useState("");
  const [niveau, setNiveau] = useState("");
  const [chapitre, setChapitre] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const niveaux = matiere
    ? Object.values(data[matiere]).flatMap((cat: any) => Object.keys(cat))
    : [];

  let chapitres: string[] = [];

  if (matiere && niveau) {
    const categories = data[matiere];

    for (const cat in categories) {
      if (categories[cat][niveau]) {
        chapitres = categories[cat][niveau];
      }
    }
  }

  async function generate() {
    if (!matiere || !niveau || !chapitre) {
      alert("Choisis matière, niveau et chapitre");
      return;
    }

    setLoading(true);
    setAnswer("");

    const question = `
Cours complet de ${matiere}, niveau ${niveau}, chapitre ${chapitre}.
Donne :
1. Un cours détaillé
2. Des définitions simples
3. Des exemples corrigés
4. Des exercices progressifs
5. Les corrections détaillées
6. Une évaluation finale avec barème sur 10
`;

    const res = await fetch("/api/ia", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ question }),
    });

    const dataRes = await res.json();
    setAnswer(dataRes.answer || "Erreur IA");
    setLoading(false);
  }

  return (
    <main style={styles.page}>
      <section style={styles.hero}>
        <div style={styles.overlay}>
          <nav style={styles.nav}>
            <div style={styles.logo}>🤖 EduAI</div>

            <div style={styles.navLinks}>
              <a href="#accueil" style={styles.link}>Accueil</a>
              <a href="#cours" style={styles.link}>Cours</a>
              <a href="#ia" style={styles.link}>IA</a>
              <a href="#ia" style={styles.ctaSmall}>Commencer</a>
            </div>
          </nav>

          <div id="accueil" style={styles.heroContent}>
            <div style={styles.left}>
              <span style={styles.badge}>
                ✨ IA éducative nouvelle génération
              </span>

              <h1 style={styles.title}>
                Apprends mieux, comprends tout.
              </h1>

              <p style={styles.subtitle}>
                Des cours clairs, des exercices corrigés et une IA qui
                t’accompagne du collège à la prépa.
              </p>

              <div style={styles.cards}>
                <div style={styles.miniCard}>🎓 Collège → Prépa</div>
                <div style={styles.miniCard}>✍️ Exercices adaptés</div>
                <div style={styles.miniCard}>📈 Suivi de progression</div>
              </div>
            </div>

            <div id="ia" style={styles.generator}>
              <h2 style={styles.generatorTitle}>🤖 Générateur de cours IA</h2>

              <label style={styles.label}>Matière</label>
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
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>

              <label style={styles.label}>Niveau</label>
              <select
                style={styles.input}
                value={niveau}
                onChange={(e) => {
                  setNiveau(e.target.value);
                  setChapitre("");
                }}
              >
                <option value="">Choisir un niveau</option>
                {niveaux.map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>

              <label style={styles.label}>Chapitre</label>
              <select
                style={styles.input}
                value={chapitre}
                onChange={(e) => setChapitre(e.target.value)}
              >
                <option value="">Choisir un chapitre</option>
                {chapitres.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              <button onClick={generate} style={styles.button}>
                {loading ? "⏳ Génération en cours..." : "✨ Générer mon cours"}
              </button>

              {answer && (
                <div style={styles.result}>
                  <h3 style={{ marginTop: 0 }}>📘 Cours généré</h3>
                  <pre style={styles.pre}>{answer}</pre>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section id="cours" style={styles.stats}>
        <div>😊 <b>50 000+</b><br />élèves accompagnés</div>
        <div>⭐ <b>4.9/5</b><br />satisfaction moyenne</div>
        <div>📚 <b>10 000+</b><br />cours disponibles</div>
        <div>🚀 <b>100%</b><br />IA pédagogique</div>
      </section>
    </main>
  );
}

const styles: any = {
  page: {
    margin: 0,
    fontFamily: "Inter, Arial, sans-serif",
    background: "#f8fafc",
    color: "#0f172a",
  },

  hero: {
    minHeight: "100vh",
    backgroundImage: `
      linear-gradient(
        90deg,
        rgba(255,255,255,0.96) 0%,
        rgba(255,255,255,0.82) 42%,
        rgba(255,255,255,0.25) 100%
      ),
      url('/hero.png')
    `,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
  },

  overlay: {
    minHeight: "100vh",
    padding: 24,
  },

  nav: {
    maxWidth: 1280,
    margin: "0 auto",
    padding: "18px 24px",
    borderRadius: 22,
    background: "rgba(255,255,255,0.88)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    boxShadow: "0 20px 60px rgba(15,23,42,0.12)",
    backdropFilter: "blur(18px)",
  },

  logo: {
    fontSize: 26,
    fontWeight: 900,
  },

  navLinks: {
    display: "flex",
    gap: 24,
    alignItems: "center",
    flexWrap: "wrap",
  },

  link: {
    fontWeight: 700,
    color: "#334155",
    textDecoration: "none",
  },

  ctaSmall: {
    background: "#7c3aed",
    color: "white",
    padding: "12px 18px",
    borderRadius: 14,
    fontWeight: 900,
    textDecoration: "none",
  },

  heroContent: {
    maxWidth: 1280,
    margin: "80px auto 0",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: 40,
    alignItems: "center",
  },

  left: {
    maxWidth: 650,
  },

  badge: {
    background: "#ede9fe",
    color: "#6d28d9",
    padding: "10px 16px",
    borderRadius: 999,
    fontWeight: 900,
    display: "inline-block",
  },

  title: {
    fontSize: "clamp(46px, 8vw, 82px)",
    lineHeight: 1,
    letterSpacing: -3,
    margin: "28px 0",
  },

  subtitle: {
    fontSize: 22,
    lineHeight: 1.6,
    color: "#475569",
    maxWidth: 620,
  },

  cards: {
    display: "flex",
    gap: 16,
    flexWrap: "wrap",
    marginTop: 34,
  },

  miniCard: {
    background: "rgba(255,255,255,0.85)",
    padding: 18,
    borderRadius: 18,
    fontWeight: 800,
    boxShadow: "0 10px 30px rgba(15,23,42,0.08)",
  },

  generator: {
    background: "rgba(255,255,255,0.92)",
    backdropFilter: "blur(20px)",
    padding: 28,
    borderRadius: 30,
    boxShadow: "0 30px 90px rgba(15,23,42,0.18)",
    border: "1px solid rgba(255,255,255,0.7)",
  },

  generatorTitle: {
    marginTop: 0,
    marginBottom: 18,
    fontSize: 28,
  },

  label: {
    display: "block",
    marginTop: 14,
    marginBottom: 6,
    fontWeight: 800,
    color: "#475569",
    fontSize: 14,
  },

  input: {
    width: "100%",
    padding: 16,
    borderRadius: 16,
    border: "1px solid #e2e8f0",
    fontSize: 16,
    boxSizing: "border-box",
    background: "white",
    color: "#0f172a",
  },

  button: {
    width: "100%",
    marginTop: 22,
    padding: 17,
    borderRadius: 18,
    border: 0,
    background: "linear-gradient(90deg,#7c3aed,#6366f1)",
    color: "white",
    fontWeight: 900,
    fontSize: 16,
    cursor: "pointer",
  },

  result: {
    marginTop: 22,
    background: "#0f172a",
    color: "white",
    padding: 18,
    borderRadius: 20,
    maxHeight: 360,
    overflow: "auto",
    fontSize: 14,
  },

  pre: {
    whiteSpace: "pre-wrap",
    margin: 0,
    fontFamily: "Inter, Arial, sans-serif",
    lineHeight: 1.7,
  },

  stats: {
    maxWidth: 1100,
    margin: "-70px auto 60px",
    background: "rgba(255,255,255,0.95)",
    borderRadius: 28,
    padding: 28,
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 24,
    textAlign: "center",
    boxShadow: "0 30px 90px rgba(15,23,42,0.12)",
    position: "relative",
    zIndex: 3,
  },
};
