"use client";

import { useState } from "react";
import { getSupabaseClient } from "../lib/supabase";

export default function Home() {
  const supabase = getSupabaseClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSignup() {
    if (!email || !password) {
      alert("Entre un email et un mot de passe");
      return;
    }

    if (password.length < 6) {
      alert("Mot de passe minimum 6 caractères");
      return;
    }

    if (!supabase) {
      alert("Erreur Supabase");
      return;
    }

    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    });

    if (error) alert(error.message);
    else alert("Compte créé ! Vérifie ton email.");
  }

  async function handleLogin() {
    if (!email || !password) {
      alert("Entre un email et un mot de passe");
      return;
    }

    if (!supabase) {
      alert("Erreur Supabase");
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) alert(error.message);
    else alert("Connexion réussie !");
  }

  return (
    <main style={styles.page}>
      <section style={styles.hero}>
        <div style={styles.card}>
          <h1 style={styles.title}>🎓 EduAI</h1>
          <p style={styles.subtitle}>
            Apprends plus vite avec une IA scolaire.
          </p>

          <input
            style={styles.input}
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            style={styles.input}
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <div style={styles.buttons}>
            <button style={styles.loginBtn} onClick={handleLogin}>
              Se connecter
            </button>

            <button style={styles.signupBtn} onClick={handleSignup}>
              Créer un compte
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}

const styles: any = {
  page: {
    margin: 0,
    minHeight: "100vh",
    fontFamily: "Arial, sans-serif",
    background: "#0f172a",
  },
  hero: {
    minHeight: "100vh",
    backgroundImage: `
      linear-gradient(120deg, rgba(88,28,135,0.9), rgba(37,99,235,0.7)),
      url('/hero.png')
    `,
    backgroundSize: "cover",
    backgroundPosition: "center",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  card: {
    width: "100%",
    maxWidth: 460,
    background: "rgba(255,255,255,0.92)",
    padding: 36,
    borderRadius: 32,
    boxShadow: "0 30px 90px rgba(0,0,0,0.35)",
  },
  title: {
    fontSize: 42,
    margin: 0,
    color: "#0f172a",
  },
  subtitle: {
    color: "#475569",
    fontSize: 18,
    marginBottom: 24,
  },
  input: {
    width: "100%",
    padding: 16,
    marginTop: 14,
    borderRadius: 18,
    border: "1px solid #cbd5e1",
    fontSize: 16,
    boxSizing: "border-box",
  },
  buttons: {
    display: "flex",
    gap: 14,
    marginTop: 22,
  },
  loginBtn: {
    flex: 1,
    padding: 16,
    border: "none",
    borderRadius: 18,
    background: "#2563eb",
    color: "white",
    fontWeight: 900,
    cursor: "pointer",
  },
  signupBtn: {
    flex: 1,
    padding: 16,
    border: "none",
    borderRadius: 18,
    background: "#7c3aed",
    color: "white",
    fontWeight: 900,
    cursor: "pointer",
  },
};
