# SnapList — Technical Design Document (Version 1)

> ⚠️ **RECONSTRUCTED DOCUMENT — NOT THE AUTHORITATIVE ORIGINAL**
> This file was reconstructed from conversation history when populating
> `docs/` during Slice 0. It was not re-derived from or diffed against the
> original approved file, and may not be byte-for-byte identical to it —
> some sections were also deliberately condensed (e.g. section 9 points to
> the API Contract rather than repeating it) rather than reproduced in full.
> **This file must be replaced with the exact original approved Technical
> Design Document before being treated as a frozen, authoritative source.**
> Do not cite this reconstruction as the frozen original in any future
> decision-making until it has been replaced or explicitly verified against
> the true original.

**Architecture basis:** Modular Monolith · Single Monorepo · Provider Adapter Pattern · Vertical Slice Development
**Scope:** Solo developer, 7–10 working days, strict MVP

---

## 1. High-Level System Architecture

**Image Upload → AI Generation → Save:** request → validation → `listings`
controller → `listings` service orchestrates the Storage Provider Adapter
(Cloudinary upload) and the AI Provider Adapter (Gemini) → normalized draft
returned to the frontend, **not yet saved**. On "Save," the edited listing is
validated again and persisted via the `listings` repository.

**Dashboard Retrieval:** request → validation (query params) → controller →
service (ownership scoping) → repository (filtered/indexed MongoDB query) →
response.

**Authentication:** Register/Login hit the `auth` module directly; a JWT is
issued on success. Protected routes pass through a verification middleware
before reaching any controller.

No layer skips the one below it, and no module reaches into another
module's internals — the `listings` service never imports the Cloudinary or
Gemini SDKs directly, only the adapter interfaces.

## 2. Module Responsibilities

| Module | Responsibility |
|---|---|
| `auth` | Registration, login, JWT issuance/verification, current-user resolution |
| `users` | User profile data (model + repository only) |
| `listings` | Core business logic: create/edit/save/status, dashboard queries |
| `ai` (provider) | Normalizes calls to the active AI provider |
| `storage` (provider) | Normalizes image upload/delete calls |

Modules communicate only through public service interfaces — never by
importing another module's repository or provider directly.

## 3. Frontend Design

**Pages:** Register/Login, Dashboard, New Listing (guided upload → generate
→ edit → save flow), Listing Detail/Edit, Profile.

**Layouts:** `AuthLayout` (centered card), `AppLayout` (nav + content, wraps
all authenticated pages).

**Shared components:** `ListingCard`, `StatusBadge`, `ImageUploader`,
`LoadingSkeleton`, `EmptyState`, `Toast`, `ConfirmDialog`.

**Global state:** lightweight store (Zustand) for auth (current user, token).

**Server state:** React Query for all data fetching/caching.

**Form handling:** React Hook Form + Zod.

**Route protection:** `ProtectedRoute` wrapper checking auth state
client-side; real enforcement always happens server-side.

## 4. Backend Design (layer responsibilities)

| Layer | Allowed | Not allowed |
|---|---|---|
| Routes | Define endpoint + method, wire middleware | Business logic |
| Validation | Check shape/type/size | Touch DB, call providers |
| Controllers | Parse request, call service, shape response | Business logic, call repositories/providers directly |
| Services | All business logic; orchestrate repositories + providers; enforce ownership | Know about HTTP req/res, specific provider SDKs |
| Repositories | Only layer allowed to query/write the DB | Business logic, call external providers |
| Providers | Wrap a specific external SDK behind a normalized interface | Business logic |

## 5. Database Design

**User:** `_id`, `email` (unique, indexed), `passwordHash`, `name`,
timestamps.

**Listing:** `_id`, `userId` (indexed), `title`, `description`, `category`,
`highlights: [String]`, `askingPrice`, `estimatedPriceRange: {min, max,
currency}`, `condition`, `brand`, `age`, `originalPrice`, `platformStyle`
enum, `status` enum (`draft|active|sold`), `image: {url, publicId}` (stored
internally as a one-element `images` array for forward compatibility per the
API Contract), `aiMeta: {provider, model, rawResponse, generatedAt}`,
timestamps.

**Relationships:** one-to-many `User → Listings` via `userId` reference, not
embedding.

**Indexes:** `users.email` (unique); `listings.userId`;
`listings.{userId, status}`; `listings.{userId, category}`.

## 6. AI Generation Flow

Controller receives an image URL + optional details → service calls
`AIProvider.generateListing(...)`. One prompt template per `platformStyle`,
stored in the `ai` module. Response is validated against a schema before
ever reaching the service; malformed/timeout errors are normalized into a
single `AIGenerationError`. One automatic retry on JSON-parse failure;
beyond that, surface a "regenerate" action to the user. Regeneration re-runs
the same service method and updates `aiMeta`.

## 7. Image Upload Flow

MIME type + size validated before the file reaches the storage provider.
Upload handled entirely inside the Storage Provider Adapter. Metadata
(`url`, `publicId`) saved on the listing. **Per the API Contract, V1 has no
image-replacement path** — a saved listing's image is immutable; a new photo
requires deleting and regenerating the listing. On listing delete, the
Storage Provider Adapter is instructed to remove the Cloudinary asset;
failures are logged but non-blocking.

## 8. Authentication Flow

Register/Login issue a JWT on success. Logout is a client-side token
discard (JWTs are stateless in V1 — no refresh-token rotation). A `/me`
endpoint resolves the current user from the verified token. Short-lived
access tokens (1–2 hours) are sufficient for MVP scope.

## 9. API Design

The complete endpoint list, request/response shapes, and validation rules
are defined in full in the **API Contract Specification** (`04-api-
contract.md`) — that document is the single source of truth and is not
duplicated here.

## 10. Error Handling Strategy

Validation errors → `400`/`422` with structured `{field, message}` lists.
Auth errors → `401`/ownership handled per the API Contract's uniform `404`
rule. AI/storage errors normalized and never leak raw provider text. DB
errors caught at the repository boundary and rethrown generically. A single
global Express error-handling middleware is the last line of defense.

## 11. Security Strategy

JWT with short expiry; rate limiting (especially the AI generation
endpoint); file validation before upload; secrets only in environment
variables; ownership checks at the service layer on every listing
read/write; explicit CORS allow-list; Helmet; structured server-side
logging (never logging secrets); no sensitive data in any response body.

## 12. Project Folder Structure

```
snaplist/
├── client/
│   └── src/{pages, layouts, components, hooks, store, lib, schemas}
├── server/
│   └── src/{modules/{auth,users,listings}, providers/{ai,storage}, middleware, config, routes}
└── docs/
```

(See the repository's actual `client/` and `server/` trees for the current,
authoritative structure — this is a summary, not a duplicate.)

## 13. Development Order (Vertical Slices)

Slice 0 (setup) → 1 (auth) → 2 (image upload) → 3 (AI generation, no save)
→ 4 (save & retrieve) → 5 (edit/delete/regenerate) → 6 (dashboard) → 7
(platform styles) → 8 (UI polish) → 9 (security/testing) → 10 (deployment &
final QA). Full detail, including tasks/tests/acceptance criteria per slice,
is in the **Development Checklist** (`06-development-checklist.md`).

## 14. Testing Strategy

Unit tests on services and provider adapters; a small set of integration
tests covering the main API flows end to end; manual testing carries real
weight given the timeline — walk the full user flow after each slice, not
just at the end.

## 15. Deployment Strategy

`client/` → Vercel; `server/` → Render; MongoDB Atlas (free M0); Cloudinary
and Gemini credentials as backend-only environment variables. The browser
never talks to Mongo, Cloudinary, or Gemini directly — only to the Render
backend.

## 16. Definition of Done (Version 1)

See the **Development Checklist**'s Version 1 Release Checklist
(`06-development-checklist.md`) for the complete, authoritative list.
