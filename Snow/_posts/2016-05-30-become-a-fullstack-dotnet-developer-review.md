---
layout: post
title: Review of Pluralsight's Become a Full-stack .Net Developer
categories: Learning
date: 2016-05-30 10:00:00
comments: true
sharing: true
footer: true
permalink: /become-a-fullstack-dotnet-developer/
---

This weekend was a long weekend in the UK, and my wife was away, so I took the opportunity to work through [Mosh Hamedani's](http://programmingwithmosh.com/) comprehensive 3 part course on Pluralsight, titled `Become a Full-stack .Net Developer`. The three part series aims to take you from a junior .Net developer through to a senior .Net developer by building an ASP.Net MVC 5 application with Entity Framework 6. I really enjoyed the course and thought I would provide a review of it.
<!--excerpt-->

The series is a whopping 14 hours in total, which is really, really long by Pluralsight standards. I would really recommend watching it though and will probably make it suggested watching for my dev teams.

I did intend to build out the whole thing while I watched but I abandoned that as it would have taken too long (though I would recommend doing that if you are a little less experienced). I revved up the speed to double and watched it like a movie. That's still 7 hours of watching, but well worth it.

According to Mosh, the series is aimed at the following audiences

	Part 1 => junior developer
	Part 2 => moving from junior developer to intermediate developer
	Part 3 => moving from intermediate developer to senior developer

Hearing that, a lot of experienced devs might move right along, but I'd encourage you to look a bit deeper. While the content is geared towards ASP.Net MVC 5 and Entity Framework 6, the most valuable takeaway is the approach of a senior developer. 

What impressed me the most was Mosh's discipline. He did not let himself get distracted by going off to google to research better solutions, but consistently stuck to the task at hand, OK with doing it a bit dirty at first, confident that with an iterative approach to development he would quickly circle back and remove any technical debt. I can be far less disciplined and find it so easy to get sidetracked on to some research or other yak shaving activity. There's so much to be said for completing the task!

My favourite part was the third and final part, which gets into architecture and automated testing and such, two topics close to my heart. But the first two are really good value as well. In fact, if Mosh didn't tell you they were aimed at the 3 levels you wouldn't know the difference. It's just that he starts off doing ugly things like newing up the DbContext directly in the controller so that he doesn't distract you with too many concepts at once. But slowly but surely, he refactors things until eventually you have a pretty clean architecture, with repositories/unit of work, and programming to interfaces that are injected with your IoC container. 

The style of the course is similar to pairing with an experienced developer who is just commentating on what he is doing and why. He shows a number of productivity tools, such as ReSharper, Web Essentials and the Productivity Power Tools. In particular, he shows a number of ReSharper shortcuts. Unfortunately, he uses the older IntelliJ shortcuts and I use the Visual Studio ones, but it was no problem to look up their Visual Studio counterparts on [their website](https://www.jetbrains.com/help/resharper/2016.1/Reference__Keyboard_Shortcuts.html).

You can view the courses [here](http://app.pluralsight.com/author/mosh-hamedani).

You can currently get 6 months of Pluralsight for free if you sign up for an [MSDN Dev Essentials](https://www.visualstudio.com/en-us/products/visual-studio-dev-essentials-vs.aspx) subscription.

I think Mosh is a really talented teacher and his style and focus on quality is quite distinctive from other teachers. I can also recommend some of his [Udemy courses](https://www.udemy.com/user/moshfeghhamedani/) that I've done. You can also find him on his [youtube channel](https://www.youtube.com/channel/UCWv7vMbMWH4-V0ZXdmDpPBA).

