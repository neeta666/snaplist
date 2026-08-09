// Listings page — browse the current user's saved listings.
// Read-only: edit/delete/regenerate/status-change come in a later slice.

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getListings } from '../services/listingService';
import { extractApiError } from '../lib/apiErrors';

export default function Listings() {
  const [listings, setListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function fetchListings() {
      setIsLoading(true);
      setError('');
      try {
        const result = await getListings();
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
  }, []);

  if (isLoading) {
    return <p className="text-sm text-gray-500">Loading listings...</p>;
  }

  if (error) {
    return <p className="text-sm text-red-600">{error}</p>;
  }

  return (
    <div>
      <h1 className="text-xl font-semibold text-gray-900">Listings</h1>

      {listings.length === 0 ? (
        <p className="mt-4 text-sm text-gray-500">
          You haven&apos;t saved any listings yet.
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