'use client';

import { useState } from 'react';

export default function QuizPage() {
  const [quiz, setQuiz] = useState<any[]>([]);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(false);

  const loadQuiz = async () => {
    setLoading(true);

    try {
      const res = await fetch('/api/quiz', {
        method: 'POST',
        body: JSON.stringify({
          chapitre: 'Limites',
        }),
      });

      const data = await res.json();
      const parsed = JSON.parse(data.quiz);

      setQuiz(parsed);
      setIndex(0);
      setScore(0);
    } catch {
      alert("Erreur génération quiz");
    }

    setLoading(false);
  };

  const answer = (opt: string) => {
    if (opt === quiz[index].answer) {
      setScore(score + 1);
    }
    setIndex(index + 1);
  };

  if (loading) return <p>Chargement...</p>;

  if (quiz.length === 0) {
    return (
      <div style={{ padding: 40 }}>
        <h1>Quiz</h1>
        <button onClick={loadQuiz}>
          Générer quiz
        </button>
      </div>
    );
  }

  if (index >= quiz.length) {
    return (
      <div style={{ padding: 40 }}>
        <h2>Score : {score} / {quiz.length}</h2>
        <button onClick={loadQuiz}>Rejouer</button>
      </div>
    );
  }

  const q = quiz[index];

  return (
    <div style={{ padding: 40 }}>
      <h2>{q.question}</h2>

      {q.options.map((o: string, i: number) => (
        <button
          key={i}
          onClick={() => answer(o)}
          style={{
            display: 'block',
            margin: '10px 0',
            padding: '10px',
          }}
        >
          {o}
        </button>
      ))}
    </div>
  );
}
