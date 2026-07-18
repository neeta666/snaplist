// Listings module — repository placeholder.
//
// Per the Technical Design Document (section 4), this is the only layer
// allowed to query/write the database for listings. The Mongoose Listing
// model (per the schema in the Technical Design Document, section 5, and the
// Canonical Listing Response Object in the API Contract, section 1) is
// introduced in Slice 4, along with the real queries below.
//
// One note worth flagging now: per the Ownership Rules in the API Contract
// (section 4), lookups here should filter by both `_id` and `userId` in the
// same query (not fetch-by-id then check ownership separately in the
// service), so "doesn't exist" and "not yours" naturally collapse into the
// same "no result found" case. That's a repository-level concern, so it's
// noted here for whoever (future us) implements Slice 4.

export const listingRepository = {
  // async create(listingData) {}
  // async findAllByUser({ userId, filters, pagination }) {}
  // async findOneByIdAndUser({ id, userId }) {}
  // async updateOneByIdAndUser({ id, userId, updates }) {}
  // async deleteOneByIdAndUser({ id, userId }) {}
};
