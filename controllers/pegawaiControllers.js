const pool = require("../db");
var bcrypt = require("bcrypt");
var salt = bcrypt.genSaltSync(10);
const express = require("express");
const app = express();
const session = require("express-session");
var flash = require("connect-flash");
const cookieParser = require("cookie-parser");
var hour = 3600000;

app.use(cookieParser("secret"));
app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
    cookie: { maxAge: hour },
  })
);
app.use(flash());

const getPegawai = async (req, res) => {
  try {
    var sessions = req.session;
    msg = req.flash("msg");
    if (sessions.nip) {
      const pegawaiAll = await pool.query(
        `SELECT * FROM pegawai join role on role.id_role = pegawai.id_role WHERE pegawai.id_role != '1' order by id_pegawai DESC;`
      );
      const pegawai = pegawaiAll.rows;
      res.render("pegawai/main", { pegawai, sessions, msg });
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
        `SELECT * FROM pegawai join role on role.id_role = pegawai.id_role
        join jabatan on jabatan.id_jabatan = pegawai.id_jabatan WHERE id_pegawai = '${id}';`
      );
      const id_pegawai = getpegawai.rows[0].id_pegawai;
      const getAbsensiById = await pool.query(
        `SELECT * FROM absensi WHERE id_pegawai = '${id_pegawai}';`
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

const savePegawai = async (res, req) => {
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
	nip, name, alamat, jenis_kelamin, photo, password, status, id_role) 
  values ('${nip}','${name}','${alamat}','${jk}','${foto}','${hash}','${status}','${role}')`
    );

    req.flash("msg", "data berhasil ditambahkan");
    res.redirect("/pegawai");
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updatePegawai = async (req, res) => {
  try {
    var sessions = req.session;
    if (sessions.nip) {
      const title = "Web Server EJS";
      const id = req.params.id;
      const getPegawaiById = await pool.query(
        `SELECT * FROM pegawai join role on role.id_role = pegawai.id_role WHERE id_pegawai = '${id}';`
      );
      const pegawai = getPegawaiById.rows[0];
      if (!pegawai) {
        res
          .status(404)
          .render("error_page", { respone: "page not found : 404" });
      }

      const roles = await pool.query(
        `SELECT * FROM role where nama_role != 'superadmin';`
      );
      const role = roles.rows;

      const jabatans = await pool.query(`SELECT * FROM jabatan;`);
      const jabatan = jabatans.rows;

      res.render("pegawai/update", {
        title: title,
        pegawai,
        sessions,
        role,
        jabatan,
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
      await pool.query(`DELETE FROM absensi WHERE id_pegawai = '${id}';`);
      await pool.query(`DELETE FROM pegawai WHERE id_pegawai = '${id}';`);
      req.flash("msg", "data berhasil delete");
      res.redirect("/pegawai");
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
      req.flash("msg", "data berhasil dinonaktifkan");
      res.redirect("/pegawai");
    } else {
      res.redirect("/");
    }
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

const formPegawai = async (req, res) => {
  const title = "pegawai";
  var sessions = req.session;
  if (sessions.nip) {
    const pegawaiOne = await pool.query(
      `SELECT nip FROM pegawai order by nip desc limit 1;`
    );

    const roles = await pool.query(
      `SELECT * FROM role where nama_role != 'superadmin';`
    );

    const jabatans = await pool.query(`SELECT * FROM jabatan;`);
    const role = roles.rows;
    const jabatan = jabatans.rows;
    const nip = parseInt(pegawaiOne.rows[0].nip) + 1;
    res.render("pegawai/add", { title: title, nip, role, sessions, jabatan });
  } else {
    res.redirect("/");
  }
};

module.exports = {
  getPegawai,
  getPegawaiById,
  deletePegawai,
  updatePegawai,
  nonaktifPegawai,
  formPegawai,
  savePegawai,
};
