"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import supabase from "../lib/supabaseClient";

export default function GalleryPage() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from("art_gallery")
        .select("id, title, category, image_url")
        .order("id", { ascending: false });

      if (error) console.error(error);
      else setItems(data);
    }

    load();
  }, []);

  return (
    <div style={{ padding: "2rem" }}>
      <h1 style={{ fontSize: "2rem", marginBottom: "1.5rem" }}>Gallery</h1>

      {items.length === 0 && <p>Loading...</p>}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
          gap: "1.5rem",
        }}
      >
        {items.map((item) => (
          <Link key={item.id} href={`/drawing?id=${item.id}`}>
            <div
              style={{
                border: "1px solid #333",
                borderRadius: "12px",
                padding: "10px",
                background: "#111",
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  width: "100%",
                  height: "200px",
                  position: "relative",
                  overflow: "hidden",
                  borderRadius: "8px",
                }}
              >
                <Image
                  src={item.image_url}
                  alt={item.title}
                  fill
                  style={{ objectFit: "cover" }}
                />
              </div>

              <h3 style={{ marginTop: "10px", fontSize: "1.1rem" }}>
                {item.title}
              </h3>

              <p style={{ opacity: 0.7 }}>{item.category}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
