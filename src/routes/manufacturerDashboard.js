
const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const { getDashboardStats, getManufacturerProducts } = require("../controllers/manufacturerController");

const router = express.Router();

router.get("/dashboard", authMiddleware, getDashboardStats);
router.get("/products", authMiddleware, getManufacturerProducts);

module.exports = router;
