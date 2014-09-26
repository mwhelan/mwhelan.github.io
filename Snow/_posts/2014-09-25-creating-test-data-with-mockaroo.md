---
layout: post
title: Creating Test Data with Mockaroo
categories: Automated Testing, Test Data
date: 2014-09-25
comments: true
sharing: true
footer: true
permalink: /creating-test-data-with-mockaroo/
---

I'm currently working on a project that requires realistic test data. In the past, I've used tools such as RedGate's [SQL Data Generator](http://www.red-gate.com/products/sql-development/sql-data-generator/) for this purpose, which is fantastic if you are looking for a commercial product. Recently, I came across [Mockaroo](http://www.mockaroo.com/), an online test data generator. It is currently free and lets you generate up to 100,000 rows of realistic test data in CSV, JSON, SQL, and Excel formats. If that's not enough data for you, there is also a [Big Data Edition](http://www.mockaroo.com/bde) which lets you generate unlimited JSON and CSV data, leveraging multi-core cloud computing.
<!--excerpt-->

![Mockaroo.com](/images/mockaroo-logo.png)

## Mockaroo.com
The Mockaroo website provides an intuitive interface that makes it extremely easy to generate test data.

![Mockaroo new schema](/images/mockaroo-new-schema.png)

You simply enter a field name and select a data type. You can move fields up using the handle bars on the left, or delete fields using the cross on the right. Most field types are simple like this but some, like the URL shown above, allow you to specify additional customisations. 

Here is a sample of the data that Mockaroo generates for this schema. Note that data is related across fields in the same row, so *Judy Barnes* has an email address of *jbarnes@nymag.com*.

	[
	    {
	        "Id": 1,
	        "FullName": "Judy Barnes",
	        "EmailAddress": "jbarnes0@nymag.com",
	        "Password": "jGgItZC3",
	        "City": "Calipatria",
	        "CompanyName": "Twinder",
	        "URL": "http://examiner.com/vulputate/vitae/nisl/aenean.jpg"
	    },
	    {
	        "Id": 5,
	        "FullName": "Peter Kelly",
	        "EmailAddress": "pkelly4@mit.edu",
	        "Password": "pZUymDXKIB",
	        "City": "National City",
	        "CompanyName": "Meembee",
	        "URL": "https://biglobe.ne.jp/feugiat.html"
	    }
	]

The data types are the real power of Mockaroo. It supports 74 different types, each of which provide a range of appropriate sample data that is used to populate the field. You can see the list of 74 types on the [API docs page](http://www.mockaroo.com/api/docs). When you select the data type in the schema editor you are presented with a great dialog which makes it easy to filter and choose the appropriate data type.

![Choose a type](/images/mockaroo-choose-a-type.png)

In keeping with the overall theme of simplicity, Mockaroo makes creating an account about as simple as I've seen it. Just click on the `Sign in with` Google or Facebook links. I chose Google, then clicked one of my Google accounts, and that was it, I had an account setup. Once you have an account you can save and clone schema.

## REST API
Mockaroo provides a REST API, which lets you download randomly generated data into your projects in real-time with unlimited calls. You can download based on a saved schema or fields you define at runtime. Anything you can generate via the website can also be generated via the REST API. The API is currently free for all to use while it is in open beta, but you need to create an account and get an API key to use it.

The API contains a single GET method, `generate`, which will return CSV or JSON formats depending on the file type part of the URL. 

	http://www.mockaroo.com/api/generate.json
	http://www.mockaroo.com/api/generate.csv

The docs page provides JavaScript and Java examples, so I thought I would provide one here using .Net and `HttpClient`. I will define the fields at runtime rather than using a saved schema.

The fields must be defined as a JSON array and can be passed in the request body or in the query string as a `fields` element. Here, I've created a simple `MockerooParameter` class for each field specification and then serialized the collection to a JSON array using ServiceStack's `JsonSerializer`. You don't need to create a parameter class like this, but I found the serialization produced cleaner JSON this way. Note the call to `EmitCamelClassNames` which tells the `JsonSerializer` to emit the property names with camel case in the JSON, even though the class uses title case.

    private static string CreateSchema()
    {
        var fields = new List<MockarooParameter>
        {
            new MockarooParameter{ Name = "Id", Type = "Row Number" },
            new MockarooParameter{ Name = "FullName", Type = "Full Name" },
            new MockarooParameter{ Name = "EmailAddress", Type = "Email Address" },
            new MockarooParameter{ Name = "Password", Type = "Password" },
            new MockarooParameter{ Name = "City", Type = "City" },
            new MockarooParameter{ Name = "CompanyName", Type = "Company Name" },
            new MockarooParameter{ Name = "Url", Type = "URL", IncludeQueryString = false }
        };
        JsConfig.EmitCamelCaseNames = true;
        return JsonSerializer.SerializeToString(fields);
    }

    public class MockarooParameter
    {
        public string Name { get; set; }
        public string Type { get; set; }
        public bool IncludeQueryString { get; set; }
    }

When I construct the request I pass my API key, the count of how many records I want returned, and the JSON field specification in the query string.

    private static HttpRequestMessage CreateRequest()
    {
        var json = CreateSchema();
        string url = string.Format(@"http://www.mockaroo.com/api/generate.json?key={0}&count=10&fields={1}", API_KEY, json);
        var request = new HttpRequestMessage
        {
            Method = HttpMethod.Get,
            RequestUri = new Uri(url)
        };
        request.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
        return request;
    }

And finally call the API and serialize the JSON response into a strongly-typed class that represents the fields specified:

    public MockarooInfo[] GetData()
    {
        var request = CreateRequest();

        MockarooInfo[] data;
        using (var client = new HttpClient())
        {
            var response = client.SendAsync(request).Result;
            var json = response.Content.ReadAsStringAsync().Result;
            data = JsonSerializer.DeserializeFromString<MockarooInfo[]>(json);
        }
        return data;
    }

    public class MockarooInfo
    {
        public int Id { get; set; }
        public string FullName { get; set; }
        public string EmailAddress { get; set; }
        public string Password { get; set; }
        public string City { get; set; }
        public string CompanyName { get; set; }
        public string Url { get; set; }
    }

## Creating Data Sources from Mockaroo Data
I mentioned that I was working on a test data project. I needed to create dictionary files of unique words representing the sorts of data in the Mockaroo field types. Mockaroo does not currently provide access to the data sources it uses for those data types (some are generated with regular expressions, but some are using word dictionaries) but it is quite straightforward to grab the data.

First, I created a [schema](http://www.mockaroo.com/f3624170) that contained a field for each of the 74 data types, then I used the web interface to generate a JSON file with the maximum 100,000 records. Visual Studio has a really great feature that lets you take a row of JSON and paste it as a class (I wrote about it [last year](http://www.michael-whelan.net/paste-json-as-classes/)). That produces this strongly-typed class:

    public class MockarooRow
    {
        public int Id { get; set; }
        public string BitcoinAddress { get; set; }
        public string City { get; set; }
        public string Colour { get; set; }
        public string CompanyName { get; set; }
        public string Country { get; set; }
        public string CountryCode { get; set; }
        public string CreditCardNumber { get; set; }
        public string CreditCardType { get; set; }
        public string Currency { get; set; }
        public string CurrencyCode { get; set; }
        public string DomainName { get; set; }
        public string Gender { get; set; }
        public string GenderAbbrev { get; set; }
        public string FirstName { get; set; }
        public string FullName { get; set; }
        public string FirstNameMale { get; set; }
        public string FirstNameFemale { get; set; }
        public string LastName { get; set; }
        public string EmailAddress { get; set; }
        public string Frequency { get; set; }
        public string HexColour { get; set; }
        public string IBAN { get; set; }
        public string IPAddressV4 { get; set; }
        public string IPAddressV6 { get; set; }
        public string ISBN { get; set; }
        public string Language { get; set; }
        public string Latitude { get; set; }
        public string Longitude { get; set; }
        public string MacAddress { get; set; }
        public string Password { get; set; }
        public string Race { get; set; }
        public string SSN { get; set; }
        public string US_Phone { get; set; }
        public string US_State { get; set; }
        public string US_StateAbbrev { get; set; }
        public string US_StreetAddress { get; set; }
        public string US_City { get; set; }
        public string Title { get; set; }
        public string URL { get; set; }
        public string Username { get; set; }
        public string US_ZipCode { get; set; }
    }

Then, it's just a case of taking a distinct list of words from the specified field and saving it to a text file:

    private void CreateFile(Func<MockarooRow, string> selector, string dictionaryName, bool sort = true)
    {
        var fileName = string.Format("{0}.txt", dictionaryName);
        var query = _data.Select(selector).Distinct().Take(1000);
        if (sort)
        {
            query = query.OrderBy(x => x);
        }
        IList<string> words = query.ToList();
        File.WriteAllLines(fileName, words);

        Console.WriteLine("{0}. Record Count: {1}", dictionaryName, words.Count);
    }

which is called like this:

	CreateFile(x => x.City, "City");

and produces a text file of city names:

	Adelanto
	Agoura Hills
	Alameda
	Albany
	Alhambra
	Aliso Viejo
	...


## Check it out
Mockaroo is a really great product. Its creator, Mark Brocato, was incredibly responsive and helpful to my questions by email when I was putting my test data together, so a big thanks to him for that. Features are frequently being added to Mockaroo and you can see those reported on [twitter](https://twitter.com/mockaroodev).

All the code from this post is on [github](https://github.com/mwhelan/MockarooSandbox).
