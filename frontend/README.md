# ShopSphere Frontend

React + Vite + Tailwind CSS frontend for the ShopSphere multi-vendor marketplace.

## Setup

1. Copy the contents of this folder into your existing `frontend/` project, overwriting matching files.
2. Install any missing dependencies:
   ```
   npm install react-router-dom axios
   npm install -D tailwindcss postcss autoprefixer
   ```
3. In `src/api/axiosInstance.js`, confirm `BASE_URL` matches your backend's actual port.
4. Run `npm run dev`.

## What's included

- **Auth**: Login, Register (role selection), token refresh handled automatically via axios interceptors
- **Customer**: Home (search), Product detail (variants, AI description, reviews), Cart, Checkout, Orders (list + detail with return requests), Wishlist, Profile (addresses)
- **Seller**: Dashboard (revenue/stats), Store setup/approval status, Product CRUD (with AI description generation button), Order fulfillment (status transitions)
- **Admin**: Dashboard (platform stats, pending approvals), Store approval, Product approval, User management, Category management
- **Role-based routing**: `ProtectedRoute` component redirects based on login state and role

## Known gaps / things to build next

- **Admin "pending stores" view**: `GET /api/stores` on the backend only returns *approved* stores (by design, for public browsing). The admin `ManageStores` page currently reuses this endpoint, so it won't show pending stores waiting for approval. You'll want to either add a `?status=pending` query param support on the backend, or a separate admin-only endpoint that returns all stores regardless of status.
- **Support ticket UI**: backend routes exist (`/api/support`) but no frontend pages were built for it yet.
- **Delivery partner UI**: backend routes exist (`/api/delivery`) but no frontend pages were built for it yet.
- **Notifications UI**: backend creates notifications automatically, but there's no bell icon / notification list in the frontend yet.
- **Coupon UI**: no coupon input field on the Checkout page yet — backend `/api/coupons/validate` is ready to be wired in.
- **Semantic search UI**: backend `/api/ai/semantic-search` exists but Home page currently only uses the regular `$text` search endpoint.
- **Image uploads**: variant `imageUrls` currently expects a URL string — no file upload UI was built (would need a cloud storage integration like Cloudinary).

## Notes

- State management: React Context (`AuthContext`, `CartContext`) — no Redux.
- Styling: Tailwind CSS utility classes only, no component library.
- Cart is server-synced (not just local state) so it persists across sessions.
