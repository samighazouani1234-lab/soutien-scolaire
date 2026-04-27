"use client";

import { useState } from "react";
import { data } from "../data/courses"; // ✅ chemin corrigé

export default function Home() {
  const [matiere, setMatiere] = useState("");
  const [niveau, setNiveau] = useState("");
  const [chapitre, setChapitre] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔥 niveaux dynamiques (flatten)
  const niveaux = matiere
    ? Object.values(data[matiere])
        .flatMap((cat: any) => Object.keys(cat))
    : [];

  // 🔥 chapitres dynamiques
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

Fais :
1. Explication simple
2. Exemple
3. 3 exercices
4. Correction
5. Petit test final
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
      <h1 style={styles.title}>🎓 EduAI</h1>

      <div style={styles.card}>
        <h2>Générateur IA</h2>

        {/* MATIERE */}
        <select style={styles.input} onChange={(e) => setMatiere(e.target.value)}>
          <option>Matière</option>
          {Object.keys(data).map((m) => (
            <option key={m}>{m}</option>
          ))}
        </select>

        {/* NIVEAU */}
        <select style={styles.input} onChange={(e) => setNiveau(e.target.value)}>
          <option>Niveau</option>
          {niveaux.map((n) => (
            <option key={n}>{n}</option>
          ))}
        </select>

        {/* CHAPITRE */}
        <select style={styles.input} onChange={(e) => setChapitre(e.target.value)}>
          <option>Chapitre</option>
          {chapitres.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>

        <button style={styles.btn} onClick={generate}>
          {loading ? "⏳..." : "✨ Générer"}
        </button>

        {answer && (
          <div style={styles.result}>
            <pre>{answer}</pre>
          </div>
        )}
      </div>
    </main>
  );
}

const styles: any = {
  page: {
    minHeight: "100vh",
    background: "#0f172a",
    color: "white",
    padding: 40,
  },
  title: {
    fontSize: 40,
    marginBottom: 20,
  },
  card: {
    background: "#1e293b",
    padding: 20,
    borderRadius: 20,
    maxWidth: 400,
  },
  input: {
    width: "100%",
    marginTop: 10,
    padding: 10,
    borderRadius: 10,
  },
  btn: {
    marginTop: 20,
    width: "100%",
    padding: 12,
    background: "#facc15",
    borderRadius: 10,
    border: "none",
    fontWeight: "bold",
  },
  result: {
    marginTop: 20,
    background: "#020617",
    padding: 10,
    borderRadius: 10,
    maxHeight: 300,
    overflow: "auto",
  },
};
