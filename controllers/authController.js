const db = require('../db/queries');
const bcrypt = require('bcryptjs');
const { body, validationResult, matchedData } = require('express-validator');

const alphaErr = 'must contain only letters';
const lengthErr = 'must be at least 2 characters';
const validateUser = [
	body('firstName')
		.trim()
		.isAlpha()
		.withMessage(`First name ${alphaErr}`)
		.isLength({ min: 2 })
		.withMessage(`First name ${lengthErr}`),
	body('lastName')
		.trim()
		.isAlpha()
		.withMessage(`Last name ${alphaErr}`)
		.isLength({ min: 2 })
		.withMessage(`Last name ${lengthErr}`),
	body('email')
		.trim()
		.isEmail()
		.withMessage(`Must enter a valid email`)
		.isLength({ min: 1 })
		.withMessage(`Email must at least contain 1 character `),
	body('company')
		.isLength({ min: 1 })
		.withMessage(`company must at least contain 1 character `),
	,
	body('password')
		.isLength({ min: 4 })
		.withMessage('password must be at least 8 characters'),
	body('confirmPassword')
		.custom((value, { req }) => {
			return value === req.body.password;
		})
		.withMessage('passwords do not match!'),
];

const getSignUpForm = async (req, res) => {
	res.render('auth/signup.ejs');
};

const postSignUpForm = async (req, res) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(400).render('auth/signup', {
			errors: errors.array(),
			formData: req.body,
		});
	}
	const { firstName, lastName, email, company, license } = matchedData(req);

	const password_hash = await bcrypt.hash(req.body.password, 10);
	const products = await db.getAllProductsDB();
	await db.signupAdmin(
		firstName,
		lastName,
		email,
		password_hash,
		company,
		license,
	);
	res.render('products/products', {
		message: `Welcome ${firstName}!`,
		products,
	});
};

const getLoginForm = async (req, res) => {
	res.render('auth/login.ejs');
};

module.exports = {
	getSignUpForm,
	postSignUpForm,
	getLoginForm,
	validateUser,
};
