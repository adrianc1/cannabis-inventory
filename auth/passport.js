const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const db = require('../db/queries');
const pool = require('../db/pool');

module.exports = function (passport) {
	passport.use(
		new LocalStrategy(
			{ usernameField: 'email' },
			async (email, password, done) => {
				try {
					console.log('attemping to login as', email, 'with:', password);
					const user = await db.getUserByEmail(email);

					console.log('User fetched from DB:', user);

					if (!user) {
						console.log('No user found for that email');

						return done(null, false, { message: 'Incorrect email' });
					}
					const match = await bcrypt.compare(password, user.password_hash);
					console.log('Password comparison result:', match);

					if (!match) {
						console.log('Password did not match');
						return done(null, false, { message: 'Incorrect password' });
					}
					console.log('it worked!!');

					return done(null, user);
				} catch (err) {
					return done(err);
				}
			},
		),
	);

	passport.serializeUser((user, done) => {
		done(null, user.id);
	});

	passport.deserializeUser(async (id, done) => {
		try {
			const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [
				id,
			]);
			const user = rows[0];

			if (!user) {
				return done(null, false);
			}
			done(null, user);
		} catch (err) {
			done(err);
		}
	});
};
