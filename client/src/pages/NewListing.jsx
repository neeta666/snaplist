// New Listing page — AI generation, editing, and saving.

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import {
  generateListingSchema,
  saveListingSchema,
} from "../schemas/listingSchemas";
import { generateListingDraft, saveListing } from "../services/listingService";
import { extractApiError } from "../lib/apiErrors";

const GENERATE_FIELD_NAMES = [
  "image",
  "condition",
  "brand",
  "age",
  "originalPrice",
  "platformStyle",
];

const SAVE_FIELD_NAMES = [
  "title",
  "description",
  "category",
  "highlights",
  "estimatedPriceRange.min",
  "estimatedPriceRange.max",
  "askingPrice",
];

function UploadIcon({ className = "h-8 w-8" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M16 16l-4-4-4 4" />
      <path d="M12 12v9" />
      <path d="M20.4 17.5A5 5 0 0 0 18 8.2 7 7 0 0 0 4.3 10.4 4.5 4.5 0 0 0 5.5 19H7" />
    </svg>
  );
}

function ShieldIcon() {
  return (
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
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
      <path d="M12 8v8" />
      <path d="M9 12h6" />
    </svg>
  );
}

function LightbulbIcon() {
  return (
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
      <path d="M9 18h6" />
      <path d="M10 22h4" />
      <path d="M8.4 15.5A7 7 0 1 1 15.6 15.5C14.6 16.3 14 17.1 14 18h-4c0-.9-.6-1.7-1.6-2.5Z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3.5 w-3.5"
      aria-hidden="true"
    >
      <path d="m5 12 4 4L19 6" />
    </svg>
  );
}

function LockIcon() {
  return (
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
      <rect width="14" height="11" x="5" y="10" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4.5 w-4.5"
      aria-hidden="true"
    >
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v5" />
      <path d="M14 11v5" />
    </svg>
  );
}

function SparkleIcon({ className = "h-5 w-5" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 2c.8 5.1 4.9 9.2 10 10-5.1.8-9.2 4.9-10 10-.8-5.1-4.9-9.2-10-10 5.1-.8 9.2-4.9 10-10Z" />
    </svg>
  );
}

function ErrorText({ children }) {
  if (!children) return null;

  return <p className="mt-1.5 text-sm text-danger">{children}</p>;
}

export default function NewListing() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const reviewSectionRef = useRef(null);
  const shouldScrollToDraftRef = useRef(false);

  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [draft, setDraft] = useState(null);
  const [generationValues, setGenerationValues] = useState(null);

  const [askingPrice, setAskingPrice] = useState("");
  const [saveErrors, setSaveErrors] = useState({});
  const [saveFormError, setSaveFormError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(generateListingSchema),
  });

  const imageRegistration = register("image");

  // watch() returns the raw input value (a FileList), not the resolver's
  // transformed output — the [0] access here is separate from, and
  // unaffected by, the schema's FileList -> File transform used on submit.
  const watchedImage = watch("image");
  const selectedImage = watchedImage?.[0];

  useEffect(() => {
    const file = watchedImage?.[0];

    if (!file) {
      setPreviewUrl(null);
      return;
    }

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    return () => URL.revokeObjectURL(url);
  }, [watchedImage]);

  useEffect(() => {
    if (!draft || !shouldScrollToDraftRef.current) return;

    shouldScrollToDraftRef.current = false;

    reviewSectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, [draft]);

  const handleDragEnter = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.dropEffect = "copy";
    setIsDragging(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);

    const file = event.dataTransfer.files?.[0];
    if (!file) return;

    const transfer = new DataTransfer();
    transfer.items.add(file);

    setValue("image", transfer.files, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  };

  const onSubmit = async (values) => {
    setFormError("");
    setDraft(null);
    setGenerationValues(null);
    setAskingPrice("");
    setSaveErrors({});
    setSaveFormError("");
    setIsSubmitting(true);

    try {
      // values.image is already a single File — generateListingSchema
      // transforms the FileList before this resolves.
      const result = await generateListingDraft(values);

      shouldScrollToDraftRef.current = true;
      setDraft(result);

      // Retained for Save: not part of the AI draft response.
      setGenerationValues({
        condition: values.condition,
        brand: values.brand,
        age: values.age,
        originalPrice: values.originalPrice,
        platformStyle: values.platformStyle,
      });
    } catch (error) {
      const { message, fieldErrors } = extractApiError(error);

      let matchedAnyField = false;

      fieldErrors.forEach(({ field, message: fieldMessage }) => {
        if (GENERATE_FIELD_NAMES.includes(field)) {
          setError(field, {
            type: "server",
            message: fieldMessage,
          });
          matchedAnyField = true;
        }
      });

      if (!matchedAnyField) {
        setFormError(message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateDraftField = (field, value) => {
    setDraft((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const updateHighlight = (index, value) => {
    setDraft((current) => {
      const highlights = [...current.highlights];
      highlights[index] = value;

      return {
        ...current,
        highlights,
      };
    });
  };

  const removeHighlight = (index) => {
    setDraft((current) => ({
      ...current,
      highlights: current.highlights.filter((_, i) => i !== index),
    }));
  };

  const addHighlight = () => {
    setDraft((current) => ({
      ...current,
      highlights: [...current.highlights, ""],
    }));
  };

  const updatePriceRange = (key, value) => {
    setDraft((current) => ({
      ...current,
      estimatedPriceRange: {
        ...current.estimatedPriceRange,
        [key]: value,
      },
    }));
  };

  const handleSave = async () => {
    if (isSaving) return;

    setSaveErrors({});
    setSaveFormError("");

    const payload = {
      title: draft.title,
      description: draft.description,
      category: draft.category,
      highlights: draft.highlights,
      estimatedPriceRange: draft.estimatedPriceRange,
      condition: generationValues.condition,
      brand: generationValues.brand,
      age: generationValues.age,
      originalPrice: generationValues.originalPrice,
      platformStyle: generationValues.platformStyle,
      askingPrice,
      status: "draft",
      image: draft.image,
    };

    const result = saveListingSchema.safeParse(payload);

    if (!result.success) {
      const nextErrors = {};

      result.error.issues.forEach((issue) => {
        const field = issue.path.join(".");
        const errorKey = field.startsWith("highlights.") ? "highlights" : field;

        nextErrors[errorKey] = issue.message;
      });

      setSaveErrors(nextErrors);
      return;
    }

    setIsSaving(true);

    try {
      const savedListing = await saveListing(result.data);
      navigate(`/listings/${savedListing.id}`);
    } catch (error) {
      const { message, fieldErrors } = extractApiError(error);

      let matchedAnyField = false;

      fieldErrors.forEach(({ field, message: fieldMessage }) => {
        if (SAVE_FIELD_NAMES.includes(field)) {
          setSaveErrors((current) => ({
            ...current,
            [field]: fieldMessage,
          }));

          matchedAnyField = true;
        }
      });

      if (!matchedAnyField) {
        setSaveFormError(message);
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="create-page-shell pb-4 sm:pb-8">
      {/* Page heading */}
      <div className="relative z-10 mb-6 pt-1 sm:mb-7 sm:pt-2">
        <div className="mb-3 h-1 w-8 rounded-full bg-brand/70 sm:w-10" />

        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            Create a listing with AI
          </h1>

          <span className="flex items-center text-brand">
            <SparkleIcon className="h-7 w-7 sm:h-8 sm:w-8" />
            <SparkleIcon className="-ml-1 mt-5 h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </span>
        </div>

        <p className="mt-2 max-w-3xl text-sm leading-6 text-ink-muted sm:text-base">
          Upload a product photo and let AI suggest the details. Review and edit
          before saving.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="relative z-10 grid items-stretch gap-5 lg:grid-cols-2">
          {/* Product photo panel */}
          <section className="create-panel flex h-full flex-col rounded-2xl p-4 sm:p-6">
            <h2 className="text-lg font-bold text-ink sm:text-xl">
              1. Product photo
            </h2>

            <input
              id="image"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              name={imageRegistration.name}
              onBlur={imageRegistration.onBlur}
              onChange={imageRegistration.onChange}
              ref={(element) => {
                imageRegistration.ref(element);
                fileInputRef.current = element;
              }}
              className="sr-only"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              onDragEnter={handleDragEnter}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              data-dragging={isDragging}
              className="create-dropzone mt-5 flex min-h-[270px] w-full flex-col items-center justify-center overflow-hidden rounded-2xl px-5 py-7 text-center sm:min-h-[300px]"
              aria-label="Upload product photo"
            >
              {previewUrl ? (
                <>
                  <div className="flex w-full flex-1 items-center justify-center overflow-hidden">
                    <img
                      src={previewUrl}
                      alt="Selected product preview"
                      className="max-h-52 w-full rounded-xl object-contain sm:max-h-56"
                    />
                  </div>

                  <div className="mt-4">
                    <p className="max-w-full truncate text-sm font-semibold text-ink">
                      {selectedImage?.name}
                    </p>

                    <p className="mt-1 text-sm font-medium text-brand">
                      Click or drop another photo to replace
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <span className="flex h-20 w-20 items-center justify-center rounded-full bg-create-icon-bg text-brand">
                    <UploadIcon className="h-10 w-10" />
                  </span>

                  <p className="mt-4 text-base font-bold text-ink sm:text-lg">
                    Drag &amp; drop your photo here
                  </p>

                  <p className="mt-1.5 text-sm font-semibold text-brand sm:text-base">
                    or click to browse
                  </p>

                  <p className="mt-4 text-xs text-ink-muted sm:text-sm">
                    JPG, PNG or WEBP up to 8MB
                  </p>
                </>
              )}
            </button>

            <ErrorText>{errors.image?.message}</ErrorText>

            {/* Photo handling notice */}
            <div className="create-soft-panel mt-3 flex items-start gap-3 rounded-xl px-4 py-3">
              <span className="mt-0.5 shrink-0 text-brand">
                <ShieldIcon />
              </span>

              <div className="min-w-0 text-sm leading-5">
                <p className="font-medium text-ink">
                  Your photo is used to generate your listing.
                </p>

                <p className="text-ink-muted">
                  It remains attached to the listing if you choose to save it.
                </p>
              </div>
            </div>

            {/* Tips */}
            <div className="create-soft-panel relative mt-4 overflow-hidden rounded-xl px-4 py-4 sm:min-h-[150px]">
              <div className="relative z-10 sm:max-w-[62%]">
                <div className="flex items-center gap-2 text-sm font-semibold text-brand">
                  <LightbulbIcon />
                  <span>Tips for better results</span>
                </div>

                <ul className="mt-3 space-y-2.5">
                  {[
                    "Use clear, well-lit photos",
                    "Include the whole product",
                    "Avoid screenshots or collages",
                  ].map((tip) => (
                    <li
                      key={tip}
                      className="flex items-center gap-2.5 text-sm text-ink-muted"
                    >
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand text-white">
                        <CheckIcon />
                      </span>

                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Decorative stacked-photo illustration */}
              <div
                className="pointer-events-none absolute bottom-2 right-7 hidden h-28 w-32 sm:block"
                aria-hidden="true"
              >
                <div className="absolute bottom-3 right-3 h-20 w-24 rotate-6 rounded-xl bg-accent-soft/50" />

                <div className="absolute bottom-1 right-0 flex h-20 w-24 -rotate-3 items-center justify-center rounded-xl bg-create-icon-bg shadow-sm">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-11 w-11 text-brand/65"
                  >
                    <rect width="18" height="16" x="3" y="4" rx="2" />
                    <circle cx="9" cy="9" r="2" />
                    <path d="m21 15-5-5L5 20" />
                  </svg>
                </div>

                <span className="absolute -left-2 bottom-5 text-brand/50">
                  <SparkleIcon className="h-5 w-5" />
                </span>
              </div>
            </div>
          </section>

          {/* Details panel */}
          <section className="create-panel flex h-full flex-col rounded-2xl p-4 sm:p-6">
            <div>
              <div className="flex flex-wrap items-baseline gap-1.5">
                <h2 className="text-lg font-bold text-ink sm:text-xl">
                  2. Add a few details
                </h2>

                <span className="text-sm text-ink">(optional)</span>
              </div>

              <p className="mt-2 text-sm leading-6 text-ink-muted">
                These help AI generate more accurate suggestions.
              </p>
            </div>

            <div className="mt-6">
              <label
                htmlFor="platformStyle"
                className="block text-sm font-semibold text-ink"
              >
                Platform style
              </label>

              <select
                id="platformStyle"
                {...register("platformStyle")}
                defaultValue=""
                className="create-field mt-2 block h-12 w-full rounded-xl px-4 text-sm"
              >
                <option value="" disabled>
                  Select a platform style
                </option>

                <option value="general">General</option>
                <option value="olx">OLX</option>
                <option value="facebook">Facebook Marketplace</option>
              </select>

              <ErrorText>{errors.platformStyle?.message}</ErrorText>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-x-5 gap-y-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="condition"
                  className="block text-sm font-semibold text-ink"
                >
                  Condition
                </label>

                <select
                  id="condition"
                  {...register("condition")}
                  defaultValue=""
                  className="create-field mt-2 block h-12 w-full rounded-xl px-4 text-sm"
                >
                  <option value="">Not specified</option>
                  <option value="new">New</option>
                  <option value="like_new">Like new</option>
                  <option value="good">Good</option>
                  <option value="fair">Fair</option>
                </select>

                <ErrorText>{errors.condition?.message}</ErrorText>
              </div>

              <div>
                <label
                  htmlFor="brand"
                  className="block text-sm font-semibold text-ink"
                >
                  Brand
                </label>

                <input
                  id="brand"
                  type="text"
                  placeholder="e.g. Sony, IKEA"
                  {...register("brand")}
                  className="create-field mt-2 block h-12 w-full rounded-xl px-4 text-sm"
                />

                <ErrorText>{errors.brand?.message}</ErrorText>
              </div>

              <div>
                <label
                  htmlFor="age"
                  className="block text-sm font-semibold text-ink"
                >
                  Age
                </label>

                <input
                  id="age"
                  type="text"
                  placeholder="e.g. 1 year"
                  {...register("age")}
                  className="create-field mt-2 block h-12 w-full rounded-xl px-4 text-sm"
                />

                <ErrorText>{errors.age?.message}</ErrorText>
              </div>

              <div>
                <label
                  htmlFor="originalPrice"
                  className="block text-sm font-semibold text-ink"
                >
                  Original price (INR)
                </label>

                <input
                  id="originalPrice"
                  type="number"
                  step="1"
                  min="0"
                  placeholder="e.g. 5000"
                  {...register("originalPrice")}
                  className="create-field mt-2 block h-12 w-full rounded-xl px-4 text-sm"
                />

                <ErrorText>{errors.originalPrice?.message}</ErrorText>
              </div>
            </div>

            {formError && (
              <div className="mt-5 rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger">
                {formError}
              </div>
            )}

            <div className="mt-7">
              <button
                type="submit"
                disabled={isSubmitting}
                className="create-gradient-button flex h-14 w-full items-center justify-center gap-2 rounded-xl px-5 text-base font-bold text-white transition disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span>
                  {isSubmitting ? "Generating..." : "Generate Listing"}
                </span>

                {!isSubmitting && (
                  <span className="flex items-center">
                    <SparkleIcon className="h-5 w-5" />
                    <SparkleIcon className="-ml-1 mt-3 h-2.5 w-2.5" />
                  </span>
                )}
              </button>

              <div className="mt-4 flex items-center justify-center gap-2 text-center text-xs text-ink-muted sm:text-sm">
                <LockIcon />

                <span>You can review and edit everything before saving.</span>
              </div>
            </div>
          </section>
        </div>
      </form>

      {/* AI information strip */}
      <div className="relative z-10 mt-5 flex items-center gap-4 rounded-2xl border border-create-panel-border bg-create-soft px-4 py-4 sm:px-6">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-create-icon-bg text-brand">
          <SparkleIcon className="h-6 w-6" />
        </span>

        <div className="text-sm leading-6 sm:text-base">
          <p className="text-ink">
            AI will suggest the title, description, category and price range for
            you.
          </p>

          <p className="font-semibold text-brand">
            You&apos;re always in control.
          </p>
        </div>
      </div>

      {/* Generated draft */}
      {draft && (
        <section
          ref={reviewSectionRef}
          className="create-panel relative z-10 mt-7 scroll-mt-28 rounded-2xl p-4 sm:p-6 lg:p-7"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-ink sm:text-2xl">
                  Review your generated listing
                </h2>

                <span className="text-brand">
                  <SparkleIcon className="h-5 w-5" />
                </span>
              </div>

              <p className="mt-1.5 text-sm leading-6 text-ink-muted">
                AI has suggested these details. Edit anything you want before
                saving.
              </p>
            </div>

            <span className="rounded-full bg-brand-tint px-3 py-1 text-xs font-semibold text-brand">
              AI draft
            </span>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
            {/* Generated image */}
            <div>
              <div className="overflow-hidden rounded-2xl border border-create-panel-border bg-create-soft">
                <img
                  src={draft.image.url}
                  alt="Uploaded product"
                  className="aspect-square w-full object-cover"
                />
              </div>

              <div className="create-soft-panel mt-3 rounded-xl px-3 py-3 text-sm leading-5 text-ink-muted">
                This is the photo used to generate the listing.
              </div>
            </div>

            {/* Editable generated fields */}
            <div className="min-w-0 space-y-5">
              <div>
                <label
                  htmlFor="draft-title"
                  className="block text-sm font-semibold text-ink"
                >
                  Title
                </label>

                <input
                  id="draft-title"
                  type="text"
                  value={draft.title}
                  onChange={(event) =>
                    updateDraftField("title", event.target.value)
                  }
                  className="create-field mt-2 block w-full rounded-xl px-4 py-3 text-sm"
                />

                <ErrorText>{saveErrors.title}</ErrorText>
              </div>

              <div>
                <label
                  htmlFor="draft-description"
                  className="block text-sm font-semibold text-ink"
                >
                  Description
                </label>

                <textarea
                  id="draft-description"
                  rows={5}
                  value={draft.description}
                  onChange={(event) =>
                    updateDraftField("description", event.target.value)
                  }
                  className="create-field mt-2 block w-full resize-y rounded-xl px-4 py-3 text-sm"
                />

                <ErrorText>{saveErrors.description}</ErrorText>
              </div>

              <div>
                <label
                  htmlFor="draft-category"
                  className="block text-sm font-semibold text-ink"
                >
                  Category
                </label>

                <input
                  id="draft-category"
                  type="text"
                  value={draft.category}
                  onChange={(event) =>
                    updateDraftField("category", event.target.value)
                  }
                  className="create-field mt-2 block w-full rounded-xl px-4 py-3 text-sm"
                />

                <ErrorText>{saveErrors.category}</ErrorText>
              </div>

              <div>
                <span className="block text-sm font-semibold text-ink">
                  Highlights
                </span>

                <div className="mt-2 space-y-2.5">
                  {draft.highlights.map((highlight, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={highlight}
                        onChange={(event) =>
                          updateHighlight(index, event.target.value)
                        }
                        className="create-field block min-w-0 flex-1 rounded-xl px-4 py-3 text-sm"
                      />

                      <button
                        type="button"
                        onClick={() => removeHighlight(index)}
                        aria-label={`Remove highlight ${index + 1}`}
                        title="Remove highlight"
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-create-input-border text-ink-muted transition-colors hover:bg-nav-active-bg hover:text-ink"
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  ))}
                </div>

                {draft.highlights.length < 6 && (
                  <button
                    type="button"
                    onClick={addHighlight}
                    className="mt-3 text-sm font-semibold text-brand hover:text-brand-hover"
                  >
                    + Add highlight
                  </button>
                )}

                <ErrorText>{saveErrors.highlights}</ErrorText>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="draft-price-min"
                    className="block text-sm font-semibold text-ink"
                  >
                    Estimated min (INR)
                  </label>

                  <input
                    id="draft-price-min"
                    type="number"
                    min="0"
                    value={draft.estimatedPriceRange.min}
                    onChange={(event) =>
                      updatePriceRange("min", event.target.value)
                    }
                    className="create-field mt-2 block w-full rounded-xl px-4 py-3 text-sm"
                  />

                  <ErrorText>{saveErrors["estimatedPriceRange.min"]}</ErrorText>
                </div>

                <div>
                  <label
                    htmlFor="draft-price-max"
                    className="block text-sm font-semibold text-ink"
                  >
                    Estimated max (INR)
                  </label>

                  <input
                    id="draft-price-max"
                    type="number"
                    min="0"
                    value={draft.estimatedPriceRange.max}
                    onChange={(event) =>
                      updatePriceRange("max", event.target.value)
                    }
                    className="create-field mt-2 block w-full rounded-xl px-4 py-3 text-sm"
                  />

                  <ErrorText>{saveErrors["estimatedPriceRange.max"]}</ErrorText>
                </div>
              </div>

              <div>
                <label
                  htmlFor="asking-price"
                  className="block text-sm font-semibold text-ink"
                >
                  Asking price (INR)
                </label>

                <input
                  id="asking-price"
                  type="number"
                  min="0"
                  value={askingPrice}
                  onChange={(event) => setAskingPrice(event.target.value)}
                  className="create-field mt-2 block w-full rounded-xl px-4 py-3 text-sm"
                />

                <ErrorText>{saveErrors.askingPrice}</ErrorText>
              </div>

              {saveFormError && (
                <div className="rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger">
                  {saveFormError}
                </div>
              )}

              <div className="pt-1">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="create-gradient-button flex min-h-12 w-full items-center justify-center rounded-xl px-5 py-3 text-sm font-bold text-white transition disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:min-w-44"
                >
                  {isSaving ? "Saving..." : "Save Listing"}
                </button>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
