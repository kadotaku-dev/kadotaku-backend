import express from "express";
import cors from "cors";

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;

const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQTBCZTUX7UZQ4bLuhX59BhHVQw5JcU6omsZwE7y95gs3rDPzD3oliudIecG0bbalHkHzZbxJI3VXdj/pub?gid=306515503&single=true&output=csv";

function parseCSV(text){
  return text.split("\n").map(r =>
    r.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g)
    ?.map(c => c.replace(/"/g,"").trim()) || []
  );
}

app.get("/api/search", async (req, res) => {
  try {
    const query = (req.query.q || "").toLowerCase();

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
      .filter(p =>
        p.actif === "1" &&
        p.licence &&
        query.includes(p.licence.toLowerCase())
      );

    res.json(results);

  } catch (err) {
    console.error(err);
    res.status(500).send("Erreur serveur");
  }
});

app.listen(PORT, () => {
  console.log("API running on port", PORT);
});
