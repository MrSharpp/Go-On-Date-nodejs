const express = require('express')
const app = express()
const path = require('path')
const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const { exec } = require("child_process");

const port = 3001

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.get('/', (req, res) => {
  pinFileToIPFS('c7bee0222dd6892c174e', '9da16af9414e1936cf38f5907d5b7162e2624c95f639866eb0b385920d3bc9fe').then((result)=>{
    console.log(result);
    var ipfsHashOfUploadedFile = result.data.IpfsHash;
    console.log("ips Hash of uploaded file:"+ipfsHashOfUploadedFile);
    pinJSONToIPFS('c7bee0222dd6892c174e', '9da16af9414e1936cf38f5907d5b7162e2624c95f639866eb0b385920d3bc9fe', createNFTMetaDataJson(ipfsHashOfUploadedFile, "New NFT", " ", "100", "2011", "January", "01", "Monday")).then((result)=>{
      console.log(result.data);
      res.send("result");
    });
  });
  
});

app.get("/mint", (req, res)=>{
  exec('ts-node "C:\\Users\\Amir Alam\\metaplex\\js\\packages\\cli\\src\\cli-nft.ts" mint -e devnet -k ./devnet.json -u https://gateway.pinata.cloud/ipfs/Qmbb7khUDN5xnE15JZtomCB2Jnoz6DwAso4TZ3J5NxboTi', (error, stdout, stderr) => {
    if (error) {
        console.log(`error: ${error.message}`);
        return;
    }
    if (stderr) {
        console.log(`stderr: ${stderr}`);
        return;
    }
    console.log(`stdout: ${stdout}`);
});
});


app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})


async function mint(){
  const solConnection = new web3.Connection(getCluster('devnet'));
  const walletKeyPair = loadWalletKey('./devnet.json');
  await mintNFT(solConnection, walletKeyPair, "https://gateway.pinata.cloud/ipfs/Qmbb7khUDN5xnE15JZtomCB2Jnoz6DwAso4TZ3J5NxboTi");
}

 const pinJSONToIPFS = (pinataApiKey, pinataSecretApiKey, JSONBody) => {
  const url = `https://api.pinata.cloud/pinning/pinJSONToIPFS`;
  return axios
      .post(url, JSONBody, {
          headers: {
              pinata_api_key: pinataApiKey,
              pinata_secret_api_key: pinataSecretApiKey
          }
      })
      .then(function (response) {
          return response;
      })
      .catch(function (error) {
          return error;
      });
};


const pinFileToIPFS = (pinataApiKey, pinataSecretApiKey) => {
  const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;

  //we gather a local file for this example, but any valid readStream source will work here.
  let data = new FormData();
  data.append('file', fs.createReadStream('./8.png'));

 

 var abc = axios.post(url, data, {
          maxBodyLength: 'Infinity', //this is needed to prevent axios from erroring out with large files
          headers: {
              'Content-Type': `multipart/form-data; boundary=${data._boundary}`,
              pinata_api_key: pinataApiKey,
              pinata_secret_api_key: pinataSecretApiKey
          }
      })
      .then(function (response) {
        return  response;
      })
      .catch(function (error) {
        return error;
      });
     return abc;
};



function createNFTMetaDataJson(i, name, description, royality, year, month, date, day){
  var nftJson = `{
    "name": "`+name+`",
    "symbol": "GOD",
    "description": " ",
    "seller_fee_basis_points": "`+royality+`",
    "image": "https://gateway.pinata.cloud/ipfs/`+i+`",
    "attributes": [
        {"trait_type": "Year", "value": "`+year+`"},
        {"trait_type": "Month", "value": "`+month+`"}, 
        {"trait_type": "Date", "value": "`+date+`"},
        {"trait_type": "Day", "value": "`+day+`"}
    ],
    "properties": {
        "creators": [{"address": "ESSsrmKFXW74pSFhCunuRBvCx9JcpSDmA63umn14CmJd", "share": 100}],
        "files": [{"uri": "https://gateway.pinata.cloud/ipfs/`+i+`", "type": "image/png"}]
    },
    "collection": {"name": "Go On Date", "family": "Go On Date"}
}
  `;
  return JSON.parse(nftJson);
}