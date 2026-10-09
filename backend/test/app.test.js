const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createApp } = require('../app');
const { createGoldPriceService } = require('../gold-price');

test('demo pricing never calls provider', async () => {
 const get = createGoldPriceService({ mode:'demo', fetchImpl: () => { throw Error('must not fetch'); } });
 const result=await get();assert.equal(result.source,'demo');assert.equal(result.pricePerGram,70);
});
test('valid provider result converts troy ounces, caches, coalesces concurrent requests', async () => {
 let calls=0;const get=createGoldPriceService({apiKey:'test-only',fetchImpl:async()=>{calls++; return {ok:true,json:async()=>({price:3110.34768})}}});
 const results=await Promise.all([get(),get()]);assert.equal(calls,1);assert.ok(Math.abs(results[0].pricePerGram-100)<0.00001);
 assert.equal((await get()).source,'cached');assert.equal(calls,1);
});
test('HTTP and malformed quotes fail explicitly instead of returning null prices', async () => {
 for (const response of [{ok:false},{ok:true,json:async()=>({error:'invalid key'})},{ok:true,json:async()=>({price:0})}]) {
  const get=createGoldPriceService({apiKey:'test-only',fetchImpl:async()=>response});
  await assert.rejects(get(),/unavailable/);
 }
});
test('expired quote is explicitly marked stale after provider failure',async()=>{
 let time=1000000,fail=false,calls=0;const get=createGoldPriceService({apiKey:'test-only',now:()=>time,ttlMs:10,fetchImpl:async()=>{calls++;if(fail)throw Error('offline');return {ok:true,json:async()=>({price:3110.34768})}}});
 await get();time+=11;fail=true;assert.equal((await get()).source,'stale');assert.equal((await get()).source,'stale');assert.equal(calls,2);
});
test('products: pricing, IDs, filters, sorting, validation, empty state',async t=>{
 const server=createApp({getGoldPrice:createGoldPriceService({mode:'demo'})}).listen(0,'127.0.0.1');
 await new Promise(r=>server.once('listening',r));t.after(()=>server.close());
 const base=`http://127.0.0.1:${server.address().port}/products`;
 const read=async q=>(await fetch(base+q)).json();
 const all=await read('');assert.equal(all.data.length,8);assert.equal(all.data[0].computedPrice,271.95);assert.equal(new Set(all.data.map(p=>p.id)).size,8);assert.equal(all.pricing.source,'demo');
 const asc=(await read('?sortBy=priceAsc')).data;assert.deepEqual(asc.map(p=>p.computedPrice),asc.map(p=>p.computedPrice).sort((a,b)=>a-b));
 const desc=(await read('?sortBy=priceDesc')).data;assert.equal(desc[0].computedPrice,asc.at(-1).computedPrice);
 const popular=(await read('?sortBy=popularity')).data;assert.equal(popular[0].popularityScore,.92);
 assert.ok((await read('?minPrice=300&maxPrice=500')).data.every(p=>p.computedPrice>=300&&p.computedPrice<=500));
 assert.equal((await read('?maxPrice=1')).data.length,0);
 for(const q of ['?minPrice=abc','?minPrice=-1','?minPrice=500&maxPrice=2','?sortBy=bad','?minPrice='])assert.equal((await fetch(base+q)).status,400);
});
test('provider outage returns actionable 503, never a secret',async t=>{
 const server=createApp({getGoldPrice:async()=>{throw Error('secret provider details')}}).listen(0,'127.0.0.1');
 await new Promise(r=>server.once('listening',r));t.after(()=>server.close());
 const response=await fetch(`http://127.0.0.1:${server.address().port}/products`);assert.equal(response.status,503);assert.ok(!(await response.text()).includes('secret'));
});
