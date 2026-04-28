"use client"

import { useState } from "react"
import { getSupabaseClient } from "../lib/supabase"

export default function Home() {
  const supabase = getSupabaseClient()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  // 🔐 INSCRIPTION
  const handleSignup = async () => {
    if (!supabase) {
      alert("Erreur Supabase ❌")
      return
    }

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
    if (!supabase) {
      alert("Erreur Supabase ❌")
      return
    }

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
      
      {/* overlay */}
      <div className="absolute inset-0 bg-black/40" />

      <div className="relative z-10 grid md:grid-cols-2 gap-10 max-w-6xl w-full px-6">

        {/* LEFT */}
        <div>
          <h1 className="text-5xl font-bold">
            Apprends plus vite <br /> avec une IA 🚀
          </h1>

          <p className="mt-4 text-gray-300">
            Génère des cours automatiquement avec intelligence artificielle.
          </p>
        </div>

        {/* RIGHT FORM */}
        <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl border border-white/20">

          <h2 className="text-2xl mb-6 text-center">
            🔐 Connexion
          </h2>

          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 mb-3 rounded bg-white/20"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Mot de passe"
            className="w-full p-3 mb-4 rounded bg-white/20"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <div className="flex gap-3">
            <button
              onClick={handleLogin}
              disabled={loading}
              className="flex-1 bg-blue-600 p-3 rounded"
            >
              Se connecter
            </button>

            <button
              onClick={handleSignup}
              disabled={loading}
              className="flex-1 bg-purple-600 p-3 rounded"
            >
              S’inscrire
            </button>
          </div>

        </div>
      </div>
    </main>
  )
}
