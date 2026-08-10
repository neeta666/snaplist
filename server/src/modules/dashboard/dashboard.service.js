import { listingRepository } from '../listings/listing.repository.js';

function countFor(statusCounts, status) {
  return statusCounts.find((entry) => entry._id === status)?.count ?? 0;
}

export const dashboardService = {
  async getStats(userId) {
    const { statusCounts, categoryCounts } = await listingRepository.getStatsByUser(userId);

    const draftListings = countFor(statusCounts, 'draft');
    const activeListings = countFor(statusCounts, 'active');
    const soldListings = countFor(statusCounts, 'sold');

    return {
      totalListings: draftListings + activeListings + soldListings,
      draftListings,
      activeListings,
      soldListings,
      byCategory: categoryCounts.map((entry) => ({
        category: entry._id,
        count: entry.count,
      })),
    };
  },
};