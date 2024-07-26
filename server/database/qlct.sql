-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jul 26, 2024 at 11:54 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `qlct`
--

-- --------------------------------------------------------

--
-- Table structure for table `expense`
--

CREATE TABLE `expense` (
  `id` int(11) NOT NULL,
  `category_id` int(11) NOT NULL,
  `category_name` varchar(100) NOT NULL,
  `category_color` varchar(100) NOT NULL,
  `category_icon` varchar(100) NOT NULL,
  `user_id` int(11) NOT NULL,
  `amount` decimal(10,0) NOT NULL,
  `description` varchar(255) NOT NULL,
  `date` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `expense`
--

INSERT INTO `expense` (`id`, `category_id`, `category_name`, `category_color`, `category_icon`, `user_id`, `amount`, `description`, `date`) VALUES
(7, 1, 'mua xe', '#FB7185', 'car', 1, 324, 'sadad', '2024-07-13'),
(8, 2, 'an choi', '#FCD34D', 'rocket1', 1, 500000, 'wfdfd', '2024-07-17'),
(9, 1, 'mua xe', '#FB7185', 'car', 1, 2000000, 'mua xe', '2024-07-17'),
(10, 1, 'mua xe', '#FB7185', 'car', 1, 32144, 'dsfgdeg', '2024-07-16'),
(11, 1, 'an choi', '#FCD34D', 'rocket1', 1, 30000055, 'fgg', '2024-07-12'),
(12, 3, 'mua sam', '#FCD34D', 'skin', 1, 300000, 'mua quan ao', '2024-07-14'),
(13, 1, 'mua xe', '#FB7185', 'car', 1, 5675, 'dfgfdg', '2024-08-07'),
(14, 3, 'mua sam', '#FCD34D', 'skin', 1, 6547, 'jyhkh', '2025-03-17'),
(17, 4, 'sua xe', '#FB923C', 'tool', 1, 2000000, 'fedg', '2024-07-25'),
(18, 4, 'sua xe', '#FB923C', 'tool', 1, 10000, 'dfgb', '2024-07-14'),
(20, 5, 'dasdfas', '#FDE68A', 'tool', 7, 34434, 'sdfsf', '2024-07-16'),
(21, 6, 'ds', '#FDE68A', 'skin', 7, 546464646, 'dgfdrrg', '2024-07-17'),
(22, 6, 'ds', '#FDE68A', 'skin', 7, 9999999999, 'dffgdg', '2024-07-17'),
(23, 6, 'ds', '#FDE68A', 'skin', 7, 4353454354, 'fdg', '2024-07-17'),
(24, 12, 'tgjt', '#FEC89A', 'car', 8, 34543545, 'fhgh', '2024-07-18'),
(25, 7, 'tgjt', '#FEC89A', 'car', 8, 2423424, 'eadea', '2024-07-18'),
(26, 7, 'tgjt', '#FEC89A', 'car', 8, 435354, 'fghgf', '2024-07-20'),
(27, 7, 'tgjt', '#FEC89A', 'car', 8, 23454, 'gdf', '2024-06-12'),
(28, 7, 'tgjt', '#FEC89A', 'car', 8, 354363, 'gdfhdf', '2024-05-06'),
(29, 7, 'tgjt', '#FEC89A', 'car', 8, 1000000, 'regeg', '2024-06-19'),
(30, 8, 'tien mang', '#A7F3D0', 'ie', 8, 4235253, 'dfgdf', '2024-07-20'),
(31, 7, 'tgjt', '#FEC89A', 'car', 8, 365343, 'fdgfdg', '2024-05-08'),
(32, 8, 'tien mang', '#A7F3D0', 'ie', 8, 500000, 'sdfwsf', '2024-08-23');

-- --------------------------------------------------------

--
-- Table structure for table `expense_categories`
--

CREATE TABLE `expense_categories` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `category_name` varchar(100) NOT NULL,
  `color` varchar(100) NOT NULL,
  `icon` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `expense_categories`
--

INSERT INTO `expense_categories` (`id`, `user_id`, `category_name`, `color`, `icon`) VALUES
(1, 1, 'mua xe tang', '#99F6E4', 'ie'),
(2, 1, 'an choi', '#FCD34D', 'rocket1'),
(3, 1, 'mua sam', '#FCD34D', 'skin'),
(6, 7, 'ds', '#FDE68A', 'skin'),
(7, 8, 'tgjt', '#FEC89A', 'car'),
(8, 8, 'tien mang', '#A7F3D0', 'ie'),
(9, 8, 'tan gai', '#FDE68A', 'heart'),
(10, 8, 'sua xe', '#E879F9', 'tool'),
(11, 8, 'mua sam', '#6EE7B7', 'skin'),
(12, 8, 'xem phim', '#DB2777', 'videocamera'),
(13, 8, 'sieu thi', '#FCCFE8', 'shoppingcart'),
(14, 8, 'wrwe', '#99F6E4', 'tool');

-- --------------------------------------------------------

--
-- Table structure for table `income`
--

CREATE TABLE `income` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `category_id` int(11) NOT NULL,
  `category_name` varchar(100) NOT NULL,
  `category_color` varchar(100) NOT NULL,
  `category_icon` varchar(100) NOT NULL,
  `amount` decimal(10,0) NOT NULL,
  `description` varchar(255) NOT NULL,
  `date` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `income`
--

INSERT INTO `income` (`id`, `user_id`, `category_id`, `category_name`, `category_color`, `category_icon`, `amount`, `description`, `date`) VALUES
(10, 1, 5, 'fedgfdg', '#E879F9', 'car', 2032, 'dfgd', '2024-07-13'),
(12, 1, 3, 'fedgfdg', '#E879F9', 'car', 5000000, 'lasla', '2024-07-12'),
(16, 1, 5, 'luong', '#86EFAC', 'medicinebox', 20, 'dfg', '2024-07-14'),
(18, 1, 5, 'luong', '#86EFAC', 'medicinebox', 24435244, 'fsdgdsdf', '2024-07-14'),
(21, 1, 5, 'lala', '#99F6E4', 'skin', 333, 'ghm', '2024-07-13'),
(22, 1, 5, 'lala', '#99F6E4', 'skin', 241145455, 'fgfg', '2024-07-14'),
(23, 5, 8, 'luong', '#86EFAC', 'medicinebox', 2343234, 'sdfsf', '2024-07-15'),
(24, 5, 8, 'luong', '#86EFAC', 'medicinebox', 200000, 'luong', '2024-07-16'),
(26, 7, 14, 'dsf', '#86EFAC', 'tool', 5434463434, 'fdgd', '2024-07-16'),
(27, 7, 9, 'dsf', '#86EFAC', 'tool', 5646544, '34453', '2024-07-16'),
(30, 7, 5, 'lala', '#99F6E4', 'skin', 342, 'dfsgdg', '2024-07-16'),
(31, 7, 5, 'lala', '#99F6E4', 'skin', 4646, 'gjhgj', '2024-07-16'),
(32, 7, 5, 'lala', '#99F6E4', 'skin', 2344, 'dfgd', '2024-07-16'),
(33, 7, 12, 'lala', '#99F6E4', 'skin', 5434463434, 'fdg', '2024-07-16'),
(34, 7, 14, 'gerg', '#6EE7B7', 'car', 345, 'dfgfd', '2024-07-15'),
(35, 7, 10, 'fdg', '#D946EF', 'woman', 34534, 'gdg', '2024-07-17'),
(36, 8, 17, 'luong', '#A7F3D0', 'medicinebox', 43242, 'sdfs', '2024-07-18'),
(37, 8, 17, 'luong', '#A7F3D0', 'medicinebox', 234324, 'dfgdg', '2024-07-18'),
(39, 8, 17, 'luong', '#A7F3D0', 'medicinebox', 20000000, 'sdsfs', '2024-08-10'),
(41, 8, 18, 'phu cap', '#F43F5E', 'rocket1', 200000, 'dsfss', '2024-06-11'),
(42, 8, 17, 'luong', '#A7F3D0', 'medicinebox', 2000000, 'sdfdsf', '2025-02-13');

-- --------------------------------------------------------

--
-- Table structure for table `income_categories`
--

CREATE TABLE `income_categories` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `category_name` varchar(100) NOT NULL,
  `color` varchar(100) NOT NULL,
  `icon` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `income_categories`
--

INSERT INTO `income_categories` (`id`, `user_id`, `category_name`, `color`, `icon`) VALUES
(5, 1, 'lala', '#99F6E4', 'skin'),
(7, 1, 'luong', '#A7F3D0', 'medicinebox'),
(8, 5, 'luong', '#86EFAC', 'medicinebox'),
(9, 7, 'dsf', '#86EFAC', 'tool'),
(10, 7, 'fdg', '#D946EF', 'woman'),
(11, 7, 'dgfd', '#FEC89A', 'rocket1'),
(12, 7, 'tt', '#FDE047', 'deleteuser'),
(13, 7, 'tge', '#DB2777', 'skin'),
(14, 7, 'gerg', '#6EE7B7', 'car'),
(15, 7, 'fdg', '#99F6E4', 'woman'),
(17, 8, 'luong', '#A7F3D0', 'medicinebox'),
(18, 8, 'phu cap', '#F43F5E', 'rocket1'),
(19, 8, 'tien thuong', '#E879F9', 'deleteuser'),
(20, 8, 'mang', '#FCD34D', 'tool'),
(21, 8, 'alo', '#FCD34D', 'heart'),
(22, 8, 'abc', '#DB2777', 'rocket1'),
(25, 8, 'test', '#DB2777', 'tool');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `username` varchar(100) NOT NULL,
  `password` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `email`, `username`, `password`) VALUES
(4, 'giang@gmail.com', 'giang', '$2b$10$ryMxkATT/OY57VVN7Ni.F.2wzbk2yvQBFY19V05kF2cXKvdMR49QG'),
(5, 'a@gmail.com', 'a', '$2b$10$Y7gVnZoBrm8ugk3YPeQLGOXs4sgEOl9lgb8hsYPNI0NaQcVUACsSi'),
(6, 'df@gmail.com', 'giang', '$2b$10$Qji3H671SCZiQSvWGot0VuxkIFvjOo/k5xsGjLclW2H8Bxfn49S.O'),
(7, 'aa12@gmail.com', 'aaaa', '$2b$10$GIlkAMhWWSE.cRYSwoSZGefg6i0dnZYsq6MgY1QJeCswWWVVmev..'),
(8, 'q@gmail.com', 'giang 123', '$2b$10$dwgZR.Xav1csN6FNQ.Stp.x8YSdIsqyv7zauCJ.kgzGdVcPLT4orK'),
(9, 'tet@gmail.com', 'fdf', '$2b$10$iyLA2Sy72wB9K9PglPLhPOPv9gad2mR9OEdCu431L2xkQDkOnVbpa');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `expense`
--
ALTER TABLE `expense`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `expense_categories`
--
ALTER TABLE `expense_categories`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `income`
--
ALTER TABLE `income`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `income_categories`
--
ALTER TABLE `income_categories`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `expense`
--
ALTER TABLE `expense`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=40;

--
-- AUTO_INCREMENT for table `expense_categories`
--
ALTER TABLE `expense_categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `income`
--
ALTER TABLE `income`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=44;

--
-- AUTO_INCREMENT for table `income_categories`
--
ALTER TABLE `income_categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
