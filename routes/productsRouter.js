const express = require('express');
const productsController = require('../controllers/productsController');
const router = express.Router();

router.get('/all', productsController.getAllProducts);

module.exports = router;
