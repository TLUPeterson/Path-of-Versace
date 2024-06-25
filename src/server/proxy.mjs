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
  const itemType = 'UniqueWeapon'
  const league = 'Necropolis'
  const itemName = 'Kingmaker'
  console.log(itemName)
  
  try {
    const url = `https://poe.ninja/api/data/itemoverview?league=${league}&type=${itemType}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Network response was not ok ' + response.statusText);
    }
    const data = await response.json();

    // Filter data for the specific itemName
    const itemData = data.lines.find(item => item.name === itemName);

    if (!itemData) {
      return res.status(404).send('Item not found');
    }

    res.json(itemData);
  } catch (error) {
    res.status(500).send(error.toString());
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
});