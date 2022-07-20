const fs = require("fs");
var validator = require("validator");
const express = require("express");
var expressLayouts = require("express-ejs-layouts");
const app = express();
const pool = require("../db");

const getAllpegawai = async (res, req) => {
  const title = "Pegawai";
  const getpegawai = await pool.query(`SELECT * FROM pegawai;`);
  const pegawai = getpegawai.rows;
};

module.exports = {
  getAllpegawai,
};
