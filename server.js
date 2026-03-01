const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./src/config/db");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const errorHandler = require("./src/middlewares/errorMiddleware");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./src/config/swagger");

const http = require("http");
const { Server } = require("socket.io");

dotenv.config();

console.log("SERVER RUNNING FROM:", __filename); 
console.log("ENV CHECK:", process.env.MONGO_URI);


// ✅ CREATE EXPRESS APP FIRST
const app = express();


// 🔐 Security Middleware
app.use(helmet());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});

app.use(limiter);


// ✅ CORS
app.use(cors({
  origin: "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

app.options("*", cors());


// ✅ Body parser
app.use(express.json());


// ✅ Routes
app.use("/api/auth", require("./src/routes/authRoutes"));
app.use("/api/leads", require("./src/routes/leadRoutes"));
app.use("/api/clients", require("./src/routes/clientRoutes"));
app.use("/api/dashboard", require("./src/routes/dashboardRoutes"));
app.use("/api/notifications", require("./src/routes/notificationRoutes"));
app.use("/api/audit-logs", require("./src/routes/auditRoutes"));
app.use("/api/auth", require("./src/routes/authRoutes"));
app.use("/api/workflows", require("./src/routes/workflowRoutes"));
app.use("/api/tasks", require("./src/routes/taskRoutes"));

// ✅ Swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));


// ✅ Cron jobs
require("./src/utils/cronJobs");


// ✅ test route
app.get("/", (req, res) => {
  res.send("CRM Backend Running...");
});


// ✅ error middleware
app.use(errorHandler);



// ✅ CREATE HTTP SERVER
const server = http.createServer(app);


// ✅ SOCKET.IO FOR REALTIME NOTIFICATIONS
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    credentials: true
  }
});


// make io global
global.io = io;


// socket connection
io.on("connection", (socket) => {

  console.log("User connected:", socket.id);

  socket.on("join", (userId) => {

    socket.join(userId);

    console.log("User joined room:", userId);

  });

  socket.on("disconnect", () => {

    console.log("User disconnected");

  });

});



// ✅ START SERVER AFTER DB CONNECT
const PORT = process.env.PORT || 5000;

connectDB().then(() => {

  server.listen(PORT, () => {

    console.log(`🚀 Server running on port ${PORT}`);

  });

});