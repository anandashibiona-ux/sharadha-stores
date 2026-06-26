# Architecture Overview — Sharadha Stores

## System Diagram

```
Browser (React App — port 5173)
         │
         │  HTTP / REST (JSON)
         ▼
Express API Server (Node.js — port 3001)
         │
         │  Prisma ORM (SQL)
         ▼
PostgreSQL Database (port 5432)
```

## Frontend → Backend Communication

- The Vite dev server proxies all `/api/*` requests to `http://localhost:3001`.
- In production, configure Nginx/Cloud Run to route `/api/*` to the backend service.
- All API calls live in `frontend/src/services/api.js` — no fetch calls scattered across components.

## State Management

- **Cart state**: React Context (`CartContext.jsx`) backed by the backend DB (via `sessionId` in localStorage).
- **Product/order state**: Local component state via `useState` + `useEffect`.
- No Redux or external state library needed at this scale.

## Key Design Decisions

| Decision | Rationale |
|---|---|
| PostgreSQL over Firebase | Relational data (orders → order_items → products) fits SQL naturally; easier to query for admin reporting |
| Prisma ORM | Type-safe queries, automatic migration generation, seeding support |
| Guest checkout (no login) | Reduces complexity; session ID in localStorage is enough for cart; order number shared for tracking |
| Atomic order transaction | `prisma.$transaction()` ensures stock decrement + order creation + cart clear happen together — no overselling |
| Zod validation on backend | Schema validation with specific error messages; mirrors frontend validators |
| Admin key in header | Simplest possible protection for a student prototype; replace with JWT in production |

## Folder Structure

```
cart-checkout-system/
├── frontend/src/
│   ├── components/
│   │   ├── common/      # Navbar, LoadingSpinner, StateComponents, StatusBadge
│   │   ├── product/     # ProductCard, ProductGrid
│   │   ├── cart/        # CartItem, CartDrawer
│   │   └── checkout/    # CheckoutComponents (AddressForm, DeliveryOptions, OrderSummary)
│   ├── pages/
│   │   ├── Home, ProductDetail, Cart, Checkout, OrderConfirmation, OrderStatus
│   │   └── admin/       # Dashboard, StockManagement
│   ├── context/CartContext.jsx
│   ├── services/api.js
│   └── utils/validators.js
│
├── backend/src/
│   ├── routes/          # Express routers (products, cart, orders, admin)
│   ├── controllers/     # Business logic
│   ├── services/        # stock.service.js (stock decrement/restore)
│   ├── middleware/       # adminAuth, validateRequest, errorHandler
│   └── db/prisma.js     # Singleton Prisma client
│
└── backend/prisma/
    ├── schema.prisma    # Full relational schema
    └── seed.js          # 12 realistic products
```
