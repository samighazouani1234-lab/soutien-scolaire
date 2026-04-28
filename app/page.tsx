"use client";

import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase";

export default function Home() {
  const supabase = getSupabaseClient();

  const [user, setUser] = useState<any>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [content, setContent] = useState("");

  // Vérifier utilisateur connecté
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });
  }, []);

  // INSCRIPTION
  const signUp = async () => {
    if (!email || !password) {
      alert("Remplis les champs");
      return;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) alert(error.message);
    else alert("Compte créé !");
  };

  // CONNEXION
  const signIn = async () => {
    const { error, data } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) alert(error.message);
    else setUser(data.user);
  };

  // SAUVEGARDE COURS
  const saveCourse = async () => {
    if (!content) {
      alert("Écris quelque chose");
      return;
    }

    const { error } = await supabase.from("courses").insert([
      {
        content,
        user_id: user.id,
      },
    ]);

    if (error) alert(error.message);
    else {
      alert("Cours sauvegardé !");
      setContent("");
    }
  };

  // 🔐 SI PAS CONNECTÉ → LOGIN
  if (!user) {
    return (
      <main style={{ padding: 40 }}>
        <h1>🔐 Connexion</h1>

        <input
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />
        <br /><br />

        <input
          type="password"
          placeholder="Mot de passe"
          onChange={(e) => setPassword(e.target.value)}
        />
        <br /><br />

        <button onClick={signIn}>Se connecter</button>
        <button onClick={signUp}>S'inscrire</button>
      </main>
    );
  }

  // ✅ SI CONNECTÉ → ÉCRIRE COURS
  return (
    <main style={{ padding: 40 }}>
      <h1>📚 Ton espace</h1>

      <textarea
        placeholder="Écris ton cours ici..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        style={{ width: "100%", height: 150 }}
      />

      <br /><br />

      <button onClick={saveCourse}>
        💾 Sauvegarder
      </button>
    </main>
  );
}
