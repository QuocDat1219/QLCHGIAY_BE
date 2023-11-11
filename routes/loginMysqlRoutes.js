const express = require("express");
const router = express.Router();

const {
  loginMysql,
  getTable,
  getColumnOfTable,
  getDieuKienViTu,
} = require("../controller/loginMysqlController");
router.post("/login", loginMysql);
router.get("/showtable/:databasename", getTable);
router.get("/showcolumn/:table", getColumnOfTable);
router.get("/dieukienvitu", getDieuKienViTu);
module.exports = router;
