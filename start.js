

let tsify = require('tsify');
let fs = require('fs');
let browserify = require('browserify');
let watchify = require('watchify');
let babelify = require('babelify');

let b = browserify({
    entries: ['src/js/Manage.ts'],
    debug: true,
    verbose: true,
    cache: {},
    packageCache: {}
});

b.plugin(tsify, {target: 'es6'});
b.plugin(watchify)
b.on('update', bundle);
b.on('log', m=>console.log(m))

function bundle(ids) {
    /*
*/
    b.transform(babelify, {
        extensions: ['.tsx', '.ts'],
        presets: ["es2015"]
    })
    .bundle().pipe(fs.createWriteStream('public/bundle.js'));
}

console.log("FUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUU")

bundle();
