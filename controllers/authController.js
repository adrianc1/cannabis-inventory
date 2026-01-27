const db = require('../db/queries');
const getSignUpForm = async (req, res) => {
	res.render('auth/signup.ejs');
};
const postSignUpForm = async (req, res) => {
	const { firstName, lastName, email, company } = req.body;
	const products = await db.getAllProductsDB();
	// await db.insertUser(firstName, lastName, email, company);
	res.render('products/products', {
		message: `Welcome ${firstName}!`,
		products,
	});
};

module.exports = {
	getSignUpForm,
	postSignUpForm,
};
