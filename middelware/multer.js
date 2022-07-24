var multer = require("multer");
var morgan = require("morgan");
const http = require("http");
const fs = require("fs");

const express = require("express");
const app = express();
var expressLayouts = require("express-ejs-layouts");
const pool = require("../db");
var pegawaiRoute = require("../Routes/pegawaiRoute");
const port = 3000;
const moment = require("moment");
const session = require("express-session");

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/uploads");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
var upload = multer({ storage: storage });

var bcrypt = require("bcrypt");
var salt = bcrypt.genSaltSync(10);

const console = require("console");

module.exports = {
  upload,
  salt,
  bcrypt,
  http,
  fs,
  express,
  expressLayouts,
  pool,
  pegawaiRoute,
  app,
  port,
  console,
  session,
  fs,
};
