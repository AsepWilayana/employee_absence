const {
  getPegawai,
  getPegawaiById,
  deletePegawai,
  updatePegawai,
  nonaktifPegawai,
  formPegawai,
} = require("../controllers/pegawaiControllers");

const express = require("express");
const router = express.Router();

router.get("/pegawai", getPegawai);
router.get("/pegawai/add", formPegawai);
router.get("/pegawai/detail/:id", getPegawaiById);

router.get("/delete/:id", deletePegawai);
router.get("/nonaktif/:id", nonaktifPegawai);
router.get("/update/:id", updatePegawai);

module.exports = router;
