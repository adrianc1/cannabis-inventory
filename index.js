const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const path = require('node:path');
const brandsRouter = require('./routes/brandsRouter');
const categoryRouter = require('./routes/categoryRouter');
const productsRouter = require('./routes/productsRouter');
const strainsRouter = require('./routes/strainsRouter');

const app = express();
const PORT = 3000;

app.use(cors());

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// sessions
require('./config/passport')(passport);
require('dotenv').config();

app.use(
	session({
		// dev env
		secret: process.env.COOKIE_SECRET,
		resave: false,
		saveUninitialized: false,
		cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 },
	}),
	// session({
	// 	store: new pgSession({
	// 		pool: pool,
	// 		tableName: 'session',
	// 	}),
	// 	secret: process.env.COOKIE_SECRET,
	// 	resave: false,
	// 	saveUninitialized: false,
	// 	cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 }, // 30 days
	// }),
);
app.use(passport.initialize());
app.use(passport.session());

app.get('/', (req, res) => {
	res.render('index', { message: 'EJS rocks!' });
});

app.use('/products', productsRouter);
app.use('/categories', categoryRouter);
app.use('/strains', strainsRouter);
app.use('/brands', brandsRouter);

app.listen(PORT, () => {
	console.log(`server running on PORT ${PORT}`);
});
