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

This week I had the pleasure of attending Gaspar Nagy's 3-day [BDD course](http://gasparnagy.com/trainings/specflow/) at Skills Matter's [CodeNode](https://skillsmatter.com/event-space) in London. I have been doing BDD for over 5 years now, and SpecFlow is not my preferred .Net BDD tool, but I still got a huge amount of value out of the course. Gaspar is very knowledgeable about BDD and I would highly recommend the course, whether you are new to BDD,  a [BDD addict](http://www.specsolutions.eu/news/bddaddict) like me, or even if you are just struggling with agile.
<!--excerpt-->

I had the good fortune of choosing a seat next to [Dirk Rombauts](https://twitter.com/QuestMasterNET) on the first day, which resulted in two days of great pair programming, where I learned a lot, including some excellent pairing habits and one trick to double my ReSharper ninja skills!

It is a wide-ranging course that covers how to gather examples and then turn them into executable specifications, with the implementation focused on ASP.Net MVC and WPF .Net projects. The course covers refining and documenting specification workshop results in Gherkin, feeding Gherkin scenarios into acceptance test driven development with SpecFlow, and advanced concepts for automation and building living documentation systems. The course topics are discussed through examples, demos and hands-on exercises to ensure knowledge that can be used in practice.

The course started off by looking at the four different areas that make up BDD. So many companies that I see struggling with agile tend to focus primarily on the agile project management area, with perhaps one or two other techniques from the other areas. I think you need to do all four to maximise the benefits of agile.

![BDD](/images/specflow-bdd.png)

## SpecFlow
As a user with limited SpecFlow experience there were a couple of things I had reservations about going in and I was hoping to challenge my thinking and hopefully learn a different point of view. The first one was attributes. I really dislike attributes in general. I just hate repeating them over and over and prefer to find more elegant solutions that apply convention over configuration. I think [BDDfy](https://bddfy.readme.io/) has the balance just right, where it uses reflection on the method names in a conventional way, but lets you override them with attributes in the exceptional circumstances when you want more control (namely when you need some symbols that are not allowed in C# method names). SpecFlow is built around attributes though and there's no getting around that. But that's OK, it's just a subjective preference thing.

When I've worked with teams who are using SpecFlow, the number one difficulty they seem to have is around reusing step definitions, so I was interested to see the best tips for dealing with that. Gaspar showed a lot of great techniques for organising feature files and step definitions. I particularly liked the suggestion of moving user stories into a feature tree after the sprint was completed. 

Despite those good techniques, I did not change my feeling that step definitions are the wrong abstraction for reusability in an automated testing project. People ask the inevitable questions about how to reuse steps when the two use cases are slightly different, and my answer would be "Don't." I think that step definitions are just metadata that should just read whatever way makes the most sense for a particular scenario in the living documentation that the users will see, whether it is exactly the same as other steps in the system or slightly different. 

What should be reusable is the code inside the step definitions. Things like repositories, builders/object mothers in the Given steps, drivers in the When step, assertions in the Then steps. Why do you need to reuse steps if they only have one line of code, and if that line is reusable?

	public void Given_I_have_5_customers()
	{
		Database.Save(CustomerBuilder.CreateListOfSize(5).BuildList());
	}

Generally, I'm still not comfortable with having my scenario being distributed across multiple feature and step definition files, which I think is particular to the Gherkin-based approach. I prefer the pure C# solution of having the entire scenario in one file with the class-per-scenario approach:

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