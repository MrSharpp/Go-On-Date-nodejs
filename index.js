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
  var senderTokenAddress;
  var recipentTokenAddress;
  findAssociatedTokenAddress(
    new PublicKey("HPGZnjf2g1uprvTdMVusCSc3HGpc3jLguppi9QKxJ5tU"),
    new PublicKey("DaSe2f4ijcKiAtAK7nBRt6YheodbGfDs4vPWdt7Fcbkd")
    ).then((resp) => {
      senderTokenAddress = resp
      CreateAssociatedTokenAddress(
        new PublicKey("BBPgGEg37HFuNgW8ha5XJAHj2DAmCkbp5JWbt2TEEVCT"),
        new PublicKey("DaSe2f4ijcKiAtAK7nBRt6YheodbGfDs4vPWdt7Fcbkd")
      ).then((resp) => {
        recipentTokenAddress = resp
        sendNFT(senderTokenAddress,recipentTokenAddress).then(()=>{
          res.send("sa");
        })
      });
    });
  

  
     


});





/*

MINT AND SEND TRANSECTION FUNCTION

*/


async function sendNFT(sender, reciever){
  
  const feePayer = Keypair.fromSecretKey(
    bs58.decode("3DdVyZuANr5en2PQymCPmoFBMsfdhjaRHqnk3ejW16zc2YN2CWjyDTAfi6oYcQHuSa5UWFH9s1Nvme6UWprmJSjH")
  );
  
  // G2FAbFQPFa5qKXCetoFZQEvF9BVvCKbvUZvodpVidnoY
  const alice = Keypair.fromSecretKey(
    bs58.decode("2YQDdnfxiHPKu9GypLX1yXaQTQojvDSPgFkDxrUrzbtchDsZh4B27aM8dfgrfm5DcTn8MJHenKLYRMuAbFeYsuRr")
  );

  const mintPubkey = new PublicKey("DaSe2f4ijcKiAtAK7nBRt6YheodbGfDs4vPWdt7Fcbkd");

  // connection
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

  let ata = await Token.getAssociatedTokenAddress(
    ASSOCIATED_TOKEN_PROGRAM_ID,
    TOKEN_PROGRAM_ID,
    mintPubkey,
    feePayer.publicKey
  );
  console.log(`ATA: ${ata.toBase58()}`);

  let tx2 = new Transaction().add(
    Token.createAssociatedTokenAccountInstruction(
      ASSOCIATED_TOKEN_PROGRAM_ID, // always ASSOCIATED_TOKEN_PROGRAM_ID
      TOKEN_PROGRAM_ID, // always TOKEN_PROGRAM_ID
      mintPubkey, // mint
      ata, // ata
      feePayer.publicKey, // owner of token account
      alice.publicKey // fee payer
    )
  );
 console.log(`txhash: ${await connection.sendTransaction(tx2, [alice])}`);
return;
 let tx = new Transaction().add(
    Token.createTransferCheckedInstruction(
      TOKEN_PROGRAM_ID,
      ata,
      mintPubkey,
      ata2,
      alice.publicKey,
      [],
      1e8,
      8
    )
  );

  console.log(await connection.sendTransaction(tx, [feePayer, alice]));

}



async function findAssociatedTokenAddress(
  walletAddress = PublicKey,
  tokenMintAddress = PublicKey
){
return (await PublicKey.findProgramAddress(
[
walletAddress.toBuffer(),
TOKEN_PROGRAM_ID.toBuffer(),
tokenMintAddress.toBuffer(),
],
SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID
))[0];
}

async function CreateAssociatedTokenAddress(
walletAddress = PublicKey,
tokenMintAddress = PublicKey
){
return (await PublicKey.createProgramAddress(
  [
    walletAddress.toBuffer(),
    TOKEN_PROGRAM_ID.toBuffer(),
    tokenMintAddress.toBuffer(),
  ],
SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID
));
}








        
        
        var SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID = new PublicKey('HPGZnjf2g1uprvTdMVusCSc3HGpc3jLguppi9QKxJ5tU');
        
        
        async function findAssociatedTokenAddress(
          walletAddress = PublicKey,
          tokenMintAddress = PublicKey
          ){
            return (await PublicKey.findProgramAddress(
              [
                walletAddress.toBuffer(),
                TOKEN_PROGRAM_ID.toBuffer(),
          tokenMintAddress.toBuffer(),
        ],
        SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID
        ))[0];
      }
      
      async function CreateAssociatedTokenAddress(
        walletAddress = PublicKey,
        tokenMintAddress = PublicKey
        ){
          return (await PublicKey.createProgramAddress(
            [
              walletAddress.toBuffer(),
              TOKEN_PROGRAM_ID.toBuffer(),
              tokenMintAddress.toBuffer(),
            ],
      SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID
  ));
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