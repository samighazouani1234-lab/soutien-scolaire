"use client";

import { useEffect, useState } from "react";
import { getSupabaseClient } from "../lib/supabase";

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const supabase = getSupabaseClient();

    if (!supabase) {
      console.error("Supabase non initialisé");
      return;
    }

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoading(false);
    });
  }, []);

  async function handleSave() {
    const supabase = getSupabaseClient();

    if (!supabase || !user) {
      alert("Erreur connexion");
      return;
    }

    const { error } = await supabase.from("courses").insert([
      {
        user_id: user.id,
        matiere: "Maths",
        niveau: "Terminale",
        chapitre: "Limites",
        contenu: message,
      },
    ]);

    if (error) {
      alert("Erreur : " + error.message);
    } else {
      alert("Sauvegardé !");
      setMessage("");
    }
  }

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-black text-white">
        Chargement...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6">

      {/* HERO */}
      <div className="text-center max-w-2xl">
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-500 to-purple-500 text-transparent bg-clip-text">
          Soutien scolaire IA 🚀
        </h1>

        <p className="text-gray-400 mb-8">
          Génère des cours automatiquement avec intelligence artificielle
        </p>
      </div>

      {/* USER */}
      <div className="mb-6">
        {user ? (
          <p className="text-green-400">Connecté : {user.email}</p>
        ) : (
          <p className="text-red-400">Non connecté</p>
        )}
      </div>

      {/* INPUT */}
      <div className="w-full max-w-xl">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Écris ton cours ici..."
          className="w-full p-4 rounded-lg bg-gray-900 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button
          onClick={handleSave}
          className="mt-4 w-full py-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg font-semibold hover:opacity-90 transition"
        >
          Sauvegarder dans Supabase
        </button>
      </div>

    </main>
  );
}
