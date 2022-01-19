const express = require('express');
const router  = express.Router(); 
const imageController = require('../controllers/image'); 

router.post('/generateImage', imageController.generateImage); 
router.post('/uploadImage', imageController.uploadImage); 
router.post('/imageMetadeta', imageController.createNFTMetadata)

module.exports = router;