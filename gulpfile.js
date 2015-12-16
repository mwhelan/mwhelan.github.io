var gulp = require("gulp");
var config = require('./gulp.config')();
var del = require('del');
var runSequence = require("run-sequence");

var shell = require('gulp-shell');
var connect = require('gulp-connect');
var open = require('gulp-open');
var deploy = require("gulp-gh-pages");

var $ = require('gulp-load-plugins')({lazy: true});

gulp.task('clean', function (done) {
  var files = config.snowOutputFolder + '**/*';
  return clean(files, done);
});

gulp.task('snow', shell.task('.\\Snow\\_compiler\\Snow.exe config=.\\Snow\\'));

gulp.task('connect', function() {
    log('running the connect node HTTP server to serve content from {Website} folder on port 8123');
  	connect.server({
    	root: config.snowOutputFolder,
    	port: '8123'
  });
});

gulp.task("open", function(){
  log("opening a browser at address {http://localhost:8123}");
  var options = {
    uri: "http://localhost:8123"
  };
  gulp.src(config.snowOutputFolder + "index.html")
  .pipe(open(options));
});

// generate website to 'Website' folder and then open site in browser
gulp.task('build', function(callback) {
	runSequence('clean', 'snow', 'connect', 'open', callback);
});

gulp.task('deploy', function () {
    // deploy 'Website' folder to mwhelan.github.io github repo, master branch
    var options = { 
        remoteUrl: "https://github.com/mwhelan/mwhelan.github.io.git",
        branch: "master"
    };
    
    return gulp.src([config.snowOutputFolder + '**/*', config.snowOutputFolder + 'CNAME'])
        .pipe(deploy(options));
});

/////////////////////////////////////////////////////////////////////////

function log(msg) {
    if (typeof(msg) === 'object') {
        for (var item in msg) {
            if (msg.hasOwnProperty(item)) {
                $.util.log($.util.colors.blue(msg[item]));
            }
        }
    } else {
        $.util.log($.util.colors.blue(msg));
    }
}

function clean(path, done) {
    log('Cleaning: ' + $.util.colors.blue(path));
    return del(path, done);
}