const Lead = require("../models/Lead");
const Client = require("../models/Client");

// Dashboard Stats
const getDashboardStats = async (req, res) => {
  try {
    const totalLeads = await Lead.countDocuments({ isDeleted: false });
    const totalClients = await Client.countDocuments({ isDeleted: false });

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

// Monthly Report
const getMonthlyReport = async (req, res) => {
  try {
    const selectedYear = parseInt(req.query.year) || new Date().getFullYear();

    const monthlyData = await Client.aggregate([
      {
        $match: {
          isDeleted: false,
          createdAt: {
           $gte: new Date(selectedYear, 0, 1),
           $lt: new Date(selectedYear + 1, 0, 1)

          }
        }
      },
      {
        $group: {
          _id: { $month: "$createdAt" },
          totalRevenue: { $sum: "$revenue" },
          totalClients: { $sum: 1 }
        }
      }
    ]);

    const monthNames = [
      "", "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    // Create full 12 month structure
    const fullYearData = [];

    for (let i = 1; i <= 12; i++) {
      const monthData = monthlyData.find(m => m._id === i);

      fullYearData.push({
        month: monthNames[i],
        totalRevenue: monthData ? monthData.totalRevenue : 0,
        totalClients: monthData ? monthData.totalClients : 0
      });
    }

    res.json({
      year: selectedYear,
      data: fullYearData
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Yearly Report
const getYearlyReport = async (req, res) => {
  try {
    const yearlyData = await Client.aggregate([
      { $match: { isDeleted: false } },
      {
        $group: {
          _id: { $year: "$createdAt" },
          totalRevenue: { $sum: "$revenue" },
          totalClients: { $sum: 1 },
        },
      },
      { $sort: { "_id": 1 } },
    ]);

    res.json(yearlyData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// csv export
const { Parser } = require("json2csv");

const exportClientsReport = async (req, res) => {
  try {
    const clients = await Client.find({ isDeleted: false })
      .select("name email revenue createdAt");

    const parser = new Parser();
    const csv = parser.parse(clients);

    res.header("Content-Type", "text/csv");
    res.attachment("clients-report.csv");
    res.send(csv);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDashboardStats,
  getMonthlyReport,
  getYearlyReport,
  exportClientsReport
};
