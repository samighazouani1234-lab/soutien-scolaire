"use client";

import { useState } from "react";

export default function Home() {
  const [topic, setTopic] = useState("");
  const [course, setCourse] = useState("");
  const [loading, setLoading] = useState(false);

  const generateCourse = async () => {
    setLoading(true);
    setCourse("");

    const res = await fetch("/api/course", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ topic }),
    });

    const data = await res.json();
    setCourse(data.content);
    setLoading(false);
  };

  return (
    <main style={styles.page}>
      <header style={styles.header}>
        <div style={styles.logo}>📚 EduNova</div>
        <a href="#contact" style={styles.headerButton}>
          Réserver un cours
        </a>
      </header>

      <section style={styles.hero}>
        <div>
          <p style={styles.badge}>Soutien scolaire premium</p>

          <h1 style={styles.title}>
            Des cours plus clairs, des résultats plus rapides.
          </h1>

          <p style={styles.subtitle}>
            Maths, physique, exercices corrigés, cours générés par IA et visio avec professeur.
          </p>

          <div style={styles.buttons}>
            <a href="#cours" style={styles.primary}>
              Découvrir les cours
            </a>

            <a href="#visio" style={styles.secondary}>
              Cours en visio
            </a>
          </div>
        </div>

        <div style={styles.card}>
          <h2>Exemple de parcours</h2>

          <div style={styles.lesson}>🧮 Fractions — Niveau 4e</div>
          <div style={styles.lesson}>⚗️ Forces — Niveau 2nde</div>
          <div style={styles.lesson}>📐 Fonctions — Lycée</div>
        </div>
      </section>

      {/* IA SECTION */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>🤖 Générateur de cours IA</h2>

        <p style={styles.text}>
          Tape un chapitre et l’IA génère un cours complet avec explication,
          exemple et exercice.
        </p>

        <input
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Ex : équation du second degré"
          style={styles.input}
        />

        <button onClick={generateCourse} style={styles.primary}>
          {loading ? "Génération..." : "Générer le cours"}
        </button>

        {course && (
          <pre style={styles.result}>
            {course}
          </pre>
        )}
      </section>

      {/* VISIO */}
      <section style={styles.premium}>
        <h2 style={styles.sectionTitle}>Cours en visio avec professeur</h2>

        <p style={styles.text}>
          Réserve un cours avec un professeur pour progresser rapidement.
        </p>

        <a href="#contact" style={styles.primary}>
          Réserver une séance
        </a>
      </section>

      {/* CONTACT */}
      <section id="contact" style={styles.contact}>
        <h2>Prêt à progresser ?</h2>
        <p style={styles.text}>
          Premier échange gratuit pour évaluer ton niveau.
        </p>

        <button style={styles.contactButton}>
          Demander un appel
        </button>
      </section>
    </main>
  );
}

const styles: any = {
  page: {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at top left, #facc1555, transparent 25%), radial-gradient(circle at top right, #3b82f655, transparent 25%), #08111f",
    color: "white",
    fontFamily: "Arial",
    padding: 24,
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 40,
  },
  logo: {
    fontSize: 24,
    fontWeight: "bold",
  },
  headerButton: {
    background: "white",
    color: "black",
    padding: "10px 16px",
    borderRadius: 999,
  },
  hero: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 40,
    alignItems: "center",
  },
  badge: {
    background: "#facc15",
    color: "black",
    padding: "6px 12px",
    borderRadius: 999,
    display: "inline-block",
  },
  title: {
    fontSize: 48,
    marginBottom: 20,
  },
  subtitle: {
    color: "#aaa",
    marginBottom: 20,
  },
  buttons: {
    display: "flex",
    gap: 10,
  },
  primary: {
    background: "#facc15",
    color: "black",
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
    display: "inline-block",
  },
  secondary: {
    border: "1px solid white",
    padding: 12,
    borderRadius: 10,
  },
  card: {
    background: "#111",
    padding: 20,
    borderRadius: 20,
  },
  lesson: {
    marginTop: 10,
    padding: 10,
    background: "#222",
    borderRadius: 10,
  },
  section: {
    marginTop: 80,
  },
  sectionTitle: {
    fontSize: 32,
    marginBottom: 20,
  },
  text: {
    color: "#bbb",
    marginBottom: 20,
  },
  input: {
    width: "100%",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    fontSize: 16,
  },
  result: {
    marginTop: 20,
    whiteSpace: "pre-wrap",
    background: "#111",
    padding: 20,
    borderRadius: 10,
  },
  premium: {
    marginTop: 80,
    background: "#111",
    padding: 30,
    borderRadius: 20,
  },
  contact: {
    marginTop: 80,
    textAlign: "center",
    background: "white",
    color: "black",
    padding: 30,
    borderRadius: 20,
  },
  contactButton: {
    marginTop: 10,
    background: "black",
    color: "white",
    padding: 12,
    borderRadius: 10,
  },
};
const [question, setQuestion] = useState("");
const [answer, setAnswer] = useState("");

async function askAI() {
  const res = await fetch("/api/ia", {
    method: "POST",
    body: JSON.stringify({ question }),
  });

  const data = await res.json();
  setAnswer(data.answer);
}
