const express = require('express');
var axios = require('axios');
const app = express()
var bodyParser = require('body-parser');
const masterfunction = require('./controller/master_controller')
app.use(bodyParser.json());
var cors = require('cors');
//var dbconfig = require('./Classes/dbConnection');
//const connectdb = require('./controller/master_controller')
const port = 3001
app.use(cors())
app.use(cors())

app.post('/', async (req, res) => {
    console.log('hello')
})
app.listen(port, async () => {
    //schedular()
    // tokendata = myCache.get('tokenresponse')
    // if (tokendata == undefined) {
    //     let tokenresponse = await tokenfunction.TOKENAPI()
    //     myCache.set('tokenresponse', tokenresponse.access_token)
    // }
    console.log(`app listening at http://localhost:${port}`)
})
module.exports = app