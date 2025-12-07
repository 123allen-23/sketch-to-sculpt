import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { mode, drawingId } = await req.json();

  let resultText = "";

  if (mode === "clean") {
    resultText = "Sketch cleaned successfully. [MOCK]";
  } else if (mode === "refined") {
    resultText = "Refined print generated. [MOCK]";
  } else if (mode === "sculpt_3d") {
    resultText = "3D sculpt pass complete. [MOCK]";
  } else {
    resultText = "Unknown mode. [MOCK]";
  }

  return NextResponse.json({
    success: true,
    drawingId,
    mode,
    resultText,
    imageUrl: null,
  });
}
