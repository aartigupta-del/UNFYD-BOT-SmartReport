var socketClient = require('socket.io-client')
let socket = socketClient.connect('http://localhost:4002');
const dayjs = require('dayjs');
var current = new Date();
const fs = require("fs");
var loggerFunction = require('../loggerfunction');
var mssql = require('mssql');
const { Table,
  VarChar,
  DateTime } = require('mssql')
const e = require('express');
const moment = require('moment');
let jsonconfig = require('../Smart_config.json')

var cron = require('node-cron');

// function myFunction() {
//     timeout = setTimeout( DatainsertionforFirsttable, 3000);
//   }


var connectionstringAuditor = {
  user: jsonconfig.db0.MSSQL_USER,
  password: jsonconfig.db0.MSSQL_PASS,
  database: jsonconfig.db0.MSSQL_DBNAME,
  server: jsonconfig.db0.MSSQL_HOST,
  dialect: "mssql",
  requestTimeout: 200000,
  dialectOptions: {
    "instanceName": "Hp"
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  },
  options: {
    encrypt: false, // for azure
    trustServerCertificate: true // change to true for local dev / self-signed certs
  }
};

let connectionstring_BOT = {
  user: jsonconfig.db1.MSSQL_USER,
  password: jsonconfig.db1.MSSQL_PASS,
  database: jsonconfig.db1.MSSQL_DBNAME,
  server: jsonconfig.db1.MSSQL_HOST,
  port: jsonconfig.db1.MSSQL_PORT,
  dialect: "mssql",
  requestTimeout: 200000,
  dialectOptions: {
    "instanceName": "Hp"
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  },
  options: {
    encrypt: false, // for azure
    trustServerCertificate: true // change to true for local dev / self-signed certs
  }
};
async function connectDB() {

  console.log(jsonconfig)
  return new Promise((resolve, reject) => {
    try {
      mssql.connect(connectionstring_BOT, function (error, response) {
        if (error) {
          //console.log("error",error);
          loggerFunction("error", `Error while connecting in BOT database:`, error, 0)
          return reject("Error while connecting to database" + error, "error");
        } else {
          //  console.log("MSSQLConnection established successfully");
          loggerFunction("info", `MSSQLConnection established successfully:`, 0)
          return resolve();
        }

      })
      mssql.connect(connectionstringAuditor, function (error, response) {
        if (error) {
          // console.log("error",error);
          loggerFunction("error", `Error while connecting in Auditor_db  database:`, error, 0)
          return reject("Error while connecting in Auditor_db_name database" + error, "error");
        } else {
          //console.log("MSSQLConnection established successfully");
          loggerFunction("info", `MSSQLConnection established successfully:`, 0)


           var task = cron.schedule(jsonconfig.timing, () =>  {
          //loggerFunction("info",`Scheduled time :`,jsonconfig.timing,0)
          datavalidation();
           });

          task.start();

          //DatainsertionforSecondtable
          return resolve();
        }

      })
    } catch (e) {
      console.log("Error while connecting to database " + e.toString(), "error")
    }
  })
}
connectDB() 

var minutes1=15;
let fromdate = getDateTimeBefore(minutes1);
console.log("15 minutes before:", fromdate);
console.log(fromdate); 
  loggerFunction("info", `fromdate: ${JSON.stringify(fromdate)} `, 0)


const datavalidation = async () => {

  fromdate = getDateTimeBefore(minutes1);
console.log("15 minutes before:", fromdate);
console.log(fromdate); 
  loggerFunction("info", `fromdate: ${JSON.stringify(fromdate)} `, 0)
  loggerFunction("info", `inside datavalidation: ${JSON.stringify(fromdate)} `, 0)
  await mssql.connect(connectionstring_BOT);
  const table3Query = `SELECT [APIName],[EventName],[REQUEST],[RESPONSE],[REP_STATUS],[TrackingID],[CREATEDDATE],[RESPONSE_ON] from  ${(jsonconfig.Destination_db_name)}.[dbo].[UNFYD_API_REQUEST_RESPONSE_Report]  where cast(CREATEDDATE as datetime) between '${fromdate}' and getdate() ;`
 
 const result = await mssql.query(table3Query);
  const dataFromTable5 = result.recordset;
 loggerFunction("info", `data from destinationtable : ${JSON.stringify(dataFromTable5)} `, 0)
 console.log(result);
 if(result.recordset.length===0 )
 {
  DatainsertionforFirsttable();
 }
  //return result;
}

const DatainsertionforFirsttable = async () => {
  
  loggerFunction("info", `Report Start time: ${JSON.stringify(fromdate)} `, 0)
  try {
    await mssql.connect(connectionstring_BOT);
    const table1Query = `SELECT [SERVICE_NAME],[REQUEST],[RESPONSE],[REP_STATUS],[SESSION_ID],[CREATED_DATE],[RESPONSE_ON]  FROM ${(jsonconfig.BOT_db_name)}.[dbo].[UNFYD_BOT_SERVICE_REQUEST_RESPONSE]  where cast(CREATED_DATE as datetime) between '${fromdate}' and  getdate();`
    const result = await mssql.query(table1Query);
loggerFunction("info", `select query  for botdatabase : ${JSON.stringify(table1Query)} `, 0)
    const dataFromTable = result.recordset;
    loggerFunction("info", `dataFrom BOT table: ${JSON.stringify(dataFromTable)} `, 0)

    const combinedData = [];
    if (dataFromTable.length > 0) {
      for (let i = 0; i < dataFromTable.length; i++) {
        const dateObject = dataFromTable[i].CREATED_DATE;

        var Createdon = moment(dataFromTable[i].CREATED_DATE).utcOffset("+05:30").format('YYYY-MM-DD HH:mm:ss');

        var Responseon = moment(dataFromTable[i].RESPONSE_ON).utcOffset("+05:30").format('YYYY-MM-DD HH:mm:ss');


        combinedData.push([
          dataFromTable[i].SERVICE_NAME,
          dataFromTable[i].REQUEST,
          dataFromTable[i].RESPONSE,
          dataFromTable[i].REP_STATUS,
          dataFromTable[i].SESSION_ID,
          Createdon,
          Responseon,

        ]);
      }
      const table = new Table(`${(jsonconfig.Destination_db_name)}.[dbo].[UNFYD_API_REQUEST_RESPONSE_Report]`);
      table.create = false;
    
     
      table.columns.add('ApiName', VarChar(mssql.MAX), { nullable: true });
      table.columns.add('REQUEST', VarChar(mssql.MAX), { nullable: true });
      table.columns.add('RESPONSE', VarChar(mssql.MAX), { nullable: true });
      table.columns.add('REP_STATUS', VarChar(mssql.MAX), { nullable: true });
      table.columns.add('TrackingID', VarChar(mssql.MAX), { nullable: true });
      table.columns.add('CREATEDDATE', DateTime, { nullable: true });
      table.columns.add('RESPONSE_ON', DateTime, { nullable: true });
      combinedData.forEach(row => table.rows.add.apply(table.rows, row));
      console.log('hello');
      let pool = await mssql.connect(connectionstring_BOT)
      const request = await pool.request();
      const results = await request.bulk(table);
      console.log(`rows affected ${results}`);
      await mssql.close();
      loggerFunction("info", `Data inserted successfully for date: ${JSON.stringify(fromdate)} `, 0)
    }
    loggerFunction("info", `Data Not Found IN Bot => [UNFYD_BOT_SERVICE_REQUEST_RESPONSE] for date: ${JSON.stringify(fromdate)} `, 0)
  }
  catch (e) {
    console.error('Error inserting data:', e);
    let data = {
      "error": e.message || e,
    
    }
    loggerFunction("error", `DatainsertionforFirsttable Error:${JSON.stringify(data)}`, 0)

  }
  finally {
    await mssql.close();
  }

  DatainsertionforSecondtable();
}
const DatainsertionforSecondtable = async () => {
  

  console.log(fromdate);
  try {
    await mssql.connect(connectionstringAuditor);
    const table2Query =`SELECT [EventName],[REQUEST],[RESPONSE],[REP_STATUS],[TrackingID],[CREATEDDATE],[RESPONSE_ON],[ApiName] FROM ${(jsonconfig.Auditor_db_name)}.[dbo].[UNFYD_API_REQUEST_RESPONSE] where cast(CREATEDDATE as datetime) between '${fromdate}' and getdate();`
loggerFunction("info", `select query  for Auditordatabasedatabase : ${JSON.stringify(table2Query)} `, 0)
   
 const result = await mssql.query(table2Query);
    const dataFromTable = result.recordset;
    console.log(dataFromTable,"dataFromTable")
    loggerFunction("info", `data From Auditor portel: ${JSON.stringify(dataFromTable)} `, 0)
    const combinedData = [];
    if (dataFromTable.length > 0) {
      for (let i = 0; i < dataFromTable.length; i++) {



        var Createdon = moment(dataFromTable[i].CREATEDDATE).zone(0).format('YYYY-MM-DD HH:mm:ss');
        var Responseon = moment(dataFromTable[i].RESPONSE_ON).zone(0).format('YYYY-MM-DD HH:mm:ss');
        combinedData.push([
           dataFromTable[i].ApiName,
           dataFromTable[i].EventName,
           dataFromTable[i].REQUEST,
           dataFromTable[i].RESPONSE,
           dataFromTable[i].REP_STATUS,
           dataFromTable[i].TrackingID,
           Createdon,
           Responseon,

        ]);
      }
      await mssql.close();
      const table = new Table(`${(jsonconfig.Destination_db_name)}.[dbo].[UNFYD_API_REQUEST_RESPONSE_Report]`);
      table.create = false;
     
      table.columns.add('ApiName', VarChar(mssql.MAX), { nullable: true });
      table.columns.add('EventName', VarChar(mssql.MAX), { nullable: true });
      table.columns.add('REQUEST', VarChar(mssql.MAX), { nullable: true });
      table.columns.add('RESPONSE', VarChar(mssql.MAX), { nullable: true });
      table.columns.add('REP_STATUS', VarChar(mssql.MAX), { nullable: true });
      table.columns.add('TrackingID', VarChar(mssql.MAX), { nullable: true });
      table.columns.add('CREATEDDATE', DateTime, { nullable: true });
      table.columns.add('RESPONSE_ON', DateTime, { nullable: true });
      combinedData.forEach(row => table.rows.add.apply(table.rows, row));
      console.log('hello');
      let pool = await mssql.connect(connectionstring_BOT)
      const request = await pool.request();
      const results = await request.bulk(table);
      console.log(`rows affected ${results}`);
      await mssql.close();
      loggerFunction("info", `Data inserted successfully for date: ${JSON.stringify(fromdate)} `, 0)
    }
    
    loggerFunction("info", `Data Not Found IN Bot=> [UNFYD_BOT_SERVICE_REQUEST_RESPONSE] for date: ${JSON.stringify(fromdate)} `, 0)
  } catch (e) {
    
    let data = {
      "error": e.message || e,
      "req": JSON.stringify("request")
    }
    loggerFunction("error", `DatainsertionforSecondtable Error:${JSON.stringify(data)}`, 0)
  } finally {
    await mssql.close();
  }
}
function getCurrentDateTime() {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');

  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  const milliseconds = String(now.getMilliseconds()).padStart(3, '0');

  const formattedDateTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}`;
  return formattedDateTime;
}

function getDateTimeBefore(minutes1) {
  const now = new Date();
  const beforeTime = new Date(now - minutes1 * 60 * 1000);

  const year = beforeTime.getFullYear();
  const month = String(beforeTime.getMonth() + 1).padStart(2, '0');
  const day = String(beforeTime.getDate()).padStart(2, '0');

  const hours = String(beforeTime.getHours()).padStart(2, '0');
  const minutes3 = String(beforeTime.getMinutes()).padStart(2, '0');
  const seconds = String(beforeTime.getSeconds()).padStart(2, '0');
  const milliseconds = String(beforeTime.getMilliseconds()).padStart(3, '0');

  const formattedBeforeTime = `${year}-${month}-${day} ${hours}:${minutes3}:${seconds}.${milliseconds}`;
  return formattedBeforeTime;
}

//});
module.exports = { DatainsertionforFirsttable, DatainsertionforSecondtable }