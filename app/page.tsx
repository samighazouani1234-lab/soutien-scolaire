"use client";

import { useMemo, useState } from "react";
import { data } from "../data/courses";

export default function Home() {
  const [matiere, setMatiere] = useState("");
  const [niveau, setNiveau] = useState("");
  const [chapitre, setChapitre] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const niveaux = useMemo(() => {
    if (!matiere) return [];
    return Object.values(data[matiere]).flatMap((cat: any) =>
      Object.keys(cat)
    );
  }, [matiere]);

  const chapitres = useMemo(() => {
    if (!matiere || !niveau) return [];
    const categories = data[matiere];
    let list: string[] = [];
    for (const cat in categories) {
      if (categories[cat][niveau]) list = categories[cat][niveau];
    }
    return list;
  }, [matiere, niveau]);

  async function generate() {
    if (!matiere || !niveau || !chapitre) {
      alert("Choisis matière, niveau et chapitre");
      return;
    }
    setLoading(true);
    setAnswer("");

    const question = `
Cours complet de ${matiere}, niveau ${niveau}, chapitre ${chapitre}.
Donne :
1. Cours détaillé (clair)
2. Définitions
3. Exemples corrigés
4. Exercices progressifs
5. Corrections détaillées
6. Évaluation finale + barème /10
`;

    const res = await fetch("/api/ia", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question }),
    });

    const dataRes = await res.json();
    setAnswer(dataRes.answer || "Erreur IA");
    setLoading(false);
  }

  return (
    <main style={s.page}>
      {/* NAV */}
      <header style={s.header}>
        <div style={s.headerInner}>
          <div style={s.logo}>🤖 EduAI</div>
          <nav style={s.nav}>
            <a href="#features" style={s.navLink}>Fonctionnalités</a>
            <a href="#parcours" style={s.navLink}>Parcours</a>
            <a href="#pricing" style={s.navLink}>Tarifs</a>
            <a href="#faq" style={s.navLink}>FAQ</a>
            <a href="#ia" style={s.ctaSmall}>Commencer</a>
          </nav>
        </div>
      </header>

      {/* HERO */}
      <section style={s.hero}>
        <div style={s.heroGrid}>
          <div style={s.heroLeft}>
            <span style={s.badge}>✨ IA éducative nouvelle génération</span>
            <h1 style={s.title}>
              Apprends plus vite
              <br />
              avec une IA scolaire.
            </h1>
            <p style={s.subtitle}>
              Cours clairs, exercices corrigés, évaluations intelligentes.
              Du collège à la prépa.
            </p>

            <div style={s.heroCards}>
              <div style={s.card}>🎓 Collège → Prépa</div>
              <div style={s.card}>✍️ Exercices auto</div>
              <div style={s.card}>📈 Progression</div>
            </div>
          </div>

          {/* GENERATOR */}
          <div id="ia" style={s.generator}>
            <h2 style={s.genTitle}>🤖 Générateur IA</h2>

            <select
              style={s.input}
              value={matiere}
              onChange={(e) => {
                setMatiere(e.target.value);
                setNiveau("");
                setChapitre("");
              }}
            >
              <option value="">Matière</option>
              {Object.keys(data).map((m) => (
                <option key={m}>{m}</option>
              ))}
            </select>

            <select
              style={s.input}
              value={niveau}
              onChange={(e) => {
                setNiveau(e.target.value);
                setChapitre("");
              }}
            >
              <option value="">Niveau</option>
              {niveaux.map((n) => (
                <option key={n}>{n}</option>
              ))}
            </select>

            <select
              style={s.input}
              value={chapitre}
              onChange={(e) => setChapitre(e.target.value)}
            >
              <option value="">Chapitre</option>
              {chapitres.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>

            <button style={s.button} onClick={generate}>
              {loading ? "⏳ Génération..." : "✨ Générer mon cours"}
            </button>

            {answer && (
              <div style={s.result}>
                <pre style={s.pre}>{answer}</pre>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" style={s.section}>
        <h2 style={s.sectionTitle}>Pourquoi choisir EduAI ?</h2>
        <div style={s.grid3}>
          <div style={s.feature}>
            ⚡ Génération instantanée
            <p>Un cours complet en quelques secondes</p>
          </div>
          <div style={s.feature}>
            🧠 Adaptatif
            <p>Contenu adapté à ton niveau réel</p>
          </div>
          <div style={s.feature}>
            📊 Progression
            <p>Suivi et amélioration continue</p>
          </div>
        </div>
      </section>

      {/* PARCOURS */}
      <section id="parcours" style={s.sectionAlt}>
        <h2 style={s.sectionTitle}>Tous les niveaux</h2>
        <div style={s.grid4}>
          <div style={s.level}>Collège</div>
          <div style={s.level}>Lycée</div>
          <div style={s.level}>Prépa</div>
          <div style={s.level}>Grandes écoles</div>
        </div>
      </section>

      {/* TESTIMONIAL */}
      <section style={s.section}>
        <h2 style={s.sectionTitle}>Ils progressent avec nous</h2>
        <div style={s.grid3}>
          <div style={s.testimonial}>“J’ai gagné 4 points en maths !”</div>
          <div style={s.testimonial}>“Meilleur que mes cours”</div>
          <div style={s.testimonial}>“Incroyable pour la prépa”</div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" style={s.sectionAlt}>
        <h2 style={s.sectionTitle}>Tarifs</h2>
        <div style={s.grid3}>
          <div style={s.priceCard}>
            Gratuit
            <p>Accès limité</p>
          </div>
          <div style={s.priceCardMain}>
            Pro
            <p>IA illimitée</p>
          </div>
          <div style={s.priceCard}>
            Premium
            <p>Coaching + IA</p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" style={s.section}>
        <h2 style={s.sectionTitle}>FAQ</h2>
        <div style={s.faq}>Est-ce vraiment utile ? → Oui</div>
        <div style={s.faq}>Est-ce difficile ? → Non</div>
        <div style={s.faq}>Remplace un prof ? → Non, complète</div>
      </section>

      {/* FOOTER */}
      <footer style={s.footer}>
        © 2026 EduAI — Tous droits réservés
      </footer>
    </main>
  );
}

const s: any = {
  page: { fontFamily: "Inter, Arial", margin: 0 },

  header: {
    position: "fixed",
    width: "100%",
    backdropFilter: "blur(10px)",
    background: "rgba(255,255,255,0.7)",
    zIndex: 10,
  },
  headerInner: {
    maxWidth: 1200,
    margin: "0 auto",
    display: "flex",
    justifyContent: "space-between",
    padding: 16,
  },
  logo: { fontWeight: 900 },
  nav: { display: "flex", gap: 20, alignItems: "center" },
  navLink: { textDecoration: "none", color: "#333" },
  ctaSmall: {
    background: "#7c3aed",
    color: "white",
    padding: "8px 14px",
    borderRadius: 10,
  },

  hero: {
    minHeight: "100vh",
    backgroundImage: `
      linear-gradient(rgba(255,255,255,0.9), rgba(255,255,255,0.6)),
      url('/hero.png')
    `,
    backgroundSize: "cover",
    paddingTop: 100,
  },
  heroGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 400px",
    gap: 40,
    maxWidth: 1200,
    margin: "0 auto",
  },

  heroLeft: {},
  badge: { background: "#eee", padding: 10, borderRadius: 20 },
  title: { fontSize: 60, margin: "20px 0" },
  subtitle: { fontSize: 20, color: "#555" },

  heroCards: { display: "flex", gap: 10 },
  card: { background: "#fff", padding: 10, borderRadius: 10 },

  generator: {
    background: "white",
    padding: 20,
    borderRadius: 20,
    boxShadow: "0 20px 50px rgba(0,0,0,0.1)",
  },
  genTitle: { marginTop: 0 },

  input: {
    width: "100%",
    padding: 12,
    marginTop: 10,
    borderRadius: 10,
    border: "1px solid #ddd",
  },

  button: {
    width: "100%",
    marginTop: 15,
    padding: 12,
    background: "#7c3aed",
    color: "white",
    border: "none",
    borderRadius: 10,
  },

  result: {
    marginTop: 10,
    background: "#111",
    color: "white",
    padding: 10,
    borderRadius: 10,
    maxHeight: 200,
    overflow: "auto",
  },

  pre: { whiteSpace: "pre-wrap" },

  section: { padding: 60, textAlign: "center" },
  sectionAlt: { padding: 60, background: "#f1f5f9", textAlign: "center" },

  sectionTitle: { fontSize: 32 },

  grid3: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))",
    gap: 20,
    marginTop: 30,
  },
  grid4: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))",
    gap: 20,
    marginTop: 30,
  },

  feature: { background: "white", padding: 20, borderRadius: 10 },
  level: { background: "white", padding: 20, borderRadius: 10 },
  testimonial: { background: "white", padding: 20 },

  priceCard: { background: "white", padding: 20 },
  priceCardMain: {
    background: "#7c3aed",
    color: "white",
    padding: 20,
  },

  faq: { marginTop: 10 },

  footer: {
    padding: 20,
    textAlign: "center",
    background: "#111",
    color: "white",
  },
};
