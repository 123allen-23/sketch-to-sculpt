import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getAdminClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }

  return createClient(url, key, { auth: { persistSession: false } });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const action = body?.action as string;
    const id = body?.id as string | undefined;

    const supabaseAdmin = getAdminClient();

    if (action === "list_pending") {
      const { data, error } = await supabaseAdmin
        .from("public_gallery")
        .select("id, artwork_id, stage, image_url, title, caption, submitted_at, artist_user_id")
        .eq("status", "pending")
        .order("submitted_at", { ascending: false })
        .limit(200);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      return NextResponse.json({ items: data || [] }, { status: 200 });
    }

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    if (action === "approve" || action === "reject") {
      const status = action === "approve" ? "approved" : "rejected";

      const { error } = await supabaseAdmin
        .from("public_gallery")
        .update({
          status,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      return NextResponse.json({ ok: true }, { status: 200 });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Server error" },
      { status: 500 }
    );
  }
}
