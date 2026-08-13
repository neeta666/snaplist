import { apiClient } from '../lib/apiClient';

// Builds multipart form data for POST /listings/generate (API Contract 3.1).
// Optional fields are appended only when defined, matching the backend's
// distinction between "omitted" and "empty string".
export async function generateListingDraft(values) {
  const formData = new FormData();

  formData.append('image', values.image);
  formData.append('platformStyle', values.platformStyle);

  if (values.condition !== undefined) {
    formData.append('condition', values.condition);
  }
  if (values.brand !== undefined) {
    formData.append('brand', values.brand);
  }
  if (values.age !== undefined) {
    formData.append('age', values.age);
  }
  if (values.originalPrice !== undefined) {
    formData.append('originalPrice', values.originalPrice);
  }

  // Let the browser set the multipart boundary; do not set Content-Type.
  const response = await apiClient.post('/listings/generate', formData);

  return response.data.data.draft;
}

// POST /listings (API Contract 3.2) — plain JSON body.
export async function saveListing(payload) {
  const response = await apiClient.post('/listings', payload);

  return response.data.data.listing;
}

// GET /listings/:id (API Contract 3.4).
export async function getListing(id) {
  const response = await apiClient.get(`/listings/${id}`);

  return response.data.data.listing;
}

// GET /listings (API Contract 3.3). params are optional query filters
// (page, limit, search, status, category, condition, platformStyle, sortBy, sortOrder).
export async function getListings(params = {}) {
  const response = await apiClient.get('/listings', { params });

  return response.data.data;
}

// PATCH /listings/:id (API Contract 3.5). updates must never include
// image/aiMeta/userId — image is immutable, the rest are server-controlled.
export async function updateListing(id, updates) {
  const response = await apiClient.patch(`/listings/${id}`, updates);

  return response.data.data.listing;
}

// DELETE /listings/:id (API Contract 3.6).
export async function deleteListing(id) {
  await apiClient.delete(`/listings/${id}`);
}

// POST /listings/:id/regenerate (API Contract 3.7). platformStyle is
// optional — omit it entirely to reuse the listing's current value.
// Returns an unsaved draft; nothing is persisted until PATCH.
export async function regenerateListing(id, platformStyle) {
  const body = platformStyle !== undefined ? { platformStyle } : {};
  const response = await apiClient.post(`/listings/${id}/regenerate`, body);

  return response.data.data.draft;
}