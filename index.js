import express from "express";
import cors from "cors";

const app = express();

app.use(cors());

const SHEET_URL =
"https://docs.google.com/spreadsheets/d/1BWocFxHiryFhBqCUSQGm3JYqD9LbjZfL8K4nKqUUqrM/gviz/tq?tqx=out:csv&sheet=produits";

/* CSV */

function parseCSV(text){

  return text.split("\n").map(r =>

    r.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g)

    ?.map(c => c.replace(/"/g,"").trim()) || []
  );
}

/* API ALL PRODUCTS */

app.get("/api/all", async (req, res) => {

  try {

    const response = await fetch(SHEET_URL);

    const text = await response.text();

    let data = parseCSV(text);

    data.shift();

    const results = data

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

    res.json(results);

  } catch(error){

    console.error(error);

    res.status(500).json({
      error: "Erreur serveur"
    });
  }
});

/* OPTIONAL SEARCH API */

app.get("/api/search", async (req, res) => {

  try {

    const query =
      req.query.q?.toLowerCase() || "";

    const minPrice =
      parseFloat(req.query.minPrice || 0);

    const maxPrice =
      parseFloat(req.query.maxPrice || 999999);

    const response = await fetch(SHEET_URL);

    const text = await response.text();

    let data = parseCSV(text);

    data.shift();

    const results = data

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

      .filter(p => {

        if(p.actif !== "1"){
          return false;
        }

        if(query &&
           !query.includes(p.licence.toLowerCase())){
          return false;
        }

        const numericPrice =

          parseFloat(

            p.price
            .replace("€","")
            .replace(",",".")
            .replace(/[^\d.]/g,"")

          ) || 0;

        if(numericPrice < minPrice ||
           numericPrice > maxPrice){

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

/* START */

app.listen(3000, () => {

  console.log("API running");
});
