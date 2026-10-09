import { useEffect, useState } from 'react';
import axios from 'axios';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, A11y, Keyboard } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import './App.css';

const API_URL = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');
const EMPTY_FILTERS = { minPrice: '', maxPrice: '', sortBy: '' };
const COLORS = { yellow: 'Yellow Gold', white: 'White Gold', rose: 'Rose Gold' };

function ProductImage({ src, alt }) {
  const [status, setStatus] = useState('loading');
  const [attempt, setAttempt] = useState(0);
  return <div className="image-frame" aria-busy={status === 'loading'}>
    <img key={attempt} src={src} alt={alt} style={{ visibility: status === 'loaded' ? 'visible' : 'hidden' }}
      onLoad={() => setStatus('loaded')} onError={() => setStatus('error')} />
    {status === 'loading' && <span className="image-status" role="status">Loading image…</span>}
    {status === 'error' && <div className="image-status" role="status">Image unavailable<br />
      <button type="button" className="text-button" onClick={() => { setStatus('loading'); setAttempt(n => n + 1); }}>Retry image</button>
    </div>}
  </div>;
}

function ProductCard({ product }) {
  const [color, setColor] = useState('yellow');
  const src = product.images[color];
  return <article className="product-card">
    <ProductImage key={src} src={src} alt={`${product.name} — ${COLORS[color]}`} />
    <div className="product-details">
      <h2>{product.name}</h2>
      <p className="price">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(product.computedPrice)} <span>USD</span></p>
      <p className="color-name" aria-live="polite">{COLORS[color]}</p>
      <div className="swatches" role="group" aria-label={`Metal color for ${product.name}`}>
        {Object.entries(COLORS).map(([value, label]) => <button key={value} type="button"
          className={`swatch ${value}`} aria-label={`${label} for ${product.name}`} title={label}
          aria-pressed={value === color} onClick={() => setColor(value)} />)}
      </div>
      <p className="rating"><span aria-hidden="true">★</span> {product.popularityOutOf5.toFixed(1)} / 5 <span className="muted">popularity</span></p>
    </div>
  </article>;
}

export default function App() {
  const [draft, setDraft] = useState(EMPTY_FILTERS);
  const [query, setQuery] = useState(EMPTY_FILTERS);
  const [retry, setRetry] = useState(0);
  const [products, setProducts] = useState([]);
  const [pricing, setPricing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [validation, setValidation] = useState('');
  const [desktop, setDesktop] = useState(() => window.matchMedia('(min-width: 768px)').matches);
  useEffect(() => {
    const media = window.matchMedia('(min-width: 768px)');
    const update = () => setDesktop(media.matches);
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      setLoading(true); setError('');
      try {
        const params = Object.fromEntries(Object.entries(query).filter(([, value]) => value !== ''));
        const response = await axios.get(`${API_URL}/products`, { params, signal: controller.signal, timeout: 12000 });
        if (!Array.isArray(response.data?.data) || !response.data?.pricing ||
            response.data.data.some(p => !p.id || !p.images || !Number.isFinite(p.computedPrice))) {
          throw new Error('The API returned an unexpected response. Check the backend address.');
        }
        if (!controller.signal.aborted) { setProducts(response.data.data); setPricing(response.data.pricing); }
      } catch (err) {
        if (!controller.signal.aborted) setError(err.response?.data?.error || (err.code ? 'Could not load products. Check that the backend is running, then retry.' : err.message));
      } finally { if (!controller.signal.aborted) setLoading(false); }
    }
    load();
    return () => controller.abort();
  }, [query, retry]);
  function apply(event) {
    event.preventDefault();
    if (draft.minPrice !== '' && draft.maxPrice !== '' && Number(draft.minPrice) > Number(draft.maxPrice)) {
      setValidation('Minimum price must not exceed maximum price.'); return;
    }
    setValidation(''); setQuery({ ...draft });
  }
  function reset() { setDraft(EMPTY_FILTERS); setQuery({ ...EMPTY_FILTERS }); setValidation(''); }
  return <main>
    <header className="page-header"><p className="eyebrow">THE ENGAGEMENT COLLECTION</p><h1>Find your forever piece.</h1>
      <p className="subtitle">Explore eight designs in yellow, white and rose gold.</p></header>
    <form className="filters" onSubmit={apply}>
      <label>Min price (USD)<input type="number" min="0" step="0.01" placeholder="No minimum" value={draft.minPrice} onChange={e => setDraft({ ...draft, minPrice: e.target.value })} /></label>
      <label>Max price (USD)<input type="number" min="0" step="0.01" placeholder="No maximum" value={draft.maxPrice} onChange={e => setDraft({ ...draft, maxPrice: e.target.value })} /></label>
      <label>Sort by<select value={draft.sortBy} onChange={e => setDraft({ ...draft, sortBy: e.target.value })}>
        <option value="">Collection order</option><option value="priceAsc">Price: Low → High</option><option value="priceDesc">Price: High → Low</option><option value="popularity">Popularity</option>
      </select></label><button className="primary" disabled={loading}>Apply</button><button type="button" className="secondary" onClick={reset}>Reset</button>
    </form>
    {validation && <p className="message error" role="alert">{validation}</p>}
    {loading ? <div className="message" role="status">Loading collection…</div> : error ?
      <div className="message error" role="alert">{error}<br /><button className="secondary" onClick={() => setRetry(n => n + 1)}>Retry</button></div> : <>
        <div className="collection-info"><span>{products.length} {products.length === 1 ? 'design' : 'designs'}</span>
          <span className={`quote ${pricing.source}`}>
            {pricing.source === 'demo' ? `Demo prices · sample gold rate $${pricing.pricePerGram.toFixed(2)}/g` :
             `${pricing.source === 'stale' ? 'Last available' : 'Live gold'} rate · $${pricing.pricePerGram.toFixed(2)}/g · fetched ${new Date(pricing.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
          </span>
        </div>
        {pricing.source === 'stale' && <p className="message">Live pricing could not be refreshed. Prices use the last successful quote.</p>}
        {products.length === 0 ? <div className="message" role="status">No designs match this price range.<br /><button className="secondary" onClick={reset}>Clear filters</button></div> :
          desktop ? <Swiper key={JSON.stringify(query)} modules={[Navigation, A11y, Keyboard]} navigation keyboard={{ enabled: true }}
            spaceBetween={28} slidesPerView={2} breakpoints={{ 1100: { slidesPerView: 3 } }}>
            {products.map(p => <SwiperSlide key={p.id}><ProductCard product={p} /></SwiperSlide>)}
          </Swiper> : <div className="mobile-grid">{products.map(p => <ProductCard key={p.id} product={p} />)}</div>}
      </>}
    <footer>Portfolio case study · USD pricing · Gold quotes cached for up to 5 minutes</footer>
  </main>;
}
