

const express = require("express");
const ManufacturerController = require("../controllers/manufacturerController");
const router = express.Router();

// Manufacturer CRUD endpoints
router.get("/", ManufacturerController.getManufacturers);
router.get("/:id", ManufacturerController.getManufacturerById);
router.put("/:id", ManufacturerController.updateManufacturer);
router.delete("/:id", ManufacturerController.deleteManufacturer);

// Additional endpoints
router.get("/products", ManufacturerController.getManufacturerProducts);
router.get("/dashboard/stats", ManufacturerController.getDashboardStats);

module.exports = router;
