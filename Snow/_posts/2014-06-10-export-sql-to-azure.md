---
layout: post
title: Exporting a SQL Server Database to SQL Azure
categories: Azure, SQL Server
image: images/sswtvthumb.jpg
date: 2014-06-10
comments: true
sharing: true
footer: true
permalink: /export-sql-to-azure/
---

Yesterday I was having a problem with Entity Framework Code First Migrations when publishing my website/database to Azure Websites/SQL Azure. Solving the database publishing problem felt like [yak shaving]( http://www.hanselman.com/blog/YakShavingDefinedIllGetThatDoneAsSoonAsIShaveThisYak.aspx) so, in the interest of pragmatism and getting back to the task at hand, I decided to just migrate my local SQL Server 14 LocalDb instance to Azure using SQL Server 2014 Management Studio (SSMS). 
<!--excerpt-->

The process is pretty straight forward – generate a script for the local database schema and data and then run that script against the SQL Azure database. When I did the process the first time though, I got the following error when trying to run the script against the SQL Azure database.

> Msg 40514, Level 16, State 1, Line 10

> 'Filegroup reference and partitioning scheme' is not supported in this version of SQL Server.


The problem is that SQL Azure databases only support a subset of T-SQL. According to [this MSDN article]( http://msdn.microsoft.com/library/azure/ee621790.aspx) you must modify the generated script to only include supported T-SQL statements. Thankfully, the Generate and Publish Scripts wizard in SSMS takes care of this for you.

## Create a Script of the Database Schema and Data ##
In SSMS, just right click on the local database, select **Tasks**, then **Generate Scripts** to bring up the **Generate and Publish Scripts** wizard.

Then select **Advanced** on the **Set Scripting Options** page to bring up the **Advanced Scripting Options** dialog. 

![](/images/sql-export-scripting-options.png) 

Select **Windows Azure SQL Database** from the **Script for the database engine type** dropdown. 

You should also select **Schema and data** from the **Types of data to script** dropdown.

Now if you connect to your SQL Azure database through Management Studio you can run this script to copy all of the tables and data from your local database to your SQL Azure one.

## Running the Script ##
There are several ways to run the script against the SQL Azure database. From SSMS or SQL Server Object Explorer in Visual Studio, just connect to the server using your SQL Server username and password and paste it into the query window and run it. 

A more interesting way is to run it in your web browser from the Azure Management Portal - SQL Database window. You can access this directly by its URL, which you can find on the Server Dashboard in the SQL Database screen of the Azure Management Portal. 

![](/images/sql-export-management-portal.png) 
