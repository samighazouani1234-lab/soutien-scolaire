"use client";

import { Suspense, useMemo, useState, type CSSProperties } from "react";
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

  const questions = useMemo<Question[]>(() => buildQuestions(matiere, niveau, chapitre), [matiere, niveau, chapitre]);
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
                  ...(answered && selected && !correct ? styles.wrong : {}),
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
          <button style={styles.secondary} onClick={() => setIndex(Math.max(0, index - 1))}>
            Précédent
          </button>

          <button style={styles.primary} onClick={() => setIndex(Math.min(questions.length - 1, index + 1))}>
            Suivant
          </button>
        </div>

        {finished && <div style={styles.result}>Score final : {score}/{questions.length}</div>}
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

function buildQuestions(matiere: string, niveau: string, chapitre: string): Question[] {
  const low = chapitre.toLowerCase();

  if (low.includes("dérivation") || low.includes("derivation")) {
    return [
      {
        question: "Quelle est la dérivée de f(x)=x²+3x ?",
        choices: ["2x+3", "x+3", "2x", "x²+3"],
        answer: 0,
        explanation: "On dérive terme à terme : (x²)'=2x et (3x)'=3.",
        difficulty: "moyen",
      },
      {
        question: "Quel est le coefficient directeur de la tangente à f(x)=x² en x=2 ?",
        choices: ["2", "4", "0", "8"],
        answer: 1,
        explanation: "f'(x)=2x donc f'(2)=4.",
        difficulty: "difficile",
      },
      {
        question: "Si f'(x) est positive sur un intervalle, alors f est :",
        choices: ["croissante", "décroissante", "constante", "négative"],
        answer: 0,
        explanation: "Le signe de la dérivée donne le sens de variation.",
        difficulty: "moyen",
      },
    ];
  }

  return [
    {
      question: `Quelle est la première étape sérieuse dans un exercice sur ${chapitre} ?`,
      choices: ["Identifier les données et la notion du cours", "Deviner", "Sauter la méthode", "Écrire uniquement le résultat"],
      answer: 0,
      explanation: "Il faut relier l’énoncé à une notion du cours.",
      difficulty: "moyen",
    },
    {
      question: `Pourquoi vérifier les conditions d’application d’une propriété en ${matiere} ?`,
      choices: ["Parce qu’elle peut être fausse hors de ses hypothèses", "Pour éviter de calculer", "Parce que c’est facultatif", "Pour raccourcir la réponse"],
      answer: 0,
      explanation: "Une propriété n’est valable que dans son cadre d’application.",
      difficulty: "difficile",
    },
    {
      question: `Quel élément est attendu au niveau ${niveau} ?`,
      choices: ["Une justification claire", "Un résultat sans phrase", "Une réponse au hasard", "Une copie de l’énoncé"],
      answer: 0,
      explanation: "Une réponse doit être justifiée et rédigée.",
      difficulty: "moyen",
    },
  ];
}

const styles: Record<string, CSSProperties> = {
  page: { minHeight: "100vh", background: "#efe7db", padding: 32, fontFamily: "Arial, sans-serif", color: "#0f172a" },
  back: { color: "#3730a3", fontWeight: 900, textDecoration: "none" },
  card: { maxWidth: 900, margin: "40px auto", background: "white", borderRadius: 32, padding: 36, boxShadow: "0 12px 0 rgba(0,0,0,.15)" },
  kicker: { color: "#4f46e5", fontWeight: 900 },
  progress: { height: 14, background: "#e5e7eb", borderRadius: 999, overflow: "hidden" },
  progressBar: { height: "100%", background: "linear-gradient(90deg,#22d3ee,#a855f7)" },
  counter: { textAlign: "right", fontWeight: 900 },
  badge: { display: "inline-block", background: "#eef2ff", color: "#4338ca", padding: "7px 12px", borderRadius: 999, fontWeight: 900 },
  choices: { display: "grid", gap: 14, marginTop: 24 },
  choice: { padding: 18, borderRadius: 18, border: "1px solid #e2e8f0", background: "#f8fafc", textAlign: "left", cursor: "pointer", fontSize: 16 },
  correct: { border: "2px solid #22c55e", background: "#dcfce7" },
  wrong: { border: "2px solid #ef4444", background: "#fee2e2" },
  explanation: { marginTop: 20, padding: 18, borderRadius: 18, background: "#f8fafc" },
  actions: { display: "flex", gap: 12, marginTop: 24 },
  primary: { padding: "14px 18px", borderRadius: 16, border: "none", background: "#4f46e5", color: "white", fontWeight: 900 },
  secondary: { padding: "14px 18px", borderRadius: 16, border: "none", background: "#111827", color: "white", fontWeight: 900 },
  result: { marginTop: 24, padding: 18, borderRadius: 18, background: "#dcfce7", color: "#166534", fontWeight: 900 },
};
