---
layout: post
title: Automated UI Testing Done Right
categories: TestStack, Seleno
description: The video of Mehdi Khalili's DDD 2012 talk, "Automated UI Testing Done Right" has been released.
date: 2013-06-06
comments: true
sharing: true
footer: true
permalink: /automated-ui-testing-done-right/
---

It's coming up to a year since Mehdi Khalili and I started the [Seleno](http://teststack.net/pages/Seleno.html) open source project, a framework to help you write automated web UI tests in the "right way."

About that time, Mehdi presented a session at DDD Sydney 2012 titled "[Automated UI Testing Done Right!](http://lanyrd.com/2012/dddsydney/strqy/)" In it, he shared a lot of the ideas that have gone into Seleno. Mehdi is a great teacher and his strength is taking complex topics and explaining them in a way that is simple and easy to understand. The video of the presentation has recently been published on the SSW TV website and I highly recommend that you [check it out](http://tv.ssw.com/3444/ddd-sydney-2012-mehdi-khalili-automated-ui-testing-done-right). You can also see the slides from the talk [here](http://www.slideshare.net/MehdiKhalili/automated-ui-testing-done-right-13493067).
<!--excerpt-->

It's coming up to a year since Mehdi Khalili and I started the [Seleno](http://teststack.net/pages/Seleno.html) open source project, a framework to help you write automated web UI tests in the "right way."

About that time, Mehdi presented a session at DDD Sydney 2012 titled "[Automated UI Testing Done Right!](http://lanyrd.com/2012/dddsydney/strqy/)" In it, he shared a lot of the ideas that have gone into Seleno. Mehdi is a great teacher and his strength is taking complex topics and explaining them in a way that is simple and easy to understand. The video of the presentation has recently been published on the SSW TV website and I highly recommend that you [check it out](http://tv.ssw.com/3444/ddd-sydney-2012-mehdi-khalili-automated-ui-testing-done-right). You can also see the slides from the talk [here](http://www.slideshare.net/MehdiKhalili/automated-ui-testing-done-right-13493067).

In the video, Mehdi talks about some of the patterns that you can use to improve the maintainability of your UI tests. He starts off with this horribly brittle test

	// much of the code has been removed for brevity
	public void Can_buy_an_Album_when_registered()
	{
	    _driver.Navigate().GoToUrl(Application.HomePage.Url);
	    _driver.FindElement(By.LinkText("Disco")).Click();
	    _driver.FindElement(By.CssSelector("img[alt=\"Le Freak\"]")).Click();
	    _driver.FindElement(By.LinkText("Add to cart")).Click();
	    _driver.FindElement(By.LinkText("Checkout >>")).Click();
	    _driver.FindElement(By.Id("FirstName")).Clear();
	    _driver.FindElement(By.Id("FirstName")).SendKeys("Homer");
	    _driver.FindElement(By.Id("LastName")).Clear();
	    _driver.FindElement(By.Id("LastName")).SendKeys("Simpson");
	    _driver.FindElement(By.Id("Address")).Clear();
	    _driver.FindElement(By.Id("Address")).SendKeys("742 Evergreen Terrace");
	    _driver.FindElement(By.Id("City")).Clear();
	    _driver.FindElement(By.Id("City")).SendKeys("Springfield");
	    _driver.FindElement(By.Id("State")).Clear();
	    _driver.FindElement(By.Id("State")).SendKeys("Kentucky");
	    _driver.FindElement(By.Id("Email")).Clear();
	    _driver.FindElement(By.Id("Email")).SendKeys("chunkylover53@aol.com");
	    _driver.FindElement(By.Id("PromoCode")).Clear();
	    _driver.FindElement(By.Id("PromoCode")).SendKeys("FREE");
	    _driver.FindElement(By.CssSelector("input[type=\"submit\"]")).Click();
	
	    Assert.IsTrue(_driver.PageSource.Contains("Checkout Complete"));
	}

and evolves it into this more maintainable test in three steps:

	public void Can_buy_an_Album_when_registered()
	{
	    var orderedPage = Application
	        .HomePage
	        .Menu
	        .GoToAdminForAnonymousUser()
	        .GoToRegisterPage()
	        .CreateValidUser(ObjectMother.ValidUser)
	        .GenreMenu
	        .SelectGenreByName("Disco")
	        .SelectAlbumByName("Le Freak")
	        .AddAlbumToCart()
	        .Checkout()
	        .SubmitShippingInfo(ObjectMother.ShippingInfo, "Free");
	
	    orderedPage.Title.Should().Be("Checkout Complete");
	}

Although Mehdi uses Seleno, BDDfy and Selenium in the talk, it is worth noting that the ideas, patterns and tips are not related to any particular testing frameworks. The samples used are taken directly from the [Seleno samples code](https://github.com/TestStack/TestStack.Seleno/tree/master/src/Samples/MusicStore) though, so I would encourage you to check out Seleno (and [BDDfy](http://teststack.net/pages/BDDfy.html)) if you like the ideas presented in the talk. The samples are structured in a way to make it easy to read and follow and you should be able to easily compare the steps to see how each step improves the tests.

I intend to blog more about Seleno soon, but in the meantime you might also find these posts helpful:

- [Getting started with Seleno](getting-started-with-seleno)
- [Seleno 0.4 Released](seleno-04/)

Any ideas, comments, feedback and suggestions about Seleno and BDDfy are welcome.