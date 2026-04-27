import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { question } = await req.json();

  const response = await fetch(
    "https://api-inference.huggingface.co/models/google/flan-t5-large",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: `Explique comme un prof et donne un exercice avec correction : ${question}`,
      }),
    }
  );

  const data = await response.json();

  return NextResponse.json({
    answer: data[0]?.generated_text || "Erreur IA",
  });
}
