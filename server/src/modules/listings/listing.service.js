// Listings module — service placeholder.
//
// This will be the busiest service in the app: it orchestrates the AI
// Provider Adapter, the Storage Provider Adapter, and the listing
// repository, and is where ownership checks (API Contract, section 4) and
// the `estimatedPriceRange`/`aiMeta` validation rules (API Contract, section
// 6) will actually be enforced. None of that logic exists yet — it arrives
// incrementally across Slices 3–5. Kept empty now so the module boundary
// (service never imports a provider SDK or the database driver directly) is
// established from the start.

export const listingService = {
  // async generateDraft({ userId, image, condition, brand, age, originalPrice, platformStyle }) {}
  // async save({ userId, listingData }) {}
  // async getAll({ userId, filters, pagination }) {}
  // async getById({ userId, id }) {}
  // async update({ userId, id, updates }) {}
  // async remove({ userId, id }) {}
  // async regenerate({ userId, id, platformStyle }) {}
};
