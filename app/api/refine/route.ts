import { NextResponse } from "next/server";
import OpenAI, { toFile } from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  try {
    const { imageUrl, prompt } = await req.json();

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "OPENAI_API_KEY missing on server" }, { status: 500 });
    }
    if (!imageUrl) {
      return NextResponse.json({ error: "Missing imageUrl" }, { status: 400 });
    }

    // Fetch the original image bytes
    const imgResp = await fetch(imageUrl);
    if (!imgResp.ok) {
      return NextResponse.json(
        { error: `Failed to fetch source image: ${imgResp.status}` },
        { status: 400 }
      );
    }

    const contentType = imgResp.headers.get("content-type") || "image/png";
    const buf = Buffer.from(await imgResp.arrayBuffer());

    // Convert bytes to a "file" for the OpenAI image edits endpoint
    const inputFile = await toFile(buf, "input.png", { type: contentType });

    const finalPrompt =
      (prompt && String(prompt).trim()) ||
      "Refine this drawing: clean the lines, increase contrast, remove background noise, preserve the original form and intent. Do not add new objects.";

    // IMPORTANT: gpt-image models return base64 for outputs
    const rsp = await client.images.edit({
      model: "gpt-image-1",
      image: [inputFile],
      prompt: finalPrompt,
      size: "1024x1024",
    });

    const b64 = rsp.data?.[0]?.b64_json;
    if (!b64) {
      return NextResponse.json({ error: "No image returned from OpenAI" }, { status: 500 });
    }

    return NextResponse.json({ b64, outputType: "image/png" });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? "Refine failed" },
      { status: 500 }
    );
  }
}
