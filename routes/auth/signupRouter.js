const express = require('express');
const authController = require('../../controllers/authController');
const router = express.Router();

router.get('/', (req, res) => {
	res.render('index');
});

router.get('/signup/create-account', authController.getSignUpForm);
router.get('/logout', (req, res) => {
	req.logout((err) => {
		if (err) console.error(err);
		res.redirect('/login');
	});
});
router.post(
	'/signup/create-account',
	authController.validateUser,
	authController.postSignUpForm,
);

module.exports = router;
