"use client";

import { useState } from "react";

export default function QuizPage() {
  const [matiere, setMatiere] = useState("Mathématiques");
  const [niveau, setNiveau] = useState("Terminale");
  const [chapitre, setChapitre] = useState("Limites");

  const [quiz, setQuiz] = useState<any>(null);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showCorrection, setShowCorrection] = useState(false);
  const [loading, setLoading] = useState(false);
  const [finished, setFinished] = useState(false);

  async function generateQuiz() {
    setLoading(true);
    setQuiz(null);
    setCurrent(0);
    setSelected(null);
    setAnswers([]);
    setShowCorrection(false);
    setFinished(false);

    const res = await fetch("/api/quiz", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ matiere, niveau, chapitre, mode: "quiz" }),
    });

    const data = await res.json();
    setQuiz(data);
    setLoading(false);
  }

  function validateAnswer(index: number) {
    if (showCorrection) return;

    setSelected(index);
    setShowCorrection(true);

    const copy = [...answers];
    copy[current] = index;
    setAnswers(copy);
  }

  function nextQuestion() {
    if (!quiz?.questions) return;

    if (current + 1 >= quiz.questions.length) {
      setFinished(true);
      return;
    }

    setCurrent(current + 1);
    setSelected(null);
    setShowCorrection(false);
  }

  function changeQuestions() {
    generateQuiz();
  }

  const questions = quiz?.questions || [];
  const question = questions[current];

  const score = questions.reduce((total: number, q: any, i: number) => {
    return total + (answers[i] === q.answer ? 1 : 0);
  }, 0);

  const note = questions.length
    ? Math.round((score / questions.length) * 20)
    : 0;

  return (
    <main style={styles.page}>
      <a href="/" style={styles.back}>← Retour accueil</a>

      <section style={styles.top}>
        <h1 style={styles.title}>🧠 Quiz automatique</h1>
        <p style={styles.subtitle}>
          Questions générées par l’IA, correction automatique et note finale.
        </p>

        <div style={styles.form}>
          <input
            style={styles.input}
            value={matiere}
            onChange={(e) => setMatiere(e.target.value)}
            placeholder="Matière"
          />

          <input
            style={styles.input}
            value={niveau}
            onChange={(e) => setNiveau(e.target.value)}
            placeholder="Niveau"
          />

          <input
            style={styles.input}
            value={chapitre}
            onChange={(e) => setChapitre(e.target.value)}
            placeholder="Chapitre"
          />

          <button onClick={generateQuiz} style={styles.generate}>
            {loading ? "Génération..." : "Générer le quiz"}
          </button>
        </div>
      </section>

      {question && !finished && (
        <section style={styles.quizCard}>
          <div style={styles.quizHeader}>
            <div style={styles.chapter}>📐 {chapitre.toUpperCase()}</div>
            <div style={styles.counter}>
              {current + 1}/{questions.length}
            </div>
          </div>

          <div style={styles.progress}>
            <div
              style={{
                ...styles.progressFill,
                width: `${((current + 1) / questions.length) * 100}%`,
              }}
            />
          </div>

          <h2 style={styles.question}>{question.question}</h2>

          <div style={styles.choices}>
            {question.choices.map((choice: string, index: number) => {
              const isSelected = selected === index;
              const isCorrect = question.answer === index;

              let style = styles.choice;

              if (showCorrection && isCorrect) {
                style = { ...styles.choice, ...styles.correct };
              }

              if (showCorrection && isSelected && !isCorrect) {
                style = { ...styles.choice, ...styles.wrong };
              }

              if (!showCorrection && isSelected) {
                style = { ...styles.choice, ...styles.selected };
              }

              return (
                <button
                  key={index}
                  onClick={() => validateAnswer(index)}
                  style={style}
                >
                  {choice}
                </button>
              );
            })}
          </div>

          {showCorrection && (
            <div style={styles.correction}>
              <strong>
                {selected === question.answer ? "✅ Bonne réponse" : "❌ Mauvaise réponse"}
              </strong>
              <p>{question.explanation}</p>

              <button onClick={nextQuestion} style={styles.next}>
                {current + 1 === questions.length
                  ? "Voir la note finale"
                  : "Question suivante →"}
              </button>
            </div>
          )}
        </section>
      )}

      {finished && (
        <section style={styles.finalCard}>
          <h2>🏆 Résultat final</h2>

          <div style={styles.bigScore}>{note}/20</div>

          <p>
            Score : {score}/{questions.length}
          </p>

          <button onClick={changeQuestions} style={styles.generate}>
            Changer les questions
          </button>
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
    display: "inline-block",
    marginBottom: 20,
    color: "#4338ca",
    fontWeight: 900,
    textDecoration: "none",
  },

  top: {
    maxWidth: 1000,
    margin: "0 auto 28px",
    background: "white",
    borderRadius: 28,
    padding: 28,
    boxShadow: "0 10px 0 rgba(0,0,0,0.15)",
  },

  title: {
    fontSize: 42,
    margin: 0,
  },

  subtitle: {
    fontSize: 18,
    color: "#475569",
  },

  form: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
    gap: 12,
    marginTop: 20,
  },

  input: {
    padding: 15,
    borderRadius: 14,
    border: "1px solid #d1d5db",
    fontSize: 16,
  },

  generate: {
    padding: 15,
    borderRadius: 14,
    border: "none",
    background: "#4f46e5",
    color: "white",
    fontWeight: 900,
    cursor: "pointer",
    fontSize: 16,
  },

  quizCard: {
    maxWidth: 900,
    margin: "0 auto",
    background: "white",
    borderRadius: 34,
    padding: 34,
    boxShadow: "0 10px 0 rgba(0,0,0,0.18)",
  },

  quizHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontWeight: 900,
    marginBottom: 18,
  },

  chapter: {
    fontSize: 18,
  },

  counter: {
    fontSize: 22,
  },

  progress: {
    height: 10,
    background: "#d1d5db",
    borderRadius: 999,
    overflow: "hidden",
    marginBottom: 35,
  },

  progressFill: {
    height: "100%",
    background: "linear-gradient(90deg,#8b5cf6,#ec4899)",
    borderRadius: 999,
  },

  question: {
    textAlign: "center",
    fontSize: 28,
    fontWeight: 500,
    marginBottom: 35,
  },

  choices: {
    display: "grid",
    gap: 22,
  },

  choice: {
    background: "white",
    border: "1px solid #e5e7eb",
    padding: "22px 28px",
    borderRadius: 18,
    fontSize: 20,
    textAlign: "left",
    cursor: "pointer",
    boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
  },

  selected: {
    background: "#dbeafe",
    border: "2px solid #2563eb",
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
    marginTop: 28,
    background: "#f8fafc",
    borderRadius: 20,
    padding: 22,
    lineHeight: 1.6,
  },

  next: {
    marginTop: 16,
    padding: "14px 20px",
    borderRadius: 14,
    border: "none",
    background: "#111827",
    color: "white",
    fontWeight: 900,
    cursor: "pointer",
  },

  finalCard: {
    maxWidth: 650,
    margin: "40px auto",
    background: "white",
    borderRadius: 34,
    padding: 40,
    textAlign: "center",
    boxShadow: "0 10px 0 rgba(0,0,0,0.18)",
  },

  bigScore: {
    fontSize: 80,
    fontWeight: 900,
    color: "#4f46e5",
  },
};
