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

    try {
      const res = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          matiere,
          niveau,
          chapitre,
          mode: newMode,
        }),
      });

      const data = await res.json();

      if (data.error) {
        alert(data.error);
        setLoading(false);
        return;
      }

      setQuiz(data);
      setAnswers(Array(data.questions?.length || 0).fill(-1));
    } catch {
      alert("Erreur génération quiz");
    }

    setLoading(false);
  }

  function selectAnswer(questionIndex: number, choiceIndex: number) {
    if (showResult) return;

    const copy = [...answers];
    copy[questionIndex] = choiceIndex;
    setAnswers(copy);
  }

  function finishQuiz() {
    if (!quiz?.questions) return;

    if (answers.includes(-1)) {
      alert("Réponds à toutes les questions");
      return;
    }

    setShowResult(true);
  }

  const score =
    quiz?.questions?.reduce((total: number, q: any, index: number) => {
      return total + (answers[index] === q.answer ? 1 : 0);
    }, 0) || 0;

  const note =
    quiz?.questions?.length > 0
      ? Math.round((score / quiz.questions.length) * 20)
      : 0;

  return (
    <main style={styles.page}>
      <section style={styles.header}>
        <a href="/" style={styles.back}>← Retour accueil</a>

        <h1 style={styles.title}>🧠 Quiz automatisé EduAI</h1>
        <p style={styles.subtitle}>
          Réponds aux questions, termine le quiz, puis découvre ta note et les corrections.
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
        </div>

        <div style={styles.actions}>
          <button
            onClick={() => {
              setMode("quiz");
              generateQuiz("quiz");
            }}
            style={styles.primaryButton}
          >
            Générer quiz
          </button>

          <button
            onClick={() => {
              setMode("evaluation");
              generateQuiz("evaluation");
            }}
            style={styles.purpleButton}
          >
            Évaluation finale
          </button>

          <button onClick={() => generateQuiz(mode)} style={styles.greenButton}>
            Changer les questions
          </button>
        </div>

        {loading && <p style={styles.loading}>⏳ Génération en cours...</p>}
      </section>

      {quiz?.questions && (
        <section style={styles.quizBox}>
          <h2 style={styles.quizTitle}>{quiz.title || "Quiz EduAI"}</h2>

          {quiz.questions.map((q: any, questionIndex: number) => (
            <div key={questionIndex} style={styles.questionBox}>
              <h3 style={styles.questionTitle}>
                {questionIndex + 1}. {q.question}
              </h3>

              {(q.choices || []).map((choice: string, choiceIndex: number) => {
                const selected = answers[questionIndex] === choiceIndex;
                const correct = q.answer === choiceIndex;

                let background = "white";
                let border = "1px solid #cbd5e1";

                if (!showResult && selected) {
                  background = "#dbeafe";
                  border = "2px solid #2563eb";
                }

                if (showResult && correct) {
                  background = "#dcfce7";
                  border = "2px solid #22c55e";
                }

                if (showResult && selected && !correct) {
                  background = "#fee2e2";
                  border = "2px solid #ef4444";
                }

                return (
                  <button
                    key={choiceIndex}
                    onClick={() => selectAnswer(questionIndex, choiceIndex)}
                    style={{
                      ...styles.choiceButton,
                      background,
                      border,
                    }}
                  >
                    {choice}
                  </button>
                );
              })}

              {showResult && (
                <div style={styles.correction}>
                  <strong>Correction :</strong>{" "}
                  {q.explanation || "Correction non fournie."}
                </div>
              )}
            </div>
          ))}

          {!showResult ? (
            <button onClick={finishQuiz} style={styles.finishButton}>
              Terminer et voir la note
            </button>
          ) : (
            <div style={styles.scoreBox}>
              ✅ Score : {score}/{quiz.questions.length} — Note : {note}/20
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
      "radial-gradient(circle at top left,#22d3ee55,transparent 30%), radial-gradient(circle at top right,#a855f755,transparent 30%), linear-gradient(135deg,#020617,#0f172a)",
    color: "white",
    fontFamily: "Arial, sans-serif",
    padding: 30,
  },

  header: {
    maxWidth: 1050,
    margin: "0 auto",
    background: "rgba(255,255,255,0.1)",
    border: "1px solid rgba(255,255,255,0.15)",
    borderRadius: 30,
    padding: 30,
    boxShadow: "0 30px 80px rgba(0,0,0,0.35)",
  },

  back: {
    color: "#a5f3fc",
    textDecoration: "none",
    fontWeight: 900,
  },

  title: {
    fontSize: "clamp(38px,6vw,64px)",
    marginBottom: 12,
  },

  subtitle: {
    color: "#cbd5e1",
    fontSize: 18,
    lineHeight: 1.6,
  },

  form: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
    gap: 14,
    marginTop: 24,
  },

  input: {
    padding: 15,
    borderRadius: 16,
    border: "none",
    fontSize: 16,
  },

  actions: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
    marginTop: 20,
  },

  primaryButton: {
    padding: "14px 18px",
    borderRadius: 16,
    border: "none",
    background: "#2563eb",
    color: "white",
    fontWeight: 900,
    cursor: "pointer",
  },

  purpleButton: {
    padding: "14px 18px",
    borderRadius: 16,
    border: "none",
    background: "#7c3aed",
    color: "white",
    fontWeight: 900,
    cursor: "pointer",
  },

  greenButton: {
    padding: "14px 18px",
    borderRadius: 16,
    border: "none",
    background: "#22c55e",
    color: "white",
    fontWeight: 900,
    cursor: "pointer",
  },

  loading: {
    marginTop: 18,
    fontWeight: 900,
  },

  quizBox: {
    maxWidth: 1050,
    margin: "30px auto",
    background: "white",
    color: "#0f172a",
    borderRadius: 30,
    padding: 30,
    boxShadow: "0 30px 90px rgba(0,0,0,0.35)",
  },

  quizTitle: {
    fontSize: 32,
    marginTop: 0,
  },

  questionBox: {
    marginTop: 26,
    paddingTop: 22,
    borderTop: "1px solid #e2e8f0",
  },

  questionTitle: {
    fontSize: 20,
  },

  choiceButton: {
    display: "block",
    width: "100%",
    padding: 15,
    marginTop: 10,
    borderRadius: 16,
    textAlign: "left",
    cursor: "pointer",
    fontSize: 16,
  },

  correction: {
    marginTop: 14,
    padding: 16,
    background: "#f1f5f9",
    borderRadius: 16,
    lineHeight: 1.6,
  },

  finishButton: {
    width: "100%",
    marginTop: 30,
    padding: 18,
    border: "none",
    borderRadius: 18,
    background: "#020617",
    color: "white",
    fontWeight: 900,
    cursor: "pointer",
    fontSize: 16,
  },

  scoreBox: {
    marginTop: 30,
    padding: 22,
    background: "#dcfce7",
    color: "#166534",
    borderRadius: 20,
    textAlign: "center",
    fontSize: 24,
    fontWeight: 900,
  },
};
