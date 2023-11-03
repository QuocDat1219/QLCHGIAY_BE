const express = require("express");
const route = express.Router();

const { migrateDatabase } = require("../controller/phanTanNgangController");

route.post("/phantan", migrateDatabase);

module.exports = route;
