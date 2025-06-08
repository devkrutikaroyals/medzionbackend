const bcrypt = require("bcryptjs");
const supabase = require("../config/supabaseClient");

// Get all masters
exports.getMasters = async (req, res) => {
  try {
    const { data: masters, error } = await supabase.from("masters").select("*");

    if (error) throw error;

    res.status(200).json({ success: true, data: masters });
  } catch (error) {
    console.error("Error fetching masters:", error.message);
    res.status(500).json({ success: false, message: "Failed to fetch masters", error: error.message });
  }
};

// Create a new master account
exports.createMaster = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "Name, email, and password are required." });
    }

    // Check if email already exists
    const { data: existingMaster, error: fetchError } = await supabase
      .from("masters")
      .select("id")
      .eq("email", email)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") throw fetchError; // Skip error if no rows found

    if (existingMaster) {
      return res.status(409).json({ success: false, message: "Email already in use." });
    }

    // Hash password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    const { data: newMaster, error: insertError } = await supabase
      .from("masters")
      .insert([{ name, email, password: hashedPassword }])
      .select()
      .single();

    if (insertError) throw insertError;

    res.status(201).json({ success: true, message: "Master created successfully", data: newMaster });
  } catch (error) {
    console.error("Error creating master:", error.message);
    res.status(500).json({ success: false, message: "Failed to create master", error: error.message });
  }
};
