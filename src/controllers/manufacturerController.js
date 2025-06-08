


const supabase = require("../config/supabaseClient");


// Helper function to validate ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Get all manufacturers
exports.getManufacturers = async (req, res) => {
  try {
    const { data: manufacturers, error } = await supabase
      .from("manufacturers")
      .select("*");

    if (error) throw error;

    res.status(200).json(manufacturers);
  } catch (error) {
    console.error("Error fetching manufacturers:", error.message);
    res.status(500).json({ message: "Failed to fetch manufacturers." });
  }
};

// Get manufacturer by ID
exports.getManufacturerById = async (req, res) => {
  const { id } = req.params;
  if (!id) return res.status(400).json({ message: "Invalid Manufacturer ID." });

  try {
    const { data: manufacturer, error } = await supabase
      .from("manufacturers")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") // No rows found (PostgREST error)
        return res.status(404).json({ message: "Manufacturer not found" });
      throw error;
    }

    res.status(200).json(manufacturer);
  } catch (error) {
    console.error("Error fetching manufacturer by ID:", error.message);
    res.status(500).json({ message: "Failed to fetch manufacturer." });
  }
};

// Update manufacturer details
exports.updateManufacturer = async (req, res) => {
  const { id } = req.params;
  if (!id) return res.status(400).json({ message: "Invalid Manufacturer ID." });

  try {
    const { data: updatedManufacturer, error } = await supabase
      .from("manufacturers")
      .update(req.body)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST116")
        return res.status(404).json({ message: "Manufacturer not found" });
      throw error;
    }

    res.status(200).json(updatedManufacturer);
  } catch (error) {
    console.error("Error updating manufacturer:", error.message);
    res.status(500).json({ message: "Failed to update manufacturer." });
  }
};

// Delete manufacturer
exports.deleteManufacturer = async (req, res) => {
  const { id } = req.params;
  if (!id) return res.status(400).json({ message: "Invalid Manufacturer ID." });

  try {
    const { error } = await supabase
      .from("manufacturers")
      .delete()
      .eq("id", id);

    if (error) {
      if (error.code === "PGRST116")
        return res.status(404).json({ message: "Manufacturer not found" });
      throw error;
    }

    res.status(200).json({ message: "Manufacturer deleted successfully." });
  } catch (error) {
    console.error("Error deleting manufacturer:", error.message);
    res.status(500).json({ message: "Failed to delete manufacturer." });
  }
};

// Get products of logged-in manufacturer
exports.getManufacturerProducts = async (req, res) => {
  const manufacturerId = req.user?.id;
  if (!manufacturerId) return res.status(400).json({ message: "Invalid or missing Manufacturer ID." });

  try {
    const { data: products, error } = await supabase
      .from("products")
      .select("*")
      .eq("manufacturerId", manufacturerId);

    if (error) throw error;

    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching products:", error.message);
    res.status(500).json({ message: "Failed to fetch products." });
  }
};

// Get dashboard stats (e.g., total products)
exports.getDashboardStats = async (req, res) => {
  const manufacturerId = req.user?.id;
  if (!manufacturerId) return res.status(400).json({ message: "Invalid or missing Manufacturer ID." });

  try {
    const { count, error } = await supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("manufacturerId", manufacturerId);

    if (error) throw error;

    res.status(200).json({ totalProducts: count });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error.message);
    res.status(500).json({ message: "Failed to fetch dashboard stats." });
  }
};
