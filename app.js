const {
  upload,
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
  fs,
  http,
} = require("./middelware/multer");
var path = require("path");
var morgan = require("morgan");
var cron = require("node-cron");
var bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
var flash = require("connect-flash");

// create "middleware"
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

// morgan.token("json", function (req, res) {
//   return JSON.stringify({
//     url: req.url,
//     method: req.method,
//     httpVersion: req.httpVersion,
//   });
// });

app.use(cookieParser("secret"));
var hour = 3600000;
app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
    cookie: { maxAge: hour },
  })
);
app.use(flash());

cron.schedule("01 00 * * *", () => {
  sendData().then(console.log("success Generate Absensi"));
});

async function sendData() {
  var d = new Date();
  var dateTime =
    d.getDate() +
    "-" +
    (d.getMonth() + 1) +
    "-" +
    d.getFullYear() +
    " " +
    d.getHours() +
    ":" +
    d.getMinutes();
  var datestring =
    d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();

  // var datestring =
  //   d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();
  console.log(datestring);
  const getpegawai = await pool.query(`SELECT * FROM pegawai;`);
  const pegawai = getpegawai.rows;
  for (let index = 0; index < pegawai.length; index++) {
    await pool.query(
      `INSERT INTO absensi (
    id_pegawai, tanggal, keterangan, create_at, update_at ) values ('${pegawai[index].id_pegawai}','${datestring}','belum absen masuk dan keluar','${dateTime}','${dateTime}')`
    );
  }
}

app.get("/", async (req, res) => {
  const title = "Dashboard";
  msg = req.flash("msg");
  const sessions = "";
  res.render("login/main", { title: title, msg, sessions });
});

app.post("/login", async (req, res) => {
  try {
    const nip = req.body.nip;
    const password = req.body.password;

    if (nip !== "" && password !== "") {
      const getpegawai = await pool.query(
        `SELECT * FROM pegawai join role on role.id_role = pegawai.id_role WHERE nip = '${nip}';`
      );
      const pegawai = getpegawai.rows;
      const pass = getpegawai.rows[0].password;
      // console.log(pass);
      // console.log(password);
      if (pegawai.length > 0) {
        const result = await bcrypt.compare(req.body.password, pass);
        //console.log(result);
        if (result === true) {
          var sessions = req.session;
          sessions.nip = pegawai[0].nip;
          sessions.nama_role = pegawai[0].nama_role;
          sessions.photo = pegawai[0].photo;
          sessions.name = pegawai[0].name;
          if (sessions.nip) {
            req.flash("msg", "selamat datang");
            res.redirect("/dashboard");
          } else {
            req.flash("msg", "NIP dan PASSWORD salah");
            res.redirect("/");
          }
        } else {
          req.flash("msg", "NIP dan PASSWORD salah ");
          res.redirect("/");
        }
      } else {
        req.flash("msg", "NIP dan PASSWORD salah ");
        res.redirect("/");
      }
    } else {
      req.flash("msg", "NIP dan PASSWORD salah");
      res.redirect("/");
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.use(pegawaiRoute);

//halaman home
app.get("/dashboard", async (req, res) => {
  var sessions = req.session;
  const title = "Dashboard";
  msg = req.flash("msg");
  if (sessions.nip) {
    const getAbsensi = await pool.query(
      `SELECT absensi.*, pegawai.nip, pegawai.name, pegawai.id_pegawai FROM pegawai 
      JOIN absensi on absensi.id_pegawai = pegawai.id_pegawai 
      where tanggal = now()::date AND pegawai.nip = '${sessions.nip}'
      order by absensi.tanggal asc;`
    );
    const absensi = getAbsensi.rows;
    // console.log(absensi);
    res.render("dashboard/main", { title: title, sessions, absensi, msg });
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

    const roles = await pool.query(`SELECT * FROM role;`);
    const role = roles.rows;
    const nip = parseInt(pegawaiOne.rows[0].nip) + 1;
    res.render("pegawai/add", { title: title, nip, role, sessions });
  } else {
    res.redirect("/");
  }
});

app.get("/absensi", async (req, res) => {
  const title = "Dashboard";
  var sessions = req.session;
  const getAbsensi = await pool.query(
    `SELECT absensi.*, pegawai.nip, pegawai.name, pegawai.id_pegawai FROM pegawai JOIN absensi on absensi.id_pegawai = pegawai.id_pegawai where tanggal = now()::date 
order by absensi.tanggal asc;`
  );
  const absensi = getAbsensi.rows;

  if (sessions.nip) {
    // function daysInMonth(month, year) {
    //   return new Date(year, month, 0).getDate();
    // }
    // jumlah = daysInMonth(7, 2022);
    // console.log(absensis);

    res.render("absensi/main", { title: title, absensi, sessions });
  } else {
    res.redirect("/");
  }
});

app.get("/absensi/detail/:id", async (req, res) => {
  const title = "Dashboard";
  try {
    var sessions = req.session;
    if (sessions.nip) {
      const title = "Pegawai";
      const id = req.params.id;
      const getpegawai = await pool.query(
        `SELECT * FROM pegawai join role on role.id_role = pegawai.id_role WHERE id_pegawai = '${id}';`
      );
      const id_pegawai = getpegawai.rows[0].id_pegawai;
      const getAbsensiById = await pool.query(
        `SELECT * FROM absensi WHERE id_pegawai = '${id_pegawai}' order by tanggal desc;`
      );
      const pegawai = getpegawai.rows[0];
      const absensi = getAbsensiById.rows;
      res.render("absensi/detail", {
        title: title,
        pegawai,
        absensi,
        sessions,
      });
    } else {
      res.redirect("/");
    }
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});

app.post("/pegawai", upload.single("profile-file"), async (req, res) => {
  try {
    const name = req.body.name;
    const alamat = req.body.alamat;
    const jk = req.body.jk;
    const foto = req.file?.originalname || "default.png";
    const password = req.body.password;
    const status = "aktif";
    const role = req.body.role;
    var hash = bcrypt.hashSync(password, 10);

    const pegawaiOne = await pool.query(
      `SELECT nip FROM pegawai order by nip desc limit 1;`
    );
    const nip = parseInt(pegawaiOne.rows[0].nip) + 1;

    const title = "Web Server EJS";
    await pool.query(
      `INSERT INTO pegawai (
	nip, name, alamat, jenis_kelamin, photo, password, status, id_role) values ('${nip}','${name}','${alamat}','${jk}','${foto}','${hash}','${status}','${role}')`
    );

    req.flash("msg", "data berhasil ditambahkan");
    res.redirect("/pegawai");
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
    const role = req.body.role;
    var hash = bcrypt.hashSync(newpassword, 10);
    const findData = await pool.query(
      `SELECT * FROM pegawai join role on role.id_role = pegawai.id_role WHERE id_pegawai = '${id}' ;`
    );
    const pegawai = findData.rows[0];

    let Newpassword = "";
    if (newpassword == "") {
      Newpassword = pegawai.password;
    } else {
      Newpassword = hash;
    }
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
      //const Newpassword = hash || pegawai.password;
      const Role = role || pegawai.id_role;

      pool.query(`UPDATE pegawai
      SET id_pegawai='${id_pegawai}', nip='${Newnip}', name='${Newname}', alamat='${Newalamat}', jenis_kelamin='${Newjk}' , photo='${Newphoto}',id_role='${Role}'  ,password='${Newpassword}'
      WHERE id_pegawai = '${id}';`);
    } else {
      console.log("data tidak ada");
      return;
    }
    // res.render("contact", { title: title, cont, respone });
    req.flash("msg", "data berhasil diupdate");
    res.redirect("/pegawai");
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.get("/checkin/:id", async (req, res) => {
  try {
    var sessions = req.session;
    if (sessions.nip) {
      const nip = req.params.id;
      const keterangan = "belum absen keluar";
      var d = new Date();
      var time = d.getHours() + ":" + d.getMinutes();
      var datestring =
        d.getDate() + "-" + (d.getMonth() + 1) + "-" + d.getFullYear();

      console.log(datestring);
      const getpegawai = await pool.query(
        `SELECT * FROM pegawai join role on role.id_role = pegawai.id_role WHERE nip = '${nip}';`
      );
      const pegawaiId = getpegawai.rows[0].id_pegawai;
      const getAbsensi = await pool.query(
        `SELECT * FROM absensi 
      where tanggal = now()::date AND id_pegawai = '${pegawaiId}'`
      );
      const absensi = getAbsensi.rows[0].jam_masuk;
      if (absensi == null) {
        await pool.query(`UPDATE absensi
      SET jam_masuk='${time}', keterangan='${keterangan}'
      WHERE id_pegawai = '${pegawaiId}' AND tanggal ='${datestring}';`);
        console.log("success absen masuk");
        req.flash("msg", "Success Absen Masuk");
        res.redirect("/dashboard");
      } else {
        req.flash("msg", "Sudah Absen Masuk");
        res.redirect("/dashboard");
      }
    } else {
      res.redirect("/");
    }
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});

app.get("/checkout/:id", async (req, res) => {
  try {
    var sessions = req.session;
    if (sessions.nip) {
      const nip = req.params.id;
      const keterangan = "sudah absen masuk dan keluar";
      var d = new Date();
      var time = d.getHours() + ":" + d.getMinutes();
      var datestring =
        d.getDate() + "-" + (d.getMonth() + 1) + "-" + d.getFullYear();

      console.log(datestring);
      const getpegawai = await pool.query(
        `SELECT * FROM pegawai join role on role.id_role = pegawai.id_role WHERE nip = '${nip}';`
      );
      const pegawaiId = getpegawai.rows[0].id_pegawai;
      const getAbsensi = await pool.query(
        `SELECT * FROM absensi 
      where tanggal = now()::date AND id_pegawai = '${pegawaiId}'`
      );
      const absensi = getAbsensi.rows[0].jam_keluar;
      if (absensi == null) {
        await pool.query(`UPDATE absensi
        SET jam_keluar='${time}', keterangan='${keterangan}'
        WHERE id_pegawai = '${pegawaiId}' AND tanggal ='${datestring}';`);
        console.log("success absen keluar");
        req.flash("msg", "Success Absen Keluar");
        res.redirect("/dashboard");
      } else {
        req.flash("msg", "Sudah Absen Keluar");
        res.redirect("/dashboard");
      }
    } else {
      res.redirect("/");
    }
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});

app.get("/history", async (req, res) => {
  try {
    var sessions = req.session;
    if (sessions.nip) {
      const title = "Pegawai";
      const nip = sessions.nip;
      const getpegawai = await pool.query(
        `SELECT * FROM pegawai join role on role.id_role = pegawai.id_role WHERE nip = '${nip}';`
      );
      const id_pegawai = getpegawai.rows[0].id_pegawai;
      const getAbsensiById = await pool.query(
        `SELECT * FROM absensi WHERE id_pegawai = '${id_pegawai}' order by tanggal desc;`
      );
      const pegawai = getpegawai.rows[0];
      const absensi = getAbsensiById.rows;
      res.render("absensi/history_absensi", {
        title: title,
        pegawai,
        absensi,
        sessions,
      });
    } else {
      res.redirect("/");
    }
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});

app.get("/profile", async (req, res) => {
  try {
    var sessions = req.session;
    if (sessions.nip) {
      const title = "Web Server EJS";
      const nip = sessions.nip;
      const getPegawaiById = await pool.query(
        `SELECT * FROM pegawai join role on role.id_role = pegawai.id_role WHERE nip = '${nip}';`
      );
      const pegawai = getPegawaiById.rows[0];
      if (!pegawai) {
        res
          .status(404)
          .render("error_page", { respone: "page not found : 404" });
      }

      const roles = await pool.query(`SELECT * FROM role;`);
      const role = roles.rows;

      msg = req.flash("msg");
      res.render("profile/main", {
        title: title,
        pegawai,
        sessions,
        role,
        msg,
      });
    } else {
      res.redirect("/");
    }
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});

app.post("/profile/:id", upload.single("profile-file"), async (req, res) => {
  try {
    const id = req.params.id;
    const newname = req.body.name;
    const newalamat = req.body.alamat;
    const newjk = req.body.jk;
    const newphoto = req.file?.originalname;
    const newpassword = req.body.password;
    var hash = bcrypt.hashSync(newpassword, 10);
    const findData = await pool.query(
      `SELECT * FROM pegawai join role on role.id_role = pegawai.id_role WHERE id_pegawai = '${id}' ;`
    );

    const pegawai = findData.rows[0];
    let Newpassword = "";
    if (newpassword == "") {
      Newpassword = pegawai.password;
    } else {
      Newpassword = hash;
    }

    // console.log(findData);
    if (findData.rows.length > 0) {
      // buat objek baru
      const Newname = newname || pegawai.name;
      const Newalamat = newalamat || pegawai.alamat;
      const Newjk = newjk || pegawai.jenis_kelamin;
      const Newphoto = newphoto || pegawai.photo;

      //console.log(hash);

      pool.query(`UPDATE pegawai
      SET name='${Newname}', alamat='${Newalamat}', jenis_kelamin='${Newjk}' , photo='${Newphoto}' ,password='${Newpassword}'
      WHERE id_pegawai = '${id}';`);
    } else {
      console.log("data tidak ada");
      return;
    }
    req.flash("msg", "Success Update Data");
    res.redirect("/profile");
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.use("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});

app
  .use("/", (req, res) => {
    res.status(404).send("page not found : 404");
  })

  .listen(port, () => {
    console.log(`Server is listening on port ${port}`);
  });
