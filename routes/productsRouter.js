const express = require('express');
const productsController = require('../controllers/productsController');
const router = express.Router();

router.get('/', productsController.getAllProducts);
router.get('/create-product', productsController.createProduct);
router.get('/:id', productsController.getProduct);

module.exports = router;
