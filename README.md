# UM Calendar Mobile (Vue + Tailwind)

Mobile-first recreation of the Stitch project screens with backend integration:

- Project: `793837254966450246`
- Screens: Daily (`b1f0f60db7dc4789980a3197ee142436`), Weekly (`e69900d3d8114feaaff77b5277326d8d`), Monthly (`0d792d2a69d2449499f45c888301f926`)

## Features

- Vue 3 + Vite + Tailwind CSS
- Connects to backend endpoints:
	- `GET /data/names`
	- `GET /data/cal/:name`
- Custom dropdown (mobile-first, hidden scrollbar)
- Cached store in `localStorage` for:
	- color mode
	- group selection
	- calendar selection
	- calendar names cache (TTL)
- Stitch HTML and screenshot assets downloaded to `public/stitch`

## Run

1. Start backend (`um-calendar-backend-go`) on `http://localhost:8080`
2. Start frontend:

```bash
npm install
npm run dev
```

## Optional environment variable

Set `VITE_API_BASE` if backend is not the same origin/proxy target.

Example `.env`:

```bash
VITE_API_BASE=http://localhost:8080
```

## Deploy to Cloudflare Pages

This project is ready for Cloudflare Pages with a built-in Pages Function proxy:

- Frontend stays static (`dist`)
- Requests to `/data/*` are proxied by `functions/data/[[path]].js`
- Proxy target is controlled by `API_ORIGIN` (Cloudflare environment variable)

### 1) Install dependencies

```bash
npm install
```

### 2) Set backend origin in Cloudflare

In Cloudflare Pages project settings, add environment variable:

- `API_ORIGIN=https://your-backend-domain`

Set it for both **Production** and **Preview** environments.

### 3) Build and deploy from CLI

```bash
npm run cf:deploy
```

The first deploy may prompt for:

- Cloudflare login (`wrangler login`)
- Project name (use `um-calendar-mobile`)

### 4) Local Cloudflare-style testing (optional)

Create local vars file from example:

```bash
cp .dev.vars.example .dev.vars
```

Then run:

```bash
npm run build
npm run cf:dev
```

This serves `dist` with Pages Functions enabled, so `/data/*` calls behave like production.
