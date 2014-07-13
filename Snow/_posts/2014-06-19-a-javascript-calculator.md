---
layout: post
title: A JavaScript Calculator
categories: Learning
image: images/sswtvthumb.jpg
date: 2014-06-19 18:00:00
comments: true
sharing: true
footer: true
permalink: /a-javascript-calculator/
---

---excerpt
Before getting into any AngularJS, the first project on Thinkful's Angular course is to create a JavaScript calculator to review front end basics with HTML, CSS and JavaScript. It provides some interesting challenges. You can see my working version [here](http://www.michael-whelan.net/thinkful-angular-adder-subtractor/). The source code is also on [GitHub](https://github.com/mwhelan/thinkful-angular-adder-subtractor). 
---end

**This article is part of a series on [Learning AngularJS](/learning-angularjs).**

Before getting into any AngularJS, the first project on Thinkful's Angular course is to create a JavaScript calculator to review front end basics with HTML, CSS and JavaScript. It provides some interesting challenges. You can see my working version [here](http://www.michael-whelan.net/thinkful-angular-adder-subtractor/). The source code is also on [GitHub](https://github.com/mwhelan/thinkful-angular-adder-subtractor). 

![JavaScript calculator](/images/learning-angularjs-adder-subtractor.png)

I am tending to build all of my applications with Twitter Bootstrap at the moment. I really like how easy it is to put together reasonable looking applications quite quickly.

## Field Validation ##
The application requires that users can only enter integers. There are a number of ways to achieve this and I've tried different approaches on different projects. You can write a JavaScript function, or use the HTML5 number input type, to pop up an alert if the user does not enter the right value. Alerts are not a very nice user experience though, and the HTML5 one is particularly ugly.

For this project I thought I would try the [jQuery validation plugin](http://jqueryvalidation.org/). This performs client-side validation on the form as the user leaves each control, preventing form submit if it is invalid, which I think makes for a better user experience. Alternatively, if you write code that is not in the submit event you can check if the form is valid by calling the [valid method](http://jqueryvalidation.org/valid/) on the form (see the examples below).

The jQuery Validation plugin is very easy to setup. You simply call the `validate()` method on the form during page initialisation and use the input fields' names to specify rules and messages. Alternatively, you can specify rules as attributes on the field if you prefer. 

In the example below, I am providing validation rules for two input fields named `inputX` and `inputY`.

	function setupFormValidation() {
	    $("#convertForm").validate({
	        rules: {
	            inputX: {
	                required: true,
	                digits: true
	            },
	            inputY: {
	                required: true,
	                digits: true
	            }
	        },
	        messages: {
	            inputX: "Please enter an integer for X",
	            inputY: "Please enter an integer for Y"
	        },
	        highlight: function (element) {
	            $(element).closest('.form-group').addClass('has-error');
	        },
	        unhighlight: function (element) {
	            $(element).closest('.form-group').removeClass('has-error');
	        }
	    });
	}

In this case, the digits rule will ensure the user can only enter integers. The plugin provides pretty basic styling, but it is easy enough to add your own styles. I am using Twitter Bootstrap so I just need to add the highlight and unhighlight functions (as in the code above). The `highlight` function is called when a validation error occurs, and I add the Twitter Bootstrap `has-error` CSS class to that control's form group. The `unhighlight` function is called when the user corrects the error, and that simply removes the CSS class.

![JavaScript calculator](/images/learning-angularjs-adder-subtractor-validation.png)

## Data Binding ##
One of the things I'm looking forward to with Angular is its two way data binding. With plain old JavaScript though, there are a lot of options for reading and writing form field data and it's hard to know which is the most elegant. I'm only having to read data from the fields here but I still wanted to encapsulate this logic in one place. The first approach I took was to create a "class" that encapsulates all of the calculator logic in one place and is able to read the data from the form itself. 

	function Calculator() {
	    this.x = parseInt($("#inputX").val());
	    this.y = parseInt($("#inputY").val());
	
	    this.plus = function () {
	        return this.x + this.y;
	    };
	    this.minus = function () {
	        return this.x - this.y;
	    };
	}

I don't really like it though, to be honest. While it does hide away the reading of data, it is too tightly bound to the UI and that would seem to make it a real pain to test. So, instead I have gone for a plain old class that receives its parameters in the constructor. This would be very easy to test - just pass in the data, call the method I'm interested in, and inspect the result. The app can create the calculator with a  factory function, `createCalculator()`, which provides sufficient encapsulation for the reading of the form data.


	function Calculator(x, y) {
	    this.x = x;
	    this.y = y;
	    this.plus = function () {
	        return x + y;
	    };
	    this.minus = function () {
	        return x - y;
	    };
	}

	function createCalculator() {
	    var x = parseInt($("#inputX").val());
	    var y = parseInt($("#inputY").val());
	    return new Calculator(x, y);
	}

## Event Handling ##
In my first pass, I just coded the plus and minus button clicks separately. 

    $("#plus").click(function (event) {
		if (("#convertForm").valid()) {
	        var calculator = createCalculator();
	        var result = calculator.add();
	        var message = "X plus Y is " + result;
	        $("#result").text(message);
		}
    });

    $("#minus").click(function (event) {
		if (("#convertForm").valid()) {
	        var calculator = createCalculator();
	        var result = calculator.subtract();
	        var message = "X minus Y is " + result;
	        $("#result").text(message);
		}
    });

There is pretty obvious duplication though. My first refactoring was just to move the common code into a calculate method and pass in the operation - "plus" or "minus".

    $("#plus").click(function (event) {
		calculate("plus");
    });

    $("#minus").click(function (event) {
		calculate("minus");
    });

	function calculate( operation) {
		if (("#convertForm").valid()) {
		    var calculator = createCalculator();
		    var result = calculator[operation]();
		    var message = calculator.x + " " + operation + " " + calculator.y + " is " + result;
		    $("#result").text(message);
		}
	}

The cool thing about JavaScript is that you can call methods on objects using bracket notation, as you can see with the call to `calculator[operation]()` above. So, the same value can be used as a string in message, and as a function pointer. That's not something you can do in C#!

There is still one more improvement to do though - at least one that I can see, there are probably more! :-) In JavaScript, I only need one event handler for all of the buttons. I can name each button the same as the operation ("plus" and "minus") and then retrieve that name value with `event.target.name` to pass into the function as the operation parameter.

    $("button").on("click", function (event) {
    	calculate(event.target.name);
    });

I'm pretty happy with that, but please do let me know if there are better ways of doing things!