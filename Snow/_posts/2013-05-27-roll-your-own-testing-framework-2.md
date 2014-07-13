---
layout: post
title: BDDfy in Action: Roll your own testing framework (2)
categories: TestStack, BDDfy
description: A follow-up to the previous post on creating a custom framework, adding in parallel testing.
date: 2013-05-27
comments: true
sharing: true
footer: true
permalink: /roll-your-own-testing-framework-2/
---

---excerpt
In the [last post](/roll-your-own-testing-framework), I did not implement the parallel testing requirement of my custom framework. This is just a brief follow up to show that feature. In the never ending quest for faster running tests, being able to run them in parallel can be a great way to speed things up.
---end

**This article is part of the [BDDfy In Action][1] series.**

In the [last post](/roll-your-own-testing-framework), I did not implement the parallel testing requirement of my custom framework. This is just a brief follow up to show that feature. In the never ending quest for faster running tests, being able to run them in parallel can be a great way to speed things up. 

## Running the tests in parallel ##
The first problem I have to solve is to batch up the list of tests into smaller lists of a fixed size that can be run in parallel. I found an excellent extension method for that by David Boike [here](http://www.make-awesome.com/2010/08/batch-or-partition-a-collection-with-linq/):

    public static class Extensions
    {
        public static IEnumerable<IEnumerable<T>> Batch<T>(this IEnumerable<T> collection, int batchSize)
        {
            List<T> nextbatch = new List<T>(batchSize);
            foreach (T item in collection)
            {
                nextbatch.Add(item);
                if (nextbatch.Count == batchSize)
                {
                    yield return nextbatch;
                    nextbatch = new List<T>(batchSize);
                }
            }
            if (nextbatch.Count > 0)
                yield return nextbatch;
        }
    }

Then I can add a method to the TestRunner that uses the Batch extension method to break the list of tests into batches that can be run using the [Parallel ForEach](http://msdn.microsoft.com/en-us/library/system.threading.tasks.parallel.foreach.aspx) method. This is the parallel version of the standard, sequential foreach loop.

    private void RunTestsInParallel(int batchSize)
    {
        List<ContextSpecification> theSpecs = GetSpecs();
        var batch = theSpecs.Batch(batchSize);

        Parallel.ForEach(batch, specs => specs.Each(spec => SafeRunSpec(spec)));
    }


This can be plugged into the Run method by adding an optional batch size parameter, which allows the existing code to work as it is and for tests to run in parallel by passing a batchSize value of more than zero into the Run method. 

    public class TestRunner
    {
        public void Run(int batchSize = 0)
        {
            if (batchSize == 0)
            {
                RunTestsSequentially();
            }
            else
            {
                RunTestsInParallel(batchSize);
            }
            RunBatchProcessors();
        }
		...
    }

## Batch Console Reporter ##
There is one problem with this code though. The parallel nature of the loop means that multiple iterations may be executing at the same time and, as might be expected, the normal console report becomes quite jumbled.

![](/images/bddfy-console-parallel-broken.png)

The solution is to run the console report after all of the tests have completed. This can be achieved by creating a new Console Reporter as a Batch Processor rather than a Processor. The Processor runs as each test is being executed and allows you to build up the report, whereas a Batch Processor has the advantage of running after all of the tests have finished (see the [BDDfy Architecture Overview](http://www.michael-whelan.net/bddfy-architecture-overview/) post for more detail).

    public class MyConsoleReporter : IBatchProcessor
    {
        public void Process(IEnumerable<Story> stories)
        {
            var reporter = new ConsoleReporter();
            stories
                .ToList()
                .ForEach(story => reporter.Process(story));
        }
    }

Then I just needed to add it to the Batch Processor pipeline and disable the built-in console report. For convenience I have just added it to the RunTestsInParallel method:

    private void RunTestsInParallel(int batchSize)
    {
        Configurator.Processors.ConsoleReport.Disable();
        Configurator.BatchProcessors.Add(new BatchConsoleReporter());

        List<ContextSpecification> theSpecs = GetSpecs();
        var batch = theSpecs.Batch(batchSize);

        Parallel.ForEach(batch, specs => specs.Each(spec => SafeRunSpec(spec)));
    }


The code is available on github:
[https://github.com/mwhelan/BDDfySamples](https://github.com/mwhelan/BDDfySamples)

  [1]: /bddfy-in-action/