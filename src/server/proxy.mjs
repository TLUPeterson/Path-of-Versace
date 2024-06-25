import express from 'express';
import fetch from 'node-fetch';

const app = express();

const PORT = 3001; // Port for the proxy server
const PASTE_KEY = '5BE7sPHKkLxP';
const POB_URL = `https://poedb.tw/pob/${PASTE_KEY}/raw`;

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
  next();
});

app.get('/pobdata', async (req, res) => {
  try {
    const response = await fetch(POB_URL);
    console.log(POB_URL)
    if (!response.ok) {
      throw new Error('Network response was not ok ' + response.statusText);
    }
    const data = await response.text();
    res.send(data);
  } catch (error) {
    res.status(500).send(error.toString());
  }
});

app.get('/pricing', async (req, res) => {
  const { itemType, league } = req.query;
  
  if (!itemType || !league) {
    return res.status(400).send('Missing query parameters');
  }
  
  try {
    const url = `https://poe.ninja/api/data/itemoverview?league=${league}&type=${itemType}`;
    const response = await fetch(url);
    console.log('response');
    if (!response.ok) {
      throw new Error('Network response was not ok ' + response.statusText);
    }
    const data = await response.json();
/*
    // Filter data for the specific itemName
    const itemData = data.lines.find(item => item.name === itemName);

    if (!itemData) {
      return res.status(404).send('Item not found');
    }*/

    res.send(data);
  } catch (error) {
    res.status(500).send(error.toString());
  }
});

app.get('/statictradedata', async (req, res) => {
  try {
    const response = await fetch('https://www.pathofexile.com/api/trade/data/items', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'
      }
    });

    if (!response.ok) {
      throw new Error('Network response was not ok ' + response.statusText);
    }

    const data = await response.text();
    res.send(data);
  } catch (error) {
    console.error('Error fetching static trade data:', error); // Log the error details
    res.status(500).send(error.toString());
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
});

