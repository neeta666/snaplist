# SnapList — API Contract Specification (Version 1, Revised)

Technology: **JavaScript** (`.js` / `.jsx` throughout — no TypeScript).
This document is the frozen contract between frontend and backend. Architecture decisions from prior documents are not revisited here. This revision supersedes the previous version of this document in full.

---

## 0. Global Conventions (read first)

### 0.1 Base URL
```
https://api.snaplist.app/api/v1
```
(local dev: `http://localhost:5000/api/v1`)

### 0.2 Standard Response Envelope

**Every single endpoint in this document, with no exceptions, returns one of these two shapes** — including deletes, logouts, and empty-data responses.

**Success:**
```json
{
  "success": true,
  "message": "Listing created successfully",
  "data": { }
}
```

**Error:**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "email", "message": "Email is required" }
  ]
}
```

`errors` is always an array — empty or omitted only when the error isn't field-specific (e.g., a generic auth or server error), but the envelope shape itself never changes. `data` is `null` (not omitted) when there is genuinely nothing to return, as in Delete Listing and Logout.

### 0.3 Standard Headers

| Header | Applies to | Example |
|---|---|---|
| `Content-Type` | All JSON requests | `application/json` |
| `Content-Type` (upload) | Image upload endpoints | `multipart/form-data` |
| `Authorization` | All protected endpoints | `Bearer <jwt_token>` |

### 0.4 Pagination Format

Query params: `?page=1&limit=10`

Response `data` shape for any paginated list:
```json
{
  "items": [ ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalItems": 47,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```
Defaults: `page=1`, `limit=10`, `limit` max `50`.

### 0.5 Search, Sort, Filter Parameters (Listings)

| Param | Type | Example | Notes |
|---|---|---|---|
| `search` | string | `?search=iphone` | Matches against `title` (and optionally `description`) |
| `status` | enum | `?status=active` | One of `draft`, `active`, `sold` |
| `category` | string | `?category=electronics` | Exact match |
| `platformStyle` | enum | `?platformStyle=olx` | One of `general`, `olx`, `facebook` |
| `sortBy` | enum | `?sortBy=createdAt` | One of `createdAt`, `price`, `title` |
| `sortOrder` | enum | `?sortOrder=desc` | `asc` or `desc`, default `desc` |

**`sortBy=price` sorts by `askingPrice`** — the user-set displayed price — not by `estimatedPriceRange`, since the estimate is not a single sortable number and is not the value shown as "the price" in listing cards.

All filters are combinable and always implicitly scoped to `userId = current user` — a user never sees another user's listings via any combination of these params.

### 0.6 Enum Values

- **Listing status:** `draft` | `active` | `sold`
- **Platform style:** `general` | `olx` | `facebook`
- **Condition:** `new` | `like_new` | `good` | `fair`
  - These are the only machine-readable values transmitted over the API. The frontend is responsible for mapping them to human-friendly display labels (e.g., `like_new` → "Like New"); the backend never sends display labels.

### 0.7 Upload & Content Limits

| Item | Limit |
|---|---|
| Accepted image formats | `image/jpeg`, `image/png`, `image/webp` |
| Max image size | 8 MB |
| Max images per listing | **Exactly 1 in V1** (see section 3.8 on the `image` field) |
| Title max length | 100 characters |
| Description max length | 2000 characters |
| Highlights | max 6 items, 80 characters each |
| Category max length | 50 characters |
| Brand max length | 50 characters |
| Age max length | 30 characters (free-text, e.g. "2 years", "6 months") |
| AI generation rate limit | 10 requests / hour / user |
| AI regeneration rate limit | shares the same bucket as generation |
| Login attempt rate limit | 10 attempts / 15 min / IP |

### 0.8 Currency

SnapList V1 targets the Indian marketplace, including OLX India. **All price values use `"INR"` as the currency**, and all examples in this document use INR amounts. The `currency` field is still transmitted explicitly on every price object (rather than assumed) so the schema doesn't need a breaking change if multi-currency support is ever considered — but for V1, the backend always sets and expects `"INR"`.

### 0.9 HTTP Status Codes Used

| Code | Meaning | Used when |
|---|---|---|
| 200 | OK | Successful GET/PATCH/POST/DELETE that returns the standard envelope |
| 201 | Created | Successful resource creation (register, save listing) |
| 400 | Bad Request | Malformed request (bad JSON, structurally broken payload) |
| 401 | Unauthorized | Missing/invalid/expired token, bad login credentials |
| 403 | Forbidden | *(Reserved — not used for listing ownership in V1; see section 5)* |
| 404 | Not Found | Resource doesn't exist, or exists but doesn't belong to the requesting user, or an invalid ObjectId was supplied |
| 409 | Conflict | Duplicate resource (e.g., email already registered) |
| 413 | Payload Too Large | Image exceeds max upload size |
| 422 | Unprocessable Entity | Request is well-formed JSON but fails field-level validation |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Unhandled server/database error |
| 502 | Bad Gateway | AI provider call failed/errored |
| 503 | Service Unavailable | AI provider or storage provider temporarily unreachable |

Note: `204 No Content` is deliberately **not used anywhere** in this API — every successful response, including deletes, carries the standard envelope (see section 3.6).

---

## 1. Canonical Listing Response Object

Every endpoint that returns listing data returns it in this exact shape, wrapped under a `listing` key (or inside `items[]` for list endpoints). This is the single source of truth for listing field shape — endpoint sections below reference it rather than repeating it.

```json
{
  "id": "65a1b2c3d4e5f6a7b8c9d0e1",
  "userId": "64f9a8b7c6d5e4f3a2b1c0d9",
  "title": "iPhone 12 - Excellent Condition, Unlocked",
  "description": "A well-maintained iPhone 12, gently used with no visible damage...",
  "category": "Electronics",
  "highlights": ["128GB storage", "Unlocked", "Minor wear"],
  "condition": "good",
  "brand": "Apple",
  "age": "2 years",
  "originalPrice": 45000,
  "askingPrice": 22000,
  "estimatedPriceRange": { "min": 20000, "max": 24000, "currency": "INR" },
  "platformStyle": "olx",
  "status": "draft",
  "image": { "url": "https://res.cloudinary.com/snaplist/abc123.jpg", "publicId": "snaplist/abc123" },
  "aiMeta": {
    "provider": "gemini",
    "model": "gemini-1.5-flash",
    "generatedAt": "2026-07-14T09:00:00Z"
  },
  "createdAt": "2026-07-14T09:00:00Z",
  "updatedAt": "2026-07-14T09:05:00Z"
}
```

### Field control table

| Field | Control | Notes |
|---|---|---|
| `id` | Server-controlled | Assigned on creation, never editable |
| `userId` | Server-controlled | Derived from the authenticated token, never accepted from the client |
| `title` | Client-editable | AI-generated initially, user may edit before/after save |
| `description` | Client-editable | Same as above |
| `category` | Client-editable | Same as above |
| `highlights` | Client-editable | Same as above |
| `condition` | Client-editable | Must be a valid enum value (section 0.6) |
| `brand` | Client-editable | Optional |
| `age` | Client-editable | Optional |
| `originalPrice` | Client-editable | Optional, informational only |
| `askingPrice` | Client-editable | The price actually displayed on the listing; user sets or edits it, commonly seeded from `estimatedPriceRange` on the frontend |
| `estimatedPriceRange` | **AI-originated content, client-carried** | Produced by AI Generate/Regenerate and returned to the client; the client carries this value forward and may submit it on Save/Update, where the backend validates it strictly (see section 6) — this is listing content, not security-sensitive provenance metadata |
| `platformStyle` | Client-editable | Required |
| `status` | Client-editable | Defaults to `draft` |
| `image` | Set once at Save, then immutable | **V1 has no image-replacement path.** A saved listing's image can never be changed; a user who needs a different image must delete the listing and generate a new one (see section 3.8) |
| `aiMeta` | **Server-controlled** | `provider` and `model` are fixed server-side configuration; `generatedAt` is a server timestamp. None of these three sub-fields are ever accepted from the client (see section 6) |
| `createdAt` / `updatedAt` | Server-controlled | Standard timestamps |

---

## 2. Authentication Endpoints

### 2.1 Register

- **URL:** `/auth/register`
- **Method:** `POST`
- **Auth required:** No

**Request Body:**
```json
{
  "name": "Jordan Lee",
  "email": "jordan@example.com",
  "password": "SecurePass123"
}
```

**Validation Rules:**
- `name`: required, string, 2–60 characters
- `email`: required, valid email format, unique
- `password`: required, min 8 characters, at least 1 number

**Success Response — 201:**
```json
{
  "success": true,
  "message": "Account created successfully",
  "data": {
    "user": { "id": "64f...", "name": "Jordan Lee", "email": "jordan@example.com" },
    "token": "eyJhbGciOi..."
  }
}
```

**Error Responses:**
- `422` — validation failure (per-field errors)
- `409` — email already registered
- `500` — unexpected server error

**Notes:** Password is never included in any response, ever.

---

### 2.2 Login

- **URL:** `/auth/login`
- **Method:** `POST`
- **Auth required:** No

**Request Body:**
```json
{ "email": "jordan@example.com", "password": "SecurePass123" }
```

**Validation Rules:** both fields required; no format leniency that reveals which field was wrong.

**Success Response — 200:**
```json
{
  "success": true,
  "message": "Logged in successfully",
  "data": {
    "user": { "id": "64f...", "name": "Jordan Lee", "email": "jordan@example.com" },
    "token": "eyJhbGciOi..."
  }
}
```

**Error Responses:**
- `422` — missing fields
- `401` — invalid email or password (deliberately generic)
- `429` — too many login attempts
- `500` — unexpected server error

---

### 2.3 Current User

- **URL:** `/auth/me`
- **Method:** `GET`
- **Auth required:** Yes

**Success Response — 200:**
```json
{
  "success": true,
  "message": "User fetched successfully",
  "data": {
    "user": { "id": "64f...", "name": "Jordan Lee", "email": "jordan@example.com", "createdAt": "2026-06-01T10:00:00Z" }
  }
}
```

**Error Responses:**
- `401` — missing/invalid/expired token
- `500` — unexpected server error

---

### 2.4 Logout

- **URL:** `/auth/logout`
- **Method:** `POST`
- **Auth required:** Yes

**Success Response — 200:**
```json
{ "success": true, "message": "Logged out successfully", "data": null }
```

**Notes:** JWTs are stateless in V1; this endpoint exists for a consistent frontend contract. Actual logout is enforced client-side by discarding the token.

**Error Responses:**
- `401` — missing/invalid token

---

## 3. Listings Endpoints

### 3.1 Generate AI Listing (draft, not saved)

- **URL:** `/listings/generate`
- **Method:** `POST`
- **Auth required:** Yes

**Request Headers:** `Authorization: Bearer <token>`, `Content-Type: multipart/form-data`

**Request Body (multipart fields):**
```
image: <file>                                         (required)
condition: "new" | "like_new" | "good" | "fair"        (optional)
brand: string                                          (optional)
age: string                                            (optional)
originalPrice: number                                  (optional)
platformStyle: "general" | "olx" | "facebook"          (required)
```

**Validation Rules:**
- `image`: required, jpeg/png/webp, max 8MB
- `platformStyle`: required, valid enum
- `condition`: optional, must be a valid enum value if present
- `brand`: optional, max 50 characters
- `age`: optional, max 30 characters
- `originalPrice`: optional, number, `>= 0`

**Success Response — 200:**
```json
{
  "success": true,
  "message": "Listing draft generated successfully",
  "data": {
    "draft": {
      "title": "iPhone 12 - Excellent Condition, Unlocked",
      "description": "A well-maintained iPhone 12, gently used with no visible damage...",
      "category": "Electronics",
      "highlights": ["128GB storage", "Unlocked", "Minor wear"],
      "estimatedPriceRange": { "min": 20000, "max": 24000, "currency": "INR" },
      "image": { "url": "https://res.cloudinary.com/snaplist/abc123.jpg", "publicId": "snaplist/abc123" }
    }
  }
}
```

**Error Responses:**
- `422` — validation failure (bad platformStyle, missing image, invalid condition)
- `413` — image too large
- `429` — AI generation rate limit exceeded
- `502` — AI provider call failed
- `503` — AI or storage provider temporarily unavailable
- `500` — unexpected server error

**Notes:**
- This endpoint uploads the image to Cloudinary as part of the flow and returns its URL, along with `estimatedPriceRange` as AI-originated listing content for the client to carry forward. **It does not persist a listing document.** It **does not return `aiMeta`** — `provider`, `model`, and generation timestamps are server-controlled and only ever attached by the backend itself when the listing is saved (see section 6); the client never sees or handles them.
- No temporary server-side generation store is introduced for this step (no queue, no Redis, no draft-persistence layer). The frontend is responsible for holding the returned draft — including `estimatedPriceRange` — in memory/local component state until the user calls Save Listing (3.2). If the user abandons the flow, the draft is simply lost — acceptable for MVP scope, and the uploaded image may become an orphaned Cloudinary asset (a low-severity, previously-noted cleanup item, not a data-integrity issue).

---

### 3.2 Save Listing

- **URL:** `/listings`
- **Method:** `POST`
- **Auth required:** Yes

**Request Body:**
```json
{
  "title": "iPhone 12 - Excellent Condition, Unlocked",
  "description": "A well-maintained iPhone 12, gently used with no visible damage...",
  "category": "Electronics",
  "highlights": ["128GB storage", "Unlocked", "Minor wear"],
  "condition": "good",
  "brand": "Apple",
  "age": "2 years",
  "originalPrice": 45000,
  "askingPrice": 22000,
  "estimatedPriceRange": { "min": 20000, "max": 24000, "currency": "INR" },
  "platformStyle": "olx",
  "status": "draft",
  "image": { "url": "https://res.cloudinary.com/snaplist/abc123.jpg", "publicId": "snaplist/abc123" }
}
```

**Client-editable vs. server-controlled on this endpoint:**
- The client submits the **generated/edited listing content** shown above — this is the full set of client-editable fields from the Canonical Listing Response Object (section 1), plus `estimatedPriceRange`.
- `estimatedPriceRange` is AI-originated listing content, not security-sensitive provenance metadata: it's the value the client received from Generate (3.1) or Regenerate (3.7) and is carrying forward. The backend does not treat it as "trusted because the server said so" — it **strictly validates** it on every Save/Update (see section 6) rather than blindly persisting whatever the client sends.
- The client **does not** submit `aiMeta`. `aiMeta.provider`, `aiMeta.model`, and the generation timestamp are assigned entirely by the backend and are ignored/stripped if a client sends them — these remain genuinely server-controlled, unlike `estimatedPriceRange` (see section 6).
- `userId` is always derived from the authenticated token, never accepted from the body.

**Validation Rules:**
- `title`: required, max 100 chars
- `description`: required, max 2000 chars
- `category`: required, string, max 50 characters
- `highlights`: optional, max 6 items, 80 chars each
- `condition`: optional, valid enum value if present
- `brand`: optional, max 50 characters
- `age`: optional, max 30 characters
- `originalPrice`: optional, number, `>= 0`
- `askingPrice`: required, number, `>= 0`
- `estimatedPriceRange`: optional; if present: `currency` must be exactly `"INR"`, `min` and `max` must both be numbers, both `>= 0`, and `min <= max` — a failing value is rejected with `422`, not silently corrected
- `platformStyle`: required, valid enum
- `status`: optional, defaults to `draft`, valid enum if present
- `image`: required, must include `url` and `publicId`

**Success Response — 201:**
```json
{
  "success": true,
  "message": "Listing saved successfully",
  "data": { "listing": { "...": "Canonical Listing Response Object, section 1" } }
}
```

**Error Responses:**
- `422` — validation failure
- `401` — missing/invalid token
- `500` — unexpected server error

---

### 3.3 Get All Listings

- **URL:** `/listings`
- **Method:** `GET`
- **Auth required:** Yes

**Query Parameters:** `page`, `limit`, `search`, `status`, `category`, `platformStyle`, `sortBy`, `sortOrder` (see sections 0.4 / 0.5)

**Success Response — 200:**
```json
{
  "success": true,
  "message": "Listings fetched successfully",
  "data": {
    "items": [
      { "...": "Canonical Listing Response Object, section 1" }
    ],
    "pagination": { "page": 1, "limit": 10, "totalItems": 12, "totalPages": 2, "hasNextPage": true, "hasPrevPage": false }
  }
}
```

**Error Responses:**
- `422` — invalid query param values (e.g., bad enum for `status`)
- `401` — missing/invalid token
- `500` — unexpected server error

**Notes:** Always implicitly filtered to `userId = current user`.

---

### 3.4 Get Single Listing

- **URL:** `/listings/:id`
- **Method:** `GET`
- **Auth required:** Yes

**Path Parameters:** `id` — must be a syntactically valid MongoDB ObjectId (24-character hex string).

**Success Response — 200:**
```json
{
  "success": true,
  "message": "Listing fetched successfully",
  "data": { "listing": { "...": "Canonical Listing Response Object, section 1" } }
}
```

**Error Responses:**
- `404` — `id` is not a valid ObjectId, or the listing doesn't exist, or the listing exists but doesn't belong to the current user (see section 5 — all three cases return the same status and a generic message)
- `401` — missing/invalid token
- `500` — unexpected server error

---

### 3.5 Update Listing

- **URL:** `/listings/:id`
- **Method:** `PATCH`
- **Auth required:** Yes

**Path Parameters:** `id` — must be a syntactically valid MongoDB ObjectId.

**Request Body (all fields optional, at least one required):**
```json
{
  "title": "Updated title",
  "description": "Updated description",
  "category": "Electronics",
  "highlights": ["..."],
  "condition": "fair",
  "brand": "Apple",
  "age": "2 years",
  "originalPrice": 45000,
  "askingPrice": 21000,
  "estimatedPriceRange": { "min": 19000, "max": 23000, "currency": "INR" },
  "status": "active",
  "platformStyle": "facebook"
}
```

**Validation Rules:** same per-field rules as Save Listing (section 3.2), applied only to fields present in the request — including the same strict `estimatedPriceRange` validation (currency must be `"INR"`, `min`/`max` numeric and non-negative, `min <= max`). This is the field a client submits after calling Regenerate (3.7), carrying forward the newly-returned estimate the same way it does on initial Save. `aiMeta` and `userId` are never accepted here, regardless of what's in the request body. `image` is not accepted here at all in any form — a saved listing's image is immutable in V1 (section 3.8); there is no image-replacement endpoint or field on this route.

**Success Response — 200:**
```json
{
  "success": true,
  "message": "Listing updated successfully",
  "data": { "listing": { "...": "Canonical Listing Response Object, section 1" } }
}
```

**Error Responses:**
- `422` — validation failure on a provided field
- `404` — `id` is not a valid ObjectId, listing doesn't exist, or belongs to another user (see section 5)
- `401` — missing/invalid token
- `500` — unexpected server error

---

### 3.6 Delete Listing

- **URL:** `/listings/:id`
- **Method:** `DELETE`
- **Auth required:** Yes

**Path Parameters:** `id` — must be a syntactically valid MongoDB ObjectId.

**Success Response — 200:**
```json
{
  "success": true,
  "message": "Listing deleted successfully",
  "data": null
}
```

**Error Responses:**
- `404` — `id` is not a valid ObjectId, listing doesn't exist, or belongs to another user (see section 5)
- `401` — missing/invalid token
- `500` — unexpected server error

**Notes:** Deleting a listing also triggers Cloudinary asset deletion via the Storage Provider Adapter. A failed Cloudinary delete is logged server-side but does **not** block the success response to the client.

---

### 3.7 Regenerate AI Listing

- **URL:** `/listings/:id/regenerate`
- **Method:** `POST`
- **Auth required:** Yes

**Path Parameters:** `id` — must be a syntactically valid MongoDB ObjectId.

**Request Body:**
```json
{ "platformStyle": "facebook" }
```
(optional — if omitted, reuses the listing's existing `platformStyle`)

**Success Response — 200:**
```json
{
  "success": true,
  "message": "Listing regenerated successfully",
  "data": {
    "draft": {
      "title": "...",
      "description": "...",
      "category": "...",
      "highlights": ["..."],
      "estimatedPriceRange": { "min": 19000, "max": 23000, "currency": "INR" }
    }
  }
}
```

**Error Responses:**
- `404` — `id` is not a valid ObjectId, listing doesn't exist, or belongs to another user (see section 5)
- `429` — AI rate limit exceeded (shares bucket with Generate)
- `502` — AI provider call failed
- `503` — AI provider temporarily unavailable
- `401` — missing/invalid token
- `500` — unexpected server error

**Notes:** Returns a new draft only, and — consistent with Generate (3.1) — does not expose `aiMeta` to the client. As with Generate, the client must call Update Listing (3.5) to persist any content changes, and should include this response's `estimatedPriceRange` in that Update call the same way it would after an initial Generate. The backend validates whatever `estimatedPriceRange` arrives on that Update call strictly (section 6) rather than trusting it outright, and independently assigns fresh server-controlled `aiMeta` at that point.

---

### 3.8 Image Field — Single-Image, Immutable in V1

The public API exposes a **singular `image` object** (not an array) on every listing, and **V1 permits exactly one image per listing**. Internally, the backend's Listing model stores this as a one-element `images` array (per the Technical Design Document's forward-compatible schema), but the API contract intentionally does not expose that array to keep the V1 contract simple.

**A saved listing's image is immutable in V1.** The image is set once — via Generate (3.1) and then confirmed on Save (3.2) — and cannot be changed afterward through Update (3.5) or any other endpoint. **There is no image-replacement endpoint in V1.** A user who wants a different image for a listing must delete the listing (3.6) and generate a new one (3.1) with the desired image; this is a deliberate MVP scope decision, not an oversight.

If a future version adds image replacement or multi-image support, both would be additive, versioned changes — not part of V1's behavior.

---

## 4. Dashboard Endpoints

### 4.1 Dashboard Statistics

- **URL:** `/dashboard/stats`
- **Method:** `GET`
- **Auth required:** Yes

**Success Response — 200:**
```json
{
  "success": true,
  "message": "Dashboard stats fetched successfully",
  "data": {
    "totalListings": 12,
    "draftListings": 3,
    "activeListings": 7,
    "soldListings": 2,
    "byCategory": [
      { "category": "Electronics", "count": 5 },
      { "category": "Furniture", "count": 3 }
    ]
  }
}
```

**Error Responses:**
- `401` — missing/invalid token
- `500` — unexpected server error

**Notes:** Always scoped to the current user only; powers the summary cards and status-distribution chart from the Project Plan. This endpoint reports counts only — it does not aggregate `askingPrice` or `estimatedPriceRange` totals in V1, keeping the stats surface simple and avoiding currency-summation edge cases outside the current scope.

---

## 5. Ownership Rules

- A user can only read, edit, delete, or regenerate listings where the listing's `userId` matches the authenticated user's id.
- **All of GET single, PATCH, DELETE, and Regenerate return `404 Not Found`** — with a generic message such as `"Listing not found"` — for every one of these cases:
  - the `id` path parameter is not a syntactically valid MongoDB ObjectId,
  - no listing exists with that id at all,
  - a listing exists with that id but belongs to a different user.
- This removes the prior asymmetry between GET and PATCH/DELETE. The API never confirms or denies that a given ID belongs to someone else — it fails closed and uniform.
- **Recommended implementation approach** (described here only to make the contract testable, not as scaffolding): ownership should be enforced by querying the database for the listing using **both the listing id and the authenticated user's id in the same lookup** (i.e., "find a listing matching this id AND this userId"), rather than fetching by id alone and separately checking the owner in application code afterward. A query that simply returns no result when the combination doesn't match naturally produces the same `404` for "doesn't exist" and "not yours" without needing a separate branch.
- Ownership is verified at the **service layer**, never trusted from client-supplied data.
- `403 Forbidden` is reserved in this API's status table but is not used for listing-ownership checks in V1, consistent with the fail-closed, non-revealing behavior above.

---

## 6. AI-Originated Content vs. Server-Controlled Metadata (practical mechanism)

This section resolves how `estimatedPriceRange` and `aiMeta` are handled on Save Listing (3.2) and Update Listing (3.5) without introducing a queue, Redis, a temporary generation-storage system, signed generation IDs, or a second AI call during Save.

### `estimatedPriceRange` — AI-originated listing content, carried by the client

- **Generate (3.1)** and **Regenerate (3.7)** call the real AI Provider Adapter server-side and return `estimatedPriceRange` directly in the response.
- The frontend holds this value in its own in-memory draft state — the same place it already holds the editable title/description/etc. between Generate and Save — and displays it to the user as a labeled AI estimate.
- The client **may submit `estimatedPriceRange`** on Save (3.2) and on the Update call used after Regenerate (3.5). This is treated as ordinary AI-originated listing content, not as security-sensitive provenance metadata — conceptually no different from the client carrying forward and submitting the AI-generated `title` or `description` it received.
- Because the value is client-submitted, the backend does not assume it's trustworthy by origin. Instead it **validates it strictly on every request that includes it**:
  - `currency` must be exactly `"INR"`
  - `min` and `max` must both be numbers
  - both must be `>= 0`
  - `min <= max`
- A value that fails any of these checks is rejected with `422`, not silently corrected or dropped — the client is expected to only ever submit a value it received unmodified from Generate/Regenerate, so a failing value indicates a client-side bug worth surfacing, not a value the backend should quietly "fix."
- This requires no additional server-side storage: the backend never needs to look up "what did we actually generate for this user" because it isn't re-deriving the value — it's validating the shape and bounds of whatever the client sends, which is sufficient given this field's status as content rather than a trust/authorization signal.

### `aiMeta` — fully server-controlled, narrower scope

- `aiMeta.provider` and `aiMeta.model` reflect which AI provider/model configuration the backend is currently running — this is static server-side configuration, not per-request data, so the backend always knows it without looking anything up.
- `aiMeta.generatedAt` is set by the backend to the time of the Save or Update call that persists the content — not looked up from an earlier request.
- The client **never submits any part of `aiMeta`**, and any `aiMeta` field present in a Save/Update request body is ignored.
- This is the one piece of AI-related data that remains a genuine trust boundary: `provider`/`model` establish provenance (which system produced this content), which is a different concern from `estimatedPriceRange` being merely a number the AI suggested and the user is free to see, edit away, or replace with their own `askingPrice`.

### What this deliberately does not introduce

No server-side session, cache, queue, temporary "pending generation" collection, signed/opaque generation ID, or extra AI provider call is introduced to support this flow. The only server-side work is ordinary field-level validation of `estimatedPriceRange`, identical in kind to validating `askingPrice` or `title` — and static configuration lookup for `provider`/`model`, which already exists regardless of this flow.

---

## 7. Validation Rules Summary (consolidated)

| Field | Rule |
|---|---|
| `title` | required, string, max 100 chars |
| `description` | required, string, max 2000 chars |
| `category` | required, string, max 50 chars |
| `highlights` | optional, array, max 6 items, 80 chars each |
| `condition` | optional, must be one of `new`, `like_new`, `good`, `fair` |
| `brand` | optional, string, max 50 chars |
| `age` | optional, string, max 30 chars |
| `originalPrice` | optional, number, `>= 0` |
| `askingPrice` | required (on Save), number, `>= 0` |
| `estimatedPriceRange` | optional on Save/Update; if present: `currency` must be exactly `"INR"`, `min` and `max` must be numbers, both `>= 0`, and `min <= max` |
| `platformStyle` | required, must be one of `general`, `olx`, `facebook` |
| `status` | optional, defaults to `draft`, must be one of `draft`, `active`, `sold` |
| `image` | required on Generate/Save; jpeg/png/webp, max 8MB; immutable after Save — not accepted on Update in any form |
| Path `id` params | must be a syntactically valid MongoDB ObjectId (24-char hex); invalid format returns `404`, not `400` or `422`, to keep the ownership/existence response uniform (section 5) |

---

## 8. API Design Principles

1. **Consistency over cleverness** — one response envelope, one pagination shape, one enum style, applied identically across every endpoint, with zero exceptions (including deletes).
2. **Generate/Save separation for AI content** — AI output is never persisted until the user explicitly saves it, keeping the AI step cheap to retry and avoiding wasted writes from abandoned flows.
3. **Server-controlled trust boundary is explicit and narrow, not implicit or over-broad** — every listing field is labeled client-editable, AI-originated/client-carried, or server-controlled (section 1). Only `aiMeta` (provenance: which provider/model produced this content) is a genuine trust boundary never accepted from the client. `estimatedPriceRange` is AI-originated listing content the client legitimately carries forward and may submit — it's validated strictly, not treated as untouchable metadata — distinguishing it clearly from the user-set `askingPrice`.
4. **Ownership enforced server-side, always, and uniformly** — never inferred from client-supplied data, and never leaking whether a resource exists to a non-owner.
5. **Fail closed, not open** — ambiguous authorization or existence states always resolve to a generic `404` or `401`, never to a response that reveals more than necessary.
6. **Errors are structured, not stringly-typed** — every error response is machine-parseable (`field` + `message`), not a single opaque string.
7. **No infrastructure introduced beyond what MVP scope requires** — the `estimatedPriceRange`/`aiMeta` trust boundary (section 6) is solved with ordinary field validation and static server configuration, not a queue, cache, signed generation ID, or temporary storage layer.
8. **V1 scope is deliberately narrow on mutability** — a listing's image is immutable once saved (section 3.8); replacing it is a delete-and-regenerate operation, not an edit, which keeps the Update endpoint's contract simple and avoids an unneeded re-upload path.

---

## 9. Naming Conventions

- **URLs:** lowercase, plural nouns — `/listings`, `/auth`, `/dashboard`.
- **Path params:** always `:id`, never `:listingId` inside an already-scoped `/listings/:id` route.
- **JSON fields:** `camelCase` throughout (`estimatedPriceRange`, `askingPrice`, `platformStyle`, `createdAt`) — matches JavaScript object convention on both frontend and backend.
- **Enums:** always lowercase, snake_case-where-multi-word string values (`"active"`, `"olx"`, `"like_new"`), never numeric codes.
- **Booleans:** prefixed `is`/`has` where applicable (`hasNextPage`).

---

## 10. Versioning Strategy

- The API is versioned via URL path prefix: `/api/v1/...`.
- V1 is frozen for the duration of this project; no breaking changes to existing endpoint shapes once frontend integration begins.
- Additive changes (new optional fields, new endpoints) are allowed within `v1` without a version bump.
- Any breaking change (removing/renaming a field, changing a status code's meaning) would require `/api/v2` — not relevant to this project's scope, but the convention is established now.

---

## 11. Future API Expansion Guidelines

Guidelines only — not commitments, and nothing here is implemented now:

- **Multiple images:** would extend the public `image` field to `images: []`, additive rather than breaking if versioned properly (see section 3.8).
- **Marketplace integrations:** would likely become new endpoints (e.g., `/listings/:id/publish/olx`) rather than modifying existing ones.
- **Analytics:** would be a new `/analytics` endpoint group, following the same response envelope and auth conventions defined here.
- **Notifications:** would introduce a new resource group (`/notifications`) with its own pagination, following section 0.4's format exactly.
- **Multi-currency support:** would extend the fixed `"INR"` assumption into an actual user/region-driven currency setting; until then, `"INR"` is treated as a constant, not configurable, value.
- Any future endpoint must reuse the existing response envelope, pagination format, and error status conventions defined in this document.

---

This document is the authoritative contract for SnapList V1. Frontend and backend development can proceed independently against it without further coordination on request/response shapes.
