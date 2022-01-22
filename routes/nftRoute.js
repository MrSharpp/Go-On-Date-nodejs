const express = require('express');
const router  = express.Router(); 
const nftController = require('../controllers/nft'); 
const axios = require('axios');


router.post('/mint', nftController.mintImage); 
router.post('/getNftAddress', nftController.getNftAddress); 
router.post('/transferNFT', nftController.transferNFT); 
router.post('/buy', (req, res) => {
    if(!req.body.Date) return res.status(404).send({"message":"Send Date Bro"});

    try{
        uploadImage(req.body.Date).then(() => {
          return res.send("DONE");
      });
    }catch(error){
      res.send("EROR");
    }
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

  console.log(responseMintNft.data);

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

module.exports = router;