const express = require("express");
const router = express.Router();
const {
  getAllNhanVien,
  getNhanVienById,
  createNhanVien,
  updateNhanVien,
  deleteNhanVien,
  nhanVienLogin,
} = require("../controller/nhanVienController");

router.post("/login", nhanVienLogin);
router.get("/", getAllNhanVien);
router.get("/:id", getNhanVienById);
router.post("/", createNhanVien);
router.put("/", updateNhanVien);
router.delete("/:id", deleteNhanVien);
module.exports = router;
