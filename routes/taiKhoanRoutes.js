const express = require("express");
const router = express.Router();

const {
  getAllTAIKHOAN,
  getTAIKHOANById,
  createTAIKHOAN,
  updateTAIKHOAN,
  deleteTAIKHOAN,
} = require("../controller/taiKhoanController");

router.get("/", getAllTAIKHOAN);
router.get("/:id", getTAIKHOANById);
router.post("/", createTAIKHOAN);
router.put("/", updateTAIKHOAN);
router.delete("/:id", deleteTAIKHOAN);
module.exports = router;
