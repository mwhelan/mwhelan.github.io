---
layout: post
title: Replacing AppDomain in .Net Core
categories: DotNet
date: 2016-07-07 08:00:00
comments: true
sharing: true
footer: true
permalink: /replacing-appdomain-in-dotnet-core/
---

In the move to .Net Core, Microsoft decided to discontinue certain technologies because they were deemed to be problematic. AppDomain was one of those that did not make the cut. While AppDomains have been discontinued, some of their functionality is still being provided. It is quite hard to find those features though, as they are spread across multiple NuGet packages and there is very little documentation at this stage. Issues on github are the best source of information, but there has been a high churn of APIs in this area and a lot of those discussions and APIs are out-of-date. If you have been hunting around for these features then I hope the code samples here will at least provide you with a good starting point and some clues as to where to find related features.
<!--excerpt-->

## Replacing AppDomain Unload event
In .Net classic, it could be quite useful to run code in the AppDomain Unload event, especially if you wanted to perform some actions after all of your tests had completed.

	System.AppDomain.CurrentDomain.DomainUnload += (sender, e) => {
	    InvokeBatchProcessors();
	};

There are no AppDomains in .Net Core. Instead, we can use the AssemblyLoadContext, which is part of the System.Runtime.Loader library:

	System.Runtime.Loader.AssemblyLoadContext.Default.Unloading += context => InvokeBatchProcessors();

At the time of writing, the current version of System.Runtime.Loader package is 4.0, which you include in your project.json with this entry.

	"System.Runtime.Loader": "4.0.0",	

## Replacing AppDomain.GetAssemblies
In .Net classic, you could get all of the referenced assemblies from AppDomain.

	AppDomain.CurrentDomain.GetAssemblies();

I really struggled to figure out how to do this in .Net Core. Up until RC1, you were able to use the LibraryManager from the Microsoft.Extensions.PlatformAbstractions package to do it, but that functionality was either removed or moved somewhere else for RC2. 

	return libraryManager.GetReferencingLibraries("Specify")
	    .SelectMany(a => a.Assemblies)
	    .Select(Assembly.Load);

One way to do it now, is with the DependencyContext from the Microsoft.Extensions.DependencyModel package. You have to load each assembly and use the new AssemblyName class. 

    public static IEnumerable<Assembly> GetReferencingAssemblies(string assemblyName)
    {
        var assemblies = new List<Assembly>();
        var dependencies = DependencyContext.Default.RuntimeLibraries;
        foreach (var library in dependencies)
        {
            if (IsCandidateLibrary(library, assemblyName))
            {
                var assembly = Assembly.Load(new AssemblyName(library.Name));
                assemblies.Add(assembly);
            }
        }
        return assemblies;
    }

    private static bool IsCandidateLibrary(RuntimeLibrary library, assemblyName)
    {
        return library.Name == (assemblyName)
            || library.Dependencies.Any(d => d.Name.StartsWith(assemblyName));
    }

The DependencyContext.Default has two properties, RuntimeLibraries and CompileLibraries, which both appear to provide the same list of libraries. I'm sure there is a difference between them but at this stage I am not sure what that difference is.

The current version of Microsoft.Extensions.DependencyModel is 1.0:

	"Microsoft.Extensions.DependencyModel": "1.0.0"

## Get All Types from AppDomain
If you were getting all the assemblies from the AppDomain, chances are you were wanting to retrieve the types in those assemblies matching a certain query. Using an AppDomain, you could do that like this:

    return AppDomain.CurrentDomain
        .GetAssemblies()
        .SelectMany(assembly => assembly.GetExportedTypes());

It is pretty similar with .Net Core. Again, using the Microsoft.Extensions.DependencyModel library and the GetReferencingAssemblies method from the previous example:

	return GetReferencingLibraries("Specify")
	    .SelectMany(assembly => assembly.ExportedTypes);

Assembly now has an ExportedTypes method instead of GetExportedTypes.

## Creating a Polyfill
As I described in my [previous post](/porting-dotnet-framework-library-to-dotnet-core/), when porting your code to .Net Core you might like to include a polyfill for missing functionality, so that your code can interact with both implementations seamlessly. A polyfill for AppDomain.CurrentDomain.GetAssemblies would look like this:

    public class AppDomain
    {
        public static AppDomain CurrentDomain { get; private set; }

        static AppDomain()
        {
            CurrentDomain = new AppDomain();
        }

        public Assembly[] GetAssemblies()
        {
            var assemblies = new List<Assembly>();
            var dependencies = DependencyContext.Default.RuntimeLibraries;
            foreach (var library in dependencies)
            {
                if (IsCandidateCompilationLibrary(library))
                {
                    var assembly = Assembly.Load(new AssemblyName(library.Name));
                    assemblies.Add(assembly);
                }
            }
            return assemblies.ToArray();
        }

        private static bool IsCandidateCompilationLibrary(RuntimeLibrary compilationLibrary)
        {
            return compilationLibrary.Name == ("Specify")
                || compilationLibrary.Dependencies.Any(d => d.Name.StartsWith("Specify"));
        }
    }

## Summary
While AppDomains have been discontinued, for the time being at least, some of their functionality is still being provided. It is quite hard to find those features as they are spread across multiple NuGet packages and there is very little documentation at this stage. Issues on github are the best source of information, but there has been a high churn of APIs in this area and a lot of those discussions and APIs are out-of-date. If you have been hunting around for these features then I hope the code samples here will at least provide you with a good starting point and some clues as to where to find related features.
