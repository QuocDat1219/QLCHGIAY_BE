const express = require("express");
const router = express.Router();
const {
    getAllCuaHang
} = require("../controller/cuahangController");

router.get("/", getAllCuaHang);


module.exports = router;
