# SnapList — Initial Project Plan (Version 1)

> ⚠️ **RECONSTRUCTED DOCUMENT — NOT THE AUTHORITATIVE ORIGINAL**
> This file was reconstructed from conversation history when populating
> `docs/` during Slice 0. It was not re-derived from or diffed against the
> original approved Project Plan file, and may not be byte-for-byte
> identical to it. **This file must be replaced with the exact original
> approved Project Plan before being treated as a frozen, authoritative
> source.** Do not cite this reconstruction as the frozen original in any
> future decision-making until it has been replaced or explicitly verified
> against the true original.

> Guiding Principle: Build a polished MVP, not a feature-heavy product. Every
> feature should strengthen the core workflow: Upload → AI Generate → Edit →
> Save → Manage. If a feature doesn't improve that workflow or can't be
> completed within the timeline, it should be deferred to a later version.

## 1. Project Goal

SnapList is an AI-powered SaaS web application that helps users quickly
create professional marketplace listings from photos of items they want to
sell.

Instead of spending time writing titles, descriptions, categories, and
pricing information manually, users simply upload a photo, provide a few
basic details, and let AI generate a polished listing that can be edited and
copied to platforms like OLX or Facebook Marketplace.

The objective is to build a modern, polished MVP that demonstrates strong
full-stack engineering and AI integration while remaining realistic for a
solo developer to complete in approximately 7–10 normal working days.

## 2. Why This Project?

Most people have unused items they want to sell. Writing a good listing is
often the hardest part. People usually struggle with:

- Writing an attractive title
- Writing a detailed description
- Choosing the correct category
- Deciding on a reasonable selling price
- Formatting listings for different platforms

SnapList solves this problem by using AI to generate a professional listing
in seconds.

## 3. Target Users

The application is designed for regular people rather than software
developers. Example users: someone selling an old phone, furniture,
electronics, clothes, books, or household items. No technical knowledge
should be required.

## 4. Core User Flow

1. User signs up or logs in.
2. User uploads a photo of an item.
3. User provides a few optional details such as condition, brand, age,
   original price (optional).
4. AI analyzes the image and user inputs.
5. AI generates: title, description, category, key selling points, estimated
   price range.
6. User edits the generated content if desired.
7. User selects a listing style (General, OLX, Facebook Marketplace).
8. User saves the listing.
9. User manages all listings from a personal dashboard.
10. User copies the final listing and posts it anywhere.

## 5. MVP Features

**Authentication:** registration, login, JWT authentication, profile page.

**AI Listing Generation:** listing title, description, category, key
features/highlights, estimated price range (clearly presented as an AI
estimate).

**Image Upload:** upload one image, Cloudinary storage, image preview.

**Listing Editor:** users can edit title, description, category, price,
condition before saving.

**Listing Management:** each listing can be Draft, Active, or Sold. Users can
view, edit, delete listings, and change status.

**Dashboard:** listing cards (thumbnail, status, price, creation date),
search, filter by status, filter by category.

**Platform Style:** listings optimized for General Marketplace, OLX, Facebook
Marketplace — this changes tone and formatting rather than creating
completely different content.

**Copy & Export:** copy generated listing to clipboard, reuse saved listings
later.

## 6. UI / UX Goals

The application should feel like a real SaaS product: responsive design,
clean modern UI, loading skeletons, empty states, error states, success
notifications, image previews, fast navigation.

## 7. Dashboard Statistics

Simple overview cards: Total Listings, Draft Listings, Active Listings, Sold
Listings. Basic chart showing listing distribution by status.

## 8. Technical Goals

- **Frontend:** React, Tailwind CSS
- **Backend:** Node.js, Express
- **Database:** MongoDB
- **Authentication:** JWT
- **Image Storage:** Cloudinary
- **AI:** Vision-capable LLM for image understanding, text generation for listings
- **Deployment:** Frontend (Vercel), Backend (Render or Railway), MongoDB Atlas
- **Containerization:** Docker support

## 9. What This Project Is NOT

SnapList is not: an online marketplace, an e-commerce website, a buyer/seller
platform, a payment system, or a live auction platform. Its purpose is to
generate and manage listings.

## 10. Version 2 Ideas (Future Enhancements)

Not part of the initial build: multiple photos, AI condition detection, real
market price comparison, listing analytics, public user profiles, buyer
chat, marketplace integrations, notifications, mobile app, team accounts.

## 11. Resume Objective

This project is intended to demonstrate: full-stack application development,
authentication, AI integration, image upload workflow, CRUD operations,
cloud storage, REST API design, dashboard development, responsive UI, clean
architecture, production-ready engineering practices.
