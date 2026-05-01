"use client";

import { useState } from "react";

export default function QuizPage() {
  const [matiere, setMatiere] = useState("Mathématiques");
  const [niveau, setNiveau] = useState("6e");
  const [chapitre, setChapitre] = useState("Fractions");
  const [mode, setMode] = useState("quiz");

  const [quiz, setQuiz] = useState<any>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(false);

  async function generateQuiz(newMode = mode) {
    setLoading(true);
    setShowResult(false);
    setAnswers([]);
    setQuiz(null);

    const res = await fetch("/api/quiz", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ matiere, niveau, chapitre, mode: newMode }),
    });

    const data = await res.json();
    setQuiz(data);
    setAnswers(Array(data.questions?.length || 0).fill(-1));
    setLoading(false);
  }

  function selectAnswer(qIndex: number, choiceIndex: number) {
    if (showResult) return;

    const copy = [...answers];
    copy[qIndex] = choiceIndex;
    setAnswers(copy);
  }

  function finishQuiz() {
    if (answers.includes(-1)) {
      alert("Réponds à toutes les questions");
      return;
    }
    setShowResult(true);
  }

  const score =
    quiz?.questions?.reduce((total: number, q: any, i: number) => {
      return total + (answers[i] === q.answer ? 1 : 0);
    }, 0) || 0;

  return (
    <main style={styles.page}>
      <section style={styles.card}>
        <h1>🧠 Quiz automatisé EduAI</h1>

        <div style={styles.grid}>
          <input style={styles.input} value={matiere} onChange={(e) => setMatiere(e.target.value)} />
          <input style={styles.input} value={niveau} onChange={(e) => setNiveau(e.target.value)} />
          <input style={styles.input} value={chapitre} onChange={(e) => setChapitre(e.target.value)} />
        </div>

        <div style={styles.actions}>
          <button onClick={() => { setMode("quiz"); generateQuiz("quiz"); }} style={styles.btn}>
            Générer quiz
          </button>

          <button onClick={() => { setMode("evaluation"); generateQuiz("evaluation"); }} style={styles.btnDark}>
            Évaluation finale
          </button>

          <button onClick={() => generateQuiz(mode)} style={styles.btnGreen}>
            Changer les questions
          </button>
        </div>

        {loading && <p>⏳ Génération...</p>}
      </section>

      {quiz?.questions && (
        <section style={styles.quizBox}>
          <h2>{quiz.title}</h2>

          {quiz.questions.map((q: any, i: number) => (
            <div key={i} style={styles.question}>
              <h3>{i + 1}. {q.question}</h3>

              {q.choices.map((choice: string, cIndex: number) => {
                const selected = answers[i] === cIndex;
                const correct = q.answer === cIndex;

                let bg = "white";
                if (showResult && correct) bg = "#dcfce7";
                if (showResult && selected && !correct) bg = "#fee2e2";
                if (!showResult && selected) bg = "#dbeafe";

                return (
                  <button
                    key={cIndex}
                    onClick={() => selectAnswer(i, cIndex)}
                    style={{ ...styles.choice, background: bg }}
                  >
                    {choice}
                  </button>
                );
              })}

              {showResult && (
                <div style={styles.correction}>
                  <strong>Correction :</strong> {q.explanation}
                </div>
              )}
            </div>
          ))}

          {!showResult ? (
            <button onClick={finishQuiz} style={styles.finish}>
              Terminer et voir la note
            </button>
          ) : (
            <div style={styles.score}>
              ✅ Note : {score}/{quiz.questions.length} —{" "}
              {Math.round((score / quiz.questions.length) * 20)}/20
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
    background: "linear-gradient(135deg,#020617,#1e1b4b)",
    color: "white",
    fontFamily: "Arial",
    padding: 30,
  },
  card: {
    maxWidth: 1000,
    margin: "0 auto",
    background: "rgba(255,255,255,0.1)",
    padding: 30,
    borderRadius: 28,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
    gap: 12,
  },
  input: {
    padding: 14,
    borderRadius: 14,
    border: "none",
  },
  actions: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
    marginTop: 18,
  },
  btn: {
    padding: "14px 18px",
    borderRadius: 14,
    border: "none",
    background: "#2563eb",
    color: "white",
    fontWeight: 900,
  },
  btnDark: {
    padding: "14px 18px",
    borderRadius: 14,
    border: "none",
    background: "#7c3aed",
    color: "white",
    fontWeight: 900,
  },
  btnGreen: {
    padding: "14px 18px",
    borderRadius: 14,
    border: "none",
    background: "#22c55e",
    color: "white",
    fontWeight: 900,
  },
  quizBox: {
    maxWidth: 1000,
    margin: "30px auto",
    background: "white",
    color: "#0f172a",
    padding: 30,
    borderRadius: 28,
  },
  question: {
    marginTop: 25,
    paddingTop: 20,
    borderTop: "1px solid #e2e8f0",
  },
  choice: {
    display: "block",
    width: "100%",
    padding: 14,
    marginTop: 10,
    borderRadius: 14,
    border: "1px solid #cbd5e1",
    textAlign: "left",
    cursor: "pointer",
  },
  correction: {
    marginTop: 12,
    padding: 14,
    background: "#f1f5f9",
    borderRadius: 14,
  },
  finish: {
    width: "100%",
    marginTop: 30,
    padding: 16,
    border: "none",
    borderRadius: 16,
    background: "#020617",
    color: "white",
    fontWeight: 900,
  },
  score: {
    marginTop: 30,
    padding: 20,
    background: "#dcfce7",
    color: "#166534",
    borderRadius: 18,
    fontSize: 24,
    fontWeight: 900,
    textAlign: "center",
  },
};
