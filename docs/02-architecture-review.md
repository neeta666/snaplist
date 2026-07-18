# SnapList — Architecture & Engineering Review

> ⚠️ **RECONSTRUCTED DOCUMENT — NOT THE AUTHORITATIVE ORIGINAL**
> This file was reconstructed from conversation history when populating
> `docs/` during Slice 0. It was not re-derived from or diffed against the
> original approved file, and may not be byte-for-byte identical to it.
> **This file must be replaced with the exact original approved Architecture
> & Engineering Review before being treated as a frozen, authoritative
> source.** Do not cite this reconstruction as the frozen original in any
> future decision-making until it has been replaced or explicitly verified
> against the true original.

## 1. Overall Architecture

**Modular monolith.** Microservices would spend the 7–10 day timeline on
service discovery, inter-service auth, and deployment orchestration instead
of building the product. A modular monolith gives clean module boundaries
(`auth`, `listings`, `ai`, `storage`, `users`) communicating only through
defined interfaces, without the operational tax of microservices.

## 2. Repository Strategy

**Single monorepo**, two top-level folders (`client/`, `server/`), plus
`docs/`. Branching: `main` as the always-deployable branch, short-lived
feature branches merged via PR-to-self. No gitflow/develop branch needed.

## 3. Project Scalability

- Images stored as an array from day one (`images: [{ url, publicId }]`),
  even though V1 uses only one.
- AI output stored as structured, versioned data (which model/provider
  generated a listing, plus the raw structured response).
- Listing status as an extensible enum, not a boolean.
- Notifications/analytics deferred without baking in assumptions that
  actively resist adding them later.

## 4. Loose Coupling

- Layered structure per module: `routes → controller → service →
  repository`.
- Provider adapter pattern for AI and image storage — a small interface
  (e.g., `AIProvider.generateListing(...)`) with one concrete implementation
  per provider.
- Validation as its own layer, invoked at the route boundary.
- Lightweight dependency injection via constructor/factory injection — no DI
  framework needed.

## 5. Infrastructure

| Layer | Choice |
|---|---|
| Frontend hosting | Vercel |
| Backend hosting | Render (free tier) |
| Database | MongoDB Atlas (free M0 cluster) |
| Image storage | Cloudinary (free tier) |
| Email | Skipped for MVP |
| AI provider | Gemini (see below) |

## 6. AI Strategy

**Gemini (Flash tier)** for Version 1: a genuinely usable free tier for both
vision and text generation, important given constant prompt iteration during
development. Build against an adapter interface so the provider is
swappable later without touching business logic.

## 7. Storage Strategy

**Cloudinary.** Ongoing free tier (not time-limited like S3's 12 months),
plus built-in image transforms (thumbnails, compression) with no extra code.

## 8. Database

**MongoDB.** Listing data has real shape variability (platform-style
variants, optional fields, AI-versioned metadata); a document model absorbs
that without constant migrations. Mongoose adds schema-level validation.

## 9. Security

Password hashing; short-lived JWTs with secrets in environment variables;
rate limiting (especially on the AI endpoint); input validation/sanitization
at every boundary; file upload MIME/size validation; explicit CORS; HTTPS
everywhere; no secrets in the client bundle; generic client-facing errors
with detailed logs server-side; basic dependency vulnerability checks.

## 10. Common Mistakes in AI SaaS MVPs

1. No rate limiting on AI calls → cost/quota surprises.
2. AI provider logic embedded directly in route handlers → hard to change later.
3. No graceful handling of AI failures/timeouts.
4. Treating AI price estimates as authoritative rather than clearly-labeled estimates.
5. Scope creep past the MVP feature list — the single biggest timeline risk.
6. Skipping empty/loading/error states "for now."
7. No environment separation (dev secrets/URLs leaking into demos).
8. Under-designing the data model for known-future fields.

## 11. Risks, Ranked

1. AI cost/output unpredictability
2. Timeline/scope creep
3. Free-tier platform limits (Render cold starts, Atlas 512MB, Cloudinary bandwidth)
4. Image upload reliability/performance
5. Security implementation gaps
6. Vendor lock-in (mitigated by the adapter pattern)

## 12. Final Recommendations

**Strongly recommend:** modular monolith, single monorepo, adapter/interface
pattern for AI and storage, Gemini free tier for development, images-as-array
and versioned AI output in the schema from the start.

**Avoid:** microservices, multi-repo, heavy DI frameworks, wiring provider
SDKs directly into business logic, adding V2 features opportunistically.

**Decide before writing any code:** final AI provider for initial
development, exact shape of the normalized AI response, whether email/
verification is in scope (recommended: no), rate-limiting thresholds for the
AI endpoint.
