---
layout: post
title: The State of .Net Core Testing Today
categories: DotNet Core
date: 2016-07-17 08:00:00
comments: true
sharing: true
footer: true
permalink: /the-state-of-dotnet-core-testing-today/
---

.Net Core 1.0 has been officially released but the tooling is still in preview. This means that a number of open source testing libraries have been able to release at least alpha support for .Net Core, but it is not always easy to locate and you sometimes have to drill through GitHub issues, stack overflow questions, and NuGet feeds, to find it. Third party tools vendors are finding it particularly difficult to provide .Net Core support while the tooling is in preview and still subject to a lot of change, but TestDriven.Net has a number of promising alpha releases. In this post, I am going to look at the main .Net testing providers, their current support for .Net Core, and how you can get hold of them. 
<!--excerpt-->

## Test Project Configuration
The steps to create a test project are a little bit different with .Net Core. You still create it as a class library, but now you must mark it as a .Net Core Application (the `netcoreapp1.0` framework in the project.json below).  

	"frameworks": {
        "netcoreapp1.0": {
            "dependencies": {
                "Microsoft.NETCore.App": {
                    "type": "platform",
                    "version": "1.0.0"
                }
            }
        }
    }

When using the .Net CLI for testing, unit test projects are actually an application, not a class library.If you forget to make this change, the compiler will tell you that `dotnet-test-xunit` (for example) is not compatible with your class library project. 

You must also add a project reference to the application project you are testing in the project.json.

	"dependencies": {
	    "Specify.Autofac": {
	      "target": "project"
	    },

You can target both net4xx and netcoreapp simply by adding both frameworks together in your project.json file. When you run dotnet test with multiple framework entries, the system will run all your framework tests, one after the other.

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
            "Approvals"
          ]
        }
      }
    },

##Test Runners
Unfortunately, my favourite test runners, ReSharper and NCrunch, do not have support for .Net Core yet. That has meant that we have been stuck with either the console runners or the Visual Studio test runner. Fortunately, things are looking up, with TestDriven.Net providing a flurry of alpha packages. There are still a number of issues to work out - tests just flat out don't run on some of my projects - but it seems to be shaping up quite well and is a great option for those projects that it does work for.

### TestDriven.Net v4 Alpha
[Jamie Cansdale](https://twitter.com/jcansdale), the maintainer of the venerable TestDriven.Net, has released a number of alpha versions through the [testdriven.net website](http://testdriven.net/default.aspx). The releases consist of .zip files that contain an executable for installing TestDriven.Net as a Visual Studio add-in.

![VS test runner](/images/test-dotnet-core-tdnet.png)

After installing TestDriven.Net, you can right click on the solution, a project (or multiple projects), or a file (or multiple files) and it will run all of the tests in that scope. TestDriven.Net automatically detects the test framework being used and executes tests using the correct test runner. You have a number of useful testing options, such as testing with the debugger or code coverage.

![VS test runner](/images/test-dotnet-core-tdnet-run.png)

I've written another post about how to test .Net Core with TestDriven.Net [here](/testing-dotnet-core-with-testdriven-net/).

### Console Runners
The various test frameworks implement the [.Net Core test protocol](https://docs.microsoft.com/en-us/dotnet/articles/core/tools/test-protocol) to provide test runners, which allow tests to be run by the Visual Studio test runner or from the command line. 

To run tests from the command line, open a command prompt or PowerShell command window. In the window, navigate to the folder containing the source code of your test project. To run the .Net CLI test runner, type `dotnet test`, as shown below:

	> dotnet test
	xUnit.net .NET CLI test runner (64-bit .NET Core win10-x64)
	  Discovering: MyFirstDotNetCoreTests
	  Discovered:  MyFirstDotNetCoreTests
	  Starting:    MyFirstDotNetCoreTests
	    MyFirstDotNetCoreTests.Class1.FailingTest [FAIL]
	      Assert.Equal() Failure
	      Expected: 5
	      Actual:   4
	      Stack Trace:
	        C:\Samples\MyFirstDotNetCoreTests\src\MyFirstDotNetCoreTests\Class1.cs(16,0): at MyFirstDotNetCoreTests.Class1.FailingTest()
	  Finished:    MyFirstDotNetCoreTests
	=== TEST EXECUTION SUMMARY ===
	   MyFirstDotNetCoreTests  Total: 2, Errors: 0, Failed: 1, Skipped: 0, Time: 0.167s

This will kick off the tests using whichever runner is specified in the `testRunner` node in project.json.

### Run tests in Visual Studio
The same NuGet package which allows you to run tests from the console also allows you to run tests from within Visual Studio. Show the Test Explorer window by choosing Test > Windows > Test Explorer. The Test Explorer window will show inside Visual Studio, and your test should be visible (if they're not, try building your project to kick off the test discovery process). 

If you click the Run All link in the Test Explorer window, it will run your tests and show you success and failure. You can click on an individual test result to get failure information as well as stack trace information:

![VS test runner](/images/test-dotnet-core-vs-runner.png)

### ReSharper
ReSharper does not have test runner support for .Net Core yet. 

### NCrunch
NCrunch does not have test runner support for .Net Core yet. Remco Mulder, NCrunch's creator, has a useful explanation [here](https://ncrunch.uservoice.com/forums/245203-feature-requests/suggestions/8065623-support-dnx-projects) on the difficulties that tool vendors face with the ongoing changes to tooling.

## Test Frameworks
### xUnit
xUnit has beta support for .Net Core. In your project.json, you need to set the `testRunner` to `xunit` and add dependencies for xUnit and the dotnet-test-xunit console runner.

	"testRunner": "xunit",
    "dependencies": {
        "xunit": "2.2.0-beta2-build3300",
        "dotnet-test-xunit": "2.2.0-preview2-build1029"
    },

Using the NuGet Package Management Console:

	Install-Package xunit -Pre
	Install-Package dotnet-test-xunit -Pre

### NUnit
NUnit also has beta support for .Net Core. In your project.json, you need to set the `testRunner` to `nunit` and add dependencies for NUnit and the dotnet-test-nunit console runner.

	"testRunner": "nunit",
    "dependencies": {
        "NUnit": "3.4.1",
        "dotnet-test-nunit": "3.4.0-beta-1"
    },

Using the NuGet Package Management Console:

	Install-Package Nunit
	Install-Package dotnet-test-nunit -Pre

### MsTest
Microsoft's own MsTest also has support for .Net Core. In your project.json, you need to set the `testRunner` to `mstest` and add dependencies for MSTest.TestFramework and the dotnet-test-mstest console runner.

	"testRunner": "mstest",
    "dependencies": {
        "MSTest.TestFramework": "1.0.0-preview",
		"dotnet-test-mstest": "1.0.1-preview"
    },

Using the NuGet Package Management Console:

	Install-Package MSTest.TestFramework -Pre
	Install-Package dotnet-test-mstest -Pre

### MSpec
MSpec is a context/specification framework that greatly influenced the way I write tests today. I really like its class per test approach and the automocking that you can do with it, both of which I have carried forward. I only moved away from it because it was so different from how I was writing my functional tests with BDDfy, and I wanted to use the [same frameworks and coding styles](/using-bddfy-for-unit-tests/) across all my tests.

Ivan Zlatev has a great post outlining MSpec support for .Net Core [here](http://ivanz.com/2016/08/05/announcing-mspec-for-net-core/).

### BDDfy
BDDfy, from TestStack - the simplest BDD framework to use, customize and extend - has full support for .Net Core.

	Install-Package TestStack.BDDfy

### Fixie
As described in the [Project Roadmap](https://github.com/fixie/fixie/wiki), Fixie 2.x is being actively developed on the dev branch to support .NET Core. Fixie itself should leverage .NET Core, and it should allow testing of projects that leverage .NET Core. 

For more detailed progress and discussion on .NET Core, see [Issue #145 - Support .NET Core](https://github.com/fixie/fixie/issues/145).

One of the items on the roadmap is to publish a prerelease NuGet package of 2.x for initial round of feedback but, as far as I can tell, that has not been released yet.

Fixie's creator, [Patrick Lioi](https://twitter.com/plioi), has more details on Fixie 2.0's progress on his [blog](https://lostechies.com/patricklioi/2016/07/22/tiny-steps-creating-fixie-2-0/), including a link to a [video presentation](https://vimeo.com/175828748) he did about it.

## Mocking Frameworks
Most of the mocking frameworks depend on Castle.Core, which itself currently has alpha support for .Net Core. Note, that at the time of writing, Castle.Core had a dependency on System.Diagnostics.TraceSource, meaning the mocking frameworks also had this dependency. As Jonathon Rossi says in the comments below, Castle.Core have since released Castle Core 4.0.0-beta001, which removes that dependency, so expect this dependency to drop off the mocking frameworks once they update to the latest Castle.Core.

### NSubstitute
If you go to nuget.org, you will find that the latest NSubstitute package is version 1.10.0 from March and does not have support for .Net Core. However, there is actually an unlisted beta package of version 2.0 with support for .Net Core that is published to nuget.org and just not visible. 

You can install the package via the NuGet CLI with the following command:

	Install-Package NSubstitute -Version 2.0.0-beta -Pre

Or you can just add these references to the dependencies node of your project.json. Note that you also need to add a reference to System.Diagnostics.TraceSource.

    "NSubstitute": "2.0.0-alpha003",
    "System.Diagnostics.TraceSource": "4.0.0",

You can follow the progress of NSubstitute 2.0 on this [GitHub issue](https://github.com/nsubstitute/NSubstitute/pull/197) or on [Alexandr Nikitin's branch](https://github.com/alexandrnikitin/NSubstitute/commits/Issue192_NetCore_Project). 

### FakeItEasy
FakeItEasy also don't have a package with .Net Core support officially published on NuGet, but you can access the alpha version of v2.3, with support for .Net Core, on an appveyor NuGet feed:

	https://ci.appveyor.com/nuget/fakeiteasy-jeremymeng

To access this from your solution, just add this reference as a NuGet package source in Visual Studio and add a NuGet.config to the root of your solution like this:

	<?xml version="1.0" encoding="utf-8"?>
	<configuration>
	  <packageSources>
	    <add key="api.nuget.org" value="https://api.nuget.org/v3/index.json" />
	    <add key="appveyor FakeItEasy" value="https://ci.appveyor.com/nuget/fakeiteasy-jeremymeng" />
	  </packageSources>
	</configuration>

And add a reference to the latest version (2.2.0-coreclr-alpha30 at the time of writing) in the dependencies node of project.json.

    "FakeItEasy": "2.2.0-coreclr-alpha30",

You can follow the progress of this release on this [GitHub issues page](https://github.com/FakeItEasy/FakeItEasy/issues/531).

### Moq
Moq has an alpha release published to NuGet.org with support for .Net Core:

	Install-Package Moq -Pre

And, like NSubstitute, it seems you also need to add a reference to System.Diagnostics.TraceSource in your project.json. You can read more about that on [stack overflow](http://stackoverflow.com/questions/37288385/moq-netcore-failing-for-net-core-rc2).

	"moq.netcore": "4.6.25-alpha",
    "System.Diagnostics.TraceSource": "4.0.0"

## Assertion Frameworks
[Fluent Assertions](http://www.fluentassertions.com/) and [Shouldly](https://shouldly.readthedocs.io/en/latest/) both have full support for .Net Core.

## Other Testing Libraries
As far as I can tell, [ApprovalTests](http://approvaltests.com/) does not have support for .Net Core yet.

## Summary
.Net Core 1.0 has been officially released but the tooling is still in preview. This means that a number of open source testing libraries have been able to release at least alpha support for .Net Core, but it is not always easy to locate. In this post, I have looked at the main .Net testing providers, their current support for .Net Core, and how you can get hold of them.