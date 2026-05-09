import compression from "compression";
import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(compression());

const SHEET_URL =
"https://docs.google.com/spreadsheets/d/1BWocFxHiryFhBqCUSQGm3JYqD9LbjZfL8K4nKqUUqrM/gviz/tq?tqx=out:csv&sheet=produits";

/* CACHE */

let cachedProducts = [];

let lastUpdate = null;

/* CSV */

function parseCSV(text){

  return text.split("\n").map(r =>

    r.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g)

    ?.map(c => c.replace(/"/g,"").trim()) || []
  );
}

/* LOAD PRODUCTS */

async function refreshProducts(){

  console.log("Refreshing products...");

  const response = await fetch(SHEET_URL);

  const text = await response.text();

  let data = parseCSV(text);

  data.shift();

  cachedProducts = data

    .map(r => ({

      licence: r[0],

      type: r[1],

      name: r[2],

      price: r[3],

      image: r[4],

      url: r[5],

      priority: r[6],

      actif: r[7],

      waifu: r[8],

      perso: r[9]

    }))

    .filter(p => p.actif === "1");

  lastUpdate = new Date();

  console.log(
    `Loaded ${cachedProducts.length} products`
  );
}

/* FIRST LOAD */

await refreshProducts();

/* AUTO REFRESH EVERY 5 MIN */

setInterval(

  refreshProducts,

  1000 * 60 * 5
);

/* API ALL PRODUCTS */

app.get("/api/all", (req, res) => {

  res.json(cachedProducts);
});

/* OPTIONAL SEARCH API */

app.get("/api/search", (req, res) => {

  try {

    const query =
      req.query.q?.toLowerCase() || "";

    const minPrice =
      parseFloat(req.query.minPrice || 0);

    const maxPrice =
      parseFloat(req.query.maxPrice || 999999);

    const results = cachedProducts

      .filter(p => {

        if(query &&
           !(
             p.name.toLowerCase().includes(query) ||
             p.licence.toLowerCase().includes(query) ||
             p.type.toLowerCase().includes(query) ||
             (p.perso || "")
               .toLowerCase()
               .includes(query)
           )){
          return false;
        }

        const numericPrice =

          parseFloat(

            p.price
            .replace("€","")
            .replace(",",".")
            .replace(/[^\d.]/g,"")

          ) || 0;

        if(
          numericPrice < minPrice ||
          numericPrice > maxPrice
        ){
          return false;
        }

        return true;
      });

    res.json(results);

  } catch(error){

    console.error(error);

    res.status(500).json({
      error: "Erreur serveur"
    });
  }
});

/* API STATUS */

app.get("/api/status", (req,res)=>{

  res.json({

    products: cachedProducts.length,

    lastUpdate
  });
});

/* START */

app.listen(3000, () => {

  console.log("API running");
});
