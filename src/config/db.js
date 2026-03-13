const mongoose = require("mongoose");
const User = require("../models/User");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log(" MongoDB Connected Successfully");

    // Force re-seed admin user
    await User.findOneAndDelete({ email: "admin@email.com" });

    await User.create({
      name: "Admin User",
      email: "admin@email.com",
      password: "admin123",
      role: "admin"
    });
    console.log("Admin user (re)seeded successfully");
  } catch (error) {
    console.error(" MongoDB Connection Failed:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;