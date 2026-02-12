const express = require('express');
const strainsController = require('../controllers/strainsController');
const router = express.Router();

router.get('/', strainsController.getAllStrains);
router.get('/create-strain', strainsController.createStrainForm);
router.post('/create-strain', strainsController.insertStrain);
router.get('/:id/edit', strainsController.editStrainForm);
router.put('/:id', strainsController.updateStrain);
router.delete('/:id', strainsController.deleteStrain);
router.get('/:id', strainsController.getStrain);

module.exports = router;
