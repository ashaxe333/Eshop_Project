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

function readParts() {
  const data = fs.readFileSync(PARTS_FILE, 'utf8');
  return JSON.parse(data);
};

function checkPart(id,part){
  const parts = readParts();
  if(parts[part][id]){
    return true;
  }else{
    return false;
  }
}

function getQuantity(id,part){
  const parts = readParts()
  if(checkPart(id,part)){
    return parts[part][id]['quantity'];
  }else{
    return "Invalid component";
  }
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

// put pro odečítaní počtů v jsonu ✔
app.put('/buy/:part/:id', (req, res) =>{
  const {part , id} = req.params
  quantity = getQuantity(id,part)
  if(quantity > 0){
    data = readParts();
    data[part][id]['quantity'] -= 1;
    fs.writeFile(PARTS_FILE, JSON.stringify(data, null, 2),'utf-8',(err) => {
    if (err) res.sendStatus(400);
    });
    res.sendStatus(200)
  }else if(quantity === "Invalid component"){
    res.sendStatus(400)
  }else res.sendStatus(400)

});

// kontrolovat nevalidní vstupy ✔

// vytvořit stránku na součástky ✔

// posílat změnu počtu na webhook
// 



app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});
