-- phpMyAdmin SQL Dump
-- version 4.0.10.20
-- https://www.phpmyadmin.net
--
-- Host: localhost
-- Generation Time: May 07, 2019 at 06:32 PM
-- Server version: 10.0.36-MariaDB
-- PHP Version: 5.3.3

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

--
-- Database: `gamescribe`
--

-- --------------------------------------------------------

--
-- Table structure for table `gamecodes`
--

CREATE TABLE IF NOT EXISTS `gamecodes` (
  `gameKey` varchar(8) NOT NULL,
  `gameCode` int(4) NOT NULL,
  `shortDesc` varchar(25) NOT NULL,
  `dataDescription` varchar(510) NOT NULL,
  `numDataFields` int(1) NOT NULL,
  UNIQUE KEY `gameKey_gameCode` (`gameKey`,`gameCode`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;
