const express = require("express");
const axios = require("axios");
const cors = require("cors");
const app = express(); //all app functionility runs through express.js//get request

// Middleware
app.use(cors());
app.use(express.json()); // For parsing JSON payloads

//fetch 50 market data - market page from coinmarket cap
//https://coinmarketcap.com/api/documentation/v1/#operation/getV1CryptocurrencyMap
app.get("/api/cryptocurrency/map", async (req, res) => {
  try {
    const response = await axios.get(
      "https://pro-api.coinmarketcap.com/v1/cryptocurrency/map",
      {
        headers: {
          "X-CMC_PRO_API_KEY": "3e483ec3-583b-4841-80c0-909e848aa181", // sending my request API Key
        },
        params: { limit: 50 },//limit 50 data
      }
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch data" });
  }
});//error handling ,try - the code runs n sends response if fails will go to catch and give error message


// Route to handle requests to CoinMarketCap API
//https://coinmarketcap.com/api/documentation/v1/#operation/getV2CryptocurrencyInfo
app.get("/api/cryptocurrency/info", async (req, res) => {//creatin api structure(get)
  const { name } = req.query;
  try {
    const response = await axios.get(
      "https://pro-api.coinmarketcap.com/v2/cryptocurrency/info",// gives complete data of indiviual coin
      {
        headers: {
          "X-CMC_PRO_API_KEY": "3e483ec3-583b-4841-80c0-909e848aa181", // key call
        },
        params: { slug: name },
      }
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

//coingecko
app.get('/api/crypto/:cryptoSymbol', async (req, res) => {//calling in url 
    const { cryptoSymbol } = req.params;
    try {
      const response = await axios.get(`https://api.coingecko.com/api/v3/coins/${cryptoSymbol}/market_chart`, {
        params: {
          vs_currency: 'usd', // Get price in USD, gives historical prices inside array
          days: '7', // Last 7 days of data
        },
      });
  
      // Send the data back to the frontend
      res.json(response.data);
    } catch (err) {
      console.error('Error fetching data from CoinGecko:', err);
      res.status(500).json({ message: 'Error fetching data' });
    }
});

// Start the server
const PORT = 5001;
app.listen(PORT, () => {//check running in same port mentioned
  console.log(`Server is running on http://localhost:${PORT}`);
});
