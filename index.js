<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<title>Kadotaku</title>

<link href="https://fonts.googleapis.com/css2?family=Rubik:wght@400;600&display=swap" rel="stylesheet">

<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/nouislider@15.7.0/dist/nouislider.min.css">
<script src="https://cdn.jsdelivr.net/npm/nouislider@15.7.0/dist/nouislider.min.js"></script>

<style>
body {
    margin: 0;
    padding-top: 220px;
    font-family: 'Rubik', sans-serif;
    background: #0f172a;
    color: #f1f5f9;
}

/* HEADER */
.hero {
    position: fixed;
    top: 0;
    width: 100%;
    z-index: 1000;
}
.hero img {
    width: 100%;
}

/* LAYOUT */
.container {
    display: flex;
}

/* SIDEBAR */
.sidebar {
    width: 320px;
    background: rgba(255,255,255,0.05);
    padding: 15px;
}

/* séparateurs */
.separator {
    height: 1px;
    background: rgba(255,255,255,0.15);
    margin: 15px 0;
}

label {
    display: block;
    padding: 6px 0;
}

/* slider */
#priceSlider {
    margin: 10px 0;
}

/* bouton */
#searchBtn {
    display: block;
    margin: 40px auto;
    padding: 18px 40px;
    font-size: 20px;
    border-radius: 999px;
    border: none;
    background: linear-gradient(90deg,#ff2d75,#ff9a00);
    color: white;
    cursor: pointer;
}

/* PRODUITS */
.products {
    flex: 1;
    padding: 20px;
}

.grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 20px;
}

.card {
    background: rgba(255,255,255,0.06);
    padding: 10px;
    border-radius: 10px;
    text-align: center;
}

.card img {
    width: 100%;
    height: 240px;
    object-fit: contain;
    cursor: pointer;
}

.price {
    color: #ffd166;
    font-weight: bold;
}

.card a {
    color: white;
    text-decoration: none;
    font-weight: normal;
}
.card a:hover {
    text-decoration: underline;
}

/* MODAL */
.modal {
    display: none;
    position: fixed;
    background: rgba(0,0,0,0.85);
    width: 100%;
    height: 100%;
    justify-content: center;
    align-items: center;
}
.modal img {
    max-width: 80%;
}
</style>
</head>

<body>

<header class="hero">
    <img src="bandeau.png">
</header>

<div class="container">

<div class="sidebar">

    <h3>Budget</h3>

    <div id="priceSlider"></div>

    <div>
        <span id="minPrice">0€</span> - 
        <span id="maxPrice">500€</span>
    </div>

    <div class="separator"></div>

    <h3>Type de produit</h3>
    <div id="typeList"></div>

    <div class="separator"></div>

    <h3>Animés</h3>
    <div id="animeList"></div>

</div>

<div class="products">

    <button id="searchBtn">Afficher les idées</button>

    <div class="grid" id="productGrid"></div>

</div>

</div>

<div class="modal" id="modal">
    <img id="modalImg">
</div>

<script>

const API_URL = "https://kadotaku-backend-production.up.railway.app";
const animeSheetURL = "https://docs.google.com/spreadsheets/d/1BWocFxHiryFhBqCUSQGm3JYqD9LbjZfL8K4nKqUUqrM/gviz/tq?tqx=out:csv&sheet=licences";

let allProducts = [];

/* CSV */
function parseCSV(text){
    return text.split("\n").map(r =>
        r.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g)
        ?.map(c => c.replace(/"/g,"").trim()) || []
    );
}

/* SLIDER */
const slider = document.getElementById("priceSlider");

noUiSlider.create(slider, {
    start: [0, 500],
    connect: true,
    range: { min: 0, max: 500 }
});

slider.noUiSlider.on('update', function(values){
    document.getElementById("minPrice").innerText = Math.round(values[0]) + "€";
    document.getElementById("maxPrice").innerText = Math.round(values[1]) + "€";
});

/* LOAD ANIME */
async function loadAnime(){
    const res = await fetch(animeSheetURL);
    const text = await res.text();

    let data = parseCSV(text);
    data.shift();

    const el = document.getElementById("animeList");

    data.forEach(r=>{
        if(r[2] == "1"){
            el.innerHTML += `<label><input type="checkbox" value="${r[0]}">${r[0]}</label>`;
        }
    });
}

/* LOAD PRODUCTS (au démarrage) */
async function loadProducts(){
    const res = await fetch(API_URL + "/api/search?q=");
    allProducts = await res.json();

    buildTypeList();
}

/* TYPES */
function buildTypeList(){
    const el = document.getElementById("typeList");

    const types = [...new Set(allProducts.map(p => p.type).filter(Boolean))]
        .sort((a,b)=>a.localeCompare(b));

    el.innerHTML = "";

    types.forEach(t=>{
        el.innerHTML += `
            <label>
                <input type="checkbox" value="${t}">
                ${t}
            </label>
        `;
    });
}

/* FILTER */
function applyFilters(){

    let values = slider.noUiSlider.get();
    let min = parseFloat(values[0]);
    let max = parseFloat(values[1]);

    const selectedAnime = [...document.querySelectorAll("#animeList input:checked")]
        .map(i => i.value);

    const selectedTypes = [...document.querySelectorAll("#typeList input:checked")]
        .map(i => i.value);

    let data = allProducts.filter(p=>{
        const price = parseFloat(p.price.replace("€","").replace(",", ".").trim());

        return price >= min && price <= max;
    });

    if(selectedAnime.length){
        data = data.filter(p =>
            selectedAnime.some(a => p.licence.toLowerCase().includes(a.toLowerCase()))
        );
    }

    if(selectedTypes.length){
        data = data.filter(p => selectedTypes.includes(p.type));
    }

    display(data);
}

/* DISPLAY */
function display(data){
    const grid = document.getElementById("productGrid");
    grid.innerHTML = "";

    data.forEach(p=>{
        grid.innerHTML += `
        <div class="card">
            <img src="${p.image}" onclick="openModal('${p.image}')">
            <p><a href="${p.url}" target="_blank">${p.name}</a></p>
            <div class="price">${p.price.replace("€","")} €</div>
        </div>
        `;
    });
}

/* MODAL */
function openModal(src){
    document.getElementById("modalImg").src = src;
    document.getElementById("modal").style.display = "flex";
}
document.getElementById("modal").onclick = () =>
    document.getElementById("modal").style.display = "none";

/* EVENTS */
document.getElementById("searchBtn").onclick = applyFilters;

/* INIT */
loadAnime();
loadProducts();

</script>

</body>
</html>
