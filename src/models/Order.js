const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  product: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Product",
    required: true 
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  status: { 
    type: String, 
    default: "Pending",
    enum: ["Pending", "Confirmed", "Shipped", "Delivered", "Cancelled"]
  },
  manufacturer: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User",
    required: true 
  }
}, { 
  timestamps: true 
});

module.exports = mongoose.model("Order", orderSchema);