# SnapList

AI-powered listing generator: upload a photo of an item you want to sell,
and get a polished marketplace listing — title, description, category,
highlights, and an estimated price range — ready to edit and post to OLX,
Facebook Marketplace, or anywhere else.

> **Status: Slice 0 in progress.** Local repository/project scaffolding is
> complete (backend and frontend both install, lint, and build cleanly, and
> the frontend can call the backend's local health-check endpoint). Slice 0
> is **not** yet fully done — per the Development Checklist, it also
> requires MongoDB Atlas configured and connected, the backend deployed to
> Render, the frontend deployed to Vercel, and the *deployed* frontend
> successfully calling the *deployed* backend's health-check endpoint. None
> of that has happened yet; see "Deployment acceptance criteria" below for
> exactly what remains and who needs to do it.

## Core workflow

**Upload → AI Generate → Edit → Save → Manage**

## Stack

- **Frontend:** React + Tailwind CSS (Vite), JavaScript only — no TypeScript
- **Backend:** Node.js + Express, JavaScript only — no TypeScript
- **Database:** MongoDB Atlas (via Mongoose)
- **Image storage:** Cloudinary
- **AI:** Google Gemini, via a provider adapter
- **Auth:** JWT
- **Deployment:** Vercel (frontend), Render (backend)

Full reasoning behind every choice above is in
`docs/05-architecture-decision-records.md`.

## Repository structure

```
snaplist/
├── client/    # React + Tailwind frontend
├── server/    # Express + MongoDB backend
└── docs/      # Frozen planning documents (see docs/README.md)
```

## Local setup

### Backend

```
cd server
npm install
cp .env.example .env   # then fill in real values
npm run dev
```

Runs on `http://localhost:5000` by default. Visit `/health` to confirm it's
running (and to see current MongoDB connection status).

### Frontend

```
cd client
npm install
cp .env.example .env   # then fill in real values
npm run dev
```

Runs on `http://localhost:5173` by default (Vite's default port).

## Slice 0 status in detail

**Done (local scaffold):**
- [x] Monorepo structure (`client/`, `server/`, `docs/`)
- [x] Backend installs, lints, and boots; health-check endpoint works
- [x] Frontend installs, lints, and builds; Tailwind confirmed generating output
- [x] Frontend successfully calls the backend's health-check endpoint (locally)
- [x] Environment variable loading configured on both sides, with `.env.example` provided
- [x] All module/provider/layer placeholders in place per the Technical Design Document

**Not done yet (requires the project owner's accounts/actions):**
- [ ] MongoDB Atlas cluster created and `MONGO_URI` configured
- [ ] Backend deployed to Render
- [ ] Frontend deployed to Vercel
- [ ] Deployed frontend successfully calling the deployed backend's `/health` endpoint

These four items are genuine Slice 0 acceptance criteria per the Development
Checklist and are **not optional polish** — Slice 0 is not complete until
they're done. They require account creation and manual configuration
(Atlas connection string, Render/Vercel project setup and environment
variables) that can't be completed from within this repository alone.

## Documentation

Everything governing this project's design — the product plan, architecture
review, technical design document, API contract, ADRs, and the slice-by-
slice development checklist — lives in `docs/`. Start with `docs/README.md`.

**Important:** `docs/01-project-plan.md`, `docs/02-architecture-review.md`,
and `docs/03-technical-design-document.md` are reconstructions written from
conversation history, not the original approved files, and are explicitly
marked as such at the top of each file. They must be replaced with the exact
approved originals before being treated as authoritative — see the notice in
each file and in `docs/README.md` for detail.

## What this project is not

SnapList is not a marketplace, an e-commerce platform, a payment system, or
a buyer/seller platform. It generates and manages listings only — see
`docs/01-project-plan.md`, section 9, for the full scope boundary.
