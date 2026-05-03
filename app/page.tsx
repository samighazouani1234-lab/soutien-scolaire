"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { coursesData } from "../data/courses";
import { getSupabaseClient } from "../lib/supabase";

type Exercise = {
  id: number;
  level: string;
  title: string;
  statement: string;
  shortCorrection: string;
  detailedCorrection: string;
};

type VideoLink = {
  href: string;
  title: string;
  desc: string;
};

export default function Page() {
  const [user, setUser] = useState<any>(null);
  const [authReady, setAuthReady] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [matiere, setMatiere] = useState("Mathématiques");
  const [niveau, setNiveau] = useState("Terminale");
  const [chapitre, setChapitre] = useState("Limites");
  const [course, setCourse] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState<Record<number, boolean>>({});

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

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const niveaux = Object.keys(coursesData[matiere] || {});
  const chapitres = coursesData[matiere]?.[niveau] || [];

  const exercises = useMemo(
    () => buildExercises(matiere, niveau, chapitre),
    [matiere, niveau, chapitre]
  );

  const videoLinks = useMemo(
    () => buildVideoLinks(matiere, niveau, chapitre),
    [matiere, niveau, chapitre]
  );

  const quizUrl = `/quiz?matiere=${encodeURIComponent(matiere)}&niveau=${encodeURIComponent(niveau)}&chapitre=${encodeURIComponent(chapitre)}`;

  function getSection(title: string) {
    const clean = String(course || "")
      .replaceAll("### COURS_DETAILLE", "### COURS")
      .replaceAll("### COURS\n_DETAILLE", "### COURS")
      .replaceAll("### EXEMPLES_CORRIGES", "### EXEMPLES")
      .replaceAll("### EXERCICES_CORRIGES", "### EXERCICES")
      .replace(/^_DETAILLE\s*$/gm, "");

    const regex = new RegExp(
      `###\\s*${title}\\s*([\\s\\S]*?)(?=###\\s*[A-ZÉÈÀÂÊÎÔÛÇ_]+|$)`,
      "i"
    );

    return clean.match(regex)?.[1]?.trim() || "";
  }

  async function handleAuth() {
    const supabase = getSupabaseClient();

    if (!supabase) {
      alert("Supabase n'est pas configuré. Vérifie NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY dans Vercel.");
      return;
    }

    if (!email.trim() || password.length < 6) {
      alert("Entre un email valide et un mot de passe de 6 caractères minimum.");
      return;
    }

    setLoading(true);

    const result =
      authMode === "login"
        ? await supabase.auth.signInWithPassword({ email: email.trim(), password })
        : await supabase.auth.signUp({ email: email.trim(), password });

    setLoading(false);

    if (result.error) {
      alert(result.error.message);
      return;
    }

    if (authMode === "signup") {
      alert("Compte créé. Si Supabase demande une confirmation email, confirme ton email puis connecte-toi.");
    }

    setUser(result.data.user || null);
  }

  async function logout() {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    await supabase.auth.signOut();
    setUser(null);
    setCourse("");
  }

  async function generateCourse() {
    if (!user) {
      alert("Connecte-toi pour générer un cours.");
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
      setCourse(json.content || fallbackCourse(matiere, niveau, chapitre));
    } catch {
      setCourse(fallbackCourse(matiere, niveau, chapitre));
    }

    setLoading(false);

    setTimeout(() => {
      document.getElementById("cours")?.scrollIntoView({ behavior: "smooth" });
    }, 300);
  }

  function downloadPDF() {
    document.title = `Cours-${matiere}-${chapitre}`;
    window.print();
  }

  return (
    <>
      <style>{`
        @keyframes floatGlow {
          0% { transform: translateY(0px) scale(1); opacity: .75; }
          50% { transform: translateY(-18px) scale(1.04); opacity: 1; }
          100% { transform: translateY(0px) scale(1); opacity: .75; }
        }

        @media print {
          body * { visibility: hidden; }
          #print-area, #print-area * { visibility: visible; }
          #print-area {
            position:absolute;
            left:0;
            top:0;
            width:100%;
            padding:40px;
            background:white;
            color:black;
          }
          .no-print { display:none !important; }
        }
      `}</style>

      <main style={styles.page}>
        <section style={styles.hero} className="no-print">
          <div style={styles.orbOne}></div>
          <div style={styles.orbTwo}></div>

          <nav style={styles.nav}>
            <b style={styles.logo}>🕌 EduAI</b>

            <div style={styles.navActions}>
              <a href={user ? quizUrl : "#connexion"} style={styles.navButton}>Quiz</a>
              {user ? (
                <button onClick={logout} style={styles.logoutButton}>Déconnexion</button>
              ) : (
                <a href="#connexion" style={styles.navButtonLight}>Connexion</a>
              )}
            </div>
          </nav>

          <div style={styles.heroGrid}>
            <div>
              <span style={styles.badge}>✨ Cours IA Premium</span>
              <h1 style={styles.title}>Cours détaillés, graphes, vidéos et 50 exercices.</h1>
              <p style={styles.subtitle}>
                Connexion utilisateur, génération IA, graphes visibles, liens vidéo cliquables,
                parcours élève, badges et exercices progressifs.
              </p>

              <div style={styles.styleCards}>
                <div style={styles.styleCard}>🔐 Connexion utilisateur</div>
                <div style={styles.styleCard}>📈 Graphe visible</div>
                <div style={styles.styleCard}>🎬 Vidéos cliquables</div>
                <div style={styles.styleCard}>✍️ 50 exercices</div>
              </div>
            </div>

            <div id="connexion" style={styles.panel}>
              {!authReady ? (
                <h2>Chargement...</h2>
              ) : !user ? (
                <>
                  <h2>{authMode === "login" ? "Connexion" : "Créer un compte"}</h2>
                  <p style={styles.muted}>
                    Connecte-toi pour générer les cours et accéder au quiz.
                  </p>

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

                  <button style={styles.primaryButton} onClick={handleAuth}>
                    {loading ? "Patiente..." : authMode === "login" ? "Se connecter" : "Créer le compte"}
                  </button>

                  <button
                    style={styles.secondaryButton}
                    onClick={() => setAuthMode(authMode === "login" ? "signup" : "login")}
                  >
                    {authMode === "login" ? "Créer un compte" : "J'ai déjà un compte"}
                  </button>
                </>
              ) : (
                <>
                  <p style={styles.connected}>✅ Connecté : {user.email}</p>
                  <h2>Créer un cours</h2>

                  <select
                    style={styles.input}
                    value={matiere}
                    onChange={(event) => {
                      const m = event.target.value;
                      const firstNiveau = Object.keys(coursesData[m])[0];
                      setMatiere(m);
                      setNiveau(firstNiveau);
                      setChapitre(coursesData[m][firstNiveau][0]);
                      setCourse("");
                    }}
                  >
                    {Object.keys(coursesData).map((m) => (
                      <option key={m}>{m}</option>
                    ))}
                  </select>

                  <select
                    style={styles.input}
                    value={niveau}
                    onChange={(event) => {
                      const n = event.target.value;
                      setNiveau(n);
                      setChapitre(coursesData[matiere][n][0]);
                      setCourse("");
                    }}
                  >
                    {niveaux.map((n) => (
                      <option key={n}>{n}</option>
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
                    {chapitres.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>

                  <button style={styles.primaryButton} onClick={generateCourse}>
                    {loading ? "Génération..." : "✨ Générer le cours"}
                  </button>

                  <a href={quizUrl} style={styles.quizButton}>🧠 Lancer le quiz interactif</a>
                </>
              )}
            </div>
          </div>
        </section>

        {course && (
          <section id="cours" style={styles.courseWrap}>
            <div style={styles.courseHeader} className="no-print">
              <h2>📘 Cours généré</h2>
              <button onClick={downloadPDF} style={styles.pdfButton}>📄 Télécharger PDF</button>
            </div>

            <article id="print-area" style={styles.course}>
              <p style={styles.smallLabel}>{matiere}</p>
              <h1 style={styles.courseTitle}>{chapitre}</h1>
              <p style={styles.level}>{niveau}</p>

              <VideoBlock links={videoLinks} />
              <GraphBlock matiere={matiere} chapitre={chapitre} />

              <Section title="🚀 Introduction" content={getSection("INTRODUCTION")} />
              <Section title="🎯 Objectifs" content={getSection("OBJECTIFS")} />
              <Section title="📚 Cours" content={getSection("COURS")} />
              <Section title="📊 Tableaux" content={getSection("TABLEAUX")} />
              <Section title="🧭 Méthodes" content={getSection("METHODES")} />
              <Section title="✅ Exemples corrigés" content={getSection("EXEMPLES")} />
              <Section title="✍️ Exercices IA" content={getSection("EXERCICES")} />

              <StudentPath />
              <Exercises exercises={exercises} open={open} setOpen={setOpen} />

              <Section title="🧠 À retenir" content={getSection("A_RETENIR")} />

              {!getSection("COURS") && <Section title="Cours" content={course} />}
            </article>
          </section>
        )}
      </main>
    </>
  );
}

function Section({ title, content }: { title: string; content: string }) {
  if (!content) return null;

  return (
    <section style={styles.section}>
      <h2>{title}</h2>
      <div style={styles.text}>{content}</div>
    </section>
  );
}

function VideoBlock({ links }: { links: VideoLink[] }) {
  return (
    <section style={styles.section}>
      <h2>🎬 Cours vidéo adaptés</h2>

      <div style={styles.videoGrid}>
        {links.map((link) => (
          <a
            key={link.href}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            style={styles.videoCard}
          >
            <b>{link.title}</b>
            <span>{link.desc}</span>
          </a>
        ))}
      </div>
    </section>
  );
}

function GraphBlock({ matiere, chapitre }: { matiere: string; chapitre: string }) {
  const lower = matiere.toLowerCase();

  return (
    <section style={styles.section}>
      <h2>📈 Graphe / schéma adapté</h2>

      <div style={styles.graphBox}>
        {lower.includes("chimie") ? (
          <ChemistryGraph />
        ) : lower.includes("physique") ? (
          <PhysicsGraph />
        ) : (
          <MathGraph />
        )}
      </div>

      <div style={styles.text}>
        Graphe de lecture pour le chapitre {chapitre}. L’élève doit identifier les axes, les tendances
        et les points importants.
      </div>
    </section>
  );
}

function MathGraph() {
  return (
    <svg viewBox="0 0 700 330" width="100%" height="330">
      <rect width="700" height="330" fill="#f8fafc" rx="24" />
      {Array.from({ length: 12 }).map((_, i) => (
        <line key={`v-${i}`} x1={70 + i * 50} y1="40" x2={70 + i * 50} y2="280" stroke="#e2e8f0" />
      ))}
      {Array.from({ length: 8 }).map((_, i) => (
        <line key={`h-${i}`} x1="50" y1={60 + i * 28} x2="650" y2={60 + i * 28} stroke="#e2e8f0" />
      ))}
      <line x1="50" y1="260" x2="650" y2="260" stroke="#111827" strokeWidth="3" />
      <line x1="90" y1="40" x2="90" y2="290" stroke="#111827" strokeWidth="3" />
      <path
        d="M105 240 C180 210, 250 155, 330 125 C430 88, 520 62, 620 55"
        fill="none"
        stroke="#7c3aed"
        strokeWidth="7"
      />
      <text x="230" y="75" fill="#7c3aed" fontSize="20">courbe modèle</text>
    </svg>
  );
}

function PhysicsGraph() {
  return (
    <svg viewBox="0 0 700 330" width="100%" height="330">
      <rect width="700" height="330" fill="#f8fafc" rx="24" />
      <line x1="70" y1="265" x2="640" y2="265" stroke="#111827" strokeWidth="3" />
      <line x1="90" y1="45" x2="90" y2="285" stroke="#111827" strokeWidth="3" />
      <line x1="115" y1="240" x2="600" y2="70" stroke="#2563eb" strokeWidth="7" />
      <text x="430" y="95" fill="#2563eb" fontSize="20">relation physique</text>
    </svg>
  );
}

function ChemistryGraph() {
  return (
    <svg viewBox="0 0 700 330" width="100%" height="330">
      <rect width="700" height="330" fill="#f8fafc" rx="24" />
      <line x1="70" y1="265" x2="640" y2="265" stroke="#111827" strokeWidth="3" />
      <line x1="90" y1="45" x2="90" y2="285" stroke="#111827" strokeWidth="3" />
      <path d="M110 85 C210 135, 330 210, 620 260" fill="none" stroke="#16a34a" strokeWidth="7" />
      <path d="M110 260 C210 230, 330 150, 620 70" fill="none" stroke="#dc2626" strokeWidth="6" />
      <text x="450" y="92" fill="#dc2626" fontSize="18">produit</text>
      <text x="450" y="245" fill="#16a34a" fontSize="18">réactif</text>
    </svg>
  );
}

function StudentPath() {
  return (
    <section style={styles.section}>
      <h2>🏆 Parcours élève et badges</h2>

      <div style={styles.badgeGrid}>
        <div style={styles.badgeCard}>🟢 Débutant<br /><b>Badge compréhension</b></div>
        <div style={styles.badgeCard}>🔵 Intermédiaire<br /><b>Badge méthode</b></div>
        <div style={styles.badgeCard}>🟣 Avancé<br /><b>Badge analyse</b></div>
        <div style={styles.badgeCard}>🔴 Expert<br /><b>Badge maîtrise</b></div>
      </div>
    </section>
  );
}

function Exercises({
  exercises,
  open,
  setOpen,
}: {
  exercises: Exercise[];
  open: Record<number, boolean>;
  setOpen: (value: Record<number, boolean> | ((previous: Record<number, boolean>) => Record<number, boolean>)) => void;
}) {
  return (
    <section style={styles.section}>
      <h2>✍️ Banque de 50 exercices progressifs</h2>

      <div style={styles.exerciseGrid}>
        {exercises.map((ex) => (
          <div key={ex.id} style={styles.exerciseCard}>
            <span style={styles.exerciseLevel}>{ex.level}</span>
            <h3>{ex.id}. {ex.title}</h3>
            <p>{ex.statement}</p>

            <button
              style={styles.correctionButton}
              onClick={() =>
                setOpen((previous) => ({
                  ...previous,
                  [ex.id]: !previous[ex.id],
                }))
              }
            >
              {open[ex.id] ? "Masquer la correction" : "Voir la correction"}
            </button>

            {open[ex.id] && (
              <div style={styles.correctionBox}>
                <b>Correction courte :</b>
                <p>{ex.shortCorrection}</p>
                <b>Correction détaillée :</b>
                <p>{ex.detailedCorrection}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

function buildExercises(matiere: string, niveau: string, chapitre: string): Exercise[] {
  return Array.from({ length: 50 }, (_, index) => {
    const id = index + 1;
    const level =
      id <= 10 ? "Facile" :
      id <= 25 ? "Moyen" :
      id <= 40 ? "Difficile" :
      "Type examen";

    return {
      id,
      level,
      title: `${chapitre} — exercice ${level.toLowerCase()}`,
      statement: `Exercice de ${matiere} niveau ${niveau} sur ${chapitre}. Identifier la méthode, résoudre et rédiger.`,
      shortCorrection: "Repérer les données, appliquer la méthode du cours, conclure.",
      detailedCorrection:
        "On lit l’énoncé, on identifie la notion, on vérifie les conditions, on applique la propriété puis on rédige une conclusion claire.",
    };
  });
}

function buildVideoLinks(matiere: string, niveau: string, chapitre: string): VideoLink[] {
  const query = encodeURIComponent(`${matiere} ${niveau} ${chapitre} cours exercices corrigés`);
  const query2 = encodeURIComponent(`${matiere} ${chapitre}`);

  return [
    {
      title: "YouTube — vidéos adaptées",
      desc: `${matiere} ${niveau} ${chapitre}`,
      href: `https://www.youtube.com/results?search_query=${query}`,
    },
    {
      title: "Khan Academy",
      desc: "Ressources pédagogiques",
      href: `https://fr.khanacademy.org/search?page_search_query=${query2}`,
    },
    {
      title: "Lumni",
      desc: "Cours et vidéos scolaires",
      href: `https://www.lumni.fr/recherche?query=${query2}`,
    },
  ];
}

function fallbackCourse(matiere: string, niveau: string, chapitre: string) {
  return `### INTRODUCTION
Cours sur ${chapitre} en ${matiere}, niveau ${niveau}.

### OBJECTIFS
- Comprendre le chapitre.
- Appliquer les méthodes.
- Réussir les exercices.

### COURS
Ce chapitre doit être travaillé avec méthode : définitions, propriétés, exemples, exercices et correction.

### TABLEAUX
| Notion | Rôle |
|---|---|
| Définition | Comprendre |
| Méthode | Appliquer |

### METHODES
1. Lire l’énoncé.
2. Identifier les données.
3. Appliquer la méthode.
4. Conclure.

### EXEMPLES
Exemple corrigé : appliquer la méthode du cours.

### EXERCICES
Exercice : résoudre une question simple.
Correction courte : appliquer la méthode.
Correction détaillée : justifier les étapes.

### A_RETENIR
Comprendre, pratiquer, corriger.`;
}

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#090914",
    color: "white",
    fontFamily: "Arial, sans-serif",
  },
  hero: {
    minHeight: "100vh",
    padding: 28,
    background: "linear-gradient(135deg,#080816,#111827,#2e1065)",
    position: "relative",
    overflow: "hidden",
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
    maxWidth: 1240,
    margin: "0 auto",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "18px 0",
    position: "relative",
    zIndex: 2,
  },
  logo: {
    fontSize: 30,
    fontWeight: 900,
  },
  navActions: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap",
  },
  navButton: {
    background: "#4f46e5",
    color: "white",
    padding: "12px 18px",
    borderRadius: 999,
    textDecoration: "none",
    fontWeight: 900,
  },
  navButtonLight: {
    background: "white",
    color: "#020617",
    padding: "12px 18px",
    borderRadius: 999,
    textDecoration: "none",
    fontWeight: 900,
  },
  logoutButton: {
    background: "#ef4444",
    color: "white",
    padding: "12px 18px",
    borderRadius: 999,
    border: "none",
    fontWeight: 900,
    cursor: "pointer",
  },
  heroGrid: {
    maxWidth: 1240,
    margin: "90px auto 0",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))",
    gap: 48,
    alignItems: "center",
    position: "relative",
    zIndex: 2,
  },
  badge: {
    display: "inline-block",
    background: "rgba(255,255,255,.12)",
    padding: "11px 16px",
    borderRadius: 999,
    fontWeight: 900,
    color: "#fde68a",
  },
  title: {
    fontSize: "clamp(48px,7vw,86px)",
    lineHeight: 0.98,
    margin: "26px 0",
    letterSpacing: -3,
  },
  subtitle: {
    fontSize: 21,
    lineHeight: 1.65,
    color: "#cbd5e1",
  },
  styleCards: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))",
    gap: 14,
    marginTop: 28,
  },
  styleCard: {
    background: "rgba(255,255,255,.10)",
    border: "1px solid rgba(255,255,255,.16)",
    padding: 18,
    borderRadius: 22,
    fontWeight: 900,
  },
  panel: {
    background: "rgba(255,255,255,.96)",
    color: "#0f172a",
    padding: 34,
    borderRadius: 34,
    boxShadow: "0 35px 100px rgba(0,0,0,.45)",
  },
  muted: {
    color: "#64748b",
    lineHeight: 1.5,
  },
  connected: {
    background: "#dcfce7",
    color: "#166534",
    padding: 12,
    borderRadius: 14,
    fontWeight: 900,
  },
  input: {
    width: "100%",
    padding: 16,
    marginTop: 14,
    borderRadius: 18,
    border: "1px solid #cbd5e1",
    boxSizing: "border-box",
    fontSize: 16,
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
    padding: 15,
    border: "none",
    borderRadius: 18,
    background: "#020617",
    color: "white",
    fontWeight: 900,
    cursor: "pointer",
    fontSize: 16,
  },
  quizButton: {
    display: "block",
    marginTop: 12,
    padding: 15,
    borderRadius: 18,
    background: "#111827",
    color: "white",
    fontWeight: 900,
    textDecoration: "none",
    textAlign: "center",
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
    alignItems: "center",
  },
  pdfButton: {
    background: "#22c55e",
    color: "white",
    padding: "14px 18px",
    borderRadius: 16,
    border: "none",
    fontWeight: 900,
  },
  course: {
    maxWidth: 1120,
    margin: "0 auto",
    background: "white",
    color: "#0f172a",
    borderRadius: 36,
    padding: 40,
    boxShadow: "0 12px 0 rgba(0,0,0,.15), 0 35px 90px rgba(15,23,42,.16)",
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
  section: {
    marginTop: 26,
    padding: 26,
    borderRadius: 26,
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
  },
  text: {
    whiteSpace: "pre-wrap",
    lineHeight: 1.78,
    fontSize: 17,
  },
  videoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))",
    gap: 16,
  },
  videoCard: {
    display: "grid",
    gap: 6,
    padding: 18,
    borderRadius: 18,
    background: "#4f46e5",
    color: "white",
    textDecoration: "none",
  },
  graphBox: {
    background: "white",
    borderRadius: 24,
    padding: 10,
    border: "1px solid #e2e8f0",
  },
  badgeGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))",
    gap: 14,
  },
  badgeCard: {
    padding: 18,
    borderRadius: 18,
    background: "white",
    border: "1px solid #e2e8f0",
  },
  exerciseGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))",
    gap: 16,
  },
  exerciseCard: {
    padding: 18,
    borderRadius: 20,
    background: "white",
    border: "1px solid #e2e8f0",
  },
  exerciseLevel: {
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: 999,
    background: "#eef2ff",
    color: "#4338ca",
    fontWeight: 900,
  },
  correctionButton: {
    marginTop: 10,
    padding: "10px 14px",
    borderRadius: 12,
    border: "none",
    background: "#111827",
    color: "white",
    fontWeight: 900,
    cursor: "pointer",
  },
  correctionBox: {
    marginTop: 12,
    padding: 14,
    borderRadius: 14,
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
  },
};
