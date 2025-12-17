connect();

function connect() {
    ws = new WebSocket('ws://localhost:8080');

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
    'partsData': handlePartsData 
}

function handlePartsData(parts){
    //generace html pomoci for
    for (const [partType, { partGroup }] of Object.entries(parts)) {
        console.log(partType);
        console.log(partGroup);
        writeComponents(partGroup, partType);
        /*
        for (const [id, { name, description, price, quantity }] of Object.entries(partGroup)) {
        }
        */
    }
}
/*
async function fetchComponents(component) {
    const res = await fetch('http://localhost:8080/api/loadcomp', {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ component })
    });

    const data = await res.json();
    writeComponents(data, component);
}
*/
function writeComponents(data, id) {
    const list = document.getElementById(id);
    list.innerHTML = "";

    // zkrácený zápis pro const nazev = element.nazev;
    data.forEach(({ name, description, price }) => {
        const li = document.createElement("li");
        const button = document.createElement("button");

        button.addEventListener("click", ()=> {
            //volat metodu pro odečtení
        })

        li.innerHTML =
            `<p class="name">${name}</p>
            <p>${description}</p>
            <div>
                <p class="cena">${price}</p>
                ${button}
            </div>`
        list.appendChild(li);
    });
}
const lists = document.querySelectorAll("button")
/*
lists.forEach(list => {
    list.addEventListener("click", () => {
        //volat metodu pro odečtení
    });
});
*/