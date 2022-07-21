const pool = require("../db");
var bcrypt = require("bcrypt");
var salt = bcrypt.genSaltSync(10);

const getPegawai = async (req, res) => {
  try {
    const pegawaiAll = await pool.query(
      `SELECT * FROM pegawai order by id_pegawai asc;`
    );
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

const updatePegawai = async (req, res) => {
  try {
    const title = "Web Server EJS";
    const id = req.params.id;
    const getPegawaiById = await pool.query(
      `SELECT * FROM pegawai WHERE id_pegawai = '${id}';`
    );
    const pegawai = getPegawaiById.rows[0];
    if (!pegawai) {
      res.status(404).render("error_page", { respone: "page not found : 404" });
    }

    errors = "";
    Errorname = "";
    Erroremail = "";
    Errormobile = "";

    res.render("pegawai/update", {
      title: title,
      pegawai,
      errors,
      Errorname,
      Erroremail,
      Errormobile,
    });
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

module.exports = { getPegawai, getPegawaiById, deletePegawai, updatePegawai };
