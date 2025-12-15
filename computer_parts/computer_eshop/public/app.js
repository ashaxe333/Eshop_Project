connect();

function connect() {
    ws = new WebSocket('ws://localhost:8081');

    ws.onopen = () => {
        document.getElementById('conn').textContent = '🟢 connected';
        tries = 0;
        connectedToServer = true;
        editor.contentEditable = "true";
    };

    ws.onclose = () => {
        if(user) ws.send(JSON.stringify({ type: 'userDataDelete', value: user.id }));
        document.getElementById('conn').textContent = '🔴 disconnected – reconnecting…';
        userIDLabel.textContent = 'UserID:...';
        editor.contentEditable = "false";
        setTimeout(connect, Math.min(1000 * 2 ** tries++, 5000));
    };

    ws.onmessage = (e) => {
        const data = JSON.parse(e.data);
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
    writeComponents(data, component);
}

function writeComponents(data, id) {
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