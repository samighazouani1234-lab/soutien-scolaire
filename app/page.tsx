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
    <main className="min-h-screen bg-gradient-to-br from-black to-blue-900 text-white px-4 py-10 flex flex-col items-center">

      {/* HEADER */}
      <h1 className="text-3xl md:text-5xl font-bold mb-4 text-center">
        🎓 Soutien scolaire IA
      </h1>

      <p className="text-gray-300 text-center mb-8 max-w-xl">
        Pose une question et reçois un cours détaillé + exercice + correction automatiquement
      </p>

      {/* CARD */}
      <div className="w-full max-w-2xl bg-white/10 backdrop-blur-lg p-6 rounded-2xl shadow-xl">

        {/* TEXTAREA */}
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ex: explique les fractions niveau 4e"
          className="w-full h-32 p-4 rounded-lg bg-black/40 text-white border border-gray-600 focus:outline-none"
        />

        {/* BUTTON */}
        <button
          onClick={askAI}
          className="w-full mt-4 py-3 rounded-lg bg-white text-black font-semibold hover:scale-105 transition"
        >
          🤖 Générer avec IA
        </button>

        {/* LOADING */}
        {loading && (
          <p className="mt-4 text-yellow-300">⏳ L'IA réfléchit...</p>
        )}

        {/* RESULT */}
        {answer && (
          <div className="mt-6 bg-black/40 p-4 rounded-lg">
            <h2 className="font-bold mb-2">📘 Réponse :</h2>
            <p className="whitespace-pre-line">{answer}</p>
          </div>
        )}
      </div>

      {/* SECTION FEATURES */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl">

        <div className="bg-white/10 p-4 rounded-xl">
          📚 Cours détaillés
        </div>

        <div className="bg-white/10 p-4 rounded-xl">
          ✍️ Exercices automatiques
        </div>

        <div className="bg-white/10 p-4 rounded-xl">
          ✅ Corrections + évaluation
        </div>

      </div>

    </main>
  );
}
