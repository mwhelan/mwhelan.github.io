---
layout: post
title: Entity Framework Core 1.0.1 Migrations in Separate Assembly
categories: DotNet Core
date: 2016-10-30 08:00:00
comments: true
sharing: true
footer: true
permalink: /ef-core-101-migrations-in-separate-assembly/
---

I am getting to grips with Entity Framework Core at the moment and I like what I am seeing so far. There are still a few EF6 scenarios that are not supported yet but the main use cases are supported and there are often workarounds for those that aren't. Entity Framework 1.1 is out soon and features will continue to be added as things just continue to improve. I love the strategic direction the project has taken and, [listening to the team discuss the new design](https://channel9.msdn.com/Shows/On-NET/Rowan-Miller-Entity-Framework-Core-11), the modular approach and use of dependency injection seems far better, not to mention the massive performance improvements they are already seeing. 

When building ASP.Net MVC applications it is quite common to want to store your domain model and data access code in separate class libraries. If this is the case, then ideally you would not even want a reference to Entity Framework Core in your ASP.Net MVC Core project. In this post, I am going to look at how this can be achieved today with the current .Net Core 1.0.1 versions of MVC and EF. 
<!--excerpt-->

## Contoso University ASP.Net MVC Core Sample
I have implemented the [first](https://docs.asp.net/en/latest/data/ef-mvc/intro.html) and [fourth](https://docs.asp.net/en/latest/data/ef-mvc/migrations.html) tutorials of the Contoso sample, which wire up a view to the database and implement migrations in an ASP.Net MVC project, and then migrated the domain model and Entity Framework code to a separate class library. There are no Entity Framework references in the ContosoUniversity MVC project and, instead, the EF dependency is just injected at runtime. You can see the source code on [GitHub](https://github.com/mwhelan/MvcEfCore10Sample).

![VS solution](/images/ef-core-solution.png)

Credit where it is due, I have provided an updated version of solutions from [Ben Cull](http://benjii.me/2016/06/entity-framework-core-migrations-for-class-library-projects/) and the [EF docs](https://docs.efproject.net/en/latest/miscellaneous/cli/dotnet.html#preview-2-known-issues). 

## Step 1: Configure the class library as an application

	{
	  "version": "1.0.0-*",
	
	  "buildOptions": {
	    "emitEntryPoint": true
	  },
	
	  "frameworks": {
	    "netcoreapp1.0": {
	      "dependencies": {
	        "Microsoft.NETCore.App": {
	          "version": "1.0.1",
	          "type": "platform"
	        }
	      }
	    }
	  },
	
	  "dependencies": {
	    "Microsoft.EntityFrameworkCore.SqlServer": "1.0.1",
	    "Microsoft.EntityFrameworkCore.SqlServer.Design": {
	      "version": "1.0.1",
	      "type": "build"
	    },
	    "Microsoft.EntityFrameworkCore.Tools": {
	      "version": "1.0.0-preview2-final",
	      "type": "build"
	    }
	  },
	
	  "tools": {
	    "Microsoft.EntityFrameworkCore.Tools": "1.0.0-preview2-final"
	  }
	}

To convert the class library to a .Net Core application, you have to add the `frameworks` section above. It is also important that you add a reference to 
`Microsoft.EntityFrameworkCore.Tools` in the `dependencies` and `tools` sections. 

## Step 2: Add static void Main
Because this is an application you need to add a `Program.cs` file to serve as an entry point.

    public class Program
    {
        public static void Main(string[] args)
        {
        }
    }

## Step 3: Create a DB Context Factory
The CLI tools would normally discover the DbContext configuration in the Startup.cs of the web application, but the same thing can be achieved by creating a class that implements the IDbContextFactory interface. 

    public class SchoolDbContextFactory : IDbContextFactory<SchoolContext>
    {
        public SchoolContext Create(DbContextFactoryOptions options)
        {
            var builder = new DbContextOptionsBuilder<SchoolContext>();
            builder.UseSqlServer(
				"Server=(localdb)\\mssqllocaldb;Database=MyContosoUniversityCoreDb;Trusted_Connection=True;MultipleActiveResultSets=true");
            return new SchoolContext(builder.Options);
        }
    }

## Step 4: Configure dependencies with extension methods on IApplicationBuilder and IServiceCollection
There is still one last issue to solve before we can remove the dependency on EF Core from the ASP.Net MVC Core project. The `AddDbContext` extension method that configures EF Core in Startup.cs still requires a reference to the NuGet package.

	services.AddDbContext<SchoolContext>(options => 
		options.UseSqlServer(connectionString));

While most of the samples show how to configure dependencies in Startup.cs, this can quickly become quite unwieldy. I like [Scott Allen's suggestion](http://odetocode.com/blogs/scott/archive/2016/08/30/keeping-a-clean-startup-cs-in-asp-net-core.aspx) of moving this configuration code into extension methods on IApplicationBuilder and IServiceCollection.

    public static class ServiceCollectionExtensions
    {
        public static void AddEntityFramework(this IServiceCollection services, string connectionString)
        {
            services.AddDbContext<SchoolContext>(options =>
                    options.UseSqlServer(connectionString));
        }
    }

I like this approach, because it simplifies Startup.cs to a series of self-documenting, one-line commands, and moves the EF configuration code where it belongs - next to all the other EF code.

## Running Migrations for the Class Library
One important point to make, in case it is not obvious, is that you need to run migrations from the class library folder (and not from the web project folder).

![VS test runner](/images/ef-core-dotnet-ef-migrations-add.png)

## Summary
When building ASP.Net MVC applications it is quite common to want to store your domain model and data access code in separate class libraries. If this is the case, then ideally you would not even want a reference to Entity Framework Core in your ASP.Net MVC Core project. In this post, I have shown how this can be achieved today with the current .Net Core 1.0.1 versions of MVC and EF. You can see the source code on [GitHub](https://github.com/mwhelan/MvcEfCore10Sample).