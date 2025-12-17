const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const http = require('http');
const WebSocket = require('ws');

app.use(express.static('public'));

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(cors({
  origin: 'http://localhost:8081',
}));

let websockets = new Set();

wss.on('connection', ws => {
    websockets.add(ws);

    ws.send(JSON.stringify({
        type: "partsData",
        data: JSON.stringify(readParts()),
    }));

    ws.on('close', () => {
        websockets.delete(ws);
    });
});

const PORT = 8080;
const PARTS_FILE = path.join(__dirname, 'parts.json');

app.use(express.json());

let preOrders = {};

function readParts() {
  const data = fs.readFileSync(PARTS_FILE, 'utf8');
  return JSON.parse(data);
};

function checkPart(id, part) {
  const parts = readParts();
  if (parts[part] && parts[part][id]) {
    return true;
  } else {
    return false;
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

/*
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
*/

////////////////////////////////////////////
app.get('/parts/rams', (req, res) => {
  const { part } = req.params;

  const data = readParts();
  if (data[part]) {
    const filteredData = data[part];

    res.json(filteredData);
  } else {
    res.sendStatus(400)
  }
});

app.get('/parts/cpus', (req, res) => {
  const { part } = req.params;

  const data = readParts();
  if (data[part]) {
    const filteredData = data[part];

    res.json(filteredData);
  } else {
    res.sendStatus(400)
  }
});

app.get('/parts/gpus', (req, res) => {
  const { part } = req.params;

  const data = readParts();
  if (data[part]) {
    const filteredData = data[part];

    res.json(filteredData);
  } else {
    res.sendStatus(400)
  }
});

app.get('/parts/power_supplies', (req, res) => {
  const { part } = req.params;

  const data = readParts();
  if (data[part]) {
    const filteredData = data[part];

    res.json(filteredData);
  } else {
    res.sendStatus(400)
  }
});

app.get('/parts/disks', (req, res) => {
  const { part } = req.params;

  const data = readParts();
  if (data[part]) {
    const filteredData = data[part];

    res.json(filteredData);
  } else {
    res.sendStatus(400)
  }
});

app.get('/parts/motherboards', (req, res) => {
  const { part } = req.params;

  const data = readParts();
  if (data[part]) {
    const filteredData = data[part];

    res.json(filteredData);
  } else {
    res.sendStatus(400)
  }
});
////////////////////////////////////


app.put('/parts/order', (req, res) => {
  for (const [partType, partID] of Object.entries(req.body)) {
    if (!checkPart(partID, COMPONENT_DICT[partType])) {
      res.sendStatus(400);
      return;
    }
  }
  preOrder(req.body);
  res.sendStatus(200);
})
/*
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
*/

/////////////////////////////////
app.get('/parts/rams/:id', (req, res) => {
  const id = req.params;
  if(id in data["rams"]) {
    const data = readParts();
    const target = data["rams"][id];

    res.json(targetPart);
  } else {
    res.sendStatus(400)
  }
});

app.get('/parts/cpus/:id', (req, res) => {
  const id = req.params;
  if(id in data["cpus"]) {
    const data = readParts();
    const target = data["cpus"][id];

    res.json(targetPart);
  } else {
    res.sendStatus(400)
  }
});

app.get('/parts/gpus/:id', (req, res) => {
  const id = req.params;
  if(id in data["gpus"]) {
    const data = readParts();
    const target = data["gpus"][id];

    res.json(targetPart);
  } else {
    res.sendStatus(400)
  }
});

app.get('/parts/power_supplies/:id', (req, res) => {
  const id = req.params;
  if(id in data["power_supplies"]) {
    const data = readParts();
    const target = data["power_supplies"][id];

    res.json(targetPart);
  } else {
    res.sendStatus(400)
  }
});

app.get('/parts/motherboards/:id', (req, res) => {
  const id = req.params;
  if(id in data["motherboards"]) {
    const data = readParts();
    const target = data["motherboards"][id];

    res.json(targetPart);
  } else {
    res.sendStatus(400)
  }
});

app.get('/parts/disks/:id', (req, res) => {
  const id = req.params;
  if(id in data["disks"]) {
    const data = readParts();
    const target = data["disks"][id];

    res.json(targetPart);
  } else {
    res.sendStatus(400)
  }
});
/////////////////////////////////

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
  const partsList = req.body;
  let stock = readParts();

  let success = true;

  const unavailableParts = {};
  const availableParts = {};

  for (const [partType, partID] of Object.entries(partsList)) {
    if (!checkPart(partID, COMPONENT_DICT[partType])) {
      res.sendStatus(400);
      return;
    }
    if (stock[COMPONENT_DICT[partType]][partID].quantity > 0) {
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
    res.status(409).json({
      'unavailableParts': unavailableParts,
      'availableParts': availableParts
    })
  }
});

server.listen(PORT, '0.0.0.0', () => {
    console.log('Server running on http://localhost:8080');
});
