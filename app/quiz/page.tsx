"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

type Question = {
  question: string;
  choices: string[];
  answer: number;
  explanation: string;
  difficulty: string;
};

function QuizContent() {
  const params = useSearchParams();

  const matiere = params.get("matiere") || "Mathématiques";
  const niveau = params.get("niveau") || "Terminale";
  const chapitre = params.get("chapitre") || "Limites";

  const questions = useMemo<Question[]>(
    () => [
      {
        question: `Dans ${chapitre}, quelle attitude est correcte face à une propriété ?`,
        choices: [
          "Vérifier ses conditions avant de l'appliquer",
          "L'appliquer toujours",
          "Ignorer l'énoncé",
          "Répondre sans justification"
        ],
        answer: 0,
        explanation: "Une propriété n'est valable que si ses conditions sont respectées.",
        difficulty: "difficile"
      },
      {
        question: `Quel élément est indispensable dans une réponse de niveau ${niveau} ?`,
        choices: [
          "Une justification claire",
          "Une réponse au hasard",
          "Un résultat sans phrase",
          "Un exemple sans lien"
        ],
        answer: 0,
        explanation: "La rédaction et la justification sont indispensables.",
        difficulty: "moyen"
      },
      {
        question: `Quel est le meilleur moyen de progresser sur ${chapitre} ?`,
        choices: [
          "Corriger ses erreurs après chaque exercice",
          "Lire sans pratiquer",
          "Sauter les corrections",
          "Deviner les réponses"
        ],
        answer: 0,
        explanation: "La progression vient de la pratique et de la correction.",
        difficulty: "moyen"
      }
    ],
    [chapitre, niveau]
  );

  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});

  const current = questions[index];
  const score = questions.reduce((total, q, i) => total + (answers[i] === q.answer ? 1 : 0), 0);
  const finished = Object.keys(answers).length === questions.length;

  function choose(choiceIndex: number) {
    setAnswers((previous) => ({ ...previous, [index]: choiceIndex }));
  }

  return (
    <main style={styles.page}>
      <a href="/" style={styles.back}>← Retour accueil</a>

      <section style={styles.card}>
        <p style={styles.kicker}>{matiere} · {niveau}</p>
        <h1>🧠 Quiz interactif — {chapitre}</h1>

        <div style={styles.progress}>
          <div style={{ ...styles.progressBar, width: `${((index + 1) / questions.length) * 100}%` }} />
        </div>

        <p style={styles.counter}>{index + 1}/{questions.length}</p>

        <h2>{current.question}</h2>
        <p style={styles.badge}>{current.difficulty}</p>

        <div style={styles.choices}>
          {current.choices.map((choice, choiceIndex) => {
            const selected = answers[index] === choiceIndex;
            const answered = answers[index] !== undefined;
            const correct = current.answer === choiceIndex;

            return (
              <button
                key={choice}
                onClick={() => choose(choiceIndex)}
                style={{
                  ...styles.choice,
                  ...(answered && correct ? styles.correct : {}),
                  ...(answered && selected && !correct ? styles.wrong : {})
                }}
              >
                {choice}
              </button>
            );
          })}
        </div>

        {answers[index] !== undefined && (
          <div style={styles.explanation}>
            <b>Correction :</b>
            <p>{current.explanation}</p>
          </div>
        )}

        <div style={styles.actions}>
          <button
            style={styles.secondary}
            onClick={() => setIndex(Math.max(0, index - 1))}
          >
            Précédent
          </button>

          <button
            style={styles.primary}
            onClick={() => setIndex(Math.min(questions.length - 1, index + 1))}
          >
            Suivant
          </button>
        </div>

        {finished && (
          <div style={styles.result}>
            Score final : {score}/{questions.length}
          </div>
        )}
      </section>
    </main>
  );
}

export default function QuizPage() {
  return (
    <Suspense fallback={<main style={styles.page}>Chargement du quiz...</main>}>
      <QuizContent />
    </Suspense>
  );
}

const styles: Record<string, import("react").CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#efe7db",
    padding: 32,
    fontFamily: "Arial, sans-serif",
    color: "#0f172a"
  },
  back: {
    color: "#3730a3",
    fontWeight: 900,
    textDecoration: "none"
  },
  card: {
    maxWidth: 900,
    margin: "40px auto",
    background: "white",
    borderRadius: 32,
    padding: 36,
    boxShadow: "0 12px 0 rgba(0,0,0,.15)"
  },
  kicker: {
    color: "#4f46e5",
    fontWeight: 900
  },
  progress: {
    height: 14,
    background: "#e5e7eb",
    borderRadius: 999,
    overflow: "hidden"
  },
  progressBar: {
    height: "100%",
    background: "linear-gradient(90deg,#22d3ee,#a855f7)"
  },
  counter: {
    textAlign: "right",
    fontWeight: 900
  },
  badge: {
    display: "inline-block",
    background: "#eef2ff",
    color: "#4338ca",
    padding: "7px 12px",
    borderRadius: 999,
    fontWeight: 900
  },
  choices: {
    display: "grid",
    gap: 14,
    marginTop: 24
  },
  choice: {
    padding: 18,
    borderRadius: 18,
    border: "1px solid #e2e8f0",
    background: "#f8fafc",
    textAlign: "left",
    cursor: "pointer",
    fontSize: 16
  },
  correct: {
    border: "2px solid #22c55e",
    background: "#dcfce7"
  },
  wrong: {
    border: "2px solid #ef4444",
    background: "#fee2e2"
  },
  explanation: {
    marginTop: 20,
    padding: 18,
    borderRadius: 18,
    background: "#f8fafc"
  },
  actions: {
    display: "flex",
    gap: 12,
    marginTop: 24
  },
  primary: {
    padding: "14px 18px",
    borderRadius: 16,
    border: "none",
    background: "#4f46e5",
    color: "white",
    fontWeight: 900
  },
  secondary: {
    padding: "14px 18px",
    borderRadius: 16,
    border: "none",
    background: "#111827",
    color: "white",
    fontWeight: 900
  },
  result: {
    marginTop: 24,
    padding: 18,
    borderRadius: 18,
    background: "#dcfce7",
    color: "#166534",
    fontWeight: 900
  }
};
