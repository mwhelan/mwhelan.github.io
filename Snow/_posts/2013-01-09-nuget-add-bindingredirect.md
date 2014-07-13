---
layout: post
title: NuGet Add-BindingRedirect
categories: Visual Studio
description: Using NuGet Package Manager Console to add binding redirects
date: 2013-01-09
comments: true
sharing: true
footer: true
permalink: /nuget-add-bindingredirect/
---

This is one of those "note to self" posts. I recently came across this NuGet feature which is useful on those infrequent occasions when I need to do binding redirects. Hopefully others will find it useful too! 

I was wanting to use [AutoSubstitute][1], the cool little auto mocking container from fellow TestStacker [Rob Moore][2] that uses Autofac to resolve unknown dependencies from NSubstitute. The problem was that AutoSubstitute is strongly named and when an assembly has a strong name, the binding to that assembly becomes very strict. Because AutoSubstitute currently binds to NSubstitute 1.4.0 and I was using 1.4.3 I was getting a FileLoadException. 
<!--excerpt-->

No worries, just need to add a binding redirect. Thankfully, I no longer have to do it by hand. Open the NuGet Package Manager Console, specify the appropriate Default Project and enter the command Add-BindingRedirect. 

![alt text][3]

As if by magic, an app.config is added to the project (if one doesn't exist already) and the appropriate information added.

    <configuration>
      <runtime>
        <assemblyBinding xmlns="urn:schemas-microsoft-com:asm.v1">
          <dependentAssembly>
            <assemblyIdentity name="NSubstitute" publicKeyToken="92dd2e9066daa5ca" culture="neutral" />
            <bindingRedirect oldVersion="0.0.0.0-1.4.3.0" newVersion="1.4.3.0" />
          </dependentAssembly>
        </assemblyBinding>
      </runtime>
    </configuration>

Sweet!

  [1]: https://github.com/robdmoore/AutofacContrib.NSubstitute
  [2]: http://robdmoore.id.au/
  [3]: /images/nuget_addbindingredirect.png