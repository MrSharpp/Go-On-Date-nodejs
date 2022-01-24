const express = require ('express');
const imageRoutes = require('./routes/imageRoute');
const nftRoutes = require('./routes/nftRoute');
var bodyParser = require('body-parser')
const https = require('https');
const fs = require('fs');
const app = express();
const { response } = require('express');
var options = {
  key: fs.readFileSync('./certs/server-key.pem'),
  cert: fs.readFileSync('./certs/server-cert.pem'),
};

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

app.use('/image', imageRoutes);
app.use('/nft', nftRoutes);


var server = https.createServer(options, app).listen(port, function(){
  console.log("Express server listening on port " + port);
});

//  const listener = app.listen(process.env.PORT || 3000,"0.0.0.0" ,() => {
//     console.log('Your app is listening on port ' + listener.address().port)
//    })