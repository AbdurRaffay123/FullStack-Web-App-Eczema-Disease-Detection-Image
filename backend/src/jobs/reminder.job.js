const reminderService = require('../services/reminder.service');

/**
 * Reminder Scheduler Job
 * Checks for due reminders and creates notifications
 * Should be run periodically (e.g., every minute)
 */
const checkDueReminders = async () => {
  try {
    const now = new Date();
    // Only log every 30 seconds to reduce console spam, but check every 10 seconds
    const shouldLog = now.getSeconds() % 30 === 0;
    
    if (shouldLog) {
      console.log(`[${now.toISOString()}] Checking for due reminders...`);
    }

    // Get all reminders that are due
    const dueReminders = await reminderService.getDueReminders();

    if (dueReminders.length === 0) {
      if (shouldLog) {
        console.log('No due reminders found.');
      }
      return;
    }

    console.log(`🔔 Found ${dueReminders.length} due reminder(s) at ${now.toLocaleTimeString()}`);

    // Process each due reminder
    for (const reminder of dueReminders) {
      try {
        // Check if notification already exists for this reminder at this trigger time
        // This prevents duplicate notifications if scheduler runs multiple times
        const Notification = require('../models/Notification');
        const existingNotification = await Notification.findOne({
          reminder: reminder._id,
          triggeredAt: {
            $gte: new Date(now.getTime() - 10000), // Within last 10 seconds
            $lte: now
          }
        });

        if (existingNotification) {
          if (shouldLog) {
            console.log(`Notification already exists for reminder: ${reminder.title}`);
          }
          // Still update trigger time even if notification exists
          await reminderService.updateNextTriggerTime(reminder._id);
          continue;
        }

        // Create notification for this reminder
        await reminderService.createNotification(reminder);

        // Update next trigger time
        await reminderService.updateNextTriggerTime(reminder._id);

        console.log(`✅ Notification created for reminder: "${reminder.title}" at ${now.toLocaleTimeString()}`);
      } catch (error) {
        console.error(`❌ Error processing reminder ${reminder._id}:`, error.message);
        // Continue with next reminder even if one fails
      }
    }

    if (shouldLog && dueReminders.length > 0) {
      console.log(`Completed processing ${dueReminders.length} reminder(s).`);
    }
  } catch (error) {
    console.error('Error in reminder scheduler job:', error);
  }
};

/**
 * Start Reminder Scheduler
 * Runs the check every 10 seconds for near real-time notifications
 */
let schedulerInterval = null;

const startScheduler = () => {
  if (schedulerInterval) {
    console.log('Reminder scheduler is already running.');
    return;
  }

  console.log('Starting reminder scheduler (checking every 10 seconds for real-time notifications)...');
  
  // Run immediately on start
  checkDueReminders();

  // Then run every 10 seconds for near real-time detection
  schedulerInterval = setInterval(() => {
    checkDueReminders();
  }, 10000); // 10 seconds for faster detection

  console.log('Reminder scheduler started successfully.');
};

/**
 * Stop Reminder Scheduler
 */
const stopScheduler = () => {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
    schedulerInterval = null;
    console.log('Reminder scheduler stopped.');
  }
};

module.exports = {
  checkDueReminders,
  startScheduler,
  stopScheduler,
};





