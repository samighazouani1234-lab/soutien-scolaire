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

    return () => listener.subscription.unsubscribe();
  }, []);

  const niveaux = useMemo(() => {
    if (!matiere) return [];
    const selected = (data as any)[matiere];
    if (!selected) return [];

    return Object.values(selected).flatMap((category: any) =>
      Object.keys(category)
    );
  }, [matiere]);

  const chapitres = useMemo(() => {
    if (!matiere || !niveau) return [];
    const selected = (data as any)[matiere];
    if (!selected) return [];

    for (const category in selected) {
      if (selected[category][niveau]) {
        return selected[category][niveau];
      }
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
    else alert("Compte créé. Tu peux te connecter.");
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
    else setUser(data.user);
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
      alert("Choisis matière, niveau et chapitre");
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
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ question })
      });

      const json = await res.json();
      setAnswer(json.answer || "Erreur IA");
    } catch {
      setAnswer("Erreur serveur IA.");
    }

    setLoading(false);
  }

  function downloadPDF() {
    window.print();
  }

  return (
    <>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #print-area, #print-area * { visibility: visible; }
          #print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white;
            color: black;
            padding: 40px;
          }
          .no-print { display: none !important; }
        }
      `}</style>

      <main style={styles.page}>
        <section style={styles.hero} className="no-print">
          <nav style={styles.nav}>
            <div style={styles.logo}>🎓 EduAI</div>

            <div style={styles.navLinks}>
              <a href="#generator" style={styles.link}>Générateur</a>

              {user ? (
                <button onClick={handleLogout} style={styles.logout}>
                  Déconnexion
                </button>
              ) : (
                <a href="#login" style={styles.navButton}>Connexion</a>
              )}
            </div>
          </nav>

          <div style={styles.grid}>
            <div>
              <span style={styles.badge}>IA scolaire premium</span>

              <h1 style={styles.title}>
                Génère des cours haut de gamme avec l’IA.
              </h1>

              <p style={styles.subtitle}>
                Cours détaillés, exercices corrigés, évaluations et export PDF.
              </p>
            </div>

            <div id="login" style={styles.card}>
              {!user ? (
                <>
                  <h2 style={styles.cardTitle}>Connexion</h2>

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

                  <button onClick={handleLogin} style={styles.button}>
                    {loading ? "Connexion..." : "Se connecter"}
                  </button>

                  <button onClick={handleSignup} style={styles.secondaryButton}>
                    Créer un compte
                  </button>
                </>
              ) : (
                <div id="generator">
                  <p style={styles.connected}>Connecté : {user.email}</p>

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

                  <button onClick={generateCourse} style={styles.button}>
                    {loading ? "Génération..." : "✨ Générer le cours"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

        {answer && (
          <section style={styles.resultWrap}>
            <div style={styles.resultHeader} className="no-print">
              <h2>📘 Cours généré</h2>
              <button onClick={downloadPDF} style={styles.pdfButton}>
                📄 Télécharger PDF
              </button>
            </div>

            <div id="print-area" style={styles.result}>
              <h1>{matiere} — {niveau}</h1>
              <h2 style={{ color: "#2563eb" }}>{chapitre}</h2>
              <pre style={styles.pre}>{answer}</pre>
            </div>
          </section>
        )}
      </main>
    </>
  );
}

const styles: any = {
  page: {
    minHeight: "100vh",
    background: "#020617",
    color: "white",
    fontFamily: "Arial, sans-serif",
  },
  hero: {
    minHeight: "100vh",
    padding: 28,
    background:
      "radial-gradient(circle at top left,#22d3ee55,transparent 30%), radial-gradient(circle at top right,#a855f755,transparent 30%), linear-gradient(135deg,#020617,#0f172a)",
  },
  nav: {
    maxWidth: 1200,
    margin: "0 auto",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logo: {
    fontSize: 28,
    fontWeight: 900,
  },
  navLinks: {
    display: "flex",
    gap: 16,
    alignItems: "center",
  },
  link: {
    color: "white",
    textDecoration: "none",
    fontWeight: 900,
  },
  navButton: {
    background: "white",
    color: "#020617",
    padding: "12px 20px",
    borderRadius: 999,
    fontWeight: 900,
    textDecoration: "none",
  },
  logout: {
    background: "#ef4444",
    color: "white",
    padding: "12px 20px",
    borderRadius: 999,
    border: "none",
    fontWeight: 900,
    cursor: "pointer",
  },
  grid: {
    maxWidth: 1200,
    margin: "90px auto",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))",
    gap: 50,
    alignItems: "center",
  },
  badge: {
    background: "rgba(255,255,255,0.12)",
    padding: "10px 16px",
    borderRadius: 999,
    color: "#a5f3fc",
    fontWeight: 900,
  },
  title: {
    fontSize: "clamp(48px,8vw,82px)",
    lineHeight: 1,
    letterSpacing: -3,
  },
  subtitle: {
    fontSize: 21,
    color: "#cbd5e1",
    lineHeight: 1.6,
  },
  card: {
    background: "rgba(255,255,255,0.95)",
    color: "#0f172a",
    padding: 32,
    borderRadius: 34,
    boxShadow: "0 35px 100px rgba(0,0,0,0.45)",
  },
  cardTitle: {
    fontSize: 30,
    marginTop: 0,
  },
  input: {
    width: "100%",
    padding: 16,
    marginTop: 14,
    borderRadius: 16,
    border: "1px solid #cbd5e1",
    boxSizing: "border-box",
  },
  button: {
    width: "100%",
    marginTop: 20,
    padding: 17,
    border: "none",
    borderRadius: 18,
    background: "linear-gradient(90deg,#22d3ee,#a855f7)",
    color: "white",
    fontWeight: 900,
    cursor: "pointer",
  },
  secondaryButton: {
    width: "100%",
    marginTop: 12,
    padding: 17,
    border: "none",
    borderRadius: 18,
    background: "#0f172a",
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
  resultWrap: {
    maxWidth: 1000,
    margin: "0 auto",
    padding: 32,
  },
  resultHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 20,
  },
  pdfButton: {
    background: "#22c55e",
    color: "white",
    padding: "14px 20px",
    borderRadius: 16,
    border: "none",
    fontWeight: 900,
    cursor: "pointer",
  },
  result: {
    background: "white",
    color: "#0f172a",
    padding: 32,
    borderRadius: 26,
    marginTop: 20,
  },
  pre: {
    whiteSpace: "pre-wrap",
    lineHeight: 1.7,
    fontFamily: "Arial, sans-serif",
  },
};
