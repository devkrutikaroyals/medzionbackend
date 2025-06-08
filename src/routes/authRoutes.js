const express = require("express");
const router = express.Router();

const {
  register,
  loginUser,
  fetchPendingManufacturers,
  authorizeManufacturer,
  declineManufacturer,
  updatePassword,
  approveManufacturer
} = require("../controllers/authController");

router.post("/register", register);
router.post("/login", loginUser)
router.get("/pending-manufacturers", fetchPendingManufacturers);
router.post("/authorize", authorizeManufacturer);
router.post("/decline-manufacturer", declineManufacturer);
router.put("/update-password", updatePassword);
router.post("/approveMf",approveManufacturer)


module.exports = router;
