"use client";

import { useEffect, useMemo, useState } from "react";
import { jsPDF } from "jspdf";
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

    return () => listener.subscription.unsubscribe();
  }, []);

  const niveaux = useMemo(() => {
    if (!matiere) return [];
    const selected = (data as any)[matiere];
    if (!selected) return [];
    return Object.values(selected).flatMap((cat: any) => Object.keys(cat));
  }, [matiere]);

  const chapitres = useMemo(() => {
    if (!matiere || !niveau) return [];
    const selected = (data as any)[matiere];
    if (!selected) return [];

    for (const cat in selected) {
      if (selected[cat][niveau]) return selected[cat][niveau];
    }

    return [];
  }, [matiere, niveau]);

  async function handleSignup() {
    const supabase = getSupabaseClient();
    if (!supabase) return alert("Erreur Supabase");

    if (!email.trim() || !password) {
      alert("Entre un email et un mot de passe");
      return;
    }

    if (password.length < 6) {
      alert("Mot de passe minimum 6 caractères");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    });

    setLoading(false);

    if (error) alert(error.message);
    else alert("Compte créé !");
  }

  async function handleLogin() {
    const supabase = getSupabaseClient();
    if (!supabase) return alert("Erreur Supabase");

    if (!email.trim() || !password) {
      alert("Entre un email et un mot de passe");
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    setLoading(false);

    if (error) alert(error.message);
    else {
      setUser(data.user);
      alert("Connexion réussie");
    }
  }

  async function handleLogout() {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    await supabase.auth.signOut();
    setUser(null);
    setAnswer("");
  }

  async function generateCourse() {
    if (!user) {
      alert("Connecte-toi pour générer un cours");
      return;
    }

    if (!matiere || !niveau || !chapitre) {
      alert("Choisis une matière, un niveau et un chapitre");
      return;
    }

    setLoading(true);
    setAnswer("");

    const question = `
Crée un cours scolaire premium.

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
8. Évaluation finale avec barème sur 20
9. Résumé à retenir
`;

    try {
      const res = await fetch("/api/ia", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question }),
      });

      const json = await res.json();
      setAnswer(json.answer || "Erreur IA");
    } catch {
      setAnswer("Erreur serveur IA.");
    }

    setLoading(false);
  }

  function downloadPDF() {
    if (!answer) {
      alert("Génère d’abord un cours");
      return;
    }

    const pdf = new jsPDF("p", "mm", "a4");

    const title = `${matiere} - ${niveau}`;
    const subtitle = chapitre;

    let y = 18;

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(18);
    pdf.text(title, 15, y);

    y += 9;

    pdf.setFontSize(13);
    pdf.setTextColor(37, 99, 235);
    pdf.text(subtitle, 15, y);

    y += 12;

    pdf.setTextColor(0, 0, 0);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(11);

    const lines = pdf.splitTextToSize(answer, 180);

    lines.forEach((line: string) => {
      if (y > 280) {
        pdf.addPage();
        y = 18;
      }

      pdf.text(line, 15, y);
      y += 6;
    });

    pdf.save(`cours-${chapitre}.pdf`);
  }

  return (
    <main style={styles.page}>
      <section style={styles.hero}>
        <nav style={styles.nav}>
          <div style={styles.logo}>🤖 EduAI</div>

          <div style={styles.navLinks}>
            <a href="#generator" style={styles.link}>Générateur</a>
            <a href="#features" style={styles.link}>Avantages</a>

            {user ? (
              <button onClick={handleLogout} style={styles.logout}>
                Déconnexion
              </button>
            ) : (
              <a href="#login" style={styles.cta}>Connexion</a>
            )}
          </div>
        </nav>

        <div style={styles.heroGrid}>
          <div style={styles.left}>
            <span style={styles.badge}>✨ IA éducative premium</span>

            <h1 style={styles.title}>
              Génère des cours haut de gamme avec l’IA.
            </h1>

            <p style={styles.subtitle}>
              Cours détaillés, exercices corrigés, évaluations et PDF en quelques secondes.
            </p>

            <div style={styles.tags}>
              <span style={styles.tag}>🎓 Collège → Prépa</span>
              <span style={styles.tag}>📚 Maths · Physique · Chimie</span>
              <span style={styles.tag}>📄 PDF téléchargeable</span>
            </div>
          </div>

          <div id="login" style={styles.card}>
            {!user ? (
              <>
                <h2 style={styles.cardTitle}>🔐 Connexion</h2>

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

                <div style={styles.row}>
                  <button onClick={handleLogin} style={styles.blueBtn}>
                    {loading ? "..." : "Se connecter"}
                  </button>

                  <button onClick={handleSignup} style={styles.purpleBtn}>
                    {loading ? "..." : "Créer un compte"}
                  </button>
                </div>
              </>
            ) : (
              <div id="generator">
                <p style={styles.connected}>✅ Connecté : {user.email}</p>

                <h2 style={styles.cardTitle}>Créer un cours</h2>

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
                  {niveaux.map((n: any) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>

                <select
                  style={styles.input}
                  value={chapitre}
                  onChange={(e) => setChapitre(e.target.value)}
                >
                  <option value="">Choisir un chapitre</option>
                  {chapitres.map((c: any) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>

                <button onClick={generateCourse} style={styles.generateBtn}>
                  {loading ? "Génération..." : "✨ Générer le cours"}
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {answer && (
        <section style={styles.resultSection}>
          <div style={styles.resultHeader}>
            <h2>📘 Cours généré</h2>

            <button onClick={downloadPDF} style={styles.pdfBtn}>
              📄 Télécharger PDF
            </button>
          </div>

          <div style={styles.result}>
            <h1 style={styles.pdfTitle}>{matiere} — {niveau}</h1>
            <h2 style={styles.pdfSubtitle}>{chapitre}</h2>
            <pre style={styles.pre}>{answer}</pre>
          </div>
        </section>
      )}

      <section id="features" style={styles.features}>
        <h2 style={styles.sectionTitle}>Pourquoi EduAI ?</h2>

        <div style={styles.grid}>
          <div style={styles.featureCard}>⚡ Génération rapide</div>
          <div style={styles.featureCard}>🧠 Explications détaillées</div>
          <div style={styles.featureCard}>✍️ Exercices corrigés</div>
          <div style={styles.featureCard}>📄 Export PDF</div>
        </div>
      </section>
    </main>
  );
}

const styles: any = {
  page: {
    margin: 0,
    fontFamily: "Arial, sans-serif",
    background: "#020617",
    color: "white",
    minHeight: "100vh",
  },

  hero: {
    minHeight: "100vh",
    padding: 28,
    backgroundImage: `
      linear-gradient(
        120deg,
        rgba(88,28,135,0.9),
        rgba(37,99,235,0.78),
        rgba(14,165,233,0.35)
      ),
      url('/hero.png')
    `,
    backgroundSize: "cover",
    backgroundPosition: "center",
  },

  nav: {
    maxWidth: 1280,
    margin: "0 auto",
    padding: "18px 24px",
    borderRadius: 26,
    background: "rgba(15,23,42,0.55)",
    backdropFilter: "blur(18px)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    border: "1px solid rgba(255,255,255,0.18)",
  },

  logo: {
    fontSize: 30,
    fontWeight: 900,
  },

  navLinks: {
    display: "flex",
    gap: 18,
    alignItems: "center",
    flexWrap: "wrap",
  },

  link: {
    color: "#e0f2fe",
    fontWeight: 900,
    textDecoration: "none",
  },

  cta: {
    background: "linear-gradient(90deg,#facc15,#fb7185)",
    color: "#111827",
    padding: "13px 20px",
    borderRadius: 18,
    fontWeight: 900,
    textDecoration: "none",
  },

  logout: {
    background: "#ef4444",
    color: "white",
    border: 0,
    padding: "13px 20px",
    borderRadius: 18,
    fontWeight: 900,
    cursor: "pointer",
  },

  heroGrid: {
    maxWidth: 1280,
    margin: "90px auto 0",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))",
    gap: 50,
    alignItems: "center",
  },

  left: {
    maxWidth: 720,
  },

  badge: {
    display: "inline-block",
    background: "rgba(255,255,255,0.18)",
    padding: "12px 18px",
    borderRadius: 999,
    fontWeight: 900,
    border: "1px solid rgba(255,255,255,0.25)",
  },

  title: {
    fontSize: "clamp(48px,8vw,86px)",
    lineHeight: 1,
    letterSpacing: -3,
    margin: "30px 0",
    textShadow: "0 12px 40px rgba(0,0,0,0.4)",
  },

  subtitle: {
    fontSize: 22,
    lineHeight: 1.6,
    color: "#e0f2fe",
    maxWidth: 680,
  },

  tags: {
    display: "flex",
    gap: 14,
    flexWrap: "wrap",
    marginTop: 34,
  },

  tag: {
    background: "rgba(255,255,255,0.16)",
    padding: "16px 20px",
    borderRadius: 20,
    fontWeight: 900,
    border: "1px solid rgba(255,255,255,0.22)",
  },

  card: {
    background: "rgba(255,255,255,0.95)",
    color: "#0f172a",
    padding: 36,
    borderRadius: 36,
    boxShadow: "0 35px 100px rgba(0,0,0,0.32)",
  },

  cardTitle: {
    fontSize: 34,
    marginTop: 0,
  },

  input: {
    width: "100%",
    padding: 17,
    marginTop: 14,
    borderRadius: 18,
    border: "1px solid #cbd5e1",
    fontSize: 16,
    boxSizing: "border-box",
  },

  row: {
    display: "flex",
    gap: 14,
    marginTop: 22,
  },

  blueBtn: {
    flex: 1,
    padding: 16,
    border: "none",
    borderRadius: 18,
    background: "#2563eb",
    color: "white",
    fontWeight: 900,
    cursor: "pointer",
  },

  purpleBtn: {
    flex: 1,
    padding: 16,
    border: "none",
    borderRadius: 18,
    background: "#7c3aed",
    color: "white",
    fontWeight: 900,
    cursor: "pointer",
  },

  connected: {
    background: "#dcfce7",
    color: "#166534",
    padding: 12,
    borderRadius: 14,
    fontWeight: 900,
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
    fontSize: 16,
  },

  resultSection: {
    maxWidth: 1100,
    margin: "0 auto",
    padding: "60px 24px",
  },

  resultHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: 20,
    alignItems: "center",
    flexWrap: "wrap",
    marginBottom: 20,
  },

  pdfBtn: {
    background: "linear-gradient(90deg,#22c55e,#06b6d4)",
    color: "white",
    padding: "14px 20px",
    border: "none",
    borderRadius: 18,
    fontWeight: 900,
    cursor: "pointer",
  },

  result: {
    background: "white",
    color: "#0f172a",
    padding: 34,
    borderRadius: 28,
    boxShadow: "0 25px 80px rgba(0,0,0,0.3)",
  },

  pdfTitle: {
    marginTop: 0,
    fontSize: 34,
  },

  pdfSubtitle: {
    color: "#2563eb",
  },

  pre: {
    whiteSpace: "pre-wrap",
    fontFamily: "Arial, sans-serif",
    lineHeight: 1.7,
    fontSize: 16,
  },

  features: {
    padding: "80px 24px",
    background: "linear-gradient(180deg,#0f172a,#1e293b)",
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
    gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
    gap: 20,
  },

  featureCard: {
    background: "rgba(255,255,255,0.09)",
    padding: 26,
    borderRadius: 26,
    fontWeight: 900,
    border: "1px solid rgba(255,255,255,0.14)",
  },
};
