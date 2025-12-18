const PART_ORDER_ENDPOINT = 'http://10.2.7.159:8080/parts/order';
const PART_BUY_ENDPOINT = 'http://10.2.7.159:8080/parts/buy';

connect();

function connect() {
    ws = new WebSocket('ws://10.2.7.160:8081');

    ws.onopen = () => {
        tries = 0;
        connectedToServer = true;
    };

    ws.onclose = () => {
        setTimeout(connect, Math.min(1000 * 2 ** tries++, 5000));
    };

    ws.onmessage = (e) => {
        const data = JSON.parse(e.data);
        command[data.type](data.data);
    };
}

const command = {
    'computerListData': handleComputerList
}

function handleComputerList(computers) {
    document.getElementById('computer_list').innerHTML = '';
    addComputers(JSON.parse(computers));
}

function addComputers(computers) {
    for (const [computerName, { partsList, price }] of Object.entries(computers)) {

        const li = document.createElement('li');
        li.className = 'computer';

        const computerNameElement = document.createElement('p');
        computerNameElement.textContent = computerName;

        const computerPriceElement = document.createElement('p');
        computerPriceElement.textContent = 'price: ' + price + ' CZK';

        const partsListElement = createPartsListElement(partsList);

        li.append(computerNameElement, partsListElement, computerPriceElement);
        document.getElementById('computer_list').appendChild(li);

        const buyButton = document.createElement('button');
        buyButton.textContent = 'BUY';
        buyButton.className = 'buyButton';
        buyButton.onclick = () => buyParts(partsList);

        li.append(computerNameElement, partsListElement, computerPriceElement, buyButton);
        document.getElementById('computer_list').appendChild(li);
    }
}

function generateBuyList(partsList){
    const buyList = {};
    for (const [partName, {id}] of Object.entries(partsList)) {
        buyList[partName] = id;
    }
    return buyList
}

async function buyParts(partsList) {
    const res = await fetch(PART_BUY_ENDPOINT, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(generateBuyList(partsList))
    });

    if (res.status === 409) {
        const data = await res.json();
        console.log(data)
        const { availableParts, unavailableParts } = data;
        await askUser(availableParts, unavailableParts);
        return;
    }

    if (!res.ok) {
        throw new Error('Unexpected error');
    }
    alert('Computer ordered succesfully ')
}

function askUser(availableParts, unavailableParts) {
    return new Promise(resolve => {
        const orderWindow = document.getElementById('orderWindow');
        const unavailableElement = document.getElementById('unavailableList');

        const partsText = Object.entries(unavailableParts)
            .map(([type, id]) => `${type}`)
            .join(', ');

        unavailableElement.textContent = partsText || 'None';

        orderWindow.hidden = false;

        document.getElementById('orderButton').onclick = () => {
            orderWindow.hidden = true;
            orderParts(unavailableParts);
            buyParts(availableParts);
            resolve(true);
        };

        document.getElementById('cancelButton').onclick = () => {
            orderWindow.hidden = true;
            resolve(true);
        };
    });
}


async function orderParts(parts){
    console.log('ordering')
    await fetch(PART_ORDER_ENDPOINT, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parts)
    });
}

function createPartsListElement(partsList) {
    const partsListElement = document.createElement('ul');
    for (const [partType, { name, description, price }] of Object.entries(partsList)) {
        const partElement = createPartElement(partType, name, description, price);
        partsListElement.appendChild(partElement);
    }
    return partsListElement;
}

function createPartElement(partType, partName, partDescription, partPrice) {
    const li = document.createElement('li');

    const partTypeElement = document.createElement('p');
    partTypeElement.className = 'partType';
    partTypeElement.textContent = partType;

    const partNameElement = document.createElement('p');
    partNameElement.className = 'partName';
    partNameElement.textContent = partName;

    const partDescriptionElement = document.createElement('p');
    partDescriptionElement.className = 'partDescription';
    partDescriptionElement.textContent = partDescription;

    const partPriceElement = document.createElement('p');
    partPriceElement.className = 'partPrice';
    partPriceElement.textContent = 'price: ' + partPrice + ' CZK';

    li.appendChild(partTypeElement);
    li.appendChild(partNameElement);
    li.appendChild(partDescriptionElement);
    li.appendChild(partPriceElement);

    return li;
}

