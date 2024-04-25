'use strict';
const { createLogger, format, transports } = require('winston');
const { combine, timestamp,printf } = format;

require('winston-daily-rotate-file');
//let   jsonconfig =  require('../Smart_config.json')

let logConfig = require('../UNFYD-BOT-SmartReport/loggerConfig.json')
// const Datetime = new Date().toLocaleDateString()
const AppName = "SmartreportAPI"
const filepath = `${logConfig.filePathDirctory}/${AppName}`


// const loggerFunction = (level, message,processid) => {

    // const log = logger(`${processid}/${level}`,level);

    // if (level === 'info' && logConfig.infoDisable === false) {
        // log.info(message)
    // } else if (level === 'error' && logConfig.errorDisable === false) {
        // log.error(message)
    // } else if (level === 'debug' && logConfig.debugDisable === false) {
        // log.debug(message)
    // }
// }
const loggerFunction = (level, message, processid) => {

if (level === 'info' && logConfig.infoDisable === false) {

const log1 = logger(`${processid}/${level}`, level);

log1.info(message)

log1.close()

log1.end();

} else if (level === 'error' && logConfig.errorDisable === false) {

const log2 = logger(`${processid}/${level}`, level);

log2.error(message)

log2.close()

log2.end();

} else if (level === 'debug' && logConfig.debugDisable === false) {

const log3 = logger(`${processid}/${level}`, level);

log3.debug(message)

log3.close()

log3.end();

}

}

const dailyRotateFileTransportinfo = (filename,level) =>
 new transports.DailyRotateFile({
    level: "debug",
    filename: `${filepath}/%DATE%/${filename}/${level}.log`,
    maxSize: logConfig.maxsize,
    maxDays: logConfig.maxdays,
    zippedArchive: logConfig.zippedArchive,
    datePattern: logConfig.datePattern,
    json: true

});

const logger = function (filename,level) {
    try {
    return createLogger({
        // change level if in dev environment versus production
        level: logConfig.logLevel,
        silent: logConfig.logDisable,
        maxsize: logConfig.maxsize,
        
        format: combine(
            timestamp({
                format: logConfig.logDateTimeFormat,
                tz: logConfig.timeZone
            }),
            // for the log file
            printf(info => `${info.timestamp} : | ${info.level} | ${info.message} |`)
        ),
        
        transports: [
            // dailyRotateFileTransportdebug(filename),
            
            dailyRotateFileTransportinfo(filename,level)
            // dailyRotateFileTransporterror(filename)
        ]
    });

    }catch(err){
        console.log("err",err)
    }
}

module.exports = loggerFunction // is now a function