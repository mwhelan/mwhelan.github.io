---
layout: post
title: Code compiling but ReSharper is red
categories: Visual Studio
image: images/sswtvthumb.jpg
date: 2015-06-19 10:00:00
comments: true
sharing: true
footer: true
permalink: /code-compiling-but-resharper-red/
---

From time-to-time, I have this weird situation with ReSharper and Visual Studios (different versions of both) where my code is compiling, but ReSharper is highlighting some things in red. I think there might be a few different solutions to this problem, and I'll add others here if I come across them. The solution that worked for me this time is just to [delete the .suo files](http://stackoverflow.com/questions/6040338/everything-compiles-but-resharper-marks-everything-in-red).
<!--excerpt-->

Another solution that has worked in the past is to clear the ReSharper cache and restart Visual Studio. 

    ReSharper > Options > Environment > General > Options > General 

Click the Clear Caches button.





