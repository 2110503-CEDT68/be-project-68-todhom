const mongoose = require("mongoose");

const RentalSchema = new mongoose.Schema({
  rentalDate: {
    type: Date,
    required: true,
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  provider: {
    type: mongoose.Schema.ObjectId,
    ref: "Provider",
    required: true,
  },
  createAt: {
    type: Date,
    default: Date.now,
  },
});
module.exports = mongoose.model("Rental", RentalSchema);
