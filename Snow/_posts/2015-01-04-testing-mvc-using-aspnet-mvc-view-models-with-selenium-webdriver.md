---
layout: post
title: Black-Box Testing ASP.Net: Using ASP.Net MVC View Models with Selenium WebDriver 
categories: Automated Testing, Black-Box Testing ASP.Net Series
date: 2015-01-04
comments: true
sharing: true
footer: true
permalink: /using-aspnet-mvc-view-models-with-selenium-webdriver/
---

This post continues the theme of the [previous post](/testing-mvc-reducing-use-of-magic-strings/), in looking at how a little knowledge of the inner workings of the MVC application can go a long way to writing less brittle, more maintainable, UI tests with Selenium WebDriver. In this post I am going to look at how we can use the same view model in the test that the application view uses to automate the reading and writing of data from the web page. (It could also be a domain model class, I just prefer to use view models for my views and keep my domain models separate).
<!--excerpt-->

> Some of the sample code is taken straight from [Seleno](https://github.com/TestStack/TestStack.Seleno), the Selenium WebDriver browser automation framework from [TestStack](http://teststack.net/), and gives you a look under the hood at the sorts of things a UI automation framework does for you. If some of these samples are relevant to the problems you are trying to solve, I encourage you to check out Seleno. It takes care of a lot of the complex infrastructure setup of a Selenium WebDriver project for you, allowing you to get on with the important business of writing specifications for your application. I've produced a working sample on [GitHub](https://github.com/mwhelan/MvcTestingSamples), so you should be able to take it, run it, and use some of the code in your own applications if you want to.

## Input View Model Property into Web Page
When you use strongly typed views (with models) and generate HTML for the model properties with expression-based HTML helpers, such as `Html.EditorFor()`, MVC will produce controls with predictable names for the properties of the model. This view code:

	@model ContosoUniversity.ViewModels.CreateStudentForm
	...
    @Html.EditorFor(model => model.LastName)

will produce this HTML:

	<input name="LastName" class="text-box single-line" id="LastName" type="text" value="" >

We can leverage this MVC infrastructure in our UI tests to input a model property into a form field. System.Web.Mvc provides the `ExpressionHelper.GetExpressionText` method to provide the same control name from the model property that the expression-based HTML helpers provide in the views.

We can derive a strongly typed base page object from the base page object used in the previous post, where `TModel` is the view model class used by that view. The `TextBoxFor` method uses ExpressionHelper to derive the name of the control from the model property expression, then uses WebDriver to find the element and populate it with the specified value.

    public class Page<TModel> : Page
    {
        public Page<TModel> TextBoxFor<TField>(Expression<Func<TModel, TField>> field, TField value)
        {
            var name = ExpressionHelper.GetExpressionText(field);

            var element = Host.Browser.FindElement(By.Name(name));
            element.Clear();
            element.SendKeys(value.ToString());

            return this;
        }
    }

Now we can modify the `NewStudentPage` page object to use the strongly typed page object and specify the `CreateStudentForm` view model, which is the one that the view uses. The various Input methods are able to enter data into the web page using the appropriate property expression in a strongly typed way. 

    public class NewStudentPage : Page<CreateStudentForm>
    {
        public string HeaderTitle
        {
            get
            {
                var header = Host.Browser.FindElement(By.Id("title"));
                return header.Text;
            }
        }

        public NewStudentPage InputLastName(string lastName)
        {
            TextBoxFor(x => x.LastName, lastName);
            return this;
        }

        public NewStudentPage InputFirstName(string firstName)
        {
            TextBoxFor(x => x.FirstMidName, firstName);
            return this;
        }

        public NewStudentPage InputEnrollmentDate(DateTime enrollmentDate)
        {
            TextBoxFor(x => x.EnrollmentDate, enrollmentDate);
            return this;
        }
    }

In keeping with the page object design pattern each method returns the page so that test code can set multiple properties in the fluent style, as you can see from this test.

    [Test]
    public void CanPopulateAFormFieldFromModelProperty()
    {
        var student = Builder<CreateStudentForm>
            .CreateNew()
            .Build();
        var newStudentPage = Host.NavigateTo<StudentController, NewStudentPage>(x => x.Create());

        newStudentPage
            .InputFirstName(student.FirstMidName)
            .InputLastName(student.LastName)
            .InputEnrollmentDate(student.EnrollmentDate);

        Host.Browser.FindElement(By.Id("FirstMidName")).GetAttribute("value").Should().Be(student.FirstMidName);
        Host.Browser.FindElement(By.Id("LastName")).GetAttribute("value").Should().Be(student.LastName);
        Host.Browser.FindElement(By.Id("EnrollmentDate")).GetAttribute("value").Should().Be(student.EnrollmentDate.ToString());
    }

## Input Whole View Model into Web Page
To be honest, I strongly dislike this approach of the page object exposing every property of the view model individually. It lends itself to script-style code, with lots of repetitive calls to set each property, obfuscating the meaning of the test. I prefer more of a specification style of test, where each method on the page object is representative of a behaviour of the application (more than likely representative of a single request/response  - a single controller action). This improves the API of the Page Object layer, and makes for a better Domain Specific Language (DSL) for your tests. 

Ignoring the assertions in this test - which are for demo purposes only - I prefer this test. One or two lines to setup the context and one call to the page object for the action I'm testing. This reads much more like a specification, which I think makes it a lot easier for the Test Reader to quickly see what is going on, and makes the tests a lot easier to maintain over time.

    [Test]
    public void CanPopulateFormFromModel()
    {
        var student = Builder<CreateStudentForm>
            .CreateNew()
            .Build();
        var newStudentPage = Host.NavigateTo<StudentController, NewStudentPage>(x => x.Create());

        newStudentPage.AddValidStudent(student);

        Host.Browser.FindElement(By.Id("FirstMidName")).GetAttribute("value").Should().Be(student.FirstMidName);
        Host.Browser.FindElement(By.Id("LastName")).GetAttribute("value").Should().Be(student.LastName);
        Host.Browser.FindElement(By.Id("EnrollmentDate")).GetAttribute("value").Should().Be(student.EnrollmentDate.ToString());
    }

We have a [PageWriter](https://github.com/TestStack/TestStack.Seleno/blob/master/src/TestStack.Seleno/PageObjects/Actions/PageWriter.cs) class in Seleno that inputs a whole model like this and handles the different data types and other complexities. Here is a cut down version that works for the 3 text boxes in this example.

    public class Page<TModel> : Page
    {
		...
		public Page<TModel> InputModel(TModel model)
        {
            var type = model.GetType();
            foreach (var property in type.GetProperties())
            {
                var element = Host.Browser.FindElement(By.Name(property.Name));
                element.Clear();
                element.SendKeys(property.GetValue(model).ToString());
            }
            return this;
        }
    }

And the additional method on the page object.

    public class NewStudentPage : Page<CreateStudentForm>
    {
		...
        public StudentDetailsPage AddValidStudent(CreateStudentForm student)
        {
            InputModel(student);
            return new StudentDetailsPage();
        }
	}

## Display Templates do not generate IDs for controls
By default MVC only adds ID and name properties to form controls (via the **Editor Templates**) with the expression-based HTML helpers. It does not do the same with the display expressions (such as `Html.DisplayFor()`) that use the ** Display Templates**). 

For example, this code from the Student Details view (Views\Student\Details.cshtml):

	<dt>
	    @Html.DisplayNameFor(model => model.LastName)
	</dt>

produces the following HTML:

	<dd>
    	Alexander
    </dd>

Fortunately, you can override both the Editor and Display templates if you add them to your web project. You can read all about ASP.Net MVC's templating system in [this series of posts](http://bradwilson.typepad.com/blog/2009/10/aspnet-mvc-2-templates-part-1-introduction.html) from Brad Wilson. Suffice to say, for the purposes of this discussion, you can override the display templates by adding a DisplayTemplates folder to your `Views\Shared` folder in your web project. You can copy the DisplayTemplates folder from your Visual Studio installation, or you can install the MvcDisplayTemplates package, provided by [Matt Honeycutt](https://twitter.com/matthoneycutt) on NuGet:

	Install-Package MvcDisplayTemplates

This overrides the `_Layout.cshtml` file in the `Views\Shared\DisplayTemplates` folder to wrap each model property in the view with a span that uses the `Html.IdForModel` Html Helper from System.Web.Mvc to generate an ID for the property control. 

	@model dynamic
	@if (HttpContext.Current.IsDebuggingEnabled)
	{ 
		<span id="@Html.IdForModel()">@RenderBody()</span>
	}
	else
	{
		@RenderBody()
	}

Now the Html.DisplayNameFor expression above generates this HTML, with the value wrapped in a span with an ID. Now that all of our view model properties are named with a well-known, predictable, naming convention, we can set about automating the reading of these properties into a view model in our tests in an automated fashion.

    <dd>
        <span id="LastName">Alexander</span>
    </dd>


## Read View Model Property from Web Page
We can extend the strongly typed base page with a method to read the value from a view page, again utilising the `ExpressionHelper` class from System.Web.Mvc. The [TagBuilder.CreateSanitizedId](http://msdn.microsoft.com/en-us/library/system.web.mvc.tagbuilder.createsanitizedid%28v=vs.111%29.aspx) method is another System.Web.Mvc helper that ensures only valid HTML characters are used .

    public string DisplayFor<TField>(Expression<Func<TModel, TField>> field)
    {
        string name = ExpressionHelper.GetExpressionText(field);
        string id = TagBuilder.CreateSanitizedId(name);

        var span = Host.Browser.FindElement(By.Id(id));

        return span.Text;
    }

Which can be used in tests in the following way:

    [Test]
    public void CanReadFormFieldFromModelProperty()
    {
        var studentDetailsPage = Host.NavigateTo<StudentController, StudentDetailsPage>(x => x.Details(1));

        studentDetailsPage
            .DisplayFor(x => x.LastName)
            .Should().Be("Alexander");
    }



## Read Whole View Model From Web Page
As with writing view model data to the page, we can extend this concept to read the whole view model from the page. Again, Seleno has a more fully featured [PageReader](https://github.com/TestStack/TestStack.Seleno/blob/master/src/TestStack.Seleno/PageObjects/Actions/PageReader.cs) class. Here is a cut down version to illustrate the principle:

    public TModel ReadModel()
    {
        var type = typeof(TModel);
        var instance = new TModel();

        foreach (var property in type.GetProperties())
        {
            string name = ExpressionHelper.GetExpressionText(property.Name);
            string id = TagBuilder.CreateSanitizedId(name);

            var span = Host.Browser.FindElement(By.Id(id));
            property.SetValue(instance, span.Text, null);
        }

        return instance;
    }

Which you could use in tests similar to this:

    [Test]
    public void CanReadModelFromPage()
    {
        var studentDetailsPage = Host.NavigateTo<StudentController, StudentDetailsPage>(x => x.Details(1));

        StudentDetailsViewModel model = studentDetailsPage.ReadModel();

        model.FirstMidName.Should().Be("Carson");
        model.LastName.Should().Be("Alexander");
    }



