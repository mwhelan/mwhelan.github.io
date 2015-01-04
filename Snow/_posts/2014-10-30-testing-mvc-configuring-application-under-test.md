---
layout: post
title: Black-Box Testing ASP.Net: Configuring Application Under Test
categories: Automated Testing, Black-Box Testing ASP.Net Series
date: 2014-10-30
comments: true
sharing: true
footer: true
permalink: /testing-mvc-configuring-application-under-test/
---

As I mentioned in the [previous post](/testing-mvc-application-with-iis-express-webdriver/), UI tests for an ASP.Net MVC application are [black-box tests](http://en.wikipedia.org/wiki/Black-box_testing) and run in a separate process from the web application, making it more difficult to control its behaviour and configuration. In this post I will continue the example from the previous post and provide some code examples of configuring an ASP.Net application at runtime to run with behaviour specified by the test code. You can see all the code from these posts on [GitHub](https://github.com/mwhelan/MvcTestingSamples). 
<!--excerpt-->

> Some of the sample code is taken straight from [Seleno](https://github.com/TestStack/TestStack.Seleno), the Selenium WebDriver browser automation framework from [TestStack](http://teststack.net/), and gives you a look under the hood at the sorts of things a UI automation framework does for you. If some of these samples are relevant to the problems you are trying to solve, I encourage you to check out Seleno. It takes care of a lot of the complex infrastructure setup of a Selenium WebDriver project for you, allowing you to get on with the important business of writing specifications for your application. I've produced a working sample on [GitHub](https://github.com/mwhelan/MvcTestingSamples), so you should be able to take it, run it, and use some of the code in your own applications if you want to.

For more of the conceptual information on this topic, Mehdi Khalili has a great post on [changing the runtime behaviour of the application under test](http://www.mehdi-khalili.com/changing-runtime-behavior-of-application-under-test) on his blog.

## Environment Variables
When you create a process to host your ASP.Net web application, you are able to pass in environment variables as key/value pairs. Your application code can then check for these variables and choose different configuration behaviour depending on the value of the variable. Mehdi sums up the benefits of this approach quite nicely:

> The beauty of this approach is that the injected environment variables are scoped and isolated to the process you run which means they won't impact other applications running on the same machine and they are forgotten as soon as the process exits. Also you can dynamically set them at runtime for each test run.

In the previous post, I did not show the code for the `WebApplication` class. This class just captures the configuration information that is passed to the `IisExpressWebServer`.

    public class WebApplication
    {
        public Dictionary<string, string> EnvironmentVariables { get; set; }

        public void AddEnvironmentVariable(string key, string value = null)
        {
            EnvironmentVariables.Add(key, value ?? string.Empty);
        }

		// other code removed for brevity
    }

So, we can modify our setup code to add an environment variable with the key of `FunctionalTests`. Note, it is not necessary to provide a `value` for the key/value pair.

    [SetUp]
    public void SetUp()
    {
        var app = new WebApplication(ProjectLocation.FromFolder("ContosoUniversity"), 12365);
        app.AddEnvironmentVariable("FunctionalTests");
        WebServer = new IisExpressWebServer(app);
        WebServer.Start();
        Browser = Browsers.Phantom;
    }

### Configuring the database connection string at runtime
In the Contoso University sample that I'm using for these posts, the `SchoolContext` gets its connection string in a standard way from the web.config, using a `ConnectionStrings` key with the same name - "SchoolContext." With a minimal tweak, it can check the `FunctionalTests` environment variable, and switch to a "SchoolContext-FunctionalTests" connection string when it finds it present - which will only be when we pass it in from the functional tests code.

	public class SchoolContext : DbContext
    {
        public SchoolContext():base(GetConnectionString())
        {
        }

        private static string GetConnectionString()
        {
            var environmentVariable = Environment.GetEnvironmentVariable("FunctionalTests");
            return environmentVariable == null 
                ? ConfigurationManager.ConnectionStrings["SchoolContext"].ConnectionString 
                : ConfigurationManager.ConnectionStrings["SchoolContext-FunctionalTests"].ConnectionString;
        }

        // code omitted for brevity
    }

### Verifying that the behaviour has been changed
You want to be really sure that the application is using the modified configuration in your tests. The first thing that you can do is just set a breakpoint in the GetConnectionString method, attach to the application process (as I illustrated in the [previous post](/testing-mvc-application-with-iis-express-webdriver/)) and step through the code to see which connection string is being used.

Here is another approach. Obviously, this is test code and not something you would want to keep in production code. Just add a controller action to the web application, somewhere out of the way...

    public ActionResult TestingEnvVariable()
    {
        var envVar = Environment.GetEnvironmentVariable("FunctionalTests");
        if (envVar == null)
            throw new Exception("Environment Variable was not injected!!");
        return RedirectToAction("Index");
    }

And then write a test that navigates to the page. If you are redirected to the home page without the exception being thrown then the environment variable has been set.

    [Test]
    public void CanInjectEnvironmentVariables()
    {
        string url = string.Format("{0}/Home/TestingEnvVariable", Host.WebServer.BaseUrl);
        Host.Browser.Navigate().GoToUrl(url);
        Host.Browser.Title.Should().Be("Home Page - Contoso University");
    }

## Configuration Transforms
The standard way to change configuration per environment in .Net is to use config transformation files. There are plenty of articles that show how to set this up in the web application, but configuring the test project to take advantage of this is not so well documented. Up until now, we have just pointed IIS Express at the web application folder. To apply web.config transforms we need to deploy the web application to a new folder with the specified transform applied, and point IIS Express to this folder instead. 

You can do this by calling msbuild, which will deploy to the specified local folder with the specified transform applied. That is the approach I will demonstrate here. In my experience, this approach can sometimes be a bit brittle , with msbuild sometimes acting differently on different machines or with different versions. An alternative to consider might be to perform the config transform yourself and use xcopy deploy to a separate folder . Microsoft have released the [XDT library on NuGet](https://www.nuget.org/packages/Microsoft.Web.Xdt/) for this purpose, though I've not had a chance to try this approach out myself yet.

    public class MsBuildDeployer
    {
        private readonly IProjectLocation _projectLocation;

        public MsBuildDeployer(IProjectLocation projectLocation)
        {
            _projectLocation = projectLocation;
        }

        public void Deploy(string configTransformName, string deployPath)
        {
            var loggers = new ILogger[] { new ConsoleLogger(LoggerVerbosity.Normal) };
            var parameters = new BuildParameters { Loggers = loggers };

            var globalProperties = new Dictionary<string, string>
	        {
	            { "Configuration", configTransformName },
                { "_PackageTempDir", deployPath }
	        };

            var requestData = new BuildRequestData(_projectLocation.ProjectName, globalProperties, null, 
                new[] { "Clean", "Package" }, null);

            var result = BuildManager.DefaultBuildManager.Build(parameters, requestData);

            if (result.OverallResult != BuildResultCode.Success || !Directory.Exists(deployPath))
            {
                throw new Exception("Build failed.");
            }
        }
    }

The deploy method takes in the config transform name, such as `Debug`, `Release`, or `Test`, and the path to the local folder to deploy the transformed application to. This is the path that IIS Express will use to host the application.

I've tried to make minimal changes to the IisExpressWebServer code so as to demonstrate both approaches. If a config transform value is passed in then the code is transformed and deployed to the specified deployment folder. If not, then it runs as before with the web application folder. 

    public void Start(string configTransform = null)
    {
        ProcessStartInfo webHostStartInfo;
        if (configTransform == null)
        {
            webHostStartInfo = InitializeIisExpress(_application);
        }
        else
        {
            var siteDeployer = new MsBuildDeployer(_application.Location);
            var deployPath = Path.Combine(Environment.CurrentDirectory, "TestSite");
            siteDeployer.Deploy(configTransform, deployPath);
            webHostStartInfo = InitializeIisExpress(_application, deployPath);
        }
        _webHostProcess = Process.Start(webHostStartInfo);
        _webHostProcess.TieLifecycleToParentProcess();
    }




