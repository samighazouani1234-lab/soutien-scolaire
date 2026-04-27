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

    setAnswer(data.answer);
    setLoading(false);
  }

  return (
    <main style={{ padding: "40px", maxWidth: "800px", margin: "auto" }}>
      
      <h1>🎓 Soutien scolaire IA</h1>
      <p>Pose une question et reçois un cours + exercice + correction</p>

      {/* INPUT */}
      <textarea
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Ex: explique les fractions niveau 4e"
        style={{
          width: "100%",
          height: "120px",
          padding: "10px",
          marginTop: "20px",
        }}
      />

      {/* BUTTON */}
      <button
        onClick={askAI}
        style={{
          marginTop: "20px",
          padding: "10px 20px",
          background: "black",
          color: "white",
          borderRadius: "8px",
        }}
      >
        🤖 Générer avec IA
      </button>

      {/* LOADING */}
      {loading && <p>⏳ L'IA réfléchit...</p>}

      {/* RESULT */}
      {answer && (
        <div
          style={{
            marginTop: "30px",
            padding: "20px",
            background: "#f5f5f5",
            borderRadius: "10px",
          }}
        >
          <h2>📘 Réponse :</h2>
          <p>{answer}</p>
        </div>
      )}
    </main>
  );
}
