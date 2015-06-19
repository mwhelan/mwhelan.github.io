var gulp = require("gulp");
var runSequence = require("run-sequence");
var clean = require('gulp-rimraf');
var shell = require('gulp-shell');
var connect = require('gulp-connect');
var open = require('gulp-open');
var deploy = require("gulp-gh-pages");

gulp.task('clean', function () {
    return gulp.src('Website', {read:false})
        .pipe(clean());
});

gulp.task('snow', shell.task('.\\Snow\\_compiler\\Snow.exe config=.\\Snow\\'));

gulp.task('connect', function() {
  	connect.server({
    	root: 'Website/',
    	port: '8123'
  });
});

gulp.task("open", function(){
  var options = {
    url: "http://localhost:8123"
  };
  gulp.src("Website/index.html")
  .pipe(open("", options));
});

// generate website to 'Website' folder and then open site in browser
gulp.task('build', function(callback) {
	runSequence('clean', 'snow', 'connect', 'open');
});

// deploy 'Website' folder to mwhelan.github.io github repo, master branch
var options = { 
	remoteUrl: "https://github.com/mwhelan/mwhelan.github.io.git",
	branch: "master"};
  gulp.task('deploy', function () {
      gulp.src(["Website/**/*.*", "Website/CNAME"])
          .pipe(deploy(options));
  });