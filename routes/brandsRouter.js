const express = require('express');
const router = express.Router();

router.get('/', (req, res, next) => {
	console.log('brands router!');
	res.json({ message: 'brands router working' });
});

module.exports = router;
