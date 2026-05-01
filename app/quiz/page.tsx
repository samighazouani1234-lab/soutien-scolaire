"use client";

import { useEffect, useMemo, useState } from "react";
import { data } from "../data/courses";
import { getSupabaseClient } from "../lib/supabase";

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [matiere, setMatiere] = useState("");
  const [niveau, setNiveau] = useState("");
  const [chapitre, setChapitre] = useState("");

  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const [showQuiz, setShowQuiz] = useState(true);
  const [showExercises, setShowExercises] = useState(true);
  const [showShortCorrections, setShowShortCorrections] = useState(false);
  const [showDetailedCorrections, setShowDetailedCorrections] = useState(false);
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const niveaux =
