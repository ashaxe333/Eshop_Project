const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();

app.use(cors({
  origin: 'http://localhost:8081',
}));

const PORT = 8080;
const PARTS_FILE = path.join(__dirname, 'parts.json');

app.use(express.json());

var preOrders = {};

function readParts() {
  const data = fs.readFileSync(PARTS_FILE, 'utf8');
  return JSON.parse(data);
};

function checkPart(id, part) {
  const parts = readParts();
  if (parts[part][id]) {
    return true;
  } else {
    return false;
  }
};

function getQuantity(id, part) {
  const parts = readParts()
  if (checkPart(id, part)) {
    return parts[part][id]['quantity'];
  } else {
    return "Invalid component";
  }
};

function preOrder(order){
  preOrders[Object.keys(preOrders).length] = order;
};
 
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
  if (data[part]) {
    const filteredData = data[part];

    res.json(filteredData);
  } else {
    res.sendStatus(400)
  }

});

app.get('/parts/:part/:id', (req, res) => {
  const { part, id } = req.params;
  if (checkPart(id, part)) {
    const data = readParts();
    const filteredData = data[part];
    const targetPart = filteredData[id]

    res.json(targetPart);
  } else {
    res.sendStatus(400)
  }

});


app.put('/parts/buy', (req, res) => {
  const oldData = readParts();
  for (const parts of Object.entries(req.body)) {
    let part = parts[0];
    let id = parts[1]["id"];
    let quantity = parts[1]["quantity"];
    let curQuantity = getQuantity(id, part);
    if (curQuantity >= quantity) {
      let data = readParts();
      data[part][id]['quantity'] -= quantity;
      fs.writeFileSync(PARTS_FILE, JSON.stringify(data, null, 2), 'utf-8', (err) => {
        if (err){
           res.sendStatus(400);
        }
      });
    } else if (curQuantity === "Invalid component") {
      res.sendStatus(400);
      break;
    } else {
      fs.writeFileSync(PARTS_FILE, JSON.stringify(oldData, null, 2), 'utf-8', (err) => {
        if (err) res.sendStatus(400);
      });
      preOrder(req.body);
      break;
    }
  };
  res.sendStatus(200);
});

//checkovatni parametru v getech vratit status kod ✔

//pridat adresu pro login ktera vrati token pomoci POST
//pravo na kupovani/prodej budou mit pouze lidi s tokenem

//pridat signature jestli to stihnem

//serem na webhook nebude se to ukazovat userovy pocet
//kdyz koupi pc a posle PUT na koupeni a nevrati se ok tak to proste nekoupi

app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});
