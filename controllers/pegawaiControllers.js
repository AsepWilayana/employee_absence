const pool = require("../db");
var bcrypt = require("bcrypt");
var salt = bcrypt.genSaltSync(10);

const getPegawai = async (req, res) => {
  try {
    const pegawaiAll = await pool.query(`SELECT * FROM pegawai;`);
    const pegawai = pegawaiAll.rows;
    res.render("pegawai/main", { pegawai });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPegawaiById = async (req, res) => {
  try {
    const title = "Pegawai";
    const id = req.params.id;
    const getpegawai = await pool.query(
      `SELECT * FROM pegawai WHERE id_pegawai = '${id}';`
    );
    const pegawai = getpegawai.rows[0];
    res.render("pegawai/detail", { title: title, pegawai });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

const deletePegawai = async (req, res) => {
  try {
    const id = req.params.id;
    await pool.query(`DELETE FROM pegawai WHERE id_pegawai = '${id}';`);
    res.redirect("/pegawai?deleted=success");
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

module.exports = { getPegawai, getPegawaiById, deletePegawai };
