const express = require('express');
const router  = express.Router(); 
const nftController = require('../controllers/nft'); 
const axios = require('axios');
const { getParsedNftAccountsByOwner,isValidSolanaAddress, createConnectionConfig,} =  require("@nfteyez/sol-rayz");


const dateAlphaList = {"Jan": "January", "Feb": "February", "Mar": "March", "Apr": "April", "May": "May", "Jun":"June", "Jul": "July", "Aug":"August","Sep": "September", "Oct": "October", "Nov": "November", "Dec":"December"};

router.post('/mint', nftController.mintImage); 
router.post('/getNftAddress', nftController.getNftAddress); 
router.post('/transferNFT', nftController.transferNFT);
router.post('/mintedList', nftController.mintedList);  
router.post('/nftSold', nftController.soldNft);
router.post('/buy', async (req, res) => {
    if(!req.body.Date) return res.status(403).send({"message":"Send Date Bro"});
    try{
        var dateChunk = req.body.Date.split(" ");
        if(dateChunk.length < 3) return console.log("DATE NOT PROVIDED WELL");
        var monBeta = dateChunk.at(0);
        var newDate = dateChunk.at(1) + " " + dateAlphaList[monBeta] + " " + dateChunk.at(2)
        var ifMinted = await getAllNftData("HPGZnjf2g1uprvTdMVusCSc3HGpc3jLguppi9QKxJ5tU", newDate)
        if(!dateAlphaList.hasOwnProperty(monBeta)) return res.json({"response": "error", "data": "date not provided in good manner"});
        if(ifMinted != null) return res.json({"response": "success", "data": "minted"});

        uploadImage(req.body.Date).then(() => {
          return res.json({"response": "success", "data": "uploaded"});
      }).catch((error)=>{
        return res.json({"response": "error", "data": error});
      });
    }catch(error){
        console.log(error);
        return res.json({"response": "error", "data": "uploading error1"});
    }
  }); 



async function uploadImage(dateProvided){
try{


 var response = await axios({
    method: "post",
    url: "https://api.goondate.com:3001/image/generateImage",
    data: {
      "Date": dateProvided
    }
  }).catch((error) => console.log("ERROR WHILE CREATING FILE:"+error));
  var FileName = response.data.data;

  var responseIpfs = await axios({
    method: "post",
    url: "https://api.goondate.com:3001/image/uploadImage",
    data: {
      "Date": FileName
    }
  }).catch((error) => { 
    console.log("ERROR WHILE UPLOADING FILE:"+error);
  });
  var fileIpfsHash = responseIpfs.data.data

  var responseMetaData = await axios({
    method: "post",
    url: "https://api.goondate.com:3001/image/imageMetadeta",
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
    url: "https://api.goondate.com:3001/nft/mint",
    data: {
      "ipfsHash": responseMetaDataLink,
      "Date": dateProvided
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
}catch(error){
    return error;
}
} 


async function getAllNftData(walletKey,selectedNFTName){
    var selectedNFT = null;
    try {
        const connect =    createConnectionConfig("https://solana-mainnet.phantom.tech");
        let ownerToken = walletKey;
        const result = isValidSolanaAddress(ownerToken);
        const nfts = await getParsedNftAccountsByOwner({
          publicAddress: ownerToken,
          connection: connect,
          serialization: true,
        });
        nfts.forEach(element => {
            if(element.data.name == selectedNFTName) {
                selectedNFT = element;
                return true;
            }
        });
    } catch (error) {
      console.log(error);
    }
        return selectedNFT;
    
};

module.exports = router;