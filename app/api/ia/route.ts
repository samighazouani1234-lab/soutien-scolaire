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
      alert("Choisis une matière, un niveau et un chapitre");
      return;
    }

    setLoading(true);
    setAnswer("");

    const question = `
Crée un cours scolaire PREMIUM.

Matière : ${matiere}
Niveau : ${niveau}
Chapitre : ${chapitre}

Structure obligatoire :

1. Objectifs du chapitre
2. Cours détaillé
3. Définitions importantes
4. Méthode étape par étape
5. Exemples corrigés
6. Exercices progressifs
7. Corrections détaillées
8. Évaluation finale avec barème /20
9. Résumé clair à retenir
`;

    try {
      const res = await fetch("/api/ia", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question }),
      });

      const data = await res.json();
      setAnswer(data.answer || "Erreur IA");
    } catch (e) {
      setAnswer("Erreur serveur");
    }

    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-gradient-to-r from-purple-600 to-blue-600 text-white flex flex-col items-center justify-center p-6">
      
      {/* TITRE */}
      <h1 className="text-5xl font-bold mb-6 text-center">
        🚀 EduAI – Générateur de cours
      </h1>

      <p className="mb-10 text-center max-w-xl">
        Génère des cours complets avec intelligence artificielle.
      </p>

      {/* FORM */}
      <div className="bg-white text-black p-6 rounded-2xl shadow-xl w-full max-w-xl">
        
        <select
          className="w-full p-3 mb-4 border rounded"
          onChange={(e) => setMatiere(e.target.value)}
        >
          <option value="">Choisir une matière</option>
          <option>Mathématiques</option>
          <option>Physique</option>
          <option>Chimie</option>
          <option>Français</option>
          <option>Histoire</option>
        </select>

        <select
          className="w-full p-3 mb-4 border rounded"
          onChange={(e) => setNiveau(e.target.value)}
        >
          <option value="">Choisir un niveau</option>
          <option>Collège</option>
          <option>Lycée</option>
          <option>Supérieur</option>
        </select>

        <input
          type="text"
          placeholder="Chapitre (ex: dérivées, équations...)"
          className="w-full p-3 mb-4 border rounded"
          onChange={(e) => setChapitre(e.target.value)}
        />

        <button
          onClick={generateCourse}
          className="w-full bg-blue-600 text-white p-3 rounded font-bold hover:bg-blue-700"
        >
          {loading ? "Génération..." : "Générer le cours"}
        </button>
      </div>

      {/* RESULTAT */}
      {answer && (
        <div className="mt-10 bg-white text-black p-6 rounded-2xl shadow-xl max-w-3xl whitespace-pre-wrap">
          {answer}
        </div>
      )}
    </main>
  );
}
