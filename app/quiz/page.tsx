"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

type Question = {
  question: string;
  choices: string[];
  answer: number;
  explanation: string;
  difficulty: string;
};

export default function QuizPage() {
  return (
    <Suspense fallback={<main style={styles.page}>Chargement...</main>}>
      <QuizContent />
    </Suspense>
  );
}

function QuizContent() {
  const params = useSearchParams();

  const [matiere, setMatiere] = useState("Mathématiques");
  const [niveau, setNiveau] = useState("Terminale");
  const [chapitre, setChapitre] = useState("Limites");

  const [title, setTitle] = useState("Quiz EduAI");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [finished, setFinished] = useState(false);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);

  useEffect(() => {
    setMatiere(params.get("matiere") || "Mathématiques");
    setNiveau(params.get("niveau") || "Terminale");
    setChapitre(params.get("chapitre") || "Limites");
  }, [params]);

  useEffect(() => {
    if (!questions.length || selected !== null || finished) return;

    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timer);
          validateAnswer(-1);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [current, selected, questions.length, finished]);

  async function generateQuiz() {
    setLoading(true);
    setQuestions([]);
    setCurrent(0);
    setSelected(null);
    setAnswers([]);
    setFinished(false);
    setTimeLeft(30);

    try {
      const res = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matiere, niveau, chapitre, count: 10 }),
      });

      const data = await res.json();

      if (data.error) {
        alert(data.error);
        setLoading(false);
        return;
      }

      setTitle(data.title || "Quiz EduAI");
      setQuestions(data.questions || []);
      setAnswers(Array(data.questions?.length || 0).fill(-2));
    } catch {
      alert("Erreur génération quiz");
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
    setTimeLeft(30);
  }

  const score = questions.reduce((total, q, index) => {
    return total + (answers[index] === q.answer ? 1 : 0);
  }, 0);

  const note = questions.length ? Math.round((score / questions.length) * 20) : 0;
  const question = questions[current];

  if (finished) {
    return (
      <main style={styles.page}>
        <section style={styles.finalCard}>
          <h1>🏆 Résultat final</h1>
          <div style={styles.bigScore}>{note}/20</div>
          <p style={styles.finalText}>Score : {score}/{questions.length}</p>

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

          <a href="/" style={styles.homeButton}>
            Retour au cours
          </a>
        </section>
      </main>
    );
  }

  return (
    <main style={styles.page}>
      <a href="/" style={styles.back}>← Retour accueil</a>

      <section style={styles.top}>
        <h1 style={styles.title}>🧠 Quiz Pro EduAI</h1>
        <p style={styles.subtitle}>
          Une question à la fois, correction automatique, timer et note finale.
        </p>

        <div style={styles.form}>
          <input style={styles.input} value={matiere} onChange={(e) => setMatiere(e.target.value)} />
          <input style={styles.input} value={niveau} onChange={(e) => setNiveau(e.target.value)} />
          <input style={styles.input} value={chapitre} onChange={(e) => setChapitre(e.target.value)} />
        </div>

        <button onClick={generateQuiz} style={styles.primaryButton}>
          {loading ? "Génération..." : "✨ Générer un quiz IA"}
        </button>
      </section>

      {question && (
        <section style={styles.quizCard}>
          <div style={styles.quizHeader}>
            <div>
              <strong>{title}</strong>
              <p style={styles.meta}>{matiere} · {niveau} · {chapitre}</p>
            </div>

            <div style={styles.counter}>{current + 1}/{questions.length}</div>
          </div>

          <div style={styles.progress}>
            <div
              style={{
                ...styles.progressFill,
                width: `${((current + 1) / questions.length) * 100}%`,
              }}
            />
          </div>

          <div style={styles.infoRow}>
            <span style={styles.difficulty}>{question.difficulty || "progressif"}</span>
            <span style={styles.timer}>⏱️ {timeLeft}s</span>
          </div>

          <h2 style={styles.question}>{question.question}</h2>

          <div style={styles.choices}>
            {question.choices.map((choice, index) => {
              const correct = index === question.answer;
              const selectedChoice = selected === index;

              let style = styles.choice;

              if (selected !== null && correct) {
                style = { ...styles.choice, ...styles.correct };
              }

              if (selected !== null && selectedChoice && !correct) {
                style = { ...styles.choice, ...styles.wrong };
              }

              return (
                <button key={index} onClick={() => validateAnswer(index)} style={style}>
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
                {current + 1 === questions.length ? "Voir la note finale" : "Question suivante →"}
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
    background: "#e8dfd2",
    color: "#111827",
    fontFamily: "Arial, sans-serif",
    padding: 30,
  },
  back: {
    color: "#4338ca",
    fontWeight: 900,
    textDecoration: "none",
  },
  top: {
    maxWidth: 1000,
    margin: "25px auto",
    background: "white",
    padding: 30,
    borderRadius: 30,
    boxShadow: "0 10px 0 rgba(0,0,0,0.16)",
  },
  title: {
    fontSize: 42,
    margin: 0,
  },
  subtitle: {
    color: "#475569",
    fontSize: 18,
  },
  form: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
    gap: 12,
    marginTop: 20,
    marginBottom: 18,
  },
  input: {
    padding: 15,
    borderRadius: 16,
    border: "1px solid #d1d5db",
    fontSize: 16,
  },
  primaryButton: {
    padding: "15px 20px",
    borderRadius: 16,
    border: "none",
    background: "#4f46e5",
    color: "white",
    fontWeight: 900,
    cursor: "pointer",
    fontSize: 16,
    marginTop: 12,
  },
  quizCard: {
    maxWidth: 900,
    margin: "35px auto",
    background: "white",
    padding: 34,
    borderRadius: 34,
    boxShadow: "0 10px 0 rgba(0,0,0,0.18)",
  },
  quizHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: 20,
    alignItems: "center",
  },
  meta: {
    color: "#64748b",
    marginBottom: 0,
  },
  counter: {
    fontSize: 24,
    fontWeight: 900,
  },
  progress: {
    height: 10,
    background: "#d1d5db",
    borderRadius: 999,
    margin: "22px 0",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    background: "linear-gradient(90deg,#8b5cf6,#ec4899)",
  },
  infoRow: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 22,
  },
  difficulty: {
    background: "#eef2ff",
    color: "#4338ca",
    padding: "8px 12px",
    borderRadius: 999,
    fontWeight: 900,
  },
  timer: {
    background: "#fff7ed",
    color: "#c2410c",
    padding: "8px 12px",
    borderRadius: 999,
    fontWeight: 900,
  },
  question: {
    textAlign: "center",
    fontSize: 28,
    fontWeight: 600,
    marginBottom: 30,
  },
  choices: {
    display: "grid",
    gap: 18,
  },
  choice: {
    background: "white",
    border: "1px solid #e5e7eb",
    padding: "20px 24px",
    borderRadius: 18,
    fontSize: 19,
    textAlign: "left",
    cursor: "pointer",
    boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
  },
  correct: {
    background: "#dcfce7",
    border: "2px solid #22c55e",
  },
  wrong: {
    background: "#fee2e2",
    border: "2px solid #ef4444",
  },
  correction: {
    marginTop: 26,
    padding: 22,
    background: "#f8fafc",
    borderRadius: 20,
    lineHeight: 1.6,
  },
  nextButton: {
    marginTop: 14,
    padding: "14px 18px",
    borderRadius: 14,
    border: "none",
    background: "#111827",
    color: "white",
    fontWeight: 900,
    cursor: "pointer",
  },
  finalCard: {
    maxWidth: 650,
    margin: "80px auto",
    background: "white",
    borderRadius: 34,
    padding: 40,
    textAlign: "center",
    boxShadow: "0 10px 0 rgba(0,0,0,0.18)",
  },
  bigScore: {
    fontSize: 88,
    fontWeight: 900,
    color: "#4f46e5",
  },
  finalText: {
    fontSize: 22,
    fontWeight: 800,
  },
  badge: {
    background: "#eef2ff",
    color: "#4338ca",
    padding: 16,
    borderRadius: 18,
    fontWeight: 900,
    marginTop: 18,
  },
  homeButton: {
    display: "block",
    marginTop: 18,
    color: "#4f46e5",
    fontWeight: 900,
    textDecoration: "none",
  },
};
