"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

type Question = {
  question: string;
  choices: string[];
  answer: number;
};

export default function QuizPage() {
  const params = useSearchParams();

  const matiere = params.get("matiere") || "Maths";
  const niveau = params.get("niveau") || "Terminale";
  const chapitre = params.get("chapitre") || "Fonctions";

  const [questions, setQuestions] = useState<Question[]>([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    generateQuiz();
  }, []);

  async function generateQuiz() {
    setLoading(true);
    setFinished(false);
    setScore(0);
    setCurrent(0);

    try {
      const res = await fetch("/api/quiz", {
        method: "POST",
        body: JSON.stringify({ matiere, niveau, chapitre }),
      });

      const data = await res.json();

      if (data.quiz.length > 0) {
        setQuestions(data.quiz);
      }
    } catch {
      console.log("Erreur quiz");
    }

    setLoading(false);
  }

  function handleAnswer(index: number) {
    if (selected !== null) return;

    setSelected(index);

    if (index === questions[current].answer) {
      setScore(score + 1);
    }
  }

  function nextQuestion() {
    setSelected(null);

    if (current + 1 < questions.length) {
      setCurrent(current + 1);
    } else {
      setFinished(true);
    }
  }

  if (loading) {
    return <h2 style={{ padding: 40 }}>⏳ Génération du quiz IA...</h2>;
  }

  if (questions.length === 0) {
    return <h2 style={{ padding: 40 }}>Erreur génération quiz</h2>;
  }

  if (finished) {
    return (
      <div style={styles.container}>
        <h1>🎉 Résultat</h1>
        <h2>
          {score} / {questions.length}
        </h2>

        <button onClick={generateQuiz} style={styles.button}>
          🔁 Nouveau quiz IA
        </button>
      </div>
    );
  }

  const q = questions[current];

  return (
    <div style={styles.container}>
      <h2>
        {matiere} • {niveau}
      </h2>

      <h3>{chapitre}</h3>

      <p>
        Question {current + 1} / {questions.length}
      </p>

      <h1 style={styles.question}>{q.question}</h1>

      <div style={styles.choices}>
        {q.choices.map((choice, i) => {
          let bg = "#eee";

          if (selected !== null) {
            if (i === q.answer) bg = "#22c55e";
            else if (i === selected) bg = "#ef4444";
          }

          return (
            <button
              key={i}
              onClick={() => handleAnswer(i)}
              style={{ ...styles.choice, background: bg }}
            >
              {choice}
            </button>
          );
        })}
      </div>

      {selected !== null && (
        <button onClick={nextQuestion} style={styles.button}>
          ➡️ Suivant
        </button>
      )}
    </div>
  );
}

const styles: any = {
  container: {
    maxWidth: 700,
    margin: "auto",
    padding: 40,
    textAlign: "center",
  },
  question: {
    margin: "20px 0",
  },
  choices: {
    display: "grid",
    gap: 15,
  },
  choice: {
    padding: 15,
    borderRadius: 10,
    border: "none",
    cursor: "pointer",
    fontSize: 16,
  },
  button: {
    marginTop: 20,
    padding: 12,
    borderRadius: 10,
    border: "none",
    background: "#4f46e5",
    color: "white",
    fontWeight: "bold",
  },
};
