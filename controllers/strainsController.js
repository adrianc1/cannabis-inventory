const db = require('../db/queries');

const getAllStrains = async (req, res) => {
	try {
		const strains = await db.getAllStrains();
		res.render('strains', { message: 'All Strains', strains });
	} catch (error) {
		res.status(500).json({ error: 'Database error' });
	}
};

const createStrainForm = async (req, res) => {
	try {
		res.render('createStrainForm');
	} catch (error) {
		res.status(500).json({ error: 'Database Error' });
	}
};

const insertStrain = async (req, res) => {
	try {
		const { name, description, type } = req.body;
		const result = await db.insertStrain(name, description, type);
		res.redirect(`/strains/`);
	} catch (error) {
		console.error(error);
	}
};

module.exports = {
	getAllStrains,
	createStrainForm,
	insertStrain,
};
