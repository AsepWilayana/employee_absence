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
} = require("./middelware/multer");

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

app.use(pegawaiRoute);

//halaman home
app.get("/dashboard", async (req, res) => {
  const title = "Dashboard";

  res.render("dashboard/main", { title: title });
});

app.post("/pegawai", upload.single("profile-file"), async (req, res) => {
  try {
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
      `SELECT * FROM pegawai WHERE id_pegawai = '${id}';`
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
