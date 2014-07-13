---
layout: post
title: Getting started with Seleno
categories: TestStack, Seleno
description: Installing and configuring Seleno
date: 2013-05-06
comments: true
sharing: true
footer: true
permalink: /getting-started-with-seleno/
---

Seleno is an open source project from TestStack which helps you write automated UI tests with Selenium. It focuses on the use of [Page Objects](https://code.google.com/p/selenium/wiki/PageObjects) and Page Components and by reading from and writing to web pages using strongly typed view models. This post is a brief overview of what you need to know to get started using Seleno.
<!--excerpt-->

## Configuration ##
The simplest possible configuration to start using Seleno is just one line. If you are using an ASP.NET web application within the same solution as your test project then all Seleno needs to know is the name of the web project to test and the port number to run it on. You need to provide it with this information before you run any Seleno tests so, if you were using NUnit, for example, you might configure Seleno in the SetUpFixture.

    [SetUpFixture]
    public class AssemblySetupFixture
    {
    	[SetUp]
	    public void SetUp()
	    {
	    	SelenoHost.Run("TestStack.Seleno.Samples.Movies", 19456);
	    }
    }

This will deploy your web application with IIS Express and open up FireFox to run your tests. It will unload the browser and web server when the application domain unloads. We have plans to allow you to exert more control over the lifetime of Seleno, but for now this is fixed - if this is really important to you then please create an issue on the [Github site](https://github.com/TestStack/TestStack.Seleno/issues).

By default, Seleno uses:

- FireFox for the web browser
- IIS Express for the web server
- No logger
- No camera for taking screenshots

If you want to change these defaults, you can use a fluent configuration to override them. For example, if you wanted to use Chrome instead of Firefox (the default) and to log messages to the console, you could write:

    SelenoHost.Run("TestStack.Seleno.Samples.Movies", 19456,
	    configure => configure
		    .WithRemoteWebDriver(BrowserFactory.Chrome)
		    .UsingLoggerFactory(new ConsoleFactory())
    );

> Note: To use the Chrome WebDriver you also need to download [ChromeDriver.exe](https://code.google.com/p/selenium/wiki/ChromeDriver) and make sure it is in your bin directory when you run your tests.

There are more things that you can configure too. The original use case for Seleno was to test Visual Studio web projects for ASP.Net and ASP.Net MVC and it defaults to doing this with IIS Express. Seleno attempts to be modular and easy to customise though, so to test any website instead is just a matter of swapping out the IisExpressWebServer for the InternetWebServer. For example, to test Google UK:

    SelenoHost.Run(configure => configure
    	.WithWebServer(new InternetWebServer("www.google.co.uk")));

## Page Objects ##
Seleno supports the idea of [Page Objects](https://code.google.com/p/selenium/wiki/PageObjects) to model your web pages. The idea is to model each page (or part of a page) as a class, and then to use instances of those classes in your tests. To continue, with the google example, we're all familiar with this page.

![Google search](/images/google.png)

In Seleno, you would model this page by inheriting from the Page class and then encapsulating the interaction with the page within methods. Seleno provides methods to find elements on the page (Find) and enter data into the text box (SendKeys). The Navigate method allows you to navigate to the results page by clicking on the Search button (btnG).

    public class SearchPage : Page
    {
        public SearchPage InputSearchTerm(string term)
        {
            Find()
                .Element(By.Name("q"))
                .SendKeys(term);
            return this;
        }

        public ResultsPage Search()
        {
            return Navigate().To<ResultsPage>(By.Name("btnG"));
        }
    }

    public class ResultsPage : Page
    {
        ...
    }

Now your tests can just call methods on the Page Objects, without having to know anything about the interaction with the page or the use of Selenium.

    [SetUpFixture]
    public class AssemblySetUpFixture
    {
        [SetUp]
        public void SetUp()
        {
            SelenoHost.Run(configure => configure
                .WithWebServer(new InternetWebServer("http://www.google.co.uk")));
        }
    }

    [TestFixture]
    public class GoogleSearchTests
    {
        [Test]
        public void should_be_able_to_search()
        {
            var searchPage = SelenoHost.NavigateToInitialPage<SearchPage>();
            var resultsPage = searchPage
                .InputSearchTerm("BDDfy")
                .Search();
            resultsPage.Title.Should().Be("Google");
        }
    }


### Strongly Typed Page Objects ###
That's quite nice, but things start to get really interesting if you use view models. Seleno also provides strongly typed Page Objects, which allow you to read from and write to the page. Here is an example, from the Seleno MvcMusicStore sample. Because Seleno is aware of the RegisterModel view model, it is able to take a populated instance of that model and enter the information into the web page using the Input().Model method.

    public class RegisterModel
    {
        public string UserName { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
        public string ConfirmPassword { get; set; }
    }

    public class RegisterPage : Page<RegisterModel>
    {
        public HomePage CreateValidUser(RegisterModel model)
        {
            Input().Model(model);
            return Navigate().To<HomePage>(By.CssSelector("input[type='submit']"));
        }
    }

This can then be used in a test, with a populated model generated by the CreateRegisterModel of the [ObjectMother](http://martinfowler.com/bliki/ObjectMother.html).

    public class StronglyTypedPageObjectWithComponent
    {
        [Test]
        public void Can_buy_an_Album_when_registered()
        {
            var orderedPage = SelenoHost.NavigateToInitialPage<HomeController, HomePage>(x => x.Index())
                .Menu
                .GoToAdminForAnonymousUser()
                .GoToRegisterPage()
                .CreateValidUser(ObjectMother.CreateRegisterModel())
                .GenreMenu
                .SelectGenreByName("Disco")
                .SelectAlbumByName("Le Freak")
                .AddAlbumToCart()
                .Checkout()
                .SubmitShippingInfo(ObjectMother.CreateShippingInfo(), "Free");

            orderedPage.Title.Should().Be("Checkout Complete");
        }
    }

## Actions and Locators ##
Page Objects tend to either perform actions or find items on the page. Seleno Page Objects provide a number of Actions and Locators that you can use.

### Actions ###
#### Navigator ####
Used to perform actions that take you to another page, such as clicking a button or a link, or navigating to a URL. There is a strongly typed option to navigate with a controller expression using routing. Page Objects expose the Navigator class with the Navigate() method.

    Navigate().To<RegisterPage>(By.LinkText("Register"));

#### Page Reader ####
Read values from the page using view model based strongly typed methods. Page Objects that extend `Page<T>`expose the Page Reader class with the Read() method. For example, to read all fields into a new instance of the current model type (`T`) in a page you can use the `ModelFromPage` method:

    var model = Read().ModelFromPage();

Read() is currently only available with the generically-typed page object for now, but if you want this functionality with non-generic page objects (by instead supplying strings for the id) then to add an issue to our Github site so we can prioritise it.

#### Page Writer ####
Write values to the page using view model based strongly typed methods. Page Objects that extend `Page<T>`expose the Page Writer class with the Input() method. For example, to write all fields from a model of the current type (`T`) from the form on a page you can use the `Model` method:

    Input().Model(modelInstanceToFillInFormUsing);

Input() is currently only available with the generically-typed page object for now, but if you want this functionality with non-generic page objects (by instead supplying strings for the id) then to add an issue to our Github site so we can prioritise it.

#### Script Executor ####
If none of the above meet your needs then you have the ultimate control by executing JavaScript with the Script Executor class. Page Objects expose the Script Executor class with the Execute() method.

    return Execute().ScriptAndReturn<TReturn>(string.Format("$('#{0}').attr('{1}')",Id,attributeName));

### Locators ###
#### Element Finder ####
Finds Selenium IWebElement items on the page, using the Selenium By selectors or the Seleno jQuery selectors. Page Objects expose the Element Finder class with the Find() method.

    var selector = string.Format("$('#{0} option:selected')", Id);
    return Find().Element(By.jQuery(selector), WaitInSecondsUntilElementAvailable);

## Navigation ##
A great way to slow down your tests is to start each test on the home page and then navigate to the page you want to test! It's much better to navigate directly to the page that you want to test. You can do this by calling the NavigateToInitialPage method on SelenoHost and passing in the *relative* URL (to the root of the site being tested).

    var page = SelenoHost.NavigateToInitialPage<RegisterPage>("/Account/Register");

In addition, if you are using ASP.NET MVC then you can also use strongly typed controller action expressions to navigate to the page via routing. 

    var page = SelenoHost.NavigateToInitialPage<AccountController, RegisterPage>(x => x.Register());

If you are using these MVC expressions, just remember to register the application routes when you are initializing Seleno.

    SelenoHost.Run("MvcMusicStore", 12345);
    MvcApplication.RegisterRoutes(RouteTable.Routes); 

## Find out more ##
You can get the latest version of Seleno on [NuGet](http://www.nuget.org/packages/TestStack.Seleno/), or check out our [github repository](https://github.com/TestStack/TestStack.Seleno) for the latest source code. 