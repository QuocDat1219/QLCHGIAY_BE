const express = require("express");
const router = express.Router();

const {
  getAllMATHANG,
  getMATHANGById,
  createMATHANG,
  updateMATHANG,
  deleteMATHANG,
} = require("../controller/sanPhamController");

router.get("/", getAllMATHANG);
router.get("/:id", getMATHANGById);
router.post("/", createMATHANG);
router.put("/", updateMATHANG);
router.delete("/:id", deleteMATHANG);
module.exports = router;
