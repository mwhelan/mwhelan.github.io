---
layout: post
title: TDD Katas
categories: Programming
date: 2014-08-03
comments: true
sharing: true
footer: true
permalink: /code-katas-for-practicing-tdd/
---

A kata is a form of deliberate practice, with its roots in the martial arts world. It describes a choreographed pattern of movements used to train yourself to the level of muscle memory. In the world of programming, katas are small coding exercises that a programmer completes on a daily basis. They can be a great exercise for practicing TDD in particular. 

Rather than attempt a new kata each day, it's recommended that you work on the same one repeatedly until completing it is almost like muscle memory. Katas can be a great way to try out a new programning language, or a new programming technique, or a new framework. For example, if you wanted to move from Moq to NSubstitute (which I recommend) you could replace Moq with NSubstitute when doing a familiar kata.   
<!--excerpt-->

When doing the kata, focus on the TDD process:

1.	Write a failing test
2.	Write the simplest code to pass the test
3.	Refactor to remove duplication 

## Good habits for effective TDD ##
I first came across the idea of TDD katas when I attended the Codemanship [TDD Master Class](http://codemanship.co.uk/tdd.html), a two-day weekend course put on by Jason Gorman, in 2010. The course really opened my eyes to a new way of programming with TDD, and also the idea of software craftsmanship. I became "test infected" as they say. I would highly recommend the Codemanship courses to anyone living in London, as they still run regularly! 

I was just looking back at my notes from that course today, and I think that the good habits for effective TDD that Jason recommended are worth repeating here:

- When writing a test, write the assertion first and work backwards.
- Always run the test to see it fail in the way that you expect it to fail before writing the application code to make the test pass.
- Write meaningful tests that are self-explanatory. That is, the names of variables and methods should communicate your intention. I write all of my code now (test and application) thinking of the "Reader" - the person who is reading my code. Will my intention now be clearly communicated to that reader some time in the future?
- [Triangulate](http://codemanship.co.uk/parlezuml/blog/?postid=987) through concrete examples towards general solutions. Work through a sequence of tests that lead you towards a more general solution
- Keep test code and model code separate
- Isolate tests so that they run independently
- Organise tests to reflect organisation of model code 
- Maintain your tests
- Tests should test one thing
- Don’t refactor when a test is failing

Although my practice has evolved a bit, I think I follow most of them still!

## TDD Katas ##
I have collected a number of TDD Kata exercises over the past few years. I keep them in a repository on GitHub for easy reference. You can find them [here](https://github.com/mwhelan/Katas).

- [Anagrams](https://github.com/mwhelan/Katas/tree/master/Katas.Anagrams): Write a program to generate all potential anagrams of an input string. From a [code project article](http://www.codeproject.com/Articles/498404/TDD-the-Anagrams-Kata) by Richard Dalton.
- [Bank Transfer](https://github.com/mwhelan/Katas/tree/master/Katas.BankTransfer): Create a simple bank account program. From [Codemanship](http://codemanship.co.uk).
- [Fibonacci Generator](https://github.com/mwhelan/Katas/tree/master/Katas.Fibonacci): Write some code to generate the Fibonacci sequence up to a specific length which is no shorter than 8 numbers and no longer than 50. 
- [Fibonacci Sequence](https://github.com/mwhelan/Katas/tree/master/Katas.FibonacciSequence): Write a program that writes out the number for a given position in the Fibonacci Sequence From [Codemanship](http://codemanship.co.uk).
- [Fizz Buzz](https://github.com/mwhelan/Katas/tree/master/Katas.FizzBuzz): Generate a string of integers, starting at 1 and going up to 100, substituting any integer which is divisible by 3 with "Fizz", and any integer which is divisible by 5 with "Buzz", and any integer divisible by 3 and 5 with "FizzBuzz".
- [Fizz Buzz Whiz](https://github.com/mwhelan/Katas/tree/master/Katas.FizzBuzzWhiz): Same as FizzBuzz but substitute prime numbers with "Whiz."
- [Pager](https://github.com/mwhelan/Katas/tree/master/Katas.Pager): Write the underlying data model for a pager control. I haven't done this one yet, but I think it will be a great kata. From [Tomek Kaczanowski](http://kaczanowscy.pl/tomek/2013-04/code-kata-pager).
- [Prime Numbers](https://github.com/mwhelan/Katas/tree/master/Katas.PrimeNumbers): A bit simpler than the famous Uncle Bob one. Create a method that, given an integer, returns true if it is a prime and false if it is not.
- [String Calculator](https://github.com/mwhelan/Katas/tree/master/Katas.StringCalculator): One of the better known katas. The essence is a method that, given a delimited string, returns the sum of the values. From [Roy Osherove](http://osherove.com/tdd-kata-1/).
- [Word Counter](https://github.com/mwhelan/Katas/tree/master/Katas.WordCounter): A method that, given a delimited string, returns a collection of all of the unique words in it and the count of how many times they occurred. Start off with a space between words, but later other delimiters wil be added.

## Coding Dojos ##
A coding dojo is an extension of TDD katas. A coding dojo is a regular meeting where you and your team meet up to focus on improving practical coding skills, perhaps working on katas together and discussing lessons learned. [Emily Bache](http://pluralsight.com/training/Authors/Details/emily-bache) has a great course on [coding dojos for TDD](http://pluralsight.com/training/Courses/TableOfContents/the-coding-dojo) on Pluralsight.

