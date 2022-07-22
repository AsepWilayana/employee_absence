const {
  upload,
  morgans,
  salt,
  bcrypt,
  express,
  expressLayouts,
  pool,
  pegawaiRoute,
  app,
  port,
  console,
  session,
} = require("./middelware/multer");

var bodyParser = require("body-parser");

var hour = 3600000;
app.use(
  session({
    secret: "keyboard cat",
    resave: true,
    saveUninitialized: true,
    cookie: { maxAge: hour },
  })
);
app.use(require("flash")());

// create "middleware"
app.use(morgans);
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use("/uploads", express.static("uploads"));
app.use(express.json());
// untuk membuka/akses image
app.use(express.static("public/"));
app.use("public/", express.static("public"));

app.use(expressLayouts);
app.set("layout", "layout/layout");

app.use(express.urlencoded({ extended: true }));

app.get("/", async (req, res) => {
  const title = "Dashboard";
  msg = "";
  res.render("login/main", { title: title, msg });
});

app.use(pegawaiRoute);

app.post("/login", async (req, res) => {
  try {
    const nip = req.body.nip;
    const password = req.body.password;

    if (nip !== "" && password !== "") {
      const getpegawai = await pool.query(
        `SELECT * FROM pegawai join role on role.id_role = pegawai.id_role WHERE nip = '${nip}';`
      );
      const pegawai = getpegawai.rows;
      if (pegawai.length > 0) {
        const match = bcrypt.compare(password, pegawai[0].password);
        if (match) {
          //login
          var sessions = req.session;
          sessions.nip = pegawai[0].nip;
          sessions.nama_role = pegawai[0].nama_role;
          sessions.photo = pegawai[0].photo;
          sessions.name = pegawai[0].name;
          if (sessions.nip) {
            res.render("dashboard/main", { sessions });
          } else {
            res.flash("msg", "NIP dan PASSWORD salah");
            res.redirect("/");
          }
        }
      } else {
        res.flash("msg", "NIP dan PASSWORD salah");
        res.redirect("/");
      }
    } else {
      res.flash("msg", "NIP dan PASSWORD salah");
      res.redirect("/");
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

//halaman home
app.get("/dashboard", async (req, res) => {
  var sessions = req.session;
  const title = "Dashboard";
  if (sessions.nip) {
    res.render("dashboard/main", { title: title, sessions });
  } else {
    res.redirect("/");
  }
});

app.get("/pegawai/add", async (req, res) => {
  const title = "pegawai";
  var sessions = req.session;
  if (sessions.nip) {
    const pegawaiOne = await pool.query(
      `SELECT nip FROM pegawai order by nip desc limit 1;`
    );
    const nip = parseInt(pegawaiOne.rows[0].nip) + 1;
    res.render("pegawai/add", { title: title, nip, sessions });
  } else {
    res.redirect("/");
  }
});

app.get("/absensi", async (req, res) => {
  const title = "Dashboard";
  var sessions = req.session;

  if (sessions.nip) {
    function daysInMonth(month, year) {
      return new Date(year, month, 0).getDate();
    }
    jumlah = daysInMonth(7, 2022);
    res.render("absensi/main", { title: title, jumlah, sessions });
  } else {
    res.redirect("/");
  }
});

app.post("/pegawai", upload.single("profile-file"), async (req, res) => {
  try {
    const name = req.body.name;
    const alamat = req.body.alamat;
    const jk = req.body.jk;
    const foto = req.file.originalname;
    const password = req.body.password;
    const status = "aktif";
    const role = "3";
    var hash = bcrypt.hashSync(password, salt);

    const pegawaiOne = await pool.query(
      `SELECT nip FROM pegawai order by nip desc limit 1;`
    );
    const nip = parseInt(pegawaiOne.rows[0].nip) + 1;

    console.log(nip);

    const title = "Web Server EJS";
    await pool.query(
      `INSERT INTO pegawai (
	nip, name, alamat, jenis_kelamin, photo, password, status, id_role) values ('${nip}','${name}','${alamat}','${jk}','${foto}','${hash}','${status}','${role}')`
    );
    res.redirect("/pegawai?add=success");
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.post("/:id", upload.single("profile-file"), async (req, res) => {
  try {
    const id = req.params.id;
    const newname = req.body.name;
    const newalamat = req.body.alamat;
    const newjk = req.body.jk;
    const newphoto = req.file?.originalname;
    const newpassword = req.body.password;
    var hash = bcrypt.hashSync(newpassword, salt);
    const findData = await pool.query(
      `SELECT * FROM pegawai WHERE id_pegawai = '${id}' ;`
    );

    const pegawai = findData.rows[0];

    // console.log(findData);
    if (findData.rows.length > 0) {
      //dihapus dulu data yg sudah ketemmu

      // buat objek baru
      const id_pegawai = id;
      const Newnip = pegawai.nip;
      const Newname = newname || pegawai.name;
      const Newalamat = newalamat || pegawai.alamat;
      const Newjk = newjk || pegawai.jenis_kelamin;
      const Newphoto = newphoto || pegawai.photo;
      const Newpassword = hash || pegawai.password;

      pool.query(`UPDATE pegawai
      SET id_pegawai='${id_pegawai}', nip='${Newnip}', name='${Newname}', alamat='${Newalamat}', jenis_kelamin='${Newjk}' , photo='${Newphoto}', password='${Newpassword}'
      WHERE id_pegawai = '${id}';`);
    } else {
      console.log("data tidak ada");
      return;
    }
    // res.render("contact", { title: title, cont, respone });
    res.redirect("/pegawai?updated=success");
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app
  .use("/", (req, res) => {
    res.status(404).send("page not found : 404");
  })

  .listen(port, () => {
    console.log(`Server is listening on port ${port}`);
  });
