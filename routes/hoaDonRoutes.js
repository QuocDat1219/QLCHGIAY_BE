const express = require("express");
const router = express.Router();

const {
  getAllHOADON,
  getHOADONById,
  createHOADON,
  updateHOADON,
  deleteHOADON,
} = require("../controller/hoaDonController");

router.get("/", getAllHOADON);
router.get("/:id", getHOADONById);
router.post("/", createHOADON);
router.put("/:id", updateHOADON);
router.delete("/:id", deleteHOADON);
module.exports = router;
