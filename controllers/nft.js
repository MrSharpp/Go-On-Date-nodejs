const { exec } = require("child_process");
const { getParsedNftAccountsByOwner,isValidSolanaAddress, createConnectionConfig,} =  require("@nfteyez/sol-rayz");
const { SystemProgram , clusterApiUrl, Connection, PublicKey, Keypair, Transaction } = require('@solana/web3.js');
const {Token, AccountLayout , TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID} = require('@solana/spl-token');
const bs58 = require("bs58");
require('./env')

const { response } = require("express");


const mintImage = (req, res) => {
    if(!req.body.ipfsHash) return res.json({"error": "Please specify a hash"})
    var ipfsHash = "https://gateway.pinata.cloud/ipfs/" + req.body.ipfsHash;
    console.log(ipfsHash);
    exec('ts-node "'+process.env.METAPLEXPATH+'" mint -e devnet -k ./devnet.json -u '+ipfsHash, (error, stdout, stderr) => {
        if (error) {
            console.log(`error: ${error.message}`);
            return res.json({"error":error.message});
           
        }
        if (stderr) {
            console.log(`stderr: ${stderr}`);
            return res.json(stderr);
        }
        return res.send(stdout);
    });
};

const getNftAddress = (req, res) => {
    if(!req.body.walletKey) return res.json({"error": "Please specify a walletKey"})
    if(!req.body.DateAlpha) return res.json({"error": "Please specify a date alpha"})


      getAllNftData(req.body.walletKey,req.body.DateAlpha).then((response) => {
          if(!response) res.json({"error": "NFT NOT FOUND"})
          console.log(response);
          res.json({"mintAddress":response});
      });

};

const  transferNFT = (req, res) => {
    if(!req.body.mintedAddress) return res.json({"error": "Please specify a mintedAddress"})
  
    senNft(req.body.mintedAddress).then((response) =>{
        console.log(response);
        res.json({"successs":response});
    });
};

async function getAllNftData(walletKey,selectedNFTName){
    var selectedNFT;
    try {
        const connect =    createConnectionConfig(clusterApiUrl("devnet"));
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
    return selectedNFT.mint;
};

async function senNft(mintedAddress){
    try{
        const feePayer = Keypair.fromSecretKey(
            bs58.decode("2YQDdnfxiHPKu9GypLX1yXaQTQojvDSPgFkDxrUrzbtchDsZh4B27aM8dfgrfm5DcTn8MJHenKLYRMuAbFeYsuRr")
          );
          
          // G2FAbFQPFa5qKXCetoFZQEvF9BVvCKbvUZvodpVidnoY
          const alice = Keypair.fromSecretKey(
            bs58.decode("3DdVyZuANr5en2PQymCPmoFBMsfdhjaRHqnk3ejW16zc2YN2CWjyDTAfi6oYcQHuSa5UWFH9s1Nvme6UWprmJSjH")
          );
    
          const mintPubkey = new PublicKey("A8SJfwzKJAaMrY6Lb9FxZCfmVMVLcjKvRuzAiNiU6of5");
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
        // console.log(`txhash: ${await connection.sendTransaction(tx2, [feePayer])}`);
    
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

         // console.log(`txhash: ${await connection.sendTransaction(tx3, [alice])}`);

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
                let response = await connection.sendTransaction(tx, [feePayer, alice]);
                return response;
            }catch(e){
                console.log(e);
            }
        
    
}

module.exports = {mintImage, getNftAddress,transferNFT};