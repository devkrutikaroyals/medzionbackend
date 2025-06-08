require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const compression = require("compression");
const morgan = require("morgan");
const { createClient } = require("@supabase/supabase-js");

console.log("Supabase URL:", process.env.SUPABASE_URL ? "✅ Loaded" : "❌ Missing");
console.log("Supabase Key:", process.env.SUPABASE_KEY ? "✅ Loaded" : "❌ Missing");

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Import routes & middleware
const errorHandler = require("./src/middleware/errorMiddleware");
const authRoutes = require("./src/routes/authRoutes");
const categoryRoutes = require("./src/routes/categoryRoutes");
const productRoutes = require("./src/routes/productRoutes");
const manufacturerRoutes = require("./src/routes/manufacturerRoutes");
const manufacturerDashboard = require("./src/routes/manufacturerDashboard");
const masterDashboard = require("./src/routes/masterDashboard");
const orderRoutes = require("./src/routes/orderRoutes");

const app = express();

// ✅ Unified CORS setup for both local & deployed frontend
const allowedOrigins = [
  "http://localhost:3000",
  "https://medizon-frontend-six.vercel.app"
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

// ✅ Middleware
app.use(express.json({ limit: "10mb" }));
app.use(helmet());
app.use(compression());
app.use(morgan("dev"));

// ✅ Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { message: "Too many requests from this IP, please try again later." }
});
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: "Too many login attempts, please try again later."
});

// ✅ Health check route
app.get("/", (req, res) => res.send("Server is running"));

// ✅ Supabase connection test route
app.get("/api/supabase-test", async (req, res) => {
  try {
    const { data, error } = await supabase.from("products").select("*").limit(1).single();
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    console.error("Supabase test error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ✅ Apply rate limiting
app.use("/api/", apiLimiter);
app.use("/api/auth/login", authLimiter);

// ✅ API Routes
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/manufacturers", manufacturerRoutes);
app.use("/api/manufacturer-dashboard", manufacturerDashboard);
app.use("/api/master-dashboard", masterDashboard);

// ✅ Dashboard Stats APIs
app.get("/api/total-products", async (req, res) => {
  try {
    const { count, error } = await supabase.from("products").select("id", { count: "exact", head: true });
    if (error) throw error;
    res.status(200).json({ success: true, totalProducts: count });
  } catch (err) {
    console.error("Error fetching product count:", err.message);
    res.status(500).json({ success: false, message: "Failed to fetch product count" });
  }
});

app.get("/api/total-manufacturers", async (req, res) => {
  try {
    const { count, error } = await supabase
      .from("users")
      .select("id", { count: "exact", head: true })
      .eq("role", "manufacturer");
    if (error) throw error;
    res.status(200).json({ success: true, totalCompanies: count });
  } catch (err) {
    console.error("Error fetching company count:", err.message);
    res.status(500).json({ success: false, message: "Failed to fetch company count" });
  }
});

// ✅ Error handling and 404
app.use(errorHandler);
app.use((req, res) => res.status(404).json({ success: false, message: "Endpoint not found" }));

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔒 Environment: ${process.env.NODE_ENV || "development"}`);
});

// ✅ Graceful shutdown
process.on("SIGINT", () => {
  console.log("🛑 Graceful shutdown");
  process.exit(0);
});
