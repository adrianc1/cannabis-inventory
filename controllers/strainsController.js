const db = require('../db/queries');

const getAllStrains = async (req, res) => {
	try {
		const strains = await db.getAllStrains(req.user.company_id);
		res.render('strains/strains', { message: 'All Strains', strains });
	} catch (error) {
		res.status(500).json({ error: 'Database error' });
	}
};

const getStrain = async (req, res) => {
	try {
		const strain = await db.getStrain(req.params.id);

		if (!strain) {
			res.status(404).json({ error: 'Strain not found' });
			return;
		}
		res.render('strains/strainPage', { strain });
	} catch (error) {
		res.status(500).json({ error: 'Database error retreiving single product' });
	}
};

const createStrainForm = async (req, res) => {
	try {
		res.render('strains/createStrainForm');
	} catch (error) {
		res.status(500).json({ error: 'Database Error' });
	}
};

const insertStrain = async (req, res) => {
	try {
		const { name, description, type } = req.body;
		const result = await db.insertStrain(name, description, type);
		res.status(200).redirect('/products/');
	} catch (error) {
		console.error(error);
	}
};

const editStrainForm = async (req, res) => {
	let strain = await db.getStrain(req.params.id);

	if (!strain) {
		res.status(404).json({ error: 'Strain not found' });
		return;
	}

	console.log('strain', strain);

	res.render('strains/editStrainForm', { strain });
};

const updateStrain = async (req, res) => {
	const id = req.params.id;
	const { name, description } = req.body;
	await db.updateStrain(name, description, id);
	res.status(200).json({ success: true });
};

const deleteStrain = async (req, res) => {
	try {
		console.log('deleting', req.params.id);
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
	editStrainForm,
	updateStrain,
};
