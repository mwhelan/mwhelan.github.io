---
layout: post
title: BDD Course in London
categories: BDD
date: 2016-05-27 10:00:00
comments: true
sharing: true
footer: true
permalink: /bdd-course-london/
---

Last week I had the pleasure of attending Gaspar Nagy's 3-day [BDD course](http://gasparnagy.com/trainings/specflow/) at Skills Matter's [CodeNode](https://skillsmatter.com/event-space) in London. I have been doing BDD for over 5 years now, and SpecFlow is not my preferred .Net BDD tool, but I still got a huge amount of value out of the course. Gaspar is very knowledgeable about BDD and I would highly recommend the course, whether you are new to BDD,  a [BDD addict](http://www.specsolutions.eu/news/bddaddict) like me, or even if you are just struggling with agile.
<!--excerpt-->

I had the good fortune of choosing a seat next to [Dirk Rombauts](https://twitter.com/QuestMasterNET) on the first day, which resulted in two days of great pair programming, where I learned a lot, including some excellent pairing habits and one trick to double my ReSharper ninja skills!

It is a wide-ranging course that covers how to gather examples and then turn them into executable specifications, with the implementation focused on ASP.Net MVC and WPF .Net projects. The course covers refining and documenting specification workshop results in Gherkin, feeding Gherkin scenarios into acceptance test driven development with SpecFlow, and advanced concepts for automation and building living documentation systems. The course topics are discussed through examples, demos and hands-on exercises to ensure knowledge that can be used in practice.

The course started off by looking at the four different areas that make up BDD. So many companies that I see struggling with agile tend to focus primarily on the agile project management area, with perhaps one or two other techniques from the other areas. I think you need to do all four to maximise the benefits of agile.

![BDD](/images/specflow-bdd.png)

The first day was focused on capturing specification workshop results in gherkin, and covered some theory:

- Agile testing is not about hunting criminals (finding bugs after development) but more like crime prevention.
- As formality increases, tests and requirements become indistinguishable. At the limit, tests and requirements are equivalent. *Equivalence Hypothesis (Martin, Melnik)*.

The second day looked at SpecFlow core concepts and ATDD basics, with examples using a WPF pomodoro application, including:

- Introduction to the Acceptance Test Driven Development workflow (test first, outside-in)
- Core concepts for (A)TDD: mocking, stubbing, dependency injection
- Domain layer automation (automating under the skin)
- Organizing step definitions
- Sharing state between steps

The third day looked at advanced test automation topics, using an ASP.Net MVC pomodoro application, including:

- Clean and maintainable automation layer
- Dealing with external dependencies
- Flickering scenarios
- UI layer automation (MVC ASP.NET, Driver, PageObject pattern)
- Handling the database
- Challenges of out-of-process testing (with Selenium)
- Organizing step definitions
- Defaults and implicit assumptions of scenarios
- Automapper and SpecFlow.Assist
- Putting it all together: implement new functionality with BDD

## Step Definitions
I've spoken with SpecFlow developers who are struggling to organise their step definitions, and I haven't really known what to advise, as it's not an issue with BDDfy, so I was interested to see the best tips for organising them. Gaspar showed a lot of great techniques for organising feature files and step definitions. I particularly liked the suggestion of moving user stories into a feature tree after the sprint was completed. 

I can't help feeling that step definitions are the wrong abstraction for reusability in an automated testing project. There are inherent difficulties from wanting to reuse steps when the two use cases are slightly different, and I would prefer to avoid it altogether.

Stepping back from tools for a moment, I think that step definitions are just metadata that should just read whatever way makes the most sense for a particular scenario in the living documentation that the users will see, whether it is exactly the same as other steps in the system or slightly different. While I recognise the importance and value of the DRY principle, I don't think it needs to be applied to the step definition itself (as it's just a string on a report).

What should be reusable is the code inside the step definitions. Things like repositories, builders/object mothers in the Given steps, drivers in the When step, assertions in the Then steps. Why do you need to reuse steps if they only have one line of code, and if that line itself is a useful and reusable abstraction?

	public void Given_I_have_5_customers()
	{
		Database.Save(CustomerBuilder.CreateListOfSize(5).BuildList());
	}

Generally, I'm just not comfortable with having my scenario being distributed across multiple feature and step definition files, which I think is inherent in the Gherkin-based approach. I prefer the pure C# solution of having the entire scenario in one file with the class-per-scenario approach (and no feature file):

    public class ValidEditStudentDetailsScenario : ScenarioFor<MvcControllerDriver, StudentEditStory>
    {
        private Student _student;
        private ControllerResultTest<StudentController> _result;

        public void Given_I_am_editing_an_existing_student_with_valid_data()
        {
			Builder<Student>.CreateNew().Persist();
            _student = Container
                .Get<IStudentRepository>()
                .FindById(1);
            _student.FirstMidName = "newFirstName";
        }
        public void When_I_save_the_changes()
        {
            _result = SUT.ExecuteActionFor<StudentController>(c => c.Edit(_student));
        }

        public void Then_I_am_returned_to_the_student_list()
        {
            _result.ShouldRedirectTo<StudentController>(c => c.Index(null, null, null, null));
        }

        public void AndThen_the_changes_have_been_saved()
        {
            Container.Get<IStudentRepository>()
                .FindById(1)
                .ShouldBeEquivalentTo(_student);
        }
    }

## The driver pattern
Speaking of drivers, Gaspar gave an excellent talk on the driver pattern in relation to the [hexagonal architecture](http://alistair.cockburn.us/Hexagonal+architecture). I am quite familiar with how the [window driver pattern](http://martinfowler.com/eaaDev/WindowDriver.html) is applied to Selenium, in the form of page objects, but Gaspar articulated a more general purpose pattern which extends beyond the UI/windows. 

## Conclusion
There is a lot more I could say about the course. I'm still digesting a lot of the excellent information. My recommendation would be to try to attend it yourself (there are a number of venues around Europe). BDD is by far the best way to deliver software on agile projects that I have come across, and Gaspar Nagy is an excellent guide.