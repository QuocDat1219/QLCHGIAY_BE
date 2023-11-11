const express = require("express");
const router = express.Router();
const {
  getAllKhachHang,
  getKhachHangById,
  createKhachHang,
  updateKhachHang,
  deleteKhachHang,
} = require("../controller/khachHangController");

router.get("/", getAllKhachHang);
router.get("/:id", getKhachHangById);
router.post("/", createKhachHang);
router.put("/", updateKhachHang);
router.delete("/:id", deleteKhachHang);
module.exports = router;
