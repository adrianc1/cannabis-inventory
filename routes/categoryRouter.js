const express = require('express');
const router = express.Router();

router.get('/', (req, res, next) => {
	console.log('category router!');
	res.json({ message: 'category router working' });
});

module.exports = router;
