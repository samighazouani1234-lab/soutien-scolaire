import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { topic } = await req.json();

  return NextResponse.json({
    content: `
📘 Cours : ${topic}

1. Définition simple
2. Exemple concret
3. Exercice :
Résoudre : x² - 5x + 6 = 0
`
  });
}
