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

## Deployment (Production)

This repository includes Docker production setup files:

- `docker-compose.prod.yml`
- `backend/Dockerfile`
- `frontend/Dockerfile`
- `frontend/nginx.conf`

### 1. Prepare backend environment

Create `backend/.env` on your server (or update the existing file) with production values.

Minimum required:

```env
PORT=5000
MONGODB_URI=<your-mongodb-uri>
JWT_SECRET=<strong-secret>
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost
ADMIN_EMAIL=admin@football.local
ADMIN_PASSWORD=Admin123!
```

### 2. Build and run with Docker Compose

From the repository root:

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

### 3. Seed demo data (optional)

After containers are up, seed data from backend container:

```bash
docker compose -f docker-compose.prod.yml exec backend npm run seed
```

### 4. Access application

- Frontend: `http://<server-ip>/`
- Admin login: `http://<server-ip>/login`

### 5. Useful commands

```bash
# View logs
docker compose -f docker-compose.prod.yml logs -f

# Restart services
docker compose -f docker-compose.prod.yml restart

# Stop services
docker compose -f docker-compose.prod.yml down
```

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

## Deploy nhanh (Vercel, Netlify, GitHub)

Muc tieu don gian nhat:

- Frontend: deploy tren Vercel hoac Netlify
- Backend: deploy tren Render (de chay Express + Socket on dinh)
- Database: MongoDB Atlas

Ly do: Vercel/Netlify rat hop frontend, con backend Express realtime se on dinh hon tren Render/Railway.

### Option 1: Vercel (frontend) + Render (backend) + GitHub

1. Day code len GitHub (repo nay).
2. Tao Backend tren Render:
	- New + Web Service
	- Connect repo GitHub
	- Root Directory: `backend`
	- Build Command: `npm install && npm run build`
	- Start Command: `npm run start`
3. Dat bien moi truong backend tren Render:
	- `PORT=5000`
	- `MONGODB_URI=<atlas-uri>`
	- `JWT_SECRET=<secret-manh>`
	- `JWT_EXPIRES_IN=7d`
	- `CLIENT_URL=<url-frontend-sau-khi-deploy>`
	- `ADMIN_EMAIL=admin@football.local`
	- `ADMIN_PASSWORD=<doi-mat-khau-manh>`
4. Sau khi backend live, copy URL backend vi du `https://your-api.onrender.com`.
5. Tao Frontend tren Vercel:
	- Import repo tu GitHub
	- Root Directory: `frontend`
	- Build Command: `npm run build`
	- Output Directory: `dist`
6. Dat bien moi truong frontend tren Vercel:
	- `VITE_API_URL=https://your-api.onrender.com/api`
	- `VITE_SOCKET_URL=https://your-api.onrender.com`
7. Redeploy frontend. Xong.

### Option 2: Netlify (frontend) + Render (backend)

1. Backend lam y nhu Option 1 (Render).
2. Tren Netlify:
	- Add new site from Git
	- Chon repo
	- Repo da co san `netlify.toml`, chi can Import va Deploy
	- Neu can set tay: Base directory `frontend`, Build command `npm run build`, Publish directory `dist`
3. Dat env frontend tren Netlify:
	- `VITE_API_URL=https://your-api.onrender.com/api`
	- `VITE_SOCKET_URL=https://your-api.onrender.com`
4. Deploy lai site.
5. Da co san SPA redirect trong repo (`netlify.toml` + `frontend/public/_redirects`) nen route `/login`, `/book-sunday`, `/admin/*` se khong bi 404.

### Option 3: GitHub auto deploy don gian

Neu ban muon "push code la tu deploy":

1. Su dung GitHub repo lam nguon deploy cho ca Render va Vercel/Netlify.
2. Bat Auto Deploy tren Render (branch `main`).
3. Bat Auto Deploy tren Vercel hoac Netlify (branch `main`).
4. Moi lan `git push` len `main`, frontend va backend se tu build lai.

### Kiem tra sau deploy

1. Mo frontend URL va truy cap trang `/login`.
2. Dang nhap tai khoan admin.
3. Kiem tra nhanh API health: `https://your-api.onrender.com/api/health` phai tra ve `status: ok`.
4. Neu frontend goi API loi CORS, cap nhat lai `CLIENT_URL` trong backend = dung domain frontend.

### Goi y nhanh de it loi

1. Luon dat `CLIENT_URL` trung khop domain frontend that.
2. Neu doi domain frontend, nho sua lai `CLIENT_URL` va redeploy backend.
3. Khong de mat khau mac dinh `Admin123!` trong production.


Tài khoản mẫu

admin@football.local / Admin123!