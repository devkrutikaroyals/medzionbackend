

exports.getDashboardStats = async (req, res) => {
    try {
        // Ensure manufacturerId is valid
        const manufacturerId = req.manufacturer.id;
        if (!manufacturerId || !mongoose.Types.ObjectId.isValid(manufacturerId)) {
            return res.status(400).json({ message: "Invalid or missing Manufacturer ID." });
        }

        // Count total products for the specific manufacturer
        const totalProducts = await Product.countDocuments({ manufacturerId });

        res.status(200).json({ totalProducts });
    } catch (error) {
        console.error("Error fetching total products:", error.message);
        res.status(500).json({ message: "Failed to fetch total products." });
    }
};

