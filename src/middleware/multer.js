const multer = require("multer");

// Configure multer storage in memory or disk
const storage = multer.memoryStorage();

const upload = multer({ storage });

module.exports = upload;
