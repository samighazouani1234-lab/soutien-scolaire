"use client";

import { useEffect, useMemo, useState } from "react";
import { data } from "../data/courses";
import { getSupabaseClient } from "../lib/supabase";

type Exercise = {
  id: number;
  level: string;
  title: string;
  statement: string;
  shortCorrection: string;
  detailedCorrection: string;
};

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

  const niveaux = useMemo(() => {
    if (!matiere) return [];
    const selected = (data as any)[matiere];
    if (!selected) return [];
    return Object.values(selected).flatMap((category: any) => Object.keys(category));
  }, [matiere]);

  const chapitres = useMemo(() => {
    if (!matiere || !niveau) return [];
    const selected = (data as any)[matiere];
    if (!selected) return [];

    for (const category in selected) {
      if (selected[category][niveau]) return selected[category][niveau];
    }

    return [];
  }, [matiere, niveau]);

  const exercises = useMemo(
    () => buildExercises(matiere || "Mathématiques", niveau || "Terminale", chapitre || "Limites"),
    [matiere, niveau, chapitre]
  );

  const videoLinks = useMemo(() => buildVideoLinks(matiere, niveau, chapitre), [matiere, niveau, chapitre]);

  function normalizeText(text: string) {
    return text
      .replaceAll("### COURS\n_DETAILLE", "### COURS_DETAILLE")
      .replaceAll("### COURS\r\n_DETAILLE", "### COURS_DETAILLE")
      .replaceAll("### EXEMPLES\n_CORRIGES", "### EXEMPLES_CORRIGES")
      .replaceAll("### EXERCICES\n_CORRIGES", "### EXERCICES_CORRIGES");
  }

  function getSection(title: string) {
    if (!course) return "";
    const clean = normalizeText(course);
    const regex = new RegExp(`###\\s*${title}\\s*([\\s\\S]*?)(?=###\\s*[A-ZÉÈÀÂÊÎÔÛÇ_]+|$)`, "i");
    return clean.match(regex)?.[1]?.trim() || "";
  }

  async function handleSignup() {
    const supabase = getSupabaseClient();
    if (!supabase) return alert("Erreur Supabase");
    if (!email.trim() || !password) return alert("Entre un email et un mot de passe");
    if (password.length < 6) return alert("Mot de passe minimum 6 caractères");

    setLoading(true);
    const { error } = await supabase.auth.signUp({ email: email.trim(), password });
    setLoading(false);

    if (error) alert(error.message);
    else alert("Compte créé. Tu peux maintenant te connecter.");
  }

  async function handleLogin() {
    const supabase = getSupabaseClient();
    if (!supabase) return alert("Erreur Supabase");
    if (!email.trim() || !password) return alert("Entre un email et un mot de passe");

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
    if (!user) return alert("Connecte-toi pour générer un cours");
    if (!matiere || !niveau || !chapitre) return alert("Choisis une matière, un niveau et un chapitre");

    setLoading(true);
    setCourse("");

    try {
      const res = await fetch("/api/course", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matiere, niveau, chapitre }),
      });

      const json = await res.json();
      const content = normalizeText(json.content || localCourse(matiere, niveau, chapitre));

      setCourse(content);
      localStorage.setItem(`eduai-course-${matiere}-${niveau}-${chapitre}`, content);

      setTimeout(() => document.getElementById("cours")?.scrollIntoView({ behavior: "smooth" }), 300);
    } catch {
      setCourse(localCourse(matiere, niveau, chapitre));
    }

    setLoading(false);
  }

  function downloadPDF() {
    document.title = `Cours-${matiere}-${chapitre}`;
    window.print();
  }

  const quizUrl = `/quiz?matiere=${encodeURIComponent(matiere || "Mathématiques")}&niveau=${encodeURIComponent(niveau || "Terminale")}&chapitre=${encodeURIComponent(chapitre || "Limites")}`;

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
            position: absolute; left: 0; top: 0; width: 100%;
            background: white !important; color: black !important; padding: 40px;
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
              <a href="#generator" style={styles.link}>Générateur</a>
              <a href={user ? quizUrl : "#login"} style={styles.link}>Quiz</a>
              {user ? (
                <button onClick={handleLogout} style={styles.logout}>Déconnexion</button>
              ) : (
                <a href="#login" style={styles.navButton}>Connexion</a>
              )}
            </div>
          </nav>

          <div style={styles.layout}>
            <div>
              <span style={styles.badge}>✨ Plateforme scolaire IA premium</span>
              <h1 style={styles.title}>Cours détaillés, graphes, vidéos et 50 exercices.</h1>
              <p style={styles.subtitle}>
                Graphes visibles automatiquement, liens vidéo cliquables, parcours élève avec badges,
                banque de 50 exercices progressifs.
              </p>

              <div style={styles.styleCards}>
                <div style={styles.styleCard}>📈 Graphe affiché</div>
                <div style={styles.styleCard}>🎬 Vidéos cliquables</div>
                <div style={styles.styleCard}>✍️ 50 exercices</div>
              </div>
            </div>

            <div id="login" style={styles.panel}>
              {!authReady ? (
                <h2>Chargement...</h2>
              ) : !user ? (
                <>
                  <h2 style={styles.panelTitle}>🔐 Connexion</h2>
                  <input style={styles.input} type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
                  <input style={styles.input} type="password" placeholder="Mot de passe" value={password} onChange={(e) => setPassword(e.target.value)} />
                  <button onClick={handleLogin} style={styles.primaryButton}>{loading ? "Connexion..." : "Se connecter"}</button>
                  <button onClick={handleSignup} style={styles.secondaryButton}>Créer un compte</button>
                </>
              ) : (
                <div id="generator">
                  <p style={styles.connected}>✅ Connecté : {user.email}</p>
                  <h2 style={styles.panelTitle}>Créer un cours</h2>

                  <select style={styles.input} value={matiere} onChange={(e) => { setMatiere(e.target.value); setNiveau(""); setChapitre(""); setCourse(""); }}>
                    <option value="">Choisir une matière</option>
                    {Object.keys(data).map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>

                  <select style={styles.input} value={niveau} onChange={(e) => { setNiveau(e.target.value); setChapitre(""); setCourse(""); }}>
                    <option value="">Choisir un niveau</option>
                    {niveaux.map((n: any) => <option key={n} value={n}>{n}</option>)}
                  </select>

                  <select style={styles.input} value={chapitre} onChange={(e) => { setChapitre(e.target.value); setCourse(""); }}>
                    <option value="">Choisir un chapitre</option>
                    {chapitres.map((c: any) => <option key={c} value={c}>{c}</option>)}
                  </select>

                  <button onClick={generateCourse} style={styles.primaryButton}>
                    {loading ? "Génération IA..." : "✨ Générer le cours"}
                  </button>

                  <a href={quizUrl} style={styles.quizButton}>🧠 Lancer le quiz interactif</a>
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
                <a href={quizUrl} style={styles.quizButtonSmall}>🧠 Quiz interactif</a>
                <button onClick={downloadPDF} style={styles.pdfButton}>📄 Télécharger PDF</button>
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

              <VideoBlock links={videoLinks} chapitre={chapitre} niveau={niveau} matiere={matiere} />
              <GraphBlock matiere={matiere} chapitre={chapitre} />

              <Section icon="🚀" title="Introduction" content={getSection("INTRODUCTION")} />
              <Section icon="🎯" title="Objectifs" content={getSection("OBJECTIFS")} />
              <Section icon="📚" title="Cours détaillé" content={getSection("COURS_DETAILLE") || getSection("COURS")} />
              <Section icon="📊" title="Tableaux" content={getSection("TABLEAUX")} />
              <Section icon="🧭" title="Méthodes" content={getSection("METHODES")} />
              <Section icon="✅" title="Exemples corrigés" content={getSection("EXEMPLES_CORRIGES") || getSection("EXEMPLES")} />
              <Section icon="✍️" title="Exercices IA" content={getSection("EXERCICES_CORRIGES") || getSection("EXERCICES")} />

              <StudentPath />
              <ExercisesBlock exercises={exercises} openCorrections={openCorrections} setOpenCorrections={setOpenCorrections} />

              <Section icon="🧠" title="À retenir" content={getSection("A_RETENIR")} />

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

function Section({ icon, title, content }: { icon: string; title: string; content: string }) {
  if (!content) return null;
  return (
    <section style={styles.section}>
      <h2 style={styles.sectionTitle}>{icon} {title}</h2>
      <Text content={content} />
    </section>
  );
}

function Text({ content }: { content: string }) {
  return <div style={styles.text}>{content}</div>;
}

function VideoBlock({ links, matiere, niveau, chapitre }: any) {
  return (
    <section style={styles.section}>
      <h2 style={styles.sectionTitle}>🎬 Cours vidéo adaptés</h2>
      <div style={styles.videoGrid}>
        {links.map((link: any) => (
          <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer" style={styles.videoCard}>
            <span style={styles.videoIcon}>{link.icon}</span>
            <span>
              <b>{link.title}</b>
              <small style={{ display: "block", marginTop: 6 }}>{link.desc}</small>
            </span>
          </a>
        ))}
      </div>
      <p style={styles.text}>
        Mots-clés conseillés : {matiere} {niveau} {chapitre} cours exercices corrigés.
      </p>
    </section>
  );
}

function GraphBlock({ matiere, chapitre }: { matiere: string; chapitre: string }) {
  const isPhysique = matiere.toLowerCase().includes("physique");
  const isChimie = matiere.toLowerCase().includes("chimie");

  return (
    <section style={styles.section}>
      <h2 style={styles.sectionTitle}>📈 Graphe / schéma adapté</h2>

      <div style={styles.graphBox}>
        {isPhysique ? <PhysicsGraph /> : isChimie ? <ChemistryGraph /> : <MathGraph />}
      </div>

      <p style={styles.text}>
        Ce visuel sert à comprendre {chapitre}. L’élève doit lire les axes, repérer les points importants,
        décrire la tendance, puis relier le graphique à la méthode du cours.
      </p>
    </section>
  );
}

function MathGraph() {
  return (
    <svg viewBox="0 0 700 330" width="100%" height="330">
      <rect x="0" y="0" width="700" height="330" fill="#f8fafc" rx="24" />
      {Array.from({ length: 13 }).map((_, i) => <line key={`v${i}`} x1={60 + i * 50} y1="35" x2={60 + i * 50} y2="280" stroke="#e2e8f0" />)}
      {Array.from({ length: 9 }).map((_, i) => <line key={`h${i}`} x1="45" y1={50 + i * 28} x2="650" y2={50 + i * 28} stroke="#e2e8f0" />)}
      <line x1="45" y1="260" x2="655" y2="260" stroke="#111827" strokeWidth="3" />
      <line x1="90" y1="35" x2="90" y2="290" stroke="#111827" strokeWidth="3" />
      <path d="M100 245 C170 210, 230 160, 315 132 C405 100, 510 72, 620 55" fill="none" stroke="#7c3aed" strokeWidth="7" />
      <circle cx="315" cy="132" r="7" fill="#ec4899" />
      <text x="585" y="295" fill="#111827" fontSize="18">x</text>
      <text x="60" y="50" fill="#111827" fontSize="18">y</text>
      <text x="210" y="72" fill="#7c3aed" fontSize="20">courbe modèle</text>
    </svg>
  );
}

function PhysicsGraph() {
  return (
    <svg viewBox="0 0 700 330" width="100%" height="330">
      <rect x="0" y="0" width="700" height="330" fill="#f8fafc" rx="24" />
      <line x1="70" y1="265" x2="640" y2="265" stroke="#111827" strokeWidth="3" />
      <line x1="90" y1="45" x2="90" y2="285" stroke="#111827" strokeWidth="3" />
      <line x1="110" y1="240" x2="600" y2="70" stroke="#2563eb" strokeWidth="6" />
      <circle cx="250" cy="192" r="8" fill="#ec4899" />
      <circle cx="430" cy="130" r="8" fill="#ec4899" />
      <text x="515" y="92" fill="#2563eb" fontSize="20">relation physique</text>
      <text x="560" y="300" fill="#111827" fontSize="18">temps</text>
      <text x="45" y="55" fill="#111827" fontSize="18">grandeur</text>
    </svg>
  );
}

function ChemistryGraph() {
  return (
    <svg viewBox="0 0 700 330" width="100%" height="330">
      <rect x="0" y="0" width="700" height="330" fill="#f8fafc" rx="24" />
      <line x1="70" y1="265" x2="640" y2="265" stroke="#111827" strokeWidth="3" />
      <line x1="90" y1="45" x2="90" y2="285" stroke="#111827" strokeWidth="3" />
      <path d="M110 80 C190 125, 260 170, 345 205 C440 240, 520 255, 620 260" fill="none" stroke="#16a34a" strokeWidth="7" />
      <path d="M110 260 C190 235, 270 205, 360 165 C455 122, 535 88, 620 70" fill="none" stroke="#dc2626" strokeWidth="5" />
      <text x="430" y="100" fill="#dc2626" fontSize="18">produit</text>
      <text x="430" y="245" fill="#16a34a" fontSize="18">réactif</text>
      <text x="555" y="300" fill="#111827" fontSize="18">temps</text>
      <text x="35" y="55" fill="#111827" fontSize="18">quantité</text>
    </svg>
  );
}

function StudentPath() {
  return (
    <section style={styles.section}>
      <h2 style={styles.sectionTitle}>🏆 Parcours élève et badges</h2>
      <div style={styles.badgeGrid}>
        <div style={styles.badgeCard}>🟢 Débutant<br />Définitions maîtrisées<br /><b>Badge 🧠 Compréhension</b></div>
        <div style={styles.badgeCard}>🔵 Intermédiaire<br />Méthodes appliquées<br /><b>Badge ⚡ Rapidité</b></div>
        <div style={styles.badgeCard}>🟣 Avancé<br />Exercices difficiles réussis<br /><b>Badge 📊 Analyse</b></div>
        <div style={styles.badgeCard}>🔴 Expert<br />Type examen réussi<br /><b>Badge 🎯 Maîtrise</b></div>
      </div>

      <div style={styles.progressWrap}>
        <div style={{ ...styles.progressBar, width: "80%" }}></div>
      </div>

      <p style={styles.text}>
        Progression conseillée : 70% au quiz pour passer au niveau suivant, 90% pour obtenir le badge de maîtrise.
      </p>
    </section>
  );
}

function ExercisesBlock({ exercises, openCorrections, setOpenCorrections }: any) {
  return (
    <section style={styles.section}>
      <h2 style={styles.sectionTitle}>✍️ Banque de 50 exercices progressifs</h2>
      <div style={styles.exerciseGrid}>
        {exercises.map((ex: Exercise) => (
          <div key={ex.id} style={styles.exerciseCard}>
            <span style={styles.exerciseLevel}>{ex.level}</span>
            <h3>{ex.id}. {ex.title}</h3>
            <p>{ex.statement}</p>
            <button
              style={styles.correctionButton}
              onClick={() => setOpenCorrections((prev: any) => ({ ...prev, [ex.id]: !prev[ex.id] }))}
            >
              {openCorrections[ex.id] ? "Masquer la correction" : "Voir la correction"}
            </button>

            {openCorrections[ex.id] && (
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

function buildVideoLinks(matiere: string, niveau: string, chapitre: string) {
  const m = matiere || "Mathématiques";
  const n = niveau || "Terminale";
  const c = chapitre || "Limites";
  const query = encodeURIComponent(`${m} ${n} ${c} cours exercices corrigés`);
  const query2 = encodeURIComponent(`${m} ${c}`);

  return [
    {
      icon: "▶️",
      title: "Vidéos YouTube adaptées",
      desc: `${m} · ${n} · ${c}`,
      href: `https://www.youtube.com/results?search_query=${query}`,
    },
    {
      icon: "📘",
      title: "Ressources Khan Academy",
      desc: `Recherche ciblée : ${c}`,
      href: `https://fr.khanacademy.org/search?page_search_query=${query2}`,
    },
    {
      icon: "🎓",
      title: "Cours Lumni",
      desc: "Recherche de ressources scolaires",
      href: `https://www.lumni.fr/recherche?query=${query2}`,
    },
  ];
}

function buildExercises(matiere: string, niveau: string, chapitre: string): Exercise[] {
  return Array.from({ length: 50 }, (_, index) => {
    const id = index + 1;
    const level = id <= 10 ? "Facile" : id <= 25 ? "Moyen" : id <= 40 ? "Difficile" : "Type examen";
    const type =
      id <= 10 ? "application directe" :
      id <= 25 ? "méthode guidée" :
      id <= 40 ? "raisonnement en plusieurs étapes" :
      "rédaction complète type examen";

    return {
      id,
      level,
      title: `${chapitre} — ${type}`,
      statement:
        `Exercice ${level.toLowerCase()} de ${matiere} niveau ${niveau} sur "${chapitre}". ` +
        `Résous la question en identifiant la notion du cours, la propriété ou la méthode adaptée, puis rédige proprement.`,
      shortCorrection:
        "Identifier les données, choisir la propriété utile, appliquer la méthode et conclure clairement.",
      detailedCorrection:
        `On commence par lire l’énoncé et repérer les informations liées à "${chapitre}". ` +
        `On vérifie ensuite les conditions d’application de la propriété ou de la méthode. ` +
        `On effectue le raisonnement ou le calcul étape par étape, puis on termine par une conclusion rédigée.`
    };
  });
}

function localCourse(matiere: string, niveau: string, chapitre: string) {
  return `### INTRODUCTION
Cours généré localement sur ${chapitre}.`;
}

const styles: any = {
  page: { minHeight: "100vh", background: "#090914", color: "white", fontFamily: "Arial, sans-serif" },
  hero: { position: "relative", overflow: "hidden", minHeight: "100vh", padding: 28, background: "linear-gradient(135deg,#080816 0%,#111827 45%,#2e1065 100%)" },
  orbOne: { position: "absolute", width: 420, height: 420, borderRadius: "50%", background: "radial-gradient(circle,#a855f766,transparent 65%)", top: 80, left: -120, animation: "floatGlow 7s ease-in-out infinite" },
  orbTwo: { position: "absolute", width: 360, height: 360, borderRadius: "50%", background: "radial-gradient(circle,#22d3ee55,transparent 65%)", bottom: 80, right: -80, animation: "floatGlow 8s ease-in-out infinite" },
  nav: { position: "relative", zIndex: 2, maxWidth: 1240, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 0" },
  logo: { fontSize: 30, fontWeight: 900 },
  navLinks: { display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" },
  link: { color: "#e0f2fe", textDecoration: "none", fontWeight: 900 },
  navButton: { background: "white", color: "#020617", padding: "12px 18px", borderRadius: 999, textDecoration: "none", fontWeight: 900 },
  logout: { border: "none", background: "#ef4444", color: "white", padding: "12px 18px", borderRadius: 999, fontWeight: 900, cursor: "pointer" },
  layout: { position: "relative", zIndex: 2, maxWidth: 1240, margin: "90px auto 0", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))", gap: 48, alignItems: "center" },
  badge: { display: "inline-block", background: "rgba(255,255,255,.12)", border: "1px solid rgba(255,255,255,.18)", padding: "11px 16px", borderRadius: 999, fontWeight: 900, color: "#fde68a" },
  title: { fontSize: "clamp(52px,8vw,92px)", lineHeight: .96, margin: "26px 0", letterSpacing: -4 },
  subtitle: { fontSize: 21, lineHeight: 1.65, color: "#cbd5e1", maxWidth: 680 },
  styleCards: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))", gap: 14, marginTop: 30, maxWidth: 650 },
  styleCard: { background: "rgba(255,255,255,.10)", border: "1px solid rgba(255,255,255,.16)", padding: 18, borderRadius: 24, fontWeight: 900, backdropFilter: "blur(14px)" },
  panel: { background: "rgba(255,255,255,.96)", color: "#0f172a", padding: 34, borderRadius: 34, boxShadow: "0 35px 100px rgba(0,0,0,.45)", animation: "pulseSoft 4s ease-in-out infinite" },
  panelTitle: { fontSize: 30, marginTop: 0 },
  input: { width: "100%", padding: 16, marginTop: 14, borderRadius: 18, border: "1px solid #cbd5e1", boxSizing: "border-box", fontSize: 16, background: "white" },
  primaryButton: { width: "100%", marginTop: 20, padding: 17, border: "none", borderRadius: 18, background: "linear-gradient(90deg,#22d3ee,#a855f7)", color: "white", fontWeight: 900, cursor: "pointer", fontSize: 16 },
  secondaryButton: { width: "100%", marginTop: 12, padding: 17, border: "none", borderRadius: 18, background: "#020617", color: "white", fontWeight: 900, cursor: "pointer", fontSize: 16 },
  connected: { background: "#dcfce7", color: "#166534", padding: 12, borderRadius: 14, fontWeight: 900 },
  quizButton: { display: "block", marginTop: 14, padding: 17, borderRadius: 18, background: "#020617", color: "white", textDecoration: "none", textAlign: "center", fontWeight: 900 },
  courseWrap: { background: "#efe7db", color: "#0f172a", padding: "70px 28px" },
  courseHeader: { maxWidth: 1120, margin: "0 auto 24px", display: "flex", justifyContent: "space-between", gap: 16, alignItems: "center", flexWrap: "wrap" },
  generatedTitle: { fontSize: 34, margin: 0 },
  headerButtons: { display: "flex", gap: 12, flexWrap: "wrap" },
  quizButtonSmall: { background: "#4f46e5", color: "white", padding: "14px 18px", borderRadius: 16, fontWeight: 900, textDecoration: "none" },
  pdfButton: { background: "#22c55e", color: "white", padding: "14px 18px", borderRadius: 16, border: "none", fontWeight: 900, cursor: "pointer" },
  course: { maxWidth: 1120, margin: "0 auto", background: "white", color: "#0f172a", borderRadius: 36, padding: 40, boxShadow: "0 12px 0 rgba(0,0,0,.15), 0 35px 90px rgba(15,23,42,.16)" },
  courseTop: { display: "flex", justifyContent: "space-between", gap: 20, flexWrap: "wrap", borderBottom: "2px solid #e5e7eb", paddingBottom: 24, marginBottom: 28 },
  smallLabel: { color: "#4f46e5", fontWeight: 900, textTransform: "uppercase", letterSpacing: 1 },
  courseTitle: { fontSize: "clamp(38px,6vw,70px)", margin: "8px 0", letterSpacing: -2 },
  level: { fontSize: 22, color: "#475569", fontWeight: 900 },
  scoreBadge: { background: "#eef2ff", color: "#4338ca", padding: "14px 18px", borderRadius: 18, fontWeight: 900, height: "fit-content" },
  section: { marginTop: 26, padding: 26, borderRadius: 26, background: "#f8fafc", border: "1px solid #e2e8f0" },
  sectionTitle: { marginTop: 0, fontSize: 28 },
  text: { whiteSpace: "pre-wrap", lineHeight: 1.78, fontSize: 17 },
  graphBox: { background: "#ffffff", borderRadius: 24, padding: 10, border: "1px solid #e2e8f0" },
  videoGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))", gap: 16 },
  videoCard: { display: "flex", gap: 12, alignItems: "center", padding: 18, borderRadius: 18, background: "#4f46e5", color: "white", fontWeight: 900, textDecoration: "none" },
  videoIcon: { fontSize: 28 },
  badgeGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))", gap: 14 },
  badgeCard: { padding: 18, borderRadius: 18, background: "white", border: "1px solid #e2e8f0", lineHeight: 1.6 },
  progressWrap: { marginTop: 20, height: 18, background: "#e5e7eb", borderRadius: 999, overflow: "hidden" },
  progressBar: { height: "100%", background: "linear-gradient(90deg,#22d3ee,#a855f7)" },
  exerciseGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 16 },
  exerciseCard: { padding: 18, borderRadius: 20, background: "white", border: "1px solid #e2e8f0", boxShadow: "0 8px 20px rgba(15,23,42,.06)" },
  exerciseLevel: { display: "inline-block", padding: "6px 10px", borderRadius: 999, background: "#eef2ff", color: "#4338ca", fontWeight: 900 },
  correctionButton: { marginTop: 10, padding: "10px 14px", borderRadius: 12, border: "none", background: "#111827", color: "white", fontWeight: 900, cursor: "pointer" },
  correctionBox: { marginTop: 12, padding: 14, borderRadius: 14, background: "#f8fafc", border: "1px solid #e2e8f0" },
  quizEndButton: { display: "block", marginTop: 30, padding: 18, borderRadius: 18, background: "#4f46e5", color: "white", fontWeight: 900, textDecoration: "none", textAlign: "center" }
};
