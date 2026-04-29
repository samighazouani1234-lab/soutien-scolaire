import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({
    answer: "API IA prête ✅",
  });
}
