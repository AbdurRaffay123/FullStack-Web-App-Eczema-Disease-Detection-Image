const reminderService = require('../services/reminder.service');

/**
 * Reminder Scheduler Job
 * Checks for due reminders and creates notifications
 * Should be run periodically (e.g., every minute)
 */
const checkDueReminders = async () => {
  try {
    console.log(`[${new Date().toISOString()}] Checking for due reminders...`);

    // Get all reminders that are due
    const dueReminders = await reminderService.getDueReminders();

    if (dueReminders.length === 0) {
      console.log('No due reminders found.');
      return;
    }

    console.log(`Found ${dueReminders.length} due reminder(s).`);

    // Process each due reminder
    for (const reminder of dueReminders) {
      try {
        // Create notification for this reminder
        await reminderService.createNotification(reminder);

        // Update next trigger time
        await reminderService.updateNextTriggerTime(reminder._id);

        console.log(`Processed reminder: ${reminder.title} (ID: ${reminder._id})`);
      } catch (error) {
        console.error(`Error processing reminder ${reminder._id}:`, error.message);
        // Continue with next reminder even if one fails
      }
    }

    console.log(`Completed processing ${dueReminders.length} reminder(s).`);
  } catch (error) {
    console.error('Error in reminder scheduler job:', error);
  }
};

/**
 * Start Reminder Scheduler
 * Runs the check every minute (60000ms)
 */
let schedulerInterval = null;

const startScheduler = () => {
  if (schedulerInterval) {
    console.log('Reminder scheduler is already running.');
    return;
  }

  console.log('Starting reminder scheduler (checking every 60 seconds)...');
  
  // Run immediately on start
  checkDueReminders();

  // Then run every 60 seconds
  schedulerInterval = setInterval(() => {
    checkDueReminders();
  }, 60000); // 60 seconds

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





