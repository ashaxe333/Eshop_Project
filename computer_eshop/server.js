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

const PART_ESHOP_ADDRESS = 'http://localhost:8080/parts';

const computers = {
    "Gaming Beast X": {
        "partsList": {
            "ram": { "address": `${PART_ESHOP_ADDRESS}/rams/id1` },
            "cpu": { "address": `${PART_ESHOP_ADDRESS}/cpus/id3` },
            "gpu": { "address": `${PART_ESHOP_ADDRESS}/gpus/id4` },
            "motherboard": { "address": `${PART_ESHOP_ADDRESS}/motherboards/id2` },
            "power_supply": { "address": `${PART_ESHOP_ADDRESS}/power_supplies/id6` },
            "disk": { "address": `${PART_ESHOP_ADDRESS}/disks/id4` }
        }
    },

    "Ultimate Creator Pro": {
        "partsList": {
            "ram": { "address": `${PART_ESHOP_ADDRESS}/rams/id14` },
            "cpu": { "address": `${PART_ESHOP_ADDRESS}/cpus/id11` },
            "gpu": { "address": `${PART_ESHOP_ADDRESS}/gpus/id1` },
            "motherboard": { "address": `${PART_ESHOP_ADDRESS}/motherboards/id11` },
            "power_supply": { "address": `${PART_ESHOP_ADDRESS}/power_supplies/id9` },
            "disk": { "address": `${PART_ESHOP_ADDRESS}/disks/id1` }
        }
    },

    "Midrange Gamer": {
        "partsList": {
            "ram": { "address": `${PART_ESHOP_ADDRESS}/rams/id9` },
            "cpu": { "address": `${PART_ESHOP_ADDRESS}/cpus/id8` },
            "gpu": { "address": `${PART_ESHOP_ADDRESS}/gpus/id9` },
            "motherboard": { "address": `${PART_ESHOP_ADDRESS}/motherboards/id5` },
            "power_supply": { "address": `${PART_ESHOP_ADDRESS}/power_supplies/id2` },
            "disk": { "address": `${PART_ESHOP_ADDRESS}/disks/id2` }
        }
    },

    "Office Silent Box": {
        "partsList": {
            "ram": { "address": `${PART_ESHOP_ADDRESS}/rams/id11` },
            "cpu": { "address": `${PART_ESHOP_ADDRESS}/cpus/id5` },
            "gpu": { "address": `${PART_ESHOP_ADDRESS}/gpus/id20` },
            "motherboard": { "address": `${PART_ESHOP_ADDRESS}/motherboards/id6` },
            "power_supply": { "address": `${PART_ESHOP_ADDRESS}/power_supplies/id17` },
            "disk": { "address": `${PART_ESHOP_ADDRESS}/disks/id10` }
        }
    },

    "AMD Gaming Value": {
        "partsList": {
            "ram": { "address": `${PART_ESHOP_ADDRESS}/rams/id17` },
            "cpu": { "address": `${PART_ESHOP_ADDRESS}/cpus/id16` },
            "gpu": { "address": `${PART_ESHOP_ADDRESS}/gpus/id18` },
            "motherboard": { "address": `${PART_ESHOP_ADDRESS}/motherboards/id16` },
            "power_supply": { "address": `${PART_ESHOP_ADDRESS}/power_supplies/id13` },
            "disk": { "address": `${PART_ESHOP_ADDRESS}/disks/id15` }
        }
    }
};


wss.on('connection',async ws => {
    websockets.add(ws);
    const computerList = await fetchAllComputers();

    ws.send(JSON.stringify({
        type: "computerListData",
        data: JSON.stringify(computerList),
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

async function fetchAllComputers() {
    const fetchedComputerList = {};

    for (const [computerName, { partsList }] of Object.entries(computers)) {
        const fetchedPartsList = await fetchAllParts(partsList);

        fetchedComputerList[computerName] = {
            'partsList': fetchedPartsList['partsList'],
            'price': Math.ceil(fetchedPartsList['price'] * 1.05)
        };
    };

    return fetchedComputerList;
}

async function fetchAllParts(partsList) {
    let totalPartsCost = 0;

    const fetchedPartsList = {
        'ram': undefined,
        'gpu': undefined,
        'cpu': undefined,
        'power_supply': undefined,
        'motherboard': undefined,
        'disk': undefined
    };

    const promises = Object.entries(partsList).map(
        ([partType, {address}]) =>
            fetchPart(address).then(part => {
                fetchedPartsList[partType] = part;
                totalPartsCost += part.price;
            })
    );

    await Promise.all(promises);

    return {
        partsList: fetchedPartsList,
        price: totalPartsCost
    };
}

async function fetchPart(address) {
    try {
        const res = await fetch(address);

        if (!res.ok) {
            throw new Error(`HTTP ${res.status} while fetching ${address}`);
        }

        return await res.json();
    } catch (err) {
        console.error('fetchPart failed:', err.message);
        throw err;
    }
}

server.listen(8081, '0.0.0.0', () => {
    console.log('Server running on http://localhost:8081');
});
