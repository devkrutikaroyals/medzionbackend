const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const supabase = require("../config/supabaseClient");
const sendEmail = require("../../mailer"); // If you don't have this, remove email logic

require("dotenv").config();


exports.register = async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    // Only one master allowed, check if already exists
    if (role === "master") {
      const { data: existingMasters, error: masterCheckError } = await supabase
        .from("users")
        .select("id")
        .eq("role", "master");

      if (masterCheckError) throw masterCheckError;

      if (existingMasters && existingMasters.length > 0) {
        return res.status(400).json({ message: "Master already registered." });
      }
    }

      // ✅ Trigger email confirmation for manufacturer
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: "https://your-frontend.com/verify-success", // change this!
      },
    });

    if (authError || !authData?.user) {
      console.error("Supabase Auth signup error:", authError);
      return res.status(400).json({ message: authError?.message || "Signup failed." });
    }

    const userId = authData.user.id;
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user metadata into 'users' table
    const { data: newUser, error: userError } = await supabase
      .from("users")
      .insert([
        {
          id: userId,
          name,
          email,
          password: hashedPassword,
          role,
          isAuthorized: role === "manufacturer" ? false : true, // Manufacturers require approval
        },
      ])
      .select()
      .single();

    if (userError) {
      console.error("Insert into users table failed:", userError);
      return res.status(500).json({ message: "User metadata creation failed." });
    }

    // Insert into role-specific tables
    if (role === "manufacturer") {
      // Multiple manufacturers allowed — no check needed here
      const { error: mfError } = await supabase.from("manufacturers").insert([
        {
          name,
          email,
          user_id: userId,
          password: hashedPassword, // optional depending on your schema
        },
      ]);
      if (mfError) {
        console.error("Manufacturer insert error:", mfError);
        return res.status(500).json({ message: "Failed to register manufacturer." });
      }
    } else if (role === "master") {
      // Only one master allowed — already checked above
      const { error: masterError } = await supabase.from("masters").insert([
        {
          name,
          email,
          user_id: userId,
          password: hashedPassword,
        },
      ]);
      if (masterError) {
        console.error("Master insert error:", masterError);
        return res.status(500).json({ message: "Failed to register master." });
      }
    }

    return res.status(201).json({
      message: "User registered successfully",
      user: newUser,
    });

  } catch (error) {
    console.error("🔥 Registration error:", error);
    return res.status(500).json({ message: "Registration failed" });
  }
};





exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.session || !data.user) {
      console.error("Supabase Auth error:", error);
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const user = data.user;

    const { data: userDataList, error: userError } = await supabase
      .from("users")
      .select("role, isAuthorized")
      .eq("id", user.id);

    if (userError || !userDataList || userDataList.length === 0) {
      return res.status(500).json({ message: "User metadata not found." });
    }

    const userData = userDataList[0];

    if (userData.role === "manufacturer" && !userData.isAuthorized) {
      return res.status(403).json({ message: "Awaiting approval from admin." });
    }

  return res.status(200).json({
  message: "Login successful",
  token: data.session.access_token,
  user: {
    id: user.id,
    email: user.email,
    role: userData.role,
  },
  redirect: userData.role === "master" ? "/master-dashboard" : "/manufacturer-dashboard",
});

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Internal server error." });
  }
};





// exports.loginUser = async (req, res) => {
//   try {
//     const { email, password, role } = req.body;
//     if (!email || !password || !role) {
//       return res.status(400).json({ message: "All fields are required." });
//     }

//       const { data, error } = await supabase.auth.signInWithPassword({
//       email,
//       password,
//     });

//     if (error) {
//       console.error("Supabase error:", error);
//       return res.status(500).json({ message: "Database error" });
//     }

//     if (!users || users.length === 0) {
//       return res.status(404).json({ message: "User not found." });
//     }

//     const user = data.user;

//     if (role === "manufacturer" && !user.isAuthorized) {
//       return res.status(403).json({ message: "Awaiting approval." });
//     }

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) return res.status(401).json({ message: "Incorrect password." });

//     const token = jwt.sign(
//       { id: user.id, role: user.role },
//       process.env.JWT_SECRET,
//       { expiresIn: "1h" }
//     );

//     res.status(200).json({
//       message: "Login successful",
//       token,
//       user,
//       redirect: user.role === "master" ? "/master-dashboard" : "/manufacturer-dashboard",
//     });
//   } catch (error) {
//     console.error("Login error:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };


exports.approveManufacturer = async (req, res) => {
  const { email } = req.query;

  try {
    const { data: user, error: findError } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .eq("role", "manufacturer")
      .single();

    if (findError) throw findError;
    if (!user) return res.status(404).json({ message: "Manufacturer not found" });
    if (user.isAuthorized) return res.status(400).json({ message: "Already approved" });

    const { error: updateError } = await supabase
      .from("users")
      .update({ isAuthorized: true })
      .eq("email", email);

    if (updateError) throw updateError;

    await sendEmail(email, "Approved", "Your manufacturer account has been approved.");

    res.status(200).json({ message: "Manufacturer approved successfully" });
  } catch (error) {
    console.error("🔥 Approve Error:", error.message);
    res.status(500).json({ message: "Internal error" });
  }
};

// fetch pending manufacturers
exports.fetchPendingManufacturers = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("role", "manufacturer")
      .eq("isAuthorized", false);

    if (error) throw error;

    res.status(200).json(data);
  } catch (error) {
    console.error("🔥 Fetch Error:", error.message);
    res.status(500).json({ message: "Error fetching pending manufacturers" });
  }
};

// authorize manufacturer
exports.authorizeManufacturer = async (req, res) => {
  const { email } = req.body;

  try {
    const { data: user, error: findError } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .eq("role", "manufacturer")
      .single();

    if (findError) throw findError;
    if (!user) return res.status(404).json({ message: "Manufacturer not found" });
    if (user.isAuthorized) return res.status(400).json({ message: "Already approved" });

    const { error: updateError } = await supabase
      .from("users")
      .update({ isAuthorized: true })
      .eq("email", email);

    if (updateError) throw updateError;

    // Optional: Notify via email
    await sendEmail(email, "Approved", "Your manufacturer account has been approved.");

    res.status(200).json({ message: "Manufacturer approved successfully" });
  } catch (error) {
    console.error("🔥 Authorization Error:", error.message);
    res.status(500).json({ message: "Internal error" });
  }
};

// decline manufacturer
exports.declineManufacturer = async (req, res) => {
  const { email } = req.body;

  try {
    const { error } = await supabase
      .from("users")
      .delete()
      .eq("email", email)
      .eq("role", "manufacturer");

    if (error) throw error;

    res.status(200).json({ message: "Manufacturer declined and deleted." });
  } catch (error) {
    console.error("🔥 Decline Error:", error.message);
    res.status(500).json({ message: "Internal error" });
  }
};
exports.updatePassword = async (req, res) => {
  const { email, currentPassword, newPassword } = req.body;

  if (!email || !currentPassword || !newPassword) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    const { data: user, error: fetchError } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (fetchError) throw fetchError;
    if (!user) return res.status(404).json({ message: "User not found." });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(401).json({ message: "Incorrect current password." });

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const { error: updateError } = await supabase
      .from("users")
      .update({ password: hashedPassword })
      .eq("email", email);

    if (updateError) throw updateError;

    res.status(200).json({ message: "Password updated successfully." });
  } catch (error) {
    console.error("🔥 Password Update Error:", error.message);
    res.status(500).json({ message: "Internal server error." });
  }
};
