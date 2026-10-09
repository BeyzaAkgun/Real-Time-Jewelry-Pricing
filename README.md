# Real-Time Jewelry Pricing

React + Express portfolio case study: an eight-product jewelry collection with three metal finishes, responsive desktop carousel/mobile grid, price filtering and sorting. Product prices use the original case-study formula:

`(popularityScore + 1) × weightInGrams × goldPriceUSDPerGram`

Popularity is a pricing multiplier in this assignment, not a claim about how real retail jewelry prices are determined. The displayed score is popularity, not customer reviews.

## Start locally (Windows / macOS / Linux)

Use Node.js 22.12+ (Node 22 LTS recommended). Open two terminals at the project root.

Terminal 1:

```sh
cd backend
npm ci
npm run dev
```

Terminal 2:

```sh
cd frontend
npm ci
npm run dev
```

Open http://localhost:5173. Backend defaults to port 4000. No .env or API key is required for demo mode: the UI explicitly labels prices as demo prices at a sample rate of USD 70/g. This is not a current market quote. Product images are local assets, so color switching does not depend on the external image CDN at runtime.

## Enable live GoldAPI pricing
1. Create an API key in your GoldAPI account.
2. Copy `backend/.env.example` to `backend/.env` (in PowerShell: `Copy-Item .env.example .env` from backend).
3. Set `GOLD_PRICE_MODE=live` and put the API key in `GOLD_API_KEY` locally.
4. Restart the backend.

The key stays on the server. NEVER put it in a VITE_ variable, source file, screenshot, or commit.

Pricing is fetched on demand and cached in memory for five minutes. Concurrent requests share the same provider request. Failed requests back off for 30 seconds. When refresh fails, an existing quote is returned with `source: stale`; the UI shows it as the last available rate. With no successful live quote, the API returns 503. It never silently passes demo data off as live. HTTP failures, invalid JSON/data, non-positive prices and timeouts are handled. Quote cache resets on server restart. There is no automatic background refresh.

## Frontend API configuration

Development defaults to `/api`, proxied by Vite to http://127.0.0.1:4000. The same proxy works with `npm run preview`. No frontend .env is necessary locally.

For a separate deployed backend, set `VITE_API_URL=https://your-backend-host` BEFORE building the frontend, and set backend `FRONTEND_ORIGINS` to the deployed frontend origin (comma-separated if several). Do not append `/products` to VITE_API_URL. Hosting uses its own environment-variable settings for the private GoldAPI key. If the backend port changes locally, update the target in vite.config.js.

## API

- `GET /health`
- `GET /products?minPrice=100&maxPrice=1000&sortBy=priceAsc`
- Sort options: `priceAsc`, `priceDesc`, `popularity` (omit for collection order).
- Invalid/negative prices, reversed bounds or unsupported sort: HTTP 400.
- Response: `{ data: [...], pricing: { pricePerGram, source, updatedAt, currency, unit } }`.
- Sources: `demo`, `live`, `cached`, `stale`.
- Product IDs are stable across sorting/filtering. Image paths are relative to the frontend host.

## Checks

```sh
npm test --prefix backend
npm run lint --prefix frontend
npm run build --prefix frontend
```

GitHub Actions runs these checks. Backend tests use stubbed provider responses and require no credentials.

## Assets

`image-sources.json` records the original third-party URLs supplied by the case-study dataset. Bundling does not establish ownership or grant additional image rights. The supplied fonts remain in `frontend/public/Fonts`.
