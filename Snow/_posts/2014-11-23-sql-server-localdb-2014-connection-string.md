---
layout: post
title: SQL Server LocalDB 2014 Connection String
categories: SQL Server
image: images/sswtvthumb.jpg
date: 2014-11-23
comments: true
sharing: true
footer: true
permalink: /sql-server-localdb-2014-connection-string/
---

I spent way too much time today trying to figure out why I could not connect to my newly installed SQL Server LocalDB 2014 instance. I assumed that I could just update my connection string from `v11.0` to `v12.0` but it seems that Microsoft have changed the naming scheme for this version. Now the automatic instance is named `MSSQLLocalDB`.
<!--excerpt-->

So, for SQL Server 2012 LocalDB, I had this connection string:

	<connectionStrings>
		<add name="SchoolContext" 
			connectionString="Data Source=(LocalDB)\v11.0;AttachDbFilename=|DataDirectory|\ContosoUniversityDB.mdf;Integrated Security=True;" 
			providerName="System.Data.SqlClient" />
	</connectionStrings>

For SQL Server 2014 LocalDB the connection string should be:

	<connectionStrings>
		<add name="SchoolContext" 
			connectionString="Data Source=(LocalDB)\MSSQLLocalDB;AttachDbFilename=|DataDirectory|\ContosoUniversityDB.mdf;Integrated Security=True;" 
			providerName="System.Data.SqlClient" />
	</connectionStrings>

According to [Microsoft](https://connect.microsoft.com/SQLServer/feedback/details/845278/sql-server-2014-express-localdb-does-not-create-automatic-instance-v12-0)

> In SQL14, we moved away from the numbering/versioning for the automatic instance and named it "MSSQLLocalDB" instead of "v12.0".
