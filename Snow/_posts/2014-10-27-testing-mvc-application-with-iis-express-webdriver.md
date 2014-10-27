---
layout: post
title: Testing ASP.Net MVC with IIS Express and Selenium WebDriver
categories: Automated Testing
date: 2014-10-27
comments: true
sharing: true
footer: true
permalink: /testing-mvc-with-iis-express-webdriver/
---

In the next couple of posts I am going to look at some of the practical aspects of performing black box testing of ASP.Net web applications with Selenium WebDriver. Most types of Visual Studio tests conveniently run in the same process as the code they are testing - the System Under Test (SUT). These are [white box tests](http://en.wikipedia.org/wiki/White-box_testing), making it straightforward to change the behaviour and configuration of the SUT. [Black box tests](http://en.wikipedia.org/wiki/Black-box_testing), such as UI tests, run in a separate process from the SUT, creating additional complexities for controlling its behaviour and configuration.  

In these posts, I'm going to focus less on concepts and more on the code. I've produced a working sample on [GitHub](https://github.com/mwhelan/MvcTestingSamples), so you should be able to take it, run it, and use some of the code in your own applications if you want to. Some of the code is taken straight from [Seleno](https://github.com/TestStack/TestStack.Seleno), the Selenium WebDriver browser automation framework from [TestStack](http://teststack.net/), and gives you a look under the hood at the sorts of things a UI automation framework does for you. If some of these samples are relevant to the problems you are trying to solve, I encourage you to check out Seleno. It takes care of a lot of the complex infrastructure setup of a Selenium WebDriver project for you, allowing you to get on with the important business of writing specifications for your application.
<!--excerpt-->

## Managing the AppDomain
One thing I try to avoid with UI tests is creating a new WebDriver instance for every test or test fixture. This is a time consuming operation and I find it is best to perform slow, expensive operations once before any tests run, then clean up after all of the tests have run. NUnit, which I'm using in these examples, provides the SetUpFixture for this purpose. (You can achieve the same effect in xUnit, and other frameworks that don't provide this feature, by using a static constructor in a base class, and subscribing to the AppDomain DomainUnload event).

    [SetUpFixture]
    public class Host
    {
        public static IisExpressWebServer WebServer;
        public static IWebDriver Browser;

        [SetUp]
        public void SetUp()
        {
            var app = new WebApplication(ProjectLocation.FromFolder("ContosoUniversity"), 12365);
            WebServer = new IisExpressWebServer(app);
            WebServer.Start();

            Browser = new FirefoxDriver();
        }

        [TearDown]
        public void TearDown()
        {
            Browser.Quit();
            WebServer.Stop();
        }
    }

## Hosting your application in IIS Express
To host an MVC application in IIS Express, you need to create a new Process for IIS Express, passing in the path to the folder that stores the web application project file (`.csproj` or `.vbproj` file) and the port number as arguments. This class wraps the creation of the IIS Express process and provides methods to start and stop the process.

	public class IisExpressWebServer 
    {
        private static WebApplication _application;
        private static Process _webHostProcess;

        public IisExpressWebServer(WebApplication application)
        {
            if (application == null)
                throw new ArgumentNullException("The web application must be set.");
            _application = application;
        }

        public void Start()
        {
            var webHostStartInfo = InitializeIisExpress(_application);
            _webHostProcess = Process.Start(webHostStartInfo);
            _webHostProcess.TieLifecycleToParentProcess();
        }

        public void Stop()
        {
            if (_webHostProcess == null)
                return;
            if (!_webHostProcess.HasExited)
                _webHostProcess.Kill();
            _webHostProcess.Dispose();
        }

        public string BaseUrl
        {
            get { return string.Format("http://localhost:{0}", _application.PortNumber); }
        }

        private static ProcessStartInfo InitializeIisExpress(WebApplication application)
        {
            // todo: grab stdout and/or stderr for logging purposes?
            var key = Environment.Is64BitOperatingSystem ? "programfiles(x86)" : "programfiles";
            var programfiles = Environment.GetEnvironmentVariable(key);

            var startInfo = new ProcessStartInfo
            {
                WindowStyle = ProcessWindowStyle.Normal,
                ErrorDialog = true,
                LoadUserProfile = true,
                CreateNoWindow = false,
                UseShellExecute = false,
                Arguments = String.Format("/path:\"{0}\" /port:{1}", application.Location.FullPath, application.PortNumber),
                FileName = string.Format("{0}\\IIS Express\\iisexpress.exe", programfiles)
            };

            foreach (var variable in application.EnvironmentVariables)
                startInfo.EnvironmentVariables.Add(variable.Key, variable.Value);

            return startInfo;
        }
    }

When the Start() method is called, a command window pops up showing the application running in IIS Express at the specified port number:

![IIS Express window](/images/testing-mvc-iis-express-window.png)

## Debugging the IIS Process
If you set a breakpoint in your web application, and try to step into it from your test code, then you are going to be disappointed! Thankfully, it is quite simple to attach the debugger to the IIS Express process. Place a breakpoint in your test code after IIS Express has been spun up, then from the Visual Studio menu select

	Debug > Attach to Process

![Attach to debugger](/images/testing-mvc-attach-debugger.png)

Scroll through the list of processes until you see `iisexpress.exe`. Note that the title is `IISExpress -`. This is the same as the title in the command window shown above. Select this process, and click `Attach`. Now  you can step through all of the code in your web application from your tests.

This is a slightly painful manual process. If you find this suitably irritating, it seems it is possible to [automate it](http://stackoverflow.com/questions/19658269/visual-studio-attach-to-managed-process-programatically).

## Closing Orphan Processes

![stopping debugger](/images/testing-mvc-stop-debugging.png)

One thing that is very annoying about WebDriver testing is that when you stop debugging manually, or your test run crashes on the build server, the nice graceful shut down that you programmed in the AppDomain unload event does not fire. This leaves all of the child processes created during the test run - the browser, the various browser driver server windows, and the IIS process window -  open, and you have to manually close each one yourself. Not only that, but if you don't notice to shut them down and start another test run, then you get unpredictable results and have to stop that one too. 

Fortunately, there is an easy solution. My friend and colleague, Jonathan Holford, found some wonderful code on stackoverflow that magically closes all of these orphan processes for you. Thankfully, he has packaged it up into a NuGet package, called [AllForOne](https://www.nuget.org/packages/AllForOne). According to the GitHub project page:

> AllForOne uses Job Object voodoo to ensure a set of processes are managed as a unit. 

To use AllForOne, just call the `TieLifecycleToParentProcess` extension method on the child process. You can see this demonstrated in the `Start` method of the `IisExpressWebServer` above.

Most of the WebDriver browser drivers have a server implementation. Whilst you don't have direct control over the processes they start, you can still grab the process by its name and use the `TieLifecycleToParentProcess` method in the same way, and have the process closed down however the tests are stopped. Don't quote me on this, but I've found that the process name is the name of the executable without the extension.

    public static class Browsers
    {
        private static RemoteWebDriver _phantom;
        public static RemoteWebDriver Phantom
        {
            get
            {
                if (_phantom == null)
                {
                    _phantom = new PhantomJSDriver();
                    var process = Process.GetProcessesByName("phantomjs").FirstOrDefault();
                    process.TieLifecycleToParentProcess();
                }
                return _phantom;
            }
        }
    }


## Finding the Project file
This helper class encapsulates finding the path to the web project folder. It searches up from the current directory to find the .sln file, then searches all the directories below that to find the specified web project folder.

	public class ProjectLocation : IProjectLocation
    {
        public string FullPath { get; private set; }

        private ProjectLocation(string fullPath)
        {
            var folder = new DirectoryInfo(fullPath);
            if (!folder.Exists)
            {
                throw new DirectoryNotFoundException();
            }
            FullPath = fullPath;
        }

        public static ProjectLocation FromPath(string webProjectFullPath)
        {
            return new ProjectLocation(webProjectFullPath);
        }

        public static ProjectLocation FromFolder(string webProjectFolderName)
        {
            string solutionFolder = GetSolutionFolderPath();
            string projectPath = FindSubFolderPath(solutionFolder, webProjectFolderName);
            return new ProjectLocation(projectPath);
        }

        private static string GetSolutionFolderPath()
        {
            var directory = new DirectoryInfo(Environment.CurrentDirectory);

            while (directory.GetFiles("*.sln").Length == 0)
            {
                directory = directory.Parent;
            }
            return directory.FullName;
        }

        private static string FindSubFolderPath(string rootFolderPath, string folderName)
        {
            var directory = new DirectoryInfo(rootFolderPath);

            directory = (directory.GetDirectories("*", SearchOption.AllDirectories)
                .Where(folder => folder.Name.ToLower() == folderName.ToLower()))
                .FirstOrDefault();

            if (directory == null)
            {
                throw new DirectoryNotFoundException();
            }

            return directory.FullName;
        }
    }

