export default function Home() {
  return (
    <main style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #4f46e5, #9333ea)",
      color: "white",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "Arial",
      textAlign: "center",
      padding: 20
    }}>
      
      <h1 style={{ fontSize: 50, marginBottom: 20 }}>
        🚀 EduAI Premium
      </h1>

      <p style={{ fontSize: 18, maxWidth: 600 }}>
        Génère des cours automatiquement avec intelligence artificielle.
        Version stable en cours de construction.
      </p>

      <button
        style={{
          marginTop: 30,
          padding: "12px 24px",
          borderRadius: 10,
          border: "none",
          background: "white",
          color: "#4f46e5",
          fontWeight: "bold",
          cursor: "pointer"
        }}
      >
        Commencer
      </button>

    </main>
  );
}
