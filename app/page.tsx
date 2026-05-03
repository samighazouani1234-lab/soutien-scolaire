"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { getSupabaseClient } from "../lib/supabase";

type CourseMap = Record<string, Record<string, string[]>>;

type Exercise = {
  id: number;
  level: "Facile" | "Moyen" | "Difficile" | "Type examen";
  title: string;
  statement: string;
  shortCorrection: string;
  detailedCorrection: string;
};

type VideoLink = {
  title: string;
  desc: string;
  href: string;
};

const COURSES: CourseMap = {
  Mathématiques: {
    "6e": ["Fractions", "Proportionnalité", "Aires et périmètres"],
    "5e": ["Nombres relatifs", "Triangles", "Pourcentages"],
    "4e": ["Pythagore", "Puissances", "Statistiques"],
    "3e": ["Équations", "Fonctions affines", "Thalès"],
    Seconde: ["Fonctions", "Vecteurs", "Probabilités"],
    Première: ["Dérivation", "Suites", "Produit scalaire"],
    Terminale: ["Limites", "Fonction logarithme", "Équations différentielles", "Loi binomiale"],
  },
  Physique: {
    Seconde: ["Mouvement", "Lumière", "Signaux"],
    Première: ["Énergie", "Ondes", "Électricité"],
    Terminale: ["Deuxième loi de Newton", "Lentilles minces", "Mécanique quantique"],
  },
  Chimie: {
    Seconde: ["Atomes", "Solutions", "Transformation chimique"],
    Première: ["Dosage", "Oxydoréduction", "Molécules"],
    Terminale: ["Acides bases", "Piles", "Cinétique chimique"],
  },
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
  const [openCorrections, setOpenCorrections] = useState<Record<number, boolean>>({});

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

  const niveaux = Object.keys(COURSES[matiere] || {});
  const chapitres = COURSES[matiere]?.[niveau] || [];
  const exercises = useMemo(() => buildExercises(matiere, niveau, chapitre), [matiere, niveau, chapitre]);
  const videoLinks = useMemo(() => buildVideoLinks(matiere, niveau, chapitre), [matiere, niveau, chapitre]);
  const quizUrl = `/quiz?matiere=${encodeURIComponent(matiere)}&niveau=${encodeURIComponent(niveau)}&chapitre=${encodeURIComponent(chapitre)}`;

  function getSection(title: string) {
    const clean = normalizeCourse(course);
    const regex = new RegExp(`###\\s*${title}\\s*([\\s\\S]*?)(?=###\\s*[A-ZÉÈÀÂÊÎÔÛÇ_]+|$)`, "i");
    return clean.match(regex)?.[1]?.trim() || "";
  }

  async function handleAuth() {
    const supabase = getSupabaseClient();

    if (!supabase) {
      alert("Supabase n'est pas configuré dans Vercel.");
      return;
    }

    if (!email.trim() || password.length < 6) {
      alert("Email valide + mot de passe de 6 caractères minimum.");
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
      alert("Compte créé. Si Supabase demande confirmation, valide l’email puis connecte-toi.");
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matiere, niveau, chapitre }),
      });

      const json = await res.json();
      setCourse(normalizeCourse(json.content || fallbackCourse(matiere, niveau, chapitre)));
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
          0% { transform: translateY(0px) scale(1); opacity: .70; }
          50% { transform: translateY(-18px) scale(1.04); opacity: 1; }
          100% { transform: translateY(0px) scale(1); opacity: .70; }
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
              <span style={styles.badge}>✨ Plateforme scolaire IA Premium</span>
              <h1 style={styles.title}>Cours vrais, exercices réels, quiz et parcours élève.</h1>
              <p style={styles.subtitle}>
                Génère un cours structuré avec tableau propre, graphe adapté, vidéos cliquables,
                50 exercices progressifs corrigés et badges de progression.
              </p>

              <div style={styles.styleCards}>
                <div style={styles.styleCard}>🔐 Connexion utilisateur</div>
                <div style={styles.styleCard}>📊 Tableaux propres</div>
                <div style={styles.styleCard}>📈 Graphes adaptés</div>
                <div style={styles.styleCard}>✍️ 50 vrais exercices</div>
              </div>
            </div>

            <div id="connexion" style={styles.panel}>
              {!authReady ? (
                <h2>Chargement...</h2>
              ) : !user ? (
                <>
                  <h2>{authMode === "login" ? "Connexion" : "Créer un compte"}</h2>
                  <p style={styles.muted}>Connecte-toi pour générer les cours.</p>

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
                    {authMode === "login" ? "Créer un compte" : "J’ai déjà un compte"}
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
                      const firstNiveau = Object.keys(COURSES[m])[0];
                      setMatiere(m);
                      setNiveau(firstNiveau);
                      setChapitre(COURSES[m][firstNiveau][0]);
                      setCourse("");
                      setOpenCorrections({});
                    }}
                  >
                    {Object.keys(COURSES).map((m) => (
                      <option key={m}>{m}</option>
                    ))}
                  </select>

                  <select
                    style={styles.input}
                    value={niveau}
                    onChange={(event) => {
                      const n = event.target.value;
                      setNiveau(n);
                      setChapitre(COURSES[matiere][n][0]);
                      setCourse("");
                      setOpenCorrections({});
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
                      setOpenCorrections({});
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

              <CleanTable matiere={matiere} chapitre={chapitre} />

              <Section title="🧭 Méthodes" content={getSection("METHODES")} />
              <Section title="✅ Exemples corrigés" content={getSection("EXEMPLES")} />
              <Section title="✍️ Exercices IA" content={getSection("EXERCICES")} />

              <StudentPath chapitre={chapitre} />
              <Exercises exercises={exercises} open={openCorrections} setOpen={setOpenCorrections} />

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

function CleanTable({ matiere, chapitre }: { matiere: string; chapitre: string }) {
  const rows = getTableRows(matiere, chapitre);

  return (
    <section style={styles.section}>
      <h2>📊 Tableau de synthèse</h2>

      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Notion</th>
              <th style={styles.th}>Formule / idée</th>
              <th style={styles.th}>Utilisation</th>
              <th style={styles.th}>Piège à éviter</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row[0]}>
                <td style={styles.td}>{row[0]}</td>
                <td style={styles.td}>{row[1]}</td>
                <td style={styles.td}>{row[2]}</td>
                <td style={styles.td}>{row[3]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function GraphBlock({ matiere, chapitre }: { matiere: string; chapitre: string }) {
  const low = `${matiere} ${chapitre}`.toLowerCase();

  return (
    <section style={styles.section}>
      <h2>📈 Graphe / schéma adapté</h2>

      <div style={styles.graphBox}>
        {low.includes("dérivation") || low.includes("derivation") ? (
          <DerivativeGraph />
        ) : low.includes("limite") || low.includes("logarithme") || low.includes("fonction") ? (
          <FunctionGraph />
        ) : low.includes("lentille") ? (
          <LensGraph />
        ) : low.includes("newton") || low.includes("mouvement") ? (
          <PhysicsGraph />
        ) : low.includes("pile") || low.includes("chimie") || low.includes("acide") ? (
          <ChemistryGraph />
        ) : (
          <FunctionGraph />
        )}
      </div>

      <div style={styles.text}>
        Ce visuel est lié au chapitre {chapitre}. Il sert à lire les axes, observer la tendance,
        repérer les points importants et expliquer la méthode.
      </div>
    </section>
  );
}

function DerivativeGraph() {
  return (
    <svg viewBox="0 0 720 340" width="100%" height="340">
      <rect width="720" height="340" fill="#f8fafc" rx="24" />
      {Array.from({ length: 12 }).map((_, i) => (
        <line key={`v-${i}`} x1={80 + i * 50} y1="40" x2={80 + i * 50} y2="290" stroke="#e2e8f0" />
      ))}
      {Array.from({ length: 8 }).map((_, i) => (
        <line key={`h-${i}`} x1="50" y1={60 + i * 30} x2="670" y2={60 + i * 30} stroke="#e2e8f0" />
      ))}
      <line x1="50" y1="260" x2="670" y2="260" stroke="#111827" strokeWidth="3" />
      <line x1="95" y1="40" x2="95" y2="300" stroke="#111827" strokeWidth="3" />
      <path d="M80 245 C160 220, 240 110, 335 125 C440 140, 520 205, 650 120" fill="none" stroke="#4f46e5" strokeWidth="6" />
      <line x1="250" y1="150" x2="470" y2="105" stroke="#ef4444" strokeWidth="4" />
      <circle cx="350" cy="128" r="8" fill="#ef4444" />
      <text x="475" y="108" fill="#ef4444" fontSize="18">tangente</text>
      <text x="285" y="95" fill="#4f46e5" fontSize="18">courbe f</text>
    </svg>
  );
}

function FunctionGraph() {
  return (
    <svg viewBox="0 0 720 340" width="100%" height="340">
      <rect width="720" height="340" fill="#f8fafc" rx="24" />
      {Array.from({ length: 12 }).map((_, i) => (
        <line key={`v-${i}`} x1={80 + i * 50} y1="40" x2={80 + i * 50} y2="290" stroke="#e2e8f0" />
      ))}
      {Array.from({ length: 8 }).map((_, i) => (
        <line key={`h-${i}`} x1="50" y1={60 + i * 30} x2="670" y2={60 + i * 30} stroke="#e2e8f0" />
      ))}
      <line x1="50" y1="260" x2="670" y2="260" stroke="#111827" strokeWidth="3" />
      <line x1="95" y1="40" x2="95" y2="300" stroke="#111827" strokeWidth="3" />
      <path d="M105 250 C170 230, 250 170, 330 130 C430 80, 540 65, 650 55" fill="none" stroke="#7c3aed" strokeWidth="7" />
      <text x="255" y="78" fill="#7c3aed" fontSize="18">variation de la fonction</text>
    </svg>
  );
}

function PhysicsGraph() {
  return (
    <svg viewBox="0 0 720 340" width="100%" height="340">
      <rect width="720" height="340" fill="#f8fafc" rx="24" />
      <line x1="80" y1="270" x2="660" y2="270" stroke="#111827" strokeWidth="3" />
      <line x1="100" y1="50" x2="100" y2="292" stroke="#111827" strokeWidth="3" />
      <line x1="130" y1="245" x2="610" y2="75" stroke="#2563eb" strokeWidth="7" />
      <text x="435" y="95" fill="#2563eb" fontSize="20">relation linéaire</text>
      <text x="570" y="305" fill="#111827" fontSize="16">temps</text>
      <text x="55" y="60" fill="#111827" fontSize="16">grandeur</text>
    </svg>
  );
}

function ChemistryGraph() {
  return (
    <svg viewBox="0 0 720 340" width="100%" height="340">
      <rect width="720" height="340" fill="#f8fafc" rx="24" />
      <line x1="80" y1="270" x2="660" y2="270" stroke="#111827" strokeWidth="3" />
      <line x1="100" y1="50" x2="100" y2="292" stroke="#111827" strokeWidth="3" />
      <path d="M120 90 C220 135, 350 218, 630 262" fill="none" stroke="#16a34a" strokeWidth="7" />
      <path d="M120 262 C220 230, 350 150, 630 75" fill="none" stroke="#dc2626" strokeWidth="6" />
      <text x="470" y="97" fill="#dc2626" fontSize="18">produit</text>
      <text x="470" y="245" fill="#16a34a" fontSize="18">réactif</text>
    </svg>
  );
}

function LensGraph() {
  return (
    <svg viewBox="0 0 720 340" width="100%" height="340">
      <rect width="720" height="340" fill="#f8fafc" rx="24" />
      <line x1="70" y1="170" x2="650" y2="170" stroke="#111827" strokeWidth="3" />
      <ellipse cx="360" cy="170" rx="28" ry="120" fill="none" stroke="#2563eb" strokeWidth="5" />
      <line x1="90" y1="110" x2="360" y2="170" stroke="#ef4444" strokeWidth="4" />
      <line x1="90" y1="230" x2="360" y2="170" stroke="#ef4444" strokeWidth="4" />
      <line x1="360" y1="170" x2="610" y2="120" stroke="#ef4444" strokeWidth="4" />
      <line x1="360" y1="170" x2="610" y2="220" stroke="#ef4444" strokeWidth="4" />
      <circle cx="500" cy="170" r="6" fill="#111827" />
      <text x="385" y="55" fill="#2563eb" fontSize="18">lentille convergente</text>
      <text x="505" y="160" fill="#111827" fontSize="16">F'</text>
    </svg>
  );
}

function StudentPath({ chapitre }: { chapitre: string }) {
  const steps = [
    ["🟢 Débutant", "Comprendre les définitions du chapitre", "Badge compréhension"],
    ["🔵 Intermédiaire", "Réussir les exercices faciles et moyens", "Badge méthode"],
    ["🟣 Avancé", "Résoudre les problèmes difficiles", "Badge analyse"],
    ["🔴 Expert", "Réussir un sujet type examen", "Badge maîtrise"],
  ];

  return (
    <section style={styles.section}>
      <h2>🏆 Parcours élève — {chapitre}</h2>

      <div style={styles.badgeGrid}>
        {steps.map((step) => (
          <div key={step[0]} style={styles.badgeCard}>
            <b>{step[0]}</b>
            <p>{step[1]}</p>
            <b>{step[2]}</b>
          </div>
        ))}
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
  const low = `${matiere} ${chapitre}`.toLowerCase();

  if (low.includes("dérivation") || low.includes("derivation")) {
    return [
      makeExercise(1, "Facile", "Dériver une puissance", "Calculer la dérivée de f(x)=x².", "f'(x)=2x.", "On utilise la formule (xⁿ)' = n xⁿ⁻¹. Ici n=2 donc (x²)'=2x."),
      makeExercise(2, "Facile", "Dériver une fonction affine", "Calculer la dérivée de f(x)=3x+5.", "f'(x)=3.", "La dérivée de ax+b est a. Donc la dérivée de 3x+5 est 3."),
      makeExercise(3, "Facile", "Dériver un polynôme", "Calculer la dérivée de f(x)=x²+4x-1.", "f'(x)=2x+4.", "On dérive terme à terme : (x²)'=2x, (4x)'=4, (-1)'=0."),
      makeExercise(4, "Facile", "Tangente simple", "Pour f(x)=x², donner le coefficient directeur de la tangente en x=3.", "f'(3)=6.", "Le coefficient directeur de la tangente en a est f'(a). Ici f'(x)=2x donc f'(3)=6."),
      makeExercise(5, "Facile", "Signe d'une dérivée", "Si f'(x)>0 sur un intervalle, que peut-on dire de f ?", "f est croissante.", "Une dérivée positive sur un intervalle signifie que la fonction est croissante sur cet intervalle."),
      makeExercise(6, "Facile", "Constante", "Calculer la dérivée de f(x)=7.", "f'(x)=0.", "La dérivée d'une constante est toujours nulle."),
      makeExercise(7, "Facile", "Dérivée de racine", "Calculer la dérivée de f(x)=√x sur ]0;+∞[.", "f'(x)=1/(2√x).", "C'est une formule classique à connaître : (√x)'=1/(2√x)."),
      makeExercise(8, "Facile", "Dérivée de inverse", "Calculer la dérivée de f(x)=1/x.", "f'(x)=-1/x².", "La dérivée de 1/x est -1/x² sur tout intervalle ne contenant pas 0."),
      makeExercise(9, "Facile", "Lecture graphique", "Sur un graphe, une tangente monte de gauche à droite. Le nombre dérivé est-il positif ou négatif ?", "Il est positif.", "Une tangente montante a un coefficient directeur positif."),
      makeExercise(10, "Facile", "Minimum local", "Si f' passe de négatif à positif en a, que peut-on supposer ?", "f admet un minimum local en a.", "La fonction décroît puis croît : cela correspond à un minimum local."),
    ] + Array.from({ length: 40 }, (_, i) => {
      const id = i + 11;
      const level = id <= 25 ? "Moyen" : id <= 40 ? "Difficile" : "Type examen";
      if (level === "Moyen") {
        return makeExercise(id, level, "Étude de variations", "Soit f(x)=x²-4x+1. Étudier le signe de f'(x) puis les variations de f.", "f'(x)=2x-4, négative si x<2, positive si x>2.", "On dérive : f'(x)=2x-4. On résout 2x-4=0 donc x=2. La fonction décroît sur ]-∞;2] puis croît sur [2;+∞[.");
      }
      if (level === "Difficile") {
        return makeExercise(id, level, "Tangente à une courbe", "Pour f(x)=x³-2x, déterminer l'équation de la tangente en a=1.", "f'(x)=3x²-2, f'(1)=1, f(1)=-1, donc y=x-2.", "La tangente en a a pour équation y=f'(a)(x-a)+f(a). Ici f'(1)=1 et f(1)=-1, donc y=1(x-1)-1=x-2.");
      }
      return makeExercise(id, level, "Exercice type examen", "Étudier une fonction polynôme : dérivée, signe, variations et tangente en un point.", "Calculer f', faire un tableau de signes puis conclure.", "Une solution complète contient la dérivée, la résolution de f'(x)=0, le tableau de signes, le tableau de variations et l'équation de la tangente demandée.");
    });
  }

  if (low.includes("limite")) {
    return Array.from({ length: 50 }, (_, i) => {
      const id = i + 1;
      const level = id <= 10 ? "Facile" : id <= 25 ? "Moyen" : id <= 40 ? "Difficile" : "Type examen";
      if (id <= 10) return makeExercise(id, level, "Limite directe", "Calculer lim quand x tend vers +∞ de 3x+2.", "+∞.", "Quand x tend vers +∞, le terme 3x domine et tend vers +∞.");
      if (id <= 25) return makeExercise(id, level, "Limite de quotient", "Calculer lim en +∞ de (2x²+1)/(x²-3).", "2.", "On divise numérateur et dénominateur par x². Les termes 1/x² et 3/x² tendent vers 0, donc la limite vaut 2.");
      if (id <= 40) return makeExercise(id, level, "Forme indéterminée", "Étudier lim en +∞ de x²-3x.", "+∞.", "On factorise par x² : x²(1-3/x). Comme 1-3/x tend vers 1 et x² vers +∞, la limite vaut +∞.");
      return makeExercise(id, level, "Type examen limites", "Étudier une limite avec factorisation et interpréter graphiquement le résultat.", "Factoriser par le terme dominant.", "On identifie le terme dominant, on factorise, on simplifie la forme indéterminée puis on conclut sur l'asymptote ou le comportement de la courbe.");
    });
  }

  return Array.from({ length: 50 }, (_, index) => {
    const id = index + 1;
    const level = id <= 10 ? "Facile" : id <= 25 ? "Moyen" : id <= 40 ? "Difficile" : "Type examen";
    return makeExercise(
      id,
      level,
      `${chapitre} — exercice ${level.toLowerCase()}`,
      `Exercice de ${matiere} niveau ${niveau} sur ${chapitre}. Utiliser une définition ou une propriété du chapitre pour résoudre.`,
      "Identifier les données, appliquer la méthode du cours, conclure.",
      `On lit l’énoncé, on repère les informations liées à ${chapitre}, on vérifie les conditions d’application, puis on rédige une solution complète.`
    );
  });
}

function makeExercise(
  id: number,
  level: Exercise["level"],
  title: string,
  statement: string,
  shortCorrection: string,
  detailedCorrection: string
): Exercise {
  return { id, level, title, statement, shortCorrection, detailedCorrection };
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

function getTableRows(matiere: string, chapitre: string): string[][] {
  const low = `${matiere} ${chapitre}`.toLowerCase();

  if (low.includes("dérivation") || low.includes("derivation")) {
    return [
      ["Puissance", "(xⁿ)' = n xⁿ⁻¹", "Dériver un polynôme", "Oublier de diminuer l’exposant"],
      ["Produit", "(uv)' = u'v + uv'", "Dériver un produit", "Écrire seulement u'v'"],
      ["Quotient", "(u/v)' = (u'v - uv') / v²", "Dériver une fraction", "Inverser les signes"],
      ["Tangente", "y = f'(a)(x-a)+f(a)", "Trouver une équation de tangente", "Confondre f(a) et f'(a)"],
    ];
  }

  if (low.includes("limite")) {
    return [
      ["Terme dominant", "Plus haut degré", "Limite d’un polynôme", "Regarder le mauvais terme"],
      ["Quotient", "Comparer les degrés", "Limite d’une fraction rationnelle", "Ne pas diviser par le bon terme"],
      ["Asymptote", "Limite infinie ou finie", "Interprétation graphique", "Confondre axe et asymptote"],
      ["Forme indéterminée", "0/0, ∞/∞, ∞-∞", "Transformer l’expression", "Conclure trop vite"],
    ];
  }

  return [
    ["Définition", "Idée centrale du chapitre", "Comprendre l’énoncé", "Apprendre sans comprendre"],
    ["Propriété", "Règle de résolution", "Résoudre un exercice", "Oublier les conditions"],
    ["Méthode", "Suite d’étapes", "Rédiger proprement", "Sauter les justifications"],
    ["Exemple", "Application guidée", "S’entraîner", "Copier sans refaire"],
  ];
}

function normalizeCourse(text: string) {
  return String(text || "")
    .replace(/\r/g, "")
    .replace(/```[\s\S]*?```/g, "")
    .replace(/<\/?[^>]+(>|$)/g, "")
    .replaceAll("### COURS_DETAILLE", "### COURS")
    .replaceAll("### COURS\n_DETAILLE", "### COURS")
    .replaceAll("### EXEMPLES_CORRIGES", "### EXEMPLES")
    .replaceAll("### EXERCICES_CORRIGES", "### EXERCICES")
    .replace(/^_DETAILLE\s*$/gm, "")
    .trim();
}

function fallbackCourse(matiere: string, niveau: string, chapitre: string) {
  return `### INTRODUCTION
Ce cours porte sur ${chapitre} en ${matiere}, niveau ${niveau}. Il aide à comprendre les notions, appliquer les méthodes et réussir les exercices.

### OBJECTIFS
- Comprendre les définitions.
- Identifier les propriétés.
- Appliquer les méthodes.
- Lire un tableau ou un graphe.
- Rédiger correctement.
- Réussir des exercices.

### COURS
Le chapitre ${chapitre} doit être travaillé avec méthode. Il faut lire l’énoncé, repérer les données, choisir une propriété, vérifier ses conditions et rédiger une conclusion.

### TABLEAUX
Le tableau propre est affiché automatiquement par le site.

### METHODES
1. Lire l’énoncé.
2. Repérer les données.
3. Choisir la méthode.
4. Conclure.

### EXEMPLES
Exemple : appliquer une propriété du cours.
Correction : vérifier les conditions, appliquer et conclure.

### EXERCICES
Exercice : résoudre une question du chapitre.
Correction courte : appliquer la méthode.
Correction détaillée : détailler les étapes et conclure.

### A_RETENIR
Comprendre, pratiquer, corriger.`;
}

const styles: Record<string, CSSProperties> = {
  page: { minHeight: "100vh", background: "#090914", color: "white", fontFamily: "Arial, sans-serif" },
  hero: { minHeight: "100vh", padding: 28, background: "linear-gradient(135deg,#080816,#111827,#2e1065)", position: "relative", overflow: "hidden" },
  orbOne: { position: "absolute", width: 420, height: 420, borderRadius: "50%", background: "radial-gradient(circle,#a855f766,transparent 65%)", top: 80, left: -120, animation: "floatGlow 7s ease-in-out infinite" },
  orbTwo: { position: "absolute", width: 360, height: 360, borderRadius: "50%", background: "radial-gradient(circle,#22d3ee55,transparent 65%)", bottom: 80, right: -80, animation: "floatGlow 8s ease-in-out infinite" },
  nav: { maxWidth: 1240, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 0", position: "relative", zIndex: 2 },
  logo: { fontSize: 30, fontWeight: 900 },
  navActions: { display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" },
  navButton: { background: "#4f46e5", color: "white", padding: "12px 18px", borderRadius: 999, textDecoration: "none", fontWeight: 900 },
  navButtonLight: { background: "white", color: "#020617", padding: "12px 18px", borderRadius: 999, textDecoration: "none", fontWeight: 900 },
  logoutButton: { background: "#ef4444", color: "white", padding: "12px 18px", borderRadius: 999, border: "none", fontWeight: 900, cursor: "pointer" },
  heroGrid: { maxWidth: 1240, margin: "90px auto 0", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))", gap: 48, alignItems: "center", position: "relative", zIndex: 2 },
  badge: { display: "inline-block", background: "rgba(255,255,255,.12)", padding: "11px 16px", borderRadius: 999, fontWeight: 900, color: "#fde68a" },
  title: { fontSize: "clamp(48px,7vw,86px)", lineHeight: 0.98, margin: "26px 0", letterSpacing: -3 },
  subtitle: { fontSize: 21, lineHeight: 1.65, color: "#cbd5e1" },
  styleCards: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 14, marginTop: 28 },
  styleCard: { background: "rgba(255,255,255,.10)", border: "1px solid rgba(255,255,255,.16)", padding: 18, borderRadius: 22, fontWeight: 900 },
  panel: { background: "rgba(255,255,255,.96)", color: "#0f172a", padding: 34, borderRadius: 34, boxShadow: "0 35px 100px rgba(0,0,0,.45)" },
  muted: { color: "#64748b", lineHeight: 1.5 },
  connected: { background: "#dcfce7", color: "#166534", padding: 12, borderRadius: 14, fontWeight: 900 },
  input: { width: "100%", padding: 16, marginTop: 14, borderRadius: 18, border: "1px solid #cbd5e1", boxSizing: "border-box", fontSize: 16 },
  primaryButton: { width: "100%", marginTop: 20, padding: 17, border: "none", borderRadius: 18, background: "linear-gradient(90deg,#22d3ee,#a855f7)", color: "white", fontWeight: 900, cursor: "pointer", fontSize: 16 },
  secondaryButton: { width: "100%", marginTop: 12, padding: 15, border: "none", borderRadius: 18, background: "#020617", color: "white", fontWeight: 900, cursor: "pointer", fontSize: 16 },
  quizButton: { display: "block", marginTop: 12, padding: 15, borderRadius: 18, background: "#111827", color: "white", fontWeight: 900, textDecoration: "none", textAlign: "center" },
  courseWrap: { background: "#efe7db", color: "#0f172a", padding: "70px 28px" },
  courseHeader: { maxWidth: 1120, margin: "0 auto 24px", display: "flex", justifyContent: "space-between", alignItems: "center" },
  pdfButton: { background: "#22c55e", color: "white", padding: "14px 18px", borderRadius: 16, border: "none", fontWeight: 900 },
  course: { maxWidth: 1120, margin: "0 auto", background: "white", color: "#0f172a", borderRadius: 36, padding: 40, boxShadow: "0 12px 0 rgba(0,0,0,.15), 0 35px 90px rgba(15,23,42,.16)" },
  smallLabel: { color: "#4f46e5", fontWeight: 900, textTransform: "uppercase", letterSpacing: 1 },
  courseTitle: { fontSize: "clamp(38px,6vw,70px)", margin: "8px 0", letterSpacing: -2 },
  level: { fontSize: 22, color: "#475569", fontWeight: 900 },
  section: { marginTop: 26, padding: 26, borderRadius: 26, background: "#f8fafc", border: "1px solid #e2e8f0" },
  text: { whiteSpace: "pre-wrap", lineHeight: 1.78, fontSize: 17 },
  videoGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 16 },
  videoCard: { display: "grid", gap: 6, padding: 18, borderRadius: 18, background: "#4f46e5", color: "white", textDecoration: "none" },
  graphBox: { background: "white", borderRadius: 24, padding: 10, border: "1px solid #e2e8f0" },
  tableWrap: { overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse", background: "white", borderRadius: 16, overflow: "hidden" },
  th: { padding: 14, background: "#eef2ff", color: "#312e81", border: "1px solid #c7d2fe", textAlign: "left" },
  td: { padding: 14, border: "1px solid #e2e8f0", verticalAlign: "top" },
  badgeGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 14 },
  badgeCard: { padding: 18, borderRadius: 18, background: "white", border: "1px solid #e2e8f0" },
  exerciseGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 16 },
  exerciseCard: { padding: 18, borderRadius: 20, background: "white", border: "1px solid #e2e8f0" },
  exerciseLevel: { display: "inline-block", padding: "6px 10px", borderRadius: 999, background: "#eef2ff", color: "#4338ca", fontWeight: 900 },
  correctionButton: { marginTop: 10, padding: "10px 14px", borderRadius: 12, border: "none", background: "#111827", color: "white", fontWeight: 900, cursor: "pointer" },
  correctionBox: { marginTop: 12, padding: 14, borderRadius: 14, background: "#f8fafc", border: "1px solid #e2e8f0" },
};
