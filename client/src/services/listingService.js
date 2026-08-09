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
// (page, limit, search, status, category, platformStyle, sortBy, sortOrder).
export async function getListings(params = {}) {
  const response = await apiClient.get('/listings', { params });

  return response.data.data;
}