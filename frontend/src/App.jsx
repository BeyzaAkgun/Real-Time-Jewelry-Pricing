
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "./App.css";

function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortBy, setSortBy] = useState("");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {};
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;
      if (sortBy) params.sortBy = sortBy;

      const API_URL = import.meta.env.VITE_API_URL;
      const res = await axios.get(`${API_URL}/products`, { params });
      setProducts(res.data.data || []);
    } catch (err) {
      console.error(err);
      setError("Error fetching products");
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = (e) => {
    e.preventDefault();
    fetchProducts();
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div
      style={{
        padding: "20px",
        fontFamily: "Avenir-Book, sans-serif",
        backgroundColor: "#fff",
        minHeight: "100vh",
        boxSizing: "border-box",
      }}
    >
      <h1
        style={{
          textAlign: "center",
          marginBottom: "30px",
          fontFamily: "Avenir-Book",
          fontSize: "45px",
          color: "#111",
        }}
      >
        💍 Product List
      </h1>

      {/* 🧭 Filtre Bar */}
      <form
        onSubmit={handleFilter}
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "10px",
          marginBottom: "30px",
          flexWrap: "wrap",
        }}
      >
        <input
          type="number"
          placeholder="Min Price"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
          style={{
            padding: "8px 12px",
            border: "1px solid #ccc",
            borderRadius: "8px",
            fontFamily: "Avenir-Book",
            width: "120px",
          }}
        />
        <input
          type="number"
          placeholder="Max Price"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          style={{
            padding: "8px 12px",
            border: "1px solid #ccc",
            borderRadius: "8px",
            fontFamily: "Avenir-Book",
            width: "120px",
          }}
        />
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          style={{
            padding: "8px 12px",
            border: "1px solid #ccc",
            borderRadius: "8px",
            fontFamily: "Avenir-Book",
          }}
        >
          <option value="">Sort By</option>
          <option value="priceAsc">Price: Low → High</option>
          <option value="priceDesc">Price: High → Low</option>
          <option value="popularity">Popularity</option>
        </select>

        <button
          type="submit"
          style={{
            padding: "8px 20px",
            background: "#111",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontFamily: "Avenir-Book",
          }}
        >
          Apply
        </button>
      </form>

      {/* 💫 Slider masaüstünde, grid mobilde */}
      <div className="product-container">
        {window.innerWidth >= 768 ? (
          <Swiper
            modules={[Navigation]}
            navigation
            spaceBetween={30}
            slidesPerView={3}
            style={{
              width: "100%",
              minHeight: "520px",
            }}
            breakpoints={{
              0: { slidesPerView: 1 },
              768: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
            }}
          >
            {products.map((p, i) => (
              <SwiperSlide key={i}>
                <ProductCard product={p} />
              </SwiperSlide>
            ))}
          </Swiper>
        ) : (
          <div className="mobile-grid">
            {products.map((p, i) => (
              <ProductCard key={i} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ProductCard({ product }) {
  const [color, setColor] = useState("yellow");

  const colorNames = {
    yellow: "Yellow Gold",
    white: "White Gold",
    rose: "Rose Gold",
  };

  const colors = {
    yellow: "#E6CA97",
    white: "#D9D9D9",
    rose: "#E1A4A9",
  };

  return (
    <div
      style={{
        textAlign: "center",
        background: "transparent",
        height: "520px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <div>
        <img
          src={product.images[color]}
          alt={product.name}
          style={{
            width: "100%",
            borderRadius: "20px",
            height: "300px",
            objectFit: "cover",
          }}
        />
      </div>

      <div>
        <h3
          style={{
            marginTop: "10px",
            fontFamily: "Montserrat-Medium",
            fontSize: "15px",
            color: "#111",
          }}
        >
          {product.name}
        </h3>

        <p
          style={{
            fontFamily: "Avenir-Book",
            fontSize: "14px",
            color: "#333",
            margin: "5px 0",
          }}
        >
          ${product.computedPrice} USD
        </p>

        <p
          style={{
            fontFamily: "Avenir-Book",
            fontSize: "12px",
            marginBottom: "5px",
            color: "#666",
          }}
        >
          {colorNames[color]}
        </p>

        <div
          style={{
            marginTop: "5px",
            display: "flex",
            justifyContent: "center",
            gap: "10px",
          }}
        >
          {Object.keys(colors).map((clr) => (
            <button
              key={clr}
              onClick={() => setColor(clr)}
              style={{
                background: colors[clr],
                width: "25px",
                height: "25px",
                borderRadius: "50%",
                border: clr === color ? "2px solid black" : "1px solid #ccc",
                cursor: "pointer",
              }}
            ></button>
          ))}
        </div>

        <p
          style={{
            marginTop: "8px",
            fontFamily: "Avenir-Book",
            fontSize: "14px",
            color: "#222",
          }}
        >
          ⭐ {product.popularityOutOf5} / 5
        </p>
      </div>
    </div>
  );
}

export default App;
