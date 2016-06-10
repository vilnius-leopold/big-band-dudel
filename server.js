const log = console.log.bind(console);

const fs = require('fs');

const express    = require('express');
const bodyParser = require('body-parser');

const app        = express();
const jsonParser = bodyParser.json();

var dataStore = JSON.parse(fs.readFileSync('db/data.json', 'utf8'));

app.post('/data', jsonParser, (req, res) => {
	log('body', req.body);

	dataStore = req.body;
	fs.writeFileSync( 'db/data.json', JSON.stringify(req.body), 'utf8' );

	res.json(req.body);
});

app.get('/data', (req, res) => {
	res.json(dataStore);
});


app.use(express.static(__dirname + '/public'));

app.listen(3000, () => {
	log('Server started on http://127.0.0.1:3000/')
});