import express from "express";
import cors from "cors";

const app = express();

app.use(cors());

app.get("/api/search", async (req, res) => {

    res.json([
        {
            title: "Figurine Luffy",
            price: "24.99€",
            image: "https://via.placeholder.com/150",
            url: "https://amazon.fr"
        },
        {
            title: "Figurine Naruto",
            price: "19.99€",
            image: "https://via.placeholder.com/150",
            url: "https://amazon.fr"
        }
    ]);
});

app.listen(3000, () => {
    console.log("Server running");
});
