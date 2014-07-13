---
layout: post
title: Using PhantomJS and GhostDriver with Selenium WebDriver in .Net
cateogries: Selenium, phantomjs
description: With the recent release of GhostDriver I thought I would take a look at using PhantomJS with WebDriver.
date: 2013-01-09
comments: true
sharing: true
footer: true
permalink: /using-phantomjs-with-webdriver/
---

With GhostDriver 1.0 [recently being released][1] I was keen to check out using PhantomJS with WebDriver. I couldn’t find any .Net examples so I thought I would post one myself. 

[PhantomJS][2] is a headless browser. That means it is a web browser, but the rendered web pages are never actually displayed. This makes it fast and an excellent candidate for speeding up those slow functional tests. According to their website PhantomJS is “a headless WebKit with JavaScript API.” Webkit is the layout engine used by a few browsers, such as Chrome and Safari. So PhantomJS is a browser, but a headless one. 
<!--excerpt-->

[Ghost Driver][3], a project by Ivan De Marino, is a pure JavaScript implementation of the Selenium [WebDriver Wire Protocol][4]. In other words, it's a Remote WebDriver that uses PhantomJS as the back-end. GhostDriver is designed to be an integral part of PhantomJS itself and recently PhantomJS 1.8 was released with GhostDriver integrated into it. Bindings for PhantomJS can be found in 
WebDriver versions 2.27 and above.

## A simple example
To see it in action, open a Visual Studio class library project. The first thing you need to do is get WebDriver and PhantomJS. Both are available via NuGet.

<code style="background-color: #202020;border: 4px solid silver;border-radius: 5px;-moz-border-radius: 5px;-webkit-border-radius: 5px;box-shadow: 2px 2px 3px #6e6e6e;color: #E2E2E2;display: block;font: 1.5em 'andale mono', 'lucida console', monospace;line-height: 1.5em;overflow: auto;padding: 15px;
">PM&gt; Install-Package Selenium.WebDriver
</code>

<code style="background-color: #202020;border: 4px solid silver;border-radius: 5px;-moz-border-radius: 5px;-webkit-border-radius: 5px;box-shadow: 2px 2px 3px #6e6e6e;color: #E2E2E2;display: block;font: 1.5em 'andale mono', 'lucida console', monospace;line-height: 1.5em;overflow: auto;padding: 15px;
">PM&gt; Install-Package phantomjs.exe
</code>

Go into the PhantomJS packages folder and copy the phantomjs.exe file into the test project. Set the Copy to Output Directory property to Copy if newer so that the phantomjs.exe file will be in the bin directory when the tests are run.

This test just navigates to google, performs a search and views the results.

    [TestFixture]
    public class PhantomjsTests
    {
        private IWebDriver _driver;
    
        [SetUp]
        public void SetUp()
        {
            _driver = new PhantomJSDriver();
        }
    
        [Test]
        public void should_be_able_to_search_google()
        {
            _driver.Navigate().GoToUrl("http://www.google.com");
    
            IWebElement element = _driver.FindElement(By.Name("q"));
            string stringToSearchFor = "BDDfy";
            element.SendKeys(stringToSearchFor);
            element.Submit();
    
            Assert.That(_driver.Title, Is.StringContaining(stringToSearchFor));
            ((ITakesScreenshot)_driver).GetScreenshot().SaveAsFile("google.png", ImageFormat.Png);
        }
    
        [TearDown]
        public void TearDown()
        {
            _driver.Quit();
        }
    }    

In case you are sceptical as to whether anything actually happened, check out the screenshot google.png file in the test project bin directory. As you would expect, it shows the google results, just as they would appear in a browser.

Excellent! It seems that PhantomJS and GhostDriver are just as simple and easy to use as any other WebDriver implementation. I look forward to digging a bit deeper and seeing what sort of benefits headless browser testing has for my functional tests. 

  [1]: http://blog.ivandemarino.me/2012/12/04/Finally-GhostDriver-1-0-0
  [2]: http://phantomjs.org/
  [3]: https://github.com/detro/ghostdriver
  [4]: http://code.google.com/p/selenium/wiki/JsonWireProtocol
