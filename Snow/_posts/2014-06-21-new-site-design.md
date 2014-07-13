---
layout: post
title: New Site Design
categories: General
image: images/sswtvthumb.jpg
date: 2014-06-21
comments: true
sharing: true
footer: true
permalink: /new-site-design/
---

When I moved my blog to [Snow](https://github.com/Sandra/Sandra.Snow/wiki) I was lucky that it had a pretty nice theme out of the box - it is the same one that its creator [Phillip Haydon](http://www.philliphaydon.com/) uses on his blog. I have been doing a lot of front-end work lately though and I have some pretty strong preferences when I read blogs, so I couldn't resist the urge to style it up just the way I like it. 

The theme uses Bootstrap 3 and is fully responsive. Actually, I had a bit of a problem with it displaying on my iPhone. First it would display some posts half width, then it was cutting off the sides. I discovered that the key is in the viewport setting. It seems it's not sufficient to set the viewport to `device-width`. You also have to set the `initial-scale` and the `maximum-scale`.
<!--excerpt-->

	<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">

You can read more about it on [stack overflow](http://stackoverflow.com/questions/9386429/simple-bootstrap-page-is-not-responsive-on-the-iphone) and [mozilla](https://developer.mozilla.org/en-US/docs/Mozilla/Mobile/Viewport_meta_tag).

I am using the [GitHub colour theme](http://jmblog.github.io/color-themes-for-google-code-prettify/) for Google Code Prettify to style the code. I just tweaked it to have a grey background. 

I still don't wear glasses, which is pretty good after nearly 20 years coding, but I do like the font-size to be pretty large when I'm reading. I tend to magnify most pages as soon as I go to them. So that explains the very large font I'm using here.

I did a bit of mobile phone and different browser testing on BrowserStack, and I've tried it out out on all my devices, but my testing is far from exhaustive. Please let me know if you spot any issues on a particular device.