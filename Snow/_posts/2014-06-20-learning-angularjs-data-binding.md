---
layout: post
title: AngularJS Data Binding
categories: Learning
image: images/sswtvthumb.jpg
date: 2014-06-20 10:00:00
comments: true
sharing: true
footer: true
permalink: /angularjs-data-binding/
published: true
---

---excerpt
Although AngularJS is a JavaScript framework, there is actually quite a lot you can do without writing any JavaScript at all. In my first look at Angular, I am going to focus on simple data binding with Angular directives. Directives are a mechanism that Angular uses to extend the capabilities of HTML. HTML is designed for static documents and directives help you extend it for dynamic views, letting you invent new HTML syntax, specific to your application.
---end

**This article is part of a series on [Learning AngularJS](/learning-angularjs).**

Although AngularJS is a JavaScript framework, there is actually quite a lot you can do without writing any JavaScript at all. In my first look at Angular, I am going to focus on simple data binding with Angular directives. Directives are a mechanism that Angular uses to extend the capabilities of HTML. HTML is designed for static documents and directives help you extend it for dynamic views, letting you invent new HTML syntax, specific to your application.

## Referencing AngularJS ##
It probably goes without saying that the first thing you need to do is reference AngularJS in your HTML page.

	<script src="assets/js/angular.min.js"></script>

If you go to the [AngularJS home page](https://angularjs.org/) then you can download a copy or get a reference to the CDN location. You can also install it via NuGet and Bower.

## ng-app ##
The key built-in Angular directive is `ng-app`, which bootstraps the Angular application. It designates the root element of the application. You can scope your Angular application to any part of the page, but it is common to put it on the `html` or `body` tag, which makes your entire page Angular.

	<body ng-app="">

## ng-init
Because we've loaded Angular in our script tag and set the ng-app attribute on our opening html tag, we get access to Angular in our HTML template. `ng-init` is an Angular directive that allows us to set an initial value on the scope on page load. Here I have a "container" div for my page and I am calling ng-init as an attribute on that div and creating a `data` object. 

    <div class="container" ng-init="data={
         femaleName: 'female name',
         jobTitle: 'job title',
         tediousTask: 'tedious task',
         dirtyTask: 'dirty task',
         celebrity: 'celebrity',
         uselessSkill: 'useless skill',
         obnoxiousCelebrity: 'obnoxious celebrity',
         hugeNumber: 'huge number',
         adjective: 'adjective'
         }">

It should be noted that ng-init is not recommended for production applications. There are better ways to load data, but it is convenient for demos like this as it allows us to focus on the basics of data binding without getting into the rest of Angular.

## Data Binding ##
OK, so it's worth taking a look at the interface at this point. In this [MadLibs game]() the player types words into the form input fields and their values show up in the story below. 

![MadLibs app](/images/learning-angularjs-ngmadlibs.png)

## ng-model ##
The data entry input fields use `ng-model`, which is an Angular directive to handle *two way data binding.* This means that it will write any input directly into the data object and will display the latest value for that property in the data object. For example, here is the markup for the input field that is bound to the `femaleName` property of the `data` object.

    <div class="libInput">
        <input type="text" ng-model="data.femaleName" />
    </div>

## Binding Expressions ##
In Angular applications, your HTML templates are static and your data is dynamic. When a data value changes in the model (`data` in this case) the browser renders the updates within the template. You display the contents of the model using Angular’s binding syntax, which is a pair of curly braces around an Angular expression. Angular expressions are JavaScript-like code snippets that are placed in curly braces. For example:

	{{ expression }}

Each of the highlighted phrases in the story (above) are bound to the data model using binding expressions. For example:

	{{data.femaleName}}

## Source code and demo ##
You can see the MadLibs game in action [here](http://www.michael-whelan.net/thinkful-angular-ngMadLibs/) and you can get the source code on [GitHub](https://github.com/mwhelan/thinkful-angular-ngMadLibs). I am going to be refactoring the application as I go, so to see this iteration of the code you will want the third commit, "madlibs with basic databinding."








