// Config
var port = 8080;
var app = require("express")();
app.set("view engine", "pug");
app.set('views', './views');

// Routes
app.get("/", (req, res) => {
    res.render("index");
});
app.get("/:file", (req, res) => {
    res.render(req.params.file);
});
app.get("/style/:file", (req, res) => { // Serve CSS
    res.sendFile(`${__dirname}/public/style/${req.params.file}`);
});
app.get("/script/:file", (req, res) => { // Serve JS
    res.sendFile(`${__dirname}/public/scripts/${req.params.file}`);
});

// Listen
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});