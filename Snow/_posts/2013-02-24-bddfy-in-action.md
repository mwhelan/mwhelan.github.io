---
layout: post
title: BDDfy In Action
categories: TestStack, BDDfy
description: Introduction to the series of posts about the BDDfy BDD framework, continuing Mehdi Khalili's BDDfy In Action series.
date: 2013-02-24
comments: true
sharing: true
footer: true
permalink: /bddfy-in-action/
---

This is a series of posts about [BDDfy](http://teststack.github.com/pages/BDDfy.html), the Behaviour Driven Development framework from [TestStack](http://teststack.github.com/). This series of posts builds on and continues the series of articles by the BDDfy creator, [Mehdi Khalili](http://www.mehdi-khalili.com/about), and shows 'BDDfy In Action.' I am a contributor on the project.
<!--excerpt-->

Mehdi has already written the following posts:

##Using BDDfy

* [Introducing BDDfy](http://www.mehdi-khalili.com/bddify-in-action/introduction) 
* [Using Method Name Conventions](http://www.mehdi-khalili.com/bddify-in-action/method-name-conventions)
* [Writing stories](http://www.mehdi-khalili.com/bddify-in-action/story)
* [Using Executable Attributes](http://www.mehdi-khalili.com/bddify-in-action/executable-attributes)
* [Using the Fluent API](http://www.mehdi-khalili.com/bddify-in-action/fluent-api)
* [Input parameters in the Fluent API](http://www.mehdi-khalili.com/bddify-in-action/fluent-api)
* Mix and match them all

I am going to continue the series with one more post in the 'Using BDDfy' section:

* [BDDfy Reports](/bddfy-reports/): An overview of the reports in BDDfy and basic configuration.


Then I am going to move on to a series of posts on customizing and extending BDDfy.

##Customizing and Extending BDDfy
* [BDDfy architecture overview](/bddfy-architecture-overview/): A look at the main components of the BDDfy architecture to provide some context for customizing and extending BDDfy and to illustrate the extensibility points
* [Customizing and Extending BDDfy Reports](/custom-reports): Customizing the HTML Report and creating your own reports
* [Case Study - Rolling your own testing framework](/roll-your-own-testing-framework/): A sample application demonstrating how you can replace whole pieces of the BDDfy framework to customize it to your own needs. This will include
 * Create a new MethodNameStepScanner to replace the BDDfy Given When Then grammar with a different grammar of EstablishContext, BecauseOf, ItShould. 
 * Make BDDfy work with Story classes rather than Story attributes.
 * Plug in a new StoryMetaDataScanner
 * Customize the HTML Report
 * Run BDDfy tests in a console application without any test framework or test runner.
* [Case Study - Rolling your own testing framework (2)](/roll-your-own-testing-framework-2/): Adding parallel testing to the custom framework.
* Using BDDfy in a Class per Scenario style for full system tests: Using BDDfy with an inversion of control container.
* [Using BDDfy in a Class per Scenario style for unit tests](/using-bddfy-for-unit-tests): Using BDDfy with an auto-mocking container.