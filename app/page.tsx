"use client";

import { useEffect, useMemo, useState } from "react";
import { data } from "../data/courses";
import { getSupabaseClient } from "../lib/supabase";

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [authReady, setAuthReady] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [matiere, setMatiere] = useState("");
  const [niveau, setNiveau] = useState("");
  const [chapitre, setChapitre] = useState("");

  const [course, setCourse] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const supabase = getSupabaseClient();

    if (!supabase) {
      setAuthReady(true);
      return;
    }

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setAuthReady(true);
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

  function getSection(title: string) {
    if (!course) return "";

    const regex = new RegExp(`### ${title}([\\s\\S]*?)(?=### |$)`);
    return course.match(regex)?.[1]?.trim() || "";
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

    if (error) {
      alert(error.message);
    } else {
      alert("Compte créé. Tu peux maintenant te connecter.");
    }
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

    if (error) {
      alert(error.message);
    } else {
      setUser(data.user);
    }
  }

  async function handleLogout() {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    await supabase.auth.signOut();
    setUser(null);
    setCourse("");
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
    setCourse("");

    try {
      const res = await fetch("/api/course", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          matiere,
          niveau,
          chapitre,
        }),
      });

      const json = await res.json();
      const content =
        json.content ||
        "### INTRODUCTION\nLe cours n'a pas pu être généré. Réessaie dans quelques instants.";

      setCourse(content);

      localStorage.setItem(
        `eduai-course-${matiere}-${niveau}-${chapitre}`,
        content
      );

      setTimeout(() => {
        document.getElementById("cours")?.scrollIntoView({
          behavior: "smooth",
        });
      }, 300);
    } catch {
      setCourse(
        "### INTRODUCTION\nLe cours n'a pas pu être généré. Réessaie dans quelques instants."
      );
    }

    setLoading(false);
  }

  function downloadPDF() {
    document.title = `Cours-${matiere}-${chapitre}`;
    window.print();
  }

  const quizUrl = `/quiz?matiere=${encodeURIComponent(
    matiere || "Mathématiques"
  )}&niveau=${encodeURIComponent(
    niveau || "Terminale"
  )}&chapitre=${encodeURIComponent(chapitre || "Limites")}`;

  return (
    <>
      <style>{`
        @keyframes floatGlow {
          0% { transform: translateY(0px) scale(1); opacity: .75; }
          50% { transform: translateY(-18px) scale(1.04); opacity: 1; }
          100% { transform: translateY(0px) scale(1); opacity: .75; }
        }

        @keyframes pulseSoft {
          0%, 100% { box-shadow: 0 0 0 rgba(99,102,241,0); }
          50% { box-shadow: 0 0 45px rgba(99,102,241,.30); }
        }

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
          <div style={styles.orbOne}></div>
          <div style={styles.orbTwo}></div>

          <nav style={styles.nav}>
            <div style={styles.logo}>🕌 EduAI</div>

            <div style={styles.navLinks}>
              <a href="#generator" style={styles.link}>
                Générateur
              </a>
              <a href={user ? quizUrl : "#login"} style={styles.link}>
                Quiz
              </a>
              <a href="#avantages" style={styles.link}>
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

          <div style={styles.layout}>
            <div>
              <span style={styles.badge}>✨ Plateforme scolaire IA premium</span>

              <h1 style={styles.title}>
                Apprends plus vite avec une IA scolaire.
              </h1>

              <p style={styles.subtitle}>
                Génère des cours structurés, des exercices progressifs, des quiz
                interactifs et des PDF propres en quelques secondes.
              </p>

              <div style={styles.styleCards}>
                <div style={styles.styleCard}>🌙 Design premium</div>
                <div style={styles.styleCard}>📚 Cours détaillés</div>
                <div style={styles.styleCard}>🧠 Quiz animé</div>
              </div>
            </div>

            <div id="login" style={styles.panel}>
              {!authReady ? (
                <h2>Chargement...</h2>
              ) : !user ? (
                <>
                  <h2 style={styles.panelTitle}>🔐 Connexion</h2>

                  <input
                    style={styles.input}
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                  />

                  <input
                    style={styles.input}
                    type="password"
                    placeholder="Mot de passe"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                  />

                  <button onClick={handleLogin} style={styles.primaryButton}>
                    {loading ? "Connexion..." : "Se connecter"}
                  </button>

                  <button onClick={handleSignup} style={styles.secondaryButton}>
                    Créer un compte
                  </button>
                </>
              ) : (
                <div id="generator">
                  <p style={styles.connected}>✅ Connecté : {user.email}</p>

                  <h2 style={styles.panelTitle}>Créer un cours</h2>

                  <select
                    style={styles.input}
                    value={matiere}
                    onChange={(event) => {
                      setMatiere(event.target.value);
                      setNiveau("");
                      setChapitre("");
                      setCourse("");
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
                    onChange={(event) => {
                      setNiveau(event.target.value);
                      setChapitre("");
                      setCourse("");
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
                    onChange={(event) => {
                      setChapitre(event.target.value);
                      setCourse("");
                    }}
                  >
                    <option value="">Choisir un chapitre</option>
                    {chapitres.map((c: any) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>

                  <button onClick={generateCourse} style={styles.primaryButton}>
                    {loading ? "Génération IA..." : "✨ Générer le cours"}
                  </button>

                  <a href={quizUrl} style={styles.quizButton}>
                    🧠 Lancer le quiz interactif
                  </a>
                </div>
              )}
            </div>
          </div>
        </section>

        {course && (
          <section id="cours" style={styles.courseWrap}>
            <div style={styles.courseHeader} className="no-print">
              <h2 style={styles.generatedTitle}>📘 Cours généré</h2>

              <div style={styles.headerButtons}>
                <a href={quizUrl} style={styles.quizButtonSmall}>
                  🧠 Quiz interactif
                </a>

                <button onClick={downloadPDF} style={styles.pdfButton}>
                  📄 Télécharger PDF
                </button>
              </div>
            </div>

            <article id="print-area" style={styles.course}>
              <div style={styles.courseTop}>
                <div>
                  <p style={styles.smallLabel}>{matiere}</p>
                  <h1 style={styles.courseTitle}>{chapitre}</h1>
                  <p style={styles.level}>{niveau}</p>
                </div>

                <div style={styles.scoreBadge}>Premium</div>
              </div>

              <Section icon="🚀" title="Introduction" content={getSection("INTRODUCTION")} />
              <Section icon="🎯" title="Objectifs" content={getSection("OBJECTIFS")} />
              <Section icon="📚" title="Cours" content={getSection("COURS")} />
              <Section icon="🧭" title="Méthodes" content={getSection("METHODES")} />
              <Section icon="✅" title="Exemples" content={getSection("EXEMPLES")} />
              <Section icon="✍️" title="Exercices" content={getSection("EXERCICES")} />
              <Section icon="🧠" title="À retenir" content={getSection("A_RETENIR")} />
              <Section icon="🎬" title="Cours vidéo" content={getSection("VIDEO")} />

              {!getSection("COURS") && <Text content={course} />}

              <a href={quizUrl} style={styles.quizEndButton} className="no-print">
                🧠 Faire le quiz interactif de ce chapitre
              </a>
            </article>
          </section>
        )}

        <section id="avantages" style={styles.features} className="no-print">
          <h2 style={styles.featuresTitle}>Une expérience scolaire moderne</h2>

          <div style={styles.featureGrid}>
            <div style={styles.feature}>⚡ Génération rapide</div>
            <div style={styles.feature}>🎯 Chapitres ciblés</div>
            <div style={styles.feature}>🏆 Note finale</div>
            <div style={styles.feature}>📄 Export PDF</div>
          </div>
        </section>
      </main>
    </>
  );
}

function Section({
  icon,
  title,
  content,
}: {
  icon: string;
  title: string;
  content: string;
}) {
  if (!content) return null;

  return (
    <section style={styles.section}>
      <h2 style={styles.sectionTitle}>
        {icon} {title}
      </h2>
      <Text content={content} />
    </section>
  );
}

function Text({ content }: { content: string }) {
  return <div style={styles.text}>{content}</div>;
}

const styles: any = {
  page: {
    minHeight: "100vh",
    background: "#090914",
    color: "white",
    fontFamily: "Arial, sans-serif",
  },
  hero: {
    position: "relative",
    overflow: "hidden",
    minHeight: "100vh",
    padding: 28,
    background:
      "linear-gradient(135deg,#080816 0%,#111827 45%,#2e1065 100%)",
  },
  orbOne: {
    position: "absolute",
    width: 420,
    height: 420,
    borderRadius: "50%",
    background: "radial-gradient(circle,#a855f766,transparent 65%)",
    top: 80,
    left: -120,
    animation: "floatGlow 7s ease-in-out infinite",
  },
  orbTwo: {
    position: "absolute",
    width: 360,
    height: 360,
    borderRadius: "50%",
    background: "radial-gradient(circle,#22d3ee55,transparent 65%)",
    bottom: 80,
    right: -80,
    animation: "floatGlow 8s ease-in-out infinite",
  },
  nav: {
    position: "relative",
    zIndex: 2,
    maxWidth: 1240,
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
    gap: 14,
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
    padding: "12px 18px",
    borderRadius: 999,
    textDecoration: "none",
    fontWeight: 900,
  },
  logout: {
    border: "none",
    background: "#ef4444",
    color: "white",
    padding: "12px 18px",
    borderRadius: 999,
    fontWeight: 900,
    cursor: "pointer",
  },
  layout: {
    position: "relative",
    zIndex: 2,
    maxWidth: 1240,
    margin: "90px auto 0",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))",
    gap: 48,
    alignItems: "center",
  },
  badge: {
    display: "inline-block",
    background: "rgba(255,255,255,.12)",
    border: "1px solid rgba(255,255,255,.18)",
    padding: "11px 16px",
    borderRadius: 999,
    fontWeight: 900,
    color: "#fde68a",
  },
  title: {
    fontSize: "clamp(52px,8vw,92px)",
    lineHeight: 0.96,
    margin: "26px 0",
    letterSpacing: -4,
  },
  subtitle: {
    fontSize: 21,
    lineHeight: 1.65,
    color: "#cbd5e1",
    maxWidth: 680,
  },
  styleCards: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))",
    gap: 14,
    marginTop: 30,
    maxWidth: 650,
  },
  styleCard: {
    background: "rgba(255,255,255,.10)",
    border: "1px solid rgba(255,255,255,.16)",
    padding: 18,
    borderRadius: 24,
    fontWeight: 900,
    backdropFilter: "blur(14px)",
  },
  panel: {
    background: "rgba(255,255,255,.96)",
    color: "#0f172a",
    padding: 34,
    borderRadius: 34,
    boxShadow: "0 35px 100px rgba(0,0,0,.45)",
    animation: "pulseSoft 4s ease-in-out infinite",
  },
  panelTitle: {
    fontSize: 30,
    marginTop: 0,
  },
  input: {
    width: "100%",
    padding: 16,
    marginTop: 14,
    borderRadius: 18,
    border: "1px solid #cbd5e1",
    boxSizing: "border-box",
    fontSize: 16,
    background: "white",
  },
  primaryButton: {
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
    background: "#020617",
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
  quizButton: {
    display: "block",
    marginTop: 14,
    padding: 17,
    borderRadius: 18,
    background: "#020617",
    color: "white",
    textDecoration: "none",
    textAlign: "center",
    fontWeight: 900,
  },
  courseWrap: {
    background: "#efe7db",
    color: "#0f172a",
    padding: "70px 28px",
  },
  courseHeader: {
    maxWidth: 1120,
    margin: "0 auto 24px",
    display: "flex",
    justifyContent: "space-between",
    gap: 16,
    alignItems: "center",
    flexWrap: "wrap",
  },
  generatedTitle: {
    fontSize: 34,
    margin: 0,
  },
  headerButtons: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
  },
  quizButtonSmall: {
    background: "#4f46e5",
    color: "white",
    padding: "14px 18px",
    borderRadius: 16,
    fontWeight: 900,
    textDecoration: "none",
  },
  pdfButton: {
    background: "#22c55e",
    color: "white",
    padding: "14px 18px",
    borderRadius: 16,
    border: "none",
    fontWeight: 900,
    cursor: "pointer",
  },
  course: {
    maxWidth: 1120,
    margin: "0 auto",
    background: "white",
    color: "#0f172a",
    borderRadius: 36,
    padding: 40,
    boxShadow:
      "0 12px 0 rgba(0,0,0,.15), 0 35px 90px rgba(15,23,42,.16)",
  },
  courseTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: 20,
    flexWrap: "wrap",
    borderBottom: "2px solid #e5e7eb",
    paddingBottom: 24,
    marginBottom: 28,
  },
  smallLabel: {
    color: "#4f46e5",
    fontWeight: 900,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  courseTitle: {
    fontSize: "clamp(38px,6vw,70px)",
    margin: "8px 0",
    letterSpacing: -2,
  },
  level: {
    fontSize: 22,
    color: "#475569",
    fontWeight: 900,
  },
  scoreBadge: {
    background: "#eef2ff",
    color: "#4338ca",
    padding: "14px 18px",
    borderRadius: 18,
    fontWeight: 900,
    height: "fit-content",
  },
  section: {
    marginTop: 26,
    padding: 26,
    borderRadius: 26,
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
  },
  sectionTitle: {
    marginTop: 0,
    fontSize: 28,
  },
  text: {
    whiteSpace: "pre-wrap",
    lineHeight: 1.78,
    fontSize: 17,
  },
  quizEndButton: {
    display: "block",
    marginTop: 30,
    padding: 18,
    borderRadius: 18,
    background: "#4f46e5",
    color: "white",
    fontWeight: 900,
    textDecoration: "none",
    textAlign: "center",
  },
  features: {
    background: "#090914",
    padding: "80px 28px",
  },
  featuresTitle: {
    textAlign: "center",
    fontSize: "clamp(34px,5vw,58px)",
    marginTop: 0,
  },
  featureGrid: {
    maxWidth: 1050,
    margin: "36px auto 0",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
    gap: 18,
  },
  feature: {
    background: "rgba(255,255,255,.09)",
    border: "1px solid rgba(255,255,255,.14)",
    padding: 26,
    borderRadius: 26,
    fontWeight: 900,
  },
};
