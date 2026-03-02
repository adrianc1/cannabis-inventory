//For development purposes only! Used on DB reset. Feel free to sign up with your own password!

const bcrypt = require('bcryptjs');

const password = 'password';

bcrypt.hash(password, 10).then((hash) => {
	console.log('Hashed password:\n');
	console.log(hash);
	process.exit();
});
