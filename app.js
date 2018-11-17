// Config
var port = 8080;
var app = require("express")();
var fs = require("fs");
app.set("view engine", "pug");
app.set('views', './views');

// Routes
app.get("/", (req, res) => {
    res.render("index");
});
app.get("/style/:file", (req, res) => { // Serve CSS
    res.sendFile(`${__dirname}/public/style/${req.params.file}`);
});
app.get("/script/:file", (req, res) => { // Serve JS
    res.sendFile(`${__dirname}/public/scripts/${req.params.file}`);
});
app.get("/:file", (req, res) => {
    var path = `${__dirname}/public/${req.params.file}`;
    if (fs.existsSync(path)) { // if file exists
        res.sendFile(path); // send file
    } else {
        res.status(404).render("404"); // else send 404
    }
});

// 404 error
app.use(function (req, res, next) {
    res.status(404).render("404");
});

// Listen
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});