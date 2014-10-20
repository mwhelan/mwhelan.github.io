---
layout: post
title: Testing DateTime
categories: Automated Testing
date: 2014-10-20
comments: true
sharing: true
footer: true
permalink: /testing-datetime/
---

Static methods and properties tend to be difficult to test. You cannot easily mock them, unless you use something like Microsoft Moles. DateTime.Now is a notorious example of a difficult to test static. 
<!--excerpt-->

The offending piece of code that inspired me to write this post was a method I was adding to Seleno today. 

	public void TakeScreenshotAndThrow(string imageName, string errorMessage)
	{
	    Camera.TakeScreenshot(string.Format(imageName + DateTime.Now().ToString("yyyy-MM-dd_HH-mm-ss") + ".png"));
	    throw new SelenoException(errorMessage);
	}

## DateTime Abstraction
Often  this problem can be solved by abstracting the static away behind an interface and then using dependency injection to inject the implementation of the interface. 

    public interface ISystemTime
    {
        DateTime Now { get; }
    }

    public class TheSystemTime : ISystemTime
    {
        public DateTime Now { get { return DateTime.Now; } }
    }

	public class SelenoApplication
	{
		private ISystemTime _systemTime;
        public SelenoApplication(ISystemTime systemTime)
        {
            _systemTime = systemTime;
        }

        public void TakeScreenshotAndThrow(string imageName, string errorMessage)
        {
            Camera.TakeScreenshot(string.Format(imageName + _systemTime.Now.ToString("yyyy-MM-dd_HH-mm-ss") + ".png"));
            throw new SelenoException(errorMessage);
        }
    }

Then you can easily mock the interface in your tests. I'm using NSubstitute here.

    var dateTime = new DateTime(2014, 05, 11, 10, 29, 33);
    var systemTime = Substitute.For<ISystemTime>();
    systemTime.Now.Returns(dateTime);

This is the solution that I would normally use to test a static, but DateTime is a bit different. Firstly, the use of DateTime can be quite extensive and you can quickly find you have too many of these interfaces polluting your constructors. Secondly, if you are doing DDD then you don't want to use dependency injection with your domain entities, yet they often need DateTime functions as well. 

The solution I like to use is one Ayende [blogged about in 2008](http://ayende.com/blog/3408/dealing-with-time-in-tests) where you use a func as a replacement for the DateTime.Now call.

    public static class SystemTime
    {
        public static Func<DateTime> Now = () => DateTime.Now;

        public static void Reset()
        {
            Now = () => DateTime.Now;
        }
    }

So, now you call `SystemTime.Now()` instead of `DateTime.Now`.

    public void TakeScreenshotAndThrow(string imageName, string errorMessage)
    {
        Camera.TakeScreenshot(string.Format(imageName + SystemTime.Now().ToString("yyyy-MM-dd_HH-mm-ss") + ".png"));
        throw new SelenoException(errorMessage);
    }

And set the value of Now in your test, not forgetting to reset it at the end of the test.

    SystemTime.Now = () => new DateTime(2014, 05, 11, 10, 29, 33);
    Action result = () => _host.Application.TakeScreenshotAndThrow(imageName, errorMessage);
    result.ShouldThrow<SelenoException>()
        .WithMessage(errorMessage);
	SystemTime.Reset();

##TestableSystemTime
One objection to this approach is that the developer might forget to reset the time at the end of the test. Which leads me to the point of this post. Utilising the dispose pattern is a nice way to get around this objection.

I'm not sure where I saw this solution applied to testing DateTime, so apologies if I am not giving credit where it's due. I do remember where I learned about using the dispose pattern in this way - from my good friend Mehdi Khalili in the BDDfy codebase. He used it to [close HTML tags](https://github.com/TestStack/TestStack.BDDfy/blob/master/TestStack.BDDfy/Reporters/Html/HtmlReportTag.cs) in the BDDfy HTML Report.

	public class TestableSystemTime : IDisposable
    {
        public TestableSystemTime(DateTime dateTime)
        {
            SystemTime.Now = () => dateTime;
        }

        public TestableSystemTime(Func<DateTime> dateTimeFactory)
        {
            SystemTime.Now = dateTimeFactory;
        }

        public void Dispose()
        {
            SystemTime.Reset();
        }
    }

Now we can use it in a using statement in tests and be sure that the `Reset` method gets call at the end of the using statement when `Dispose` is called.

    using (new TestableSystemTime(dateTime))
    {
        Action result = () => _host.Application.TakeScreenshotAndThrow(imageName, errorMessage);
        result.ShouldThrow<SelenoException>()
            .WithMessage(errorMessage);
    }

Alternatively you can create the date on the fly with the func constructor:

	using (new TestableSystemTime(() => new DateTime(2014, 05, 11, 10, 29, 33)))

##What about BDD-style tests?
It's not always desirable to use a using statement. For example, if you are using a BDD-style, which I tend to do, then your statements are broken over multiple methods, and a using statement is not an option. In that case, you just call the Reset method at the end of the test yourself, as you can see in the TearDown method in this example:

    class When_taking_screenshot : SelenoApplicationSpecification
    {
        private string _imageName = "screenshot";
        private string _errorMessage = "there was an error";
        private string _fileName;
        private Exception _result;

        public override void EstablishContext()
        {
            var dateTime = new DateTime(2014, 05, 11, 10, 29, 33);
            _fileName = string.Format(@"{0}{1}.png", _imageName, dateTime.ToString("yyyy-MM-dd_HH-mm-ss"));
            SystemTime.Now = () => dateTime;
        }

        public void Given_initialised_application()
        {
            SUT.Initialize();
        }

        public void When_taking_screenshot_and_throwing()
        {
            _result = Catch.Exception(() => SUT.TakeScreenshotAndThrow(_imageName, _errorMessage));
        }

        public void Then_should_take_screenshot()
        {
            SubstituteFor<ICamera>().Received().TakeScreenshot(_fileName);
        }

        public void AndThen_should_throw_SelenoException()
        {
            _result.Should().BeOfType<SelenoException>()
                .Which.Message.Should().Be(_errorMessage);
        }

        public override void TearDown()
        {
            SystemTime.Reset();
        }
    }
