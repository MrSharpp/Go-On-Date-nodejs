const {createCanvas, registerFont, loadImage } = require('canvas');
const fs = require('fs');
const FormData = require('form-data');
const axios = require('axios');
const { response } = require('express');

const folder = './image/';

if(fs.existsSync(folder)) fs.rmdirSync(folder, {recursive: true});
fs.mkdirSync(folder, { recursive: true });


registerFont('./font/static/JosefinSans-Regular.ttf', {family: 'Josefin Sans'});

const monthNames = ["January", "February", "March", "April", "May", "June",
"July", "August", "September", "October", "November", "December"];
const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday",
"Saturday","Sunday"];

const pinataApi = "c7bee0222dd6892c174e";
const pinataSecret = "9da16af9414e1936cf38f5907d5b7162e2624c95f639866eb0b385920d3bc9fe"

const generateImage = (req, res) => {
    if(!req.body.Date) return res.json({"Error": "Please specify a date"})

    try
    {
        var fileName = req.body.Date;
    const dateObj = new Date(req.body.Date);
    const month = monthNames[dateObj.getMonth()];
    const day = String(dateObj.getDate()).padStart(2, '0');
    let weekday = dateObj.toLocaleString('en-us', {weekday:'long'});

    const year = dateObj.getFullYear();
    const output = day + " " + month  + " " + year;

    console.log("Date:"+output);
    var canvas = createCanvas(500, 500);
    var ctx = canvas.getContext("2d");
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "black";

    ctx.font = "30px 'Josefin Sans'";
    ctx.fontStyle="white";
    ctx.textAlign="center";
    ctx.fillText(output, canvas.width/2, (canvas.height/2)+10);
    ctx.font = "28px 'Josefin Sans'";

    ctx.fillText(weekday, canvas.width-100, canvas.height-48);
    const buffer = canvas.toBuffer('image/png');
   
    fs.writeFileSync(folder + year+day+".png", buffer);
    res.json({"response": "success", "data": year+day});
    }catch(error){
        console.log(error);
        res.json({"response": "error"});
    }

};

const uploadImage = (req, res) => {
    if(!req.body.Date) return res.json({"Error": "Please specify a date"})
    pinFileToIPFS(folder + req.body.Date + ".png").then((response) => {
        res.json({"response":"success","data": response.data.IpfsHash});
    }).catch((error) => res.status(400).send({
        message: 'This is an error!'
     }));
};

const createNFTMetadata = (req, res) => {
    if(!req.body.ipfsHash) return res.json({"Error": "Please specify a image hash"})
    if(!req.body.Date) return res.json({"Error": "Please specify a date"})

    var imageUrl = "https://gateway.pinata.cloud/ipfs/"+req.body.ipfsHash;
    imageUrl = imageUrl.replace('"','');
    imageUrl = imageUrl.replace('"','');
    console.log(imageUrl);
    const dateObj = new Date(req.body.Date);
    const month = monthNames[dateObj.getMonth()];
    const day = String(dateObj.getDate()).padStart(2, '0');
    let weekday = dateObj.toLocaleString('en-us', {weekday:'long'});
    const year = dateObj.getFullYear();
    if(day.length < 2) day = "0" + day;
    const output = day + " " + month  + " " + year;
    console.log("::+"+output);
    var nftJson = `{
        "name": "`+output+`",
        "symbol": "GOD",
        "description": " ",
        "seller_fee_basis_points": "100",
        "image": "`+imageUrl+`",
        "attributes": [
            {"trait_type": "Year", "value": "`+year+`"},
            {"trait_type": "Month", "value": "`+month+`"}, 
            {"trait_type": "Date", "value": "`+day+`"},
            {"trait_type": "Day", "value": "`+weekday+`"}
        ],
        "properties": {
            "creators": [{"address": "HPGZnjf2g1uprvTdMVusCSc3HGpc3jLguppi9QKxJ5tU", "share": 100}],
            "files": [{"uri": "`+imageUrl+`", "type": "image/png"}]
        },
        "collection": {"name": "Go On Date", "family": "Go On Date"}
    }
      `;
      fs.writeFileSync(folder + year+ day + ".json", nftJson, function(err) {
          if(err) {
              console.log(err);
              return res.json({"error":err});
          }
      });
      pinFileToIPFS(folder + year+day+".json").then((response) =>{
          console.log(response.data);
          res.json({"ipfsHash":response.data.IpfsHash});
      });
};

async function pinFileToIPFS(filetoUpload){
    const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;
    let data = new FormData();
    data.append('file', fs.createReadStream(filetoUpload));
    var response = await axios.post(url, data, {
        maxBodyLength: 'Infinity', //this is needed to prevent axios from erroring out with large files
        headers: {
            'Content-Type': `multipart/form-data; boundary=${data._boundary}`,
            pinata_api_key: pinataApi,
            pinata_secret_api_key: pinataSecret
        }
    })
    return response;
  /*  .then(function (response) {
        console.log(response.data.IpfsHash);
      res.json({"ipfshash":response.data.IpfsHash});
    })
    .catch(function (error) {
        console.log(error);
        res.json({"error": error});
    }); */
}

module.exports = {generateImage,uploadImage,createNFTMetadata};
