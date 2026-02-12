const cron = require("node-cron");
const Lead = require("../models/Lead");
const Notification = require("../models/Notification");

cron.schedule("* * * * *", async () => {
  console.log("🔄 Running Lead Reminder Job...");

  try {
    // Calculate 3 days ago
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    console.log("threeDaysAgo:", threeDaysAgo);

    // Find only leads that:
    // - Status is New
    // - Older than 3 days
    // - Not deleted
    // - Reminder not already sent
    const oldLeads = await Lead.find({
      status: "New",
      createdAt: { $lte: threeDaysAgo },
      isDeleted: false,
      reminderSent: false
    });

    console.log("Found old leads:", oldLeads.length);

    for (const lead of oldLeads) {

      if (lead.assignedTo) {
        console.log("Creating reminder for:", lead.name);

        // Create notification
        await Notification.create({
          userId: lead.assignedTo,
          title: "Follow-up Reminder",
          message: `Lead "${lead.name}" needs follow-up.`,
          type: "lead"
        });

        // Mark reminder as sent (prevents duplicates)
        lead.reminderSent = true;
        await lead.save();
      }
    }

  } catch (error) {
    console.error("CRON JOB ERROR:", error);
  }
});
