const express = require('express');
const strainsController = require('../controllers/strainsController');
const router = express.Router();
const { ensureAuthenticated } = require('../middleware/authMiddleware');

router.get('/', ensureAuthenticated, strainsController.getAllStrains);
router.get(
	'/create-strain',
	ensureAuthenticated,
	strainsController.createStrainForm,
);
router.post('/create-strain', strainsController.insertStrain);
router.get('/:id/edit', ensureAuthenticated, strainsController.editStrainForm);
router.put('/:id', ensureAuthenticated, strainsController.updateStrain);
router.delete('/:id', ensureAuthenticated, strainsController.deleteStrain);
router.get('/:id', ensureAuthenticated, strainsController.getStrain);

module.exports = router;
