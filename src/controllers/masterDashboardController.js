


const supabase = require("../config/supabaseClient");




exports.getTotalProducts = async (req, res) => {
  try {
    const { count, error } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true });

    if (error) throw error;
    res.json({ totalProducts: count });
  } catch (error) {
    res.status(500).json({ message: "Error fetching products count", error: error.message });
  }
};

// 📊 Get Total Manufacturers
exports.getTotalManufacturers = async (req, res) => {
  try {
    const { count, error } = await supabase
      .from("manufacturers")
      .select("*", { count: "exact", head: true });

    if (error) throw error;
    res.json({ totalManufacturers: count });
  } catch (error) {
    res.status(500).json({ message: "Error fetching manufacturers count", error: error.message });
  }
};

// 🛍️ Get All Products (Dashboard)
exports.getAllProducts = async (req, res) => {
  try {
    const { data: products, error } = await supabase.from("products").select("*");
    if (error) throw error;
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Error fetching products", error: error.message });
  }
};

// 🛍️ Get All Categories
exports.getAllCategories = async (req, res) => {
  try {
    const { data: categories, error } = await supabase.from("categories").select("*");
    if (error) throw error;
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: "Error fetching categories", error: error.message });
  }
};

// 🛒 Get Products for Master Dashboard
exports.getProducts = async (req, res) => {
  try {
    const { data: products, error } = await supabase.from("products").select("*");
    if (error) throw error;
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Error fetching products", error: error.message });
  }
};

// ➕ Add a Product
exports.addProduct = async (req, res) => {
  try {
    const { data: product, error } = await supabase.from("products").insert([req.body]).select().single();
    if (error) throw error;
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// 🔍 Get Single Product by ID
exports.getProductById = async (req, res) => {
  try {
    const { data: product, error } = await supabase.from("products").select("*").eq("id", req.params.id).single();
    if (!product) return res.status(404).json({ message: "Product not found" });
    if (error) throw error;
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: "Error fetching product", error: error.message });
  }
};

// 🔄 Update Product
exports.updateProduct = async (req, res) => {
  try {
    const { data: updatedProduct, error } = await supabase
      .from("products")
      .update(req.body)
      .eq("id", req.params.id)
      .select()
      .single();

    if (!updatedProduct) return res.status(404).json({ message: "Product not found" });
    if (error) throw error;
    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: "Error updating product", error: error.message });
  }
};

// ❌ Delete Product
exports.deleteProduct = async (req, res) => {
  try {
    const { error } = await supabase.from("products").delete().eq("id", req.params.id);
    if (error) throw error;
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting product", error: error.message });
  }
};

// 🔢 Manufacturer Dashboard Stats
exports.getDashboardStats = async (req, res) => {
  try {
    const manufacturerId = req.manufacturer?.id;
    if (!manufacturerId) return res.status(400).json({ message: "Missing manufacturer ID" });

    const { count, error } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("manufacturer", manufacturerId);

    if (error) throw error;

    res.status(200).json({ totalProducts: count });
  } catch (error) {
    console.error("Error fetching total products:", error.message);
    res.status(500).json({ message: "Failed to fetch total products." });
  }
};
