#GAMESCRIBE

The GameScribe Engine for Data Logging
in Games for Learning

Institute for Games for Learning
New York University
The Graduate Center of the City University of New York

White Paper # 01/2014
Version 0.1	February 4, 2014

Introduction
The most important feature when developing games for learning is the ability to capture the learner’s process of exploration and problem solving.  Storing this captured information in a log file provides a rich source for analysis, but needs structure to make it feasible.  In the past, the approach has been to develop a custom structure suited to an individual game.  However, this approach has its drawbacks: a) analysis requires familiarity with the unique structure, b) multiple game logs produce a disjointed database that is difficult to manage, and c) developing a new structure for each new game extends the game’s development time.  The GameScribe engine was developed by the Games for Learning Institute (G4LI) to address these drawbacks.

Summary
There are three components to the GameScribe engine; the in-game API component (which records and submits the data to be logged), the data collection component (which receives and processes GameScribe-formatted log data), and the GameScribe database (which manages game details and gamelog data).
The game API controls the basic unit of a log event, the Jot.  When an event is “jotted down” in the game, the details of the event are recorded and stamped with the current game epoch time.  The Spider crawls through the game, searching for any unsubmitted Jots, and adding them to the hopper to be processed for data collection.
Data collection occurs through PHP scripts.  When the upload page receives a new log record, it formats the data into a SQL statement and submits it to the database for insertion.  After submission, the script returns a status code to the callee.  If the callee is the GameScribe Spider, the Spider will either clear the Jot from the hopper or reattempt the upload (up to 3 attempts).  Future releases of the data collection component will include data validation, key checks, and improved callee return data.

The GameScribe database centers around three tables.  The “games” table includes game title and version information and contains the master gameKey.  The “gamecodes” table lists the game code and description for each game by gameKey.  The “scribelog” table, based on the CRESST log format (Chung & Kerr, 2012), collects the log records from the data collection component.

Log data
There are three components to a log record; the game code, code description, and the data values.  The game code is a four digit number that allows the log data to be easily accessed, sorted, and grouped (example: 3002).  The code description is a plain English sentence or phrase of what occurred in the game (example: Level started with [currentLives] lives remaining).  The data values are the specific numbers or details that fit in to the code description to give it meaning (example: 3).
Replacing each bracket-group with the next sequential data value provides a detailed description of the event: Level started with 3 lives remaining.
Grouping data values by game code provides sum, average, count, etc. totals.  Example: 3002 count=16 average=3.5.
Game Codes
1001 – 1999: Universal codes
Codes general to any game or simulation.
2001 – 2999: High level game descriptors
State changes, game options, etc.
3001 – 3999: Game initiated events
Events triggered within the game itself. Such as enemy deciding to move to new location.
4001 – 4999: User interactions
Events triggered by the player; mouse click/hover, keyboard, etc.
5001 – 5999: Compiled statistics and results
Values compiled from multiple previous events. Such as level play duration and outcome.
9001 – 9999: GameScribe hardcodes
Codes reserved for GameScribe API events.  Such as a record update event or stop recording event.

References
Chung, G.K.W.K. & Kerr, D.S. (2012).  A primer on data logging to support extraction of meaningful information from educational games: An example from Save Patch.  Los Angeles, CA: University of California, National Center for Research on Evaluation, Standards, and Student Testing.

How to instantiate

GameScribe works on a LAMP environment. You will need:

PHP 5.5 +
MySql

THE SQL
Please use the sql scripts provided to instantiate the necessary tables on your very own gamescribe database on your server.
This includes:
  gamecodes.sql - a catalog of your jot gamecodes and what they record in plain English
  games.sql - a catalog of games that link them to their version and scribelog table
  scribelog.sql - the table where all the game logs are written. It is recommended to use

THE PHP
Drop the /api php files on your server, placement won't matter but you should follow your organization's guidelines. These files are programmed to receive data from the gamescribe.js file.

THE JAVASCRIPT
Drop the gamescribe.js file on your server, this file should be available from the web via absolute path.

Example:
<script src="https://www.yourdomainname.com/somedirectory/gamescribe.js"></script>
