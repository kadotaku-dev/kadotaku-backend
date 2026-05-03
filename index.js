import express from "express";

const app = express();

app.get("/api/search", async (req, res) => {

    const query = req.query.q || "anime";

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
