---
layout: post
title: Deploying Sandra.Snow to GitHub Pages with Gulp
categories: Snow
image: images/sswtvthumb.jpg
date: 2014-07-18
comments: true
sharing: true
footer: true
permalink: /deploying-sandra-snow-to-github-pages-with-gulp/
---

When I was planning a git work flow for my Sandra.Snow blog, which is hosted on GitHub Pages, I expected that I would store the project files in the master branch, then publish the site to the gh-pages branch. The point I overlooked is that this is the work flow for project sites, but user and organisation sites, like my blog, work slightly differently. With user and organisation sites you publish the website content to the master branch of your GitHub repository. This was far from ideal, as it meant that my content was mixed with the generated output. Even the slightest tweak to a post would lead to the whole site being generated, meaning monster commits and hiding the changes to the content. I suspect Sandra.Snow has a few solutions to this problem, but here is the solution I came up with.
<!--excerpt-->

## Orphan Branch ##
The first step was to separate out the markdown blog posts and snow templates from the generated static website files. To do this, I created an orphan branch in the repository named "posts" and moved the markdown blog posts and Sandra.Snow templates and generators into it:

	git checkout --orphan posts
 
## Gulp ##
The next step was to automate the deployment to my remote master branch. To do that, I thought I would use [Gulp](http://gulpjs.com/), a useful tool I've been using recently while learning AngularJS. Gulp is a relatively new build system, which makes it easy to automate common tasks in the development of a website. It's built on Node.js and is extremely fast, as it uses node.js streams rather than writing temporary files to disk. It promotes the idea of code over configuration - the code being JavaScript.

To install Gulp, you need to have [Node](http://nodejs.org/) installed. Then you can install gulp globally by running:

	npm install -g gulp

You then need to install it locally into your project. From the command line, navigate to your project root, and run:

	npm install --save-dev gulp

This installs gulp locally in the `node_modules` folder and saves it to the `package.json` file that holds the node configuration. (If you don't have a package.json file you can type [npm init](https://www.npmjs.org/doc/cli/npm-init.html) to generate one before this step).

Like I said, I want to keep any generated files out of the repo, so I added the `dist` folder (where I have Sandra.Snow generate the static pages to) and the `node_modules` folder (where node stores all of the plugins) to the `.gitignore` file.

	dist/
	node_modules/

If I clone a fresh copy of the repo, I just need to open a command prompt at the project root and type `npm update` to reinstall all the plugins listed in the node `package.json` file to the `node_modules` folder.

## Gulp-gh-pages ##
[Gulp-gh-pages](https://github.com/rowoot/gulp-gh-pages) is a gulp plugin to publish to GitHub Pages. Its default use case is to deploy to a project site's gh-pages branch, but you can configure it to deploy to the master branch instead. To install into the project, execute:

	npm install --save-dev gulp-gh-pages

You configure gulp-plugins using JavaScript in a `gulpfile.js` file. To configure gulp-gh-pages to deploy the dist folder (the output folder that Snow generates the website to) to the master branch of my mwhelan.github.io user site repository, I just need to define a `deploy` task:

	var deploy = require("gulp-gh-pages");
	var options = { 
		remoteUrl: "https://github.com/mwhelan/mwhelan.github.io.git",
		branch: "master"};
	gulp.task('deploy', function () {
	    gulp.src("dist/**/*.*")
	        .pipe(deploy(options));
	});

Now if I want to deploy my site, I just need to navigate to the root of the project via the command line and execute that task:

	gulp deploy

## The whole workflow ##
When I've created a new blog post, I use Snow to generate the static site and then view it in a browser to make sure everything is OK:

	gulp build

The build task deletes the output folder, shells out to Snow to re-generate the static site, creates a web server to host the static files, then opens the browser to display the site. (Snow already does some of these things, but I did them here to add to my learning about gulp)! 

To have these steps happen in that order, I use the [run-sequence plugin](https://www.npmjs.org/package/run-sequence). By default, node would run the tasks asynchronously. Once everything looks OK, I can run the `deploy` task to publish to GitHub. 

In case it is useful, here is the whole gulp configuration file.

	var gulp = require("gulp");
	var runSequence = require("run-sequence");
	var clean = require('gulp-rimraf');
	var shell = require('gulp-shell');
	var connect = require('gulp-connect');
	var open = require('gulp-open');
	var deploy = require("gulp-gh-pages");
	
	gulp.task('clean', function () {
	    return gulp.src('dist', {read:false})
	        .pipe(clean());
	});
	
	gulp.task('snow', shell.task('.\\Snow\\_compiler\\Snow.exe config=.\\Snow\\'));
	
	gulp.task('connect', function() {
	  	connect.server({
	    	root: 'dist/',
	    	port: '8123'
	  });
	});
	
	gulp.task("open", function(){
	  var options = {
	    url: "http://localhost:8123"
	  };
	  gulp.src("dist/index.html")
	  .pipe(open("", options));
	});
	
	// generate website to 'dist' folder and then open site in browser
	gulp.task('build', function(callback) {
		runSequence('clean', 'snow', 'connect', 'open');
	});
	
	// deploy 'dist' folder to mwhelan.github.io github repo, master branch
	var options = { 
		remoteUrl: "https://github.com/mwhelan/mwhelan.github.io.git",
		branch: "master"};
	gulp.task('deploy', function () {
	    gulp.src("dist/**/*.*")
	        .pipe(deploy(options));
	});

Like I say, I am pretty new to all this front-end build stuff. I suspect I will find better ways of doing things as my experience with gulp increases. I could also add some other tasks in here, such as minifying the CSS/JavaScript, and using [uncss](http://addyosmani.com/blog/removing-unused-css/) to delete all the redundant CSS. (I am using Twitter Bootstrap to style my site and I already know that I can delete 90% of my styles)! 














