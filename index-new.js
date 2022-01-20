const express = require ('express');
const imageRoutes = require('./routes/imageRoute');
const nftRoutes = require('./routes/nftRoute');
var bodyParser = require('body-parser')
const app = express();
const axios = require('axios');
const { response } = require('express');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

app.use('/image', imageRoutes);
app.use('/nft', nftRoutes);
app.use('/buy', (req, res) => {
  if(!req.body.Date) return res.status(403).send({"message":"Send Date Bro"});
  uploadImage(req.body.Date).then(() => {
    res.send("DONE");
  });
});

const dateAlphaList = {"Jan": "January", "Feb": "Febuary", "Mar": "March", "Apr": "April", "May": "May", "Jun":"June", "Jul": "July", "Aug":"August","Sep": "September", "Oct": "October", "Nov": "November", "Dec":"December"};


async function uploadImage(dateProvided){
  var dateChunk = dateProvided.split(" ");
  if(dateChunk.length < 3) return console.log("DATE NOT PROVIDED WELL");
  var monBeta = dateChunk.at(0);
  console.log(monBeta);
  if(!dateAlphaList.hasOwnProperty(monBeta)) return console.log("DATE NOT a WELL");
  var newDate = dateChunk.at(1) + " " + dateAlphaList[monBeta] + " " + dateChunk.at(2)
  console.log(newDate);

 var response = await axios({
    method: "post",
    url: "http://localhost:3000/image/generateImage",
    data: {
      "Date": dateProvided
    }
  }).catch((error) => console.log("ERROR WHILE CREATING FILE:"+error));
  var FileName = response.data.data;

  var responseIpfs = await axios({
    method: "post",
    url: "http://localhost:3000/image/uploadImage",
    data: {
      "Date": FileName
    }
  }).catch((error) => { 
    console.log("ERROR WHILE UPLOADING FILE:"+error);
  });
  var fileIpfsHash = responseIpfs.data.data

  var responseMetaData = await axios({
    method: "post",
    url: "http://localhost:3000/image/imageMetadeta",
    data: {
      "Date": dateProvided,
      "ipfsHash": fileIpfsHash
    }
  }).catch((error) => { 
    console.log("ERROR WHILE UPLOADING FILE:"+error);
  });
  var responseMetaDataLink = responseMetaData.data.ipfsHash;

  var responseMintNft = await axios({
    method: "post",
    url: "http://localhost:3000/nft/mint",
    data: {
      "ipfsHash": responseMetaDataLink
    }
  }).catch((error) => { 
    console.log("ERROR WHILE UPLOADING FILE:"+error.data);
  });

 /* var responseNFtAddress = await axios({
    method: "post",
    url: "http://localhost:3000/nft/getNftAddress",
    data: {
      "walletKey": "HPGZnjf2g1uprvTdMVusCSc3HGpc3jLguppi9QKxJ5tU",
      "DateAlpha": newDate
    }
  }).catch((error) => { 
    console.log("ERROR WHILE UPLOADING FILE:"+error.data);
  });

  console.log(responseNFtAddress.data.mintAddress); */
} 

const listener = app.listen(process.env.PORT || 3000, () => {
    console.log('Your app is listening on port ' + listener.address().port)
})