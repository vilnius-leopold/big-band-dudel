var fs = require('fs');
var browserify = require('browserify');
var watchify = require('watchify');

var b = browserify({
  entries: ['jsx/main.jsx'],
  cache: {},
  verbose: true,
  packageCache: {},
  plugin: [watchify]
});

b.on('update', bundle);
bundle();

function bundle() {
	console.log('updated!!!');

	var bundleStream = b.bundle();

	bundleStream.on('error', (err) => {
		// clean up error message
		delete err.stream;
		delete err.pos;
		delete err.loc;
		delete err._babel;
		delete err.codeFrame;
		delete err.filename;

		console.error(err);
	});

	bundleStream.on('end', () => {
		console.log('reloading!');
		require('child_process').execSync("curl -s http://localhost:35729/changed?files=index.html", {shell: true});
	});

	bundleStream.pipe(fs.createWriteStream('public/main.js'));



	// setTimeout( () => {
	// }, 200);
}