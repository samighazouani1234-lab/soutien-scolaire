export default function Home() {
  return (
    <main style={styles.page}>
      <header style={styles.header}>
        <div style={styles.logo}>📚 EduNova</div>
        <a href="#contact" style={styles.headerButton}>Réserver un cours</a>
      </header>

      <section style={styles.hero}>
        <div>
          <p style={styles.badge}>Soutien scolaire premium</p>
          <h1 style={styles.title}>
            Des cours plus clairs, des résultats plus rapides.
          </h1>
          <p style={styles.subtitle}>
            Maths, physique, exercices corrigés, cours générés par IA et accompagnement en visio avec professeur.
          </p>

          <div style={styles.buttons}>
            <a href="#cours" style={styles.primary}>Découvrir les cours</a>
            <a href="#visio" style={styles.secondary}>Cours en visio</a>
          </div>
        </div>

        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Exemple de parcours</h2>
          <div style={styles.lesson}>🧮 Fractions — Niveau 4e</div>
          <div style={styles.lesson}>⚗️ Forces — Niveau 2nde</div>
          <div style={styles.lesson}>📐 Fonctions — Lycée</div>
        </div>
      </section>

      <section id="cours" style={styles.section}>
        <h2 style={styles.sectionTitle}>Cours IA + exercices corrigés</h2>
        <div style={styles.grid}>
          {["Mathématiques", "Physique", "Méthodologie"].map((item) => (
            <div key={item} style={styles.feature}>
              <h3>{item}</h3>
              <p style={styles.text}>
                Des explications simples, des exemples et des exercices adaptés au niveau de l’élève.
              </p>
            </div>
          ))}
        </div>
      </section>

      <section id="visio" style={styles.premium}>
        <h2 style={styles.sectionTitle}>Service premium : cours en visio</h2>
        <p style={styles.text}>
          Réservez une séance avec un professeur pour débloquer les difficultés et préparer les contrôles.
        </p>
        <a href="#contact" style={styles.primary}>Réserver une séance</a>
      </section>

      <section id="contact" style={styles.contact}>
        <h2>Prêt à progresser ?</h2>
        <p style={styles.text}>Premier échange gratuit pour choisir le bon accompagnement.</p>
        <button style={styles.contactButton}>Demander un appel</button>
      </section>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at top left, #facc1555, transparent 25%), radial-gradient(circle at top right, #3b82f655, transparent 25%), #08111f",
    color: "white",
    fontFamily: "Arial, sans-serif",
    padding: 24,
  },
  header: {
    maxWidth: 1200,
    margin: "0 auto",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px 0",
  },
  logo: { fontSize: 24, fontWeight: 900 },
  headerButton: {
    background: "white",
    color: "black",
    padding: "12px 18px",
    borderRadius: 999,
    fontWeight: 800,
    textDecoration: "none",
  },
  hero: {
    maxWidth: 1200,
    margin: "60px auto",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: 40,
    alignItems: "center",
  },
  badge: {
    display: "inline-block",
    background: "rgba(255,255,255,0.1)",
    color: "#fde68a",
    padding: "8px 14px",
    borderRadius: 999,
    fontWeight: 700,
  },
  title: {
    fontSize: "clamp(40px, 8vw, 68px)",
    lineHeight: 1,
    margin: "24px 0",
    letterSpacing: -2,
  },
  subtitle: {
    fontSize: 18,
    color: "#cbd5e1",
    lineHeight: 1.7,
  },
  buttons: { display: "flex", gap: 12, flexWrap: "wrap", marginTop: 28 },
  primary: {
    display: "inline-block",
    background: "#facc15",
    color: "black",
    padding: "14px 20px",
    borderRadius: 999,
    fontWeight: 900,
    textDecoration: "none",
  },
  secondary: {
    display: "inline-block",
    border: "1px solid rgba(255,255,255,0.25)",
    color: "white",
    padding: "14px 20px",
    borderRadius: 999,
    fontWeight: 800,
    textDecoration: "none",
  },
  card: {
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.15)",
    borderRadius: 32,
    padding: 28,
    boxShadow: "0 30px 80px rgba(0,0,0,0.45)",
  },
  cardTitle: { fontSize: 28 },
  lesson: {
    marginTop: 14,
    padding: 18,
    borderRadius: 18,
    background: "rgba(255,255,255,0.1)",
    fontWeight: 800,
  },
  section: {
    maxWidth: 1200,
    margin: "80px auto",
  },
  sectionTitle: {
    fontSize: "clamp(30px, 5vw, 46px)",
    marginBottom: 24,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: 20,
  },
  feature: {
    background: "rgba(255,255,255,0.08)",
    borderRadius: 28,
    padding: 24,
    border: "1px solid rgba(255,255,255,0.12)",
  },
  text: {
    color: "#cbd5e1",
    lineHeight: 1.7,
  },
  premium: {
    maxWidth: 1200,
    margin: "80px auto",
    background: "rgba(255,255,255,0.08)",
    padding: 32,
    borderRadius: 32,
    border: "1px solid rgba(255,255,255,0.12)",
  },
  contact: {
    maxWidth: 800,
    margin: "80px auto",
    textAlign: "center",
    background: "white",
    color: "black",
    padding: 32,
    borderRadius: 32,
  },
  contactButton: {
    marginTop: 16,
    background: "#08111f",
    color: "white",
    padding: "14px 22px",
    borderRadius: 999,
    border: 0,
    fontWeight: 900,
  },
};
