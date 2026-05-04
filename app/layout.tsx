import type { ReactNode } from "react";

export const metadata = {
  title: "EduAI Pro IA",
  description: "Cours, exercices et quiz IA",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
