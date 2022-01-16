const express = require('express')
const app = express()
const path = require('path')
const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const { exec } = require("child_process");
const solanaWeb3 = require('@solana/web3.js');
const splToken  = require('@solana/spl-token');
const res = require('express/lib/response');
const PublicKey = solanaWeb3.PublicKey;
const {TOKEN_PROGRAM_ID} = require('@solana/spl-token');

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
  

    // Connect to cluster
    const connection = new solanaWeb3.Connection(
      solanaWeb3.clusterApiUrl('devnet'),
      'confirmed',
    );
  
    // Generate a new wallet keypair and airdrop SOL
    var fromWallet = solanaWeb3.Keypair.fromSecretKey(Uint8Array.from([77,24,110,52,181,160,254,178,116,76,201,188,146,191,187,204,83,83,233,42,25,4,92,168,35,148,120,99,158,114,26,81,243,111,94,78,112,51,46,186,66,189,177,111,175,132,209,70,6,215,145,166,44,136,61,246,174,41,186,22,130,164,207,81]));
  
    // Generate a new wallet to receive newly minted token
   // const toWallet = solanaWeb3.Keypair.generate();
  
 
    const mint = await splToken.Token.createMint(
      connection,
      fromWallet,
      fromWallet.publicKey,
      null,
      9,
      splToken.TOKEN_PROGRAM_ID,
    );
  
    // Get the token account of the fromWallet Solana address, if it does not exist, create it
    const fromTokenAccount = await mint.getOrCreateAssociatedAccountInfo(
      new PublicKey("HPGZnjf2g1uprvTdMVusCSc3HGpc3jLguppi9QKxJ5tU"),
    );
  
    //get the token account of the toWallet Solana address, if it does not exist, create it
    const toTokenAccount = await mint.getOrCreateAssociatedAccountInfo(
      new PublicKey("BBPgGEg37HFuNgW8ha5XJAHj2DAmCkbp5JWbt2TEEVCT"),
    );
  
    // Minting 1 new token to the "fromTokenAccount" account we just returned/created
    await mint.mintTo(
      fromTokenAccount.address,
      fromWallet.publicKey,
      [],
      1000000000,
    );
  

      var hello =await  findAssociatedTokenAddress(
        new PublicKey("HPGZnjf2g1uprvTdMVusCSc3HGpc3jLguppi9QKxJ5tU"),
        new PublicKey("DaSe2f4ijcKiAtAK7nBRt6YheodbGfDs4vPWdt7Fcbkd")
      );

      var hello2 = await CreateAssociatedTokenAddress(
        new PublicKey("BBPgGEg37HFuNgW8ha5XJAHj2DAmCkbp5JWbt2TEEVCT"),
        new PublicKey("DaSe2f4ijcKiAtAK7nBRt6YheodbGfDs4vPWdt7Fcbkd")
      );

        
        console.log("1:"+fromTokenAccount.address);
        console.log("2:"+toTokenAccount.address);
        console.log("1:"+hello);
        console.log("2:"+hello2);


    // Add token transfer instructions to transaction
    const transaction = new solanaWeb3.Transaction().add(
      splToken.Token.createTransferInstruction(
        splToken.TOKEN_PROGRAM_ID,
        hello,
        hello2,
        fromWallet.publicKey,
        [],
        10000,
      ),
    );
  
    // Sign transaction, broadcast, and confirm
    const signature = await solanaWeb3.sendAndConfirmTransaction(
      connection,
      transaction,
      [fromWallet],
      {commitment: 'confirmed'},
    );
    console.log('SIGNATURE', signature);

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