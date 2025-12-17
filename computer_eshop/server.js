const express = require('express');
const app = express();
const http = require('http');
const EventEmitter = require('events');
const WebSocket = require('ws');

app.use(express.static('public'));

const events = new EventEmitter();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let websockets = new Set();

const PART_ESHOP_ADDRESS = 'http://localhost:8080/parts';

const computers = {
    "Gaming Beast X": {
        "partsList": {
            "ram": "id1",
            "cpu": "id3",
            "gpu": "id4",
            "motherboard": "id2",
            "power_supply": "id6",
            "disk": "id4"
        }
    },

    "Ultimate Creator Pro": {
        "partsList": {
            "ram": "id14",
            "cpu": "id11",
            "gpu": "id1",
            "motherboard": "id11",
            "power_supply": "id9",
            "disk": "id1"
        }
    },

    "Midrange Gamer": {
        "partsList": {
            "ram": "id9",
            "cpu": "id8",
            "gpu": "id9",
            "motherboard": "id5",
            "power_supply": "id2",
            "disk": "id2"
        }
    },

    "Office Silent Box": {
        "partsList": {
            "ram": "id11",
            "cpu": "id5",
            "gpu": "id20",
            "motherboard": "id6",
            "power_supply": "id17",
            "disk": "id10"
        }
    },

    "AMD Gaming Value": {
        "partsList": {
            "ram": "id17",
            "cpu": "id16",
            "gpu": "id18",
            "motherboard": "id16",
            "power_supply": "id13",
            "disk": "id15"
        }
    }
};

const ADDRESS_DICT = {
    'ram': 'rams',
    'cpu': 'cpus',
    'gpu': 'gpus',
    'power_supply': 'power_supplies',
    'disk': 'disks',
    'motherboard': 'motherboards'
}

wss.on('connection', async ws => {
    websockets.add(ws);
    const computerList = await fetchAllComputers();

    ws.send(JSON.stringify({
        type: "computerListData",
        data: JSON.stringify(computerList),
    }));

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
        ([partType, partID]) =>
            fetchPart(PART_ESHOP_ADDRESS + `/${ADDRESS_DICT[partType]}/${partID}`).then(part => {
                fetchedPartsList[partType] = part;
                fetchedPartsList[partType].id = partID;
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
