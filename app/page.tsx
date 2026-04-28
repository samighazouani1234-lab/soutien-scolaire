"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"

export default function Home() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  // 🔐 INSCRIPTION
  const handleSignup = async () => {
    setLoading(true)

    const { error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      alert(error.message)
    } else {
      alert("Compte créé ! Vérifie ton email 📧")
    }

    setLoading(false)
  }

  // 🔐 CONNEXION
  const handleLogin = async () => {
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      alert(error.message)
    } else {
      alert("Connexion réussie ✅")
    }

    setLoading(false)
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 text-white">
      
      {/* BACKGROUND OVERLAY */}
      <div className="absolute inset-0 bg-black/40" />

      {/* CONTENU */}
      <div className="relative z-10 grid md:grid-cols-2 gap-10 items-center max-w-6xl w-full px-6">

        {/* TEXTE GAUCHE */}
        <div>
          <h1 className="text-5xl font-bold leading-tight">
            Apprends plus vite <br /> avec une IA scolaire 🚀
          </h1>

          <p className="mt-4 text-lg text-gray-300">
            Génère des cours, exercices et corrections automatiquement.
          </p>

          <div className="mt-6 flex gap-4 flex-wrap">
            <span className="bg-white/10 px-4 py-2 rounded-full">📚 Collège → Prépa</span>
            <span className="bg-white/10 px-4 py-2 rounded-full">🧪 Maths • Physique</span>
            <span className="bg-white/10 px-4 py-2 rounded-full">✅ Corrections incluses</span>
          </div>
        </div>

        {/* FORMULAIRE */}
        <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-xl border border-white/20">

          <h2 className="text-2xl font-semibold mb-6 text-center">
            🔐 Connexion
          </h2>

          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 mb-3 rounded-lg bg-white/20 placeholder-gray-300 outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Mot de passe"
            className="w-full p-3 mb-4 rounded-lg bg-white/20 placeholder-gray-300 outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <div className="flex gap-3">
            <button
              onClick={handleLogin}
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 p-3 rounded-lg font-semibold"
            >
              Se connecter
            </button>

            <button
              onClick={handleSignup}
              disabled={loading}
              className="flex-1 bg-purple-600 hover:bg-purple-700 p-3 rounded-lg font-semibold"
            >
              S’inscrire
            </button>
          </div>

        </div>
      </div>
    </main>
  )
}
