const express = require("express");
const router = express.Router();

const {
  getAllCHITIETHOADON,
  getCHITIETHOADONById,
  createCHITIETHOADON,
  updateCHITIETHOADON,
  deleteCHITIETHOADON,
  getCHITIETHOADONDetail,
} = require("../controller/chiTietHoaDonController");

router.get("/", getAllCHITIETHOADON);
router.get("/detail", getCHITIETHOADONDetail);
router.get("/:id", getCHITIETHOADONById);
router.post("/", createCHITIETHOADON);
router.put("/", updateCHITIETHOADON);
router.post("/deletedetail", deleteCHITIETHOADON);
module.exports = router;
