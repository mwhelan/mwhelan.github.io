---
layout: post
title: BDDfy in Action: Roll your own testing framework
categories: TestStack, BDDfy
description: A case study showing the extensibility of BDDfy.
date: 2013-05-25
comments: true
sharing: true
footer: true
permalink: /roll-your-own-testing-framework/
---

---excerpt
Throughout the BDDfy in Action series, Mehdi and I have talked about the extensibility of BDDfy. I thought it would be useful to put together some sample code to demonstrate some of these extension points, and to provide a reference point for some of your own customizations. To provide some cohesion to the examples, I thought I would set myself the task of modifying BDDfy to work as a context specification framework, similar to mspec, which was previously my unit testing framework of choice. 
---end

**This article is part of the [BDDfy In Action][1] series.**

Throughout the BDDfy in Action series, Mehdi and I have talked about the extensibility of BDDfy. I thought it would be useful to put together some sample code to demonstrate some of these extension points, and to provide a reference point for some of your own customizations. To provide some cohesion to the examples, I thought I would set myself the task of modifying BDDfy to work as a context specification framework, similar to mspec, which was previously my unit testing framework of choice. 

So, the requirements I have for this hypothetical custom framework are

- It should use the context specification grammar (Establish Context, Because Of, It Should) rather than the Given When Then grammar that BDDfy uses by default
- It should have a Class per Scenario style, like the [Testcase class per Fixture](http://xunitpatterns.com/Testcase%20Class%20per%20Fixture.html) pattern from Gerard Meszaros’ [XUnit Test Patterns](http://www.amazon.com/xUnit-Test-Patterns-Refactoring-Code/dp/0131495054/ref=sr_1_1?s=books&ie=UTF8&qid=1368296304&sr=1-1&keywords=xunit+test+patterns) book (a book which I highly recommend).
- It should not require any testing framework, such as NUnit or MsTest. In fact, the only dependency will be BDDfy.
- It should not require a test runner, such as TestDriven.Net or ReSharper
- I’m not a fan of attributes, so no attributes for the BDDfy Story, the test fixture or for the test methods
- The HTML report should be customised for my new framework. (Let’s call it Context Specifier).
- Finally, I would like to be able to run tests sequentially or in parallel
 
## ContextSpecification Base Class ##

I am going to start off with a base class to establish the context specification method template. I’ll also put a Story property here as an alternative to the Story attribute so that each specification can specify the Story that they belong to. BDDfy does not require Scenarios to have a Story, but it’s a convention I’m wanting to enforce for this framework! The Run method is what calls BDDfy to run the test. By default it will call BDDfy() and BDDfy will convert the class name into the scenario title. If I want to override that value I just need to set the ScenarioTitle in the class constructor and then it will be used with the BDDfy(scenarioTitle) overload.

This is actually the only time that BDDfy is called in this framework and the whole test suite. It is very DRY and I much prefer it to adding fixture and test attributes for every test. (By the way, even if I were using a framework like nunit/xunit this base class would still be the only place I would need to use their attributes or call BDDfy. Their runners are smart enough to find the test classes, which is a nice benefit of using inheritance in this sort of framework). 

    public abstract class ContextSpecification
    {
        protected virtual void EstablishContext() { }
        protected virtual void BecauseOf() { }

        public abstract UserStory Story { get; }

        public virtual string ScenarioTitle { get; set; }

        public void Run()
        {
            if (string.IsNullOrEmpty(ScenarioTitle))
            {
                this.BDDfy();
            }
            else
            {
                this.BDDfy(ScenarioTitle);
            }
        }
    }

With this base class in place I can write a class for each scenario. To do that, I’m going to modify the BDDfy ATM samples. The Context Specification style utilises the same four-phase test pattern as Arrange Act Assert or Given When Then, setting up the pre-conditions for the test in the Establish Context phase, exercising the system under test (SUT) in the Because Of phase, and then verifying expectations in the It Should phase. 

The user story is associated with the specification by setting the Story property to a new instance of a UserStory class - in this case the AtmWithdrawCashStory class. Notice that I am able to override the scenario title in the constructor, so the report will read "When account funds are less than zero" rather than "When account has insufficient funds" which BDDfy would derive from the class name.

    public class WhenAccountHasInsufficientFunds : ContextSpecification
    {
        private Card _card;
        private Atm _atm;

        public WhenAccountHasInsufficientFunds()
        {
            ScenarioTitle = "When account funds are less than zero";
        }

        protected override void EstablishContext()
        {
            _card = new Card(true, 10);
            _atm = new Atm(100);
        }

        protected override void BecauseOf()
        {
            _atm.RequestMoney(_card, 20);
        }

        public override UserStory Story
        {
            get { return new AtmWithdrawCashStory(); }
        }

        void ItShouldNotDispenseAnyMoney()
        {
            Assert.AreEqual(0, _atm.DispenseValue);
        }

        void AndItShouldSayThereAreInsufficientFunds()
        {
            Assert.AreEqual(DisplayMessage.InsufficientFunds, _atm.Message);
        }

        void AndItShouldHaveTheSameAccountBalance()
        {
            Assert.AreEqual(10, _card.AccountBalance);
        }

        void AndItShouldReturnTheCard()
        {
            Assert.IsFalse(_atm.CardIsRetained);
        }
    }

## The Context Specification Grammar ##

To use my new grammar instead of the default BDDfy Given When Then grammar I need to tell BDDfy how to find step methods on the class, which I can do by replacing the BDDfy DefaultMethodNameStepScanner with a new MethodNameStepScanner. BDDfy defines the Given When Then grammar in the DefaultMethodNameStepScanner and the easiest way to create a new scanner is to copy and modify that. 

	public class ContextSpecificationStepScanner : MethodNameStepScanner
	{
	    public ContextSpecificationStepScanner()
	        : base(
	            CleanupTheStepText,
	            new[]
	            {
	                new MethodNameMatcher(s => s.StartsWith("EstablishContext", StringComparison.OrdinalIgnoreCase), false, ExecutionOrder.SetupState, false),
	                new MethodNameMatcher(s => s.StartsWith("BecauseOf", StringComparison.OrdinalIgnoreCase), false, ExecutionOrder.Transition, false),
	                new MethodNameMatcher(s => s.StartsWith("It", StringComparison.OrdinalIgnoreCase), true, ExecutionOrder.Assertion, true),
	                new MethodNameMatcher(s => s.StartsWith("AndIt", StringComparison.OrdinalIgnoreCase), true, ExecutionOrder.ConsecutiveAssertion, true)
	            })
	    {
	    }
	
	    static string CleanupTheStepText(string stepText)
	    {
	        if (stepText.StartsWith("EstablishContext", StringComparison.OrdinalIgnoreCase))
	            return "Establish context ";
	
	        if (stepText.StartsWith("BecauseOf", StringComparison.OrdinalIgnoreCase))
	            return "Because of ";
	
	        if (stepText.StartsWith("AndIt ", StringComparison.OrdinalIgnoreCase))
	            return stepText.Remove("and".Length, "It".Length);
	            
	        return stepText;
	    }
	}

The custom scanner requires two parameters in the constructor; a step text transformer and an array of MethodNameMatchers. Each MethodNameMatcher defines a predicate to identify if the method matches, whether or not the method is an assertion, the type of method it is, and whether it should be displayed on the report. With Given When Then steps you want to display all of the steps on the report. With my context specification grammar I just want to display the name of the class and the assertions, so I specify false for the shouldReport parameter of the “EstablishContext” and “BecauseOf” steps so that they won’t display on the report. This is not something we recommend, as it would be helpful to receive error messages for those steps if they fail, but it makes sense for reporting purposes with this grammar as repeating EstablishContext and BecauseOf would not be much use on the report (and a reason why Given When Then grammar is preferable to this one).

Once I have my new grammar I need to tell BDDfy to use it by using the Configurator to disable the default scanner and to add the new one:

	Configurator.Scanners.DefaultMethodNameStepScanner.Disable();
	Configurator.Scanners.Add(() => new ContextSpecificationStepScanner());

## Replacing the BDDfy Story Attribute ##

The next thing on my list is the Story. BDDfy uses an attribute on the test class to specify the Story that the Scenario test class belongs to. You are not limited to this though, and like most things in BDDfy, you are able to customise this behaviour if you want. I’m going to create a simple UserStory class that stores Story metadata. It is just a standard class that does not implement any BDDfy behaviours. I could potentially just use the BDDfy StoryMetaData class directly, but I will keep things separate for now.

    public abstract class UserStory
    {
        public string Title { get; set; }
        public string AsA { get; set; }
        public string IWant { get; set; }
        public string SoThat { get; set; }
    }


To create a new story class, I just have to inherit from the UserStory class and set the metadata properties in its constructor. Here is the AtmWithdrawCashStory from the example above.

    public class AtmWithdrawCashStory : UserStory
    {
        public AtmWithdrawCashStory()
        {
            Title = "Withdrawing cash from the ATM";
            AsA = "As an Account Holder";
            IWant = "I want to withdraw cash from an ATM";
            SoThat = "So that I can get money when the bank is closed";
        }
    }

To tell BDDfy how to find these Stories and match them to the appropriate Scenario, I need to implement a new Story Metadata Scanner to associate the Scenario test class with its Story.

	public class StoryMetaDataScanner : IStoryMetaDataScanner
	{
	    public StoryMetaData Scan(object testObject, Type explicitStoryType = null)
	    {
	        var specification = testObject as ContextSpecification;
	        if (specification == null)
	            return null;
	
	        var story = specification.Story;
	
	        return new StoryMetaData(story.GetType(), story.AsA, story.IWant, story.SoThat, story.Title);
	    }
	}

My convention of having all my test classes inherit from the base ContextSpecifcation comes in handy here as it enables me to easily get access to the Story property and use it to create the StoryMetaData that BDDfy needs. Now, I can just replace the BDDfy StoryMetaDataScanner with my custom one using the Configurator.

	Configurator.Scanners.StoryMetaDataScanner = () => new StoryMetaDataScanner();

## Customizing the HTML Report ##

I want to change the HTML report to have the name and description of the framework and to change the name of the html file that is generated. You can do this by inheriting from the DefaultHtmlReportConfiguration class. 

    public class CustomHtmlReportConfiguration : DefaultHtmlReportConfiguration
    {
        public override string ReportHeader
        {
            get
            {
                return "Context Specifier";
            }
        }

        public override string ReportDescription
        {
            get
            {
                return "A simple context specification framework for .Net developers";
            }
        }

        public override string OutputFileName
        {
            get
            {
                return "ContextSpecifications.html";
            }
        }
    }

I can then turn off the default HTML Report and plug the custom one in instead:

	Configurator.BatchProcessors.HtmlReport.Disable();
	Configurator.BatchProcessors.Add(new HtmlReporter(new CustomHtmlReportConfiguration()));
 
## Test Runner ##
The Test Runner is quite straightforward. We just have to instantiate all of the specification classes and call the Run method. You could new up each class, use reflection to find all the classes that derive from ContextSpecification (as I’ve done here) or use an IoC container to store and retrieve them. 

    public class TestRunner
    {
        public void Run()
        {
            RunTestsSequentially();
            RunBatchProcessors();
        }

        private void RunTestsSequentially()
        {
            //new WhenAccountHasInsufficientFunds().Run();
            //new WhenCardHasBeenDisabled().BDDfy();
            //new WhenAccountHasSufficientFunds().BDDfy();

            GetSpecs().Each(spec => SafeRunSpec(spec));
        }

        private void SafeRunSpec(ContextSpecification spec)
        {
            try
            {
                spec.Run();
            }
            catch (Exception)
            {
            }
        }

        private void RunBatchProcessors()
        {
            foreach (var batchProcessor in Configurator.BatchProcessors.GetProcessors())
            {
                batchProcessor.Process(StoryCache.Stories);
            }
        }

        private List<ContextSpecification> GetSpecs()
        {
            return this.GetType()
                       .Assembly
                       .GetTypes()
                       .Where(type => type.IsSubclassOf(typeof(ContextSpecification)))
                       .Select(Activator.CreateInstance)
                       .Cast<ContextSpecification>()
                       .ToList();
        }
    }


If you were to just run the tests like this then you would see the Console Report display all the tests in the console window. However, none of the Batch Processors, such as the HTML Report, would run. BDDfy runs these in the AppDomain_Unload event and one down side of my running in a console app is that [this event is not raised in the default application domain](http://msdn.microsoft.com/en-us/library/system.appdomain.domainunload%28VS.90%29.aspx). No worries, BDDfy makes it easy to run ourselves so I’ve added the RunBatchProcessors method. If you check the bin directory of the console application you will see our customised HTML Report with the context specification grammar.

## Wiring It All Up ##
All that is left is to wire up a console application to run the tests. The first step is to configure BDDfy, which I’ve already shown. To run the tests I just need to instantiate the TestRunner and call the Run method.

	class Program
	{
	    static void Main(string[] args)
	    {
	        ConfigureBDDfy();
	        new TestRunner().Run();
	
	        Console.ReadLine();
	    }
	
	    private static void ConfigureBDDfy()
	    {
	        Configurator.Scanners.DefaultMethodNameStepScanner.Disable();
	        Configurator.Scanners.Add(() => new ContextSpecificationStepScanner());
	
	        Configurator.Scanners.StoryMetaDataScanner = () => new StoryMetaDataScanner();
	
	        Configurator.BatchProcessors.HtmlReport.Disable();
	        Configurator.BatchProcessors.Add(new HtmlReporter(new CustomHtmlReportConfiguration()));
	    }
	}

If you go to the bin directory of the test project you should see the report file with the custom name, "ContextSpecifications.html," and all of the custom content inside it. 

![](/images/bddfy-custom-framework-report.png)

So, there it is. A bit of a contrived example, but hopefully it has highlighted some of the extensibility points that BDDfy offers and provided some food for thought for some customizations that you might like to try yourself. I've left the parallel testing requirement for the [next post](http://michael-whelan.net/roll-your-own-testing-framework-2).

The code is available on github:
[https://github.com/mwhelan/BDDfySamples](https://github.com/mwhelan/BDDfySamples)

  [1]: /bddfy-in-action/
