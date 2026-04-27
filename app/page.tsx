"use client";

import { useState } from "react";

export default function Home() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  async function askAI() {
    setLoading(true);
    setAnswer("");

    const res = await fetch("/api/ia", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ question }),
    });

    const data = await res.json();
    setAnswer(data.answer || "Erreur IA");
    setLoading(false);
  }

  return (
    <main style={styles.page}>
      <header style={styles.header}>
        <div style={styles.logo}>🎓 EduNova IA</div>
        <a href="#ia" style={styles.headerButton}>Générer un cours</a>
      </header>

      <section style={styles.hero}>
        <div>
          <p style={styles.badge}>Soutien scolaire premium</p>
          <h1 style={styles.title}>Apprends plus vite avec une IA scolaire.</h1>
          <p style={styles.subtitle}>
            Génère des cours détaillés, exercices, corrections et évaluations pour les maths, la physique et plus encore.
          </p>
        </div>

        <div id="ia" style={styles.card}>
          <h2 style={styles.cardTitle}>🤖 Générateur de cours IA</h2>

          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ex : explique les fractions niveau 4e avec exercices corrigés"
            style={styles.textarea}
          />

          <button
            onClick={askAI}
            disabled={loading || !question.trim()}
            style={{
              ...styles.button,
              opacity: loading || !question.trim() ? 0.6 : 1,
            }}
          >
            {loading ? "⏳ Génération..." : "Générer avec IA"}
          </button>

          {answer && (
            <div style={styles.answer}>
              <h3>📘 Réponse</h3>
              <p style={{ whiteSpace: "pre-line", lineHeight: 1.7 }}>{answer}</p>
            </div>
          )}
        </div>
      </section>

      <section style={styles.features}>
        <div style={styles.feature}>📚 Cours détaillés</div>
        <div style={styles.feature}>✍️ Exercices automatiques</div>
        <div style={styles.feature}>✅ Corrections</div>
        <div style={styles.feature}>📝 Évaluations</div>
      </section>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at top left, #facc1555, transparent 25%), radial-gradient(circle at top right, #3b82f655, transparent 25%), #08111f",
    color: "white",
    fontFamily: "Arial, sans-serif",
    padding: 24,
  },
  header: {
    maxWidth: 1200,
    margin: "0 auto",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px 0",
  },
  logo: {
    fontSize: 24,
    fontWeight: 900,
  },
  headerButton: {
    background: "white",
    color: "black",
    padding: "12px 18px",
    borderRadius: 999,
    textDecoration: "none",
    fontWeight: 800,
  },
  hero: {
    maxWidth: 1200,
    margin: "60px auto",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: 40,
    alignItems: "center",
  },
  badge: {
    display: "inline-block",
    background: "#facc15",
    color: "black",
    padding: "8px 14px",
    borderRadius: 999,
    fontWeight: 800,
  },
  title: {
    fontSize: "clamp(42px, 8vw, 72px)",
    lineHeight: 1,
    margin: "24px 0",
    letterSpacing: -2,
  },
  subtitle: {
    fontSize: 18,
    color: "#cbd5e1",
    lineHeight: 1.7,
  },
  card: {
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.15)",
    borderRadius: 32,
    padding: 28,
    boxShadow: "0 30px 80px rgba(0,0,0,0.45)",
  },
  cardTitle: {
    fontSize: 30,
    marginBottom: 20,
  },
  textarea: {
    width: "100%",
    minHeight: 160,
    borderRadius: 22,
    border: "1px solid rgba(255,255,255,0.18)",
    background: "rgba(0,0,0,0.35)",
    color: "white",
    padding: 18,
    fontSize: 16,
    boxSizing: "border-box",
  },
  button: {
    marginTop: 18,
    width: "100%",
    padding: 16,
    borderRadius: 999,
    border: 0,
    background: "#facc15",
    color: "black",
    fontWeight: 900,
    fontSize: 16,
    cursor: "pointer",
  },
  answer: {
    marginTop: 24,
    background: "rgba(0,0,0,0.35)",
    padding: 20,
    borderRadius: 22,
  },
  features: {
    maxWidth: 1200,
    margin: "60px auto",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 16,
  },
  feature: {
    background: "rgba(255,255,255,0.08)",
    padding: 20,
    borderRadius: 20,
    fontWeight: 800,
    border: "1px solid rgba(255,255,255,0.12)",
  },
};
