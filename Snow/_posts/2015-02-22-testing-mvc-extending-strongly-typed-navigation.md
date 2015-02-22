---
layout: post
title: Black-Box Testing ASP.Net: Extending Strongly Typed Navigation
categories: Automated Testing, Black-Box Testing ASP.Net Series
date: 2015-02-22
comments: true
sharing: true
footer: true
permalink: /extending-strongly-typed-navigation/
---

In a [previous post](/testing-mvc-reducing-use-of-magic-strings/) in this series, on reducing the use of magic strings, I showed a helper class for creating strongly typed navigation. This lets you derive a URL from a strongly typed controller action by looking up the route in the route table and returning you the same computed URL your application recognises.
<!--excerpt-->

Here is a test that illustrates the behaviour. This is a standard situation where the URL simply contains the controller and the action, as well as the ID as a route argument. `RouteConfig.RegisterRoutes()` is the method in the application that intialises its route table.

	[Test]
	public void MvcUrlHelper_should_return_correct_route_for_controller_action()
	{
	    var routes = RouteConfig.RegisterRoutes(new RouteCollection());
	    var sut = new MvcUrlHelper(routes);
	
	    sut.GetRelativeUrlFor<StudentController>(x => x.Details(1))
	        .Should().Be("/Student/Details/1");
	}

Recently, I've had a couple of reasons to extend this class. Firstly, I've been testing applications that use Areas. Secondly, I've needed to be able to pass in additional route values.

I will start off with the final class and then discuss the additional behaviour:

	public class MvcUrlHelper
    {
        private readonly RouteCollection routeCollection;

        public MvcUrlHelper(RouteCollection routeCollection)
        {
            this.routeCollection = routeCollection;
        }

        public string GetRelativeUrlFor<TController>(Expression<Action<TController>> action, IDictionary<string, object> routeValues = null)
            where TController : Controller
        {
            var requestContext = new RequestContext(FakeHttpContext.Root(), new RouteData());

            // Get controller and action values
            var actionRouteValues = Microsoft.Web.Mvc.Internal.ExpressionHelper.GetRouteValuesFromExpression(action);
            
            var area = GetArea(typeof(TController));
            if (!string.IsNullOrEmpty(area))
            {
                actionRouteValues.Add("Area", area);
            }

            if (routeValues != null)
            {
                foreach (var v in routeValues) actionRouteValues[v.Key] = v.Value;
            }

            var urlHelper = new UrlHelper(requestContext, this.routeCollection);
            var relativeUrl = urlHelper.RouteUrl(new RouteValueDictionary(actionRouteValues));

            return relativeUrl;
        }

        private static string GetArea(Type controllerType)
        {
            var routeAreaAttributes = controllerType.GetCustomAttributes(typeof(RouteAreaAttribute), true);
            if (routeAreaAttributes.Length > 0)
            {
                var routeArea = (RouteAreaAttribute)(routeAreaAttributes[0]);
                return routeArea.AreaName;
            }

            var nameSpace = controllerType.Namespace;
            if (nameSpace == null)
            {
                return string.Empty;
            }

            const string AreasStartSearchString = "Areas.";
            var areasIndexOf = nameSpace.IndexOf(AreasStartSearchString, StringComparison.Ordinal);
            if (areasIndexOf < 0)
            {
                return string.Empty;
            }

            var areaStart = areasIndexOf + AreasStartSearchString.Length;
            var areaString = nameSpace.Substring(areaStart);
            if (areaString.Contains("."))
            {
                areaString = areaString.Remove(areaString.IndexOf(".", StringComparison.Ordinal));
            }

            return areaString;
        }
    }

## Areas
The MVC5 Futures `ExpressionHelper` class does not return the area in the URL (unless you use its Area attribute). Here is the test that illustrates the behaviour I want, where University is the Area and Student the controller. 

    [TestMethod]
    public void should_return_area_in_url()
    {
	    var routes = RouteConfig.RegisterRoutes(new RouteCollection());
	    var sut = new MvcUrlHelper(routes);
        var result = sut.GetRelativeUrlFor<StudentController>(c => c.Create());
		result.ShouldBe("/University/Student/Create");
    }

The `GetArea` method tries to find area information by interrogating the controller type. Firstly, it looks for a `RouteAreaAttribute` on the class. Secondly, it looks at the namespace to see if it is in the standard Areas namespace, and extracts the Area from the namespace if it is. If this method returns an area then it is added to the actionRouteValues `RouteValueDictionary`.

## Additional Route Values    
Sometimes, you must provide additional route values that the `UrlHelper` class requires to construct a URL. This test shows the adding of an `application` route value, with a value of `Books`, which is used in the URL.

    [TestMethod]
    public void should_return_application_in_url()
    {
        var sut = new MvcUrlHelper(new RouteRegistrator().RegisterRoutes());
        var application = new Dictionary<string, object> { { "application", "Books" } };
        var result = sut.GetRelativeUrlFor<CollectionsController>(c => c.Details(23), application);
        Assert.AreEqual("/Editorial/Applications/Books/Collections/Details?collectionId=23", result);
    }

These additional values are used by UrlHelper in the creation of the full URL to make the test pass.