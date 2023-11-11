const express = require("express");
const router = express.Router();

const {
    getAllThuongHieu,
    getThuongHieuById,
    createThuongHieu,
    updateThuongHieu,
    deleteThuongHieu
} = require("../controller/thuonghieuController");

router.get("/", getAllThuongHieu);
router.get("/:id", getThuongHieuById);
router.post("/", createThuongHieu);
router.put("/", updateThuongHieu);
router.delete("/:id", deleteThuongHieu);
module.exports = router;