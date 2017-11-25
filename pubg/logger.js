var winston = require('winston')

var myFormat = winston.format.printf(info => {
  return `${info.timestamp} [${info.label}] ${info.level}: ${info.message}`
})

module.exports = function (labelName) {
  return winston.createLogger({
    format: winston.format.combine(
      winston.format.label({ label: labelName }),
      winston.format.timestamp(),
      myFormat
    ),
    transports: [new winston.transports.Console()]
  })
}
