const log = console.log.bind(console);

const fs = require('fs');
const compression = require('compression');
const express    = require('express');
const bodyParser = require('body-parser');

const app        = express();
const textParser = bodyParser.text();

const isProduction = process.env.NODE_ENV === 'production';

const port = isProduction ? 80 : 3000;
const dbFile = isProduction ? '../db/data.json' : 'db/data.json';

var jsonData = fs.readFileSync(dbFile, 'utf8');

app.set('views', './views')
app.set('view engine', 'pug');
app.use(compression());

app.get('/', (req, res) => {
	res.render('index', {initialData: jsonData});
});

app.get('/data', (req, res) => {
	res.setHeader('Content-Type', 'application/json');
	res.send(jsonData);
});

app.post('/data', textParser, (req, res) => {
	jsonData = req.body;
	fs.writeFileSync( dbFile, jsonData, 'utf8' );

	res.setHeader('Content-Type', 'application/json');
	res.send(jsonData);
});

app.use(express.static(__dirname + '/public'));

app.listen(port, () => {
	if ( isProduction ) {
		log('Server started on http://127.0.0.1:80/');
		log("======================================");
		log("NODE_ENV === 'production'");
		log("======================================");
	} else {
		log('Server started on http://127.0.0.1:3000/');
		log("======================================");
		log("NODE_ENV === 'development'");
		log("======================================");
		require('child_process').execSync("wf run livereload", {shell: true});
	}
});