const Lead = require("../models/Lead");
const Client = require("../models/Client");
const { Parser } = require("json2csv");

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

    // Current month + year revenue
    const now = new Date();
    const currentYear = now.getFullYear();
    const monthStart = new Date(currentYear, now.getMonth(), 1);
    const nextMonthStart = new Date(currentYear, now.getMonth() + 1, 1);
    const yearStart = new Date(currentYear, 0, 1);
    const nextYearStart = new Date(currentYear + 1, 0, 1);

    const monthlyRevenueData = await Client.aggregate([
      {
        $match: {
          isDeleted: false,
          createdAt: {
            $gte: monthStart,
            $lt: nextMonthStart,
          },
        },
      },
      {
        $group: {
          _id: null,
          monthlyRevenue: { $sum: "$revenue" },
        },
      },
    ]);

    const yearlyRevenueData = await Client.aggregate([
      {
        $match: {
          isDeleted: false,
          createdAt: {
            $gte: yearStart,
            $lt: nextYearStart,
          },
        },
      },
      {
        $group: {
          _id: null,
          annualRevenue: { $sum: "$revenue" },
        },
      },
    ]);

    const monthlyRevenue = monthlyRevenueData[0]?.monthlyRevenue || 0;
    const annualRevenue = yearlyRevenueData[0]?.annualRevenue || 0;

    // Pipeline status counts from Lead model
    const leadsCreated = await Lead.countDocuments({
      isDeleted: false,
      status: "New",
    });

    const projectsStarted = await Lead.countDocuments({
      isDeleted: false,
      status: { $in: ["Started", "Project Started"] },
    });

    const inProgress = await Lead.countDocuments({
      isDeleted: false,
      status: { $in: ["In Progress", "Progress"] },
    });

    const deploying = await Lead.countDocuments({
      isDeleted: false,
      status: { $in: ["Deploying", "Deployment"] },
    });

    const live = await Lead.countDocuments({
      isDeleted: false,
      status: "Live",
    });

    // Simple market status logic
    let marketStatus = "Slow";
    if (monthlyRevenue > 0 && totalClients > 0) {
      marketStatus = "Active";
    } else if (totalLeads > 0 || totalClients > 0) {
      marketStatus = "In Progress";
    }

    res.status(200).json({
      // existing fields (kept safe for old frontend)
      totalLeads,
      totalClients,
      totalRevenue,
      avgRevenue,
      conversionRate: `${conversionRate}%`,

      // new dashboard fields
      activeClients: totalClients,
      monthlyRevenue,
      annualRevenue,
      marketStatus,
      pipeline: {
        leadsCreated,
        projectsStarted,
        inProgress,
        deploying,
        live,
      },
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
            $lt: new Date(selectedYear + 1, 0, 1),
          },
        },
      },
      {
        $group: {
          _id: { $month: "$createdAt" },
          totalRevenue: { $sum: "$revenue" },
          totalClients: { $sum: 1 },
        },
      },
      { $sort: { "_id": 1 } },
    ]);

    const monthNames = [
      "",
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const fullYearData = [];

    for (let i = 1; i <= 12; i++) {
      const monthData = monthlyData.find((m) => m._id === i);

      fullYearData.push({
        month: monthNames[i],
        totalRevenue: monthData ? monthData.totalRevenue : 0,
        totalClients: monthData ? monthData.totalClients : 0,
      });
    }

    res.json({
      year: selectedYear,
      data: fullYearData,
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
      { $sort: { _id: 1 } },
    ]);

    res.json(yearlyData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// CSV Export
const exportClientsReport = async (req, res) => {
  try {
    const clients = await Client.find({ isDeleted: false }).select(
      "name email revenue createdAt"
    );

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
  exportClientsReport,
};