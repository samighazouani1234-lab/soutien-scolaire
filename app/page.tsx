export default function Home() {
  return (
    <main style={styles.page}>
      <nav style={styles.nav}>
        <div style={styles.logo}>🎓 EduAI</div>
        <a style={styles.navButton}>Commencer</a>
      </nav>

      <section style={styles.hero}>
        <div style={styles.left}>
          <span style={styles.badge}>IA scolaire premium</span>

          <h1 style={styles.title}>
            Des cours clairs, beaux et intelligents.
          </h1>

          <p style={styles.subtitle}>
            Génère des cours, exercices corrigés et évaluations avec une interface haut de gamme.
          </p>

          <div style={styles.buttons}>
            <a style={styles.primary}>Générer un cours</a>
            <a style={styles.secondary}>Voir les matières</a>
          </div>
        </div>

        <div style={styles.card}>
          <h2>✨ Exemple de cours</h2>
          <div style={styles.lesson}>📘 Mathématiques — Limites</div>
          <div style={styles.lesson}>🧪 Physique — Mécanique</div>
          <div style={styles.lesson}>⚗️ Chimie — Équilibres</div>
        </div>
      </section>
    </main>
  );
}

const styles: any = {
  page: {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at top left, #22d3ee55, transparent 30%), radial-gradient(circle at top right, #a855f755, transparent 28%), linear-gradient(135deg,#020617,#0f172a)",
    color: "white",
    fontFamily: "Arial, sans-serif",
    padding: 28,
  },
  nav: {
    maxWidth: 1200,
    margin: "0 auto",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "18px 0",
  },
  logo: { fontSize: 28, fontWeight: 900 },
  navButton: {
    background: "white",
    color: "#020617",
    padding: "12px 18px",
    borderRadius: 999,
    fontWeight: 900,
  },
  hero: {
    maxWidth: 1200,
    margin: "80px auto",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: 50,
    alignItems: "center",
  },
  left: { maxWidth: 650 },
  badge: {
    display: "inline-block",
    background: "rgba(255,255,255,0.12)",
    border: "1px solid rgba(255,255,255,0.18)",
    padding: "10px 16px",
    borderRadius: 999,
    color: "#a5f3fc",
    fontWeight: 900,
  },
  title: {
    fontSize: "clamp(48px, 8vw, 82px)",
    lineHeight: 1,
    letterSpacing: -3,
    margin: "28px 0",
  },
  subtitle: {
    fontSize: 21,
    lineHeight: 1.6,
    color: "#cbd5e1",
  },
  buttons: {
    display: "flex",
    gap: 14,
    flexWrap: "wrap",
    marginTop: 32,
  },
  primary: {
    background: "linear-gradient(90deg,#22d3ee,#a855f7)",
    padding: "15px 22px",
    borderRadius: 999,
    fontWeight: 900,
  },
  secondary: {
    border: "1px solid rgba(255,255,255,0.25)",
    padding: "15px 22px",
    borderRadius: 999,
    fontWeight: 900,
  },
  card: {
    background: "rgba(255,255,255,0.09)",
    border: "1px solid rgba(255,255,255,0.16)",
    borderRadius: 34,
    padding: 30,
    boxShadow: "0 35px 100px rgba(0,0,0,0.45)",
    backdropFilter: "blur(20px)",
  },
  lesson: {
    marginTop: 16,
    padding: 18,
    borderRadius: 20,
    background: "rgba(255,255,255,0.1)",
    fontWeight: 900,
  },
};
