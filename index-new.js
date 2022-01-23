const express = require ('express');
const imageRoutes = require('./routes/imageRoute');
const nftRoutes = require('./routes/nftRoute');
var bodyParser = require('body-parser')
const app = express();
const { response } = require('express');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

app.use('/image', imageRoutes);
app.use('/nft', nftRoutes);



const listener = app.listen(process.env.PORT || 3001, () => {
    console.log('Your app is listening on port ' + listener.address().port)
})