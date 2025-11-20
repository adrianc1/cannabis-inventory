const express = require('express');
const router = express.Router();

router.get('/', (req, res, next) => {
	console.log('products router!');
	res.json({ message: 'products router working' });
});

module.exports = router;
