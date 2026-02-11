const express = require("express");
const authRoutes = require('./src/routes/authRoutes'); // <--- Import your new Route

const app = express();

app.use(express.json());

// Mount the Auth Routes
app.use('/api/auth', authRoutes); // <--- Activate the Road

app.get("/", (req, res) => {
  res.send("CRM Backend Running");
});

module.exports = app;