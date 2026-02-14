const express = require('express');
const productsController = require('../controllers/productsController');
const router = express.Router();

router.get('/', productsController.getAllProducts);
router.get(
	'/create-product',

	productsController.createProductForm,
);
router.post('/create-product', productsController.insertProduct);

router.get('/:id/receive', productsController.receiveInventoryGet);
router.get('/:id/edit', productsController.editProductForm);
router.get('/:id/split', productsController.splitPackageProductForm);

router.put('/:id/adjust/:lotNumber', productsController.updateInventory);
router.get('/:id/adjust/:lotNumber', productsController.adjustInventoryGet);
router.put('/:id/receive', productsController.receiveInventoryPut);

router.put('/:id', productsController.updateProduct);

router.delete('/:id', productsController.deleteProduct);
router.get('/:id', productsController.getProduct);

module.exports = router;
