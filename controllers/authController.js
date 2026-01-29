const db = require('../db/queries');
const bcrypt = require('bcryptjs');

const getSignUpForm = async (req, res) => {
	res.render('auth/signup.ejs');
};

const postSignUpForm = async (req, res) => {
	const { firstName, lastName, email, company, license } = req.body;
	console.log('the body!!!====', req.body);
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
};
