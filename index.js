import express from "express";
import cors from "cors";

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;

app.get("/api/search", (req, res) => {
  res.json([
    {
      licence: "One Piece",
      name: "Test produit",
      price: "10€",
      image: "https://via.placeholder.com/150",
      url: "#"
    }
  ]);
});

app.listen(PORT, () => {
  console.log("API running on port", PORT);
});
