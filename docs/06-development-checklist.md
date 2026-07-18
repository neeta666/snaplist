# SnapList — Development Checklist (Version 1)

Vertical-slice development per ADR 12. Every slice ends with `main` in a deployable state and something concretely testable. No code, commands, or scaffolding are included here — this is a planning/tracking checklist only.

---

## Slice 0 — Repository and Project Setup

**Goal:** A running, deployable skeleton with no features yet, but a working pipeline end to end.

**Backend tasks**
- [ ] Initialize monorepo with `client/`, `server/`, `docs/`
- [ ] Set up Express app skeleton, health-check route
- [ ] Configure environment variable loading and `.env.example`
- [ ] Connect to MongoDB Atlas
- [ ] Configure global error-handling middleware and standard response envelope helper

**Frontend tasks**
- [ ] Initialize React app with Tailwind configured
- [ ] Set up base routing and `AppLayout`/`AuthLayout` shells
- [ ] Configure API client base URL via environment variable

**Tests**
- [ ] Health-check endpoint returns 200 with the standard envelope
- [ ] Frontend builds and loads a blank shell without errors

**Acceptance criteria**
- [ ] Backend deployed to Render, reachable at a public URL
- [ ] Frontend deployed to Vercel, reachable at a public URL
- [ ] Frontend successfully calls the backend health-check endpoint across environments

**Documentation updates**
- [ ] `docs/` seeded with links to the four frozen documents (Project Plan, Architecture Review, Technical Design Document, API Contract)
- [ ] README skeleton with project name and one-line description

**Out of scope**
- Any actual feature (auth, listings, AI, dashboard)
- Any UI polish

---

## Slice 1 — Authentication

**Goal:** Users can register, log in, and access a protected endpoint.

**Backend tasks**
- [ ] `auth` module: register, login, `/auth/me`, logout endpoints per API Contract
- [ ] Password hashing
- [ ] JWT issuance and verification middleware
- [ ] User model/repository

**Frontend tasks**
- [ ] Register and Login pages/forms
- [ ] Auth state (token, current user) in global store
- [ ] `ProtectedRoute` wrapper
- [ ] Basic profile page consuming `/auth/me`

**Tests**
- [ ] Register with valid data succeeds; duplicate email returns `409`
- [ ] Login with valid/invalid credentials behaves per contract (`200`/`401`)
- [ ] Protected route rejects requests with missing/invalid/expired token (`401`)
- [ ] `/auth/me` returns the correct current user

**Acceptance criteria**
- [ ] A user can register, log in, refresh the page and remain authenticated (until token expiry), and log out
- [ ] Attempting a protected action while logged out redirects to login

**Documentation updates**
- [ ] README: how to register/log in locally
- [ ] Env var docs: JWT secret, expiry

**Out of scope**
- Password reset / email verification
- Refresh-token rotation

---

## Slice 2 — Image Upload and Cloudinary

**Goal:** A user can upload an image and get back a stored URL, independent of AI or listings.

**Backend tasks**
- [ ] `storage` module: Cloudinary provider adapter implementing the storage interface
- [ ] Upload endpoint (or internal service call) with file-type/size validation
- [ ] Delete-by-`publicId` capability in the adapter (for later use in Slice 5)

**Frontend tasks**
- [ ] `ImageUploader` shared component with preview
- [ ] Client-side file-type/size pre-check (backend remains the source of truth)

**Tests**
- [ ] Valid image upload returns a URL + `publicId`
- [ ] Oversized file returns `413`
- [ ] Invalid MIME type returns `422`

**Acceptance criteria**
- [ ] A user can select an image and see it uploaded and previewed before any AI step exists

**Documentation updates**
- [ ] Env var docs: Cloudinary keys
- [ ] README: image constraints (formats, max size)

**Out of scope**
- Multiple images
- Image replacement/deletion tied to a listing (that's Slice 5)

---

## Slice 3 — Gemini AI Generation

**Goal:** A user can generate an AI listing draft from an uploaded image, without saving it.

**Backend tasks**
- [ ] `ai` module: Gemini provider adapter implementing the AI interface
- [ ] Prompt templates per `platformStyle` (general baseline first; OLX/Facebook variants can follow in Slice 7, but the interface must support them now)
- [ ] `/listings/generate` endpoint per API Contract: validation, image upload, AI call, structured response validation
- [ ] Normalized error handling for AI failures/timeouts (`502`/`503`)
- [ ] AI generation rate limiting

**Frontend tasks**
- [ ] "New Listing" flow: image upload + optional detail fields + platform style selector
- [ ] Draft state management (holding the generated draft, including `estimatedPriceRange`, in memory)
- [ ] Loading and error states for the generation call

**Tests**
- [ ] Successful generation returns a structured draft matching the Canonical Listing shape's client-facing subset
- [ ] Malformed/unsafe AI output triggers the retry-then-error path, not a silent bad response
- [ ] Rate limit returns `429` after the configured threshold

**Acceptance criteria**
- [ ] A user can upload a photo, add optional details, and see a generated title/description/category/highlights/estimated price on screen
- [ ] Nothing is persisted to the database at this stage

**Documentation updates**
- [ ] Env var docs: Gemini API key
- [ ] README: AI generation flow description, rate limit note

**Out of scope**
- Saving listings
- Regeneration (Slice 5)
- Platform-style content differentiation quality (baseline only; refined in Slice 7)

---

## Slice 4 — Save and Retrieve Listings

**Goal:** Generated drafts can be edited and saved; saved listings can be listed and viewed.

**Backend tasks**
- [ ] `listings` module: Listing model/repository
- [ ] `POST /listings` (Save) with full validation per API Contract, including strict `estimatedPriceRange` validation
- [ ] `GET /listings` (paginated, filtered per section 0.5 of the API Contract)
- [ ] `GET /listings/:id` with uniform `404` ownership handling (query by id + userId together)

**Frontend tasks**
- [ ] Editable form pre-filled from the generated draft (title, description, category, highlights, condition, brand, age, originalPrice, askingPrice seeded from `estimatedPriceRange`, platformStyle)
- [ ] Save action wired to `POST /listings`
- [ ] Listing list view (basic cards, no dashboard polish yet)
- [ ] Listing detail view

**Tests**
- [ ] Save with valid data returns `201` and the Canonical Listing object
- [ ] Save with invalid `askingPrice`/`estimatedPriceRange` returns `422`
- [ ] Get single listing for another user's listing returns `404`
- [ ] Get all listings only returns the current user's listings

**Acceptance criteria**
- [ ] End-to-end: upload → generate → edit → save → see it in a list → open its detail view

**Documentation updates**
- [ ] README: core user flow now fully walkable end-to-end

**Out of scope**
- Edit after save, delete, status changes (Slice 5)
- Search/filter/sort UI (Slice 6)

---

## Slice 5 — Edit, Status Change, and Delete

**Goal:** Full CRUD on listings, plus regeneration, respecting all V1 immutability rules.

**Backend tasks**
- [ ] `PATCH /listings/:id` (Update) per API Contract, including accepting `estimatedPriceRange` after regeneration with strict validation
- [ ] `DELETE /listings/:id` returning `200` with the standard envelope (not `204`), including Cloudinary asset deletion (non-blocking on failure)
- [ ] `POST /listings/:id/regenerate` per API Contract
- [ ] **Explicitly ensure `aiMeta.generatedAt` is only set on Save and on a Regenerate-driven Update — never touched by ordinary field edits or status changes** (e.g., editing title, changing status draft→active→sold must leave `aiMeta.generatedAt` untouched)
- [ ] Confirm `image` is rejected on Update in any form (immutable per ADR 13)
- [ ] Ownership enforced uniformly (`404` for not-found and not-owned) across all three endpoints

**Frontend tasks**
- [ ] Edit form for existing listings
- [ ] Status change control (draft/active/sold)
- [ ] Delete action with confirmation dialog
- [ ] "Regenerate" action that fetches a new draft and lets the user review before saving via Update

**Tests**
- [ ] Editing title/description/status does **not** change `aiMeta.generatedAt` — explicit regression test for this
- [ ] Regenerate → Update **does** update `aiMeta.generatedAt` and `estimatedPriceRange`
- [ ] Deleting a listing removes it from subsequent `GET /listings` calls and returns `200` with `data: null`
- [ ] Editing/deleting another user's listing returns `404`
- [ ] Submitting an `image` field on Update has no effect / is rejected

**Acceptance criteria**
- [ ] A user can edit, change status, delete, and regenerate any listing they own; cannot do any of these to a listing they don't own
- [ ] `aiMeta.generatedAt` behavior matches the rule above under manual verification

**Documentation updates**
- [ ] README: note on image immutability and the "delete and regenerate for a new photo" workflow

**Out of scope**
- Any image-replacement endpoint (explicitly not part of V1, per ADR 13)
- Bulk edit/delete

---

## Slice 6 — Dashboard, Search, Filters, and Statistics

**Goal:** A usable dashboard with search, filtering, sorting, and summary stats.

**Backend tasks**
- [ ] `GET /dashboard/stats` per API Contract (counts by status, by category)
- [ ] Confirm `sortBy=price` sorts by `askingPrice` (not `estimatedPriceRange`)
- [ ] Indexes in place for `userId`, `{userId, status}`, `{userId, category}` per Technical Design Document

**Frontend tasks**
- [ ] Dashboard page: summary cards (total/draft/active/sold)
- [ ] Status-distribution chart
- [ ] Search input, status/category/platformStyle filters, sort control
- [ ] Pagination controls

**Tests**
- [ ] Stats reflect actual counts across statuses/categories for the current user only
- [ ] Search matches title (and description, if implemented) correctly
- [ ] Combined filters (status + category + search) return the correct subset
- [ ] Sorting by price reflects `askingPrice` order

**Acceptance criteria**
- [ ] A user with several listings can find any specific one via search/filter within a few seconds, and see accurate summary numbers at a glance

**Documentation updates**
- [ ] README: dashboard feature description with a screenshot placeholder

**Out of scope**
- Any price aggregation/statistics beyond counts (per API Contract's dashboard notes)
- Saved filter presets

---

## Slice 7 — Platform-Specific Generation Styles

**Goal:** Generated content meaningfully differs in tone/formatting across General, OLX, and Facebook Marketplace styles.

**Backend tasks**
- [ ] Refine the three prompt templates in the `ai` module for genuinely distinct tone/formatting (not just a label difference)
- [ ] Confirm Regenerate correctly applies a changed `platformStyle` if provided

**Frontend tasks**
- [ ] Platform style selector surfaced clearly in both Generate and Regenerate flows
- [ ] Visual indication of which style a saved listing was generated for

**Tests**
- [ ] Generating the same image/details with different `platformStyle` values produces visibly different tone/structure in manual review
- [ ] Regenerating with a new `platformStyle` updates the draft accordingly

**Acceptance criteria**
- [ ] A reviewer can tell, without being told, which platform style a given generated listing targets

**Documentation updates**
- [ ] README: example of the same item generated in two different platform styles (screenshots)

**Out of scope**
- Actual publishing/integration with OLX or Facebook APIs (explicitly not part of SnapList per the Project Plan's "What This Project Is NOT" section)

---

## Slice 8 — UI States and Polish

**Goal:** The application feels like a complete, professional SaaS product across every screen.

**Backend tasks**
- [ ] Confirm all error responses carry messages specific enough for good frontend error states (no generic "error" strings on validation failures)

**Frontend tasks**
- [ ] Loading skeletons for all data-fetching views (dashboard, listing list, listing detail)
- [ ] Empty states (no listings yet, no search results)
- [ ] Error states (failed generation, failed save, network errors)
- [ ] Success notifications/toasts (save, delete, status change)
- [ ] Responsive layout pass across mobile/tablet/desktop breakpoints
- [ ] Consistent loading indicators during AI generation specifically (this call is the slowest in the app)

**Tests**
- [ ] Manual walkthrough of every screen in each of: loading, empty, error, and populated states
- [ ] Responsive check at common breakpoints

**Acceptance criteria**
- [ ] No screen in the app ever shows a blank/broken state during loading, emptiness, or an error — each has a designed treatment

**Documentation updates**
- [ ] README: polished screenshots replacing any placeholders

**Out of scope**
- New features — this slice is refinement of existing screens only

---

## Slice 9 — Security, Testing, and Hardening

**Goal:** The application is safe to demo publicly and reasonably resilient to misuse.

**Backend tasks**
- [ ] Rate limiting confirmed on `/listings/generate`, `/listings/:id/regenerate`, and `/auth/login`
- [ ] Helmet enabled; CORS restricted to the deployed frontend origin + localhost
- [ ] Confirm no secrets appear in any response body, log line, or client bundle
- [ ] Confirm ownership checks happen at the service layer, not just via query filters, for every listing endpoint
- [ ] Confirm `estimatedPriceRange` validation rejects malformed values (currency, negativity, min/max ordering) rather than silently correcting them
- [ ] Review `npm audit` (or equivalent) output for known vulnerable dependencies

**Frontend tasks**
- [ ] Confirm tokens are never logged or exposed in the UI
- [ ] Confirm form validation errors map cleanly from the backend's structured error array

**Tests**
- [ ] Integration test: register → login → generate → save → fetch → edit → delete, end to end
- [ ] Edge case: large (near-limit) image upload
- [ ] Edge case: expired token on a protected request
- [ ] Edge case: attempting to edit/delete another user's listing
- [ ] Edge case: AI provider failure/timeout simulated, confirming graceful error handling
- [ ] Unit tests: listing service ownership logic, AI response validation/parsing logic

**Acceptance criteria**
- [ ] All edge cases above behave per the API Contract, verified manually or via test
- [ ] No sensitive data leak found in a manual review pass of responses/logs

**Documentation updates**
- [ ] README: brief security-practices summary
- [ ] Testing section in README describing what's covered and how to run tests

**Out of scope**
- Full penetration testing
- Automated load/performance testing

---

## Slice 10 — Deployment, Documentation, and Final QA

**Goal:** A fully deployed, documented, demo-ready Version 1.

**Backend tasks**
- [ ] Final production environment variables confirmed on Render
- [ ] MongoDB Atlas network access and credentials confirmed for production
- [ ] Confirm cold-start behavior is acceptable and documented for demo purposes

**Frontend tasks**
- [ ] Final production environment variables confirmed on Vercel
- [ ] Full production walkthrough of the entire user flow against live deployed services

**Tests**
- [ ] Full manual QA pass on the deployed (not local) environment: register → generate (all three platform styles) → save → edit → status change → search/filter → delete → dashboard stats accuracy
- [ ] Confirm `aiMeta.generatedAt` behavior (Slice 5's rule) holds true in production, not just locally

**Acceptance criteria**
- [ ] A reviewer with no prior context can complete the full core workflow using only the deployed links and README instructions

**Documentation updates**
- [ ] Final README pass (see Version 1 Release Checklist below)
- [ ] `docs/` folder contains final versions of all four frozen planning documents plus this checklist

**Out of scope**
- Any Version 2 feature from the Project Plan's future-ideas list

---

## Version 1 Release Checklist

### Functionality
- [ ] Full core workflow (Upload → AI Generate → Edit → Save → Manage) works end to end in production
- [ ] All three platform styles (general/OLX/Facebook) produce distinguishable content
- [ ] Search, filter, and sort all function correctly against real data
- [ ] Dashboard stats are accurate
- [ ] Status transitions (draft/active/sold) work correctly
- [ ] Delete removes both the listing record and its Cloudinary asset (or logs a non-blocking failure)
- [ ] `aiMeta.generatedAt` is confirmed to remain unchanged across ordinary edits and status changes, and to update only on Save/Regenerate-driven Update

### Security
- [ ] JWT auth enforced on all protected routes
- [ ] Rate limiting active on AI and login endpoints
- [ ] CORS restricted to known origins
- [ ] No secrets present in any client bundle, log, or response body
- [ ] Ownership checks verified on every listing read/write endpoint

### Testing
- [ ] Core integration test suite passing
- [ ] Key unit tests (services, AI response validation) passing
- [ ] All manual edge cases from Slice 9 re-verified once more before release

### Deployment
- [ ] Frontend live on Vercel
- [ ] Backend live on Render
- [ ] MongoDB Atlas production cluster connected and reachable
- [ ] Cloudinary and Gemini production credentials confirmed working

### README
- [ ] Project description and screenshots
- [ ] Setup instructions (local dev)
- [ ] Live demo links (frontend + optionally backend health check)
- [ ] Feature list matching what's actually shipped (no aspirational/unshipped features listed)
- [ ] Known limitations section (single image, no marketplace publishing, etc. — matching the Project Plan's "What This Is NOT")

### Environment-Variable Documentation
- [ ] `.env.example` present and accurate for both `client/` and `server/`
- [ ] Every required variable documented with a one-line description (no actual secret values committed)

### Demo Data
- [ ] A small set of realistic seed listings (varied categories, statuses, platform styles) available for demo/screenshot purposes
- [ ] Demo account credentials (if applicable) documented for reviewers, without exposing them in the public repo if sensitive

### Resume-Ready Screenshots
- [ ] Dashboard view
- [ ] Generate flow (upload + AI result)
- [ ] Listing detail/edit view
- [ ] At least one screenshot showing platform-style differentiation
- [ ] Mobile-responsive view

### Final GitHub Repository Review
- [ ] Clean commit history (no leftover debug commits with secrets)
- [ ] No `.env` files committed
- [ ] `docs/` folder complete with all planning documents
- [ ] Repository description and topics/tags set for discoverability
- [ ] License file present (if intended to be public)

---

*This checklist tracks implementation against the four frozen documents (Project Plan, Architecture Review, Technical Design Document, API Contract Specification) and the ADR summary. No architecture, API contract, or scope decisions are altered by this checklist.*
