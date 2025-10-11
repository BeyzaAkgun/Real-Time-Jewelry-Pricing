

### Renart Case Study
## Project Overview

Renart Case Study is a full-stack product listing application built with React (Vite) for the frontend and Express.js for the backend.
The project dynamically fetches real-time gold prices and calculates product prices accordingly.
Users can browse, filter, and sort engagement ring products following a specific design guideline.

Tech Stack
Layer	                 Technology
Frontend	          React (Vite), Axios, Swiper
Backend	             Node.js, Express.js, Axios, dotenv
Styling	             Custom CSS + Provided Fonts (Avenir, Montserrat)
Real-time Data	     GoldAPI.io (Live gold price in USD)

## Features
 # Backend

Serves product data from products.json

Calculates prices dynamically:

Price = (popularityScore + 1) × weight × goldPricePerGram


Retrieves real-time gold price (USD/gram) from GoldAPI

Converts popularity score → 1–5 scale with one decimal place

Supports filtering & sorting:

Filter by min/max price

Sort by price (asc/desc) or popularity

# Frontend

Fetches and displays product data from backend API

Responsive layout:

Desktop → Carousel (Swiper)

Mobile → Single column grid

Color picker changes product image

Displays:

Product name

Dynamic price (in USD)

Gold color type

Popularity rating ⭐

Filter bar to apply price and sorting filters

## Folder Structure
renart-case-study/
│
├── backend/
│   ├── server.js
│   ├── products.json
│   ├── .env
│   ├── package.json
│   └── node_modules/
│
└── frontend/
    ├── src/
    │   ├── App.jsx
    │   ├── App.css
    │   ├── main.jsx
    │   └── index.css
    ├── public/
    │   └── Fonts/
    ├── vite.config.js
    ├── package.json
    └── node_modules/

## Running Locally
1) Clone the repository
git clone https://github.com/BeyzaAkgun/renart-case-study.git
cd renart-case-study

2) Install dependencies
Backend
cd backend
npm install

Frontend
cd ../frontend
npm install

3) Set up environment variables

Inside /backend folder, create a .env file:

PORT=4000
GOLD_API_KEY=your_goldapi_key_here


Sign up and get a free API key from 👉 https://www.goldapi.io/

4)  Run the project locally
Start backend
cd backend
npm run dev

Start frontend

Open a second terminal:

cd frontend
npm run dev


Backend runs at → http://localhost:4000

Frontend runs at → http://localhost:5173
 (or whichever Vite chooses)

5) Test endpoints

You can test backend directly:

GET http://localhost:4000/products


It should return:

{
  "data": [
    {
      "name": "Product 1",
      "computedPrice": 1203.45,
      "popularityOutOf5": 4.5
    }
  ]
}

 Deployment
Frontend (Vercel)

## Push your repo to GitHub

Go to https://vercel.com
 → Import project → Select frontend/ folder

Set build command: npm run build, output: dist

Backend (Render)

Go to https://render.com

Create new Web Service → connect to repo → select backend/ folder

Add environment variable in Render:

GOLD_API_KEY=your_goldapi_key_here


Start service → note the URL (e.g., https://renart-backend.onrender.com
)

In frontend/App.jsx, replace:

axios.get("http://localhost:4000/products")


with:

axios.get("https://renart-backend.onrender.com/products")


Then redeploy frontend.

 ## Bonus Features

Real-time gold pricing
Responsive design
Product filtering and sorting
Swiper carousel
Custom local fonts (Avenir, Montserrat)

## Author

Beyza Akgün
Computer Engineering Graduate
Istanbul Bilgi University
beyzaakgun@hotmail.com
GitHub: BeyzaAkgun
LinkedIn:www.linkedin.com/in/beyza-akgün-617237278

