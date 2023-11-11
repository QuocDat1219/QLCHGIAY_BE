const express = require("express");
const router = express.Router();

const {
  getAllPhieuNhap,
  getPhieuNhapById,
  createPhieuNhap,
  updatePhieuNhap,
  deletePhieuNhap,
} = require("../controller/phieuNhapController");

router.get("/", getAllPhieuNhap);
router.get("/:id", getPhieuNhapById);
router.post("/", createPhieuNhap);
router.put("/:id", updatePhieuNhap);
router.delete("/:id", deletePhieuNhap);
module.exports = router;
