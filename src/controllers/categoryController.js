const supabase = require("../config/supabaseClient");

// GET: all categories
exports.getCategories = async (req, res) => {
  try {
    const { data: categories, error } = await supabase
      .from("categories")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// POST: create category
exports.createCategory = async (req, res) => {
  try {
    const { name, description, imageUrl } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }

    const { data: category, error } = await supabase
      .from("categories")
      .insert([{ name, description, image_url: imageUrl }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
