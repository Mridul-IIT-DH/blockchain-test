const express = require("express");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the "public/dist" directory (Parcel output)
app.use(express.static(path.join(__dirname, "public", "dist"))); // Changed this line

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "dist", "index.html")); // And this line
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
