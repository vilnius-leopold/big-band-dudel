const log = console.log.bind(console);

const fs = require('fs');

const express    = require('express');
const bodyParser = require('body-parser');

const app        = express();
const jsonParser = bodyParser.json();

const port = process.env.NODE_ENV === 'production' ? 80 : 3000;

var dataStore = JSON.parse(fs.readFileSync('db/data.json', 'utf8'));


app.get('/data', (req, res) => {
	res.json(dataStore);
});

app.post('/data', jsonParser, (req, res) => {
	dataStore = req.body;
	fs.writeFileSync( 'db/data.json', JSON.stringify(req.body, null, 3), 'utf8' );

	res.json(req.body);
});

app.use(express.static(__dirname + '/public'));

app.listen(port, () => {
	if ( process.env.NODE_ENV === 'production') {
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