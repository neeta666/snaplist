// Listings page — browse the current user's saved listings, with
// search/filters. Read-only: edit/delete/regenerate live on ListingDetail.

import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { getListings } from '../services/listingService';
import { extractApiError } from '../lib/apiErrors';

const DEFAULT_FILTERS = { search: '', status: '', condition: '', platformStyle: '' };
const DEBOUNCE_MS = 400;

export default function Listings() {
  // filters: what's shown in the inputs, updates immediately.
  // queryFilters: what's actually fetched with — search applies here after
  // a debounce, status/condition/platformStyle apply immediately.
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [queryFilters, setQueryFilters] = useState(DEFAULT_FILTERS);
  const searchDebounceRef = useRef(null);

  const [listings, setListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function fetchListings() {
      setIsLoading(true);
      setError('');
      try {
        // Omit blank filters entirely — the backend treats an absent param
        // as "no filter", not an empty-string match.
        const params = Object.fromEntries(
          Object.entries(queryFilters).filter(([, value]) => value !== '')
        );
        const result = await getListings(params);
        if (isMounted) setListings(result.items);
      } catch (err) {
        const { message } = extractApiError(err);
        if (isMounted) setError(message);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    fetchListings();
    return () => {
      isMounted = false;
    };
  }, [queryFilters]);

  useEffect(() => {
    return () => clearTimeout(searchDebounceRef.current);
  }, []);

  const updateImmediateFilter = (field, value) => {
    setFilters((current) => ({ ...current, [field]: value }));
    setQueryFilters((current) => ({ ...current, [field]: value }));
  };

  const updateSearchFilter = (value) => {
    setFilters((current) => ({ ...current, search: value }));

    clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      setQueryFilters((current) => ({ ...current, search: value }));
    }, DEBOUNCE_MS);
  };

  const resetFilters = () => {
    clearTimeout(searchDebounceRef.current);
    setFilters(DEFAULT_FILTERS);
    setQueryFilters(DEFAULT_FILTERS);
  };

  const hasActiveFilters = Object.values(filters).some((value) => value !== '');

  return (
    <div>
      <h1 className="text-xl font-semibold text-gray-900">Listings</h1>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
        <input
          type="text"
          placeholder="Search title or description"
          value={filters.search}
          onChange={(e) => updateSearchFilter(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm"
        />

        <select
          value={filters.status}
          onChange={(e) => updateImmediateFilter('status', e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="">All statuses</option>
          <option value="draft">Draft</option>
          <option value="active">Active</option>
          <option value="sold">Sold</option>
        </select>

        <select
          value={filters.condition}
          onChange={(e) => updateImmediateFilter('condition', e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="">All conditions</option>
          <option value="new">New</option>
          <option value="like_new">Like new</option>
          <option value="good">Good</option>
          <option value="fair">Fair</option>
        </select>

        <select
          value={filters.platformStyle}
          onChange={(e) => updateImmediateFilter('platformStyle', e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="">All platform styles</option>
          <option value="general">General</option>
          <option value="olx">OLX</option>
          <option value="facebook">Facebook Marketplace</option>
        </select>
      </div>

      {hasActiveFilters && (
        <button
          type="button"
          onClick={resetFilters}
          className="mt-3 text-sm font-medium text-gray-900 underline"
        >
          Reset filters
        </button>
      )}

      {isLoading ? (
        <p className="mt-6 text-sm text-gray-500">Loading listings...</p>
      ) : error ? (
        <p className="mt-6 text-sm text-red-600">{error}</p>
      ) : listings.length === 0 ? (
        <p className="mt-6 text-sm text-gray-500">
          {hasActiveFilters
            ? 'No listings match your search/filters.'
            : "You haven't saved any listings yet."}
        </p>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {listings.map((listing) => (
            <Link
              key={listing.id}
              to={`/listings/${listing.id}`}
              className="block overflow-hidden rounded-md border border-gray-200 hover:border-gray-400"
            >
              <img
                src={listing.image.url}
                alt={listing.title}
                className="h-40 w-full object-cover"
              />
              <div className="p-3">
                <h2 className="truncate text-sm font-medium text-gray-900">{listing.title}</h2>
                <p className="mt-1 text-sm text-gray-700">₹{listing.askingPrice}</p>
                <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-500">
                  <span className="rounded-full bg-gray-100 px-2 py-0.5">{listing.status}</span>
                  {listing.category && (
                    <span className="rounded-full bg-gray-100 px-2 py-0.5">{listing.category}</span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}