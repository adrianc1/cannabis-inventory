const { Pool } = require('pg');

module.exports = new Pool({
	connectionString: `postgresql://${process.env.DB_USER}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
});
