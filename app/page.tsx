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

  const [showQuiz, setShowQuiz] = useState(true);
  const [showExercises, setShowExercises] = useState(true);
  const [showShortCorrections, setShowShortCorrections] = useState(false);
  const [showDetailedCorrections, setShowDetailedCorrections] = useState(false);
  const [showVideo, setShowVideo] = useState(false);

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

  function getSection(title: string) {
    if (!answer) return "";
    const regex = new RegExp(`### ${title}([\\s\\S]*?)(?=### |$)`);
    return answer.match(regex)?.[1]?.trim() || "";
  }

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
    else alert("Compte créé. Tu peux maintenant te connecter.");
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
    setShowQuiz(true);
    setShowExercises(true);
    setShowShortCorrections(false);
    setShowDetailedCorrections(false);
    setShowVideo(false);

    const question = `
Crée un cours scolaire PREMIUM en français.

Matière : ${matiere}
Niveau : ${niveau}
Chapitre : ${chapitre}

Réponds obligatoirement avec ces séparateurs exacts :

### COURS
1. Objectifs du chapitre
2. Introduction simple et motivante
3. Cours détaillé et progressif
4. Définitions importantes
5. Méthodes étape par étape
6. Exemples corrigés
7. Résumé à retenir
8. Fiche méthode

### QUIZ_AUTOMATISE
Crée 10 questions progressives.
Pour chaque question :
- question
- choix A/B/C/D si possible
- bonne réponse indiquée clairement

### EXERCICES_PROGRESSIFS
Crée des exercices :
- Niveau 1 : facile
- Niveau 2 : moyen
- Niveau 3 : difficile
- Niveau 4 : défi / examen

### CORRECTIONS_COURTES
Donne les corrections courtes de tous les exercices et quiz.

### CORRECTIONS_DETAILLEES
Donne les corrections détaillées étape par étape de tous les exercices.

### COURS_VIDEO
Crée une proposition de cours vidéo :
- titre de la vidéo
- durée recommandée
- script minute par minute
- idées de visuels à afficher
- phrase d’introduction
- phrase de conclusion

Important :
- Le cours doit être adapté au niveau ${niveau}
- Ne saute aucune étape
- Explique simplement
- Donne beaucoup d’exemples
- Structure avec des titres clairs
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

      setTimeout(() => {
        document.getElementById("result")?.scrollIntoView({
          behavior: "smooth",
        });
      }, 300);
    } catch {
      setAnswer("Erreur serveur IA.");
    }

    setLoading(false);
  }

  function downloadPDF() {
    document.title = `Cours-${matiere}-${chapitre}`;
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
            background: white !important;
            color: black !important;
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
              <a href="#generator" style={styles.link}>
                Générateur
              </a>
              <a href="#features" style={styles.link}>
                Avantages
              </a>

              {user ? (
                <button onClick={handleLogout} style={styles.logout}>
                  Déconnexion
                </button>
              ) : (
                <a href="#login" style={styles.navButton}>
                  Connexion
                </a>
              )}
            </div>
          </nav>

          <div style={styles.grid}>
            <div>
              <span style={styles.badge}>✨ IA scolaire premium</span>

              <h1 style={styles.title}>
                Génère des cours haut de gamme avec l’IA.
              </h1>

              <p style={styles.subtitle}>
                Cours détaillés, quiz automatiques, exercices progressifs,
                corrections cachées, scripts vidéo et export PDF.
              </p>

              <div style={styles.tags}>
                <span style={styles.tag}>🎓 Collège → Prépa</span>
                <span style={styles.tag}>📚 Maths · Physique · Chimie</span>
                <span style={styles.tag}>📄 PDF exportable</span>
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

                  <button onClick={handleLogin} style={styles.button}>
                    {loading ? "Connexion..." : "Se connecter"}
                  </button>

                  <button onClick={handleSignup} style={styles.secondaryButton}>
                    Créer un compte
                  </button>
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
                    {niveaux.map((n: any) => (
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
                    {chapitres.map((c: any) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>

                  <button onClick={generateCourse} style={styles.button}>
                    {loading ? "Génération en cours..." : "✨ Générer le cours"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

        {answer && (
          <section id="result" style={styles.resultWrap}>
            <div style={styles.resultHeader} className="no-print">
              <h2>📘 Cours généré</h2>

              <div style={styles.resultButtons}>
                <button
                  onClick={() => setShowQuiz(!showQuiz)}
                  style={styles.smallButton}
                >
                  {showQuiz ? "Masquer quiz" : "Voir quiz"}
                </button>

                <button
                  onClick={() => setShowExercises(!showExercises)}
                  style={styles.smallButton}
                >
                  {showExercises ? "Masquer exercices" : "Voir exercices"}
                </button>

                <button
                  onClick={() => setShowShortCorrections(!showShortCorrections)}
                  style={styles.smallButton}
                >
                  {showShortCorrections
                    ? "Masquer correction courte"
                    : "Correction courte"}
                </button>

                <button
                  onClick={() =>
                    setShowDetailedCorrections(!showDetailedCorrections)
                  }
                  style={styles.smallButton}
                >
                  {showDetailedCorrections
                    ? "Masquer correction détaillée"
                    : "Correction détaillée"}
                </button>

                <button
                  onClick={() => setShowVideo(!showVideo)}
                  style={styles.smallButton}
                >
                  {showVideo ? "Masquer vidéo" : "Cours vidéo"}
                </button>

                <button onClick={downloadPDF} style={styles.pdfButton}>
                  📄 Télécharger PDF
                </button>
              </div>
            </div>

            <div id="print-area" style={styles.result}>
              <h1>{matiere} — {niveau}</h1>
              <h2 style={styles.pdfSubtitle}>{chapitre}</h2>

              <Section title="📚 Cours" content={getSection("COURS")} />

              {showQuiz && (
                <Section
                  title="🧠 Quiz automatisé"
                  content={getSection("QUIZ_AUTOMATISE")}
                />
              )}

              {showExercises && (
                <Section
                  title="✍️ Exercices progressifs"
                  content={getSection("EXERCICES_PROGRESSIFS")}
                />
              )}

              {showShortCorrections && (
                <Section
                  title="✅ Corrections courtes"
                  content={getSection("CORRECTIONS_COURTES")}
                />
              )}

              {showDetailedCorrections && (
                <Section
                  title="🧩 Corrections détaillées"
                  content={getSection("CORRECTIONS_DETAILLEES")}
                />
              )}

              {showVideo && (
                <Section
                  title="🎬 Cours vidéo"
                  content={getSection("COURS_VIDEO")}
                />
              )}

              {!getSection("COURS") && (
                <div style={styles.pre}>{answer}</div>
              )}
            </div>
          </section>
        )}

        <section id="features" style={styles.features} className="no-print">
          <h2 style={styles.sectionTitle}>Pourquoi EduAI ?</h2>

          <div style={styles.featureGrid}>
            <div style={styles.featureCard}>⚡ Génération rapide</div>
            <div style={styles.featureCard}>🧠 Quiz automatiques</div>
            <div style={styles.featureCard}>✍️ Exercices progressifs</div>
            <div style={styles.featureCard}>✅ Corrections cachées</div>
            <div style={styles.featureCard}>🎬 Script vidéo inclus</div>
            <div style={styles.featureCard}>📄 Export PDF</div>
          </div>
        </section>
      </main>
    </>
  );
}

function Section({ title, content }: { title: string; content: string }) {
  if (!content) return null;

  return (
    <div style={styles.sectionBox}>
      <h2 style={styles.sectionBoxTitle}>{title}</h2>
      <div style={styles.pre}>{content}</div>
    </div>
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
    padding: "18px 0",
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
    display: "inline-block",
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
    margin: "28px 0",
  },

  subtitle: {
    fontSize: 21,
    color: "#cbd5e1",
    lineHeight: 1.6,
    maxWidth: 650,
  },

  tags: {
    display: "flex",
    gap: 14,
    flexWrap: "wrap",
    marginTop: 30,
  },

  tag: {
    background: "rgba(255,255,255,0.12)",
    border: "1px solid rgba(255,255,255,0.16)",
    padding: "14px 18px",
    borderRadius: 18,
    fontWeight: 900,
  },

  card: {
    background: "rgba(255,255,255,0.96)",
    color: "#0f172a",
    padding: 34,
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
    fontSize: 16,
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
    fontSize: 16,
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
    fontSize: 16,
  },

  connected: {
    background: "#dcfce7",
    color: "#166534",
    padding: 12,
    borderRadius: 14,
    fontWeight: 900,
  },

  resultWrap: {
    maxWidth: 1050,
    margin: "0 auto",
    padding: "60px 32px",
  },

  resultHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 20,
    flexWrap: "wrap",
  },

  resultButtons: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
  },

  smallButton: {
    background: "#334155",
    color: "white",
    padding: "14px 18px",
    borderRadius: 16,
    border: "none",
    fontWeight: 900,
    cursor: "pointer",
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
    padding: 36,
    borderRadius: 28,
    marginTop: 20,
    boxShadow: "0 25px 80px rgba(0,0,0,0.28)",
  },

  pdfSubtitle: {
    color: "#2563eb",
  },

  sectionBox: {
    marginTop: 28,
    padding: 22,
    borderRadius: 22,
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
  },

  sectionBoxTitle: {
    marginTop: 0,
    color: "#0f172a",
  },

  pre: {
    whiteSpace: "pre-wrap",
    lineHeight: 1.75,
    fontSize: 16,
    color: "#0f172a",
  },

  features: {
    padding: "80px 24px",
    background: "linear-gradient(180deg,#020617,#0f172a)",
  },

  sectionTitle: {
    textAlign: "center",
    fontSize: "clamp(34px,5vw,54px)",
  },

  featureGrid: {
    maxWidth: 1100,
    margin: "40px auto 0",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
    gap: 20,
  },

  featureCard: {
    background: "rgba(255,255,255,0.09)",
    border: "1px solid rgba(255,255,255,0.14)",
    padding: 26,
    borderRadius: 24,
    fontWeight: 900,
  },
};
