const express = require('express');
const router  = express.Router(); 
const nftController = require('../controllers/nft'); 

router.post('/mint', nftController.mintImage); 
router.post('/getNftAddress', nftController.getNftAddress); 

module.exports = router;