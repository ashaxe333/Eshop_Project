const express = require('express');
const app = express();
//const crypto = require('crypto');
const http = require('http');
const { type } = require('os');
const { json } = require('stream/consumers');
const WebSocket = require('ws');
app.use(express.static('public'));

let userList = [];
let computers = {
  "pcName": "name",
  "pcPrice": "price",
  "parts": {
    "ram": "id1",
    "gpu": "id2",
    "cpu": "id3",
    "power": "id4",
    "mother_board": "id5",
    "disk": "id6",
  }
};

wss.on('connection', ws => {
    const user = generateUser();
    ws.send(json.stringify({
      type: "pcList",
      data: computers,
    }));
    userList.push(user);

    ws.on('message', data => {
        const clientData = JSON.parse(data);
        events.emit(clientData.type, ws, clientData);
    });

    ws.on('close', () => {
        userList = userList.filter(u => u.id !== user.id);
    });
});

function broadcast(type, value, ws) {
    wss.clients.forEach(c => {
        if(c.readyState === WebSocket.OPEN && c !== ws){
            c.send(JSON.stringify({ type, value }));
        }
    });
}

async function fetchComponents(component){
    const components = await fetch(`http://localhost:8080/parts/${component}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json'},
    });


    return components;
}

app.post('api/loadcomp',async (req,res) =>{
    const components = await fetchComponents(req.body.component);
    res.json({
        components: components
    });
});


server.listen(8080, '0.0.0.0', () => {
    console.log('Server running on http://0.0.0.0:8080');
});
