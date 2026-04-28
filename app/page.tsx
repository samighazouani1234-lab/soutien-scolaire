"use client";

import { useEffect, useState } from "react";
import { getSupabaseClient } from "../lib/supabase";

export default function Home() {
  const supabase = getSupabaseClient();

  const [user, setUser] = useState<any>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [matiere, setMatiere] = useState("");
  const [niveau, setNiveau] = useState("");
  const [chapitre, setChapitre] = useState("");
  const [contenu, setContenu] = useState("");

  useEffect(() => {
    if (!supabase) return;

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  async function signUp() {
    if (!supabase) return alert("Supabase non connecté");

    if (!email || !password) {
      alert("Entre un email et un mot de passe");
      return;
    }

    if (password.length < 6) {
      alert("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    });

    if (error) alert(error.message);
    else alert("Compte créé !");
  }

  async function signIn() {
    if (!supabase) return alert("Supabase non connecté");

    if (!email || !password) {
      alert("Entre un email et un mot de passe");
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) alert(error.message);
    else alert("Connexion réussie !");
  }

  async function signOut() {
    if (!supabase) return;

    await supabase.auth.signOut();
    setUser(null);
  }

  async function saveCourse() {
    if (!supabase) return alert("Supabase non connecté");

    if (!user) {
      alert("Connecte-toi d’abord");
      return;
    }

    if (!contenu) {
      alert("Écris un cours avant de sauvegarder");
      return;
    }

    const { error } = await supabase.from("courses").insert([
      {
        user_id: user.id,
        matiere: matiere || "Non précisé",
        niveau: niveau || "Non précisé",
        chapitre: chapitre || "Non précisé",
        contenu,
      },
    ]);

    if (error) {
      alert(error.message);
    } else {
      alert("Cours sauvegardé !");
      setContenu("");
    }
  }

  return (
    <main style={styles.page}>
      <section style={styles.hero}>
        <nav style={styles.nav}>
          <div style={styles.logo}>🤖 EduAI</div>

          {user ? (
            <button onClick={signOut} style={styles.navButton}>
              Déconnexion
            </button>
          ) : (
            <span style={styles.cta}>Connexion</span>
          )}
        </nav>

        <div style={styles.content}>
          <div style={styles.left}>
            <span style={styles.badge}>✨ IA éducative premium</span>

            <h1 style={styles.title}>
              Apprends plus vite avec une IA scolaire.
            </h1>

            <p style={styles.subtitle}>
              Génère, écris et sauvegarde tes cours directement dans ton espace.
            </p>

            <div style={styles.cards}>
              <div style={styles.miniCard}>🎓 Collège → Prépa</div>
              <div style={styles.miniCard}>📚 Maths · Physique · Chimie</div>
              <div style={styles.miniCard}>✅ Corrections incluses</div>
            </div>
          </div>

          <div style={styles.panel}>
            {!user ? (
              <>
                <h2 style={styles.panelTitle}>🔐 Connexion</h2>

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

                <div style={styles.buttonRow}>
                  <button onClick={signIn} style={styles.loginBtn}>
                    Se connecter
                  </button>

                  <button onClick={signUp} style={styles.signupBtn}>
                    Créer un compte
                  </button>
                </div>
              </>
            ) : (
              <>
                <p style={styles.connected}>✅ Connecté : {user.email}</p>

                <h2 style={styles.panelTitle}>📚 Sauvegarder un cours</h2>

                <input
                  style={styles.input}
                  placeholder="Matière"
                  value={matiere}
                  onChange={(e) => setMatiere(e.target.value)}
                />

                <input
                  style={styles.input}
                  placeholder="Niveau"
                  value={niveau}
                  onChange={(e) => setNiveau(e.target.value)}
                />

                <input
                  style={styles.input}
                  placeholder="Chapitre"
                  value={chapitre}
                  onChange={(e) => setChapitre(e.target.value)}
                />

                <textarea
                  style={styles.textarea}
                  placeholder="Écris ton cours ici..."
                  value={contenu}
                  onChange={(e) => setContenu(e.target.value)}
                />

                <button onClick={saveCourse} style={styles.saveBtn}>
                  💾 Sauvegarder dans Supabase
                </button>
              </>
            )}
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
        rgba(88,28,135,0.9),
        rgba(37,99,235,0.75),
        rgba(14,165,233,0.35)
      ),
      url('/hero.png')
    `,
    backgroundSize: "cover",
    backgroundPosition: "center",
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

  cta: {
    background: "linear-gradient(90deg,#facc15,#fb7185)",
    color: "#111827",
    padding: "12px 18px",
    borderRadius: 16,
    fontWeight: 900,
  },

  navButton: {
    background: "rgba(255,255,255,0.15)",
    color: "white",
    border: "1px solid rgba(255,255,255,0.25)",
    padding: "12px 18px",
    borderRadius: 16,
    fontWeight: 900,
    cursor: "pointer",
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
    maxWidth: 700,
  },

  badge: {
    background: "rgba(255,255,255,0.18)",
    padding: "12px 18px",
    borderRadius: 999,
    fontWeight: 900,
    border: "1px solid rgba(255,255,255,0.24)",
    display: "inline-block",
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
  },

  panel: {
    background: "rgba(255,255,255,0.93)",
    color: "#0f172a",
    padding: 36,
    borderRadius: 36,
    boxShadow: "0 35px 100px rgba(0,0,0,0.3)",
  },

  panelTitle: {
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

  textarea: {
    width: "100%",
    minHeight: 160,
    padding: 18,
    marginTop: 14,
    borderRadius: 20,
    border: "1px solid #cbd5e1",
    fontSize: 16,
    boxSizing: "border-box",
  },

  buttonRow: {
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

  saveBtn: {
    width: "100%",
    marginTop: 22,
    padding: 18,
    border: "none",
    borderRadius: 20,
    background: "linear-gradient(90deg,#7c3aed,#2563eb,#06b6d4)",
    color: "white",
    fontWeight: 900,
    cursor: "pointer",
  },

  connected: {
    background: "#dcfce7",
    color: "#166534",
    padding: 12,
    borderRadius: 14,
    fontWeight: 800,
  },
};
