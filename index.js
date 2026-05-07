import express from "express";
import cors from "cors";

const app = express();
app.use(cors());

const SHEET_URL = "https://docs.google.com/spreadsheets/d/1BWocFxHiryFhBqCUSQGm3JYqD9LbjZfL8K4nKqUUqrM/gviz/tq?tqx=out:csv&sheet=produits";

function parseCSV(text){
  return text.split("\n").map(r =>
    r.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g)
    ?.map(c => c.replace(/"/g,"").trim()) || []
  );
}

app.get("/api/search", async (req, res) => {

  const query = req.query.q?.toLowerCase() || "";

  const minPrice = parseFloat(req.query.minPrice || 0);

  const maxPrice = parseFloat(req.query.maxPrice || 999999);

  const under20 = req.query.under20 === "true";

  const response = await fetch(SHEET_URL);

  const text = await response.text();

  let data = parseCSV(text);

  data.shift();

  const results = data

    .map(r => ({

      licence: r[0],

      name: r[2],

      price: r[3],

      image: r[4],

      url: r[5],

      actif: r[7]

    }))

    .filter(p => {

      if(p.actif !== "1") return false;

      if(!query.includes(p.licence.toLowerCase())) return false;

      const numericPrice =
        parseFloat(
          p.price
          .replace("€","")
          .replace(",",".")
          .replace(/[^\d.]/g,"")
        ) || 0;

      if(under20 && numericPrice > 20){
        return false;
      }

      if(numericPrice < minPrice || numericPrice > maxPrice){
        return false;
      }

      return true;
    });

  res.json(results);
});

app.listen(3000, () => console.log("API running"));
