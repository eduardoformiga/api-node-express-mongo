const express = require("express");

const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Hello world!");
});


require('./controllers/authController')(app);
require('./controllers/projectController')(app);

app.listen(3000, () => {
    console.log("Starting express on port 3000");
});
