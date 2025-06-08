// const supabase = require("../config/supabaseClient");

// const authenticate = async (req, res, next) => {
//   const token = req.headers.authorization?.split(" ")[1];
// console.log("token in auth:",token);

//   if (!token) {
//     return res.status(401).json({ message: "Unauthorized" });
//   }

//   const { data: { user }, error } = await supabase.auth.getUser(token);

//   if (error || !user) {
//     return res.status(401).json({ message: "Invalid token" });
//   }

//   req.user = user;
//   next();
// };

// module.exports = authenticate;


const supabase = require("../config/supabaseClient");

const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  console.log("token in auth:", token);

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      console.error("Supabase auth error:", error);
      return res.status(401).json({ message: "Invalid token" });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("Authentication error:", err);
    return res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = authenticate;
