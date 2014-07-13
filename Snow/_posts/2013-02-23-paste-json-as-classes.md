---
layout: post
title: Paste JSON as Classes
categories: Visual Studio
description: Generate strongly typed classes in C# or VB.NET from valid JSON text using the "Paste JSON As Classes" feature from the recent Visual Studio update.
date: 2013-02-23
comments: true
sharing: true
footer: true
permalink: /paste-json-as-classes/
---

In the recent [ASP.Net and Web Tools 2012.2 Update](http://www.hanselman.com/blog/ReleasedASPNETAndWebTools20122InContext.aspx) a new feature was added to allow pasting of JSON as .Net classes. This feature allows you to generate strongly typed classes in C# or VB.NET from valid JSON text. To use the feature, open a .vb or .cs file, copy the JSON text to the clipboard, select “Paste Special” from the Edit menu, and then select “Paste JSON As Classes.”

The feature uses the [Json.Net JSON parser](http://json.codeplex.com/) from Newtonsoft to parse JSON text from the clipboard. Once the parser validates the clipboard data as valid JSON, it converts it into the C# or VB.NET class depending on the selected file type.  If the JSON object on the clipboard is invalid, a dialog is displayed showing the Json.Net error message with the reason the text was not valid JSON.
<!--excerpt-->

I am currently working on a new diagnostics report for [BDDfy](http://teststack.github.com/pages/BDDfy.html) which outputs the time it took to run each story, scenario, and scenario step (each Given When Then method). This produces the following JSON output for the BDDfy ATM sample.

    {
        "Stories":
        [
            {
                "Name":"Account holder withdraws cash",
                "Duration":30,
                "Scenarios":
                [
                    {
                        "Name":"Account has insufficient fund",
                        "Duration":29,
                        "Steps":
                        [
                            {
                                "Name":"Given the Account Balance is $10",
                                "Duration":1
                            },
                            {
                                "Name":"And the Card is valid",
                                "Duration":0
                            },
                            {
                                "Name":"And the machine contains enough money",
                                "Duration":4
                            },
                            {
                                "Name":"When the Account Holder requests $20",
                                "Duration":0
                            },
                            {
                                "Name":"Then the ATM should not dispense any Money",
                                "Duration":20
                            },
                            {
                                "Name":"And the ATM should say there are Insufficient Funds",
                                "Duration":0
                            },
                            {
                                "Name":"And the Account Balance should be $20",
                                "Duration":0
                            },
                            {
                                "Name":"And the Card should be returned",
                                "Duration":1
                            }
                        ]
                    },
                    {
                        "Name":"Account has sufficient fund",
                        "Duration":1,
                        "Steps":
                        [
                            {
                                "Name":"Given the account balance is $100",
                                "Duration":0
                            },
                            {
                                "Name":"And the Card is valid",
                                "Duration":0
                            },
                            {
                                "Name":"And the machine contains enough money",
                                "Duration":0
                            },
                            {
                                "Name":"When the account holder requests $20",
                                "Duration":0
                            },
                            {
                                "Name":"Then the ATM should dispense $20",
                                "Duration":0
                            },
                            {
                                "Name":"And the account balance should be $80",
                                "Duration":0
                            },
                            {
                                "Name":"And the card should be returned",
                                "Duration":0
                            }
                        ]
                    },
                    {
                        "Name":"Card has been disabled",
                        "Duration":0,
                        "Steps":
                        [
                            {
                                "Name":"Given the Card is disabled",
                                "Duration":0
                            },
                            {
                                "Name":"When the Account Holder requests 20",
                                "Duration":0
                            },
                            {
                                "Name":"Then Card is retained",
                                "Duration":0
                            },
                            {
                                "Name":"And the ATM should say the Card has been retained",
                                "Duration":0
                            }
                        ]
                    }
                ]
            },
            {
                "Name":"Tic tac toe",
                "Duration":25,
                "Scenarios":
                [
                    {
                        "Name":"Cat\u0027s game",
                        "Duration":13,
                        "Steps":
                        [
                            {
                                "Name":"Given the board\r\nX, O, X\r\nO, O, X\r\nX, X, O",
                                "Duration":5
                            },
                            {
                                "Name":"Then it should be a cats game",
                                "Duration":7
                            }
                        ]
                    },
                    {
                        "Name":"Diagonal win",
                        "Duration":0,
                        "Steps":
                        [
                            {
                                "Name":"Given the board\r\nX, O, O\r\nX, O, X\r\nO, X,  ",
                                "Duration":0
                            },
                            {
                                "Name":"Then the winner is O",
                                "Duration":0
                            }
                        ]
                    },
                    {
                        "Name":"Horizontal win",
                        "Duration":0,
                        "Steps":
                        [
                            {
                                "Name":"Given the board\r\nX, X, X\r\nX, O, O\r\nO, O, X",
                                "Duration":0
                            },
                            {
                                "Name":"Then the winner is X",
                                "Duration":0
                            }
                        ]
                    },
                    {
                        "Name":"Horizontal win in the bottom",
                        "Duration":1,
                        "Steps":
                        [
                            {
                                "Name":"Given the board\r\nX, X,  \r\nX, O, X\r\nO, O, O",
                                "Duration":1
                            },
                            {
                                "Name":"Then the winner is O",
                                "Duration":0
                            }
                        ]
                    },
                    {
                        "Name":"Horizontal win in the middle",
                        "Duration":0,
                        "Steps":
                        [
                            {
                                "Name":"Given the board\r\nX, O, O\r\nX, X, X\r\nO, O, X",
                                "Duration":0
                            },
                            {
                                "Name":"Then the winner is X",
                                "Duration":0
                            }
                        ]
                    },
                    {
                        "Name":"O wins",
                        "Duration":6,
                        "Steps":
                        [
                            {
                                "Name":"Given the following board X, X, O, X, O,  ,  ,  ,",
                                "Duration":0
                            },
                            {
                                "Name":"When the game is played at (2, 0)",
                                "Duration":5
                            },
                            {
                                "Name":"Then the winner should be O",
                                "Duration":0
                            }
                        ]
                    },
                    {
                        "Name":"Vertical win in the left",
                        "Duration":0,
                        "Steps":
                        [
                            {
                                "Name":"Given the board\r\nX, O, O\r\nX, O, X\r\nX, X, O",
                                "Duration":0
                            },
                            {
                                "Name":"Then the winner is X",
                                "Duration":0
                            }
                        ]
                    },
                    {
                        "Name":"Vertical win in the middle",
                        "Duration":0,
                        "Steps":
                        [
                            {
                                "Name":"Given the board\r\n , X, O\r\nO, X, O\r\nO, X, X",
                                "Duration":0
                            },
                            {
                                "Name":"Then the winner is X",
                                "Duration":0
                            }
                        ]
                    },
                    {
                        "Name":"Vertical win in the right",
                        "Duration":0,
                        "Steps":
                        [
                            {
                                "Name":"Given the board\r\nX, O, X\r\nO, O, X\r\nO, X, X",
                                "Duration":0
                            },
                            {
                                "Name":"Then the winner is X",
                                "Duration":0
                            }
                        ]
                    },
                    {
                        "Name":"When x and o play their first moves",
                        "Duration":5,
                        "Steps":
                        [
                            {
                                "Name":"Given a new game",
                                "Duration":0
                            },
                            {
                                "Name":"When X and O play on (0, 0), (2, 2)",
                                "Duration":0
                            },
                            {
                                "Name":"Then the board state should be X,  ,  ,  ,  ,  ,  ,  , O",
                                "Duration":4
                            }
                        ]
                    },
                    {
                        "Name":"X wins",
                        "Duration":0,
                        "Steps":
                        [
                            {
                                "Name":"Given the board\r\nX, X, O\r\nX, X, O\r\nO, O,  ",
                                "Duration":0
                            },
                            {
                                "Name":"When x plays in the bottom right",
                                "Duration":0
                            },
                            {
                                "Name":"Then the winner should be x",
                                "Duration":0
                            }
                        ]
                    }
                ]
            }
        ]
    }

The Paste JSON as Classes operation produces the following C# output:

	public class Rootobject
	{
	    public Story[] Stories { get; set; }
	}
	
	public class Story
	{
	    public string Name { get; set; }
	    public int Duration { get; set; }
	    public Scenario[] Scenarios { get; set; }
	}
	
	public class Scenario
	{
	    public string Name { get; set; }
	    public int Duration { get; set; }
	    public Step[] Steps { get; set; }
	}
	
	public class Step
	{
	    public string Name { get; set; }
	    public int Duration { get; set; }
	}    

You can find the ATM sample in the [BDDfy source code](https://github.com/TestStack/TestStack.BDDfy/tree/master/TestStack.BDDfy.Samples/Atm), or you can install it from [NuGet](http://www.nuget.org/packages/TestStack.BDDfy.Samples).

You can read more about the Paste JSON as Classes feature [here:](http://blogs.msdn.com/b/webdev/archive/2012/12/18/paste-json-as-classes-in-asp-net-and-web-tools-2012-2-rc.aspx)