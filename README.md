# KalaSaarthi

**AI-Driven Market Linkage & Digital Empowerment for Indian Artisans**

KalaSaarthi is a full-stack platform designed to bridge the digital gap for traditional Indian craftspeople. It equips artisans with AI-powered cataloguing, voice assistance, fair pricing suggestions, and direct access to nationwide buyers through a responsive, modern marketplace.

---

## 🌟 Key Features

### For Artisans
- **Profile & Onboarding:** Step-by-step onboarding capturing craft category, materials, geography, and artisan background.
- **AI Voice-to-Catalogue:** Speak in natural language (Hindi/English) to transcribe audio into structured product descriptions and tags using Gemini AI.
- **Image Intelligence & Storage:** Upload product photography directly backed by Supabase Storage with image quality feedback.
- **Smart Dynamic Pricing:** Pricing assistant evaluating material costs, craft type, and production hours to recommend sustainable selling prices.
- **Revival Engine:** Product health scoring diagnostics flagging incomplete or underperforming listings with actionable tips.
- **Government Scheme Linkages:** Curated national and state artisanal initiatives (e.g., PM Vishwakarma Yojana, MUDRA, GeM) matched to the artisan's profile.
- **Order Management:** View incoming buyer orders, review delivery addresses, and update fulfillment statuses (Placed, Confirmed, Preparing, Shipped, Delivered).

### For Buyers
- **Handicrafts Marketplace:** Browse authentic crafts filtered by category (Handloom, Pottery, Jewelry, Woodcraft, Embroidery, etc.) and search terms.
- **Product Details:** High-resolution product images, craft stories, artisan location attribution, and transparent pricing.
- **Cart & Checkout:** Add items, manage quantities, enter delivery details, and place Cash on Delivery (COD) orders with duplicate prevention.
- **Order Tracking:** Track placed orders with progressive status updates reflecting real-time artisan fulfillment.

---

## 💻 Tech Stack

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons
- **Backend:** Python 3.11+, Flask, Flask-CORS, SQLAlchemy / SQLite
- **AI Integrations:** Google Gemini API (transcription, catalogue generation, pricing guidance)
- **Object Storage:** Supabase Storage (`supabase-py`) for product image uploads
- **Authentication:** JWT-based token authentication with role-based routing (Artisan vs. Buyer)

---

## 📁 Project Structure

```text
KalaSaarthi/
├── backend/
│   ├── app/
│   │   ├── services/
│   │   │   ├── ai_service.py     # Gemini AI catalog, voice & pricing helpers
│   │   │   └── storage.py        # Supabase storage integration & validation
│   │   └── ...
│   ├── main.py                   # Flask API entry point & routes
│   └── requirements.txt          # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/           # Shared layouts & navigation (ArtisanLayout)
│   │   ├── pages/
│   │   │   ├── artisan/          # Dashboard, Catalogue, Add/Edit Product, Orders
│   │   │   ├── auth/             # Artisan & Buyer login / registration
│   │   │   ├── buyer/            # Marketplace, ProductDetail, Cart, BuyerOrders
│   │   │   └── Landing.tsx       # Public editorial homepage
│   │   ├── AuthContext.tsx       # Auth state & token storage
│   │   ├── api.ts                # API client & fetch wrappers
│   │   └── index.css             # Design tokens & Tailwind theme
│   ├── package.json
│   └── vite.config.ts
└── README.md
```

---

## 🚀 Local Setup Instructions

### Prerequisites
- Node.js (v18 or higher) & npm
- Python (v3.10 or higher)

### 1. Backend Setup

```bash
cd backend
python -m venv venv

# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
# source venv/bin/activate

pip install -r requirements.txt
```

Create a `backend/.env` file with the following variables:

```env
# Application Secrets
SECRET_KEY=your_flask_secret_key_here

# Google Gemini AI
AI_API_KEY=your_gemini_api_key_here

# Supabase Storage Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_supabase_service_or_anon_key_here
SUPABASE_BUCKET=product-images
```

Run the backend server:

```bash
python main.py
```
*Backend runs on `http://127.0.0.1:8000`.*

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:5173`.*

---

## 📌 Development Status & Current Limitations

- **Current Status:** Core marketplace, authentication, order lifecycle, artisan workspace, and Supabase image uploads are implemented and tested end-to-end.
- **Payments:** Checkout currently defaults to Cash on Delivery (COD); digital payment gateways (UPI, Razorpay) are planned for subsequent milestones.
- **AI Rate Limits:** Voice transcription and AI generation feature graceful fallbacks to rule-based heuristics if the external AI service rate-limits or is unavailable.
