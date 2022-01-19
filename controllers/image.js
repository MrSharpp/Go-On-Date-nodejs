const {createCanvas, registerFont, loadImage } = require('canvas');
const fs = require('fs');
const FormData = require('form-data');
const axios = require('axios');

const folder = './image/';

//if(fs.existsSync(folder)) fs.rmdirSync(folder, {recursive: true});
//fs.mkdirSync(folder, { recursive: true });

registerFont('./fonts/JosefinSans-VariableFont_wght.ttf', {family: 'Josefin Sans'});
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
    const year = dateObj.getFullYear();
    const output = day + " " + month  + " " + year;

    console.clear();
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

    ctx.fillText(dayNames[day%7], canvas.width-100, canvas.height-48);
    const buffer = canvas.toBuffer('image/png');
   
    fs.writeFileSync(folder + year+day+".png", buffer);
    res.json({"response": "success"});
    }catch(error){
        console.log(error);
        res.json({"response": "error"});
    }

};

const uploadImage = (req, res) => {
    if(!req.body.Date) return res.json({"Error": "Please specify a date"})
    const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;
    let data = new FormData();
    data.append('file', fs.createReadStream(folder + req.body.Date + ".png"));
    var abc = axios.post(url, data, {
        maxBodyLength: 'Infinity', //this is needed to prevent axios from erroring out with large files
        headers: {
            'Content-Type': `multipart/form-data; boundary=${data._boundary}`,
            pinata_api_key: pinataApi,
            pinata_secret_api_key: pinataSecret
        }
    })
    .then(function (response) {
        console.log(response.data.IpfsHash);
      res.json({"ipfshash":response.data.IpfsHash});
    })
    .catch(function (error) {
        console.log(error);
        res.json({"error": error});
    });
};

module.exports = {generateImage,uploadImage};