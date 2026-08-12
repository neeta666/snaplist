// Listing Detail page — view, edit, status change, delete.
// AI Regenerate is not implemented yet.

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getListing, updateListing, deleteListing } from '../services/listingService';
import { updateListingSchema } from '../schemas/listingSchemas';
import { extractApiError } from '../lib/apiErrors';

function normalizeOptionalString(value) {
  return value === '' || value === undefined || value === null ? undefined : value;
}

function normalizeOptionalNumber(value) {
  if (value === '' || value === undefined || value === null) return undefined;
  return typeof value === 'number' ? value : Number(value);
}

function highlightsEqual(a, b) {
  const arrA = a ?? [];
  const arrB = b ?? [];
  if (arrA.length !== arrB.length) return false;
  return arrA.every((value, index) => value === arrB[index]);
}

function priceRangeEqual(a, b) {
  if (!a && !b) return true;
  if (!a || !b) return false;
  return (
    normalizeOptionalNumber(a.min) === normalizeOptionalNumber(b.min) &&
    normalizeOptionalNumber(a.max) === normalizeOptionalNumber(b.max) &&
    a.currency === b.currency
  );
}

// Builds a PATCH payload containing only fields whose effective value
// differs from the currently saved listing. Numeric/blank normalization
// here mirrors what updateListingSchema will do anyway, so a field with an
// unchanged value (even if re-typed as a string) is never included.
function buildUpdates(form, listing) {
  const updates = {};

  if (form.title !== listing.title) updates.title = form.title;
  if (form.description !== listing.description) updates.description = form.description;
  if (form.category !== listing.category) updates.category = form.category;

  if (!highlightsEqual(form.highlights, listing.highlights)) {
    updates.highlights = form.highlights;
  }

  if (normalizeOptionalString(form.condition) !== (listing.condition ?? undefined)) {
    updates.condition = form.condition;
  }
  if (normalizeOptionalString(form.brand) !== (listing.brand ?? undefined)) {
    updates.brand = form.brand;
  }
  if (normalizeOptionalString(form.age) !== (listing.age ?? undefined)) {
    updates.age = form.age;
  }

  if (normalizeOptionalNumber(form.originalPrice) !== (listing.originalPrice ?? undefined)) {
    updates.originalPrice = form.originalPrice;
  }
  if (normalizeOptionalNumber(form.askingPrice) !== listing.askingPrice) {
    updates.askingPrice = form.askingPrice;
  }

  if (form.estimatedPriceRange && !priceRangeEqual(form.estimatedPriceRange, listing.estimatedPriceRange)) {
    updates.estimatedPriceRange = form.estimatedPriceRange;
  }

  if (form.platformStyle !== listing.platformStyle) updates.platformStyle = form.platformStyle;
  if (form.status !== listing.status) updates.status = form.status;

  return updates;
}

export default function ListingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [listing, setListing] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [confirmingDelete, setConfirmingDelete] = useState(false);

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

  const startEditing = () => {
    setForm({
      title: listing.title,
      description: listing.description,
      category: listing.category,
      highlights: listing.highlights ?? [],
      condition: listing.condition ?? '',
      brand: listing.brand ?? '',
      age: listing.age ?? '',
      originalPrice: listing.originalPrice ?? '',
      askingPrice: listing.askingPrice,
      estimatedPriceRange: listing.estimatedPriceRange ?? null,
      platformStyle: listing.platformStyle,
      status: listing.status,
    });
    setFormErrors({});
    setFormError('');
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setForm(null);
    setFormErrors({});
    setFormError('');
  };

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const updateHighlight = (index, value) => {
    setForm((current) => {
      const highlights = [...current.highlights];
      highlights[index] = value;
      return { ...current, highlights };
    });
  };

  const removeHighlight = (index) => {
    setForm((current) => ({
      ...current,
      highlights: current.highlights.filter((_, i) => i !== index),
    }));
  };

  const addHighlight = () => {
    setForm((current) => ({
      ...current,
      highlights: [...current.highlights, ''],
    }));
  };

  const updatePriceRange = (key, value) => {
    setForm((current) => ({
      ...current,
      estimatedPriceRange: {
        ...current.estimatedPriceRange,
        [key]: value,
      },
    }));
  };

  const handleSave = async () => {
    if (isSaving) return; // prevent duplicate submissions

    setFormErrors({});
    setFormError('');

    const updates = buildUpdates(form, listing);

    if (Object.keys(updates).length === 0) {
      setFormError('No changes to save');
      return;
    }

    const result = updateListingSchema.safeParse(updates);
    if (!result.success) {
      const nextErrors = {};
      result.error.issues.forEach((issue) => {
        nextErrors[issue.path.join('.')] = issue.message;
      });
      setFormErrors(nextErrors);
      return;
    }

    setIsSaving(true);
    try {
      const updated = await updateListing(id, result.data);
      setListing(updated);
      setIsEditing(false);
      setForm(null);
    } catch (err) {
      const { message, fieldErrors } = extractApiError(err);

      if (fieldErrors.length > 0) {
        const nextErrors = {};
        fieldErrors.forEach(({ field, message: fieldMessage }) => {
          nextErrors[field] = fieldMessage;
        });
        setFormErrors(nextErrors);
      } else {
        setFormError(message);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const openDeleteModal = () => {
    setDeleteError('');
    setConfirmingDelete(true);
  };

  const closeDeleteModal = () => {
    if (isDeleting) return; // don't allow closing mid-request
    setConfirmingDelete(false);
    setDeleteError('');
  };

  const handleDelete = async () => {
    if (isDeleting) return; // prevent duplicate submissions

    setDeleteError('');
    setIsDeleting(true);
    try {
      await deleteListing(id);
      navigate('/listings');
    } catch (err) {
      const { message } = extractApiError(err);
      setDeleteError(message);
      setIsDeleting(false);
    }
  };

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

      {!isEditing ? (
        <>
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

          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={startEditing}
              className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={openDeleteModal}
              className="rounded-md border border-red-300 px-4 py-2 text-sm font-medium text-red-600"
            >
              Delete
            </button>
          </div>
        </>
      ) : (
        <div className="mt-4 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Edit listing</h2>

          <div>
            <label htmlFor="edit-title" className="block text-sm font-medium text-gray-700">
              Title
            </label>
            <input
              id="edit-title"
              type="text"
              value={form.title}
              onChange={(e) => updateField('title', e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
            {formErrors.title && <p className="mt-1 text-sm text-red-600">{formErrors.title}</p>}
          </div>

          <div>
            <label htmlFor="edit-description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="edit-description"
              rows={5}
              value={form.description}
              onChange={(e) => updateField('description', e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
            {formErrors.description && (
              <p className="mt-1 text-sm text-red-600">{formErrors.description}</p>
            )}
          </div>

          <div>
            <label htmlFor="edit-category" className="block text-sm font-medium text-gray-700">
              Category
            </label>
            <input
              id="edit-category"
              type="text"
              value={form.category}
              onChange={(e) => updateField('category', e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
            {formErrors.category && (
              <p className="mt-1 text-sm text-red-600">{formErrors.category}</p>
            )}
          </div>

          <div>
            <span className="block text-sm font-medium text-gray-700">Highlights</span>
            <div className="mt-1 space-y-2">
              {form.highlights.map((highlight, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={highlight}
                    onChange={(e) => updateHighlight(index, e.target.value)}
                    className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => removeHighlight(index)}
                    className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-600"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
            {form.highlights.length < 6 && (
              <button
                type="button"
                onClick={addHighlight}
                className="mt-2 text-sm font-medium text-gray-900 underline"
              >
                Add highlight
              </button>
            )}
            {formErrors.highlights && (
              <p className="mt-1 text-sm text-red-600">{formErrors.highlights}</p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="edit-condition" className="block text-sm font-medium text-gray-700">
                Condition
              </label>
              <select
                id="edit-condition"
                value={form.condition}
                onChange={(e) => updateField('condition', e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="">Not specified</option>
                <option value="new">New</option>
                <option value="like_new">Like new</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
              </select>
              {formErrors.condition && (
                <p className="mt-1 text-sm text-red-600">{formErrors.condition}</p>
              )}
            </div>

            <div>
              <label htmlFor="edit-brand" className="block text-sm font-medium text-gray-700">
                Brand
              </label>
              <input
                id="edit-brand"
                type="text"
                value={form.brand}
                onChange={(e) => updateField('brand', e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
              {formErrors.brand && <p className="mt-1 text-sm text-red-600">{formErrors.brand}</p>}
            </div>

            <div>
              <label htmlFor="edit-age" className="block text-sm font-medium text-gray-700">
                Age
              </label>
              <input
                id="edit-age"
                type="text"
                value={form.age}
                onChange={(e) => updateField('age', e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
              {formErrors.age && <p className="mt-1 text-sm text-red-600">{formErrors.age}</p>}
            </div>

            <div>
              <label htmlFor="edit-original-price" className="block text-sm font-medium text-gray-700">
                Original price (INR)
              </label>
              <input
                id="edit-original-price"
                type="number"
                min="0"
                value={form.originalPrice}
                onChange={(e) => updateField('originalPrice', e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
              {formErrors.originalPrice && (
                <p className="mt-1 text-sm text-red-600">{formErrors.originalPrice}</p>
              )}
            </div>

            <div>
              <label htmlFor="edit-asking-price" className="block text-sm font-medium text-gray-700">
                Asking price (INR)
              </label>
              <input
                id="edit-asking-price"
                type="number"
                min="0"
                value={form.askingPrice}
                onChange={(e) => updateField('askingPrice', e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
              {formErrors.askingPrice && (
                <p className="mt-1 text-sm text-red-600">{formErrors.askingPrice}</p>
              )}
            </div>

            <div>
              <label htmlFor="edit-platform-style" className="block text-sm font-medium text-gray-700">
                Platform style
              </label>
              <select
                id="edit-platform-style"
                value={form.platformStyle}
                onChange={(e) => updateField('platformStyle', e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="general">General</option>
                <option value="olx">OLX</option>
                <option value="facebook">Facebook Marketplace</option>
              </select>
              {formErrors.platformStyle && (
                <p className="mt-1 text-sm text-red-600">{formErrors.platformStyle}</p>
              )}
            </div>

            <div>
              <label htmlFor="edit-status" className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                id="edit-status"
                value={form.status}
                onChange={(e) => updateField('status', e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="sold">Sold</option>
              </select>
              {formErrors.status && <p className="mt-1 text-sm text-red-600">{formErrors.status}</p>}
            </div>
          </div>

          {form.estimatedPriceRange && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="edit-price-min" className="block text-sm font-medium text-gray-700">
                  Estimated min (INR)
                </label>
                <input
                  id="edit-price-min"
                  type="number"
                  min="0"
                  value={form.estimatedPriceRange.min}
                  onChange={(e) => updatePriceRange('min', e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                />
                {formErrors['estimatedPriceRange.min'] && (
                  <p className="mt-1 text-sm text-red-600">{formErrors['estimatedPriceRange.min']}</p>
                )}
              </div>
              <div>
                <label htmlFor="edit-price-max" className="block text-sm font-medium text-gray-700">
                  Estimated max (INR)
                </label>
                <input
                  id="edit-price-max"
                  type="number"
                  min="0"
                  value={form.estimatedPriceRange.max}
                  onChange={(e) => updatePriceRange('max', e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                />
                {formErrors['estimatedPriceRange.max'] && (
                  <p className="mt-1 text-sm text-red-600">{formErrors['estimatedPriceRange.max']}</p>
                )}
              </div>
            </div>
          )}

          {formError && <p className="text-sm text-red-600">{formError}</p>}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save changes'}
            </button>
            <button
              type="button"
              onClick={cancelEditing}
              disabled={isSaving}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {confirmingDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-md bg-white p-6 shadow-lg">
            <p className="text-sm text-gray-900">Delete this listing? This cannot be undone.</p>
            {deleteError && <p className="mt-2 text-sm text-red-600">{deleteError}</p>}
            <div className="mt-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeDeleteModal}
                disabled={isDeleting}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Confirm delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}