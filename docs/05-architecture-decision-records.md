# SnapList — Architecture Decision Records (ADR Summary)

Status legend: all decisions below are **Accepted** and frozen for Version 1, per the approved Project Plan, Architecture Review, Technical Design Document, and API Contract Specification.

---

### ADR 1 — Modular Monolith Architecture

- **Status:** Accepted
- **Context:** Solo developer, 7–10 day timeline, prior negative experience with tightly coupled/hard-to-maintain code.
- **Decision:** Build SnapList as a single modular monolith (`auth`, `users`, `listings`, `ai`, `storage` modules) rather than microservices.
- **Reason:** Microservices add deployment/orchestration overhead with no benefit at this scale; a modular monolith gives clean boundaries without operational cost.
- **Consequences:** One deployable backend to run and reason about; module boundaries must be actively maintained (no direct cross-module repository/provider access) since there's no network boundary enforcing separation.

---

### ADR 2 — Single Monorepo (`client/`, `server/`, `docs/`)

- **Status:** Accepted
- **Context:** Solo developer; no need for independent team ownership of frontend/backend.
- **Decision:** One Git repository with top-level `client/`, `server/`, `docs/` folders.
- **Reason:** Avoids cross-repo synchronization overhead; keeps one issue list and one commit history for a portfolio piece reviewers will inspect.
- **Consequences:** Simpler workflow, but requires discipline in keeping `client/` and `server/` concerns from bleeding into each other despite shared repo proximity.

---

### ADR 3 — JavaScript, Not TypeScript

- **Status:** Accepted
- **Context:** Timeline pressure and solo development; TypeScript adds tooling/type-authoring overhead.
- **Decision:** Entire project (`client/` and `server/`) is written in JavaScript (`.js`/`.jsx`), no TypeScript.
- **Reason:** Removes compilation/type-maintenance overhead within the fixed timeline; team is a single developer, so type-contract enforcement across people isn't a driving need.
- **Consequences:** No compile-time type safety — validation layers (Zod on both ends) and disciplined API contract adherence carry more of that responsibility manually.

---

### ADR 4 — React + Tailwind CSS Frontend

- **Status:** Accepted
- **Context:** Need a modern, responsive, portfolio-quality UI built quickly.
- **Decision:** Frontend built in React with Tailwind CSS for styling.
- **Reason:** Both have large ecosystems, fast iteration speed, and are widely recognized by reviewers — good fit for a demonstrable portfolio project.
- **Consequences:** Utility-first CSS requires consistent design-token discipline to avoid a "generic Tailwind template" look.

---

### ADR 5 — Node.js + Express Backend

- **Status:** Accepted
- **Context:** Need a REST API server matching the finalized API Contract.
- **Decision:** Backend built with Node.js and Express.
- **Reason:** Minimal, well-understood, unopinionated framework that maps cleanly onto the layered (routes → validation → controller → service → repository) architecture already chosen.
- **Consequences:** Express doesn't enforce structure itself — the modular layering must be maintained by convention, not framework guarantee.

---

### ADR 6 — MongoDB Atlas + Mongoose

- **Status:** Accepted
- **Context:** Listing data has some shape variability (optional fields, platform-style variants, AI-versioned metadata) that benefits from a flexible schema.
- **Decision:** MongoDB Atlas (free M0 tier) as the database, accessed via Mongoose.
- **Reason:** Document model absorbs schema iteration without migrations; Mongoose adds schema-level validation and structure without giving up flexibility; free tier fits budget constraint.
- **Consequences:** Free M0 tier caps storage at 512MB — acceptable for a portfolio-scale demo but a known ceiling if traffic ever grows.

---

### ADR 7 — Gemini via an AI Provider Adapter

- **Status:** Accepted
- **Context:** Need a vision-capable, text-generation-capable model with a genuinely usable free tier for iterative development.
- **Decision:** Use Google Gemini for Version 1, accessed exclusively through an `AIProvider` adapter interface — never called directly from business logic.
- **Reason:** Gemini's free tier keeps development cost at zero during heavy prompt iteration; the adapter interface keeps the specific provider swappable without touching `listings` service logic.
- **Consequences:** Any future provider swap (e.g., to Claude) is limited to writing a new adapter implementation; the normalized response contract (title/description/category/highlights/estimatedPriceRange) must be maintained by every adapter.

---

### ADR 8 — Cloudinary via a Storage Provider Adapter

- **Status:** Accepted
- **Context:** Need image hosting with transformation support (thumbnails) and a durable free tier.
- **Decision:** Use Cloudinary for image storage, accessed exclusively through a `StorageProvider` adapter interface.
- **Reason:** Cloudinary's free tier is ongoing (not time-limited like S3's), and built-in image transforms remove custom thumbnail-generation code; the adapter keeps the provider swappable.
- **Consequences:** Bound by Cloudinary's free-tier bandwidth/storage limits; orphaned assets from abandoned Generate flows are an accepted, low-severity cleanup gap in V1 (see ADR 14 and the API Contract).

---

### ADR 9 — JWT Authentication

- **Status:** Accepted
- **Context:** Need stateless, simple authentication suited to a small, single-service API.
- **Decision:** JWT-based auth with short-lived access tokens; no refresh-token rotation system in V1.
- **Reason:** Matches the project's scale — a full session/refresh-token system is complexity the MVP doesn't need.
- **Consequences:** Users must re-authenticate after token expiry; "logout" is a client-side token-discard action, not a server-side session invalidation.

---

### ADR 10 — Vercel Frontend Deployment

- **Status:** Accepted
- **Context:** Need free, zero-config hosting for a React app.
- **Decision:** Deploy `client/` to Vercel.
- **Reason:** Generous free tier, minimal configuration, strong fit for React/Vite-style builds.
- **Consequences:** None significant for this project's scale; environment variables (API base URL) must be configured per environment (dev/prod).

---

### ADR 11 — Render Backend Deployment

- **Status:** Accepted
- **Context:** Need free hosting for the Express API.
- **Decision:** Deploy `server/` to Render as a web service.
- **Reason:** Free tier suits a portfolio-scale demo; straightforward Node.js deployment.
- **Consequences:** Free-tier cold starts after inactivity — acceptable for a demo, but worth flagging before a live walkthrough so a slow first request isn't mistaken for a bug.

---

### ADR 12 — Vertical-Slice Development

- **Status:** Accepted
- **Context:** Solo developer needs steady, demonstrable progress rather than long stretches of non-functional partial layers.
- **Decision:** Development proceeds in vertical slices (Slice 0–10, see Development Checklist), each producing a complete, testable, deployable feature rather than a horizontal layer.
- **Reason:** Surfaces integration risk (especially AI/storage adapters) early; keeps `main` deployable throughout, which matters for a project meant to be reviewable at any point.
- **Consequences:** Requires discipline to resist building ahead on later slices before earlier ones are stable; slice boundaries must be respected even under time pressure.

---

### ADR 13 — Single, Immutable Listing Image in Version 1

- **Status:** Accepted
- **Context:** Multiple images and image replacement add meaningful scope for limited MVP benefit.
- **Decision:** Each listing has exactly one image, set at Generate/Save time and immutable thereafter; no image-replacement endpoint exists in V1. A new image requires deleting and regenerating the listing.
- **Reason:** Keeps the Save/Update contract simple and avoids building a re-upload flow with limited payoff within the timeline; the underlying schema already stores this as a one-element array for forward compatibility.
- **Consequences:** Users needing a different photo must recreate the listing in V1 — an accepted, explicit scope limitation, not an oversight.

---

### ADR 14 — Generate → Edit → Save Separation

- **Status:** Accepted
- **Context:** AI generation should be cheap to retry and never force a database write the user didn't explicitly request.
- **Decision:** `/listings/generate` (and `/listings/:id/regenerate`) return a draft only; nothing is persisted until the client explicitly calls Save (or Update, for regenerate).
- **Reason:** Avoids wasted writes and orphaned listing records from abandoned flows; keeps the AI step retry-friendly.
- **Consequences:** The frontend is responsible for holding draft state (including `estimatedPriceRange`) in memory between Generate and Save — no server-side draft persistence exists, so an abandoned flow loses the draft (and may leave an orphaned Cloudinary image), which is an accepted MVP tradeoff.

---

### ADR 15 — INR as the Fixed Version 1 Currency

- **Status:** Accepted
- **Context:** SnapList V1 targets Indian marketplace usage, including OLX India.
- **Decision:** All price fields (`askingPrice`, `estimatedPriceRange`) use `"INR"` as a fixed currency; the `currency` field is still transmitted explicitly (not hardcoded client-side) so a future multi-currency change is additive rather than breaking.
- **Reason:** Matches the actual target market; avoids unnecessary currency-conversion complexity in V1.
- **Consequences:** Any future multi-currency support requires turning `"INR"` from a constant into a genuine per-user/region setting — explicitly out of scope for V1.

---

*This ADR summary reflects decisions already finalized in the Architecture Review, Technical Design Document, and API Contract Specification. It does not introduce new decisions.*
