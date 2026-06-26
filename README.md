# Sharadha Stores

A full-stack e-commerce application for Sharadha Stores with cart, checkout, and admin management.

## Tech Stack

- **Frontend**: React 18 + Vite + TailwindCSS
- **Backend**: Express.js + Prisma ORM + SQLite
- **Payments**: Razorpay integration

## Getting Started

### Backend
```bash
cd backend
npm install
node server.js
```
Backend runs on `http://localhost:3001`

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on `http://localhost:5173`

## Environment Variables

### Backend (`backend/.env`)
```
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
ADMIN_KEY=your-admin-key
JWT_SECRET=your-jwt-secret
```

### Frontend (`frontend/.env`)
```
VITE_API_BASE_URL=http://localhost:3001
```
