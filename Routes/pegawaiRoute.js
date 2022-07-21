const {
  getPegawai,
  getPegawaiById,
  deletePegawai,
  updatePegawai,
} = require("../controllers/pegawaiControllers");

const express = require("express");

const router = express.Router();

router.get("/pegawai", getPegawai);
router.get("/pegawai/detail/:id", getPegawaiById);

router.get("/pegawai/add", (req, res) => {
  const title = "pegawai";
  res.render("pegawai/add", { title: title });
});

router.get("/delete/:id", deletePegawai);
router.get("/update/:id", updatePegawai);

module.exports = router;
