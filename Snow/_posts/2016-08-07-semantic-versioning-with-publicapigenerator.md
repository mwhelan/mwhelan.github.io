---
layout: post
title: Semantic Versioning Tests with PublicApiGenerator
categories: General
date: 2016-08-07 08:00:00
comments: true
sharing: true
footer: true
permalink: /semantic-versioning-with-publicapigenerator/
---

When you are following [semantic versioning](http://semver.org/) for the public API of your software package, it can be quite easy to accidentally change the API. [Jake Ginnivan](https://twitter.com/JakeGinnivan) wrote the [PublicApiGenerator](https://www.nuget.org/packages/PublicApiGenerator/) package to generate the public API of your package as a string. That way, you can write a unit test that verifies the contents of the string hasn't changed, using an approval test framework, such as [Shouldly](http://shouldly.readthedocs.io/en/latest/) or [ApprovalTests](http://approvaltests.com/).
<!--excerpt-->

The first thing that you need to do is install the Public Api Generator package into your test project.

	Install-Package PublicApiGenerator

Then write a unit test, calling the `GetPublicApi` method on the static `PublicApiGenerator` class, passing in the assembly that you want to generate the API for. 

    [Test]
    public void specify_autofac_has_no_public_api_changes()
    {
        var publicApi = PublicApiGenerator.PublicApiGenerator.GetPublicApi(typeof(AutofacContainer).Assembly);
        publicApi.ShouldMatchApproved();
    }

The test then calls Shouldly's `ShouldMatchApproved` method, which generates a text file with the contents of the public API string in the form [ClassName].[TestName].received.txt. For example, in this case the file name is SemanticVersioningTests.specify_autofac_has_no_public_api_changes.received.txt.

	[assembly: System.Runtime.CompilerServices.InternalsVisibleToAttribute("Specify.IntegrationTests")]
	[assembly: System.Runtime.InteropServices.ComVisibleAttribute(false)]
	[assembly: System.Runtime.InteropServices.GuidAttribute("2cb27234-4675-4f6b-b165-052ff7e5fa5e")]
	[assembly: System.Runtime.Versioning.TargetFrameworkAttribute(".NETFramework,Version=v4.0", FrameworkDisplayName=".NET Framework 4")]
	
	namespace Specify.Autofac
	{  
	    public class AutofacContainer : Specify.IContainer, System.IDisposable
	    {
	        protected Autofac.ContainerBuilder _containerBuilder;
	        public AutofacContainer() { }
	        public AutofacContainer(Autofac.ILifetimeScope container) { }
	        public AutofacContainer(Autofac.ContainerBuilder containerBuilder) { }
	        public Autofac.ILifetimeScope Container { get; }
	        public bool CanResolve<T>()
	            where T :  class { }
	        public bool CanResolve(System.Type serviceType) { }
	        public void Dispose() { }
	        public T Get<T>(string key = null)
	            where T :  class { }
	        public object Get(System.Type serviceType, string key = null) { }
	        public void Set<T>()
	            where T :  class { }
	        public void Set<TService, TImplementation>()
	            where TService :  class
	            where TImplementation :  class, TService { }
	        public T Set<T>(T valueToSet, string key = null)
	            where T :  class { }
	    }
	    public class AutofacMockRegistrationHandler : Autofac.Core.IRegistrationSource
	    {
	        public AutofacMockRegistrationHandler(Specify.Mocks.IMockFactory mockFactory) { }
	        public bool IsAdapterForIndividualComponents { get; }
	        public System.Collections.Generic.IEnumerable<Autofac.Core.IComponentRegistration> RegistrationsFor(Autofac.Core.Service service, System.Func<Autofac.Core.Service, System.Collections.Generic.IEnumerable<Autofac.Core.IComponentRegistration>> registrationAccessor) { }
	    }
	    public class DefaultAutofacBootstrapper : Specify.Configuration.BootstrapperBase
	    {
	        public DefaultAutofacBootstrapper() { }
	        protected override Specify.IContainer BuildApplicationContainer() { }
	        public virtual void ConfigureContainer(Autofac.ContainerBuilder builder) { }
	    }
	    public class SpecifyAutofacConfigScanner : Specify.Configuration.Scanners.ConfigScanner
	    {
	        public SpecifyAutofacConfigScanner(Specify.Mocks.IFileSystem fileSystem) { }
	        public SpecifyAutofacConfigScanner() { }
	        protected override System.Type DefaultBootstrapperType { get; }
	    }
	}

Because this is the first time the test has been run, the file will be opened in your diff tool so that you can see any changes that have occurred. To make the test pass, just rename "received" to "approved." Now, if the API ever changes, a different API string will be generated in the "received" file and the test will fail, opening your diff tool to show you the changes and allow you to approve them (or change the API back if the change was unintentional). This diagram shows the diff in the Beyond Compare tool.

![PublicApiGenerator diff in Beyond Compare](/images/publicapigenerator-diff.png)

## Summary
Public Api Generator and an approval test framework are a great combination for determining if the public API of your package have changed, allowing you to approve the change if it was intentional, and warning you to revert a change if it was accidental.