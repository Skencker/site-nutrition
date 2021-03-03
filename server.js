const express = require("express");
const server = express();
const morgan = require("morgan");
const router = require("./router");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const session = require("express-session");

//connexion à la bdd
mongoose.connect("mongodb://localhost/nutrition", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

//express-session
server.set('trust proxy', 1);
server.use(session({
    secret: 'keybord cat',
    resave: true,
    saveUninitialized: true,
    cookie: { maxAge: 60000 }
}))

//pour récuperer les données du formulaire aide
server.use(bodyParser.urlencoded({extended:false}));

server.use(express.static("public"));

server.use(morgan("dev"));
server.use("/", router);

//port
server.listen(3000);
