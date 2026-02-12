const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./src/config/db");

dotenv.config();

console.log("SERVER RUNNING FROM:", __filename);
console.log("ENV CHECK:", process.env.MONGO_URI);

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/dashboard", require("./src/routes/dashboardRoutes"));
app.use("/api/notifications", require("./src/routes/notificationRoutes"));
app.use("/api/leads", require("./src/routes/leadRoutes"));


require("./src/utils/cronJobs");


app.get("/", (req, res) => {
  res.send("CRM Backend Running...");
});

const PORT = process.env.PORT || 5000;

// Start server AFTER DB connection
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
});
