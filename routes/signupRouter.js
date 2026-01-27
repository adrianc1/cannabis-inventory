const express = require('express');
const authController = require('../controllers/authController');
const router = express.Router();

router.get('/', (req, res) => {
	res.render('index');
});

router.get('/signup/create-account', authController.getSignUpForm);
router.post('/signup/create-account', authController.postSignUpForm);

module.exports = router;
