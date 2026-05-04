import express from "express";
import cors from "cors";

const app = express();
app.use(cors());

const SHEET_URL =
  "https://docs.google.com/spreadsheets/d/1BWocFxHiryFhBqCUSQGm3JYqD9LbjZfL8K4nKqUUqrM/gviz/tq?tqx=out:csv&sheet=produits";

function parseCSV(text) {
  return text.split("\n").map(r =>
    r.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g)
      ?.map(c => c.replace(/"/g, "").trim()) || []
  );
}

app.get("/api/search", async (req, res) => {
  try {
    const query = (req.query.q || "").toLowerCase();

    const response = await fetch(SHEET_URL);
    const text = await response.text();
    const rows = parseCSV(text);
    console.log("HEADER:", rows[0]);
console.log("FIRST ROW:", rows[1]);


    const headers = rows.shift(); // lit les noms de colonnes

    // Création d’un objet { colonne: valeur } fiable
    const products = rows.map(row => {
      const obj = {};
      headers.forEach((h, i) => {
        obj[h.toLowerCase()] = row[i] || "";
      });
      return obj;
    });

    // On ne garde que les colonnes utiles
    const cleaned = products.map(p => ({
      licence: p.licence,
      nom: p.nom,
      prix: p.prix,
      image: p.image,
      lien: p.lien,
      actif: p.actif
    }));

    // Filtre : uniquement produits complets
    let results = cleaned.filter(p =>
      p.actif === "1" &&
      p.licence &&
      p.nom &&
      p.prix &&
      p.image &&
      p.lien
    );

    // Filtre recherche
    if (query.length > 0) {
      results = results.filter(p =>
        [p.licence, p.nom]
          .some(field => field.toLowerCase().includes(query))
      );
    }

    res.json(results);

  } catch (err) {
    console.error(err);
    res.status(500).send("Erreur serveur");
  }
});

app.listen(3000, () => console.log("API running"));
