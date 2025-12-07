import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await request.json();

    console.log("AI UPGRADE REQUEST:", body);

    // TODO: Here is where we’ll later:
    // - Call OpenAI / other AI to generate a new image
    // - Save the new file into Supabase Storage
    // - Insert a new row into art_gallery (refined / render / photo)
    // For now we just pretend the job is queued.

    const { artworkId, type, title } = body;

    return NextResponse.json({
      success: true,
      message: `AI job queued: ${type} for "${title}" (ID ${artworkId})`,
    });
  } catch (err) {
    console.error("AI route error:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Server error" },
      { status: 500 }
    );
  }
}
