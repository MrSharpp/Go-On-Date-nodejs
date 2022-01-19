const express = require('express')
const app = express()
const path = require('path')
const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const { exec } = require("child_process");
const { SystemProgram , clusterApiUrl, Connection, PublicKey, Keypair, Transaction } = require('@solana/web3.js');
const splToken  = require('@solana/spl-token');
const res = require('express/lib/response');
const {Token, AccountLayout , TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID} = require('@solana/spl-token');
const bs58 = require("bs58");
const { json } = require('express/lib/response');
var bodyParser = require('body-parser')

const port = 3001



app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post('/generateImage', (req, res) => {
  if(req.body.Date != null)
  {
    res.send(req.body.Date);
  }else
  {
    res.send(JSON.parse({"ERROR": "Date Parameter Not Given"}));
  }
});


function pinFile(){
  pinFileToIPFS('c7bee0222dd6892c174e', '9da16af9414e1936cf38f5907d5b7162e2624c95f639866eb0b385920d3bc9fe').then((result)=>{
    console.log(result);
    var ipfsHashOfUploadedFile = result.data.IpfsHash;
    console.log("ips Hash of uploaded file:"+ipfsHashOfUploadedFile);
    pinJSONToIPFS('c7bee0222dd6892c174e', '9da16af9414e1936cf38f5907d5b7162e2624c95f639866eb0b385920d3bc9fe', createNFTMetaDataJson(ipfsHashOfUploadedFile, "New NFT", " ", "100", "2011", "January", "01", "Monday")).then((result)=>{
      console.log(result.data);
    });
  });
}

app.get("/mint", (req, res)=>{
  exec('ts-node "C:\\Users\\Amir Alam\\metaplex\\js\\packages\\cli\\src\\cli-nft.ts" mint -e devnet -k ./devnet.json -u https://gateway.pinata.cloud/ipfs/QmQ6QSHT3jF6XrB116THxu3ue3j8Wxj1eBJCHPFKSKrXsR', (error, stdout, stderr) => {
    if (error) {
        console.log(`error: ${error.message}`);
        return res.send(error.message);
       
    }
    if (stderr) {
        console.log(`stderr: ${stderr}`);
        
        return res.send(stderr);
    }
    return res.send(stdout);
});
});

app.get("/transct", (req, res)=>{
        sendNFT().then(()=>{
          res.send("sa");
        });
});


        async function sendNFT(sender, reciever){
  
                      const feePayer = Keypair.fromSecretKey(
                        bs58.decode("3DdVyZuANr5en2PQymCPmoFBMsfdhjaRHqnk3ejW16zc2YN2CWjyDTAfi6oYcQHuSa5UWFH9s1Nvme6UWprmJSjH")
                      );
                      
                      // G2FAbFQPFa5qKXCetoFZQEvF9BVvCKbvUZvodpVidnoY
                      const alice = Keypair.fromSecretKey(
                        bs58.decode("2YQDdnfxiHPKu9GypLX1yXaQTQojvDSPgFkDxrUrzbtchDsZh4B27aM8dfgrfm5DcTn8MJHenKLYRMuAbFeYsuRr")
                      );

                      const mintPubkey = new PublicKey("8oW47fQVEiFTjY49FyEHciYjgyqc8s9bQwkJToMP4Tvc");

                      // connection
                      const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

                      let ataAlice = await Token.getAssociatedTokenAddress(
                        ASSOCIATED_TOKEN_PROGRAM_ID,
                        TOKEN_PROGRAM_ID,
                        mintPubkey,
                        alice.publicKey
                      );

                      let tx2 = new Transaction().add(
                        Token.createAssociatedTokenAccountInstruction(
                          ASSOCIATED_TOKEN_PROGRAM_ID, // always ASSOCIATED_TOKEN_PROGRAM_ID
                          TOKEN_PROGRAM_ID, // always TOKEN_PROGRAM_ID
                          mintPubkey, // mint
                          ataAlice, // ata
                          alice.publicKey, // owner of token account
                          feePayer.publicKey // fee payer
                        )
                      );
                     console.log(`txhash: ${await connection.sendTransaction(tx2, [alice])}`);


                    let ataFeePayer = await Token.getAssociatedTokenAddress(
                      ASSOCIATED_TOKEN_PROGRAM_ID,
                      TOKEN_PROGRAM_ID,
                      mintPubkey,
                      feePayer.publicKey
                    );

                    let tx3 = new Transaction().add(
                      Token.createAssociatedTokenAccountInstruction(
                        ASSOCIATED_TOKEN_PROGRAM_ID, // always ASSOCIATED_TOKEN_PROGRAM_ID
                        TOKEN_PROGRAM_ID, // always TOKEN_PROGRAM_ID
                        mintPubkey, // mint
                        ataFeePayer, // ata
                        feePayer.publicKey, // owner of token account
                        alice.publicKey // fee payer
                      )
                    );

                    console.log(`txhash: ${await connection.sendTransaction(tx3, [feePayer])}`);

                    let tx = new Transaction().add(
                        Token.createTransferCheckedInstruction(
                          TOKEN_PROGRAM_ID,
                          ataAlice,
                          mintPubkey,
                          ataFeePayer,
                          alice.publicKey,
                          [],
                          1,
                          0
                        )
                      );

                      console.log(await connection.sendTransaction(tx, [feePayer, alice]));

    }



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