// Listings page — browse the current user's saved listings, with
// search/filters. Read-only: edit/delete/regenerate live on ListingDetail.

import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { deleteListing, getListings } from "../services/listingService";
import { extractApiError } from "../lib/apiErrors";

const DEFAULT_FILTERS = {
  search: "",
  status: "",
  condition: "",
  platformStyle: "",
};
const DEBOUNCE_MS = 400;

export default function Listings() {
  // filters: what's shown in the inputs, updates immediately.
  // queryFilters: what's actually fetched with — search applies here after
  // a debounce, status/condition/platformStyle apply immediately.
  const navigate = useNavigate();
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [queryFilters, setQueryFilters] = useState(DEFAULT_FILTERS);
  const searchDebounceRef = useRef(null);

  const [listings, setListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [openMenuId, setOpenMenuId] = useState(null);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [mobileFilterDraft, setMobileFilterDraft] = useState({
    status: "",
    condition: "",
    platformStyle: "",
  });
  const [listingToDelete, setListingToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function fetchListings() {
      setIsLoading(true);
      setError("");
      try {
        // Omit blank filters entirely — the backend treats an absent param
        // as "no filter", not an empty-string match.
        const params = Object.fromEntries(
          Object.entries(queryFilters).filter(([, value]) => value !== ""),
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

  useEffect(() => {
    if (!isMobileFiltersOpen) return;

    const scrollY = window.scrollY;

    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";

    return () => {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";

      window.scrollTo(0, scrollY);
    };
  }, [isMobileFiltersOpen]);

  const handleDelete = async () => {
    if (!listingToDelete || isDeleting) return;

    setDeleteError("");
    setIsDeleting(true);

    try {
      await deleteListing(listingToDelete.id);

      setListings((current) =>
        current.filter((listing) => listing.id !== listingToDelete.id),
      );

      setListingToDelete(null);
    } catch (err) {
      const { message } = extractApiError(err);
      setDeleteError(message);
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    if (openMenuId === null) return;

    const closeMenu = () => {
      setOpenMenuId(null);
    };

    document.addEventListener("click", closeMenu);

    return () => {
      document.removeEventListener("click", closeMenu);
    };
  }, [openMenuId]);

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

  const hasActiveFilters = Object.values(filters).some((value) => value !== "");

  const hasMobileFilters =
    Boolean(filters.status) ||
    Boolean(filters.condition) ||
    Boolean(filters.platformStyle);

  return (
    <div>
      <div className="flex flex-col gap-2 pt-1 sm:flex-row sm:items-end sm:justify-between sm:gap-4 sm:pt-2">
        <div className="min-w-0 flex-1">
          <div className="mb-3 h-1 w-8 rounded-full bg-brand/70 sm:w-10" />

          <div className="flex items-center justify-between gap-3 sm:block">
            <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              My Listings
              <span className="text-xl text-brand" aria-hidden="true">
                ✦
              </span>
            </h1>

            <Link
              to="/listings/new"
              className="create-gradient-button inline-flex shrink-0 items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white transition sm:hidden"
            >
              <span aria-hidden="true">+</span>
              New listing
            </Link>
          </div>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-ink-muted sm:text-base">
            Manage, edit or update the status of your listings.
          </p>
        </div>

        <Link
          to="/listings/new"
          className="create-gradient-button hidden w-fit items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white transition sm:inline-flex"
        >
          <span aria-hidden="true">+</span>
          New listing
        </Link>
      </div>

      <div className="sticky top-16 z-30 -mx-4 mt-4 flex gap-2 bg-surface-muted px-4 py-2 sm:hidden">
        <div className="relative min-w-0 flex-1">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>

          <input
            type="text"
            placeholder="Search title or description"
            value={filters.search}
            onChange={(e) => updateSearchFilter(e.target.value)}
            className="h-11 w-full rounded-xl border border-border bg-surface pl-10 pr-3 text-sm text-ink outline-none transition placeholder:text-ink-subtle focus:border-brand focus:ring-2 focus:ring-brand/15"
          />
        </div>

        <button
          type="button"
          onClick={() => {
            setMobileFilterDraft({
              status: filters.status,
              condition: filters.condition,
              platformStyle: filters.platformStyle,
            });
            setIsMobileFiltersOpen(true);
          }}
          className={[
            "relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border bg-surface transition",
            hasMobileFilters
              ? "border-brand bg-brand-tint text-brand"
              : "border-border text-ink-muted hover:border-brand hover:text-brand",
          ].join(" ")}
          aria-label="Open filters"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
            aria-hidden="true"
          >
            <path d="M4 7h10" />
            <path d="M18 7h2" />
            <path d="M10 17h10" />
            <path d="M4 17h2" />
            <circle cx="16" cy="7" r="2" />
            <circle cx="8" cy="17" r="2" />
          </svg>

          {hasMobileFilters && (
            <span
              className="absolute bottom-1.5 right-1.5 h-2 w-2 rounded-full bg-brand"
              aria-hidden="true"
            />
          )}
        </button>
      </div>

      {isMobileFiltersOpen && (
        <div
          className="fixed inset-0 z-50 bg-ink/35 sm:hidden"
          onClick={() => setIsMobileFiltersOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Listing filters"
            className="absolute inset-x-0 bottom-0 flex max-h-[88vh] flex-col overflow-hidden rounded-t-3xl border border-border bg-surface shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="shrink-0 border-b border-border bg-surface px-5 pb-3 pt-3">
              <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-border-strong" />

              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-ink">Filters</h2>

                <button
                  type="button"
                  onClick={() => setIsMobileFiltersOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-ink-muted transition hover:bg-brand-tint hover:text-brand"
                  aria-label="Close filters"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    className="h-5 w-5"
                    aria-hidden="true"
                  >
                    <path d="M6 6l12 12" />
                    <path d="M18 6 6 18" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5">
              <div className="mt-5">
                <p className="text-sm font-semibold text-ink">Status</p>

                <div className="mt-3 grid grid-cols-4 gap-2">
                  {[
                    { value: "", label: "All" },
                    { value: "draft", label: "Draft" },
                    { value: "active", label: "Active" },
                    { value: "sold", label: "Sold" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() =>
                        setMobileFilterDraft((current) => ({
                          ...current,
                          status: option.value,
                        }))
                      }
                      className={[
                        "rounded-xl border px-2 py-2.5 text-sm font-medium transition",
                        mobileFilterDraft.status === option.value
                          ? "border-brand bg-brand-tint text-brand"
                          : "border-border bg-surface text-ink-muted hover:border-brand hover:text-brand",
                      ].join(" ")}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-5">
                <p className="text-sm font-semibold text-ink">Condition</p>

                <div className="mt-3 grid grid-cols-2 gap-2">
                  {[
                    { value: "", label: "All" },
                    { value: "new", label: "New" },
                    { value: "like_new", label: "Like new" },
                    { value: "good", label: "Good" },
                    { value: "fair", label: "Fair" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() =>
                        setMobileFilterDraft((current) => ({
                          ...current,
                          condition: option.value,
                        }))
                      }
                      className={[
                        "rounded-xl border px-3 py-2.5 text-sm font-medium transition",
                        mobileFilterDraft.condition === option.value
                          ? "border-brand bg-brand-tint text-brand"
                          : "border-border bg-surface text-ink-muted hover:border-brand hover:text-brand",
                      ].join(" ")}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-5">
                <p className="text-sm font-semibold text-ink">Platform style</p>

                <div className="mt-3 grid grid-cols-1 gap-2">
                  {[
                    { value: "", label: "All platforms" },
                    { value: "general", label: "General" },
                    { value: "olx", label: "OLX" },
                    { value: "facebook", label: "Facebook Marketplace" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() =>
                        setMobileFilterDraft((current) => ({
                          ...current,
                          platformStyle: option.value,
                        }))
                      }
                      className={[
                        "rounded-xl border px-3 py-2.5 text-left text-sm font-medium transition",
                        mobileFilterDraft.platformStyle === option.value
                          ? "border-brand bg-brand-tint text-brand"
                          : "border-border bg-surface text-ink-muted hover:border-brand hover:text-brand",
                      ].join(" ")}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="shrink-0 border-t border-border bg-surface px-5 pb-6 pt-4">
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setMobileFilterDraft({
                      status: "",
                      condition: "",
                      platformStyle: "",
                    })
                  }
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border-2 border-brand/70 bg-transparent text-sm font-semibold text-brand shadow-sm transition hover:border-brand hover:bg-brand-tint"
                >
                  <span aria-hidden="true">↻</span>
                  Reset
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setFilters((current) => ({
                      ...current,
                      ...mobileFilterDraft,
                    }));

                    setQueryFilters((current) => ({
                      ...current,
                      ...mobileFilterDraft,
                    }));

                    setIsMobileFiltersOpen(false);
                  }}
                  className="create-gradient-button h-11 rounded-xl text-sm font-semibold text-white transition"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 hidden gap-3 sm:sticky sm:top-16 sm:z-30 sm:grid sm:grid-cols-2 sm:rounded-2xl sm:border sm:border-border sm:bg-surface sm:p-4 md:grid-cols-4">
        <div className="relative">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>

          <input
            type="text"
            placeholder="Search title or description"
            value={filters.search}
            onChange={(e) => updateSearchFilter(e.target.value)}
            className="h-11 w-full rounded-xl border border-border bg-surface pl-10 pr-3 text-sm text-ink outline-none transition placeholder:text-ink-subtle focus:border-brand focus:ring-2 focus:ring-brand/15"
          />
        </div>

        <select
          value={filters.status}
          onChange={(e) => updateImmediateFilter("status", e.target.value)}
          className="listings-filter-select h-11 w-full rounded-xl border border-border bg-surface px-4 text-sm text-ink outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/15"
        >
          <option value="">All statuses</option>
          <option value="draft">Draft</option>
          <option value="active">Active</option>
          <option value="sold">Sold</option>
        </select>

        <select
          value={filters.condition}
          onChange={(e) => updateImmediateFilter("condition", e.target.value)}
          className="listings-filter-select h-11 w-full rounded-xl border border-border bg-surface px-4 text-sm text-ink outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/15"
        >
          <option value="">All conditions</option>
          <option value="new">New</option>
          <option value="like_new">Like new</option>
          <option value="good">Good</option>
          <option value="fair">Fair</option>
        </select>

        <select
          value={filters.platformStyle}
          onChange={(e) =>
            updateImmediateFilter("platformStyle", e.target.value)
          }
          className="listings-filter-select h-11 w-full rounded-xl border border-border bg-surface px-4 text-sm text-ink outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/15"
        >
          <option value="">All platform styles</option>
          <option value="general">General</option>
          <option value="olx">OLX</option>
          <option value="facebook">Facebook Marketplace</option>
        </select>

        {hasActiveFilters && (
          <div className="col-span-full flex justify-end">
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand transition hover:text-brand-hover"
            >
              <span aria-hidden="true">↻</span>
              Reset filters
            </button>
          </div>
        )}
      </div>

      {isLoading ? (
        <p className="mt-6 text-sm text-gray-500">Loading listings...</p>
      ) : error ? (
        <p className="mt-6 text-sm text-red-600">{error}</p>
      ) : listings.length === 0 ? (
        hasActiveFilters ? (
          <p className="mt-6 text-sm text-ink-muted">
            No listings match your search/filters.
          </p>
        ) : (
          <div className="create-soft-panel mt-6 rounded-2xl border-2 border-dotted border-brand/30 px-6 py-10 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand text-white shadow-sm">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-7 w-7"
                aria-hidden="true"
              >
                <rect x="3" y="4" width="18" height="16" rx="2" />
                <circle cx="9" cy="9" r="2" />
                <path d="m21 15-5-5L5 20" />
              </svg>
            </div>

            <h2 className="mt-4 text-lg font-bold text-ink">No listings yet</h2>

            <p className="mt-2 text-sm text-ink-muted">
              Create your first listing with AI to get started.
            </p>

            <Link
              to="/listings/new"
              className="create-gradient-button mt-5 inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white transition"
            >
              <span aria-hidden="true">+</span>
              Create your first listing
            </Link>
          </div>
        )
      ) : (
        <>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {listings.map((listing) => (
              <article
                key={listing.id}
                className="overflow-hidden rounded-2xl border border-border bg-surface transition hover:border-brand/40 hover:shadow-md"
              >
                <div className="relative">
                  <Link to={`/listings/${listing.id}`} className="block">
                    <img
                      src={listing.image.url}
                      alt={listing.title}
                      className="h-40 w-full object-cover"
                    />
                  </Link>

                  <span
                    className={[
                      "absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold capitalize shadow-sm",
                      listing.status === "active"
                        ? "bg-emerald-50 text-emerald-700"
                        : listing.status === "sold"
                          ? "bg-rose-50 text-rose-700"
                          : "bg-violet-50 text-violet-700",
                    ].join(" ")}
                  >
                    <span
                      className={[
                        "h-2 w-2 rounded-full",
                        listing.status === "active"
                          ? "bg-emerald-500"
                          : listing.status === "sold"
                            ? "bg-rose-500"
                            : "bg-violet-500",
                      ].join(" ")}
                      aria-hidden="true"
                    />

                    {listing.status}
                  </span>
                </div>
                <div className="p-3">
                  <h2 className="truncate text-sm font-semibold text-ink">
                    <Link
                      to={`/listings/${listing.id}`}
                      className="transition hover:text-brand"
                    >
                      {listing.title}
                    </Link>
                  </h2>
                  <p className="mt-1 text-base font-bold text-brand">
                    ₹{listing.askingPrice}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs text-ink-muted">
                    {listing.category && (
                      <span className="listing-meta-chip rounded-full px-2.5 py-1">
                        {listing.category}
                      </span>
                    )}
                    <span className="listing-meta-chip rounded-full px-2.5 py-1">
                      {{
                        new: "New",
                        like_new: "Like new",
                        good: "Good",
                        fair: "Fair",
                      }[listing.condition] ?? "Not specified"}
                    </span>
                  </div>
                </div>
                <div className="border-t border-border px-3 py-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-1.5 text-xs text-ink-muted">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4"
                        aria-hidden="true"
                      >
                        <rect x="3" y="5" width="18" height="16" rx="2" />
                        <path d="M16 3v4" />
                        <path d="M8 3v4" />
                        <path d="M3 10h18" />
                      </svg>

                      <span>
                        Created{" "}
                        {new Date(listing.createdAt).toLocaleDateString(
                          "en-GB",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          },
                        )}
                      </span>
                    </div>

                    <div
                      className="relative"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() =>
                          setOpenMenuId((current) =>
                            current === listing.id ? null : listing.id,
                          )
                        }
                        aria-label={`Actions for ${listing.title}`}
                        aria-expanded={openMenuId === listing.id}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-surface-muted text-ink-muted transition hover:border-brand/40 hover:bg-brand-tint hover:text-brand"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="h-5 w-5"
                          aria-hidden="true"
                        >
                          <circle cx="12" cy="5" r="1.5" />
                          <circle cx="12" cy="12" r="1.5" />
                          <circle cx="12" cy="19" r="1.5" />
                        </svg>
                      </button>

                      {openMenuId === listing.id && (
                        <div className="absolute bottom-10 right-0 z-20 w-32 overflow-hidden rounded-xl border border-border bg-surface py-1 shadow-lg">
                          <button
                            type="button"
                            onClick={() => {
                              setOpenMenuId(null);
                              navigate(`/listings/${listing.id}`);
                            }}
                            className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm font-medium text-ink transition hover:bg-brand-tint hover:text-brand"
                          >
                            <svg
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.8"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="h-4 w-4"
                              aria-hidden="true"
                            >
                              <path d="M12 20h9" />
                              <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
                            </svg>
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setOpenMenuId(null);
                              setDeleteError("");
                              setListingToDelete(listing);
                            }}
                            className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
                          >
                            <svg
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.8"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="h-4 w-4"
                              aria-hidden="true"
                            >
                              <path d="M3 6h18" />
                              <path d="M8 6V4h8v2" />
                              <path d="M19 6l-1 14H6L5 6" />
                              <path d="M10 11v5" />
                              <path d="M14 11v5" />
                            </svg>
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
          <div className="create-soft-panel mt-6 rounded-2xl border-2 border-dotted border-brand/30 px-6 py-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand text-white shadow-sm">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6"
                aria-hidden="true"
              >
                <path d="m7 12 3 3 7-7" />
              </svg>
            </div>

            <p className="mt-4 text-sm font-semibold text-ink">
              You’re all caught up
            </p>

            <p className="mt-1 text-sm text-ink-muted">
              Create another listing whenever you’re ready.
            </p>

            <Link
              to="/listings/new"
              className="create-gradient-button mt-5 inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white transition"
            >
              <span aria-hidden="true">+</span>
              Create listing
            </Link>
          </div>
        </>
      )}

      {listingToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4 backdrop-blur-[2px]">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-listing-title"
            className="w-full max-w-sm rounded-2xl border border-border bg-surface p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              id="delete-listing-title"
              className="flex items-center gap-2 text-lg font-bold text-ink"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5 text-red-600"
                aria-hidden="true"
              >
                <path d="M3 6h18" />
                <path d="M8 6V4h8v2" />
                <path d="M19 6l-1 14H6L5 6" />
                <path d="M10 11v5" />
                <path d="M14 11v5" />
              </svg>
              Delete listing?
            </h2>

            <p className="mt-2 text-sm leading-6 text-ink-muted">
              This cannot be undone.
            </p>

            {deleteError && (
              <p className="mt-3 text-sm text-red-600">{deleteError}</p>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setListingToDelete(null)}
                disabled={isDeleting}
                className="rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-ink transition hover:bg-surface-muted disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Confirm delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
