

var tsify = require('tsify');
var fs = require('fs');
var browserify = require('browserify');
var watchify = require('watchify');

var b = browserify({
    entries: ['src/js/DoubleBlind.ts'],
    cache: {},
    packageCache: {},
    plugin: [tsify, watchify]
});

b.on('update', bundle);
bundle();

function bundle() {
    b.bundle().pipe(fs.createWriteStream('public/bundle.js'));
}