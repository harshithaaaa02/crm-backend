const Lead = require("../models/Lead");
const Client = require("../models/Client");

// Dashboard Stats
exports.getDashboardStats = async (req, res) => {
  try {
    // Total Leads
    const totalLeads = await Lead.countDocuments({ isDeleted: false });

    // Total Clients
    const totalClients = await Client.countDocuments({ isDeleted: false });

    // Revenue Summary
    const revenueData = await Client.aggregate([
      { $match: { isDeleted: false } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$revenue" },
          avgRevenue: { $avg: "$revenue" },
        },
      },
    ]);

    const totalRevenue = revenueData[0]?.totalRevenue || 0;
    const avgRevenue = revenueData[0]?.avgRevenue || 0;

    // Conversion Rate
    const conversionRate =
      totalLeads > 0
        ? ((totalClients / totalLeads) * 100).toFixed(2)
        : 0;

    res.status(200).json({
      totalLeads,
      totalClients,
      totalRevenue,
      avgRevenue,
      conversionRate: `${conversionRate}%`,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching dashboard stats",
      error: error.message,
    });
  }
};
