export const coursesData: Record<string, Record<string, string[]>> = {
  Mathématiques: {
    "6e": ["Fractions", "Proportionnalité", "Géométrie"],
    "5e": ["Nombres relatifs", "Triangles", "Pourcentages"],
    "4e": ["Théorème de Pythagore", "Puissances", "Statistiques"],
    "3e": ["Équations", "Fonctions", "Théorème de Thalès"],
    Seconde: ["Fonctions", "Vecteurs", "Probabilités"],
    Première: ["Dérivation", "Suites", "Produit scalaire"],
    Terminale: ["Limites", "Fonction logarithme", "Équations différentielles", "Loi binomiale"],
  },
  Physique: {
    Seconde: ["Mouvement", "Lumière", "Signaux"],
    Première: ["Énergie", "Ondes", "Électricité"],
    Terminale: ["Deuxième loi de Newton", "Lentilles minces", "Mécanique quantique"],
  },
  Chimie: {
    Seconde: ["Atomes", "Solutions", "Transformation chimique"],
    Première: ["Dosage", "Oxydoréduction", "Molécules"],
    Terminale: ["Acides bases", "Piles", "Cinétique chimique"],
  },
};
