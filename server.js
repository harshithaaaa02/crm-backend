const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./src/config/db");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const errorHandler = require("./src/middlewares/errorMiddleware");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./src/config/swagger");


dotenv.config();

console.log("SERVER RUNNING FROM:", __filename);
console.log("ENV CHECK:", process.env.MONGO_URI);

const app = express();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100
});
app.use(helmet());
app.use(limiter);

app.use(cors({
  origin: "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

app.options("*", cors());

app.use(express.json());


// Routes
app.use("/api/dashboard", require("./src/routes/dashboardRoutes"));
app.use("/api/notifications", require("./src/routes/notificationRoutes"));
app.use("/api/leads", require("./src/routes/leadRoutes"));
app.use("/api/clients", require("./src/routes/clientRoutes"));
app.use("/api/audit-logs", require("./src/routes/auditRoutes"));
app.use("/api/auth", require("./src/routes/authRoutes"));
 

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
require("./src/utils/cronJobs");

app.get("/", (req, res) => {
  res.send("CRM Backend Running...");
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Start server AFTER DB connection
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
});
