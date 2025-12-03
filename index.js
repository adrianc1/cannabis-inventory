const express = require('express');
const path = require('node:path');
const brandsRouter = require('./routes/brandsRouter');
const categoryRouter = require('./routes/categoryRouter');
const productsRouter = require('./routes/productsRouter');

const app = express();
const PORT = 3000;

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/', (req, res) => {
	res.render('index', { message: 'EJS rocks!' });
});

app.use('/products', productsRouter);
app.use('/categories', categoryRouter);
app.use('/brands', brandsRouter);

app.listen(PORT, () => {
	console.log(`server running on PORT ${PORT}`);
});
