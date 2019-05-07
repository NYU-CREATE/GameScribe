-- phpMyAdmin SQL Dump
-- version 4.0.10.20
-- https://www.phpmyadmin.net
--
-- Host: localhost
-- Generation Time: May 07, 2019 at 06:31 PM
-- Server version: 10.0.36-MariaDB
-- PHP Version: 5.3.3

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

--
-- Database: `gamescribe`
--

-- --------------------------------------------------------

--
-- Table structure for table `games`
--

CREATE TABLE IF NOT EXISTS `games` (
  `gameID` int(11) NOT NULL AUTO_INCREMENT,
  `gameName` varchar(55) NOT NULL,
  `gameVersion` varchar(8) NOT NULL,
  `gameKey` varchar(8) NOT NULL,
  `gameTable` varchar(50) NOT NULL,
  `dev_notes` text NOT NULL,
  `gameExtractor` varchar(255) NOT NULL,
  PRIMARY KEY (`gameID`),
  UNIQUE KEY `gameKey` (`gameKey`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1 AUTO_INCREMENT=58 ;
