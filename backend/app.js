const express = require('express');
const cors = require('cors');
const products = require('./products.json');

function createApp({ getGoldPrice, allowedOrigins = ['http://localhost:5173', 'http://127.0.0.1:5173'] }) {
  const app = express();
  app.disable('x-powered-by');
  app.use(cors({ origin: allowedOrigins }));
  app.get('/health', (_req, res) => res.json({ status: 'ok' }));
  app.get('/products', async (req, res) => {
    const { minPrice, maxPrice, sortBy = '' } = req.query;
    const isPrice = v => v === undefined || (typeof v === 'string' && v.trim() !== '' && Number.isFinite(Number(v)) && Number(v) >= 0);
    if (!isPrice(minPrice) || !isPrice(maxPrice) ||
        (minPrice !== undefined && maxPrice !== undefined && Number(minPrice) > Number(maxPrice)) ||
        !['', 'priceAsc', 'priceDesc', 'popularity'].includes(sortBy)) {
      return res.status(400).json({ error: 'Use valid non-negative prices, min ≤ max, and a supported sort option.' });
    }
    try {
      const quote = await getGoldPrice();
      let data = products.map(p => ({ ...p,
        computedPrice: Number(((p.popularityScore + 1) * p.weight * quote.pricePerGram).toFixed(2)),
        popularityOutOf5: Number((p.popularityScore * 5).toFixed(1)),
      })).filter(p => (minPrice === undefined || p.computedPrice >= Number(minPrice)) &&
        (maxPrice === undefined || p.computedPrice <= Number(maxPrice)));
      if (sortBy === 'priceAsc') data.sort((a,b) => a.computedPrice - b.computedPrice);
      if (sortBy === 'priceDesc') data.sort((a,b) => b.computedPrice - a.computedPrice);
      if (sortBy === 'popularity') data.sort((a,b) => b.popularityScore - a.popularityScore);
      const { fetchedAt: _fetchedAt, ...pricing } = quote;
      res.set('Cache-Control', 'no-store').json({ data, pricing });
    } catch {
      res.status(503).json({ error: 'Live pricing is unavailable. Please try again shortly.' });
    }
  });
  return app;
}
module.exports = { createApp };
