const express = require('express');
const app = express();
const http = require('http');
const EventEmitter = require('events');
const WebSocket = require('ws');

//const crypto = require('crypto');
app.use(express.static('public'));

const events = new EventEmitter();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let websockets = new Set();

let computers = {
    'pc67': {
        "name": "pc67",
        "price": 676767,
        "partsList": {
            "rams": "id1",
            "gpus": "id2",
            "cpus": "id3",
            "power_supplies": "id4",
            "motherboards": "id5",
            "disks": "id6",
        }
    }
};

wss.on('connection', ws => {
    websockets.add(ws);

    ws.send(JSON.stringify({
        type: "computerListData",
        data: computers,
    }));

    ws.on('message', data => {
        const clientData = JSON.parse(data);
        events.emit(clientData.type, ws, clientData);
    });

    ws.on('close', () => {
        websockets.delete(ws);
    });
});

function broadcast(type, value, ws) {
    wss.clients.forEach(c => {
        if (c.readyState === WebSocket.OPEN && c !== ws) {
            c.send(JSON.stringify({ type, value }));
        }
    });
}


server.listen(8081, '0.0.0.0', () => {
    console.log('Server running on http://localhost:8081');
});
