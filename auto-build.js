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

	bundleStream.on('end', () => {
		console.log('stream close!');
		console.log('reloading!');
		require('child_process').execSync("curl http://localhost:35729/changed?files=index.html", {shell: true});
	});

	bundleStream.pipe(fs.createWriteStream('public/main.js'));



	// setTimeout( () => {
	// }, 200);
}