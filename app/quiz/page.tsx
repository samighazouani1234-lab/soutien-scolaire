"use client";

import { useEffect, useState } from "react";
import { getSupabaseClient } from "../../lib/supabase";

type Question = {
  question: string;
  choices: string[];
  answer: number;
  explanation: string;
  difficulty?: string;
};

export default function QuizPage() {
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [matiere, setMatiere] = useState("Mathématiques");
  const [niveau, setNiveau] = useState("Terminale");
  const [chapitre, setChapitre] = useState("Limites");
  const [courseText, setCourseText] = useState("");

  const [title, setTitle] = useState("Quiz EduAI");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [finished, setFinished] = useState(false);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(45);

  useEffect(() => {
    const supabase = getSupabaseClient();

    if (!supabase) {
      setAuthLoading(false);
      return;
    }

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setAuthLoading(false);
    });
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const nextMatiere = params.get("matiere") || "Mathématiques";
    const nextNiveau = params.get("niveau") || "Terminale";
    const nextChapitre = params.get("chapitre") || "Limites";

    setMatiere(nextMatiere);
    setNiveau(nextNiveau);
    setChapitre(nextChapitre);

    const saved = localStorage.getItem(
      `eduai-course-${nextMatiere}-${nextNiveau}-${nextChapitre}`
    );

    setCourseText(saved || "");
  }, []);

  useEffect(() => {
    if (!questions.length || selected !== null || finished) return;

    const timer = setInterval(() => {
      setTimeLeft((value) => {
        if (value <= 1) {
          clearInterval(timer);
          validateAnswer(-1);
          return 0;
        }

        return value - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [current, selected, questions.length, finished]);

  async function generateQuiz() {
    if (!user) {
      alert("Connecte-toi pour accéder au quiz.");
      return;
    }

    if (!matiere || !niveau || !chapitre) {
      alert("Matière, niveau et chapitre sont obligatoires.");
      return;
    }

    setLoading(true);
    setQuestions([]);
    setCurrent(0);
    setSelected(null);
    setAnswers([]);
    setFinished(false);
    setTimeLeft(45);

    try {
      const response = await fetch("/api/quiz", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          matiere,
          niveau,
          chapitre,
          courseText,
          count: 10
        })
      });

      const data = await response.json();

      if (data.error) {
        alert(data.error);
        setLoading(false);
        return;
      }

      if (!Array.isArray(data.questions) || data.questions.length === 0) {
        alert("Quiz invalide. Réessaie ou vérifie Together API.");
        setLoading(false);
        return;
      }

      setTitle(data.title || `Quiz - ${chapitre}`);
      setQuestions(data.questions);
      setAnswers(Array(data.questions.length).fill(-2));
    } catch {
      alert("Erreur génération quiz.");
    }

    setLoading(false);
  }

  function validateAnswer(index: number) {
    if (selected !== null) return;

    setSelected(index);

    const copy = [...answers];
    copy[current] = index;
    setAnswers(copy);
  }

  function nextQuestion() {
    if (current + 1 >= questions.length) {
      setFinished(true);
      return;
    }

    setCurrent(current + 1);
    setSelected(null);
    setTimeLeft(45);
  }

  const score = questions.reduce((total, question, index) => {
    return total + (answers[index] === question.answer ? 1 : 0);
  }, 0);

  const note = questions.length ? Math.round((score / questions.length) * 20) : 0;
  const question = questions[current];
  const progress = questions.length ? ((current + 1) / questions.length) * 100 : 0;

  if (authLoading) {
    return (
      <main style={styles.page}>
        <section style={styles.card}>
          <h1>Chargement...</h1>
        </section>
      </main>
    );
  }

  if (!user) {
    return (
      <main style={styles.page}>
        <section style={styles.finalCard}>
          <h1>🔐 Connexion obligatoire</h1>
          <p>Connecte-toi depuis l’accueil pour lancer les quiz.</p>
          <a href="/" style={styles.homeButton}>Retour accueil</a>
        </section>
      </main>
    );
  }

  if (finished) {
    return (
      <main style={styles.page}>
        <section style={styles.finalCard}>
          <div style={styles.trophy}>🏆</div>
          <h1>Résultat final</h1>

          <div style={styles.bigScore}>{note}/20</div>

          <p style={styles.finalText}>
            Score : {score}/{questions.length}
          </p>

          <div style={styles.badge}>
            {note >= 16
              ? "Excellent travail 🔥"
              : note >= 12
              ? "Bon travail 👍"
              : note >= 8
              ? "À renforcer 💪"
              : "À retravailler 📚"}
          </div>

          <button onClick={generateQuiz} style={styles.primaryButton}>
            🔁 Changer les questions
          </button>

          <a href="/" style={styles.homeButton}>Retour au cours</a>
        </section>
      </main>
    );
  }

  return (
    <main style={styles.page}>
      <a href="/" style={styles.back}>← Retour accueil</a>

      <section style={styles.hero}>
        <div>
          <span style={styles.pill}>Quiz premium</span>
          <h1 style={styles.title}>🧠 Quiz interactif</h1>
          <p style={styles.subtitle}>
            Une question à la fois, réponses cliquables, correction instantanée,
            timer et note finale.
          </p>
        </div>

        <div style={styles.form}>
          <input
            style={styles.input}
            value={matiere}
            onChange={(event) => setMatiere(event.target.value)}
            placeholder="Matière"
          />

          <input
            style={styles.input}
            value={niveau}
            onChange={(event) => setNiveau(event.target.value)}
            placeholder="Niveau"
          />

          <input
            style={styles.input}
            value={chapitre}
            onChange={(event) => setChapitre(event.target.value)}
            placeholder="Chapitre"
          />

          <button onClick={generateQuiz} style={styles.primaryButton}>
            {loading ? "Génération..." : "✨ Générer le quiz"}
          </button>
        </div>

        {!courseText && (
          <div style={styles.warning}>
            ⚠️ Aucun cours généré trouvé en mémoire pour ce chapitre. Le quiz sera basé sur la matière, le niveau et le chapitre.
          </div>
        )}
      </section>

      {question && (
        <section style={styles.quizCard}>
          <div style={styles.quizTop}>
            <div>
              <h2 style={styles.quizTitle}>{title}</h2>
              <p style={styles.meta}>{matiere} · {niveau} · {chapitre}</p>
            </div>

            <div style={styles.counter}>
              {current + 1}/{questions.length}
            </div>
          </div>

          <div style={styles.progressTrack}>
            <div style={{ ...styles.progressFill, width: `${progress}%` }} />
          </div>

          <div style={styles.infoRow}>
            <span style={styles.difficulty}>
              {question.difficulty || "progressif"}
            </span>
            <span style={styles.timer}>⏱️ {timeLeft}s</span>
          </div>

          <h2 style={styles.question}>{question.question}</h2>

          <div style={styles.choices}>
            {question.choices.map((choice, index) => {
              const isCorrect = index === question.answer;
              const isSelected = selected === index;

              let style = styles.choice;

              if (selected !== null && isCorrect) {
                style = { ...styles.choice, ...styles.correct };
              }

              if (selected !== null && isSelected && !isCorrect) {
                style = { ...styles.choice, ...styles.wrong };
              }

              return (
                <button
                  key={index}
                  onClick={() => validateAnswer(index)}
                  style={style}
                >
                  <span style={styles.choiceLetter}>
                    {String.fromCharCode(65 + index)}
                  </span>
                  {choice}
                </button>
              );
            })}
          </div>

          {selected !== null && (
            <div style={styles.correction}>
              <h3>
                {selected === question.answer
                  ? "✅ Bonne réponse"
                  : selected === -1
                  ? "⏱️ Temps écoulé"
                  : "❌ Mauvaise réponse"}
              </h3>

              <p>{question.explanation}</p>

              <button onClick={nextQuestion} style={styles.nextButton}>
                {current + 1 === questions.length
                  ? "Voir la note finale"
                  : "Question suivante →"}
              </button>
            </div>
          )}
        </section>
      )}
    </main>
  );
}

const styles: any = {
  page: {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at top left,#6366f133,transparent 32%), radial-gradient(circle at top right,#ec489933,transparent 28%), #e8dfd2",
    color: "#111827",
    fontFamily: "Arial, sans-serif",
    padding: 28
  },
  back: {
    display: "inline-block",
    marginBottom: 22,
    color: "#4338ca",
    fontWeight: 900,
    textDecoration: "none"
  },
  hero: {
    maxWidth: 1080,
    margin: "0 auto",
    background: "rgba(255,255,255,0.94)",
    border: "1px solid rgba(255,255,255,0.7)",
    borderRadius: 34,
    padding: 34,
    boxShadow: "0 12px 0 rgba(0,0,0,0.14), 0 35px 90px rgba(15,23,42,0.18)"
  },
  pill: {
    display: "inline-block",
    background: "#eef2ff",
    color: "#4338ca",
    padding: "9px 14px",
    borderRadius: 999,
    fontWeight: 900
  },
  title: {
    fontSize: "clamp(42px,7vw,70px)",
    margin: "18px 0 8px",
    letterSpacing: -2
  },
  subtitle: {
    fontSize: 19,
    color: "#475569",
    lineHeight: 1.6,
    maxWidth: 720
  },
  form: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))",
    gap: 14,
    marginTop: 24
  },
  input: {
    padding: 16,
    borderRadius: 18,
    border: "1px solid #cbd5e1",
    fontSize: 16
  },
  primaryButton: {
    padding: "16px 22px",
    borderRadius: 18,
    border: "none",
    background: "linear-gradient(90deg,#4f46e5,#a855f7)",
    color: "white",
    fontWeight: 900,
    cursor: "pointer",
    fontSize: 16
  },
  warning: {
    marginTop: 18,
    background: "#fff7ed",
    color: "#9a3412",
    padding: 14,
    borderRadius: 16,
    fontWeight: 800
  },
  card: {
    maxWidth: 800,
    margin: "90px auto",
    background: "white",
    padding: 34,
    borderRadius: 30
  },
  quizCard: {
    maxWidth: 940,
    margin: "34px auto",
    background: "white",
    padding: 34,
    borderRadius: 34,
    boxShadow: "0 12px 0 rgba(0,0,0,0.16), 0 35px 90px rgba(15,23,42,0.16)"
  },
  quizTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: 18,
    alignItems: "center"
  },
  quizTitle: {
    margin: 0,
    fontSize: 26
  },
  meta: {
    color: "#64748b",
    marginBottom: 0,
    fontSize: 16
  },
  counter: {
    fontSize: 28,
    fontWeight: 900,
    color: "#111827"
  },
  progressTrack: {
    height: 12,
    background: "#e5e7eb",
    borderRadius: 999,
    overflow: "hidden",
    margin: "24px 0"
  },
  progressFill: {
    height: "100%",
    background: "linear-gradient(90deg,#8b5cf6,#ec4899)",
    borderRadius: 999
  },
  infoRow: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 22
  },
  difficulty: {
    background: "#eef2ff",
    color: "#4338ca",
    padding: "9px 14px",
    borderRadius: 999,
    fontWeight: 900
  },
  timer: {
    background: "#fff7ed",
    color: "#c2410c",
    padding: "9px 14px",
    borderRadius: 999,
    fontWeight: 900
  },
  question: {
    textAlign: "center",
    fontSize: "clamp(24px,4vw,36px)",
    lineHeight: 1.25,
    margin: "34px 0",
    fontWeight: 900
  },
  choices: {
    display: "grid",
    gap: 18
  },
  choice: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    padding: "20px 22px",
    borderRadius: 20,
    fontSize: 18,
    textAlign: "left",
    cursor: "pointer",
    boxShadow: "0 10px 24px rgba(15,23,42,0.08)"
  },
  choiceLetter: {
    width: 34,
    height: 34,
    minWidth: 34,
    borderRadius: "50%",
    background: "#eef2ff",
    color: "#4338ca",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 900
  },
  correct: {
    background: "#dcfce7",
    border: "2px solid #22c55e"
  },
  wrong: {
    background: "#fee2e2",
    border: "2px solid #ef4444"
  },
  correction: {
    marginTop: 26,
    padding: 24,
    background: "#f8fafc",
    borderRadius: 22,
    lineHeight: 1.65,
    border: "1px solid #e2e8f0"
  },
  nextButton: {
    marginTop: 14,
    padding: "15px 20px",
    borderRadius: 16,
    border: "none",
    background: "#111827",
    color: "white",
    fontWeight: 900,
    cursor: "pointer"
  },
  finalCard: {
    maxWidth: 680,
    margin: "80px auto",
    background: "white",
    borderRadius: 34,
    padding: 42,
    textAlign: "center",
    boxShadow: "0 12px 0 rgba(0,0,0,0.16), 0 35px 90px rgba(15,23,42,0.16)"
  },
  trophy: {
    fontSize: 60
  },
  bigScore: {
    fontSize: 92,
    fontWeight: 900,
    color: "#4f46e5"
  },
  finalText: {
    fontSize: 22,
    fontWeight: 800
  },
  badge: {
    background: "#eef2ff",
    color: "#4338ca",
    padding: 16,
    borderRadius: 18,
    fontWeight: 900,
    marginTop: 18
  },
  homeButton: {
    display: "block",
    marginTop: 18,
    color: "#4f46e5",
    fontWeight: 900,
    textDecoration: "none"
  }
};
