const express = require('express');
const brandsController = require('../controllers/brandsController');
const router = express.Router();

router.get('/', brandsController.getAllBrands);
// router.get('/create-brand', brandsController.createBrandForm);
// router.post('/create-brand', brandsController.insertBrand);
// router.get('/:id/edit', brandsController.editBrandForm);
// router.put('/:id', brandsController.updateBrand);
// router.delete('/:id', brandsController.deleteBrand);
// router.get('/:id', brandsController.getBrand);

module.exports = router;
