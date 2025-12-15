const express = require('express');
const app = express();
const fs = require('fs');
const path = require('path');

const PORT = 8080;
const PARTS_FILE = path.join(__dirname, 'parts.json');

app.use(express.json());

function readParts() {
  const data = fs.readFileSync(PARTS_FILE, 'utf8');
  return JSON.parse(data);
}

app.get('/', (req, res) => {
  res.json('Welcome computer parts e-shop!');
});

app.get('/parts', (req, res) => {
  const data = readParts();
  res.json(data);
});

app.get('/parts/:part', (req, res) => {
  const { part } = req.params;

  const data = readParts();
  const filteredData = data[part];

  res.json(filteredData);
});

app.get('/parts/:part/:id', (req, res) => {
  const { part, id } = req.params;
  
  const data = readParts();
  const filteredData = data[part];
  const targetPart = filteredData[id]

  res.json(targetPart);
});


app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});
