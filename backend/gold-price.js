const TROY_OUNCE_GRAMS = 31.1034768;

function createGoldPriceService({ apiKey, mode = apiKey ? 'live' : 'demo', demoRate = 70,
  fetchImpl = fetch, now = Date.now, ttlMs = 300000, retryMs = 30000 } = {}) {
  if (!['live', 'demo'].includes(mode)) throw new Error('GOLD_PRICE_MODE must be live or demo');
  if (!Number.isFinite(demoRate) || demoRate <= 0) throw new Error('DEMO_GOLD_PRICE must be positive');
  let cached, pending, retryAfter = 0;
  const result = (quote, source) => ({ ...quote, source, currency: 'USD', unit: 'gram' });
  return async function getGoldPrice() {
    if (mode === 'demo') return result({ pricePerGram: demoRate, updatedAt: null }, 'demo');
    if (!apiKey) throw new Error('Live pricing is not configured');
    if (cached && now() - cached.fetchedAt < ttlMs) return result(cached, 'cached');
    if (now() < retryAfter) {
      if (cached) return result(cached, 'stale');
      throw new Error('Live gold pricing is temporarily unavailable');
    }
    if (!pending) pending = (async () => {
      try {
        const response = await fetchImpl('https://www.goldapi.io/api/XAU/USD', {
          headers: { 'x-access-token': apiKey, Accept: 'application/json' },
          signal: AbortSignal.timeout(8000),
        });
        if (!response.ok) throw new Error('Gold provider rejected the request');
        const data = await response.json();
        if (data.error || typeof data.price !== 'number' || !Number.isFinite(data.price) || data.price <= 0)
          throw new Error('Invalid gold quote');
        cached = { pricePerGram: data.price / TROY_OUNCE_GRAMS,
          updatedAt: new Date(now()).toISOString(), fetchedAt: now() };
        return result(cached, 'live');
      } catch {
        retryAfter = now() + retryMs;
        if (cached) return result(cached, 'stale');
        throw new Error('Live gold pricing is temporarily unavailable');
      } finally { pending = null; }
    })();
    return pending;
  };
}
module.exports = { createGoldPriceService };
