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

  const [course, setCourse] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    supabase.auth.getUser().then(({ data }) => setUser(data.user));

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => setUser(session?.user || null)
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
      const res = await fetch("/api/ia", {
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
      setCourse(json.content || json.answer || "Erreur génération du cours.");

      setTimeout(() => {
        document.getElementById("cours")?.scrollIntoView({ behavior: "smooth" });
      }, 300);
    } catch {
      setCourse("Erreur serveur IA.");
    }

    setLoading(false);
  }

  function downloadPDF() {
    document.title = `Cours-${matiere}-${chapitre}`;
    window.print();
  }

  const quizUrl = `/quiz?matiere=${encodeURIComponent(
    matiere
  )}&niveau=${encodeURIComponent(niveau)}&chapitre=${encodeURIComponent(
    chapitre
  )}`;

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
              <a href="#generator" style={styles.link}>Générateur</a>
              <a href={quizUrl} style={styles.quizNav}>Quiz</a>

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
              <span style={styles.badge}>✨ Cours IA premium</span>

              <h1 style={styles.title}>
                Des cours visuels, clairs et interactifs.
              </h1>

              <p style={styles.subtitle}>
                Génère un cours structuré, avec méthode, exemples, schéma,
                script vidéo et quiz interactif séparé.
              </p>

              <div style={styles.tags}>
                <span style={styles.tag}>📘 Cours structuré</span>
                <span style={styles.tag}>🧠 Quiz interactif</span>
                <span style={styles.tag}>📄 PDF</span>
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

                  <button onClick={handleSignup} style={styles.darkButton}>
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
              <h2>📘 Cours généré</h2>

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

                <div style={styles.scoreBadge}>Cours premium</div>
              </div>

              <Section icon="🚀" title="Introduction" content={getSection("INTRODUCTION")} />
              <Section icon="🎯" title="Objectifs" content={getSection("OBJECTIFS")} />
              <Section icon="📚" title="Cours" content={getSection("COURS")} />
              <Section icon="🔑" title="Définitions" content={getSection("DEFINITIONS")} />
              <Section icon="🧭" title="Méthodes" content={getSection("METHODES")} />
              <Section icon="✅" title="Exemples" content={getSection("EXEMPLES")} />

              <div style={styles.schemaBox}>
                <h2 style={styles.sectionTitle}>📐 Schéma à comprendre</h2>
                <div style={styles.fakeBoard}>
                  <div style={styles.axisX}></div>
                  <div style={styles.axisY}></div>
                  <div style={styles.curve}></div>
                </div>
                <Text content={getSection("SCHEMA_TEXTE")} />
              </div>

              <Section icon="🧠" title="À retenir" content={getSection("A_RETENIR")} />
              <Section icon="🎬" title="Cours vidéo" content={getSection("VIDEO")} />

              {!getSection("COURS") && <Text content={course} />}

              <a href={quizUrl} style={styles.quizEndButton} className="no-print">
                🧠 Faire le quiz interactif de ce chapitre
              </a>
            </article>
          </section>
        )}
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
    background: "#ede4d6",
    color: "#0f172a",
    fontFamily: "Arial, sans-serif",
  },

  hero: {
    minHeight: "100vh",
    padding: 28,
    background:
      "radial-gradient(circle at top left,#60a5fa55,transparent 28%), radial-gradient(circle at top right,#a855f755,transparent 25%), linear-gradient(135deg,#020617,#111827)",
    color: "white",
  },

  nav: {
    maxWidth: 1250,
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
    fontWeight: 900,
    textDecoration: "none",
  },

  quizNav: {
    background: "#4f46e5",
    color: "white",
    padding: "12px 18px",
    borderRadius: 999,
    fontWeight: 900,
    textDecoration: "none",
  },

  navButton: {
    background: "white",
    color: "#020617",
    padding: "12px 18px",
    borderRadius: 999,
    fontWeight: 900,
    textDecoration: "none",
  },

  logout: {
    background: "#ef4444",
    color: "white",
    padding: "12px 18px",
    borderRadius: 999,
    border: "none",
    fontWeight: 900,
    cursor: "pointer",
  },

  layout: {
    maxWidth: 1250,
    margin: "85px auto 0",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))",
    gap: 50,
    alignItems: "center",
  },

  badge: {
    display: "inline-block",
    background: "rgba(255,255,255,0.12)",
    border: "1px solid rgba(255,255,255,0.18)",
    padding: "11px 16px",
    borderRadius: 999,
    fontWeight: 900,
    color: "#a5f3fc",
  },

  title: {
    fontSize: "clamp(48px,8vw,84px)",
    lineHeight: 1,
    letterSpacing: -3,
    margin: "28px 0",
  },

  subtitle: {
    fontSize: 21,
    lineHeight: 1.6,
    color: "#cbd5e1",
    maxWidth: 680,
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
    background: "white",
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

  darkButton: {
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
    textAlign: "center",
    marginTop: 14,
    padding: 17,
    borderRadius: 18,
    background: "#020617",
    color: "white",
    fontWeight: 900,
    textDecoration: "none",
  },

  courseWrap: {
    maxWidth: 1180,
    margin: "0 auto",
    padding: "70px 28px",
  },

  courseHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: 16,
    alignItems: "center",
    flexWrap: "wrap",
    marginBottom: 24,
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
    border: "none",
    borderRadius: 16,
    fontWeight: 900,
    cursor: "pointer",
  },

  course: {
    background: "white",
    color: "#0f172a",
    borderRadius: 34,
    padding: 38,
    boxShadow: "0 10px 0 rgba(0,0,0,0.18)",
  },

  courseTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: 20,
    flexWrap: "wrap",
    borderBottom: "2px solid #e5e7eb",
    paddingBottom: 22,
    marginBottom: 26,
  },

  smallLabel: {
    color: "#4f46e5",
    fontWeight: 900,
    textTransform: "uppercase",
    letterSpacing: 1,
  },

  courseTitle: {
    fontSize: "clamp(34px,5vw,58px)",
    margin: "8px 0",
  },

  level: {
    fontSize: 20,
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
    padding: 24,
    borderRadius: 24,
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
  },

  sectionTitle: {
    marginTop: 0,
    fontSize: 28,
  },

  text: {
    whiteSpace: "pre-wrap",
    lineHeight: 1.75,
    fontSize: 17,
  },

  schemaBox: {
    marginTop: 26,
    padding: 24,
    borderRadius: 24,
    background: "#fff7ed",
    border: "2px solid #fb923c",
  },

  fakeBoard: {
    position: "relative",
    height: 250,
    background:
      "linear-gradient(#e5e7eb 1px, transparent 1px), linear-gradient(90deg,#e5e7eb 1px, transparent 1px)",
    backgroundSize: "28px 28px",
    borderRadius: 20,
    margin: "18px 0",
    overflow: "hidden",
  },

  axisX: {
    position: "absolute",
    left: 20,
    right: 20,
    top: "50%",
    height: 3,
    background: "#111827",
  },

  axisY: {
    position: "absolute",
    top: 20,
    bottom: 20,
    left: "50%",
    width: 3,
    background: "#111827",
  },

  curve: {
    position: "absolute",
    left: "20%",
    top: "22%",
    width: "58%",
    height: "58%",
    borderTop: "5px solid #ec4899",
    borderRight: "5px solid #ec4899",
    borderRadius: "100% 40% 100% 40%",
    transform: "rotate(-15deg)",
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
};
