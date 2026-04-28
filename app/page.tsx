"use client";

import { useEffect, useMemo, useState } from "react";
import { data } from "../data/courses";
import { getSupabaseClient } from "../lib/supabase";

export default function Home() {
  const [user, setUser] = useState<any>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [matiere, setMatiere] = useState("");
  const [niveau, setNiveau] = useState("");
  const [chapitre, setChapitre] = useState("");
  const [answer, setAnswer] = useState("");

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const supabase = getSupabaseClient();
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

  const niveaux = useMemo(() => {
    if (!matiere) return [];

    const selected = (data as any)[matiere];
    if (!selected) return [];

    return Object.values(selected).flatMap((categorie: any) =>
      Object.keys(categorie)
    );
  }, [matiere]);

  const chapitres = useMemo(() => {
    if (!matiere || !niveau) return [];

    const selected = (data as any)[matiere];
    if (!selected) return [];

    for (const categorie in selected) {
      if (selected[categorie][niveau]) {
        return selected[categorie][niveau];
      }
    }

    return [];
  }, [matiere, niveau]);

  async function handleSignup() {
    const supabase = getSupabaseClient();

    if (!supabase) {
      alert("Erreur Supabase");
      return;
    }

    const cleanEmail = email.trim();

    if (!cleanEmail || !password) {
      alert("Entre un email et un mot de passe");
      return;
    }

    if (!cleanEmail.includes("@")) {
      alert("Email invalide");
      return;
    }

    if (password.length < 6) {
      alert("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
    });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Compte créé. Tu peux maintenant te connecter.");
  }

  async function handleLogin() {
    const supabase = getSupabaseClient();

    if (!supabase) {
      alert("Erreur Supabase");
      return;
    }

    const cleanEmail = email.trim();

    if (!cleanEmail || !password) {
      alert("Entre un email et un mot de passe");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Connexion réussie");
  }

  async function handleLogout() {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    await supabase.auth.signOut();
    setUser(null);
    setAnswer("");
  }

  async function generateCourse() {
    const supabase = getSupabaseClient();

    if (!matiere || !niveau || !chapitre) {
      alert("Choisis une matière, un niveau et un chapitre");
      return;
    }

    setLoading(true);
    setAnswer("");

    try {
      const question = `
Cours complet de ${matiere}, niveau ${niveau}, chapitre ${chapitre}.
Donne :
1. Un cours détaillé
2. Des définitions simples
3. Des exemples corrigés
4. Des exercices progressifs
5. Les corrections détaillées
6. Une évaluation finale avec barème sur 10
`;

      const res = await fetch("/api/ia", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question }),
      });

      const json = await res.json();
      const content = json.answer || "Erreur IA";

      setAnswer(content);

      if (supabase && user) {
        await supabase.from("courses").insert([
          {
            user_id: user.id,
            matiere,
            niveau,
            chapitre,
            contenu: content,
          },
        ]);
      }
    } catch (error) {
      setAnswer("Erreur pendant la génération du cours.");
    }

    setLoading(false);
  }

  return (
    <main style={styles.page}>
      <section style={styles.hero}>
        <nav style={styles.nav}>
          <div style={styles.logo}>🤖 EduAI</div>

          <div style={styles.navLinks}>
            <a href="#generate" style={styles.link}>
              Générateur
            </a>
            <a href="#features" style={styles.link}>
              Avantages
            </a>
            <a href="#pricing" style={styles.link}>
              Tarifs
            </a>

            {user ? (
              <button onClick={handleLogout} style={styles.navButton}>
                Déconnexion
              </button>
            ) : (
              <a href="#login" style={styles.cta}>
                Connexion
              </a>
            )}
          </div>
        </nav>

        <div style={styles.heroContent}>
          <div style={styles.left}>
            <span style={styles.badge}>✨ IA éducative premium</span>

            <h1 style={styles.title}>
              Apprends plus vite avec une IA scolaire.
            </h1>

            <p style={styles.subtitle}>
              Génère des cours détaillés, exercices corrigés et évaluations du
              collège à la prépa.
            </p>

            <div style={styles.cards}>
              <div style={styles.miniCard}>🎓 Collège → Prépa</div>
              <div style={styles.miniCard}>📚 Maths · Physique · Chimie</div>
              <div style={styles.miniCard}>✅ Corrections incluses</div>
            </div>
          </div>

          <div id="login" style={styles.panel}>
            {!user ? (
              <>
                <h2 style={styles.panelTitle}>🔐 Connexion</h2>

                <input
                  style={styles.input}
                  type="email"
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
                  <button onClick={handleLogin} style={styles.loginBtn}>
                    {loading ? "..." : "Se connecter"}
                  </button>

                  <button onClick={handleSignup} style={styles.signupBtn}>
                    {loading ? "..." : "Créer un compte"}
                  </button>
                </div>
              </>
            ) : (
              <div id="generate">
                <p style={styles.connected}>✅ Connecté : {user.email}</p>

                <h2 style={styles.panelTitle}>🤖 Générateur de cours</h2>

                <select
                  style={styles.input}
                  value={matiere}
                  onChange={(e) => {
                    setMatiere(e.target.value);
                    setNiveau("");
                    setChapitre("");
                  }}
                >
                  <option value="">Choisir une matière</option>
                  {Object.keys(data).map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>

                <select
                  style={styles.input}
                  value={niveau}
                  onChange={(e) => {
                    setNiveau(e.target.value);
                    setChapitre("");
                  }}
                >
                  <option value="">Choisir un niveau</option>
                  {niveaux.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>

                <select
                  style={styles.input}
                  value={chapitre}
                  onChange={(e) => setChapitre(e.target.value)}
                >
                  <option value="">Choisir un chapitre</option>
                  {chapitres.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>

                <button onClick={generateCourse} style={styles.generateBtn}>
                  {loading ? "Génération..." : "✨ Générer mon cours"}
                </button>

                {answer && (
                  <div style={styles.result}>
                    <h3>📘 Cours généré</h3>
                    <pre style={styles.pre}>{answer}</pre>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      <section id="features" style={styles.features}>
        <h2 style={styles.sectionTitle}>Pourquoi EduAI ?</h2>

        <div style={styles.grid}>
          <div style={styles.featureCard}>⚡ Cours générés rapidement</div>
          <div style={styles.featureCard}>🧠 Explications adaptées</div>
          <div style={styles.featureCard}>✍️ Exercices automatiques</div>
          <div style={styles.featureCard}>📊 Évaluation finale</div>
        </div>
      </section>

      <section id="pricing" style={styles.pricing}>
        <h2 style={styles.sectionTitle}>Formules</h2>

        <div style={styles.grid}>
          <div style={styles.priceCard}>
            <h3>Découverte</h3>
            <p>Gratuit</p>
          </div>

          <div style={styles.priceCardPro}>
            <h3>Pro</h3>
            <p>IA illimitée</p>
          </div>

          <div style={styles.priceCard}>
            <h3>Premium</h3>
            <p>IA + visio prof</p>
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
    backgroundRepeat: "no-repeat",
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
    boxShadow: "0 20px 70px rgba(0,0,0,0.25)",
  },

  logo: {
    fontSize: 30,
    fontWeight: 900,
  },

  navLinks: {
    display: "flex",
    gap: 20,
    alignItems: "center",
    flexWrap: "wrap",
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
    textDecoration: "none",
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

  heroContent: {
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
    backdropFilter: "blur(14px)",
  },

  panel: {
    background: "rgba(255,255,255,0.93)",
    color: "#0f172a",
    padding: 36,
    borderRadius: 36,
    boxShadow: "0 35px 100px rgba(0,0,0,0.3)",
    border: "1px solid rgba(255,255,255,0.7)",
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

  generateBtn: {
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

  result: {
    marginTop: 24,
    background: "#0f172a",
    color: "white",
    padding: 20,
    borderRadius: 22,
    maxHeight: 360,
    overflow: "auto",
  },

  pre: {
    whiteSpace: "pre-wrap",
    lineHeight: 1.7,
    fontFamily: "Arial, sans-serif",
  },

  features: {
    padding: "80px 24px",
    background: "linear-gradient(180deg,#0f172a,#1e293b)",
  },

  pricing: {
    padding: "80px 24px",
    background: "#f8fafc",
    color: "#0f172a",
  },

  sectionTitle: {
    textAlign: "center",
    fontSize: "clamp(34px,5vw,54px)",
    marginBottom: 40,
  },

  grid: {
    maxWidth: 1100,
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 20,
  },

  featureCard: {
    background: "rgba(255,255,255,0.09)",
    padding: 26,
    borderRadius: 26,
    fontWeight: 900,
    border: "1px solid rgba(255,255,255,0.14)",
  },

  priceCard: {
    background: "white",
    padding: 28,
    borderRadius: 28,
    boxShadow: "0 20px 60px rgba(15,23,42,0.08)",
  },

  priceCardPro: {
    background: "linear-gradient(135deg,#7c3aed,#2563eb)",
    color: "white",
    padding: 28,
    borderRadius: 28,
    boxShadow: "0 24px 80px rgba(37,99,235,0.25)",
  },
};
