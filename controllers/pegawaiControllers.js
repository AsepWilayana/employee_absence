const pool = require("../db");
var bcrypt = require("bcrypt");
var salt = bcrypt.genSaltSync(10);
const express = require("express");
const app = express();
const session = require("express-session");
var hour = 3600000;
app.use(
  session({
    secret: "keyboard cat",
    resave: true,
    saveUninitialized: true,
    cookie: { maxAge: hour },
  })
);

const getPegawai = async (req, res) => {
  try {
    var sessions = req.session;
    if (sessions.nip) {
      const pegawaiAll = await pool.query(
        `SELECT * FROM pegawai order by id_pegawai asc;`
      );
      const pegawai = pegawaiAll.rows;
      res.render("pegawai/main", { pegawai, sessions });
    } else {
      res.redirect("/");
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPegawaiById = async (req, res) => {
  try {
    var sessions = req.session;
    if (sessions.nip) {
      const title = "Pegawai";
      const id = req.params.id;
      const getpegawai = await pool.query(
        `SELECT * FROM pegawai join role on role.id_role = pegawai.id_role WHERE id_pegawai = '${id}';`
      );
      const nip = getpegawai.rows[0].nip;
      const getAbsensiById = await pool.query(
        `SELECT * FROM absensi WHERE nip = '${nip}';`
      );
      const pegawai = getpegawai.rows[0];
      const absensi = getAbsensiById.rows;
      res.render("pegawai/detail", {
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
};

// const savePegawai = async (res, req) => {
//   try {
//     const nip = req.body.nip;
//     const name = req.body.name;
//     const alamat = req.body.alamat;
//     const jk = req.body.jk;
//     const foto = req.file.originalname;
//     const password = req.body.password;
//     var hash = bcrypt.hashSync(password, salt);
//     const title = "Web Server EJS";

//     await pool.query(
//       `INSERT INTO pegawai (
// 	nip, name, alamat, jenis_kelamin, photo, password) values ('${nip}','${name}','${alamat}','${jk}','${foto}','${hash}')`
//     );
//     res.redirect("/pegawai?add=success");
//   } catch (error) {
//     res.status(400).json({ message: error.message });
//   }
// };

const updatePegawai = async (req, res) => {
  try {
    var sessions = req.session;
    if (sessions.nip) {
      const title = "Web Server EJS";
      const id = req.params.id;
      const getPegawaiById = await pool.query(
        `SELECT * FROM pegawai WHERE id_pegawai = '${id}';`
      );
      const pegawai = getPegawaiById.rows[0];
      if (!pegawai) {
        res
          .status(404)
          .render("error_page", { respone: "page not found : 404" });
      }

      res.render("pegawai/update", {
        title: title,
        pegawai,
        sessions,
      });
    } else {
      res.redirect("/");
    }
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

const deletePegawai = async (req, res) => {
  try {
    var sessions = req.session;
    if (sessions.nip) {
      const id = req.params.id;
      await pool.query(`DELETE FROM pegawai WHERE id_pegawai = '${id}';`);
      res.redirect("/pegawai?deleted=success");
    } else {
      res.redirect("/");
    }
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

const nonaktifPegawai = async (req, res) => {
  try {
    var sessions = req.session;
    if (sessions.nip) {
      const id = req.params.id;
      const nonaktif = "tidak aktif";
      await pool.query(`UPDATE pegawai
      SET status='${nonaktif}'
      WHERE id_pegawai = '${id}';`);
      res.redirect("/pegawai?deleted=success");
    } else {
      res.redirect("/");
    }
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

module.exports = {
  getPegawai,
  getPegawaiById,
  deletePegawai,
  updatePegawai,
  nonaktifPegawai,
};
