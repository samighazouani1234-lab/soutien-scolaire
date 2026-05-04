"use client";

import { useMemo, useState, type CSSProperties } from "react";

type Course = {
  introduction: string;
  objectives: string[];
  lessons: string[];
  table: string[][];
  methods: string[];
  examples: { title: string; statement: string; solution: string }[];
  summary: string[];
};

type Exercise = {
  id: number;
  level: string;
  title: string;
  statement: string;
  correction: string;
};

type QuizQuestion = {
  question: string;
  choices: string[];
  answer: number;
  explanation: string;
  difficulty: string;
};

const PROGRAMME: Record<string, Record<string, string[]>> = {
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
  const [email, setEmail] = useState("");
  const [connected, setConnected] = useState(false);

  const [matiere, setMatiere] = useState("Mathématiques");
  const [niveau, setNiveau] = useState("Première");
  const [chapitre, setChapitre] = useState("Dérivation");

  const [course, setCourse] = useState<Course | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [quiz, setQuiz] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(false);

  const [openExercise, setOpenExercise] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});

  const niveaux = Object.keys(PROGRAMME[matiere]);
  const chapitres = PROGRAMME[matiere][niveau];
  const videoLinks = useMemo(() => buildVideos(matiere, niveau, chapitre), [matiere, niveau, chapitre]);

  const score = quiz.reduce((total, q, index) => total + (answers[index] === q.answer ? 1 : 0), 0);

  async function connect() {
    if (!email.trim()) {
      alert("Entre ton email.");
      return;
    }
    setConnected(true);
  }

  async function generateAll() {
    if (!connected) {
      alert("Connecte-toi avant de générer.");
      return;
    }

    setLoading(true);
    setCourse(null);
    setExercises([]);
    setQuiz([]);
    setAnswers({});

    const payload = { matiere, niveau, chapitre };

    try {
      const [courseRes, exercisesRes, quizRes] = await Promise.all([
        fetch("/api/course", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }),
        fetch("/api/exercises", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }),
        fetch("/api/quiz", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }),
      ]);

      const courseJson = await courseRes.json();
      const exercisesJson = await exercisesRes.json();
      const quizJson = await quizRes.json();

      setCourse(courseJson);
      setExercises(Array.isArray(exercisesJson.exercises) ? exercisesJson.exercises : []);
      setQuiz(Array.isArray(quizJson.questions) ? quizJson.questions : []);

      setTimeout(() => {
        document.getElementById("resultat")?.scrollIntoView({ behavior: "smooth" });
      }, 200);
    } catch {
      alert("Erreur génération. Vérifie tes routes API.");
    }

    setLoading(false);
  }

  function downloadPdf() {
    document.title = `EduAI-${matiere}-${niveau}-${chapitre}`;
    window.print();
  }

  return (
    <>
      <style>{`
        @keyframes float {
          0%,100% { transform: translateY(0); }
          50% { transform: translateY(-16px); }
        }
        @media print {
          body * { visibility: hidden; }
          #printArea, #printArea * { visibility: visible; }
          #printArea { position: absolute; left: 0; top: 0; width: 100%; padding: 36px; background: white; color: black; }
          .noPrint { display: none !important; }
        }
      `}</style>

      <main style={styles.page}>
        <section style={styles.hero} className="noPrint">
          <div style={styles.orbA}></div>
          <div style={styles.orbB}></div>

          <nav style={styles.nav}>
            <div style={styles.logo}>🕌 EduAI Pro IA</div>
            <div style={styles.navLinks}>
              <a style={styles.link} href="#accueil">Accueil</a>
              <a style={styles.link} href="#generateur">Générateur</a>
              <a style={styles.link} href="#resultat">Cours</a>
              <a style={styles.loginPill} href="#connexion">{connected ? "Connecté" : "Connexion"}</a>
            </div>
          </nav>

          <div id="accueil" style={styles.heroGrid}>
            <div>
              <div style={styles.badge}>✨ Version IA complète</div>
              <h1 style={styles.title}>Cours, exercices, quiz et parcours générés intelligemment.</h1>
              <p style={styles.subtitle}>
                Génère un cours adapté au niveau, 50 exercices progressifs, un quiz corrigé,
                des liens vidéo cliquables, un graphe pédagogique et un parcours élève.
              </p>

              <div style={styles.featureGrid}>
                <div style={styles.feature}>🤖 IA exercices</div>
                <div style={styles.feature}>📚 Cours détaillé</div>
                <div style={styles.feature}>📈 Graphe utile</div>
                <div style={styles.feature}>🏆 Badges</div>
              </div>
            </div>

            <div id="connexion" style={styles.panel}>
              {!connected ? (
                <>
                  <h2>Connexion élève</h2>
                  <p style={styles.muted}>Connexion simple pour accéder au générateur.</p>
                  <input
                    style={styles.input}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@exemple.com"
                    type="email"
                  />
                  <button style={styles.primary} onClick={connect}>Se connecter</button>
                </>
              ) : (
                <>
                  <p style={styles.connected}>✅ Connecté : {email}</p>
                  <h2 id="generateur">Générateur IA</h2>

                  <select
                    style={styles.input}
                    value={matiere}
                    onChange={(e) => {
                      const next = e.target.value;
                      const firstNiveau = Object.keys(PROGRAMME[next])[0];
                      setMatiere(next);
                      setNiveau(firstNiveau);
                      setChapitre(PROGRAMME[next][firstNiveau][0]);
                      setCourse(null);
                    }}
                  >
                    {Object.keys(PROGRAMME).map((item) => <option key={item}>{item}</option>)}
                  </select>

                  <select
                    style={styles.input}
                    value={niveau}
                    onChange={(e) => {
                      const next = e.target.value;
                      setNiveau(next);
                      setChapitre(PROGRAMME[matiere][next][0]);
                      setCourse(null);
                    }}
                  >
                    {niveaux.map((item) => <option key={item}>{item}</option>)}
                  </select>

                  <select
                    style={styles.input}
                    value={chapitre}
                    onChange={(e) => {
                      setChapitre(e.target.value);
                      setCourse(null);
                    }}
                  >
                    {chapitres.map((item) => <option key={item}>{item}</option>)}
                  </select>

                  <button style={styles.primary} onClick={generateAll}>
                    {loading ? "Génération IA..." : "✨ Générer cours + exercices + quiz"}
                  </button>
                </>
              )}
            </div>
          </div>
        </section>

        {course && (
          <section id="resultat" style={styles.courseWrap}>
            <div style={styles.actions} className="noPrint">
              <h2>📘 Résultat IA</h2>
              <button style={styles.pdfButton} onClick={downloadPdf}>Télécharger PDF</button>
            </div>

            <article id="printArea" style={styles.course}>
              <p style={styles.subject}>{matiere}</p>
              <h1 style={styles.courseTitle}>{chapitre}</h1>
              <p style={styles.level}>{niveau}</p>

              <Block title="🎬 Vidéos adaptées">
                <div style={styles.videoGrid}>
                  {videoLinks.map((v) => (
                    <a key={v.href} style={styles.videoCard} href={v.href} target="_blank" rel="noopener noreferrer">
                      <b>{v.title}</b>
                      <span>{v.description}</span>
                    </a>
                  ))}
                </div>
              </Block>

              <Block title="📈 Graphe / schéma">
                <Graph matiere={matiere} chapitre={chapitre} />
              </Block>

              <Block title="🚀 Introduction">
                <p style={styles.paragraph}>{course.introduction}</p>
              </Block>

              <Block title="🎯 Objectifs">
                <ul style={styles.list}>
                  {course.objectives.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </Block>

              <Block title="📚 Cours détaillé">
                {course.lessons.map((item) => <p key={item} style={styles.paragraph}>{item}</p>)}
              </Block>

              <Block title="📊 Tableau propre">
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Notion</th>
                      <th style={styles.th}>Formule / idée</th>
                      <th style={styles.th}>Utilisation</th>
                      <th style={styles.th}>Piège</th>
                    </tr>
                  </thead>
                  <tbody>
                    {course.table.map((row, index) => (
                      <tr key={index}>
                        <td style={styles.td}>{row[0] || ""}</td>
                        <td style={styles.td}>{row[1] || ""}</td>
                        <td style={styles.td}>{row[2] || ""}</td>
                        <td style={styles.td}>{row[3] || ""}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Block>

              <Block title="🧭 Méthodes">
                <ol style={styles.list}>
                  {course.methods.map((item) => <li key={item}>{item}</li>)}
                </ol>
              </Block>

              <Block title="✅ Exemples corrigés">
                {course.examples.map((ex, index) => (
                  <div key={index} style={styles.example}>
                    <h3>{ex.title}</h3>
                    <p><b>Énoncé :</b> {ex.statement}</p>
                    <p><b>Correction :</b> {ex.solution}</p>
                  </div>
                ))}
              </Block>

              <Block title="🏆 Parcours élève">
                <div style={styles.badgeGrid}>
                  <div style={styles.badgeCard}><b>🟢 Débutant</b><p>Comprendre les définitions.</p><strong>Badge base</strong></div>
                  <div style={styles.badgeCard}><b>🔵 Intermédiaire</b><p>Réussir les exercices faciles et moyens.</p><strong>Badge méthode</strong></div>
                  <div style={styles.badgeCard}><b>🟣 Avancé</b><p>Résoudre des exercices difficiles.</p><strong>Badge analyse</strong></div>
                  <div style={styles.badgeCard}><b>🔴 Expert</b><p>Réussir les questions type bac.</p><strong>Badge maîtrise</strong></div>
                </div>
              </Block>

              <Block title="🧠 Quiz corrigé">
                {quiz.map((question, index) => (
                  <div key={question.question} style={styles.quizBox}>
                    <h3>{index + 1}. {question.question}</h3>
                    <span style={styles.quizLevel}>{question.difficulty}</span>
                    <div style={styles.choiceGrid}>
                      {question.choices.map((choice, choiceIndex) => {
                        const answered = answers[index] !== undefined;
                        const selected = answers[index] === choiceIndex;
                        const correct = question.answer === choiceIndex;

                        return (
                          <button
                            key={choice}
                            style={{
                              ...styles.choice,
                              ...(answered && correct ? styles.correct : {}),
                              ...(answered && selected && !correct ? styles.wrong : {}),
                            }}
                            onClick={() => setAnswers((prev) => ({ ...prev, [index]: choiceIndex }))}
                          >
                            {choice}
                          </button>
                        );
                      })}
                    </div>
                    {answers[index] !== undefined && <p style={styles.explanation}>{question.explanation}</p>}
                  </div>
                ))}
                <p style={styles.score}>Score : {score}/{quiz.length}</p>
              </Block>

              <Block title="✍️ Banque de 50 exercices IA">
                <div style={styles.exerciseGrid}>
                  {exercises.map((exercise) => (
                    <div key={exercise.id} style={styles.exerciseCard}>
                      <span style={styles.exerciseLevel}>{exercise.level}</span>
                      <h3>{exercise.id}. {exercise.title}</h3>
                      <p>{exercise.statement}</p>
                      <button
                        style={styles.correctionButton}
                        onClick={() => setOpenExercise(openExercise === exercise.id ? null : exercise.id)}
                      >
                        {openExercise === exercise.id ? "Masquer" : "Voir correction"}
                      </button>
                      {openExercise === exercise.id && <p style={styles.correction}>{exercise.correction}</p>}
                    </div>
                  ))}
                </div>
              </Block>

              <Block title="🧾 À retenir">
                <ul style={styles.list}>
                  {course.summary.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </Block>
            </article>
          </section>
        )}
      </main>
    </>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={styles.block}>
      <h2>{title}</h2>
      {children}
    </section>
  );
}

function Graph({ matiere, chapitre }: { matiere: string; chapitre: string }) {
  const low = `${matiere} ${chapitre}`.toLowerCase();

  if (low.includes("dérivation") || low.includes("derivation")) {
    return (
      <svg viewBox="0 0 720 340" width="100%" height="340">
        <rect width="720" height="340" fill="#f8fafc" rx="24" />
        <line x1="70" y1="260" x2="660" y2="260" stroke="#111827" strokeWidth="3" />
        <line x1="110" y1="55" x2="110" y2="290" stroke="#111827" strokeWidth="3" />
        <path d="M95 245 C170 210, 250 105, 350 130 C460 160, 520 215, 650 125" fill="none" stroke="#4f46e5" strokeWidth="7" />
        <line x1="250" y1="152" x2="485" y2="104" stroke="#ef4444" strokeWidth="4" />
        <circle cx="360" cy="128" r="9" fill="#ef4444" />
        <text x="492" y="106" fill="#ef4444" fontSize="20">tangente</text>
        <text x="245" y="86" fill="#4f46e5" fontSize="20">courbe de f</text>
      </svg>
    );
  }

  if (low.includes("limite") || low.includes("logarithme") || low.includes("fonction")) {
    return (
      <svg viewBox="0 0 720 340" width="100%" height="340">
        <rect width="720" height="340" fill="#f8fafc" rx="24" />
        <line x1="70" y1="260" x2="660" y2="260" stroke="#111827" strokeWidth="3" />
        <line x1="110" y1="55" x2="110" y2="290" stroke="#111827" strokeWidth="3" />
        <path d="M120 248 C195 220, 260 170, 345 128 C450 75, 545 62, 650 58" fill="none" stroke="#7c3aed" strokeWidth="7" />
        <line x1="585" y1="45" x2="585" y2="285" stroke="#ef4444" strokeWidth="3" strokeDasharray="8 8" />
        <text x="430" y="92" fill="#7c3aed" fontSize="20">comportement limite</text>
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 720 340" width="100%" height="340">
      <rect width="720" height="340" fill="#f8fafc" rx="24" />
      <line x1="80" y1="270" x2="660" y2="270" stroke="#111827" strokeWidth="3" />
      <line x1="105" y1="55" x2="105" y2="290" stroke="#111827" strokeWidth="3" />
      <path d="M120 90 C220 135, 350 218, 630 262" fill="none" stroke="#16a34a" strokeWidth="7" />
      <path d="M120 262 C220 230, 350 150, 630 75" fill="none" stroke="#dc2626" strokeWidth="6" />
      <text x="470" y="97" fill="#dc2626" fontSize="18">produit</text>
      <text x="470" y="245" fill="#16a34a" fontSize="18">réactif</text>
    </svg>
  );
}

function buildVideos(matiere: string, niveau: string, chapitre: string) {
  const q = encodeURIComponent(`${matiere} ${niveau} ${chapitre} cours exercices corrigés`);
  const q2 = encodeURIComponent(`${matiere} ${chapitre}`);

  return [
    { title: "YouTube", description: "Recherche vidéo ciblée", href: `https://www.youtube.com/results?search_query=${q}` },
    { title: "Khan Academy", description: "Ressources pédagogiques", href: `https://fr.khanacademy.org/search?page_search_query=${q2}` },
    { title: "Lumni", description: "Cours scolaires", href: `https://www.lumni.fr/recherche?query=${q2}` },
  ];
}

const styles: Record<string, CSSProperties> = {
  page: { minHeight: "100vh", background: "#0b1020", color: "white", fontFamily: "Arial, sans-serif" },
  hero: { minHeight: "100vh", padding: 28, position: "relative", overflow: "hidden", background: "linear-gradient(135deg,#080816,#111827,#312e81)" },
  orbA: { position: "absolute", width: 420, height: 420, borderRadius: "50%", background: "radial-gradient(circle,#a855f766,transparent 65%)", top: 70, left: -120, animation: "float 7s ease-in-out infinite" },
  orbB: { position: "absolute", width: 360, height: 360, borderRadius: "50%", background: "radial-gradient(circle,#22d3ee55,transparent 65%)", bottom: 70, right: -90, animation: "float 8s ease-in-out infinite" },
  nav: { maxWidth: 1240, margin: "0 auto", position: "relative", zIndex: 2, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 0" },
  logo: { fontSize: 30, fontWeight: 900 },
  navLinks: { display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" },
  link: { color: "#e0f2fe", textDecoration: "none", fontWeight: 900 },
  loginPill: { background: "white", color: "#111827", padding: "12px 18px", borderRadius: 999, textDecoration: "none", fontWeight: 900 },
  heroGrid: { maxWidth: 1240, margin: "80px auto 0", position: "relative", zIndex: 2, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))", gap: 48, alignItems: "center" },
  badge: { display: "inline-block", background: "rgba(255,255,255,.12)", color: "#fde68a", padding: "11px 16px", borderRadius: 999, fontWeight: 900 },
  title: { fontSize: "clamp(48px,7vw,88px)", lineHeight: 0.98, margin: "26px 0", letterSpacing: -3 },
  subtitle: { fontSize: 21, color: "#cbd5e1", lineHeight: 1.65 },
  featureGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 14, marginTop: 28 },
  feature: { background: "rgba(255,255,255,.10)", border: "1px solid rgba(255,255,255,.16)", padding: 18, borderRadius: 22, fontWeight: 900 },
  panel: { background: "rgba(255,255,255,.96)", color: "#0f172a", padding: 34, borderRadius: 34, boxShadow: "0 35px 100px rgba(0,0,0,.45)" },
  muted: { color: "#64748b" },
  connected: { background: "#dcfce7", color: "#166534", padding: 12, borderRadius: 14, fontWeight: 900 },
  input: { width: "100%", padding: 16, marginTop: 14, borderRadius: 18, border: "1px solid #cbd5e1", boxSizing: "border-box", fontSize: 16 },
  primary: { width: "100%", marginTop: 18, padding: 17, border: "none", borderRadius: 18, background: "linear-gradient(90deg,#22d3ee,#a855f7)", color: "white", fontWeight: 900, cursor: "pointer", fontSize: 16 },
  courseWrap: { background: "#efe7db", color: "#0f172a", padding: "70px 28px" },
  actions: { maxWidth: 1120, margin: "0 auto 24px", display: "flex", justifyContent: "space-between", alignItems: "center" },
  pdfButton: { background: "#22c55e", color: "white", border: "none", padding: "14px 18px", borderRadius: 16, fontWeight: 900 },
  course: { maxWidth: 1120, margin: "0 auto", background: "white", color: "#0f172a", borderRadius: 36, padding: 40, boxShadow: "0 12px 0 rgba(0,0,0,.15), 0 35px 90px rgba(15,23,42,.16)" },
  subject: { color: "#4f46e5", fontWeight: 900, letterSpacing: 2, textTransform: "uppercase" },
  courseTitle: { fontSize: "clamp(40px,6vw,76px)", margin: "8px 0", letterSpacing: -2 },
  level: { fontSize: 22, fontWeight: 900, color: "#475569" },
  block: { marginTop: 26, padding: 26, borderRadius: 26, background: "#f8fafc", border: "1px solid #e2e8f0" },
  paragraph: { fontSize: 17, lineHeight: 1.8 },
  list: { fontSize: 17, lineHeight: 1.8 },
  videoGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))", gap: 16 },
  videoCard: { display: "grid", gap: 6, background: "#4f46e5", color: "white", textDecoration: "none", borderRadius: 18, padding: 18 },
  table: { width: "100%", borderCollapse: "collapse", background: "white" },
  th: { padding: 14, background: "#eef2ff", color: "#312e81", border: "1px solid #c7d2fe", textAlign: "left" },
  td: { padding: 14, border: "1px solid #e2e8f0", verticalAlign: "top" },
  example: { background: "white", padding: 18, border: "1px solid #e2e8f0", borderRadius: 16, marginTop: 12 },
  badgeGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 14 },
  badgeCard: { background: "white", border: "1px solid #e2e8f0", borderRadius: 18, padding: 18 },
  quizBox: { background: "white", border: "1px solid #e2e8f0", borderRadius: 18, padding: 18, marginTop: 14 },
  quizLevel: { display: "inline-block", background: "#eef2ff", color: "#4338ca", padding: "6px 10px", borderRadius: 999, fontWeight: 900, marginBottom: 12 },
  choiceGrid: { display: "grid", gap: 10 },
  choice: { padding: 14, borderRadius: 14, border: "1px solid #cbd5e1", background: "#f8fafc", cursor: "pointer", textAlign: "left" },
  correct: { background: "#dcfce7", border: "2px solid #22c55e" },
  wrong: { background: "#fee2e2", border: "2px solid #ef4444" },
  explanation: { background: "#eef2ff", padding: 12, borderRadius: 12 },
  score: { marginTop: 16, padding: 16, borderRadius: 16, background: "#dcfce7", color: "#166534", fontWeight: 900 },
  exerciseGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 16 },
  exerciseCard: { background: "white", border: "1px solid #e2e8f0", borderRadius: 20, padding: 18 },
  exerciseLevel: { display: "inline-block", padding: "6px 10px", borderRadius: 999, background: "#eef2ff", color: "#4338ca", fontWeight: 900 },
  correctionButton: { marginTop: 10, padding: "10px 14px", borderRadius: 12, border: "none", background: "#111827", color: "white", fontWeight: 900, cursor: "pointer" },
  correction: { background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 14, padding: 14 },
};
