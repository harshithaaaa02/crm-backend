const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Notification = require("../models/Notification");

// REGISTER
const register = async (req, res) => {
  try {
    // 1. Destructure 'role' from the request body
    const { name, email, password} = req.body; 

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

   // 2. Force role to 'sales' (employee)
    const user = await User.create({ name, email, password, role: 'sales' }); 

    res.status(201).json({ message: "User registered successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// LOGIN
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

    // ✅ Create notification
    await Notification.create({
      userId: user._id,
      title: "Login Successful",
      message: "You logged into CRM",
      type: "system"
    });

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {

    console.error("LOGIN ERROR:", error);
    res.status(500).json({ message: error.message });

  }
};

module.exports = { register, login };
