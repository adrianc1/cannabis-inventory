const express = require('express');
const authController = require('../../controllers/authController');
const passport = require('passport');
const router = express.Router();

router.get('/', authController.getLoginForm);
router.post('/', (req, res, next) => {
	console.log(req.body);
	next();
});
router.post(
	'/',
	passport.authenticate('local', {
		successRedirect: '/products',
		failureRedirect: '/login',
	}),
);

module.exports = router;
