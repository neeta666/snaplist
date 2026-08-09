// Listing Detail page — view only. Edit/Delete/Regenerate/status changes
// come in a later slice.

import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getListing } from '../services/listingService';
import { extractApiError } from '../lib/apiErrors';

export default function ListingDetail() {
  const { id } = useParams();

  const [listing, setListing] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function fetchListing() {
      setIsLoading(true);
      setError('');
      try {
        const result = await getListing(id);
        if (isMounted) setListing(result);
      } catch (err) {
        // Per API Contract 3.4, a 404 covers invalid ID, not-found, and
        // not-owned identically — no need to distinguish here either.
        const { message } = extractApiError(err);
        if (isMounted) setError(message);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    fetchListing();
    return () => {
      isMounted = false;
    };
  }, [id]);

  if (isLoading) {
    return <p className="text-sm text-gray-500">Loading listing...</p>;
  }

  if (error) {
    return <p className="text-sm text-red-600">{error}</p>;
  }

  if (!listing) {
    return null;
  }

  return (
    <div className="max-w-2xl">
      <img
        src={listing.image.url}
        alt={listing.title}
        className="h-64 w-full rounded-md border border-gray-200 object-cover sm:w-64"
      />

      <h1 className="mt-4 text-xl font-semibold text-gray-900">{listing.title}</h1>

      <div className="mt-1 flex flex-wrap gap-2 text-sm text-gray-500">
        <span className="rounded-full bg-gray-100 px-2 py-0.5">{listing.status}</span>
        <span className="rounded-full bg-gray-100 px-2 py-0.5">{listing.platformStyle}</span>
        <span className="rounded-full bg-gray-100 px-2 py-0.5">{listing.category}</span>
      </div>

      <p className="mt-4 whitespace-pre-wrap text-sm text-gray-700">{listing.description}</p>

      {listing.highlights?.length > 0 && (
        <ul className="mt-4 list-inside list-disc space-y-1 text-sm text-gray-700">
          {listing.highlights.map((highlight, index) => (
            <li key={index}>{highlight}</li>
          ))}
        </ul>
      )}

      <div className="mt-6 grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
        <div>
          <span className="block text-gray-500">Asking price</span>
          <span className="font-medium text-gray-900">₹{listing.askingPrice}</span>
        </div>

        {listing.estimatedPriceRange && (
          <div>
            <span className="block text-gray-500">Estimated range</span>
            <span className="font-medium text-gray-900">
              ₹{listing.estimatedPriceRange.min} – ₹{listing.estimatedPriceRange.max}
            </span>
          </div>
        )}

        {listing.originalPrice !== undefined && listing.originalPrice !== null && (
          <div>
            <span className="block text-gray-500">Original price</span>
            <span className="font-medium text-gray-900">₹{listing.originalPrice}</span>
          </div>
        )}

        {listing.condition && (
          <div>
            <span className="block text-gray-500">Condition</span>
            <span className="font-medium text-gray-900">{listing.condition}</span>
          </div>
        )}

        {listing.brand && (
          <div>
            <span className="block text-gray-500">Brand</span>
            <span className="font-medium text-gray-900">{listing.brand}</span>
          </div>
        )}

        {listing.age && (
          <div>
            <span className="block text-gray-500">Age</span>
            <span className="font-medium text-gray-900">{listing.age}</span>
          </div>
        )}
      </div>
    </div>
  );
}