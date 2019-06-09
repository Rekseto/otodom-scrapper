const winston = require("winston");
const {createLogger, format, transports} = winston;
const {combine, timestamp, label, printf, colorize} = format;

const levels = {
  info: 0, // harmless actions
  notify: 1, // potential dangerous actions
  error: 2, // erros
  critical: 3 // criticals
};

const colors = {
  info: "blue",
  notify: "yellow",
  error: "red",
  critical: "bold red"
};

const loggerFormat = printf(({level, message, label, timestamp}) => {
  return `${timestamp} [${level.toUpperCase()}]: ${message}`;
});

function setupLogger(projectName) {
  const errorLogsPath = `/var/${projectName}/logs/errors.log`;
  const notifyLogsPath = `/var/${projectName}/logs/notify.log`;

  const logger = createLogger({
    level: "debug",
    format: format.combine(
      format(info => {
        info.level = info.level.toUpperCase();
        return info;
      })(),
      format.colorize(),
      format.timestamp({
        format: "YYYY-MM-DD HH:mm:ss"
      }),
      printf(({level, message, label, timestamp}) => {
        return `${timestamp} [${level}]: ${message}`;
      })
    ),
    transports: [
      new transports.Console({}),
      new transports.File({
        filename: notifyLogsPath,
        level: "warn"
      }),
      new transports.File({
        filename: errorLogsPath,
        level: "error"
      })
    ]
  });

  winston.addColors(colors);

  return logger;
}

module.exports = {setupLogger};
