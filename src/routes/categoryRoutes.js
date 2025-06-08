// src/routes/categoryRoutes.js
const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");
const productController = require("../controllers/productController"); // ✅ Import this

router.get("/", categoryController.getCategories);
router.post("/", categoryController.createCategory);
 // ✅ Now this will work

module.exports = router;
