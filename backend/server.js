// require("dotenv").config();
// const express = require("express");
// const fs = require("fs");
// const path = require("path");
// const cors = require("cors");

// const app = express();
// const PORT = process.env.PORT || 4000;

// app.use(cors());

// // 1️⃣ products.json dosyasını oku
// const productsPath = path.join(__dirname, "products.json");
// let products = [];
// try {
//   const raw = fs.readFileSync(productsPath, "utf8");
//   products = JSON.parse(raw);
// } catch (err) {
//   console.error("Error reading products.json:", err.message);
// }

// // 2️⃣ Altın fiyatı (gram başına, USD) — şimdilik sabit
// const goldPricePerGram = 70;

// // 3️⃣ Yardımcı: Fiyat hesaplama
// function calculatePrice(popularityScore, weight) {
//   return ((popularityScore + 1) * weight * goldPricePerGram).toFixed(2);
// }

// // 4️⃣ /products endpoint’i (filtreleme + sıralama dahil)
// app.get("/products", (req, res) => {
//   const { minPrice, maxPrice, sortBy } = req.query;

//   // Hesaplanmış ürün listesi
//   let updated = products.map((p) => ({
//     ...p,
//     computedPrice: Number(calculatePrice(p.popularityScore, p.weight)),
//     popularityOutOf5: +(p.popularityScore * 5).toFixed(1),
//   }));

//   // 💰 Fiyat aralığı filtresi
//   if (minPrice || maxPrice) {
//     updated = updated.filter((p) => {
//       if (minPrice && p.computedPrice < Number(minPrice)) return false;
//       if (maxPrice && p.computedPrice > Number(maxPrice)) return false;
//       return true;
//     });
//   }

//   // ⭐ Sıralama
//   if (sortBy === "priceAsc") {
//     updated.sort((a, b) => a.computedPrice - b.computedPrice);
//   } else if (sortBy === "priceDesc") {
//     updated.sort((a, b) => b.computedPrice - a.computedPrice);
//   } else if (sortBy === "popularity") {
//     updated.sort((a, b) => b.popularityScore - a.popularityScore);
//   }

//   res.json({ data: updated });
// });

// // 5️⃣ Test endpoint
// app.get("/", (req, res) => {
//   res.send("Backend running 🚀");
// });

// // 6️⃣ Server başlat
// app.listen(PORT, () => {
//   console.log(`Server listening on http://localhost:${PORT}`);
// });



require("dotenv").config();
const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");


const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());

// 1️⃣ products.json dosyasını oku
const productsPath = path.join(__dirname, "products.json");
let products = [];
try {
  const raw = fs.readFileSync(productsPath, "utf8");
  products = JSON.parse(raw);
} catch (err) {
  console.error("Error reading products.json:", err.message);
}

// 2️⃣ Gold fiyatını gerçek zamanlı çek
async function fetchGoldPriceUSDPerGram() {
  try {
    const res = await fetch("https://www.goldapi.io/api/XAU/USD", {
      headers: {
        "x-access-token": process.env.GOLD_API_KEY,
        "Content-Type": "application/json",
      },
    });

    const data = await res.json();

    // API genelde ons başına fiyat döner → gram’a çevirelim
    // 1 troy ounce = 31.1035 gram
    const pricePerGram = data.price / 31.1035;
    console.log("💰 Current Gold Price (USD/gram):", pricePerGram.toFixed(2));

    return pricePerGram;
  } catch (err) {
    console.error("Error fetching gold price:", err.message);
    // Fallback olarak sabit fiyat
    return 70;
  }
}

// 3️⃣ Yardımcı: Fiyat hesaplama
function calculatePrice(popularityScore, weight, goldPricePerGram) {
  return ((popularityScore + 1) * weight * goldPricePerGram).toFixed(2);
}

// 4️⃣ /products endpoint’i (filtreleme + sıralama dahil)
app.get("/products", async (req, res) => {
  const { minPrice, maxPrice, sortBy } = req.query;

  // ✅ Altın fiyatını her istekte dinamik al
  const goldPricePerGram = await fetchGoldPriceUSDPerGram();

  let updated = products.map((p) => ({
    ...p,
    computedPrice: Number(calculatePrice(p.popularityScore, p.weight, goldPricePerGram)),
    popularityOutOf5: +(p.popularityScore * 5).toFixed(1),
  }));

  // 💰 Fiyat aralığı filtresi
  if (minPrice || maxPrice) {
    updated = updated.filter((p) => {
      if (minPrice && p.computedPrice < Number(minPrice)) return false;
      if (maxPrice && p.computedPrice > Number(maxPrice)) return false;
      return true;
    });
  }

  // ⭐ Sıralama
  if (sortBy === "priceAsc") {
    updated.sort((a, b) => a.computedPrice - b.computedPrice);
  } else if (sortBy === "priceDesc") {
    updated.sort((a, b) => b.computedPrice - a.computedPrice);
  } else if (sortBy === "popularity") {
    updated.sort((a, b) => b.popularityScore - a.popularityScore);
  }

  res.json({ data: updated });
});

// 5️⃣ Test endpoint
app.get("/", (req, res) => {
  res.send("Backend running 🚀");
});

// 6️⃣ Server başlat
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
