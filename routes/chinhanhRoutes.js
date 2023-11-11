const express = require("express");
const router = express.Router();
const {
  getChiNhanh,
  updateChiNhanh,
  deleteChiNhanh,
  craeteChiNhanh,
  getChiNhanhById,
} = require("../controller/chinhanhController");

router.get("/", getChiNhanh);
router.post("/", craeteChiNhanh);
router.get("/:id", getChiNhanhById);
router.put("/", updateChiNhanh);
router.delete("/:id", deleteChiNhanh);

module.exports = router;
