// app/page.jsx

import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-slate-800/70 bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900">
        <div className="absolute inset-0 pointer-events-none opacity-40 bg-[radial-gradient(circle_at_top,_#22d3ee33,_transparent_60%),_radial-gradient(circle_at_bottom,_#6366f133,_transparent_55%)]" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
          <p className="text-xs sm:text-sm font-mono uppercase tracking-[0.2em] text-sky-400">
            Sketch → Sculpt
          </p>

          <div className="mt-4 grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] items-center">
            {/* Left side */}
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-slate-50">
                From pencil sketch
                <span className="block text-sky-300">
                  to gallery-ready piece.
                </span>
              </h1>

              <p className="mt-4 text-sm sm:text-base text-slate-300 max-w-xl">
                Upload your raw sketches, attach a story, and run them through
                the pipeline. Sketch → Sculpt prepares your art for prints,
                galleries, and future 3D sculptures — all in one focused lab.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/upload"
                  className="inline-flex items-center justify-center rounded-full bg-sky-500 px-5 py-2.5 text-sm font-medium text-slate-950 shadow-lg shadow-sky-500/30 hover:bg-sky-400 transition"
                >
                  Start with a sketch
                </Link>

                <Link
                  href="/gallery"
                  className="inline-flex items-center justify-center rounded-full border border-slate-700 bg-slate-900/60 px-5 py-2.5 text-sm font-medium text-slate-200 hover:border-sky-400 hover:bg-slate-900 transition"
                >
                  View your gallery
                </Link>
              </div>

              <p className="mt-3 text-xs text-slate-400">
                Mock AI mode is active right now — safe to explore without
                burning credits.
              </p>
            </div>

            {/* Right side: fake “preview” card */}
            <div className="relative">
              <div className="rounded-3xl border border-slate-800 bg-slate-900/70 backdrop-blur shadow-2xl shadow-sky-900/50 overflow-hidden">
                <div className="border-b border-slate-800 px-4 py-3 flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-2">
                    <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                    Drawing Lab Preview
                  </span>
                  <span className="text-[11px] font-mono text-sky-300">
                    ID: 35 • Original
                  </span>
                </div>

                <div className="p-4 sm:p-5">
                  <div className="aspect-[4/3] w-full rounded-2xl bg-slate-800/80 border border-slate-700/70 mb-4 flex items-center justify-center text-xs text-slate-500">
                    Your sketch appears here after upload.
                  </div>

                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2">
                      <span className="inline-flex items-center rounded-full bg-slate-800/80 px-3 py-1 text-[11px] uppercase tracking-wide text-slate-300">
                        Clean Sketch
                      </span>
                      <span className="inline-flex items-center rounded-full bg-slate-800/80 px-3 py-1 text-[11px] uppercase tracking-wide text-slate-300">
                        Refined Print
                      </span>
                      <span className="inline-flex items-center rounded-full bg-slate-800/80 px-3 py-1 text-[11px] uppercase tracking-wide text-slate-300">
                        3D Sculpt Pass
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Pipeline buttons prep your sketch for print, promo, and
                      future 3D work — one piece at a time.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-b border-slate-800 bg-slate-950">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
          <h2 className="text-lg sm:text-xl font-semibold text-slate-50">
            Built for working artists — not generic AI noise.
          </h2>
          <p className="mt-2 text-sm text-slate-400 max-w-2xl">
            Sketch → Sculpt is your private lab for taking hand-drawn work and
            prepping it for the real world: prints, galleries, and collectors.
          </p>

          <div className="mt-6 grid gap-5 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
              <h3 className="text-sm font-semibold text-slate-50">
                1. Upload the sketch
              </h3>
              <p className="mt-2 text-xs text-slate-400">
                Snap a photo, give it a title and category, and add the story
                behind the piece. The app saves everything to your private
                gallery.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
              <h3 className="text-sm font-semibold text-slate-50">
                2. Run the pipeline
              </h3>
              <p className="mt-2 text-xs text-slate-400">
                Use Clean Sketch, Refined Print, and 3D Sculpt Pass to prep each
                drawing for print, promo, or future 3D metal / glass versions.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
              <h3 className="text-sm font-semibold text-slate-50">
                3. Build your master portfolio
              </h3>
              <p className="mt-2 text-xs text-slate-400">
                Every upload becomes part of your living portfolio — originals,
                refined prints, and sculpt concepts all organized in one place.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* “Who it’s for” */}
      <section className="bg-slate-950">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
          <div className="grid gap-8 md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] items-start">
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-slate-50">
                One app for sketches, stories, and sculptures.
              </h2>
              <p className="mt-2 text-sm text-slate-400 max-w-xl">
                Whether you&apos;re drawing at the kitchen table, in a shop, or
                in the field, Sketch → Sculpt keeps the whole journey together —
                from the first pencil mark to the finished piece.
              </p>

              <ul className="mt-4 space-y-2 text-sm text-slate-300">
                <li>• Keep every drawing and its story in one place.</li>
                <li>• See which pieces are ready for print or sculpture.</li>
                <li>• Get the app ready for a public launch when you&apos;re
                  ready to go live.</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 sm:p-5">
              <h3 className="text-sm font-semibold text-slate-50 mb-3">
                Quick links
              </h3>
              <div className="space-y-3 text-sm">
                <Link
                  href="/upload"
                  className="flex items-center justify-between rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 hover:border-sky-400 transition"
                >
                  <span>Upload a new drawing</span>
                  <span className="text-[11px] text-sky-300 uppercase tracking-wide">
                    Start
                  </span>
                </Link>

                <Link
                  href="/gallery"
                  className="flex items-center justify-between rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 hover:border-sky-400 transition"
                >
                  <span>View your gallery</span>
                  <span className="text-[11px] text-sky-300 uppercase tracking-wide">
                    Browse
                  </span>
                </Link>

                <Link
                  href="/profile"
                  className="flex items-center justify-between rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 hover:border-sky-400 transition"
                >
                  <span>Update your profile</span>
                  <span className="text-[11px] text-sky-300 uppercase tracking-wide">
                    Profile
                  </span>
                </Link>
              </div>

              <p className="mt-4 text-[11px] text-slate-500">
                When you&apos;re ready to add domains, payments, and real AI
                credits, this Home page is already set up like a production
                landing.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
