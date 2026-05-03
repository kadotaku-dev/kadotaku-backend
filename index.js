import express from "express";
import cors from "cors";

const app = express();
app.use(cors());

const SHEET_URL = "https://docs.google.com/spreadsheets/d/1BWocFxHiryFhBqCUSQGm3JYqD9LbjZfL8K4nKqUUqrM/gviz/tq?tqx=out:csv&sheet=produits";

app.get("/api/search", async (req, res) => {
  try {
    const query = req.query.q?.toLowerCase() || "";

    const response = await fetch(SHEET_URL);
    const text = await response.text();

    const lines = text.split("\n");
    const headers = lines[0].split(",");

    const data = lines.slice(1).map(line => {
      const values = line.split(",");
      let obj = {};
      headers.forEach((h, i) => {
        obj[h.trim()] = values[i]?.trim();
      });
      return obj;
    });

    const results = data
      .map(p => ({
        licence: p.licence,
        name: p.nom,
        price: p.prix,
        image: p.image,
        url: p.lien,
        actif: p.actif
      }))
      .filter(p =>
        p.actif === "1" &&
        p.licence &&
        query.includes(p.licence.toLowerCase())
      );

    res.json(results);

  } catch (error) {
    console.error(error);
    res.status(500).send("Erreur serveur");
  }
});

app.listen(3000, () => console.log("API running"));
