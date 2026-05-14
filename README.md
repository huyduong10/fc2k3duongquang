# Football Dashboard Monorepo

A full-stack football management dashboard with a dark sports UI, admin authentication, CRUD modules, real-time-ready backend, and seed data.

## Tech Stack

- Frontend: React, Vite, TypeScript, TailwindCSS, Recharts, Socket.IO client
- Backend: Node.js, Express, TypeScript, MongoDB, Mongoose, JWT, Socket.IO
- Extras: Cloudinary upload support, Excel/PDF export helpers, responsive dashboard UI

## Structure

```txt
frontend/
backend/
```

## Features

- Admin login with JWT
- Player CRUD with search, filter, and sorting
- Match CRUD with participant and scorer tracking
- Payment tracking with checklist status and totals
- Dashboard statistics and charts
- Socket.IO events for live updates
- Cloudinary image upload endpoint ready
- Demo seed data included

## Getting Started

1. Install dependencies from the root:

```bash
npm install
```

2. Create environment files from `.env.example` and update values.

3. Start MongoDB locally or use a hosted MongoDB URI.

4. Seed the database:

```bash
npm run seed
```

5. Start both apps:

```bash
npm run dev
```

## Scripts

- `npm run dev` - run frontend and backend together
- `npm run build` - build both apps
- `npm run seed` - load demo admin, players, matches, and payments

## Default Admin

If you use the sample seed data, login with:

- Email: `admin@football.local`
- Password: `Admin123!`

## Environment Variables

See `.env.example` for the full list of required variables.

## Notes

- The backend exposes REST APIs under `/api`.
- The frontend expects `VITE_API_URL` and `VITE_SOCKET_URL`.
- Cloudinary support is included for avatar/media uploads.
