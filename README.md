This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```## Developer Setup

See `========================================================
SKETCH→SCULPT — DEVELOPER HANDOFF DOCUMENT
========================================================

PROJECT OVERVIEW
----------------
Sketch→Sculpt is a web app that transforms artwork through multiple stages:

1. Original (user-uploaded sketch/image)
2. Refined (AI-cleaned / enhanced image)
3. 3D Render (AI-generated 3D-style render)
4. Sculpt (future: STL / fabrication-ready output)

The app is built with Next.js (App Router), Supabase (auth, DB, storage),
and AI image pipelines. Stripe will be used later for monetization.

This document explains:
- Repo structure
- Environment setup
- Supabase schema & storage
- How the image pipeline works
- Known issues
- What the next dev is expected to do

--------------------------------------------------------
TECH STACK
--------------------------------------------------------
Frontend:
- Next.js (App Router)
- React
- Tailwind (UI)

Backend:
- Supabase (Auth, Postgres, Storage)
- API routes in /app/api/*
- Edge-safe fetch helper (safeFetch.js)

AI:
- OpenAI Images (generation + refinement)
- Future expansion planned

Payments (planned, not fully wired):
- Stripe

--------------------------------------------------------
REPOSITORY
--------------------------------------------------------
GitHub:
https://github.com/123allen-23/sketch-to-sculpt

Main folders:
- /app                → Next.js App Router pages & API routes
- /app/api            → Backend endpoints (refine, render, etc.)
- /lib                → Helpers (supabase client, safeFetch)
- /public             → Static assets
- /styles             → Styling
- .env.local          → Environment variables (NOT committed)

--------------------------------------------------------
ENVIRONMENT SETUP
--------------------------------------------------------
Create a `.env.local` file in the project root.
(The dot file must be created locally; some UIs block it.)

Template:

--------------------------------------------------------
.env.local
--------------------------------------------------------
SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
SUPABASE_ANON_KEY=YOUR_PUBLIC_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY

NEXT_PUBLIC_SUPABASE_URL=${SUPABASE_URL}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}

OPENAI_API_KEY=sk-xxxx

NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
--------------------------------------------------------

IMPORTANT:
- SUPABASE_URL must be a FULL https URL
- No quotes
- No trailing spaces
- Restart dev server after changes

--------------------------------------------------------
SUPABASE SETUP
--------------------------------------------------------

AUTH
----
- Email auth enabled
- Public anon key used client-side
- Service role key ONLY used server-side (API routes)

STORAGE
-------
Bucket:
- artwork-images
Public access: ON (temporary)
Used for storing all image stages

File paths generally follow:
artwork-images/{artwork_id}/{stage}.png

STAGES:
- original
- refined
- render
- sculpt (future)

DATABASE TABLES
---------------

TABLE: artworks
- id (uuid, PK)
- user_id (uuid, auth.users.id)
- title (text)
- description (text)
- created_at (timestamp)

TABLE: artwork_versions
- id (uuid, PK)
- artwork_id (uuid, FK)
- stage (text: original | refined | render | sculpt)
- image_url (text)
- created_at (timestamp)

TABLE: public_gallery
- id (uuid, PK)
- artwork_id (uuid)
- stage (text)
- image_url (text)
- title (text)
- caption (text)
- status (pending | approved | rejected)
- submitted_at (timestamp)
- reviewed_at (timestamp)
- reviewer_user_id (uuid)

RLS:
- Users can read their own artworks
- Public gallery is readable publicly
- Writes restricted to authenticated users

--------------------------------------------------------
IMAGE PIPELINE (IMPORTANT)
--------------------------------------------------------

FLOW:
1. User uploads ORIGINAL image
   - Stored in Supabase Storage
   - DB entry created in artwork_versions (stage=original)

2. REFINE
   - API route: /api/refine
   - Takes image URL
   - Calls OpenAI image edit/refine
   - Uploads refined image to storage
   - Saves new artwork_versions row (stage=refined)

3. RENDER
   - API route: /api/render
   - Uses refined image
   - Generates stylized 3D-like render
   - Uploads to storage
   - Saves stage=render

4. SCULPT
   - NOT IMPLEMENTED YET
   - Planned: STL or fabrication-ready asset

--------------------------------------------------------
safeFetch (IMPORTANT)
--------------------------------------------------------
File:
- /lib/safeFetch.js

Purpose:
- Wrapper around fetch
- Handles JSON errors safely
- Prevents silent crashes

KNOWN TASK:
- Ensure ALL API calls in frontend use safeFetch
- Some legacy fetch() calls may still exist

--------------------------------------------------------
KNOWN ISSUES / CONTEXT
--------------------------------------------------------
- A client-side exception occurred in /gallery previously
- Gallery pipeline now renders all 4 stages correctly
- Dev-mode warnings are understood and non-blocking
- Some API calls were hard to trace (grep fetch('/api') returned nothing)
- safeFetch exists but must be consistently enforced

--------------------------------------------------------
WHAT YOU (THE DEV) ARE EXPECTED TO DO
--------------------------------------------------------

IMMEDIATE PRIORITIES:
1. Audit all API calls and confirm safeFetch is used everywhere
2. Confirm /app/gallery/page.jsx is stable and error-free
3. Verify Supabase env variables are wired correctly
4. Confirm storage uploads & public URLs work consistently

NEXT PHASE:
5. Add per-stage tools (buttons per stage)
   - Refine → Render → Sculpt progression
6. Improve gallery UX
7. Lock down RLS more tightly
8. Prepare Stripe integration (later)

DO NOT:
- Commit .env files
- Rotate keys without coordination
- Change DB schema casually

--------------------------------------------------------
PHILOSOPHY
--------------------------------------------------------
This app is intentionally staged and modular.
Do not over-abstract.
Clarity > cleverness.
Reliability > speed.

If something breaks, trace it step by step.
Images, URLs, and stages are the backbone.

--------------------------------------------------------
END OF HANDOFF
========================================================.md` for full environment setup, account requirements,
and validation checklist. Developers must use their own service accounts
(Supabase, Stripe, OpenAI).
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
# Sketch→Sculpt

AI-powered pipeline that transforms hand-drawn artwork into refined renders,
3D models, and physical sculptures.

## Getting Started

1. Clone the repository
2. Install dependencies
3. See `DEV_HANDOFF.md` for full setup instructions

## Developer Requirements

Developers must use their own third-party service accounts
(Supabase, Stripe, OpenAI). No shared credentials.
Add full developer handoff documentation
