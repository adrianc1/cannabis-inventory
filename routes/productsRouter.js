const express = require('express');
const productsController = require('../controllers/productsController');
const router = express.Router();

router.get('/all', productsController.getAllProducts);
router.get('/:id', productsController.getProduct);
module.exports = router;
