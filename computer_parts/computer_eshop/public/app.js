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