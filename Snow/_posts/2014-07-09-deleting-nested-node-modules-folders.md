---
layout: post
title: Deleting Nested node_modules Folders
categories: General
image: images/sswtvthumb.jpg
date: 2014-07-09
comments: true
sharing: true
footer: true
permalink: /deleting-nested-node-modules-folders/
---

When using Node Package Manager (NPM) on Windows, it has an annoying habit of creating massively nested `node_modules` folders that exceed the 260 character path length limit. This makes it extremely painful to try to delete and causes problems with most windows tools. In Visual Studio, for example, I cannot `Refresh Folder` when I am in a website project (as opposed to a web application project).

Fortunately, the fix is pretty simple.
<!--excerpt-->

Just install [RoboCopy](http://technet.microsoft.com/en-us/library/cc733145.aspx) and use the mirror flag. If you are on Windows 8, I suggest you use the version from the [Windows Server 2003 resource kit](http://www.microsoft.com/en-us/download/details.aspx?id=17657) as there appear to be [issues](http://www.matrix44.net/blog/?p=1355) with the Windows 8 version. This mirrors an empty directory to the problematic `node_modules` folder, which you can then delete in the normal way. Cunningly, deleting the mirrored directory also deletes the `node_modules` directory. 

Credit to [toby1kenobi](http://toby1kenobi.com/2014/04/how-to-delete-the-node_modules-folder-when-windows-complains-that-file-or-path-names-are-too-long/) for this clever solution!

Finally, you just have to restore the deleted node packages. From the application directory, just run [npm update](https://www.npmjs.org/doc/cli/npm-update.html):

	npm update

This command will update all the packages listed in the packages.json file to the latest version. It will also install missing packages.




