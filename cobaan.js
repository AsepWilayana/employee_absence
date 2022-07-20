const http = require("http");
const fs = require("fs");
const express = require("express");
var expressLayouts = require("express-ejs-layouts");
const pool = require("./db");
const app = express();
const port = 3000;
var morgan = require("morgan");
const {
  loadContact,
  save_context,
  validateAdd,
  validateUpdate,
  Deletedata,
  Updatedata,
} = require("./kontek");
const PegawaiRoute = require("./routes/pegawaiRoute");

const { upload } = require("./middelware/multer");
var bcrypt = require("bcrypt");
var salt = bcrypt.genSaltSync(10);
//hash password dengan salt

app.use(express.static(__dirname + "/public"));
app.use("/uploads", express.static("uploads"));

const { urlencoded } = require("express");
const console = require("console");

app.use(express.json());

// create "middleware"
app.use(morgan("dev"));
app.set("view engine", "ejs");

// untuk membuka/akses image
app.use(express.static("public/"));
app.use("public/", express.static("public"));

app.use(expressLayouts);
app.set("layout", "layout/layout");

app.use(express.urlencoded({ extended: true }));

//halaman home
app.get("/dashboard", async (req, res) => {
  const title = "Dashboard";

  res.render("dashboard/main", { title: title });
});

app.get("/pegawai", async (req, res) => {
  const title = "Pegawai";
  const getpegawai = await pool.query(`SELECT * FROM pegawai;`);
  const pegawai = getpegawai.rows;
  res.render("pegawai/main", { title: title, pegawai });
});

app.get("/pegawai/add", (req, res) => {
  const title = "pegawai";
  res.render("pegawai/add", { title: title });
});

app.post("/pegawai", upload.single("profile-file"), async (req, res) => {
  const nip = req.body.nip;
  const name = req.body.name;
  const alamat = req.body.alamat;
  const jk = req.body.jk;
  const foto = req.file.originalname;
  const password = req.body.password;
  var hash = bcrypt.hashSync(password, salt);
  const title = "Web Server EJS";

  await pool.query(
    `INSERT INTO pegawai (
	nip, name, alamat, jenis_kelamin, photo, password) values ('${nip}','${name}','${alamat}','${jk}','${foto}','${hash}')`
  );
  res.redirect("/pegawai?add=success");
});

app.get("/pegawai/detail/:id", async (req, res) => {
  const title = "Pegawai";
  const id = req.params.id;
  const getpegawai = await pool.query(
    `SELECT * FROM pegawai WHERE id_pegawai = '${id}';`
  );
  const pegawai = getpegawai.rows[0];
  res.render("pegawai/detail", { title: title, pegawai });
});

app.get("/delete/:id", async (req, res) => {
  const id = req.params.id;

  await pool.query(`DELETE FROM pegawai WHERE id_pegawai = '${id}';`);

  res.redirect("/pegawai?deleted=success");
});

app
  .use("/", (req, res) => {
    res.status(404).send("page not found : 404");
  })

  .listen(port, () => {
    console.log(`Server is listening on port ${port}`);
  });
