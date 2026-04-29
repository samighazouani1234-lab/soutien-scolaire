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
Cours de ${matiere} niveau ${niveau} chapitre ${chapitre}.

Donne :
- cours clair
- exemples
- exercices
- corrections
`;

    const res = await fetch("/api/ia", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ question }),
    });

    const json = await res.json();
    setAnswer(json.answer);

    setLoading(false);
  }

  return (
    <main style={styles.page}>
      <h1 style={styles.title}>🚀 EduAI Premium</h1>

      <div style={styles.card}>
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
          <option>Supérieur</option>
        </select>

        <input
          style={styles.input}
          placeholder="Chapitre"
          onChange={(e) => setChapitre(e.target.value)}
        />

        <button onClick={generateCourse} style={styles.button}>
          {loading ? "Génération..." : "✨ Générer"}
        </button>
      </div>

      {answer && (
        <div style={styles.result}>
          <pre>{answer}</pre>
        </div>
      )}
    </main>
  );
}

const styles: any = {
  page: {
    minHeight: "100vh",
    background: "#020617",
    color: "white",
    padding: 40,
    fontFamily: "Arial",
    textAlign: "center",
  },
  title: {
    fontSize: 40,
    marginBottom: 30,
  },
  card: {
    background: "white",
    color: "black",
    padding: 20,
    borderRadius: 20,
    maxWidth: 400,
    margin: "0 auto",
  },
  input: {
    width: "100%",
    padding: 12,
    marginTop: 10,
    borderRadius: 10,
  },
  button: {
    width: "100%",
    marginTop: 15,
    padding: 12,
    background: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: 10,
    cursor: "pointer",
  },
  result: {
    marginTop: 40,
    background: "white",
    color: "black",
    padding: 20,
    borderRadius: 20,
    maxWidth: 800,
    marginLeft: "auto",
    marginRight: "auto",
    textAlign: "left",
  },
};
