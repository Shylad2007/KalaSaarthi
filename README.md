# KalaSaarthi

### Empowering Indian artisans with AI-assisted cataloguing and digital market access

KalaSaarthi is a digital platform designed to help traditional and marginalized artisans present their craft online, create clearer product listings, and connect with potential buyers. It combines an artisan-focused product workflow with AI-assisted tools and a buyer marketplace.

> **Project status:** Prototype / active development. Feature availability may vary as integrations and end-to-end testing continue.

---

## The Problem

Many traditional artisans face barriers when trying to sell their work online. Creating professional product descriptions, photographing and listing products, estimating suitable prices, and reaching new customers can be difficult—especially when digital tools are unfamiliar or language is a barrier.

## Our Approach

KalaSaarthi aims to make the process more accessible through a guided digital experience:

- **Simpler product listing:** Help artisans turn basic product information into a structured catalogue entry.
- **Voice-assisted input:** Support describing products without requiring every detail to be typed.
- **AI-assisted insights:** Explore product-image analysis and pricing assistance to improve listings.
- **Digital marketplace:** Give buyers a place to discover artisan products and place orders.
- **Artisan-focused experience:** Keep product management and order workflows organized in one place.

## Key Features

### For Artisans
- Artisan account and profile workflow.
- Dashboard for managing the artisan experience.
- Guided product creation and catalogue management.
- Product image upload.
- Voice or text-based product description input.
- AI-assisted catalogue content generation.
- AI-assisted image analysis and pricing support, where configured.
- Product and inventory-related tools.
- Order management.
- Personalized recommendations and opportunity discovery as those modules are integrated.

### For Buyers
- Browse the product marketplace.
- View product details.
- Add products to a cart.
- Place orders through the prototype checkout flow.
- View order history and order status, where implemented.

### AI-Assisted Capabilities
KalaSaarthi is being developed with AI-assisted workflows intended to reduce the effort required to list and present products:

- **Catalogue generation:** Help transform artisan-provided details into a more structured product listing.
- **Voice transcription:** Convert recorded speech into text for product descriptions, subject to the configured speech/AI service.
- **Image intelligence:** Explore useful information from uploaded product images.
- **Pricing assistance:** Provide indicative pricing support; recommendations should be reviewed by the artisan before publishing.

AI-generated content and estimates should be checked by the user. They are intended as assistance, not guaranteed facts or professional valuations.

---

## Technology Stack

The current development setup has been described as:

| Layer | Technology |
|---|---|
| Frontend | React, TypeScript, Vite |
| Styling | Tailwind CSS |
| Backend API | Python, Flask |
| Local database | SQLite |
| Cloud database option | PostgreSQL through a configurable database URL, such as Neon |
| Image storage | Supabase Storage |
| AI integrations | Google Gemini |
| Image processing | OpenCV |

The stack and integrations may evolve during development. Check the project configuration files for the exact versions and enabled services.

## High-Level Architecture

```text
Artisan / Buyer
      |
      v
React + TypeScript Frontend
      |
      v
Flask API
  |       |        |
  v       v        v
Database  AI APIs  Image Storage
(SQLite / Gemini   Supabase
 PostgreSQL)       Storage
      |
      v
Products, profiles, carts and orders
```

---

## Typical User Journey

1. A user enters the platform as an artisan or buyer.
2. An artisan completes their profile and starts creating a product listing.
3. The artisan uploads product images and provides details through text or the available voice workflow.
4. Configured AI tools assist with catalogue content and other product insights.
5. The artisan reviews and saves or publishes the listing.
6. Buyers discover products, view details, and use the available cart and order flow.
7. Artisans manage products and incoming orders through their workspace.

The exact journey depends on which modules are enabled in the current build.

## Project Goals

- Make digital product cataloguing more approachable for artisans.
- Reduce the effort needed to prepare product listings.
- Support voice-assisted and AI-assisted workflows.
- Improve discoverability of traditional and handmade products.
- Bring product and order management into a single experience.
- Explore personalized access to relevant schemes, opportunities, and product-revival guidance.

## Responsible Use

- Artisans should review AI-generated descriptions and suggested prices before publishing.
- Pricing outputs are estimates, not guaranteed market prices.
- Do not upload personal or confidential information unless the application is designed to handle it safely.
- Keep secrets in local environment configuration or a dedicated secrets manager.

## Acknowledgements

Built as a project exploring how accessible digital tools and AI-assisted workflows can help traditional artisans showcase their work and reach broader markets.

---

**KalaSaarthi — preserving craft, enabling discovery.**
