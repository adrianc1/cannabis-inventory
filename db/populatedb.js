const fs = require('fs');
const { Client } = require('pg');
require('dotenv').config();

async function main() {
	console.log('seeding...');
	const client = new Client({
		connectionString: `postgresql://${process.env.DB_USER}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
	});
	await client.connect();

	const schemaSQL = fs.readFileSync('./db/schema.sql', 'utf-8');
	await client.query(schemaSQL);

	const seedSQL = fs.readFileSync('./db/seed.sql', 'utf-8');
	await client.query(seedSQL);

	await client.end();
	console.log('Database setup and seeding complete!');
}

main().catch((err) => console.error(err));
