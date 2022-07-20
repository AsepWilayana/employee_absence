// const fs = require("fs");
// var validator = require("validator");
// const express = require("express");
// var expressLayouts = require("express-ejs-layouts");
// const app = express();
// const pool = require("./db");

// const loadContact = () => {
//   const contacts = pool.query(`SELECT * FROM contacts;`);
//   return contacts;
// };

// const validateName = async (name) => {
//   const contacts = await pool.query(
//     `SELECT * FROM contacts WHERE lower(name) = lower('${name}');`
//   );
//   if (contacts.rows.length > 0) {
//     const inputan = name;
//     const msg = "nama sudah ada, silahkan gunakan nama lain";
//     Errorname = {
//       inputan,
//       msg,
//     };
//     errors.push(Errorname);
//   }
// };

// function validateEmail(email) {
//   validemail = validator.isEmail(email);
//   if (validemail === false) {
//     const inputan = email;
//     const msg = "pengisian email tidak sesuai dengan format";
//     Erroremail = {
//       inputan,
//       msg,
//     };
//     errors.push(Erroremail);
//   }
// }

// function validateMobile(mobile) {
//   validphone = validator.isMobilePhone(mobile, "id-ID");
//   if (validphone === false) {
//     const inputan = mobile;
//     const msg = "pengisian nomor hp tidak sesuai";
//     Errormobile = {
//       inputan,
//       msg,
//     };
//     errors.push(Errormobile);
//   }
// }

// const validateAdd = async (req, res, next) => {
//   const name = req.body.name;
//   const email = req.body.email;
//   const mobile = req.body.mobile;
//   errors = [];
//   const title = "Web Server EJS";
//   await validateName(name);
//   validateEmail(email);
//   validateMobile(mobile);

//   const jumlah = errors.length;

//   console.log(errors);
//   //res.render("updateContact", { title: title, msg, inputan, contact });
//   if (jumlah > 0) {
//     res.render("addContact", {
//       title: title,
//       errors,
//       Errorname,
//       Erroremail,
//       Errormobile,
//     });
//     return;
//   }
//   next();
// };

// const validateUpdate = async (req, res, next) => {
//   const name = req.body.name;
//   const email = req.body.email;
//   const mobile = req.body.mobile;

//   errors = [];
//   const title = "Web Server EJS";
//   await validateName(name);
//   validateEmail(email);
//   validateMobile(mobile);

//   const id = req.params.id;
//   const jumlah = errors.length;
//   const cont = await pool.query(`SELECT * FROM contacts WHERE name = '${id}';`);
//   const contact = cont.rows[0];
//   if (jumlah > 0) {
//     res.render("updateContact", {
//       title: title,
//       errors,
//       Errorname,
//       Erroremail,
//       Errormobile,
//       contact,
//     });
//     return;
//   }
//   next();
// };

// const save_context = (name, email, mobile) => {
//   //data yg akan di masukan file contact
//   const contact = {
//     name,
//     email,
//     mobile,
//   };
//   const contacts = loadContact();

//   contacts.push(contact);

//   fs.writeFileSync("data/contacts.json", JSON.stringify(contacts));

//   //tambhakan ke file
//   //rl.close();
// };

// const Deletedata = (name) => {
//   const findData = contacts.find((item) => item.name == name);

//   if (findData !== undefined) {
//     const deletedData = contacts.filter((item) => item.name !== name);

//     fs.writeFileSync("data/contacts.json", JSON.stringify(deletedData));
//   }
// };

// const Updatedata = async (name, newname, newemail, newmobile) => {
//   const findData = await pool.query(
//     `SELECT * FROM contacts WHERE name = '${name}';`
//   );
//   // console.log(findData);
//   if (findData.rows.length > 0) {
//     //dihapus dulu data yg sudah ketemmu

//     // buat objek baru
//     const Newname = newname || findData.name;
//     const Newemail = newemail || findData.email;
//     const Newmobile = newmobile || findData.mobile;
//     pool.query(`UPDATE contacts
// 	  SET name='${Newname}', mobile='${Newmobile}', email='${Newemail}'
// 	  WHERE name = '${name}';`);
//   } else {
//     console.log("data tidak ada");
//     return;
//   }
// };

// module.exports = {
//   loadContact,
//   save_context,
//   validateAdd,
//   validateUpdate,
//   Deletedata,
//   Updatedata,
// };
