const mysql = require("mysql2");
const express = require("express");
const bodyParser = require("body-parser");

const encoder = bodyParser.urlencoded();

const app = express();
app.use("/assets", express.static("assets"));

const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "h4ckth1s",
    database: "recipes4u"
});

connection.connect((error) => {

    if (error) throw error
    else console.log("Connected to the database successfully!");
});

app.get("/", (req, res) => {

    res.sendFile(__dirname + "/auth.html");
})

app.post("/", encoder, (req, res) => {

    let username = req.body.username;
    let pass = req.body.pass;

    connection.query("select * from users where username = ? and pass = ?;", [username, pass], (error, results, fields) => {

        if (results.length > 0) {

            res.redirect("/home")
        } else {

            res.redirect("/");
        }
        res.end();
    });
})

app.get("/home", (req, res) => {

    res.sendFile(__dirname + "/index.html");
})

app.listen(4500);