"use client";

import { useState } from "react";
import { data } from "@/data/courses";

export default function Home() {
  const [matiere, setMatiere] = useState("");
  const [niveau, setNiveau] = useState("");
  const [chapitre, setChapitre] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  // niveaux dynamiques
  const niveaux = matiere ? Object.keys(data[matiere]) : [];

  // chapitres dynamiques
  const chapitres =
    matiere && niveau ? data[matiere][niveau] : [];

  async function generate() {
    if (!matiere || !niveau || !chapitre) {
      alert("Choisis matière, niveau et chapitre");
      return;
    }

    setLoading(true);
    setAnswer("");

    const question = `
Cours complet de ${matiere} niveau ${niveau} sur ${chapitre}
avec :
- explication simple
- exemple
- exercices
- corrections
- évaluation
`;

    const res = await fetch("/api/ia", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ question }),
    });

    const dataRes = await res.json();
    setAnswer(dataRes.answer);
    setLoading(false);
  }

  return (
    <main style={styles.page}>
      
      {/* HEADER */}
      <header style={styles.header}>
        <h2>🎓 EduAI</h2>
        <div>
          <button style={styles.navBtn}>Accueil</button>
          <button style={styles.navBtn}>Mon espace</button>
        </div>
      </header>

      {/* HERO */}
      <section style={styles.hero}>
        <div style={styles.left}>
          <span style={styles.badge}>Soutien scolaire premium</span>

          <h1 style={styles.title}>
            Apprends du collège à la prépa avec une IA.
          </h1>

          <p style={styles.subtitle}>
            Maths, physique, chimie, cours détaillés + exercices + corrections.
          </p>
        </div>

        {/* CARD IA */}
        <div style={styles.card}>
          <h3>🤖 Générateur de cours</h3>

          {/* MATIERE */}
          <select
            style={styles.input}
            onChange={(e) => {
              setMatiere(e.target.value);
              setNiveau("");
              setChapitre("");
            }}
          >
            <option>Choisir matière</option>
            {Object.keys(data).map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>

          {/* NIVEAU */}
          <select
            style={styles.input}
            onChange={(e) => {
              setNiveau(e.target.value);
              setChapitre("");
            }}
          >
            <option>Choisir niveau</option>
            {niveaux.map((n) => (
              <option key={n}>{n}</option>
            ))}
          </select>

          {/* CHAPITRE */}
          <select
            style={styles.input}
            onChange={(e) => setChapitre(e.target.value)}
          >
            <option>Choisir chapitre</option>
            {chapitres.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>

          {/* BUTTON */}
          <button style={styles.btn} onClick={generate}>
            {loading ? "⏳ Génération..." : "✨ Générer"}
          </button>

          {/* RESULT */}
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

const styles: any = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg,#0f172a,#1e293b)",
    color: "white",
    padding: "30px",
    fontFamily: "Arial",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "40px",
  },

  navBtn: {
    marginLeft: "10px",
    padding: "8px 12px",
    borderRadius: "8px",
    border: "none",
  },

  hero: {
    display: "flex",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: "40px",
  },

  left: {
    maxWidth: "500px",
  },

  badge: {
    background: "#facc15",
    color: "black",
    padding: "6px 12px",
    borderRadius: "20px",
  },

  title: {
    fontSize: "40px",
    marginTop: "20px",
  },

  subtitle: {
    opacity: 0.8,
    marginTop: "10px",
  },

  card: {
    background: "#1e293b",
    padding: "20px",
    borderRadius: "20px",
    width: "350px",
  },

  input: {
    width: "100%",
    marginTop: "10px",
    padding: "10px",
    borderRadius: "10px",
  },

  btn: {
    marginTop: "20px",
    width: "100%",
    padding: "12px",
    background: "#facc15",
    borderRadius: "10px",
    border: "none",
    fontWeight: "bold",
  },

  result: {
    marginTop: "20px",
    background: "#0f172a",
    padding: "10px",
    borderRadius: "10px",
    maxHeight: "300px",
    overflow: "auto",
  },
};
