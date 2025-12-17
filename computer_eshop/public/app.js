connect();

function connect() {
    ws = new WebSocket('ws://localhost:8081');

    ws.onopen = () => {
        tries = 0;
        connectedToServer = true;
    };

    ws.onclose = () => {
        setTimeout(connect, Math.min(1000 * 2 ** tries++, 5000));
    };

    ws.onmessage = (e) => {
        console.log(e.data);
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
    for (const [computerName, {partsList, price}] of Object.entries(computers)) {

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
        buyButton.onclick = () => buyComputer(partsList);

        li.append(computerNameElement, partsListElement, computerPriceElement, buyButton);
        document.getElementById('computer_list').appendChild(li);
    }
}

function buyComputer(partsList) {
    
}

function createPartsListElement(partsList) {
    const partsListElement = document.createElement('ul');
    for (const [partType, {name, description, price}] of Object.entries(partsList)){
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

