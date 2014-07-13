---
layout: post
title: Moving my blog to Snow and GitHub Pages
categories: General
image: images/sswtvthumb.jpg
date: 2014-06-14
comments: true
sharing: true
footer: true
permalink: /moving-blog-to-snow/
---

Most of my work has involved ASP.Net MVC and SQL Server, so it seemed natural to gravitate towards blogging platforms that used those technologies. Initially, I used [NBlog](http://nblog.codeplex.com/), which was a great little blogging engine, then I moved to [FunnelWeb](http://www.funnelweblog.com/), which seemed to have a larger community around it and was used by people I knew. My work has expanded a bit to other technologies, such as RavenDB and AngularJS, and I’ve become more open to the idea of using my blog to experiment with new technologies and approaches. I have noticed more and more people moving towards static site generators, and the simplicity really appealed . I also use Git and GitHub a lot more now and the idea of a blog publishing workflow involving Git makes a lot of sense to me. Add in GitHub Pages for free hosting and what could be better?
<!--excerpt-->

![Snow](/images/moving-to-snow-logo.png)

When looking around for the right static site generator, I still felt more drawn to .Net-based solutions, so when I stumbled across [Sandra.Snow](https://github.com/Sandra/Sandra.Snow) it seemed ideal. My fellow Kiwi [Phillip Haydon](http://www.philliphaydon.com/) leads the project and has been amazingly responsive at answering my questions, even writing code to add my feature requests! Sandra.Snow is a Jekyll inspired static site generation tool that can be run locally, as a CAAS(Compiler as a Service) or setup with Azure to build your site when your repository changes. It is built on top of NancyFX, you can easily write your own themes in Razor, and it supports Git deployment. I am hosting it on GitHub Pages, though I am quite tempted to host it on Azure (after reading [Filip Ekberg’s excellent post](http://blog.filipekberg.se/2014/05/21/goodbye-wordpress-hello-snow/) on using continuous delivery with GitHub and Azure with Snow).

Snow uses markdown files for blog posts. I used markdown for both my NBlog and FunnelWeb blogs, so migration was pretty simple. My friend, [Jake Ginnivan](http://jake.ginnivan.net/), had put together a clever little [LinqPad utility](http://jake.ginnivan.net/blog/2014/01/06/blog-migration/) for migrating posts and images from FunnelWeb SQL Server tables to Jekyll markdown files, and these worked well with Snow.

I already have my comments hosted in Disqus, so coupled with simple markdown files for my blog posts/images, I feel like I’ve got a pretty flexible and portable solution.

