-- phpMyAdmin SQL Dump
-- version 4.8.5
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: May 07, 2019 at 10:28 PM
-- Server version: 5.7.23
-- PHP Version: 7.2.10

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";

--
-- Database: `gamescribe`
--

-- --------------------------------------------------------

--
-- Table structure for table `scribelog_gamename`
--

CREATE TABLE `scribelog_gamename` (
  `logID` int(11) NOT NULL,
  `logTimestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `gameKey` varchar(8) NOT NULL,
  `userID` varchar(72) NOT NULL,
  `jotID` int(11) NOT NULL,
  `writer` varchar(25) NOT NULL,
  `gameTime` int(11) NOT NULL,
  `gameCode` int(4) NOT NULL,
  `d01` varchar(255) NOT NULL,
  `d02` varchar(255) NOT NULL,
  `d03` varchar(255) NOT NULL,
  `d04` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `scribelog_gamename`
--
ALTER TABLE `scribelog_gamename`
  ADD PRIMARY KEY (`logID`),
  ADD KEY `userID` (`userID`),
  ADD KEY `gameCode` (`gameCode`),
  ADD KEY `gameKey` (`gameKey`),
  ADD KEY `location` (`writer`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `scribelog_gamename`
--
ALTER TABLE `scribelog_gamename`
  MODIFY `logID` int(11) NOT NULL AUTO_INCREMENT;
COMMIT;
