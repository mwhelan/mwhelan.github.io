---
layout: post
title: Testing .Net Core with TestDriven.Net
categories: DotNet Core
date: 2016-07-22 08:00:00
comments: true
sharing: true
footer: true
permalink: /testing-dotnet-core-with-testdriven-net/
---

Third party tools vendors are finding it particularly difficult to provide .Net Core support while the tooling is in preview and still subject to a lot of change, but TestDriven.Net is leading the way with a slick Visual Studio testing experience for .Net Core (and earlier versions of .Net).  You simply right click on the solution, project, folder, file, or test, and it will run all of the tests in that scope. TestDriven.Net is actually one of the oldest .Net/Visual Studio test runners and is undergoing something of a reboot with support for .Net Core and the next version of Visual Studio, "15."
<!--excerpt-->

## TestDriven.Net v4 Alpha
[Jamie Cansdale](https://twitter.com/jcansdale), the maintainer of the venerable TestDriven.Net, has been hard at work releasing a number of alpha versions through the [testdriven.net website](http://testdriven.net/download.aspx). The releases consist of .zip files that contain a setup.exe executable for installing TestDriven.Net as a Visual Studio add-in. 

You can read the release notes [here](http://testdriven.net/downloads/releasenotes.html).

## Running Tests
TestDriven.net is extremely flexible and can be run in a number of ways.

### Running Tests from Solution Explorer
After installing TestDriven.Net, and re-starting Visual Studio, the 'Run Test(s)' command becomes available on the Right-Click context menu in Solution Explorer, and offers a straightforward way to build and run tests. You can right click on the solution, a project (or multiple projects), or a file (or multiple files) and it will run all of the tests in that scope. You have a number of useful testing options, such as testing with the debugger or code coverage.

![VS test runner](/images/test-dotnet-core-tdnet-run.png)

This is intended to be the default method of test execution in most contexts. TestDriven.Net automatically detects the test framework being used and executes tests using the correct test runner. The tests are launched by a test execution engine running as an external process. This test process is kept alive in order to improve execution times on subsequent runs. Once a test process has been cached, a rocket icon will appear in the notify box.

### Running Tests from the Code Editor Window
If the code editor window is selected, the test(s) to execute will be determined by the position of the caret:

- individual tests are executed by right-clicking anywhere inside a test method and selecting 'Run Test(s)'
- all tests in a test fixture are executed by right-clicking inside a class (but outside of any method) and selecting 'Run Test(s)'
- all tests in a namespace are executed by right-clicking inside a namespace and selecting 'Run Test(s)'.

### Test Results
Once your run the tests, TestDriven.Net will show the results in the "Test" output window.

![VS test runner](/images/test-dotnet-core-tdnet.png)

## Tips and Tricks
It is important to remember that TestDriven.Net v4 is an alpha, and not everything works quite as well as it will in the final release. This is sometimes down to the vagaries of how Visual Studio works, not to mention the issues that all tools vendors are facing with the moving target of the Visual Studio .Net Core preview tooling. So, hopefully some of these things will improve with time.

### The order of frameworks matter when multi-targeting
If you are targeting multiple frameworks in your test project and you put the .Net 4x project first, TestDriven.Net won't run your tests. It is important to put the .Net Core framework first in your project.json. For example, here netcoreapp1.0 is listed before net46.

	"frameworks": {
	    "netcoreapp1.0": {
	        "dependencies": {
	            "Microsoft.NETCore.App": {
	                "type": "platform",
	                "version": "1.0.0"
	            },
	            "System.Linq": "4.1.0"
	        },
	        "imports": [
	            "dnxcore50",
	            "portable-net45+win8"
	        ]
	    },
	    "net46": {
	        "dependencies": {
	        },
	        "buildOptions": {
	            "define": [
	                "Approvals",
	                "Culture",
	                "NSubstitute"
	            ]
	        }
	    }

### Runtimes
I had an issue where some of my tests just weren't working. When I ran them nothing would happen - nothing was displayed in the "Test" output window and the status bar said `0 passed, 0 Failed, 0 Skipped`. It turned out the problem was having a Runtimes node in my test project's project.json.

    "runtimes": {
        "win10-x64": {}
    },

This made Visual Studio incorrectly report to TestDriven.Net that my test project's DLL was in the `bin\Debug\netcoreapp1.0\win10-x64` directory, when in fact it was in the `bin\Debug\netcoreapp1.0` directory. Removing the runtimes node solved the problems and enabled TestDriven.Net to run the tests successfully.

### Execute non-test methods
The .NET Core test runner requires that unit tests be inside a Console Application project, but TestDriven.Net can actually execute any method/property that doesn't have a test attribute as an "Ad hoc" test (even if it's inside a Class Library project). Anything returned from the method/property will be expanded on the output window. 

This feature can make it a really interesting utility for running your own methods. For example, if you wanted to find out more about the properties on a type:

![TestDriven.Net](/images/tdnet-normal-method.png)

## Get Involved
TestDriven.Net is still in alpha and Jamie Cansdale is actively looking at ways to make it as useful as possible. That means that you have the opportunity to shape its direction by raising issues on the [GitHub issues page](https://github.com/jcansdale/TestDriven.Net-Issues/issues) or [tweeting Jamie](https://twitter.com/jcansdale) with feature requests. Give it a try.

For example, Jamie mentioned to me that he is thinking about how to allow people to swap between the different frameworks. At the moment he is thinking of adding separate `Test With > .NET Core` and `Test With > .NET 4.x` options, but he would appreciate feedback and suggestions about how this might work best.

## Summary
There are not a lot of .Net Core test runners available at the moment. TestDriven.Net may only be in alpha, but it is already very stable for day-to-day testing of your .Net Core projects and is a slick and flexible way to run your tests in Visual Studio. I recommend [checking it out](http://testdriven.net/download.aspx).