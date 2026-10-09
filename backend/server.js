const path = require('node:path');
require('dotenv').config({ path: path.join(__dirname, '.env'), quiet: true });
const { createApp } = require('./app');
const { createGoldPriceService } = require('./gold-price');
const mode = process.env.GOLD_PRICE_MODE || (process.env.GOLD_API_KEY ? 'live' : 'demo');
const getGoldPrice = createGoldPriceService({ apiKey: process.env.GOLD_API_KEY, mode,
  demoRate: Number(process.env.DEMO_GOLD_PRICE || 70) });
const allowedOrigins = (process.env.FRONTEND_ORIGINS || 'http://localhost:5173,http://127.0.0.1:5173').split(',').map(s => s.trim());
createApp({ getGoldPrice, allowedOrigins }).listen(process.env.PORT || 4000, () => {
  console.log(`Jewelry API running on port ${process.env.PORT || 4000} (${mode} pricing)`);
});
