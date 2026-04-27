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
    ? Object.values(data[matiere]).flatMap((cat: any) =>
        Object.keys(cat)
      )
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
    if (!matiere || !niveau || !chapitre) return alert("Choisis tout");

    setLoading(true);
    setAnswer("");

    const question = `
Cours complet de ${matiere} niveau ${niveau} sur ${chapitre}
avec explication, exemple, exercices, correction et test final
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
      
      {/* NAVBAR */}
      <nav style={styles.nav}>
        <h2 style={{ fontWeight: "bold" }}>✨ EduAI</h2>
        <div>
          <button style={styles.navBtn}>Accueil</button>
          <button style={styles.navBtn}>Dashboard</button>
        </div>
      </nav>

      {/* HERO */}
      <section style={styles.hero}>
        <div style={styles.left}>
          <span style={styles.badge}>IA éducative nouvelle génération</span>

          <h1 style={styles.title}>
            Apprends plus vite avec une IA intelligente.
          </h1>

          <p style={styles.subtitle}>
            Du collège à la prépa — cours, exercices et corrections en 1 clic.
          </p>
        </div>

        {/* CARD */}
        <div style={styles.card}>
          <h3 style={{ marginBottom: 15 }}>🤖 Générateur IA</h3>

          <select style={styles.input} onChange={(e) => setMatiere(e.target.value)}>
            <option>Matière</option>
            {Object.keys(data).map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>

          <select style={styles.input} onChange={(e) => setNiveau(e.target.value)}>
            <option>Niveau</option>
            {niveaux.map((n) => (
              <option key={n}>{n}</option>
            ))}
          </select>

          <select style={styles.input} onChange={(e) => setChapitre(e.target.value)}>
            <option>Chapitre</option>
            {chapitres.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>

          <button style={styles.btn} onClick={generate}>
            {loading ? "⏳ Génération..." : "✨ Générer avec IA"}
          </button>

          {answer && (
            <div style={styles.result}>
              <pre style={{ whiteSpace: "pre-wrap" }}>{answer}</pre>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

/* 🎨 ULTRA DESIGN */
const styles: any = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg,#020617,#0f172a,#1e293b)",
    color: "white",
    padding: 40,
    fontFamily: "Inter, Arial",
  },

  nav: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 50,
  },

  navBtn: {
    marginLeft: 10,
    padding: "8px 16px",
    borderRadius: 12,
    border: "none",
    background: "rgba(255,255,255,0.1)",
    color: "white",
    backdropFilter: "blur(10px)",
    cursor: "pointer",
  },

  hero: {
    display: "flex",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 40,
  },

  left: {
    maxWidth: 500,
  },

  badge: {
    background: "linear-gradient(90deg,#6366f1,#8b5cf6)",
    padding: "6px 14px",
    borderRadius: 20,
    fontSize: 14,
  },

  title: {
    fontSize: 44,
    marginTop: 20,
    fontWeight: "bold",
    lineHeight: "1.2",
  },

  subtitle: {
    marginTop: 15,
    color: "#94a3b8",
  },

  card: {
    background: "rgba(255,255,255,0.05)",
    backdropFilter: "blur(20px)",
    padding: 25,
    borderRadius: 20,
    width: 380,
    boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
    border: "1px solid rgba(255,255,255,0.1)",
  },

  input: {
    width: "100%",
    marginTop: 10,
    padding: 12,
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.1)",
    background: "rgba(0,0,0,0.3)",
    color: "white",
  },

  btn: {
    marginTop: 20,
    width: "100%",
    padding: 14,
    background: "linear-gradient(90deg,#6366f1,#8b5cf6)",
    borderRadius: 12,
    border: "none",
    fontWeight: "bold",
    color: "white",
    cursor: "pointer",
    transition: "0.3s",
  },

  result: {
    marginTop: 20,
    background: "rgba(0,0,0,0.4)",
    padding: 12,
    borderRadius: 12,
    maxHeight: 300,
    overflow: "auto",
    fontSize: 14,
  },
};
