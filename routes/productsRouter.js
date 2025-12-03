const express = require('express');
const productsController = require('../controllers/productsController');
const router = express.Router();

router.get('/', productsController.getAllProducts);
router.get('/create-product', productsController.createProductForm);
router.post('/create-product', productsController.insertProduct);

router.get('/:id', productsController.getProduct);

module.exports = router;
