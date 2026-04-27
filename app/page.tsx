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
Cours complet de ${matiere} niveau ${niveau} sur ${chapitre}.
Ajoute un cours détaillé, exemples, exercices corrigés, évaluation et barème.
`;

    const res = await fetch("/api/ia", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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
              <a style={styles.link}>Accueil</a>
              <a style={styles.link}>Cours</a>
              <a style={styles.link}>Tarifs</a>
              <a style={styles.ctaSmall}>Commencer</a>
            </div>
          </nav>

          <div style={styles.heroContent}>
            <div style={styles.left}>
              <span style={styles.badge}>✨ IA éducative nouvelle génération</span>

              <h1 style={styles.title}>
                Apprends mieux, comprends tout.
              </h1>

              <p style={styles.subtitle}>
                Des cours clairs, des exercices personnalisés et une IA qui
                t’accompagne du collège à la prépa.
              </p>

              <div style={styles.cards}>
                <div style={styles.miniCard}>🎓 Collège → Prépa</div>
                <div style={styles.miniCard}>✍️ Exercices adaptés</div>
                <div style={styles.miniCard}>📈 Progression</div>
              </div>
            </div>

            <div style={styles.generator}>
              <h2>🤖 Générateur de cours IA</h2>

              <select
                style={styles.input}
                value={matiere}
                onChange={(e) => {
                  setMatiere(e.target.value);
                  setNiveau("");
                  setChapitre("");
                }}
              >
                <option value="">Matière</option>
                {Object.keys(data).map((m) => (
                  <option key={m}>{m}</option>
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
                <option value="">Niveau</option>
                {niveaux.map((n) => (
                  <option key={n}>{n}</option>
                ))}
              </select>

              <select
                style={styles.input}
                value={chapitre}
                onChange={(e) => setChapitre(e.target.value)}
              >
                <option value="">Chapitre</option>
                {chapitres.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>

              <button onClick={generate} style={styles.button}>
                {loading ? "⏳ Génération..." : "✨ Générer mon cours"}
              </button>

              {answer && (
                <div style={styles.result}>
                  <pre style={{ whiteSpace: "pre-wrap", margin: 0 }}>
                    {answer}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section style={styles.stats}>
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
    backgroundImage:
      "linear-gradient(90deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.75) 42%, rgba(255,255,255,0.15) 100%), url('/hero.png')",
    backgroundSize: "cover",
    backgroundPosition: "center",
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
    background: "rgba(255,255,255,0.85)",
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
  },
  link: {
    fontWeight: 700,
    color: "#334155",
  },
  ctaSmall: {
    background: "#7c3aed",
    color: "white",
    padding: "12px 18px",
    borderRadius: 14,
    fontWeight: 900,
  },
  heroContent: {
    maxWidth: 1280,
    margin: "80px auto 0",
    display: "grid",
    gridTemplateColumns: "1fr 420px",
    gap: 40,
    alignItems: "center",
  },
  left: {
    maxWidth: 620,
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
    fontSize: "clamp(48px, 8vw, 82px)",
    lineHeight: 1,
    letterSpacing: -3,
    margin: "28px 0",
  },
  subtitle: {
    fontSize: 22,
    lineHeight: 1.6,
    color: "#475569",
  },
  cards: {
    display: "flex",
    gap: 16,
    flexWrap: "wrap",
    marginTop: 34,
  },
  miniCard: {
    background: "rgba(255,255,255,0.8)",
    padding: 18,
    borderRadius: 18,
    fontWeight: 800,
    boxShadow: "0 10px 30px rgba(15,23,42,0.08)",
  },
  generator: {
    background: "rgba(255,255,255,0.88)",
    backdropFilter: "blur(20px)",
    padding: 28,
    borderRadius: 30,
    boxShadow: "0 30px 90px rgba(15,23,42,0.18)",
    border: "1px solid rgba(255,255,255,0.6)",
  },
  input: {
    width: "100%",
    padding: 16,
    borderRadius: 16,
    border: "1px solid #e2e8f0",
    marginTop: 14,
    fontSize: 16,
    boxSizing: "border-box",
    background: "white",
  },
  button: {
    width: "100%",
    marginTop: 20,
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
  stats: {
    maxWidth: 1100,
    margin: "-70px auto 60px",
    background: "rgba(255,255,255,0.9)",
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
