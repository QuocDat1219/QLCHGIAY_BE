const express = require("express");
const router = express.Router();

const {
  getAllLOAIHANG,
  getLOAIHANGById,
  createLOAIHANG,
  updateLOAIHANG,
  deleteLOAIHANG,
} = require("../controller/danhMucController");

router.get("/", getAllLOAIHANG);
router.get("/:id", getLOAIHANGById);
router.post("/", createLOAIHANG);
router.put("/", updateLOAIHANG);
router.delete("/:id", deleteLOAIHANG);
module.exports = router;