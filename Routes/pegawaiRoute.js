const {
  getPegawai,
  getPegawaiById,
  deletePegawai,
  updatePegawai,
  nonaktifPegawai,
} = require("../controllers/pegawaiControllers");
// const { upload } = require("../middelware/multer");

// const uploads = upload.single("profile-file");

const express = require("express");
const router = express.Router();

router.get("/pegawai", getPegawai);
router.get("/pegawai/detail/:id", getPegawaiById);

// router.post("/pegawai", savePegawai);

router.get("/delete/:id", deletePegawai);
router.get("/nonaktif/:id", nonaktifPegawai);
router.get("/update/:id", updatePegawai);

module.exports = router;
