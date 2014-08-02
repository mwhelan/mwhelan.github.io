---
layout: post
title: gitignore Files
categories: Visual Studio 
date: 2014-08-02
comments: true
sharing: true
footer: true
permalink: /gitignore-files/
---

There are a number of files that you don't want to store in your git repository. These could be binary files, such as the packages folder for Visual Studio applications or the node_modules folder for node projects, or automatically generated files such as ReSharper user files or files produced by the build system. If you create a file in your repository named `.gitignore`, Git uses the file patterns in it to determine which files and directories to ignore when you make a commit. You can also create a global .gitignore file, which is a list of rules for ignoring files in every Git repository on your computer. You can learn more about the file patterns from [Pro Git](http://git-scm.com/book/en/Git-Basics-Recording-Changes-to-the-Repository#Ignoring-Files).
<!--excerpt-->

## Creating a .gitignore file ##
Creating a .gitignore file is slightly tricky on Windows. When you try to create it in Windows Explorer, it interprets the gitignore part of the file name as the file extension, and so thinks that you are trying to create a file without a name. You get the aptly named "You must type a file name." error message.

![windows error](/images/gitignore-windows-error.png)

To get around this issue, just create a normal text file, such as `gitignore.txt`. Open the file in a text editor and add all of your rules. Finally, open a command prompt, navigate to the folder containing the file, and use the `ren` command to rename it.

	ren gitignore.txt .gitignore

## Sources of .gitignore rules ##
The contents of a .gitignore file vary by operating systems, environments, and languages. There are a few useful resources for finding the right combination of rules for your particular project flavour.

### gitignore.io website ###
The [gitignore.io](http://www.gitignore.io/) website is very handy. It lets you type in any combination of rules from a pre-defined list, and then either generate the .gitignore file in the browser or download the generated .gitignore file to your computer. 

![gitignore.io](/images/gitignore-gitignore-io.png)

### GitHub ###
When you create a new repository on GitHub you can choose to add a .gitignore file from GitHub's collection of .gitignore file templates.

![github](/images/gitignore-github.png)

GitHub maintains an [official list](https://github.com/github/gitignore) of recommended .gitignore files for many popular operating systems, environments, and languages, which they use to populate the new repository .gitignore list.