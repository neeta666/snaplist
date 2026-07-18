// Listings module — validation placeholder.
//
// Real schemas will encode the full Validation Rules Summary from the API
// Contract (section 7) — title/description/category length limits, the
// condition/platformStyle/status enums, image type/size limits, and the
// strict estimatedPriceRange checks (currency must be "INR", non-negative,
// min <= max). None of that is implemented yet; it lands alongside the
// endpoints that need it (Slices 3–5).

// No validators are implemented yet. This placeholder export exists only so
// the file is a valid, non-empty ES module (satisfying lint rules) without
// introducing any real validation logic ahead of Slices 3–5.
export const listingValidation = {};

// export function validateGenerate(req, res, next) {}
// export function validateSaveListing(req, res, next) {}
// export function validateUpdateListing(req, res, next) {}
// export function validateObjectIdParam(req, res, next) {}
