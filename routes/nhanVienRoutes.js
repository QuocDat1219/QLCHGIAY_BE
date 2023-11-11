const express = require("express");
const router = express.Router();
const {
  getAllNhanVien,
  getNhanVienById,
  createNhanVien,
  updateNhanVien,
  deleteNhanVien,
} = require("../controller/nhanVienController");
router.get("/", getAllNhanVien);
router.get("/:id", getNhanVienById);
router.post("/", createNhanVien);
router.put("/", updateNhanVien);
router.delete("/:id", deleteNhanVien);
module.exports = router;
