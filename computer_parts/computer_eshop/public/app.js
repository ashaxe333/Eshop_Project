const { createElement } = require("react");

connect();

function connect() {
    ws = new WebSocket('ws://localhost:8081');

    ws.onopen = () => {
        tries = 0;
        connectedToServer = true;

        componentList.forEach(component => {
            updateComponents(component)
        });
    };

    ws.onclose = () => {
        if (user) ws.send(JSON.stringify({ type: 'userDataDelete', value: user.id }));
        setTimeout(connect, Math.min(1000 * 2 ** tries++, 5000));
    };

    ws.onmessage = (e) => {
        const data = JSON.parse(e.data);

        switch (data.type) {
            case "buttonResponse"
        }

        events.dispatchEvent(new CustomEvent(data.type, { detail: data }));
    };
}

const lists = document.querySelectorAll("ul[data-component]")

lists.forEach(list => {
    list.addEventListener("click", () => {
        fetchComponents(list.dataset.component);
    });
});

async function fetchComponents(component) {
    const res = await fetch('http://localhost:8080/api/loadcomp', {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ component })
    });

    const data = await res.json();
    updateComponents(data, component);
}

function updateComponents(data, id) {
    const list = document.getElementById(id);
    list.innerHTML = "";

    // zkrácený zápis pro const nazev = element.nazev;
    data.forEach(({ nazev, popis, cena, pocet }) => {
        const li = document.createElement("li");
        li.innerHTML =
            `<p class="name">${nazev}</p>
                <p>${popis}</p>
                <div>
                    <p class="cena">${cena}</p>
                    <p>${pocet}</p>
                </div>`
        list.appendChild(li);
    });
}

function loadComputers(computers) {

    computers.forEach(computer => {
        const li = document.createElement("li");
        li.className = "computer";
        li.innerHTML = `
        <p>Nazev</p>
                <p>cena</p>
                <button>objednat</button>
                <ul>
                    <li id="ram" data-component="ram">
                        <p class="name">nazev</p>
                        <p>popis</p>
                        <div>
                            <p class="cena">cena</p>
                            <p>pocet</p>
                        </div>
                    </li>
                    <li id="gpu" data-component="gpu"></li>
                    <li id="cpu" data-component="cpu"></li>
                    <li id="power" data-component="power"></li>
                    <li id="mother board" data-component="mother board"></li>
                    <li id="hdd" data-component="hdd"></li>
                </ul>
                `;

        const computerName = document.createElement("p");
        computerName.textContent = computer.pcName;

    });
}
