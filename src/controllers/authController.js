const User = require("../models/User");
const Lead = require("../models/Lead");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Notification = require("../models/Notification");

// REGISTER
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({ name, email, password, role: "sales" });

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// LOGIN (Admin/Sales)
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    await Notification.create({
      userId: user._id,
      title: "Login Successful",
      message: "You logged into CRM",
      type: "system",
    });

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

// CLIENT LOGIN
const clientLogin = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Username and password required" });
    }

    // Find lead by username
    const lead = await Lead.findOne({ username, isDeleted: false });
    if (!lead) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Plain text password comparison (as stored in leads)
    if (lead.password !== password) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Sign a client-specific JWT
    const token = jwt.sign(
      { id: lead._id, role: "client" },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      client: {
        id: lead._id,
        name: lead.company || lead.name,
        email: lead.email,
        username: lead.username,
        totalAmount: lead.totalAmount || 0,
        amountPaid: lead.amountPaid || 0,
        remaining: lead.remaining || 0,
      },
    });
  } catch (error) {
    console.error("CLIENT LOGIN ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { register, login, clientLogin };