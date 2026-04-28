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
      (_event, session) => setUser(session?.user || null)
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  const niveaux = useMemo(() => {
    if (!matiere) return [];
    return Object.values((data as any)[matiere]).flatMap((cat: any) =>
      Object.keys(cat)
    );
  }, [matiere]);

  const chapitres = useMemo(() => {
    if (!matiere || !niveau) return [];
    const categories = (data as any)[matiere];

    for (const cat in categories) {
      if (categories[cat][niveau]) return categories[cat][niveau];
    }

    return [];
  }, [matiere, niveau]);

  async function signUp() {
    const supabase = getSupabaseClient();
    if (!supabase) return alert("Supabase non connecté");

    const { error } = await supabase.auth.signUp({ email, password });
    if (error) alert(error.message);
    else alert("Compte créé !");
  }

  async function signIn() {
    const supabase = getSupabaseClient();
    if (!supabase) return alert("Supabase non connecté");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) alert(error.message);
    else alert("Connecté !");
  }

  async function signOut() {
    const supabase = getSupabaseClient();
    if (!supabase) return;
    await supabase.auth.signOut();
    setUser(null);
  }

  async function generate() {
    if (!matiere || !niveau || !chapitre) {
      alert("Choisis matière, niveau et chapitre");
      return;
    }

    setLoading(true);
    setAnswer("");

    const question = `
Cours complet de ${matiere}, niveau ${niveau}, chapitre ${chapitre}.
Donne :
1. Cours détaillé
2. Définitions simples
3. Exemples corrigés
4. Exercices progressifs
5. Corrections détaillées
6. Évaluation finale avec barème sur 10
`;

    const res = await fetch("/api/ia", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ question }),
    });

    const dataRes = await res.json();
    const content = dataRes.answer || "Erreur IA";

    setAnswer(content);

    const supabase = getSupabaseClient();

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

    setLoading(false);
  }

  return (
    <main style={styles.page}>
      <section style={styles.hero}>
        <nav style={styles.nav}>
          <div style={styles.logo}>🤖 EduAI</div>

          <div style={styles.navLinks}>
            <a href="#ia" style={styles.link}>Générateur</a>
            <a href="#features" style={styles.link}>Avantages</a>
            <a href="#pricing" style={styles.link}>Tarifs</a>

            {user ? (
              <button onClick={signOut} style={styles.logout}>
                Déconnexion
              </button>
            ) : (
              <a href="#login" style={styles.ctaSmall}>Connexion</a>
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
              Génère des cours détaillés, exercices corrigés et évaluations du collège à la prépa.
            </p>

            <div style={styles.heroCards}>
              <div style={styles.miniCard}>🎓 Collège → Prépa</div>
              <div style={styles.miniCard}>📚 Maths · Physique · Chimie</div>
              <div style={styles.miniCard}>✅ Corrections incluses</div>
            </div>
          </div>

          <div id="ia" style={styles.generator}>
            {!user && (
              <div id="login">
                <h2 style={styles.generatorTitle}>🔐 Connexion</h2>

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

                <div style={styles.authButtons}>
                  <button onClick={signIn} style={styles.buttonSmall}>
                    Se connecter
                  </button>
                  <button onClick={signUp} style={styles.buttonSmallAlt}>
                    Créer un compte
                  </button>
                </div>
              </div>
            )}

            {user && (
              <>
                <p style={styles.connected}>✅ Connecté : {user.email}</p>

                <h2 style={styles.generatorTitle}>🤖 Générateur de cours</h2>

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
                    <option key={m} value={m}>{m}</option>
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
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>

                <select
                  style={styles.input}
                  value={chapitre}
                  onChange={(e) => setChapitre(e.target.value)}
                >
                  <option value="">Choisir un chapitre</option>
                  {chapitres.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>

                <button onClick={generate} style={styles.button}>
                  {loading ? "⏳ Génération..." : "✨ Générer mon cours"}
                </button>

                {answer && (
                  <div style={styles.result}>
                    <h3 style={{ marginTop: 0 }}>📘 Cours généré</h3>
                    <pre style={styles.pre}>{answer}</pre>
                  </div>
                )}
              </>
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
    fontFamily: "Inter, Arial, sans-serif",
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
    padding: 24,
  },

  nav: {
    maxWidth: 1280,
    margin: "0 auto",
    padding: "18px 24px",
    borderRadius: 24,
    background: "rgba(15,23,42,0.45)",
    backdropFilter: "blur(20px)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    boxShadow: "0 20px 70px rgba(0,0,0,0.25)",
    border: "1px solid rgba(255,255,255,0.18)",
  },

  logo: {
    fontSize: 26,
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
    textDecoration: "none",
    fontWeight: 800,
  },

  ctaSmall: {
    background: "linear-gradient(90deg,#facc15,#fb7185)",
    color: "#0f172a",
    padding: "12px 18px",
    borderRadius: 16,
    fontWeight: 900,
    textDecoration: "none",
  },

  logout: {
    background: "rgba(255,255,255,0.18)",
    color: "white",
    padding: "12px 18px",
    borderRadius: 16,
    border: "1px solid rgba(255,255,255,0.25)",
    cursor: "pointer",
    fontWeight: 900,
  },

  heroContent: {
    maxWidth: 1280,
    margin: "80px auto 0",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: 40,
    alignItems: "center",
  },

  left: {
    maxWidth: 650,
  },

  badge: {
    background: "rgba(255,255,255,0.18)",
    color: "white",
    padding: "10px 16px",
    borderRadius: 999,
    fontWeight: 900,
    display: "inline-block",
    border: "1px solid rgba(255,255,255,0.22)",
  },

  title: {
    fontSize: "clamp(46px, 8vw, 82px)",
    lineHeight: 1,
    letterSpacing: -3,
    margin: "28px 0",
    color: "white",
    textShadow: "0 10px 40px rgba(0,0,0,0.35)",
  },

  subtitle: {
    fontSize: 22,
    lineHeight: 1.6,
    color: "#e0f2fe",
    maxWidth: 620,
  },

  heroCards: {
    display: "flex",
    gap: 16,
    flexWrap: "wrap",
    marginTop: 34,
  },

  miniCard: {
    background: "rgba(255,255,255,0.16)",
    color: "white",
    padding: 18,
    borderRadius: 20,
    fontWeight: 900,
    border: "1px solid rgba(255,255,255,0.22)",
    backdropFilter: "blur(14px)",
  },

  generator: {
    background:
      "linear-gradient(180deg, rgba(255,255,255,0.94), rgba(239,246,255,0.9))",
    color: "#0f172a",
    backdropFilter: "blur(20px)",
    padding: 30,
    borderRadius: 34,
    boxShadow: "0 35px 100px rgba(0,0,0,0.28)",
    border: "1px solid rgba(255,255,255,0.65)",
  },

  generatorTitle: {
    marginTop: 0,
    marginBottom: 8,
    fontSize: 30,
  },

  connected: {
    background: "#dcfce7",
    color: "#166534",
    padding: 12,
    borderRadius: 14,
    fontWeight: 800,
  },

  input: {
    width: "100%",
    padding: 16,
    borderRadius: 18,
    border: "1px solid #cbd5e1",
    marginTop: 14,
    fontSize: 16,
    boxSizing: "border-box",
    background: "white",
    color: "#0f172a",
  },

  authButtons: {
    display: "flex",
    gap: 12,
    marginTop: 18,
    flexWrap: "wrap",
  },

  buttonSmall: {
    flex: 1,
    padding: 14,
    borderRadius: 16,
    border: 0,
    background: "#2563eb",
    color: "white",
    fontWeight: 900,
    cursor: "pointer",
  },

  buttonSmallAlt: {
    flex: 1,
    padding: 14,
    borderRadius: 16,
    border: 0,
    background: "#7c3aed",
    color: "white",
    fontWeight: 900,
    cursor: "pointer",
  },

  button: {
    width: "100%",
    marginTop: 22,
    padding: 18,
    borderRadius: 20,
    border: 0,
    background: "linear-gradient(90deg,#7c3aed,#2563eb,#06b6d4)",
    color: "white",
    fontWeight: 900,
    fontSize: 16,
    cursor: "pointer",
    boxShadow: "0 16px 40px rgba(37,99,235,0.35)",
  },

  result: {
    marginTop: 24,
    background: "#0f172a",
    color: "white",
    padding: 20,
    borderRadius: 22,
    maxHeight: 360,
    overflow: "auto",
    fontSize: 14,
  },

  pre: {
    whiteSpace: "pre-wrap",
    margin: 0,
    fontFamily: "Inter, Arial, sans-serif",
    lineHeight: 1.7,
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
