export const coursesData: Record<string, Record<string, string[]>> = {
  Mathématiques: {
    "6e": ["Fractions", "Proportionnalité", "Aires et périmètres"],
    "5e": ["Nombres relatifs", "Triangles", "Pourcentages"],
    "4e": ["Pythagore", "Puissances", "Statistiques"],
    "3e": ["Équations", "Fonctions affines", "Thalès"],
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

export const data = coursesData;
