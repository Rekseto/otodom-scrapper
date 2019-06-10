const cron = require("node-cron");
const uuidv1 = require("uuid/v1");
class CronManager {
  constructor() {
    this.tasks = [];
  }

  registerNewTask(time, callback, id = uuidv1()) {
    const task = cron.schedule(time, callback);

    this.tasks.push({
      id,
      task
    });
  }
}

module.exports = CronManager;
