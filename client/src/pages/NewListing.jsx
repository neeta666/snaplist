// New Listing page — AI generation, editing, and saving.

import { useState, useEffect } from "react";
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

export default function NewListing() {
  const navigate = useNavigate();

  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
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
    watch,
    formState: { errors },
  } = useForm({ resolver: zodResolver(generateListingSchema) });

  // watch() returns the raw input value (a FileList), not the resolver's
  // transformed output — the [0] access here is separate from, and
  // unaffected by, the schema's FileList -> File transform used on submit.
  const watchedImage = watch("image");

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
          setError(field, { type: "server", message: fieldMessage });
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
    setDraft((current) => ({ ...current, [field]: value }));
  };

  const updateHighlight = (index, value) => {
    setDraft((current) => {
      const highlights = [...current.highlights];
      highlights[index] = value;
      return { ...current, highlights };
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
    if (isSaving) return; // prevent duplicate saves

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
          setSaveErrors((current) => ({ ...current, [field]: fieldMessage }));
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
    <div className="max-w-2xl">
      <h1 className="text-xl font-semibold text-gray-900">New Listing</h1>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mt-6 space-y-4"
        noValidate
      >
        <div>
          <label
            htmlFor="image"
            className="block text-sm font-medium text-gray-700"
          >
            Product photo
          </label>
          <input
            id="image"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            {...register("image")}
            className="mt-1 block w-full text-sm"
          />
          {errors.image && (
            <p className="mt-1 text-sm text-red-600">{errors.image.message}</p>
          )}
          {previewUrl && (
            <img
              src={previewUrl}
              alt="Selected product preview"
              className="mt-3 h-48 w-full rounded-md border border-gray-200 object-cover sm:w-48"
            />
          )}
        </div>

        <div>
          <label
            htmlFor="platformStyle"
            className="block text-sm font-medium text-gray-700"
          >
            Platform style
          </label>
          <select
            id="platformStyle"
            {...register("platformStyle")}
            defaultValue=""
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="" disabled>
              Select a platform style
            </option>
            <option value="general">General</option>
            <option value="olx">OLX</option>
            <option value="facebook">Facebook Marketplace</option>
          </select>
          {errors.platformStyle && (
            <p className="mt-1 text-sm text-red-600">
              {errors.platformStyle.message}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="condition"
              className="block text-sm font-medium text-gray-700"
            >
              Condition
            </label>
            <select
              id="condition"
              {...register("condition")}
              defaultValue=""
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="">Not specified</option>
              <option value="new">New</option>
              <option value="like_new">Like new</option>
              <option value="good">Good</option>
              <option value="fair">Fair</option>
            </select>
            {errors.condition && (
              <p className="mt-1 text-sm text-red-600">
                {errors.condition.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="brand"
              className="block text-sm font-medium text-gray-700"
            >
              Brand
            </label>
            <input
              id="brand"
              type="text"
              {...register("brand")}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
            {errors.brand && (
              <p className="mt-1 text-sm text-red-600">
                {errors.brand.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="age"
              className="block text-sm font-medium text-gray-700"
            >
              Age
            </label>
            <input
              id="age"
              type="text"
              placeholder="e.g. 1 year"
              {...register("age")}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
            {errors.age && (
              <p className="mt-1 text-sm text-red-600">{errors.age.message}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="originalPrice"
              className="block text-sm font-medium text-gray-700"
            >
              Original price (INR)
            </label>
            <input
              id="originalPrice"
              type="number"
              step="1"
              min="0"
              {...register("originalPrice")}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
            {errors.originalPrice && (
              <p className="mt-1 text-sm text-red-600">
                {errors.originalPrice.message}
              </p>
            )}
          </div>
        </div>

        {formError && <p className="text-sm text-red-600">{formError}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 sm:w-auto"
        >
          {isSubmitting ? "Generating..." : "Generate"}
        </button>
      </form>

      {draft && (
        <div className="mt-8 space-y-4 border-t border-gray-200 pt-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Generated draft
          </h2>

          <img
            src={draft.image.url}
            alt="Uploaded product"
            className="h-48 w-full rounded-md border border-gray-200 object-cover sm:w-48"
          />

          <div>
            <label
              htmlFor="draft-title"
              className="block text-sm font-medium text-gray-700"
            >
              Title
            </label>
            <input
              id="draft-title"
              type="text"
              value={draft.title}
              onChange={(e) => updateDraftField("title", e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
            {saveErrors.title && (
              <p className="mt-1 text-sm text-red-600">{saveErrors.title}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="draft-description"
              className="block text-sm font-medium text-gray-700"
            >
              Description
            </label>
            <textarea
              id="draft-description"
              rows={5}
              value={draft.description}
              onChange={(e) => updateDraftField("description", e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
            {saveErrors.description && (
              <p className="mt-1 text-sm text-red-600">
                {saveErrors.description}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="draft-category"
              className="block text-sm font-medium text-gray-700"
            >
              Category
            </label>
            <input
              id="draft-category"
              type="text"
              value={draft.category}
              onChange={(e) => updateDraftField("category", e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
            {saveErrors.category && (
              <p className="mt-1 text-sm text-red-600">{saveErrors.category}</p>
            )}
          </div>

          <div>
            <span className="block text-sm font-medium text-gray-700">
              Highlights
            </span>
            <div className="mt-1 space-y-2">
              {draft.highlights.map((highlight, index) => (
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
            {draft.highlights.length < 6 && (
              <button
                type="button"
                onClick={addHighlight}
                className="mt-2 text-sm font-medium text-gray-900 underline"
              >
                Add highlight
              </button>
            )}
            {saveErrors.highlights && (
              <p className="mt-1 text-sm text-red-600">
                {saveErrors.highlights}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="draft-price-min"
                className="block text-sm font-medium text-gray-700"
              >
                Estimated min (INR)
              </label>
              <input
                id="draft-price-min"
                type="number"
                min="0"
                value={draft.estimatedPriceRange.min}
                onChange={(e) => updatePriceRange("min", e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
              {saveErrors["estimatedPriceRange.min"] && (
                <p className="mt-1 text-sm text-red-600">
                  {saveErrors["estimatedPriceRange.min"]}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="draft-price-max"
                className="block text-sm font-medium text-gray-700"
              >
                Estimated max (INR)
              </label>
              <input
                id="draft-price-max"
                type="number"
                min="0"
                value={draft.estimatedPriceRange.max}
                onChange={(e) => updatePriceRange("max", e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
              {saveErrors["estimatedPriceRange.max"] && (
                <p className="mt-1 text-sm text-red-600">
                  {saveErrors["estimatedPriceRange.max"]}
                </p>
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor="asking-price"
              className="block text-sm font-medium text-gray-700"
            >
              Asking price (INR)
            </label>
            <input
              id="asking-price"
              type="number"
              min="0"
              value={askingPrice}
              onChange={(e) => setAskingPrice(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
            {saveErrors.askingPrice && (
              <p className="mt-1 text-sm text-red-600">
                {saveErrors.askingPrice}
              </p>
            )}
          </div>

          {saveFormError && (
            <p className="text-sm text-red-600">{saveFormError}</p>
          )}

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="w-full rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 sm:w-auto"
          >
            {isSaving ? "Saving..." : "Save Listing"}
          </button>
        </div>
      )}
    </div>
  );
}
