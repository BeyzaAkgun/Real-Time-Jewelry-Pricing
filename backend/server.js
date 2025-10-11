require("dotenv").config();
const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");


const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());


const productsPath = path.join(__dirname, "products.json");
let products = [];
try {
  const raw = fs.readFileSync(productsPath, "utf8");
  products = JSON.parse(raw);
} catch (err) {
  console.error("Error reading products.json:", err.message);
}


async function fetchGoldPriceUSDPerGram() {
  try {
    const res = await fetch("https://www.goldapi.io/api/XAU/USD", {
      headers: {
        "x-access-token": process.env.GOLD_API_KEY,
        "Content-Type": "application/json",
      },
    });

    const data = await res.json();

 
    const pricePerGram = data.price / 31.1035;
    console.log("💰 Current Gold Price (USD/gram):", pricePerGram.toFixed(2));

    return pricePerGram;
  } catch (err) {
    console.error("Error fetching gold price:", err.message);

    return 70;
  }
}


function calculatePrice(popularityScore, weight, goldPricePerGram) {
  return ((popularityScore + 1) * weight * goldPricePerGram).toFixed(2);
}

app.get("/products", async (req, res) => {
  const { minPrice, maxPrice, sortBy } = req.query;

  const goldPricePerGram = await fetchGoldPriceUSDPerGram();

  let updated = products.map((p) => ({
    ...p,
    computedPrice: Number(calculatePrice(p.popularityScore, p.weight, goldPricePerGram)),
    popularityOutOf5: +(p.popularityScore * 5).toFixed(1),
  }));


  if (minPrice || maxPrice) {
    updated = updated.filter((p) => {
      if (minPrice && p.computedPrice < Number(minPrice)) return false;
      if (maxPrice && p.computedPrice > Number(maxPrice)) return false;
      return true;
    });
  }

  if (sortBy === "priceAsc") {
    updated.sort((a, b) => a.computedPrice - b.computedPrice);
  } else if (sortBy === "priceDesc") {
    updated.sort((a, b) => b.computedPrice - a.computedPrice);
  } else if (sortBy === "popularity") {
    updated.sort((a, b) => b.popularityScore - a.popularityScore);
  }

  res.json({ data: updated });
});


app.get("/", (req, res) => {
  res.send("Backend running 🚀");
});


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  if (process.env.PORT) {
    console.log(`Access your app at: https://renart-backend-l0ts.onrender.com`);
  } else {
    console.log(`Access locally at: http://localhost:${PORT}`);
  }
});