"use client";

import { useState } from "react";
import { getSupabaseClient } from "../lib/supabase";

export default function Home() {
  const supabase = getSupabaseClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignup() {
    if (!supabase) return alert("Erreur Supabase");
    setLoading(true);

    const { error } = await supabase.auth.signUp({ email, password });

    if (error) alert(error.message);
    else alert("Compte créé ! Vérifie ton email.");

    setLoading(false);
  }

  async function handleLogin() {
    if (!supabase) return alert("Erreur Supabase");
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) alert(error.message);
    else alert("Connexion réussie !");

    setLoading(false);
  }

  return (
    <main style={styles.page}>
      <section style={styles.hero}>
        <div style={styles.overlay}>
          <nav style={styles.nav}>
            <div style={styles.logo}>🤖 EduAI</div>
            <div style={styles.navLinks}>
              <a style={styles.link}>Générateur</a>
              <a style={styles.link}>Avantages</a>
              <a style={styles.cta}>Connexion</a>
            </div>
          </nav>

          <div style={styles.content}>
            <div style={styles.left}>
              <span style={styles.badge}>✨ IA éducative premium</span>

              <h1 style={styles.title}>
                Apprends plus vite avec une IA scolaire.
              </h1>

              <p style={styles.subtitle}>
                Génère des cours détaillés, exercices corrigés et évaluations
                du collège à la prépa.
              </p>

              <div style={styles.cards}>
                <div style={styles.miniCard}>🎓 Collège → Prépa</div>
                <div style={styles.miniCard}>📚 Maths · Physique · Chimie</div>
                <div style={styles.miniCard}>✅ Corrections incluses</div>
              </div>
            </div>

            <div style={styles.loginCard}>
              <h2 style={styles.loginTitle}>🔐 Connexion</h2>

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
                <button onClick={handleLogin} style={styles.loginBtn}>
                  {loading ? "..." : "Se connecter"}
                </button>

                <button onClick={handleSignup} style={styles.signupBtn}>
                  {loading ? "..." : "Créer un compte"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

const styles: any = {
  page: {
    margin: 0,
    fontFamily: "Arial, sans-serif",
    background: "#0f172a",
    color: "white",
  },

  hero: {
    minHeight: "100vh",
    backgroundImage: `
      linear-gradient(
        120deg,
        rgba(88,28,135,0.92),
        rgba(37,99,235,0.72),
        rgba(14,165,233,0.35)
      ),
      url('/hero.png')
    `,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
  },

  overlay: {
    minHeight: "100vh",
    padding: 28,
  },

  nav: {
    maxWidth: 1280,
    margin: "0 auto",
    padding: "18px 24px",
    borderRadius: 26,
    background: "rgba(15,23,42,0.45)",
    backdropFilter: "blur(18px)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    border: "1px solid rgba(255,255,255,0.2)",
  },

  logo: {
    fontSize: 30,
    fontWeight: 900,
  },

  navLinks: {
    display: "flex",
    gap: 20,
    alignItems: "center",
  },

  link: {
    color: "#e0f2fe",
    fontWeight: 800,
    textDecoration: "none",
  },

  cta: {
    background: "linear-gradient(90deg,#facc15,#fb7185)",
    color: "#111827",
    padding: "12px 18px",
    borderRadius: 16,
    fontWeight: 900,
  },

  content: {
    maxWidth: 1280,
    margin: "90px auto 0",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: 50,
    alignItems: "center",
  },

  left: {
    maxWidth: 680,
  },

  badge: {
    background: "rgba(255,255,255,0.18)",
    padding: "12px 18px",
    borderRadius: 999,
    fontWeight: 900,
    border: "1px solid rgba(255,255,255,0.24)",
  },

  title: {
    fontSize: "clamp(48px, 8vw, 86px)",
    lineHeight: 1,
    letterSpacing: -3,
    margin: "30px 0",
    textShadow: "0 12px 40px rgba(0,0,0,0.35)",
  },

  subtitle: {
    fontSize: 22,
    lineHeight: 1.6,
    color: "#e0f2fe",
  },

  cards: {
    display: "flex",
    gap: 16,
    flexWrap: "wrap",
    marginTop: 35,
  },

  miniCard: {
    background: "rgba(255,255,255,0.16)",
    padding: "18px 22px",
    borderRadius: 22,
    fontWeight: 900,
    border: "1px solid rgba(255,255,255,0.22)",
    backdropFilter: "blur(14px)",
  },

  loginCard: {
    background: "rgba(255,255,255,0.92)",
    color: "#0f172a",
    padding: 36,
    borderRadius: 36,
    boxShadow: "0 35px 100px rgba(0,0,0,0.3)",
    border: "1px solid rgba(255,255,255,0.7)",
  },

  loginTitle: {
    fontSize: 34,
    marginTop: 0,
    marginBottom: 22,
  },

  input: {
    width: "100%",
    padding: 18,
    marginTop: 14,
    borderRadius: 20,
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
