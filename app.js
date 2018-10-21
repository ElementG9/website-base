// Config
const port = 8080;
const app = require("express")();
const fs = require("fs");
const helmet = require("helmet");
const bodyParser = require("body-parser");
const session = require("express-session");
const cookies = require("cookie-parser");
const userCtrl = require("./scripts/dbCtrl").user;
app.use(helmet());
app.set("view engine", "pug");
app.set('views', './views');
const protect = (req, res, next) => {
    if (req.session.user && req.cookies.gthub_user_sid) {
        next(); // if logged in, continue
    } else {
        res.redirect("/login"); // else redirect to login
    }
};
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use(cookies());
app.use(session({
    key: 'gthub_user_sid',
    secret: 'somerandomstuff',
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: 600000 // 10 minutes
    }
}));

// Routes
app.get("/", (req, res) => {
    res.render("index", {
        title: "gthub.us"
    });
});
app.route("/signup")
    .get((req, res) => {
        res.render("signup", {
            title: "Sign up | gthub.us"
        });
    })
    .post((req, res) => {
        userCtrl.createUser(req.body.username, req.body.password)
        .then((user) => {
            req.session.user = user;
            res.redirect("/dashboard");
        })
        .catch((err) => {
            res.redirect("/signup");
        });
    });
app.route("/login")
    .get((req, res)=>{
        res.render("login", {
            title: "Login | gthub.us"
        });
    })
    .post((req, res)=>{
        userCtrl.authUser(req.body.username, req.body.password).then((user) => {
            req.session.user = user;
            console.log(user);
            res.redirect("/dashboard");
        }).catch(() => {
            res.redirect("/login");
        });
    });
app.get('/logout', (req, res) => {
    res.clearCookie('gthub_user_sid');
    res.redirect('/');
});
app.get("/dashboard", protect, (req, res) => {
    res.render("dashboard", {
        title: "Dashboard | gthub.us",
        user: req.session.user.username
    });
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