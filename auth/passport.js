const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const db = require('../db/queries');
const pool = require('../db/pool');

module.exports = function (passport) {
	passport.use(
		new LocalStrategy(async (username, password, done) => {
			try {
				const user = await db.getUserByUsername(username);

				if (!user) {
					return done(null, false, { message: 'Incorrect username' });
				}
				const match = await bcrypt.compare(password, user.password_hash);

				if (!match) {
					console.log('it failed');
					return done(null, false, { message: 'Incorrect password' });
				}
				console.log('it worked!!');

				return done(null, user);
			} catch (err) {
				return done(err);
			}
		}),
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

			done(null, user);
		} catch (err) {
			done(err);
		}
	});
};
