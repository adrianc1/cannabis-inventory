const express = require('express');
const productsController = require('../controllers/productsController');
const router = express.Router();

router.get('/', productsController.getAllProducts);
router.get(
	'/create-product',

	productsController.createProductForm,
);
router.get('/receive', productsController.receiveNewPackageForm);
router.post('/receive', productsController.receiveNewPackagesPOST);

router.post('/create-product', productsController.insertProduct);

router.get('/:id/receive', productsController.receiveInventoryGet);
router.post('/:id/receive', productsController.receiveInventoryPut);

router.get('/:id/edit', productsController.editProductForm);

router.get('/:id/split/:lotNumber', productsController.splitPackageProductForm);
router.post('/:id/split/:lotNumber', productsController.splitPackagePost);
router.put('/:id/adjust/:lotNumber', productsController.updateInventory);
router.get('/:id/adjust/:lotNumber', productsController.adjustInventoryGet);

router.delete('/:id', productsController.deleteProduct);
router.get('/:id', productsController.getProduct);
router.put('/:id', productsController.updateProduct);

module.exports = router;
