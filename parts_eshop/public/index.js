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
    parts = JSON.parse(parts);
    for (const [partType, partsList] of Object.entries(parts)) {
        writeComponents(partType, partsList);
    }
}

function writeComponents(partType, partsList) {

    const list = document.getElementById(partType);
    const componentName = list.dataset.component; // 👈 důležité

    list.innerHTML = "";

    for (const [partID, { name, description, price }] of Object.entries(partsList)) {

        const li = document.createElement("li");
        const button = document.createElement("button");
        button.innerText = "Buy";

        button.addEventListener("click", async () => {
            try {
                const res = await fetch("http://localhost:8080/parts/buy", {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        [componentName]: partID
                    })
                });

                if (res.status === 200) {
                    alert("Nákup úspěšný");
                } else if (res.status === 409) {
                    alert("Není skladem");
                } else {
                    alert("Chyba");
                }
            } catch (err) {
                console.error(err);
            }
        });

        li.innerHTML = `
            <p class="name">${name}</p>
            <p>${description}</p>
            <div>
                <p class="cena">${price}</p>
            </div>
        `;

        li.querySelector("div").appendChild(button);
        list.appendChild(li);
    }
}



/*
function writeComponents(partType, partsList) {
    for (const [partID, { name, description, price }] of Object.entries(partsList)) {

        let list = document.getElementById(partType);

        const li = document.createElement("li");
        const button = document.createElement("button");
        button.innerText = "Buy";

        button.addEventListener("click", ()=> {
            //volat metodu pro odečtení
        })

        li.innerHTML =
            `<p class="name">${name}</p>
            <p>${description}</p>
            <div>
                <p class="cena">${price}</p>
            </div>`;
        const div = li.querySelector("div");
        div.appendChild(button);
        list.appendChild(li);
    }
}
    */
const lists = document.querySelectorAll("button")