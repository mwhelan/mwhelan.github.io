---
layout: post
title: Selenium WebDriver and IE11
categories: Automated Testing, Seleno
date: 2014-10-18
comments: true
sharing: true
footer: true
permalink: /selenium-webdriver-and-ie11/
---

I was updating the browser WebDrivers for [Seleno](https://github.com/TestStack/TestStack.Seleno) when I hit an issue with the InternetExplorerDriver. I was running Selenium WebDriver 2.43.1 on Windows 8.1 and using Internet Explorer 11. The test was just opening the google web page. Internet Explorer opened correctly and displayed the google page but then the test failed with the error:

	OpenQA.Selenium.NoSuchWindowException : Unable to get browser

It turns out this is an [issue with Internet Explorer 11 rather than the InternetExplorerDriver](https://code.google.com/p/selenium/issues/detail?id=6511). This causes the InternetExplorerDriver to lose the connection to the instance of Internet Explorer it created.
<!--excerpt-->

## All security zones should be set to the same Protected Mode setting
I found that setting the Local Intranet zone's `Enable Protected Mode` setting to true solved my problem for me.

1. Press the `Alt` key to bring up the IE11 menu bar.  
2. Select `Tools > Internet Options` and go to the `Security` tab.
3. Select each zone (Internet, Local intranet, Trusted sites, Restricted sites) and check the `Enable Protected Mode` check box.

## Other Options
A number of people reported that adding the domain they were testing to the list of "Trusted Sites" solved this problem for them. You can also do this on the Security tab of Internet Options. 

The [wiki page](https://code.google.com/p/selenium/wiki/InternetExplorerDriver) for the InternetExplorer also details a registry setting that you can apply to deal with this problem.

> For IE 11 only, you will need to set a registry entry on the target computer so that the driver can maintain a connection to the instance of Internet Explorer it creates. For 32-bit Windows installations, the key you must examine in the registry editor is HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Internet Explorer\Main\FeatureControl\FEATURE_BFCACHE. For 64-bit Windows installations, the key is HKEY_LOCAL_MACHINE\SOFTWARE\Wow6432Node\Microsoft\Internet Explorer\Main\FeatureControl\FEATURE_BFCACHE. Please note that the FEATURE_BFCACHE subkey may or may not be present, and should be created if it is not present. Important: Inside this key, create a DWORD value named iexplore.exe with the value of 0.




