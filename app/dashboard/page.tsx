"use client";

import { useEffect, useState } from "react";
import { getSupabaseClient } from "../../lib/supabase";

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    const supabase = getSupabaseClient();

    if (!supabase) {
      setLoading(false);
      return;
    }

    const { data: userData } = await supabase.auth.getUser();
    const currentUser = userData.user;

    setUser(currentUser);

    if (!currentUser) {
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from("courses")
      .select("*")
      .eq("user_id", currentUser.id)
      .order("created_at", { ascending: false });

    setCourses(data || []);
    setLoading(false);
  }

  async function logout() {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    await supabase.auth.signOut();
    window.location.href = "/";
  }

  if (loading) {
    return <main style={styles.page}>Chargement...</main>;
  }

  if (!user) {
    return (
      <main style={styles.page}>
        <div style={styles.card}>
          <h1>🔐 Connexion requise</h1>
          <p>Connecte-toi pour voir ton historique.</p>
          <a href="/" style={styles.button}>Retour accueil</a>
        </div>
      </main>
    );
  }

  return (
    <main style={styles.page}>
      <nav style={styles.nav}>
        <div style={styles.logo}>📚 Mon espace EduAI</div>
        <div style={styles.navActions}>
          <a href="/" style={styles.link}>Accueil</a>
          <button onClick={logout} style={styles.logout}>Déconnexion</button>
        </div>
      </nav>

      <section style={styles.hero}>
        <h1 style={styles.title}>Bonjour 👋</h1>
        <p style={styles.subtitle}>{user.email}</p>

        <div style={styles.stats}>
          <div style={styles.statBox}>
            <strong>{courses.length}</strong>
            <span>Cours générés</span>
          </div>
          <div style={styles.statBox}>
            <strong>IA</strong>
            <span>Assistant actif</span>
          </div>
          <div style={styles.statBox}>
            <strong>Pro</strong>
            <span>Espace élève</span>
          </div>
        </div>
      </section>

      <section style={styles.content}>
        <h2 style={styles.sectionTitle}>Mes cours sauvegardés</h2>

        {courses.length === 0 ? (
          <div style={styles.empty}>
            Aucun cours sauvegardé pour le moment.
            <br />
            <a href="/" style={styles.button}>Générer un cours</a>
          </div>
        ) : (
          <div style={styles.grid}>
            {courses.map((course) => (
              <div key={course.id} style={styles.courseCard}>
                <div style={styles.tag}>
                  {course.matiere} · {course.niveau}
                </div>

                <h3 style={styles.courseTitle}>{course.chapitre}</h3>

                <pre style={styles.preview}>
                  {course.contenu}
                </pre>

                <p style={styles.date}>
                  {course.created_at
                    ? new Date(course.created_at).toLocaleDateString("fr-FR")
                    : ""}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

const styles: any = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg,#0f172a,#1e293b)",
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
    padding: "18px 24px",
    borderRadius: 24,
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.14)",
  },

  logo: {
    fontSize: 24,
    fontWeight: 900,
  },

  navActions: {
    display: "flex",
    gap: 14,
    alignItems: "center",
  },

  link: {
    color: "white",
    textDecoration: "none",
    fontWeight: 800,
  },

  logout: {
    background: "#ef4444",
    color: "white",
    border: 0,
    padding: "12px 16px",
    borderRadius: 14,
    fontWeight: 900,
    cursor: "pointer",
  },

  hero: {
    maxWidth: 1200,
    margin: "60px auto",
  },

  title: {
    fontSize: "clamp(42px, 7vw, 72px)",
    margin: 0,
  },

  subtitle: {
    color: "#cbd5e1",
    fontSize: 20,
  },

  stats: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 18,
    marginTop: 30,
  },

  statBox: {
    background: "rgba(255,255,255,0.1)",
    border: "1px solid rgba(255,255,255,0.14)",
    padding: 24,
    borderRadius: 24,
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },

  content: {
    maxWidth: 1200,
    margin: "0 auto 80px",
  },

  sectionTitle: {
    fontSize: 34,
  },

  empty: {
    background: "rgba(255,255,255,0.1)",
    padding: 30,
    borderRadius: 24,
    textAlign: "center",
  },

  button: {
    display: "inline-block",
    marginTop: 18,
    background: "linear-gradient(90deg,#7c3aed,#2563eb)",
    color: "white",
    padding: "14px 20px",
    borderRadius: 16,
    textDecoration: "none",
    fontWeight: 900,
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: 22,
  },

  courseCard: {
    background: "rgba(255,255,255,0.95)",
    color: "#0f172a",
    padding: 24,
    borderRadius: 26,
    boxShadow: "0 25px 70px rgba(0,0,0,0.25)",
  },

  tag: {
    display: "inline-block",
    background: "#ede9fe",
    color: "#6d28d9",
    padding: "8px 12px",
    borderRadius: 999,
    fontWeight: 900,
    fontSize: 13,
  },

  courseTitle: {
    fontSize: 24,
  },

  preview: {
    whiteSpace: "pre-wrap",
    maxHeight: 220,
    overflow: "auto",
    background: "#f1f5f9",
    padding: 14,
    borderRadius: 16,
    fontFamily: "Arial, sans-serif",
    lineHeight: 1.6,
  },

  date: {
    color: "#64748b",
    fontWeight: 700,
  },

  card: {
    maxWidth: 500,
    margin: "120px auto",
    background: "white",
    color: "#0f172a",
    padding: 30,
    borderRadius: 24,
    textAlign: "center",
  },
};
