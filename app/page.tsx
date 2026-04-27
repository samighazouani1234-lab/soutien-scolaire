"use client";

import { useState } from "react";

const data = {
  Mathématiques: {
    "6e": ["Fractions", "Nombres décimaux", "Proportionnalité"],
    "5e": ["Fractions", "Pourcentages", "Géométrie"],
    "4e": ["Puissances", "Equations", "Pythagore"],
    "3e": ["Fonctions", "Statistiques", "Trigonométrie"],
  },
  Physique: {
    "6e": ["Matière", "Energie"],
    "5e": ["Forces", "Mouvement"],
    "4e": ["Electricité", "Vitesse"],
    "3e": ["Ondes", "Optique"],
  },
};

export default function Home() {
  const [matiere, setMatiere] = useState("");
  const [niveau, setNiveau] = useState("");
  const [chapitre, setChapitre] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const niveaux = matiere ? Object.keys(data[matiere]) : [];
  const chapitres =
    matiere && niveau ? data[matiere][niveau] : [];

  async function generate() {
    if (!matiere || !niveau || !chapitre) {
      alert("Choisis tout !");
      return;
    }

    setLoading(true);
    setAnswer("");

    const question = `${matiere} ${niveau} ${chapitre}`;

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
    <main style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0f172a, #1e293b)",
      color: "white",
      padding: "40px"
    }}>

      {/* HERO */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        gap: "40px",
        flexWrap: "wrap"
      }}>

        {/* LEFT */}
        <div style={{ maxWidth: "500px" }}>
          <div style={{
            background: "#facc15",
            color: "black",
            display: "inline-block",
            padding: "6px 12px",
            borderRadius: "20px",
            fontWeight: "bold",
            marginBottom: "20px"
          }}>
            Soutien scolaire premium
          </div>

          <h1 style={{
            fontSize: "48px",
            fontWeight: "bold",
            lineHeight: "1.2"
          }}>
            Apprends plus vite avec une IA scolaire.
          </h1>

          <p style={{ marginTop: "20px", opacity: 0.8 }}>
            Cours détaillés, exercices corrigés et évaluations intelligentes.
          </p>
        </div>

        {/* RIGHT CARD */}
        <div style={{
          background: "#1e293b",
          padding: "25px",
          borderRadius: "20px",
          width: "400px",
          boxShadow: "0 0 40px rgba(0,0,0,0.3)"
        }}>

          <h2 style={{ marginBottom: "20px" }}>
            🤖 Générateur de cours IA
          </h2>

          {/* SELECTS */}
          <select
            onChange={(e) => setMatiere(e.target.value)}
            style={inputStyle}
          >
            <option>Choisir matière</option>
            {Object.keys(data).map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>

          <select
            onChange={(e) => setNiveau(e.target.value)}
            style={inputStyle}
          >
            <option>Choisir niveau</option>
            {niveaux.map((n) => (
              <option key={n}>{n}</option>
            ))}
          </select>

          <select
            onChange={(e) => setChapitre(e.target.value)}
            style={inputStyle}
          >
            <option>Choisir chapitre</option>
            {chapitres.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>

          <button
            onClick={generate}
            style={{
              marginTop: "20px",
              width: "100%",
              padding: "12px",
              background: "#facc15",
              color: "black",
              borderRadius: "10px",
              fontWeight: "bold",
              border: "none",
              cursor: "pointer"
            }}
          >
            {loading ? "Chargement..." : "✨ Générer avec IA"}
          </button>

          {/* RESULT */}
          {answer && (
            <div style={{
              marginTop: "20px",
              background: "#0f172a",
              padding: "15px",
              borderRadius: "10px",
              maxHeight: "300px",
              overflow: "auto",
              fontSize: "14px"
            }}>
              {answer}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

const inputStyle = {
  width: "100%",
  marginTop: "10px",
  padding: "10px",
  borderRadius: "10px",
  border: "none",
  background: "#0f172a",
  color: "white"
};
