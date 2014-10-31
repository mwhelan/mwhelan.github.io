---
layout: post
title: BDDfy Chilled
categories: Automated Testing, BDDfy
date: 2014-10-31
comments: true
sharing: true
footer: true
permalink: /bddfy-chilled/
---

I like to use BDDfy for unit testing as well as for black-box testing. Unit tests do not have the concept of user stories, but otherwise I like to use the same `Given When Then` style of testing for all of my tests, and I think that I should have the same quality of reporting for my unit tests as for my acceptance tests. I have my own framework of code that I've built on top of BDDFy that I take from project to project. It gets a little tweaked each time, from NUnit to xUnit, or Moq to NSubstitute, or Castle Windsor to Autofac, depending on the tools each project uses. BDDfy is wonderfully customisable so you are free to make your test framework just they way you want it.

I decided it would make sense to make the mocking/Ioc containers pluggable and publish the library to NuGet. I'm a big fan of Autofac and NSubstitute, and had noticed that Autofac provides automocking container implementations for most of the major mocking frameworks. Then I stumbled on Chill, and found out that Erwin van der Valk was already doing something pretty similar and had done a great job with pluggable mocking containers, with future plans for IoC containers too. Chill is a BDD style testing framework.   
<!--excerpt-->


> If you stick it in a container, Chill will keep it cool.

So, I messed around with combining BDDfy with Chill and thought the initial findings were worth sharing. I think this investigation will more than likely be superceded by Chill, as Erwin mentioned he is interested in the possibility of combining BDDfy with Chill. As usual, you can get the code on [GitHub](https://github.com/mwhelan/BDDfyChilled).  

## Specification For
Chill uses the same [testcase class per fixture](http://xunitpatterns.com/Testcase%20Class%20per%20Fixture.html) , inheritance-based, style that I favour, so the first step was just to inherit from the `Subject` base classes. I need to add a method with the test framework attribute, [Test] for NUnit and [Fact] for xUnit, and call out to BDDFy to run the test. Thankfully, this is the only time I need to do that and all of my test implementation classes do not need any attributes. I would put each of these namespaces in its own library per test framework - I've not managed to find a way around that yet - but I've just combined them here for illustrative purposes.

    namespace BDDfyChilled.xUnit
    {
        public abstract class SpecificationFor<TSubject> : GivenSubject<TSubject> where TSubject : class
        {
            [Fact]
            public void Run()
            {
                this.BDDfy();
            }
        }

        public abstract class SpecificationFor<TSubject, TResult> : GivenSubject<TSubject, TResult> where TSubject : class
        {
            [Fact]
            public void Run()
            {
                this.BDDfy();
            }
        }
    }
    namespace BDDfyChilled.NUnit
    {
        public abstract class SpecificationFor<TSubject> : GivenSubject<TSubject> where TSubject : class
        {
            [Test]
            public void Run()
            {
                this.BDDfy();
            }
        }
        public abstract class SpecificationFor<TSubject, TResult> : GivenSubject<TSubject, TResult> where TSubject : class
        {
            [Test]
            public void Run()
            {
                this.BDDfy();
            }
        }
    }

Now I can create my test implementation class, combining the best of both worlds of BDDfy and Chill. BDDfy uses reflection to discover and run all of the test methods, and Chill provides all sorts of infrastructure to manage the Subject (or System Under Test), its dependencies, and other test data. Chill is handling the setup (the Givens), the execution (When). [Fluent Assertions](http://www.fluentassertions.com/) rounds out the combination by handling the assertions (Thens) for a nice, terse specification. Awesome stuff!

    [ChillTestInitializer(typeof(DefaultChillTestInitializer<AutofacNSubstituteChillContainer>))]
    public class RetrievingExistingCustomerAsynchronously : SpecificationFor<CustomerController, View>
    {
        const int customerId = 12;

        public void Given_an_existing_customer()
        {
            Given(() =>
            {
                The<Customer>()
                    .With(x => x.Id = customerId);

                The<ICustomerStore>()
                    .GetCustomerAsync(customerId)
                    .Returns(The<Customer>().Asynchronously());
            });
        }

        public void When_retrieving_the_customer_asynchronously()
        {

            When(() => Subject.GetAsync(customerId));
        }

        public void Then_view_is_returned()
        {
            Result.Should().NotBeNull();
        }

        public void AndThen_model_is_the_existing_custmoer()
        {
            Result.Model.Should().Be(The<Customer>());
        }
    }

## Custom BDDfy Method Name Step Scanner
Understandably, because Chill and BDDfy are both BDD frameworks, they both use the Given When Then syntax. When I run the test right now I get this error. BDDfy is calling the `Given`, `When`, and `TheNamed` methods on the Chill base class.

	Specifications For: CustomerController

	Scenario: Retrieving existing customer asynchronously
		Given an existing customer                        [Passed] 
		Given                                             [Failed] [Parameter count mismatch.] [Details at 1 below]
		When retrieving the customer asynchronously       [Not executed] 
		When                                              [Not executed] 
		When                                              [Not executed] 
		Then view is returned                             [Not executed] 
		The named                                         [Not executed] 
		  And model is the existing custmoer              [Not executed] 

We don't want BDDfy to run the Chill methods that conform to its Given When Then pattern. Fortunately, BDDfy allows you to replace the reflection method name step scanner. Here are the key changes - telling BDDfy to ignore the Chill methods named `Given`, `When` and `TheNamed`.

    AddMatcher(new MethodNameMatcher(s => s.StartsWith("Given", StringComparison.OrdinalIgnoreCase) 
		&& s != "Given", ExecutionOrder.SetupState));
    AddMatcher(new MethodNameMatcher(s => s.StartsWith("When", StringComparison.OrdinalIgnoreCase) 
		&& s != "When", ExecutionOrder.Transition));
    AddMatcher(new MethodNameMatcher(s => s.StartsWith("Then", StringComparison.OrdinalIgnoreCase) 
		&& s != "TheNamed", ExecutionOrder.Assertion) { Asserts = true });

and then tell BDDfy to use the new scanner:

    Configurator.Scanners.DefaultMethodNameStepScanner.Disable();
    Configurator.Scanners.Add(() => new ChillMethodNameStepScanner());

Quite simple really, and now BDDfy and Chill play nicely together.

![BDDfy report](/images/bddfy-chilled-report.png)

## Custom Report
Because these are just unit tests, and don't have user stories, I've created a custom metadata scanner to display `Specifications For: [Subject]` (in this case the Subject is the CustomerController), which just uses reflection to grab the name of the Subject type.

    public class ChillStoryMetadataScanner : IStoryMetadataScanner
    {
        public virtual StoryMetadata Scan(object testObject, Type explicityStoryType = null)
        {
            string specificationTitle = GetSubject(testObject);
            var story = new StoryAttribute() { Title = specificationTitle, TitlePrefix = "Specifications For: " };
            return new StoryMetadata(testObject.GetType(), story);
        }

        private string GetSubject(object testObject)
        {
            return testObject
                .GetType()
                .GetProperty("Subject", BindingFlags.Instance | BindingFlags.NonPublic)
                .PropertyType
                .Name;
        }
    }

I've also created a report configuration to change the header:

    public class ChillBDDfyReportConfig : DefaultHtmlReportConfiguration
    {
        public override string ReportHeader { get { return "BDDfy Chilled!"; }}
    }

And plugged them both in using the BDDfy Configurator before any of the tests run.

    [SetUpFixture]
    public class Host
    {
        [SetUp]
        public void SetUp()
        {
            Configurator.Scanners.DefaultMethodNameStepScanner.Disable();
            Configurator.Scanners.Add(() => new ChillMethodNameStepScanner());

            Configurator.Scanners.StoryMetadataScanner = () => new ChillStoryMetadataScanner();

            Configurator.BatchProcessors.HtmlReport.Disable();
            Configurator.BatchProcessors.Add(new HtmlReporter(new ChillBDDfyReportConfig()));
        }
    }

## Conclusion
I think BDDfy and Chill are a great combination and I'm looking forward to keeping an eye on the new features that Eriwn is adding to Chill to see more ways that I might be able to use them together. 