---
layout: post
title: A Humanizer Display Metadata Provider for ASP .Net Core
categories: DotNet Core
date: 2016-07-18 08:00:00
comments: true
sharing: true
footer: true
permalink: /using-humanizer-with-asp-dotnet-core/
---

I have always been a big fan of using a Humanizer model metadata provider in my ASP.Net MVC applications. This means that Humanizer will automatically put spaces into labels for multi-word view model property names rather than the developer having to manually add a lot of data annotation Display attributes to those view model property names. The APIs have changed a little for ASP.Net Core, but the approach is basically the same. 
<!--excerpt-->

## What it does
You can read about the approach for classic MVC in [Mehdi's introductory Humanizer post](http://www.mehdi-khalili.com/introducing-humanizer/#what-else). Basically, instead of the `ReleaseDate` label:

![VS test runner](/images/humanizer-original.png) 

you get the preferable `Release Date`, with a space between the words.

![VS test runner](/images/humanizer-after.png) 

## How it works
Rather than inherit from the DataAnnotationsModelMetadataProvider as you did in classic MVC, with ASP.Net Core you need to implement the `IDisplayMetadataProvider` interface from the `Microsoft.AspNetCore.Mvc.ModelBinding.Metadata` namespace. The implementation is otherwise very similar:

    using System.Collections.Generic;
    using System.ComponentModel;
    using System.ComponentModel.DataAnnotations;
    using System.Linq;
    using Humanizer;
    using Microsoft.AspNetCore.Mvc.ModelBinding.Metadata;

    public class HumanizerMetadataProvider : IDisplayMetadataProvider
    {
        public void CreateDisplayMetadata(DisplayMetadataProviderContext context)
        {
            var propertyAttributes = context.Attributes;
            var modelMetadata = context.DisplayMetadata;
            var propertyName = context.Key.Name;

            if (IsTransformRequired(propertyName, modelMetadata, propertyAttributes))
            {
                modelMetadata.DisplayName = () => propertyName.Humanize().Transform(To.TitleCase);
            }
        }

        private static bool IsTransformRequired(string propertyName, DisplayMetadata modelMetadata, IReadOnlyList<object> propertyAttributes)
        {
            if (!string.IsNullOrEmpty(modelMetadata.SimpleDisplayProperty))
                return false;

            if (propertyAttributes.OfType<DisplayNameAttribute>().Any())
                return false;

            if (propertyAttributes.OfType<DisplayAttribute>().Any())
                return false;

            if (string.IsNullOrEmpty(propertyName))
                return false;

            return true;
        }
    }

To wire it up, you configure it in the ConfigureServices method of Startup.cs. You add the custom HumanizerMetadataProvider provider to the ModelMetadataDetailsProviders collection.

    services.AddMvc()
        .AddMvcOptions(m => m.ModelMetadataDetailsProviders.Add(new HumanizerMetadataProvider()));

## Summary
Creating a custom model metadata provider in ASP.Net Core is quite similar to ASP.Net MVC, but the APIs have changed a little bit.