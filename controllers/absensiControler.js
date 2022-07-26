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

const getAbsensi = async (req, res) => {
  const title = "Dashboard";
  var sessions = req.session;
  const getAbsensi = await pool.query(
    `SELECT absensi.*, pegawai.nip, pegawai.name, pegawai.id_pegawai, pegawai.id_role FROM pegawai 
    JOIN absensi on absensi.id_pegawai = pegawai.id_pegawai 
    WHERE tanggal = now()::date AND id_role ='3'
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
};

const getAbsensiById = async (req, res) => {
  const title = "Dashboard";
  try {
    var sessions = req.session;
    if (sessions.nip) {
      const title = "Pegawai";
      const id = req.params.id;
      const tgl_awal = req.query.tgl_awal;
      const tgl_akhir = req.query.tgl_akhir;
      const jam_kerja = req.query.jam_kerja;

      const getpegawai = await pool.query(
        `SELECT * FROM pegawai join role on role.id_role = pegawai.id_role WHERE id_pegawai = '${id}';`
      );
      const id_pegawai = getpegawai.rows[0].id_pegawai;

      let query = "";
      if (tgl_awal == undefined && tgl_akhir == undefined) {
        query = `SELECT *, to_char(jam_keluar - jam_masuk::time, 'HH24:MI:ss') as jam_kerja FROM absensi WHERE id_pegawai = '${id_pegawai}' order by tanggal desc;`;
      } else if (
        tgl_awal !== undefined &&
        tgl_akhir !== undefined &&
        jam_kerja == ""
      ) {
        query = `SELECT *, to_char(jam_keluar - jam_masuk::time, 'HH24:MI:ss') as jam_kerja FROM absensi WHERE id_pegawai = '${id_pegawai}' AND tanggal >= '${tgl_awal}' AND tanggal <= '${tgl_akhir}' order by tanggal desc;`;
      } else if (
        tgl_awal !== undefined &&
        tgl_akhir !== undefined &&
        jam_kerja === "lebih_besar"
      ) {
        query = `SELECT *, to_char(jam_keluar - jam_masuk::time, 'HH24:MI:ss') as jam_kerja FROM absensi WHERE id_pegawai = '${id_pegawai}' AND tanggal >= '${tgl_awal}' AND tanggal <= '${tgl_akhir}' AND to_char(jam_keluar - jam_masuk::time, 'HH24:MI:ss') >= '09:00:00' order by tanggal desc;`;
      } else if (
        tgl_awal !== undefined &&
        tgl_akhir !== undefined &&
        jam_kerja === "lebih_kecil"
      ) {
        query = `SELECT *, to_char(jam_keluar - jam_masuk::time, 'HH24:MI:ss') as jam_kerja FROM absensi WHERE id_pegawai = '${id_pegawai}' AND tanggal >= '${tgl_awal}' AND tanggal <= '${tgl_akhir}' AND to_char(jam_keluar - jam_masuk::time, 'HH24:MI:ss') < '09:00:00' order by tanggal desc;`;
      }

      const getAbsensiById = await pool.query(query);

      const pegawai = getpegawai.rows[0];
      const absensi = getAbsensiById.rows;
      //   console.log(absensi);
      //   console.log(jam_kerja);
      res.render("absensi/detail", {
        title: title,
        pegawai,
        absensi,
        sessions,
        tgl_akhir,
        tgl_awal,
      });
    } else {
      res.redirect("/");
    }
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

const history = async (req, res) => {
  try {
    var sessions = req.session;
    const tgl_awal = req.query.tgl_awal;
    const tgl_akhir = req.query.tgl_akhir;
    const jam_kerja = req.query.jam_kerja;
    if (sessions.nip) {
      const title = "Pegawai";
      const nip = sessions.nip;
      const getpegawai = await pool.query(
        `SELECT * FROM pegawai join role on role.id_role = pegawai.id_role WHERE nip = '${nip}';`
      );
      const id_pegawai = getpegawai.rows[0].id_pegawai;
      let query = "";
      if (tgl_awal == undefined && tgl_akhir == undefined) {
        query = `SELECT *, to_char(jam_keluar - jam_masuk::time, 'HH24:MI:ss') as jam_kerja FROM absensi WHERE id_pegawai = '${id_pegawai}' order by tanggal desc;`;
      } else if (
        tgl_awal !== undefined &&
        tgl_akhir !== undefined &&
        jam_kerja == ""
      ) {
        query = `SELECT *, to_char(jam_keluar - jam_masuk::time, 'HH24:MI:ss') as jam_kerja FROM absensi WHERE id_pegawai = '${id_pegawai}' AND tanggal >= '${tgl_awal}' AND tanggal <= '${tgl_akhir}' order by tanggal desc;`;
      } else if (
        tgl_awal !== undefined &&
        tgl_akhir !== undefined &&
        jam_kerja === "lebih_besar"
      ) {
        query = `SELECT *, to_char(jam_keluar - jam_masuk::time, 'HH24:MI:ss') as jam_kerja FROM absensi WHERE id_pegawai = '${id_pegawai}' AND tanggal >= '${tgl_awal}' AND tanggal <= '${tgl_akhir}' AND to_char(jam_keluar - jam_masuk::time, 'HH24:MI:ss') >= '09:00:00' order by tanggal desc;`;
      } else if (
        tgl_awal !== undefined &&
        tgl_akhir !== undefined &&
        jam_kerja === "lebih_kecil"
      ) {
        query = `SELECT *, to_char(jam_keluar - jam_masuk::time, 'HH24:MI:ss') as jam_kerja FROM absensi WHERE id_pegawai = '${id_pegawai}' AND tanggal >= '${tgl_awal}' AND tanggal <= '${tgl_akhir}' AND to_char(jam_keluar - jam_masuk::time, 'HH24:MI:ss') < '09:00:00' order by tanggal desc;`;
      }

      const getAbsensiById = await pool.query(query);
      const pegawai = getpegawai.rows[0];
      const absensi = getAbsensiById.rows;
      res.render("absensi/history_absensi", {
        title: title,
        pegawai,
        absensi,
        sessions,
        tgl_awal,
        tgl_akhir,
        jam_kerja,
      });
    } else {
      res.redirect("/");
    }
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

const checkIn = async (req, res) => {
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
};

const checkOut = async (req, res) => {
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
};

module.exports = {
  getAbsensi,
  getAbsensiById,
  history,
  checkIn,
  checkOut,
};
