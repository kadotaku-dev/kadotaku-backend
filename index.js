import express from "express";
import cors from "cors";

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;

const SHEET_URL = "https://docs.google.com/spreadsheets/d/1BWocFxHiryFhBqCUSQGm3JYqD9LbjZfL8K4nKqUUqrM/edit?usp=sharing"; // ⚠️ mets ton vrai lien

app.get("/api/search", async (req, res) => {
  try {
    const query = (req.query.q || "").toLowerCase();

    const response = await fetch(SHEET_URL);
    const text = await response.text();

    const rows = text.split("\n").slice(1); // ignore header

    const results = rows.map(row => {
      const cols = row.split(",");

      return {
        licence: cols[0],
        name: cols[2],
        price: cols[3],
        image: cols[4],
        url: cols[5],
        actif: cols[7]
      };
    }).filter(p =>
      p.actif === "1" &&
      p.name &&
      p.price &&
      p.image &&
      p.url &&
      query.includes((p.licence || "").toLowerCase())
    );

    res.json(results);

  } catch (err) {
    console.error(err);
    res.status(500).send("Erreur serveur");
  }
});

    const results = data.filter(p =>
      p.actif === "1" &&
      p.name &&
      p.price &&
      p.image &&
      p.url &&
      query.includes((p.licence || "").toLowerCase())
    );

    res.json(results);

  } catch (error) {
    console.error("Erreur API:", error);
    res.status(500).send("Erreur serveur");
  }
});

app.listen(PORT, () => {
  console.log("API running on port", PORT);
});
