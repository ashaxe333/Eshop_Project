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
        const data = JSON.parse(e.data);
        command[data.type](data.data);
    };
}

const command = {
    'computerListData': handleComputerList

}

function handleComputerList(computers){
    loadComputers(computers);
}

async function loadComputers(computers) {
  for (const [computerID, computer] of Object.entries(computers)) {

    const li = document.createElement('li');
    li.className = 'computer';
    li.id = computerID;

    const name = document.createElement('p');
    name.textContent = 'name: ' + computer.name;

    const price = document.createElement('p');
    price.textContent = 'price: ' + computer.price;

    const partsList = document.createElement('ul');

    for (const [partType, partID] of Object.entries(computer.partsList)) {
      const partLi = await addPart(partType, partID);
      if (partLi) partsList.appendChild(partLi);
    }

    li.append(name, partsList, price);
    document.getElementById('computer_list').appendChild(li);
  }
}


async function addPart(partType, partID) {
    try {
        const part = await fetchPart(partType, partID);
        const li = document.createElement('li');
        li.className = 'computerPart';

        const partName = document.createElement('p');
        partName.className = 'partName';
        partName.textContent = 'name: ' + part.name;

        const partPrice = document.createElement('p');
        partPrice.className = 'partPrice';
        partPrice.textContent = 'price: ' + part.price;

        const partDescription = document.createElement('p');
        partDescription.className = 'partDescription';
        partDescription.textContent = 'description: ' + part.description;

        li.appendChild(partName);
        li.appendChild(partDescription);
        li.appendChild(partPrice);

        return li;
    } catch (err) {
        console.log(err);
    }
}

async function fetchPart(partName, partID) {
    const res = await fetch(`http://localhost:8080/parts/${partName}/${partID}`);
    if (!res.ok) {
        throw new Error('Failed to fetch parts');
    }
    const part = await res.json();
    return part;
}