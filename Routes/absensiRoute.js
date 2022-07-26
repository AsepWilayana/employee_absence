const {
  getAbsensi,
  getAbsensiById,
  history,
  checkIn,
  checkOut,
} = require("../controllers/absensiControler");
// const { upload } = require("../middelware/multer");

// const uploads = upload.single("profile-file");

const express = require("express");
const router = express.Router();

router.get("/absensi", getAbsensi);
router.get("/absensi/detail/:id", getAbsensiById);
router.get("/history", history);
router.get("/checkin/:id", checkIn);
router.get("/checkout/:id", checkOut);

module.exports = router;
