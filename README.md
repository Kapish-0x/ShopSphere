# ShopSphere

A full-stack, multi-vendor e-commerce marketplace built on the MERN stack, supporting independent sellers, role-based access across five user types, a complete order fulfillment lifecycle, and AI-assisted product listings.

**Live demo:** https://shop-sphere-delta-coral.vercel.app
**API base URL:** https://shopsphere-4c0v.onrender.com/api

> Note: the backend is hosted on Render's free tier, which spins down after periods of inactivity. The first request after idle time may take 30–60 seconds to respond while the server wakes up.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [API Overview](#api-overview)
- [Roles & Permissions](#roles--permissions)
- [Order Lifecycle](#order-lifecycle)
- [AI Integration](#ai-integration)
- [Deployment](#deployment)
- [Known Limitations](#known-limitations)
- [License](#license)

---

## Overview

ShopSphere is a marketplace where multiple independent sellers list and manage their own products under a single storefront, while customers shop across all of them in one unified cart and checkout. It was built as a capstone project to demonstrate a production-shaped MERN application: REST APIs, MongoDB schema design, JWT authentication with refresh tokens, role-based authorization, a multi-vendor order-splitting and state-machine system, and AI-assisted content generation.

## Features

**Catalog & Commerce**
- Multi-vendor product catalog with categories, variants, and per-variant inventory
- Cart that splits automatically into per-seller sub-orders at checkout, under a single customer-facing order
- Inventory reservation system — stock is held during checkout and only committed on order confirmation, preventing overselling
- Full order state machine: `placed → confirmed → packed → shipped → delivered`, with `cancelled`, `returned`, and `refunded` branches
- Coupons (percentage/flat, usage limits, minimum order value)
- Reviews tied to verified purchases, with a moderation queue and seller replies
- Return/refund request workflow, separate from but synchronized with order status
- Wishlist

**Accounts & Access**
- JWT authentication (short-lived access token + long-lived refresh token)
- Five roles: Customer, Seller, Admin, Support Agent, Delivery Partner
- Password reset flow, email verification tokens
- Role-based route protection on both API and frontend

**Operations**
- Seller dashboard: revenue, order breakdown, low-stock alerts, top products
- Admin dashboard: platform-wide stats, pending store/product approvals
- Store and product approval workflows
- Support ticket system
- In-app notifications, triggered automatically on key events (order status changes, approvals, review moderation)
- Audit logging on administrative actions

**AI**
- AI-generated product descriptions and key selling points from structured attributes (via Groq)
- Semantic product search using vector embeddings (via Google Gemini), auto-indexed on product approval

## Tech Stack

**Frontend**
- React (Vite)
- React Router
- Tailwind CSS
- Axios
- Context API for global state (auth, cart)

**Backend**
- Node.js / Express
- MongoDB with Mongoose
- JWT (access + refresh token pattern)
- bcrypt for password hashing

**AI Services**
- Groq (`openai/gpt-oss-120b`) — text generation for product descriptions
- Google Gemini (`gemini-embedding-001`) — text embeddings for semantic search

**Infrastructure**
- MongoDB Atlas — production database
- Render — backend hosting
- Vercel — frontend hosting

## Architecture

```
┌─────────────┐      HTTPS       ┌──────────────┐      Mongoose       ┌─────────────┐
│  React SPA  │ ───────────────▶ │  Express API  │ ──────────────────▶ │  MongoDB    │
│  (Vercel)   │ ◀─────────────── │  (Render)     │ ◀────────────────── │  Atlas      │
└─────────────┘   JSON / REST    └──────┬───────┘                     └─────────────┘
                                         │
                                         ├──▶ Groq API (description generation)
                                         └──▶ Gemini API (embeddings / semantic search)
```

Authentication uses a short-lived JWT access token (sent as a Bearer header) paired with a longer-lived refresh token. The frontend's Axios instance automatically retries a failed request once after silently refreshing an expired access token.

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local via [MongoDB Community Server](https://www.mongodb.com/try/download/community) + [Compass](https://www.mongodb.com/products/tools/compass), or a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) cluster)
- API keys: [Groq](https://console.groq.com) (free) and [Google Gemini](https://aistudio.google.com/apikey) (free tier)

### Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in `backend/` (see [Environment Variables](#environment-variables) below).

```bash
npm run dev
```

The API will run on `http://localhost:4000` (or the port set in `.env`).

### Frontend Setup

```bash
cd frontend
npm install
```

In `src/api/axiosInstance.js`, confirm `BASE_URL` points at your backend (defaults to `http://localhost:4000/api` for local development).

```bash
npm run dev
```

The app will run on `http://localhost:5173`.

### Creating an Admin Account

Admin accounts cannot be created through public registration by design. To get one:
1. Register a normal account through the app.
2. In MongoDB Compass (or Atlas), open the `users` collection and manually change that document's `role` field to `"admin"`.
3. Log out and log back in — the new JWT will carry the updated role.

## Environment Variables

Backend `.env`:

```env
PORT=4000
MONGODB_URI=mongodb://localhost:27017/shopsphere
ACCESS_TOKEN_SECRET=<random 32+ character string>
REFRESH_TOKEN_SECRET=<a different random 32+ character string>
GROQ_API_KEY=<your Groq API key>
GEMINI_API_KEY=<your Gemini API key>
```

> Never commit `.env` to version control. Confirm it's listed in `.gitignore` before pushing.

## Project Structure

```
ShopSphere/
├── backend/
│   ├── api/              # Route handlers, grouped by resource
│   ├── models/            # Mongoose schemas + shared model-layer logic
│   │   └── orderStateMachine.js
│   │   └── notifyUser.js
│   ├── middleware/
│   │   └── verifyToken.js # JWT verification + role-based guards
│   └── server.js
└── frontend/
    ├── src/
    │   ├── api/           # Axios instance with token refresh interceptor
    │   ├── context/       # AuthContext, CartContext (React Context API)
    │   ├── components/
    │   │   ├── common/    # Navbar, ProtectedRoute, Loader
    │   │   └── product/   # ProductCard
    │   ├── pages/
    │   │   ├── seller/    # Seller dashboard, store, product management
    │   │   └── admin/     # Admin dashboard, approvals, user management
    │   └── App.jsx         # Route definitions
    └── index.html
```

## API Overview

All endpoints are prefixed with `/api`. Full route list by resource:

| Resource | Base Path | Notes |
|---|---|---|
| Auth | `/auth` | register, login, refresh-token, logout, forgot/reset password |
| Users | `/users` | profile, addresses, admin user management |
| Wishlist | `/wishlist` | add/remove/view |
| Stores | `/stores` | create, browse, approve; `/stores/admin/all` for admin moderation view |
| Categories | `/categories` | nested category CRUD |
| Products | `/products` | CRUD, search/filter, stock updates; `/products/admin/all` for moderation |
| Cart | `/cart` | add/update/remove items |
| Orders | `/orders` | checkout, status transitions, role-aware listing |
| Coupons | `/coupons` | create, validate, apply |
| Reviews | `/reviews` | verified-purchase reviews, moderation |
| Returns | `/returns` | return/refund request workflow |
| Support | `/support` | support ticket threads |
| Notifications | `/notifications` | in-app notifications |
| Delivery | `/delivery` | delivery partner's assigned shipments |
| Dashboard | `/dashboard` | seller and admin analytics |
| Audit Logs | `/audit-logs` | admin action history |
| AI | `/ai` | description generation, semantic search |

Most write operations require a valid `Authorization: Bearer <token>` header and are further restricted by role.

## Roles & Permissions

| Role | Capabilities |
|---|---|
| **Customer** | Browse, cart, checkout, order history, reviews, returns, wishlist, support tickets |
| **Seller** | Store setup, product CRUD, order fulfillment, seller dashboard, review replies |
| **Admin** | Store/product approval, user management, category management, platform dashboard, audit log access |
| **Support Agent** | Support ticket handling, return/refund processing |
| **Delivery Partner** | View and update status of assigned shipments |

## Order Lifecycle

A single checkout can span multiple sellers. One `Order` is created per checkout, containing an array of `subOrders` — one per seller involved — each progressing independently through its own status:

```
placed → confirmed → packed → shipped → delivered
   │         │           │
   └── cancelled ─────────┘
                              delivered → returned → refunded
```

Inventory is reserved at checkout and only committed (stock actually decremented) when a sub-order is confirmed, preventing race conditions between simultaneous checkouts on the same stock.

## AI Integration

| Feature | Provider | Model |
|---|---|---|
| Product description generation | Groq | `openai/gpt-oss-120b` |
| Semantic search embeddings | Google Gemini | `gemini-embedding-001` |

Product descriptions are generated from structured attributes (title, category, key-value attributes) on seller request. Semantic search embeds product text into vectors on admin approval, and ranks search queries by cosine similarity rather than keyword matching — so a query like "warm winter clothing" can surface a product titled "Insulated Jacket" with no shared keywords.

## Deployment

- **Backend** is deployed on Render, connected to a MongoDB Atlas cluster. Environment variables are set directly in Render's dashboard (not read from `.env`, which is gitignored).
- **Frontend** is deployed on Vercel, pointed at the Render backend URL.
- Local development and production use **separate databases** — data created locally (via Compass) does not appear in the deployed app, and vice versa.

## Known Limitations

- No automated test suite.
- Password reset and email verification tokens are logged to the server console rather than sent via a real email service.
- Product images are supplied as URLs; there is no file upload integration.
- CORS is currently open to all origins (`cors()` with no restrictions) — acceptable for development/demo, but should be locked to specific origins before any real production use.

## License

This project was built for educational purposes as part of a MERN/MDSA capstone.
