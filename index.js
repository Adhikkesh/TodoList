import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');

const dbUrl = `postgresql://${process.env.user}:${process.env.password}@${process.env.host}:${process.env.port}/${process.env.database}`;

const db = new pg.Client({
  connectionString: dbUrl,
  ssl: {
    rejectUnauthorized: false
  }
});

// const db = new pg.Client({
//     database: process.env.database,
//     password: process.env.password,
//     host: process.env.host,
//     port: process.env.port,
//     user: process.env.user
// });

db.connect();

let title = [];

async function ListArray(){
    const response = await db.query("select id,title from list");
    title = response.rows.map(e => ({
        title: e.title,
        id: e.id
    }));
}


app.get("/",async (req,res) => {
    await ListArray();
    console.log(title.toString);
    res.render("index.ejs",{title: title});
});

app.post("/create", async(req,res) => {
    let title = req.body.createtext;
    await db.query("insert into list (title) values ($1)",[title]);
    res.redirect("/");
});

app.post("/edit",async(req,res) => {
    let title = req.body.existtitle;
    let id = req.body.id;
    await db.query("update list set title = $1 where id = $2",[title,id]);
    res.redirect("/");
});

app.post("/delete",async (req,res) => {
    let id = req.body.id;
    await db.query("delete from list where id = $1",[id]);
    res.redirect("/");
})
app.listen(3000,()=>{});
