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
    if (!matiere || !niveau || !chapitre) {
      alert("Choisis tout !");
      return;
    }

    setLoading(true);
    setAnswer("");

    const question = `
Cours complet de ${matiere} niveau ${niveau} sur ${chapitre}
avec explication, exemple, exercices et correction
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
      
      {/* HEADER */}
      <header style={styles.header}>
        <h2 style={{ fontWeight: "bold" }}>🎓 EduAI</h2>
        <div>
          <button style={styles.navBtn}>Accueil</button>
          <button style={styles.navBtn}>Dashboard</button>
        </div>
      </header>

      {/* HERO */}
      <section style={styles.hero}>
        
        {/* LEFT */}
        <div style={styles.left}>
          <span style={styles.badge}>Soutien scolaire premium</span>

          <h1 style={styles.title}>
            Une IA qui t’explique vraiment tes cours.
          </h1>

          <p style={styles.subtitle}>
            Génère des cours, exercices et corrections automatiquement.
          </p>
        </div>

        {/* CARD */}
        <div style={styles.card}>
          <h3 style={{ marginBottom: 10 }}>
            🤖 Générateur intelligent
          </h3>

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
            {loading ? "⏳ Génération..." : "✨ Générer"}
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

/* 🎨 STYLES PREMIUM */
const styles: any = {
  page: {
    minHeight: "100vh",
    background: "#f8fafc",
    color: "#0f172a",
    padding: 30,
    fontFamily: "Inter, Arial",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 40,
  },

  navBtn: {
    marginLeft: 10,
    padding: "8px 14px",
    borderRadius: 10,
    border: "1px solid #e2e8f0",
    background: "white",
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
    background: "#6366f1",
    color: "white",
    padding: "6px 12px",
    borderRadius: 20,
    fontSize: 14,
  },

  title: {
    fontSize: 42,
    marginTop: 20,
    fontWeight: "bold",
  },

  subtitle: {
    marginTop: 10,
    color: "#64748b",
  },

  card: {
    background: "white",
    padding: 25,
    borderRadius: 20,
    width: 380,
    boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
  },

  input: {
    width: "100%",
    marginTop: 10,
    padding: 12,
    borderRadius: 10,
    border: "1px solid #e2e8f0",
  },

  btn: {
    marginTop: 20,
    width: "100%",
    padding: 14,
    background: "#6366f1",
    color: "white",
    borderRadius: 10,
    border: "none",
    fontWeight: "bold",
    cursor: "pointer",
  },

  result: {
    marginTop: 20,
    background: "#f1f5f9",
    padding: 12,
    borderRadius: 10,
    maxHeight: 300,
    overflow: "auto",
    fontSize: 14,
  },
};/
