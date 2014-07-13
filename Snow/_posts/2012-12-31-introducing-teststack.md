---
layout: post
title: Introducing TestStack
categories: TestStack
description: Introducing the TestStack GitHub organisation
date: 2012-12-31
comments: true
sharing: true
footer: true
permalink: /introducing-teststack/
---

[TestStack](http://teststack.net/) is a collection of open source projects which mainly focus on making the left side of Marrick’s agile testing quadrant easier!

Early last year, [Mehdi Khalili](https://twitter.com/MehdiKhalili) created [BDDfy](http://teststack.github.com/TestStack.BDDfy/) (then called bddify), a simple yet powerful and extensible BDD framework for .Net. I became a very active user of BDDfy, and eventually a contributor. This year Mehdi and I decided to setup a new open source project for automated UI testing with Selenium, called Seleno, and a GitHub organisation, TestStack, for the two projects. Since then, we have been joined by [Krzysztof Kozmic](https://twitter.com/kkozmic), [Jake Ginnivan](https://twitter.com/JakeGinnivan) and [Rob Moore](https://twitter.com/robdmoore). 
<!--excerpt-->

[TestStack](http://teststack.net/) is a collection of open source projects which mainly focus on making the left side of Marrick’s agile testing quadrant easier!

Early last year, [Mehdi Khalili](https://twitter.com/MehdiKhalili) created [BDDfy](http://teststack.github.com/TestStack.BDDfy/) (then called bddify), a simple yet powerful and extensible BDD framework for .Net. I became a very active user of BDDfy, and eventually a contributor. This year Mehdi and I decided to setup a new open source project for automated UI testing with Selenium, called Seleno, and a GitHub organisation, TestStack, for the two projects. Since then, we have been joined by [Krzysztof Kozmic](https://twitter.com/kkozmic), [Jake Ginnivan](https://twitter.com/JakeGinnivan) and [Rob Moore](https://twitter.com/robdmoore). 

## What are the Agile Testing Quadrants? ##
I first learned about Brian Marrick’s agile testing quadrants (pictured below) when I read [Agile Testing](http://www.amazon.com/Agile-Testing-Practical-Addison-Wesley-Signature/dp/0321534468/ref=pd_ts_b_2?ie=UTF8&s=books), by Lisa Crispin and Janet Gregory. I was just getting into acceptance testing and Domain Driven Design at the time, so it really made a lot of sense. The tests on the right, the ones that “critique the product,” are what you might consider the traditional testing that testers have done after a feature is developed.

![alt text][1]

TestStack is focused on the tests on the left (Q1 and Q2). These tests support the agile team and are the ones that I am familiar with as a developer (or should I say as part of The Three Amigos/Triad?) They are test first, promoting the “testing as design” mindset, and tend to be automated. Things like unit and integration tests, acceptance tests, and UI tests and methodologies like Behaviour Driven Development and Acceptance Test Driven Development.

Quadrant 1 has unit tests and component tests (or integration tests as I prefer to call them) which are the tests written by developers, usually(?) following TDD, to test whether the system does what they intended it to do. These tests tell you that your code is technically correct and that you are “doing things right.” 

Quadrant 2 tests tells you that you are “doing the right thing”, meaning you are actually building what the customer wants. Tests in this quadrant attempt to solve the biggest problem in software development – communication - so that the customer, testers and developers can agree on what will be built. They are functional tests, consisting mainly of story-level acceptance tests that the teams use to validate that each story works the way the customer intended. When developers automate the acceptance tests they become executable specifications, which is expressing requirements such that they are also tests. The benefits of executable specifications are that they are meaningful to all interested parties, they unambiguously demonstrate if the requirement is met, and they drive out a testable application design. They help the developer know where to start testing and when they are finished, and keep them on track to only implement the required functionality. They also provide a form of living documentation, such as the BDDfy report below, where the documentation is always in sync with the code.

![alt text][2]

## TestStack Projects ##

TestStack provides a number of projects that help with automated testing that supports the team:

###BDDfy ###
The framework is called [BDDfy](http://teststack.github.com/TestStack.BDDfy/) because it BDDfies (as in turns into BDD) your otherwise traditional unit tests. Pronounced B D Defy, it is very simple to turn your AAA tests into a BDD test/behavior. BDDfy can work with any and all testing frameworks. In fact, it works even if you are not using any testing framework.

###Seleno
[Seleno](http://teststack.github.com/TestStack.Seleno/) helps you to write automated UI tests in the right way by implementing Page Objects and Page Components and by reading and writing web page data using strongly typed view models. It uses Selenium for browser automation.

###Convention Tests
Convention over Configuration is a great way to cut down repetitive boilerplate code. But how do you validate that your code adheres to your conventions? [ConventionTests](http://teststack.github.com/ConventionTests/) is a code-only NuGet that provides a simple API to build validation rules for convention validation tests. 

###White
[White](https://github.com/TestStack/White) is a framework for automating rich client applications based on Win32, WinForms, WPF, Silverlight and SWT (Java) platforms. It is .NET based and does not require the use of any proprietary scripting languages. Tests/automation programs using White can be written with whatever .NET language, IDE and tools you are already using. White provides a consistent object-oriented API, hiding the complexity of Microsoft's UI Automation library (on which White is based) and windows messages

###Fluent MVC Testing
This library provides a fluent interface for creating terse and expressive tests against ASP.NET MVC controllers. The motivation behind this library is to provide a way to test MVC actions quickly and maintainably. 

##We're here to help!
I would encourage you to check us out on our website and download the code from github and try it out. Get in touch with us on twitter or email if you have any issues or questions about the projects or agile testing in general. We love this stuff and are happy to help!


  [1]: /images/AgileTestingQuadrants.png
  [2]: /images/bddfy_rocks.png