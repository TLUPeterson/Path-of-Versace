import express from 'express';
import fetch from 'node-fetch';

const app = express();

const PORT = 3001; // Port for the proxy server
const PASTE_KEY = 'eQVFNoqVZrza';
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
    if (!response.ok) {
      throw new Error('Network response was not ok ' + response.statusText);
    }
    const data = await response.text();
    res.send(data);
  } catch (error) {
    res.status(500).send(error.toString());
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
});
