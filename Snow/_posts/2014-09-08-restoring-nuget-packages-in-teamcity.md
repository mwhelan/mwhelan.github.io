---
layout: post
title: Restoring NuGet Packages in TeamCity
categories: Configuration
image: images/sswtvthumb.jpg
date: 2014-09-07 10:00:00
comments: true
sharing: true
footer: true
permalink: /restoring-nuget-packages-in-teamcity/
---

NuGet package restore used to be MSBuild-based and you would enable it by selecting `Enable NuGet Package Restore` in Visual Studio. Nowadays, it is [recommended](http://www.xavierdecoster.com/migrate-away-from-msbuild-based-nuget-package-restore) that you don't use this approach, but instead just set the option in Visual Studio to `Allow NuGet to download missing packages`. This works really well in Visual Studio, but when you select the Visual Studio build runner in TeamCity it does not go ahead and restore all the NuGet packages for you in the same way, so you get a compilation error. Instead, you  have to explicitly create a separate step to run before the Visual Studio build step.
<!--excerpt-->

To enable NuGet Package Restore with TeamCity you need to add a build step before the Visual Studio solution build with a runner type of `NuGet Installer`.

![TeamCity NuGet Installer](/images/teamcity-nuget-installer.png)

The first time you create this installer, there might not be a NuGet.exe to choose. Just select the NuGet Settings option and you are presented with the option to download the latest version. Select Fetch NuGet and you are able to select a NuGet.exe version to be downloaded for use by TeamCity.

![TeamCity NuGet Installer](/images/teamcity-nuget-add.png)

Once you have selected the NuGet.exe you just have to provide the path to your Visual Studio solution file, which you can do with the useful file tree (pictured):

![TeamCity NuGet Installer](/images/teamcity-nuget-installer-final.png)

## Find out more
I can recommend some great resources on using TeamCity for continuous integration/delivery from my fellow TestStackers:

- Mehdi Khalili has a [definitive post](http://www.mehdi-khalili.com/continuous-integration-delivery-github-teamcity) on doing continuous integration and delivery for GitHub with TeamCity.
- Rob Moore and Matt Davies have a great [series of posts](http://robdmoore.id.au/blog/2012/08/12/maintainable-large-scale-continuous-delivery-with-teamcity/) on creating a deployment pipeline with TeamCity.
- Jake Ginnivan has a ton of great posts on [TeamCity](http://jake.ginnivan.net/blog/categories/teamcity) and [continuous delivery](http://jake.ginnivan.net/blog/categories/teamcity). I particularly like this [one](http://jake.ginnivan.net/teamcity-ui-test-agent/), on setting up a UI test build agent with TeamCity.

In additiona, JetBrains also has a [blog post](http://blog.jetbrains.com/teamcity/2013/08/nuget-package-restore-with-teamcity/) that goes into more detail about the NuGet Installer build runner.






