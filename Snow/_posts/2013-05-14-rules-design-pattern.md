---
layout: post
title: The Rules Design Pattern
categories: .Net
description: Dealing with complex conditional logic with the Rules design pattern
date: 2013-05-14
comments: true
sharing: true
footer: true
permalink: /rules-design-pattern/
---

Lately, I’ve been having to support some legacy code that has a lot of conditional logic and duplication. It can be quite hard to integrate new rules as the code can be difficult to understand and to digest what is going on. This sort of code often has comments explaining what the different pieces of conditional logic are doing. The problems only gets worse as you have to add more conditions over time.
<!--excerpt-->

Here is an example of some ugly conditional logic from Steve Smith’s Rules Pattern module on Pluralsight (more on the Rules Pattern later).

    public class DiscountCalculator
	{
	    public decimal CalculateDiscountPercentage(Customer customer)
	    {
	        decimal discount = 0;
	        if (customer.DateOfBirth < DateTime.Now.AddYears(-65))
	        {
	            // senior discount 5%
	            discount = .05m;
	        }
	
	        if (customer.DateOfBirth.Day == DateTime.Today.Day &&
	            customer.DateOfBirth.Month == DateTime.Today.Month)
	        {
	            // birthday 10%
	            discount = Math.Max(discount, .10m);
	        }
	            
	        if (customer.DateOfFirstPurchase.HasValue)
	        {
	            if (customer.DateOfFirstPurchase.Value < DateTime.Now.AddYears(-1))
	            {
	                // after 1 year, loyal customers get 10%
	                discount = Math.Max(discount, .10m);
	                if (customer.DateOfFirstPurchase.Value < DateTime.Now.AddYears(-5))
	                {
	                    // after 5 years, 12%
	                    discount = Math.Max(discount, .12m);
	                    if (customer.DateOfFirstPurchase.Value < DateTime.Now.AddYears(-10))
	                    {
	                        // after 10 years, 20%
	                        discount = Math.Max(discount, .2m);
	                    }
	                }
	
	                if (customer.DateOfBirth.Day == DateTime.Today.Day &&
	                    customer.DateOfBirth.Month == DateTime.Today.Month)
	                {
	                    // birthday additional 10%
	                    discount += .10m;
	                }
	            }
	        }
	        else
	        {
	            // first time purchase discount of 15%
	            discount = Math.Max(discount, .15m);
	        }
	        if (customer.IsVeteran)
	        {
	            // veterans get 10%
	            discount = Math.Max(discount, .10m);
	        }
	
	        return discount;
	    }
	}

## Replace Boolean logic with meaningful predicates ##
The first step I like to take to clean up this sort of code is to do an [Extract Method refactor](http://refactoring.com/catalog/extractMethod.html) on the conditional logic in the if statements. The method names should be in the form of a question and create an English sentence that communicates the logic inside the method. This has the benefit of being easy to read and understand and also means that you can safely remove the comments. (In fact, it often makes sense to use the comment to name the method). 

	public class DiscountCalculator
	{
	    public decimal CalculateDiscountPercentage(Customer customer)
	    {
	        decimal discount = 0;
	        if (IsSenior(customer))
	        {
	            discount = .05m;
	        }
	
	        if (IsBirthday(customer))
	        {
	            discount = Math.Max(discount, .10m);
	        }
	            
	        if (IsExisting(customer))
	        {
	            if (HasBeenLoyalForYears(customer, 1))
	            {
	                discount = Math.Max(discount, .10m);
	                if (HasBeenLoyalForYears(customer, 5))
	                {
	                    discount = Math.Max(discount, .12m);
	                    if (HasBeenLoyalForYears(customer, 10))
	                    {
	                        discount = Math.Max(discount, .2m);
	                    }
	                }
	
	                if (IsBirthday(customer))
	                {
	                    discount += .10m;
	                }
	            }
	        }
	        else
	        {
	            // first time purchase discount of 15%
	            discount = Math.Max(discount, .15m);
	        }
	        if (customer.IsVeteran)
	        {
	            discount = Math.Max(discount, .10m);
	        }
	
	        return discount;
	    }
	
	    private static bool HasBeenLoyalForYears(Customer customer, int numberOfYears)
	    {
	        numberOfYears *= -1;
	        return customer.DateOfFirstPurchase.Value < DateTime.Now.AddYears(numberOfYears);
	    }
	
	    private static bool IsExisting(Customer customer)
	    {
	        return customer.DateOfFirstPurchase.HasValue;
	    }
	
	    private static bool IsBirthday(Customer customer)
	    {
	        return customer.DateOfBirth.Day == DateTime.Today.Day &&
	               customer.DateOfBirth.Month == DateTime.Today.Month;
	    }
	
	    private static bool IsSenior(Customer customer)
	    {
	        return customer.DateOfBirth < DateTime.Now.AddYears(-65);
	    }
	}

I like how much more readable the code is now, though I find passing the customer parameter into each method a little bit clunky. I also like the “newspaper” style of writing code. When I’m looking at the logic of the main method it is sufficient to just see the “headlines,” that is the method names saying that this bit of code runs if it’s the customer’s birthday and that bit of code runs if the customer is a senior. If I hone in on the area of code I am interested in then I might drill down into the method itself and engage with it (“the article”) but until then all that logic and algorithms is just noise.  

I tend to think I should keep these predicate methods private, which seems to fit with the goals of encapsulation. But how do I test them?

## Making predicates extension methods ##
Making the predicates into extension methods makes them easy to test and removes the customer parameter from each method. You might violently disagree with this step, so please let me know in the comments if you do. I'd be interested in other perspectives on it.

	public class DiscountCalculator
	{
	    public decimal CalculateDiscountPercentage(Customer customer)
	    {
	        decimal discount = 0;
	        if (customer.IsSenior())
	        {
	            discount = .05m;
	        }
	
	        if (customer.IsBirthday())
	        {
	            discount = Math.Max(discount, .10m);
	        }
	            
	        if (customer.IsExisting())
	        {
	            if (customer.HasBeenLoyalForYears(1))
	            {
	                discount = Math.Max(discount, .10m);
	                if (customer.HasBeenLoyalForYears(5))
	                {
	                    discount = Math.Max(discount, .12m);
	                    if (customer.HasBeenLoyalForYears(10))
	                    {
	                        discount = Math.Max(discount, .2m);
	                    }
	                }
	
	                if (customer.IsBirthday())
	                {
	                    discount += .10m;
	                }
	            }
	        }
	        else
	        {
	            // first time purchase discount of 15%
	            discount = Math.Max(discount, .15m);
	        }
	        if (customer.IsVeteran)
	        {
	            discount = Math.Max(discount, .10m);
	        }
	
	        return discount;
	    }
	}
	
	public static class CustomerExtensions
	{
	    public static bool HasBeenLoyalForYears(this Customer customer, int numberOfYears, DateTime? date = null)
	    {
	        if (!customer.IsExisting())
	            return false;
	        numberOfYears = -1 * numberOfYears;
	        return customer.DateOfFirstPurchase.Value < date.ToValueOrDefault().AddYears(numberOfYears);
	    }
	
	    public static bool IsExisting(this Customer customer)
	    {
	        return customer.DateOfFirstPurchase.HasValue;
	    }
	
	    public static bool IsSenior(this Customer customer, DateTime? date = null)
	    {
	        return customer.DateOfBirth < date.ToValueOrDefault().AddYears(-65);
	    }
	
	    public static bool IsBirthday(this Customer customer, DateTime? date = null)
	    {
	        date = date.ToValueOrDefault();
	        return customer.DateOfBirth.Day == date.Value.Day
	                && customer.DateOfBirth.Month == date.Value.Month;
	        ;
	    }
	}
	
	public static class DateTimeExtensions
	{
	    public static DateTime ToValueOrDefault(this DateTime? dateTime, DateTime? defaultValue = null)
	    {
	        defaultValue = defaultValue.HasValue ? defaultValue.Value : DateTime.Now;
	        return dateTime.HasValue ? dateTime.Value : defaultValue.Value;
	    }
	}

## The Rules Design Pattern ##
These refactorings have helped a bit, but they have not really reduced the complexity and duplication and have not addressed the fact that this complexity will increase as more rules are added. I was looking around for a design pattern that might address those things and came across the Rules Pattern, which was a module that [Steve Smith](http://pluralsight.com/training/Authors/Details/steve-smith) contributed to Pluralsight’s [Design Patterns library](http://pluralsight.com/training/Courses/TableOfContents/patterns-library).

The Rules Pattern works by separating out the rules from the rules processing logic (applying the [Single Responsibility Principle](http://en.wikipedia.org/wiki/Single_responsibility_principle)). This makes it easy to add new rules without changing the rest of the system (applying the [Open/Closed Principle](http://en.wikipedia.org/wiki/Single_responsibility_principle)).

![](/images/rules-pattern.png)

With the Rules Pattern there is an Evaluator class that loops through a collection of rules and executes them. It evaluates the result and decides what action to take. In the simplest case it just executes all the rules, but it is also possible to add some selection logic to each rule that allows the Evaluator class to decide whether or not to run the rule (such as the IsMatch() method on the IRule interface above).

The rules implement a simple interface

	public interface IDiscountRule
	{
	    decimal CalculateCustomerDiscount(Customer customer);
	}

and the rules implementations just have a single responsibility that could be as simple or complex as necessary:

    public class BirthdayDiscountRule : IDiscountRule
    {
        public decimal CalculateCustomerDiscount(Customer customer)
        {
            return customer.IsBirthday() ? 0.10m : 0;
        }
    }
}

And you can even reuse rules in other rules, such as the BirthdayDiscountRule being used in the LoyalCustomerRule here:

    public class LoyalCustomerRule : IDiscountRule
    {
        private readonly int _yearsAsCustomer;
        private readonly decimal _discount;
        private readonly DateTime _date;
        
        public LoyalCustomerRule(int yearsAsCustomer, decimal discount, DateTime? date = null)
        {
            _yearsAsCustomer = yearsAsCustomer;
            _discount = discount;
            _date = date.ToValueOrDefault();
        }

        public decimal CalculateCustomerDiscount(Customer customer)
        {
            if (customer.HasBeenLoyalForYears(_yearsAsCustomer, _date))
            {
                var birthdayRule = new BirthdayDiscountRule();

                return _discount + birthdayRule.CalculateCustomerDiscount(customer);
            }
            return 0;
        }
    }


Applying the refactoring to the problem above, the RulesDiscountCalculator is the Evaluator. It holds a collection of rules that calculate discounts and loops through them to find the greatest discount. Rules are just added to the collection manually here for illustrative purposes, but in a real application you would more likely load them dynamically with an IoC container or something similar without having to change RulesDiscountCalculator.

	public class RulesDiscountCalculator : IDiscountCalculator
	{
	    List<IDiscountRule> _rules = new List<IDiscountRule>();
	
	    public RulesDiscountCalculator()
	    {
	        _rules.Add(new BirthdayDiscountRule());
	        _rules.Add(new SeniorDiscountRule());
	        _rules.Add(new VeteranDiscountRule());
	        _rules.Add(new LoyalCustomerRule(1, 0.10m));
	        _rules.Add(new LoyalCustomerRule(5, 0.12m));
	        _rules.Add(new LoyalCustomerRule(10, 0.20m));
	        _rules.Add(new NewCustomerRule());
	    }
	
	    public decimal CalculateDiscountPercentage(Customer customer)
	    {
	        decimal discount = 0;
	
	        foreach (var rule in _rules)
	        {
	            discount = Math.Max(rule.CalculateCustomerDiscount(customer), discount);
	        }
	            
	        return discount;
	    }
	}

You can get a better understanding of how the Rules Pattern works by checking out the code in my [github repo](https://github.com/mwhelan/Blog_RulesPattern).