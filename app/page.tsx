async function handleSignup() {
  if (!email || !password) {
    alert("Entre un email et un mot de passe");
    return;
  }

  if (password.length < 6) {
    alert("Le mot de passe doit faire au moins 6 caractères");
    return;
  }

  if (!supabase) {
    alert("Erreur Supabase");
    return;
  }

  setLoading(true);

  const { error } = await supabase.auth.signUp({
    email: email.trim(),
    password: password,
  });

  if (error) alert(error.message);
  else alert("Compte créé ! Vérifie ton email.");

  setLoading(false);
}
