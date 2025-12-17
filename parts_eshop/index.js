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

app.put('/parts/order', (req, res) => {
  for (const [partType, partID] of Object.entries(req.body)) {
    if (!checkPart(partID, partType)) {
      res.sendStatus(400);
      return;
    }
  }
  preOrder(req.body);
  res.sendStatus(200);
})

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


// app.put('/parts/buy', (req, res) => {
//   const oldData = readParts();
//   for (const parts of Object.entries(req.body)) {
//     let part = parts[0];
//     let id = parts[1]["id"];
//     let quantity = parts[1]["quantity"];
//     let curQuantity = getQuantity(id, part);
//     if (curQuantity >= quantity) {
//       let data = readParts();
//       data[part][id]['quantity'] -= quantity;
//       fs.writeFileSync(PARTS_FILE, JSON.stringify(data, null, 2), 'utf-8', (err) => {
//         if (err){
//            res.sendStatus(400);
//         }
//       });
//     } else if (curQuantity === "Invalid component") {
//       res.sendStatus(400);
//       break;
//     } else {
//       fs.writeFileSync(PARTS_FILE, JSON.stringify(oldData, null, 2), 'utf-8', (err) => {
//         if (err) res.sendStatus(400);
//       });
//       preOrder(req.body);
//       break;
//     }
//   };
//   res.sendStatus(200);
// });

function buyParts(partsList){
  let stock = readParts();
  for (const [partType, partID] of Object.entries(partsList)) {
    stock[COMPONENT_DICT[partType]][partID].quantity -= 1;
  }
  fs.writeFileSync(PARTS_FILE, JSON.stringify(stock, null, 2), 'utf8');
}


//curl -X PUT http://localhost:8080/parts/buy -H "Content-Type: application/json" -d '{"ram": "id1","cpu": "id1"}'
const COMPONENT_DICT = {
  'ram': 'rams',
  'cpu': 'cpus',
  'gpu': 'gpus',
  'power_supply': 'power_supplies',
  'disk': 'disks',
  'motherboard': 'motherboards'
}

app.put('/parts/buy', (req, res) => {
  //pridat validovani
  const partsList = req.body;
  let stock = readParts();

  let success = true;

  const unavailableParts = {};
  const availableParts = {};

  for (const [partType, partID] of Object.entries(partsList)) {
    if (!checkPart(partID, partType)) {
      res.sendStatus(400);
      return;
    }
    if (stock[COMPONENT_DICT[partType]][partID].quantity > 0) {
      console.log(partID);
      availableParts[partType] = partID;
    }else {
      success = false;
      unavailableParts[partType] = partID;
    }
  }

  if(success) {
    res.sendStatus(200);
    buyParts(availableParts);
  }else {
    res.sendStatus(409).json({
      'unavailableParts': unavailableParts,
      'availableParts': availableParts
    })
  }
});

//pridat adresu pro login ktera vrati token pomoci POST
//pravo na kupovani/prodej budou mit pouze lidi s tokenem

//pridat signature jestli to stihnem

app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});
