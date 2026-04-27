export const metadata = {
  title: "EduAI - Soutien scolaire",
  description: "Cours de maths, physique et IA avec visio et génération de cours",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body style={{ margin: 0 }}>
        {children}
      </body>
    </html>
  );
}
