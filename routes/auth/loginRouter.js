const express = require('express');
const authController = require('../../controllers/authController');
const router = express.Router();

router.get('/', (req, res) => {
	res.render('auth/login');
});

router.get('/signup/create-account', authController.getLoginForm);
// router.post('/signup/create-account', authController.postSignUpForm);

module.exports = router;
