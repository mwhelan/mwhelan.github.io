---
layout: post
title: Continuous Delivery for .Net Core with GitHub, Cake, GitTools, and AppVeyor
categories: DotNet Core
date: 2016-07-31 08:00:00
comments: true
sharing: true
footer: true
permalink: /continuous-delivery-github-cake-gittools-appveyor/
---

This is an end-to-end tutorial for setting up [continuous integration](http://www.martinfowler.com/articles/continuousIntegration.html) (CI) and [continuous delivery](http://www.martinfowler.com/articles/continuousIntegration.html) (CD) for a .Net Core project hosted on GitHub using Cake, GitTools, and AppVeyor. Credit for this entire process goes to [Jake Ginnivan](https://twitter.com/JakeGinnivan), who set this up for TestStack's [BDDfy](https://github.com/TestStack/TestStack.BDDfy) open source project, and is actively involved in a number of the GitTools projects referenced here. I have replicated that process for another open source project and documented it here.
<!--excerpt-->

Continuous delivery can be quite a daunting prospect these days and it would be easy to be overwhelmed by the number of different things the process I describe here does. But, rest assured, I am far from being an expert in this area, so if I can do it you can too. The good news is that the hard work and ingenuity has been done by the folks behind Cake, GitTools, AppVeyor and the other open source tools. They have created all the jigsaw pieces and all that is left for you and me to do is to compose the modules together to suit our particular situation.

## Overview
The .Net Core project for this tutorial is [Specify](https://github.com/mwhelan/Specify): Its technology stack is:

- **C#**: The programming language used for Specify.
- **NUnit**: The testing framework I am using in Specify (though with .Net Core you could have a mix of test frameworks as Cake just delegates to the dotnet-test runner to run tests).
- **Git and GitHub**: The Specify repository is git and the project is hosted on GitHub.
- **AppVeyor**: An online continuous integration server for .Net projects.
- **NuGet**: the package manager for .Net which is where Specify is deployed to.
- **Cake**: A cross platform build automation system with a C# DSL.
- **GitTools**: A GitHub open source organisation which provide a bunch of assorted git related tools which help with debugging, versioning, releasing etc.

That said, many of the topics in this post are more or less applicable to other technologies and providers, mainly due to the agnosticism of the Cake build tool.

The end-to-end process is comprised of these 3 steps, as depicted in the diagram below:

![Cake continuous delivery](/images/cake-continuous-delivery.png)

### Step 1: Commit code to GitHub
When you commit your code to GitHub, a webhook for AppVeyor is triggered to kick off the continuous integration build. For every project AppVeyor will configure webhooks for its repository to automatically start a build when you push the changes. You can read more about configuring AppVeyor to work with GitHub (and other providers) [here](https://www.appveyor.com/docs).

### Step 2: Continuous Integration 
AppVeyor runs the Cake continuous integration build process by calling the `build.ps1` PowerShell script. This calls the `build.cake` script, which does all the work, and runs the following tasks (the continuous integration tasks are blue in the diagram):

- **Build**: 
	- **Clean**: Cleans the previous build (deleting and re-creating the folder used for build output). 
	- **Semantic Version**: Uses GitVersion to calculate the semantic version and update the AssemblyInfo.cs files with that version. 
	- **Package restore**: Performs a NuGet package restore. 
	- **Build**: Compiles the source code with msbuild.
- **Test**: Runs tests for each of the test projects and for each target in those projects.
- **Package**: generates NuGet packages
	- **GitHub source stepping**: Uses GitLink to allow consumers of this project to step through the exact version of code on GitHub that was used to create the package (an alternative approach to symbol servers).
	- **Release notes**: Uses GitReleaseNotes to automatically generate release notes from the GitHub issue tracker based on closed issues since the last release.
	- **Package for NuGet**:

### Step 3: Continuous Delivery
AppVeyor runs the Cake deployment process by calling the `deploy.ps1` PowerShell script. This calls the `deploy.cake` script, which does all the work, and runs the publish tasks (green on the diagram above):
Manually run the deploy process, etc. 

### Cake
[Cake](http://cakebuild.net/) (C# Make) is a cross platform build automation system with a C# DSL to do things like compiling code, copy files/folders, running unit tests, compress files and build NuGet packages. It is built on top of the Roslyn and Mono compiler which enables you to write your build scripts in C#. One of its main philosophies is that Cake should behave the same way regardless of operating system (Windows, Linux, or OS X) or environment (AppVeyor, VSTS, TeamCity, Jenkins, etc.).

You can read how to get started with Cake [here](http://cakebuild.net/docs/tutorials/getting-started).

Tasks represent a unit of work in Cake, and you use them to perform specific work in a specific order. You can read more about tasks [here](http://cakebuild.net/docs/fundamentals/tasks).

Cake supports something called script aliases. Script aliases are convenience methods that are easily accessible directly from a Cake script. Every single DSL method in Cake is implemented like an alias method. You can read more about Cake aliases [here](http://cakebuild.net/docs/fundamentals/aliases).

### GitTools
[GitTools](https://github.com/GitTools) is a GitHub open source organisation which provide a bunch of assorted git related tools which help with debugging, versioning, releasing etc.

- **GitVersion**: Provides easy, automated, [semantic versioning](http://semver.org/) for projects using git, by looking at your git history and working out the semantic version of the commit being built.
- **GitLink**: Allows users to step through your source code hosted on GitHub, making symbol servers obsolete.
- **GitReleaseNotes**: Utility which makes it really easy to generate release notes for your git project. Works with GitHub, Jira and YouTrack.

## Continuous Integration
### Build task
This illustrates a basic Cake task. You can see that it is familiar C# syntax. Each task defines a name - "Build" in this case - and is followed by a `.Does` method which takes a lambda for the work the task will perform.

The `IsDependentOn` method is used to setup a dependency on another task. That means that task must run before this task. If there are multiple dependencies then each will run in order before this task. So, in this example, they will run in the following order: 

	Clean => Version => Restore => Build.

The `build` task uses the Cake MSBuild task to compile the Specify solution.

	Task("Build")
		.IsDependentOn("Clean")
		.IsDependentOn("Version")
		.IsDependentOn("Restore")
		.Does(() => {
			MSBuild("./src/Specify.sln");
		});

In order to use the commands for this alias, MSBuild will already have to be installed on the machine the Cake Script is being executed on.

### Clean task
The first task you normally want to do with a build script is to delete the working directory, which various tasks in the build process use for preparing files and producing output. Cake provides a number of aliases for working with directories. This script uses the `DirectoryExists`, `DeleteDirectory`, and `CreateDirectory` methods.

	Task("Clean")
		.Does(() => {
			if (DirectoryExists(outputDir))
			{
				DeleteDirectory(outputDir, recursive:true);
			}
			CreateDirectory(outputDir);
		});

### Version task
The version task uses the GitVersion tool to calculate the [semantic version](http://semver.org/) of the project and updates the project's project.json and AssemblyInfo.cs files with this version number. You can read more about GitVersion on the project's [readthedocs site](http://gitversion.readthedocs.io/en/latest/).

In order to use the GitVersion tool, you have to download its package as part of executing the build script. To do that with Cake, you have to provide this directive at the top of the build script.

	#tool "nuget:?package=GitVersion.CommandLine"

And then use the GitVersion alias and the GitVersionSettings class in the version task.

	Task("Version")
		.Does(() => {
			GitVersion(new GitVersionSettings{
				UpdateAssemblyInfo = true,
				OutputType = GitVersionOutput.BuildServer
			});
			versionInfo = GitVersion(new GitVersionSettings{ OutputType = GitVersionOutput.Json });
			// Update project.json
			var updatedProjectJson = System.IO.File.ReadAllText(specifyProjectJson)
				.Replace("1.0.0-*", versionInfo.NuGetVersion);
	
			System.IO.File.WriteAllText(specifyProjectJson, updatedProjectJson);
		});

### Restore task
Cake provides built-in support for .Net Core. The DotNetCoreRestore alias will restore all NuGet packages for .Net Core solutions. You just have to pass in the folder where the solution is located ("src" in this example).

	Task("Restore")
		.Does(() => {
			DotNetCoreRestore("src");
		});

In order to use the commands for this alias, the [.Net Core CLI tools](https://www.microsoft.com/net/core#windows) will need to be installed on the machine where the Cake script is being executed.

### Test task
DotNetCoreTest is another DotNetCore alias. It will use the .Net CLI test runner that is configured for each test project to run the tests for that project. It will run tests for each target defined in the test project's project.json file. You just have to pass in the location of the test project.

	DotNetCoreTest("./src/tests/Specify.Tests");
	DotNetCoreTest("./src/tests/Specify.IntegrationTests");
	DotNetCoreTest("./src/Samples/Examples/Specify.Examples.UnitSpecs");

In order to use the commands for this alias, the [.Net Core CLI tools](https://www.microsoft.com/net/core#windows) will need to be installed on the machine where the Cake script is being executed.

### Package task
The package task performs performs several operations to create  runs once for each 

### GitHub source stepping task
**UPDATE**: Unfortunately, it turns out that GitLink does not currently support xproj or project.json and .Net Core. I will leave this step in as it is still a correct description of how to use Cake and GitLink with pre-.Net Core projects and perhaps suppor will be added eventually. As an alternative, I will demonstrate packaging pdb files as a NuGet package for a symbol server in a later step.

In order to use the GitLink tool, you have to download its package as part of executing the build script. 

	#tool "nuget:?package=gitlink"

And then use the GitLink alias and the GitVersionSettings class in the package task. This example shows how to include command-line arguments that tell GitLink which projects in the solution to target.

	GitLink("./", new GitLinkSettings { ArgumentCustomization = args => args.Append("-include Specify,Specify.Autofac") });

Alternatively, you can just call it without any settings and accept the defaults:

	GitLink("./");

### Release notes task
In order to use the GitReleaseNotes tool, you have to download its package as part of executing the build script. 

	#tool "nuget:?package=GitReleaseNotes"

Although there is a GitReleaseNotes tool for Cake, this example shows how to use the StartProcess alias to run the GitReleaseNotes executable that Cake has downloaded to the tools directory.

	private void GenerateReleaseNotes()
	{
		var releaseNotesExitCode = StartProcess(
			@"tools\GitReleaseNotes\tools\gitreleasenotes.exe", 
			new ProcessSettings { Arguments = ". /o artifacts/releasenotes.md" });
		if (string.IsNullOrEmpty(System.IO.File.ReadAllText("./artifacts/releasenotes.md")))
			System.IO.File.WriteAllText("./artifacts/releasenotes.md", "No issues closed since last release");
	
		if (releaseNotesExitCode != 0) throw new Exception("Failed to generate release notes");
	}

### Package for NuGet task
The package task generates the .nupkg files for each project that needs to be deployed to NuGet using Cake's DotNetCorePack alias. This is another DotNetCore alias, and also requires the .Net Core CLI tools be installed on the machine where the Cake script is being executed. 

	private void PackageProject(string projectName, string projectJsonPath)
	{
		var settings = new DotNetCorePackSettings
			{
				OutputDirectory = outputDir,
				NoBuild = true
			};
	
		DotNetCorePack(projectJsonPath, settings);
	
		System.IO.File.WriteAllLines(outputDir + "artifacts", new[]{
			"nuget:" + projectName + "." + versionInfo.NuGetVersion + ".nupkg",
			"nugetSymbols:" + projectName + "." + versionInfo.NuGetVersion + ".symbols.nupkg",
			"releaseNotes:releasenotes.md"
		});
	} 

Note that this also generates the symbols package for uploading the .pdb files to a symbol server (as an alternative to GitHub source stepping).

If the script is running on AppVeyor then it copies all the generated output to the Artifacts folder on AppVeyor that is associated with this build.

![AppVeyor artifacts](/images/cake-appveyor-artifacts.png)

### Final Cake Continuous Integration build script
Having seen all the constituent parts it's probably useful to see the whole script:

	#tool "nuget:?package=GitReleaseNotes"
	#tool "nuget:?package=GitVersion.CommandLine"
	#tool "nuget:?package=gitlink"
	
	var target = Argument("target", "Default");
	var outputDir = "./artifacts/";
	var solutionPath = "./src/Specify.sln";
	var specifyProjectJson = "./src/app/Specify/project.json";
	var specifyAutofacProjectJson = "./src/app/Specify.Autofac/project.json";
	
	Task("Clean")
		.Does(() => {
			if (DirectoryExists(outputDir))
			{
				DeleteDirectory(outputDir, recursive:true);
			}
			CreateDirectory(outputDir);
		});
	
	Task("Restore")
		.Does(() => {
			DotNetCoreRestore("src");
		});
	
	GitVersion versionInfo = null;
	Task("Version")
		.Does(() => {
			GitVersion(new GitVersionSettings{
				UpdateAssemblyInfo = true,
				OutputType = GitVersionOutput.BuildServer
			});
			versionInfo = GitVersion(new GitVersionSettings{ OutputType = GitVersionOutput.Json });
			// Update project.json
			var updatedProjectJson = System.IO.File.ReadAllText(specifyProjectJson)
				.Replace("1.0.0-*", versionInfo.NuGetVersion);
	
			System.IO.File.WriteAllText(specifyProjectJson, updatedProjectJson);
		});
	
	Task("Build")
		.IsDependentOn("Clean")
		.IsDependentOn("Version")
		.IsDependentOn("Restore")
		.Does(() => {
			MSBuild(solutionPath);
		});
	
	Task("Test")
		.IsDependentOn("Build")
		.Does(() => {
			DotNetCoreTest("./src/tests/Specify.Tests");
			DotNetCoreTest("./src/tests/Specify.IntegrationTests");
			DotNetCoreTest("./src/Samples/Examples/Specify.Examples.UnitSpecs");
		});
	
	Task("Package")
		.IsDependentOn("Test")
		.Does(() => {
			//GitLink("./", new GitLinkSettings { ArgumentCustomization = args => args.Append("-include Specify,Specify.Autofac") });
	        
	        GenerateReleaseNotes();
	
			PackageProject("Specify", specifyProjectJson);
			PackageProject("Specify.Autofac", specifyAutofacProjectJson);
	
			if (AppVeyor.IsRunningOnAppVeyor)
			{
				foreach (var file in GetFiles(outputDir + "**/*"))
					AppVeyor.UploadArtifact(file.FullPath);
			}
		});
	
	private void PackageProject(string projectName, string projectJsonPath)
	{
		var settings = new DotNetCorePackSettings
			{
				OutputDirectory = outputDir,
				NoBuild = true
			};
	
		DotNetCorePack(projectJsonPath, settings);
	
		System.IO.File.WriteAllLines(outputDir + "artifacts", new[]{
			"nuget:" + projectName + "." + versionInfo.NuGetVersion + ".nupkg",
			"nugetSymbols:" + projectName + "." + versionInfo.NuGetVersion + ".symbols.nupkg",
			"releaseNotes:releasenotes.md"
		});
	}    
	
	private void GenerateReleaseNotes()
	{
			var releaseNotesExitCode = StartProcess(
			@"tools\GitReleaseNotes\tools\gitreleasenotes.exe", 
			new ProcessSettings { Arguments = ". /o artifacts/releasenotes.md" });
		if (string.IsNullOrEmpty(System.IO.File.ReadAllText("./artifacts/releasenotes.md")))
			System.IO.File.WriteAllText("./artifacts/releasenotes.md", "No issues closed since last release");
	
		if (releaseNotesExitCode != 0) throw new Exception("Failed to generate release notes");
	}
	
	Task("Default")
		.IsDependentOn("Package");
	
	RunTarget(target);

### AppVeyor badge
A project status badge is a dynamically generated image displaying the status of the last AppVeyor build. You can put a status badge on the home page of your GitHub project (in the readme.md file). 
	
	[![Build status](https://ci.appveyor.com/api/projects/status/vj6ec2yubg8ii9sn?svg=true)](https://ci.appveyor.com/project/mwhelan/specify)

![AppVeyor artifacts](/images/cake-appveyor-badge.svg)

You can read more about AppVeyor status badges [here](https://www.appveyor.com/docs/status-badges).

## Continuous Delivery
I have not had time to replicate the BDDfy deployment to NuGet process, so I will just outline the steps we take to deploy BDDfy. 

The process has two steps, each of which has its own project in AppVeyor. The first step is to create a GitHub release. That is done by the CI build, which is configured to not build tags. The second step is to deploy to NuGet. This is done by a dedicated AppVeyor project for deployment which is configured to only build tags. Tags are created when you publish the GitHub Release.

### Step 1: Publish a GitHub Release
The deployment process starts by selecting `Deploy` from the continuous integration build to create a new deployment. 

![AppVeyor deploy](/images/cake-appveyor-deploy1.png)

Select `Create GitHub Release - GitHub Releases` option for the Environment and then click `Deploy`.

![AppVeyor deploy](/images/cake-appveyor-deploy2.png)

This will run and generate a GitHub Release.

![AppVeyor deploy](/images/cake-appveyor-deploy3.png)

Now, if you go over to GitHub Releases for your project you should see a new Draft Release.

![AppVeyor deploy](/images/cake-appveyor-deploy4.png)

At this stage, this requires some manual editing of the title and tag and perhaps making some changes to the release notes. 

Once everything is OK, publish the GitHub Release. This will create a tag, which will kick off the AppVeyor deployment project (which is configured to only build tags).

### Step 2: Deploy to NuGet
The BDDfy deployment process is defined in the [deploy.cake file](https://github.com/TestStack/TestStack.BDDfy/blob/master/deploy.cake). It downloads GitHub Release artifacts and then deploys to NuGet. 

## Summary
So, that is an end-to-end process for setting up continuous integration and continuous delivery for a .Net Core project hosted on GitHub using Cake, GitTools, and AppVeyor. It is one of my longer posts, and there's a whole lot going on, but hopefully it provides some useful insight into some of the great tools that talented people have made available for the community and how you might be able to use them in your own processes.