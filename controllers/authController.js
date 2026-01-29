const db = require('../db/queries');

const getSignUpForm = async (req, res) => {
	res.render('auth/signup.ejs');
};

const postSignUpForm = async (req, res) => {
	const { firstName, lastName, email, password_hash, company, license } =
		req.body;
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

module.exports = {
	getSignUpForm,
	postSignUpForm,
};
