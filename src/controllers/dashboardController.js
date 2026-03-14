const Lead = require("../models/Lead");
const Client = require("../models/Client");
const Project = require("../models/Project");
const { Parser } = require("json2csv");

// ✅ Dashboard Stats
const getDashboardStats = async (req, res) => {
  try {
    const now = new Date();
    const currentYear = now.getFullYear();
    const monthStart = new Date(currentYear, now.getMonth(), 1);
    const nextMonthStart = new Date(currentYear, now.getMonth() + 1, 1);
    const yearStart = new Date(currentYear, 0, 1);
    const nextYearStart = new Date(currentYear + 1, 0, 1);

    const totalLeads = await Lead.countDocuments({ isDeleted: false });
    const totalClients = await Client.countDocuments({ isDeleted: false });

    // ✅ Revenue from actual paid project installments
    const allProjects = await Project.find({});

    let totalRevenue = 0;
    let monthlyRevenue = 0;
    let annualRevenue = 0;

    allProjects.forEach((project) => {
      project.installments?.forEach((inst) => {
        if (inst.paid) {
          const paidAt = inst.paidAt ? new Date(inst.paidAt) : null;

          totalRevenue += inst.amount || 0;

          if (paidAt) {
            if (paidAt >= monthStart && paidAt < nextMonthStart) {
              monthlyRevenue += inst.amount || 0;
            }
            if (paidAt >= yearStart && paidAt < nextYearStart) {
              annualRevenue += inst.amount || 0;
            }
          }
        }
      });
    });

    const conversionRate =
      totalLeads > 0 ? ((totalClients / totalLeads) * 100).toFixed(2) : 0;

    // Pipeline status counts
    const leadsCreated = await Lead.countDocuments({ isDeleted: false, status: "New" });
    const projectsStarted = await Lead.countDocuments({ isDeleted: false, status: { $in: ["Started", "Project Started"] } });
    const inProgress = await Lead.countDocuments({ isDeleted: false, status: { $in: ["In Progress", "Progress"] } });
    const deploying = await Lead.countDocuments({ isDeleted: false, status: { $in: ["Deploying", "Deployment"] } });
    const live = await Lead.countDocuments({ isDeleted: false, status: "Live" });

    // Market status
    let marketStatus = "Slow";
    if (monthlyRevenue > 0 && totalClients > 0) marketStatus = "Active";
    else if (totalLeads > 0 || totalClients > 0) marketStatus = "In Progress";

    res.status(200).json({
      totalLeads,
      totalClients,
      totalRevenue,
      avgRevenue: totalClients > 0 ? totalRevenue / totalClients : 0,
      conversionRate: `${conversionRate}%`,
      activeClients: totalClients,
      monthlyRevenue,
      annualRevenue,
      marketStatus,
      pipeline: { leadsCreated, projectsStarted, inProgress, deploying, live },
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching dashboard stats", error: error.message });
  }
};

// ✅ Monthly Report — from paid installments
const getMonthlyReport = async (req, res) => {
  try {
    const selectedYear = parseInt(req.query.year) || new Date().getFullYear();
    const allProjects = await Project.find({});

    const monthlyTotals = Array(12).fill(0);

    allProjects.forEach((project) => {
      project.installments?.forEach((inst) => {
        if (inst.paid && inst.paidAt) {
          const paidAt = new Date(inst.paidAt);
          if (paidAt.getFullYear() === selectedYear) {
            monthlyTotals[paidAt.getMonth()] += inst.amount || 0;
          }
        }
      });
    });

    const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

    const fullYearData = monthNames.map((month, i) => ({
      month,
      totalRevenue: monthlyTotals[i],
      totalClients: 0, // kept for compatibility
    }));

    res.json({ year: selectedYear, data: fullYearData });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Yearly Report — from paid installments
const getYearlyReport = async (req, res) => {
  try {
    const allProjects = await Project.find({});
    const yearMap = {};

    allProjects.forEach((project) => {
      project.installments?.forEach((inst) => {
        if (inst.paid && inst.paidAt) {
          const year = new Date(inst.paidAt).getFullYear();
          if (!yearMap[year]) yearMap[year] = { _id: year, totalRevenue: 0, totalClients: 0 };
          yearMap[year].totalRevenue += inst.amount || 0;
        }
      });
    });

    const yearlyData = Object.values(yearMap).sort((a, b) => a._id - b._id);
    res.json(yearlyData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ CSV Export
const exportClientsReport = async (req, res) => {
  try {
    const clients = await Client.find({ isDeleted: false }).select("name email revenue createdAt");
    const parser = new Parser();
    const csv = parser.parse(clients);
    res.header("Content-Type", "text/csv");
    res.attachment("clients-report.csv");
    res.send(csv);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getDashboardStats, getMonthlyReport, getYearlyReport, exportClientsReport };