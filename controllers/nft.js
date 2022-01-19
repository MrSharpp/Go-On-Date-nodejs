const { exec } = require("child_process");
const { Connection, clusterApiUrl, LAMPORTS_PER_SOL } = require("@solana/web3.js");
const { getParsedNftAccountsByOwner,isValidSolanaAddress, createConnectionConfig,} =  require("@nfteyez/sol-rayz");


const mintImage = (req, res) => {
    if(!req.body.ipfsHash) return res.json({"error": "Please specify a hash"})
    var ipfsHash = "https://gateway.pinata.cloud/ipfs/" + req.body.ipfsHash;
    console.log(ipfsHash);
    exec('ts-node "C:\\Users\\Amir Alam\\metaplex\\js\\packages\\cli\\src\\cli-nft.ts" mint -e devnet -k ./devnet.json -u '+ipfsHash, (error, stdout, stderr) => {
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
   
      getAllNftData(req.body.walletKey,"11 January 2020").then((response) => {
          if(!response) res.json({"error": "NFT NOT FOUND"})
          console.log(response);
          res.json({"mintAddress":response});
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

module.exports = {mintImage, getNftAddress};