---
layout: post
title: Black-Box Testing ASP.Net: Reducing the Use of Magic Strings
categories: Automated Testing, Black-Box Testing ASP.Net Series
date: 2015-01-03
comments: true
sharing: true
footer: true
permalink: /testing-mvc-reducing-the-use-of-magic-strings/
---

Although UI tests for an ASP.Net MVC application are [black-box tests](http://en.wikipedia.org/wiki/Black-box_testing), a little bit of knowledge of the inner workings of the application can go a long way to writing less brittle, more maintainable tests. For example, we have a lot of developer techniques for avoiding the use of "magic strings" in our application code. We can take advantage of these same techniques in our tests. 
<!--excerpt-->

> Some of the sample code is taken straight from [Seleno](https://github.com/TestStack/TestStack.Seleno), the Selenium WebDriver browser automation framework from [TestStack](http://teststack.net/), and gives you a look under the hood at the sorts of things a UI automation framework does for you. If some of these samples are relevant to the problems you are trying to solve, I encourage you to check out Seleno. It takes care of a lot of the complex infrastructure setup of a Selenium WebDriver project for you, allowing you to get on with the important business of writing specifications for your application. I've produced a working sample on [GitHub](https://github.com/mwhelan/MvcTestingSamples), so you should be able to take it, run it, and use some of the code in your own applications if you want to.

Magic strings is one of those things we developers often talk about wanting to avoid, but I found it quite difficult to articulate exactly what they are. Rob Conery has a good discussion of them [here](http://rob.conery.io/2011/03/10/are-friends-immutable/). As I understand it, the problem is that you can change a string value in your code that will break your application but the code will still compile - you don't discover the issue until runtime. It is preferable to discover the break at compile time (or failing that when you run your unit tests) rather than at runtime. This can be achieved by replacing the string with something strongly typed, like a class or an enum or a resource file. You have to be careful though. Some of the reflection-based techniques are quite nice from a compilation point of view, but can have [performance implications](http://haacked.com/archive/2009/06/02/alternative-to-expressions.aspx/). Whilst this might lead you to steer clear of certain solutions in your application code - I'm thinking of strongly typed controller actions here - I think they are well worth it in UI tests, where the need for reducing brittleness is so important and the need to eek out every drop of performance is not as great as it is for your web application.

## Strongly Typed Navigation
One example of magic strings when UI testing MVC applications is page navigation. Selenium WebDriver uses a string URL to navigate. If the URL changes you have no way of knowing until you run the test and it fails. An MVC application uses routes to direct a request for a URL to the matching controller action. Your UI tests can do the same, but in reverse. Take a strongly typed controller action and lookup the route in the route table and return you the same computed URL your application recognises. This completely removes the brittleness of URLs from your tests as the URLs your tests use will always be completely in sync with those that the application is using.

Here is a test that shows the desired behaviour. `RouteConfig.RegisterRoutes()` is the method in the application that intialises its route table.

    [Test]
    public void MvcUrlHelper_should_return_correct_route_for_controller_action()
    {
        var routes = RouteConfig.RegisterRoutes(new RouteCollection());
        var sut = new MvcUrlHelper(routes);

        sut.GetRelativeUrlFor<StudentController>(x => x.Details(1))
            .Should().Be("/Student/Details/1");
    }

We call the application code to get the same route collection that is configured for the application at startup and pass it into our MvcUrlHelper class. Then we can call the GetRelativeUrlFor generic method, passing the controller as the generic type and an expression for the controller action. It then returns the relative URL that the application uses for that controller action.  

The code to achieve this is quite simple, as you would expect. Unfortunately, it does require a bit more setup than I would like. It would be nicer if this functionality was simply exposed in System.Web.Mvc (I'm using the latest v5.2.2 as at the time of writing this post).

    public class MvcUrlHelper
    {
        private readonly RouteCollection _routeCollection;

        public MvcUrlHelper(RouteCollection routeCollection)
        {
            _routeCollection = routeCollection;
        }

        public string GetRelativeUrlFor<TController>(Expression<Action<TController>> action)
            where TController : Controller
        {
            var requestContext = new RequestContext(FakeHttpContext.Root(), new RouteData());

            var actionRouteValues = Microsoft.Web.Mvc.Internal.ExpressionHelper.GetRouteValuesFromExpression(action);
            var urlHelper = new System.Web.Mvc.UrlHelper(requestContext, _routeCollection);
            var relativeUrl = urlHelper.RouteUrl(new RouteValueDictionary(actionRouteValues));

            return relativeUrl;
        }
    }

Firstly, the ExpressionHelper class, with the single GetRouteValuesFromExpression method requires the MVC5 Futures package (there is a version of this package for each version of MVC).

	Install-Package Microsoft.AspNet.Mvc.Futures -Pre

Secondly, you need to provide fake versions of a number of ASP.Net intrinsic classes. Way back in 2008, [Stephen Walther wrote](http://stephenwalther.com/archive/2008/07/01/asp-net-mvc-tip-12-faking-the-controller-context) about how you can easily test ASP.NET intrinsics by creating a standard set of fakes for the ASP.NET intrinsics. These classes have been used in a number of libraries, notably MvcContrib.TestHelper and TestStack.Seleno. You can see that I have used the `FakeHttpContext` class here, but this in turn depends on the `FakeHttpRequest`, `FakeHttpResponse`, and `FakeHttpSessionState` classes (included in the sample).

### Strongly Typed Navigation in Action
In TestStack.Seleno we don't have an MvcUrlHelper class as such. We instead utilise this behaviour in the PageNavigator class, allowing you to navigate to another page in a strongly typed fashion. Here I've added a NavigateTo method to the Host class, which provides a simplified example of the functionality. The method takes the controller action expression, navigates to the computed URL, and returns the specified page object for the new page location. Note that the MvcUrlHelper is initialised with the application routes once before all the tests run.

    [SetUpFixture]
    public class Host
    {
		...
	    private static MvcUrlHelper _mvcUrlHelper ;
	
	    [SetUp]
	    public void SetUp()
	    {
	        ...
	        _mvcUrlHelper = new MvcUrlHelper(RouteConfig.RegisterRoutes(new RouteCollection()));
	    }
	
	    public static TPage NavigateTo<TController, TPage>(Expression<Action<TController>> action)
	        where TController : Controller
	        where TPage : new()
	    {
	        string relativeUrl = _mvcUrlHelper.GetRelativeUrlFor(action);
	        string url = string.Format("{0}{1}", WebServer.BaseUrl, relativeUrl);
	        Browser.Navigate().GoToUrl(url);
	        return new TPage();
	    }
	}

And here is a test that uses strongly typed navigation

    [Test]
    public void CanNavigateToPageViaControllerAction()
    {
        var newStudentPage = Host.NavigateTo<StudentController, NewStudentPage>(x => x.Create());
        newStudentPage.Url.Should().Be(Host.WebServer.BaseUrl + "/Student/Create");
    }

Because the test now obtains the URL from an expression that is tied to the application, rather than from a string, it is less brittle and always in sync with the code. If the action name changes, or is removed, then this test won't compile, giving instant feedback that the change in the application has broken the test.

## Resource Files
Resource files represent an elegant way to centralise the use of strings in an application and have the added benefit of making them strongly typed constants, as well as the potential benefit of internationalization. There are a few caveats about how you must set them up in the application in order to be able to access them from your test assemblies. K. Scott Allen has a great overview of the problem and solution [here](http://odetocode.com/blogs/scott/archive/2009/07/16/resource-files-and-asp-net-mvc-projects.aspx).

In summary, to make resource files accessible from other assemblies:

- Don't place resource files in one of the special resource directories (`App_LocalResources` or `App_GlobalResources`).
-  In the Properties window for the resource file, make sure the `Build Action` is set to `Embedded Resource`, which embeds the resource in the web application's .dll. 
-  Also in the Properties window for the resource file, make sure the `Custom Tool` is set to `PublicResXFileCodeGenerator` instead of `ResXCodeFileGenerator`. (Alternatively, you can open the resource file and select `Public` from the `Access Modifier` dropdown). This makes the class modifier public, and thus accessible outside the assembly.

So, now I can use a resource value in the view:

	<h2><span id="title">@Resources.Student_CreateForm_Title</span></h2>

and in the tests:

    [Test]
    public void CanAccessResourceFilesFromTests()
    {
        var newStudentPage = Host.NavigateTo<StudentController, NewStudentPage>(x => x.Create());
        newStudentPage.HeaderTitle.Should().Be(Resources.Student_CreateForm_Title);
    }

Because the test now just references the constant value it is less brittle. Any changes to the resource file are immediately reflected in the test and don't cause it to break.


## Static Constant Classes
Sometimes it can be useful to embed information in the application page that is just for the purpose of making testing easier. The MVC in Action series of books provide the example of a well-known hidden input on each page that provides a unique page identifier.

	<input type="hidden" name="pageId" value="@LocalSiteMap.Pages.Student.Create" />

You can then create a static class that exposes the site structure as a hierarchical model of constants.

    public static class LocalSiteMap
    {
        public static class Pages
        {
            public static class Student
            {
                public static readonly string Create = "studentCreate";
                public static readonly string Delete = "studentDelete";
                public static readonly string Details = "studentDetails";
                public static readonly string Edit = "studentEdit";
                public static readonly string Index = "studentIndex";
            }
        }
    }

Because this identifier is agreed to be on every page, you can add a property to your base page object to read it:

    public string PageId
    {
        get
        {
            return Host.Browser.FindElement(By.Id("pageId")).Text;
        }
    }

And then use that property to assert which page you are on in tests in a strongly typed manner. 

    [Test]
    public void CanIdentifyPageWithHiddenIdentifier()
    {
        var newStudentPage = Host.NavigateTo<StudentController, NewStudentPage>(x => x.Create());
        newStudentPage.PageId.Should().Be(LocalSiteMap.Pages.Student.Create);
    }

Again, any changes to the constant value in the static class are reflected in both the application and the tests without breaking the tests.

