import express from 'express';
import fetch from 'node-fetch';

const app = express();

const PORT = process.env.PORT || 3001; // Use environment variable for port

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
  next();
});

app.get('/pobdata', async (req, res) => {
  const { pobb } = req.query;
  try {
    const response = await fetch(`https://pobb.in/${pobb}/raw`);
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
    if (!response.ok) {
      throw new Error('Network response was not ok ' + response.statusText);
    }
    const data = await response.json();
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
    res.status(500).send(error.toString());
  }
});

app.get('/poeprice', async (req, res) => {
  const { iteminfo } = req.query;
  const decodedIteminfo = decodeURIComponent(iteminfo);
  try {
    const response = await fetch(`https://poeprices.info/api?${decodedIteminfo}`, {
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
    res.status(500).send(error.toString());
  }
});

app.get('/currency', async (req, res) => {
  try {
    const response = await fetch(`https://poe.ninja/api/data/currencyoverview?league=Necropolis&type=Currency`);
    if (!response.ok) {
      throw new Error('Network response was not ok ' + response.statusText);
    }
    const data = await response.json();
    res.send(data);
  } catch (error) {
    res.status(500).send(error.toString());
  }
});

export default app;