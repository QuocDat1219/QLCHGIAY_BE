const express = require("express");
const router = express.Router();

const {
  getAllCHITIETPHIEUNHAP,
  getCHITIETPHIEUNHAPById,
  createCHITIETPHIEUNHAP,
  updateCHITIETPHIEUNHAP,
  deleteCHITIETPHIEUNHAP,
  getCHITIETPHIEUNHAPDetail,
} = require("../controller/chitietPhieuNhapController");

router.get("/", getAllCHITIETPHIEUNHAP);
router.get("/detail", getCHITIETPHIEUNHAPDetail);
router.get("/:id", getCHITIETPHIEUNHAPById);
router.post("/", createCHITIETPHIEUNHAP);
router.put("/", updateCHITIETPHIEUNHAP);
router.post("/deletedetail", deleteCHITIETPHIEUNHAP);
module.exports = router;
