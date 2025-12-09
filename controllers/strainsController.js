const db = require('../db/queries');

const getAllStrains = async (req, res) => {
	try {
		const strains = await db.getAllStrains();
		res.render('strains', { message: 'All Strains', strains });
	} catch (error) {
		res.status(500).json({ error: 'Database error' });
	}
};

const getStrain = async (req, res) => {
	try {
		console.log('Fetching strain with id:', req.params.id);

		const strain = await db.getStrain(req.params.id);
		console.log(strain, 'the strain!');

		if (!strain) {
			res.status(404).json({ error: 'Strain not found' });
			return;
		}
		res.render('strainPage', { strain });
	} catch (error) {
		res.status(500).json({ error: 'Database error retreiving single product' });
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

const deleteStrain = async (req, res) => {
	try {
		console.log('finna delete', req.params.id);
		await db.deleteStrain(req.params.id);
		res.status(200).json({ success: true });
	} catch (error) {
		res.json({ error: 'there is an error.' });
	}
};

module.exports = {
	getAllStrains,
	getStrain,
	createStrainForm,
	insertStrain,
	deleteStrain,
};
