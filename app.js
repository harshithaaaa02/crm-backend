const express = require("express");
const authRoutes = require('./src/routes/authRoutes');
const leadRoutes = require('./src/routes/leadRoutes');
const clientRoutes = require('./src/routes/clientRoutes');
const interactionRoutes = require('./src/routes/interactionRoutes'); // <--- New Import

const app = express();

app.use(express.json());

// Mount the Routes
app.use('/api/auth', authRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/interactions', interactionRoutes); // <--- New Route Activated

app.get("/", (req, res) => {
  res.send("CRM Backend Running");
});

module.exports = app;