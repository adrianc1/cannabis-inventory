const express = require('express');
const path = require('node:path');
const brandsRouter = require('./routers/brandsRouter');
const categoryRouter = require('./routers/categoryRouter');
const productsRouter = require('./routers/productsRouter');

const app = express();
const PORT = 3000;

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
	res.render('index', { message: 'EJS rocks!' });
});

app.get('/products', productsRouter);
app.get('/categories', categoryRouter);
app.get('/brands', brandsRouter);

app.listen(PORT, (req, res) => {
	console.log(`server running on PORT ${PORT}`);
});
