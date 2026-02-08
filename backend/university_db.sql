-- phpMyAdmin SQL Dump
-- version 3.5.2.2
-- http://www.phpmyadmin.net
--
-- Host: 127.0.0.1
-- Generation Time: Feb 07, 2026 at 12:30 PM
-- Server version: 5.5.27
-- PHP Version: 5.4.7

SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- Database: `university_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `academic_periods`
--

CREATE TABLE IF NOT EXISTS `academic_periods` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `academic_year` varchar(20) NOT NULL,
  `level_name` varchar(60) NOT NULL,
  `term_name` varchar(30) NOT NULL,
  `program_type` enum('diploma','bachelor','postgraduate') NOT NULL DEFAULT 'bachelor',
  `postgraduate_program` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_period` (`academic_year`,`level_name`,`term_name`,`program_type`,`postgraduate_program`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8mb4 AUTO_INCREMENT=76 ;

--
-- Dumping data for table `academic_periods`
--

INSERT INTO `academic_periods` (`id`, `academic_year`, `level_name`, `term_name`, `program_type`, `postgraduate_program`, `created_at`) VALUES
(1, '2025/2026', 'المستوى الأول', 'الفصل الأول', 'bachelor', NULL, '2025-12-28 11:20:32'),
(2, '2025/2026', 'المستوى الأول', 'الفصل الثاني', 'bachelor', NULL, '2025-12-28 11:20:32'),
(3, '2025/2026', 'المستوى الثاني', 'الفصل الأول', 'bachelor', NULL, '2025-12-28 11:20:32'),
(4, '2025/2026', 'المستوى الثاني', 'الفصل الثاني', 'bachelor', NULL, '2025-12-28 11:20:32'),
(5, '2025/2026', 'المستوى الثاني', 'الفصل الأول', 'bachelor', NULL, '2025-12-28 11:33:52'),
(6, '2025/2026', 'المستوى الأول', 'الفصل الأول', 'bachelor', NULL, '2025-12-28 11:34:03'),
(7, '2025/2026', 'المستوى الثاني', 'الفصل الأول', 'bachelor', NULL, '2025-12-28 11:34:19'),
(8, '2025/2026', 'المستوى الأول', 'الفصل الأول', 'bachelor', NULL, '2025-12-28 11:38:37'),
(9, '2025/2026', 'المستوى الثاني', 'الفصل الأول', 'bachelor', NULL, '2025-12-28 11:38:51'),
(10, '2025/2026', 'المستوى الأول', 'الفصل الأول', 'bachelor', NULL, '2025-12-28 11:46:27'),
(11, '2025/2026', 'المستوى الثاني', 'الفصل الثاني', 'bachelor', NULL, '2025-12-28 13:19:52'),
(12, '2025/2026', 'المستوى الثاني', 'الفصل الأول', 'bachelor', NULL, '2025-12-28 13:42:54'),
(13, '2025/2026', 'المستوى الثاني', 'الفصل الأول', 'bachelor', NULL, '2025-12-28 14:13:18'),
(14, '2025/2026', 'المستوى الثاني', 'الفصل الثاني', 'bachelor', NULL, '2025-12-28 14:13:32'),
(15, '2025/2026', 'المستوى الثاني', 'الفصل الأول', 'bachelor', NULL, '2025-12-29 07:27:07'),
(16, '2025/2026', 'المستوى الثاني', 'الفصل الثاني', 'bachelor', NULL, '2025-12-29 08:08:32'),
(17, '2025/2026', 'المستوى الثاني', 'الفصل الثاني', 'bachelor', NULL, '2025-12-29 09:50:09'),
(18, '2025/2026', 'المستوى الثاني', 'الفصل الأول', 'bachelor', NULL, '2025-12-29 09:59:03'),
(19, '2025/2026', 'المستوى الثاني', 'الفصل الثاني', 'bachelor', NULL, '2025-12-29 11:15:11'),
(20, '2025/2026', 'المستوى الثاني', 'الفصل الأول', 'bachelor', NULL, '2025-12-29 11:26:52'),
(21, '2025/2026', 'المستوى الثاني', 'الفصل الأول', 'bachelor', NULL, '2025-12-29 13:36:00'),
(22, '2025/2026', 'المستوى الثاني', 'الفصل الأول', 'bachelor', NULL, '2025-12-29 13:51:06'),
(23, '2025/2026', 'المستوى الثاني', 'الفصل الأول', 'bachelor', NULL, '2025-12-29 14:08:06'),
(24, '2025/2026', 'المستوى الثاني', 'الفصل الأول', 'bachelor', NULL, '2025-12-30 14:21:32'),
(25, '2025/2026', 'المستوى الأول', 'الفصل الأول', 'bachelor', NULL, '2025-12-31 11:29:58'),
(26, '2025/2026', 'المستوى الثاني', 'الفصل الأول', 'bachelor', NULL, '2025-12-31 11:30:09'),
(27, '2025/2026', 'المستوى الثاني', 'الفصل الأول', 'bachelor', NULL, '2025-12-31 11:31:24'),
(28, '2025/2026', 'المستوى الثاني', 'الفصل الأول', 'bachelor', NULL, '2025-12-31 11:31:35'),
(29, '2026/2027', 'المستوى الأول', 'الفصل الأول', 'postgraduate', 'ماجستير البرمجيات المدمجة', '2025-12-31 13:50:33'),
(30, '2025/2026', 'المستوى الثاني', 'الفصل الأول', 'bachelor', NULL, '2026-01-13 06:43:01'),
(31, '2025/2026', 'المستوى الأول', 'الفصل الأول', '', NULL, '2026-01-14 06:12:55'),
(32, '2025/2026', 'المستوى الأول', 'الفصل الأول', '', NULL, '2026-01-14 06:13:04'),
(33, '2025/2026', 'المستوى الأول', 'الفصل الأول', 'postgraduate', 'ماجستير الحوسبة السحابية', '2026-01-14 08:08:08'),
(35, '2025/2026', 'المستوى الأول', 'الفصل الثاني', 'postgraduate', 'ماجستير الحوسبة السحابية', '2026-01-14 08:09:21'),
(36, '2025/2026', 'المستوى الثاني', 'الفصل الأول', '', NULL, '2026-01-22 08:16:34'),
(37, '2025/2026', 'المستوى الثاني', 'الفصل الأول', '', NULL, '2026-01-22 08:21:05'),
(38, '2025/2026', 'المستوى الثاني', 'الفصل الأول', '', NULL, '2026-01-22 08:28:55'),
(39, '2025/2026', 'المستوى الثاني', 'الفصل الأول', '', NULL, '2026-01-22 08:43:37'),
(40, '2025/2026', 'المستوى الثاني', 'الفصل الأول', '', NULL, '2026-01-22 08:49:04'),
(41, '2025/2026', 'المستوي الثاني', 'الفصل الثاني', '', NULL, '2026-01-22 08:49:44'),
(42, '2025/2026', 'المستوى الثاني', 'الفصل الأول', '', NULL, '2026-01-22 08:55:33'),
(43, '2025/2026', 'المستوى الثاني', 'الفصل الأول', '', NULL, '2026-01-22 08:56:25'),
(44, '2025/2026', 'المستوى الثاني', 'الفصل الأول', '', NULL, '2026-01-22 08:59:52'),
(45, '2025/2026', 'المستوى الثاني', 'الفصل الأول', '', NULL, '2026-01-22 09:01:41'),
(46, '2025/2026', 'المستوى الثاني', 'الفصل الأول', '', NULL, '2026-01-22 09:02:07'),
(47, '2025/2026', 'المستوى الأول', 'الفصل الأول', '', NULL, '2026-01-22 09:02:18'),
(48, '2025/2026', 'المستوى الأول', 'الفصل الأول', '', NULL, '2026-01-22 09:02:22'),
(49, '2025/2026', 'المستوى الأول', 'الفصل الثاني', 'bachelor', NULL, '2026-02-02 08:44:01'),
(50, '2025/2026', 'المستوى الأول', 'الفصل الثاني', 'bachelor', NULL, '2026-02-02 08:45:29'),
(51, '2025/2026', 'المستوى الأول', 'الفصل الثاني', 'bachelor', NULL, '2026-02-02 08:49:18'),
(52, '2025/2026', 'المستوى الثاني', 'الفصل الأول', 'bachelor', NULL, '2026-02-02 12:24:51'),
(53, '2025/2026', 'المستوى الثاني', 'الفصل الأول', 'bachelor', NULL, '2026-02-02 12:25:28'),
(54, '2025/2026', 'المستوى الثاني', 'الفصل الثاني', 'bachelor', NULL, '2026-02-03 13:07:37'),
(55, '2025/2026', 'المستوى الأول', 'الفصل الثاني', 'bachelor', NULL, '2026-02-03 14:02:12'),
(56, '2025/2026', 'المستوى الأول', 'الفصل الأول', 'bachelor', NULL, '2026-02-03 14:02:19'),
(57, '2025/2026', 'المستوى الأول', 'الفصل الأول', 'bachelor', NULL, '2026-02-03 14:09:37'),
(58, '2025/2026', 'المستوى الأول', 'الفصل الأول', 'bachelor', NULL, '2026-02-03 14:12:50'),
(59, '2025/2026', 'المستوى الأول', 'الفصل الأول', 'bachelor', NULL, '2026-02-03 14:15:42'),
(60, '2025/2026', 'المستوى الأول', 'الفصل الثاني', 'bachelor', NULL, '2026-02-03 14:16:17'),
(61, '2025/2026', 'المستوى الأول', 'الفصل الأول', 'bachelor', NULL, '2026-02-03 14:16:39'),
(62, '2025/2026', 'المستوى الأول', 'الفصل الأول', 'bachelor', NULL, '2026-02-03 14:19:10'),
(63, '2025/2026', 'المستوى الأول', 'الفصل الثاني', 'bachelor', NULL, '2026-02-03 14:20:35'),
(64, '2025/2026', 'المستوى الأول', 'الفصل الأول', 'bachelor', NULL, '2026-02-03 14:20:47'),
(65, '2025/2026', 'المستوى الأول', 'الفصل الأول', 'bachelor', NULL, '2026-02-03 14:25:08'),
(66, '2025/2026', 'المستوى الأول', 'الفصل الثاني', 'bachelor', NULL, '2026-02-03 14:25:33'),
(67, '2025/2026', 'المستوى الأول', 'الفصل الثاني', 'bachelor', NULL, '2026-02-03 14:26:05'),
(68, '2025/2026', 'المستوى الأول', 'الفصل الثاني', 'bachelor', NULL, '2026-02-04 11:29:31'),
(69, '2025/2026', 'المستوى الأول', 'الفصل الثاني', 'bachelor', NULL, '2026-02-05 08:02:11'),
(70, '2025/2026', 'المستوى الأول', 'الفصل الأول', 'bachelor', NULL, '2026-02-05 11:46:50'),
(71, '2025/2026', 'المستوى الثاني', 'الفصل الأول', 'bachelor', NULL, '2026-02-05 11:47:21'),
(72, '2025/2026', 'المستوى الأول', 'الفصل الأول', 'bachelor', NULL, '2026-02-05 12:23:35'),
(73, '2025/2026', 'المستوى الأول', 'الفصل الأول', 'bachelor', NULL, '2026-02-05 12:32:20'),
(74, '2025/2026', 'المستوى الخامس', 'الفصل الأول', 'bachelor', NULL, '2026-02-07 11:10:34'),
(75, '2025/2026', 'المستوى الخامس', 'الفصل الأول', 'bachelor', NULL, '2026-02-07 11:10:34');

-- --------------------------------------------------------

--
-- Table structure for table `books`
--

CREATE TABLE IF NOT EXISTS `books` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) CHARACTER SET utf8 NOT NULL,
  `description` text CHARACTER SET utf8,
  `author` varchar(255) CHARACTER SET utf8 DEFAULT NULL,
  `faculty` varchar(255) CHARACTER SET utf8 DEFAULT NULL,
  `pdf_url` varchar(500) CHARACTER SET utf8 DEFAULT NULL,
  `is_pdf` tinyint(1) DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `is_borrowed` tinyint(1) DEFAULT '0',
  `borrower_name` varchar(255) CHARACTER SET utf8mb4 DEFAULT NULL,
  `borrower_id` varchar(255) CHARACTER SET utf8 DEFAULT NULL,
  `borrowed_at` datetime DEFAULT NULL,
  `returned_at` datetime DEFAULT NULL,
  `copies` int(11) DEFAULT '1',
  `location` varchar(255) CHARACTER SET utf8 DEFAULT NULL,
  `faculty_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_books_faculty` (`faculty_id`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=22 ;

--
-- Dumping data for table `books`
--

INSERT INTO `books` (`id`, `title`, `description`, `author`, `faculty`, `pdf_url`, `is_pdf`, `created_at`, `is_borrowed`, `borrower_name`, `borrower_id`, `borrowed_at`, `returned_at`, `copies`, `location`, `faculty_id`) VALUES
(1, 'Database Systems', 'كتاب شامل لقواعد البيانات', 'Elmasri', NULL, NULL, 0, '2025-12-28 11:20:32', 0, NULL, NULL, NULL, NULL, 3, 'المكتبة الرئيسية - رف A1', 1),
(2, 'Computer Networks', 'أساسيات الشبكات', 'Tanenbaum', NULL, NULL, 0, '2025-12-28 11:20:32', 0, NULL, NULL, NULL, NULL, 2, 'المكتبة الرئيسية - رف A2', 1),
(3, 'Operating Systems', 'مبادئ نظم التشغيل', 'Silberschatz', NULL, NULL, 0, '2025-12-28 11:20:32', 0, NULL, NULL, NULL, NULL, 2, 'المكتبة الرئيسية - رف A3', 1),
(4, 'Software Engineering', 'مدخل لهندسة البرمجيات', 'Pressman', NULL, NULL, 10, '2025-12-28 11:20:32', 0, NULL, NULL, NULL, NULL, 1, 'المكتبة الرئيسية - رف A4', 1),
(5, 'Data Structures', 'هياكل البيانات', 'Cormen', NULL, NULL, 0, '2025-12-28 11:20:32', 0, NULL, NULL, NULL, NULL, 2, 'المكتبة الرئيسية - رف A5', 1),
(6, 'Engineering Mechanics', 'ميكانيكا هندسية', 'Hibbeler', NULL, NULL, 0, '2025-12-28 11:20:32', 0, NULL, NULL, NULL, NULL, 1, 'المكتبة الهندسية - رف B1', 2),
(7, 'Circuit Analysis', 'تحليل الدوائر', 'Hayt', NULL, NULL, 0, '2025-12-28 11:20:32', 0, NULL, NULL, NULL, NULL, 2, 'المكتبة الهندسية - رف B2', 2),
(8, 'Electronics', 'إلكترونيات', 'Sedra', NULL, NULL, 0, '2025-12-28 11:20:32', 0, NULL, NULL, NULL, NULL, 1, 'المكتبة الهندسية - رف B3', 2),
(9, 'Power Systems', 'أنظمة القدرة', 'Glover', NULL, NULL, 0, '2025-12-28 11:20:32', 0, NULL, NULL, NULL, NULL, 1, 'المكتبة الهندسية - رف B4', 2),
(10, 'Civil Structures', 'منشآت', 'Nawy', NULL, NULL, 0, '2025-12-28 11:20:32', 0, NULL, NULL, NULL, NULL, 1, 'المكتبة الهندسية - رف B5', 2),
(11, 'Principles of Management', 'مبادئ الإدارة', 'Robbins', NULL, NULL, 0, '2025-12-28 11:20:32', 0, NULL, NULL, NULL, NULL, 3, 'مكتبة الاقتصاد - رف C1', 3),
(12, 'Human Resource', 'إدارة الموارد البشرية', 'Dessler', NULL, NULL, 0, '2025-12-28 11:20:32', 0, NULL, NULL, NULL, NULL, 2, 'مكتبة الاقتصاد - رف C2', 3),
(13, 'Accounting 1', 'محاسبة 1', 'Kieso', NULL, NULL, 0, '2025-12-28 11:20:32', 0, NULL, NULL, NULL, NULL, 2, 'مكتبة الاقتصاد - رف C3', 3),
(14, 'Microeconomics', 'اقتصاد جزئي', 'Mankiw', NULL, NULL, 0, '2025-12-28 11:20:32', 0, NULL, NULL, NULL, NULL, 1, 'مكتبة الاقتصاد - رف C4', 3),
(15, 'Business Finance', '002', 'Ross', NULL, NULL, 0, '2025-12-28 11:20:32', 0, NULL, NULL, NULL, NULL, 1, 'مكتبة الاقتصاد - رف C5', 3),
(16, 'مقدمه في لغه بايثون', '002', 'خالد', NULL, '', 0, '2025-12-29 09:41:26', 0, NULL, NULL, NULL, NULL, 3, '', 1),
(18, 'نظرية المحاسبة', '002', 'ادم الهادي', NULL, '', 0, '2025-12-29 10:57:29', 0, NULL, NULL, NULL, NULL, 10, 'الرف الثاني', 3),
(19, 'مقدمة في الاقتصاد', '002', 'اولقا حسن', NULL, 'http://localhost:5000/uploads/1767006113066.pdf', 1, '2025-12-29 11:01:53', 0, NULL, NULL, NULL, NULL, 1, '', 3),
(20, 'test', '002', 'henary', NULL, '', 0, '2026-02-02 11:30:04', 0, NULL, NULL, NULL, NULL, 1, 'rf45', 3),
(21, 'df', '002', 'rty', NULL, 'http://localhost:5000/uploads/1770033643111.pdf', 1, '2026-02-02 12:00:25', 0, NULL, NULL, NULL, NULL, 2, '', 3);

-- --------------------------------------------------------

--
-- Table structure for table `borrowed_books`
--

CREATE TABLE IF NOT EXISTS `borrowed_books` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `book_id` int(11) NOT NULL,
  `student_id` varchar(255) CHARACTER SET utf8 NOT NULL,
  `student_name` varchar(255) CHARACTER SET utf8 NOT NULL,
  `faculty` varchar(255) CHARACTER SET utf8 NOT NULL,
  `borrowed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `returned_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `book_id` (`book_id`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=7 ;

--
-- Dumping data for table `borrowed_books`
--

INSERT INTO `borrowed_books` (`id`, `book_id`, `student_id`, `student_name`, `faculty`, `borrowed_at`, `returned_at`) VALUES
(4, 16, '240005', 'خالد يوسف', 'كلية علوم الحاسوب', '2026-02-02 12:03:43', NULL),
(5, 20, '240005', 'خالد يوسف', 'كلية الاقتصاد', '2026-02-02 12:30:12', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `courses`
--

CREATE TABLE IF NOT EXISTS `courses` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `faculty_id` int(11) NOT NULL,
  `department_id` int(11) NOT NULL,
  `academic_year` varchar(20) NOT NULL,
  `level_name` varchar(50) NOT NULL,
  `term_name` varchar(50) NOT NULL,
  `course_name` varchar(255) NOT NULL,
  `instructor` varchar(255) DEFAULT NULL,
  `credit_hours` decimal(5,2) DEFAULT NULL,
  `total_mark` int(11) NOT NULL DEFAULT '100',
  `coursework_max` int(11) NOT NULL DEFAULT '40',
  `final_exam_max` int(11) NOT NULL DEFAULT '60',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  `program_type` varchar(20) NOT NULL DEFAULT 'bachelor',
  `postgraduate_program` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_courses_filter` (`faculty_id`,`department_id`,`academic_year`,`level_name`,`term_name`),
  KEY `fk_courses_department` (`department_id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=16 ;

--
-- Dumping data for table `courses`
--

INSERT INTO `courses` (`id`, `faculty_id`, `department_id`, `academic_year`, `level_name`, `term_name`, `course_name`, `instructor`, `credit_hours`, `total_mark`, `coursework_max`, `final_exam_max`, `created_at`, `updated_at`, `program_type`, `postgraduate_program`) VALUES
(1, 1, 2, '2025/2026', 'المستوى الأول', 'الفصل الأول', 'برمجة 1', 'د. محمد عادل', 4.00, 100, 40, 60, '2025-12-28 11:20:32', '2025-12-28 11:20:32', 'bachelor', NULL),
(2, 1, 2, '2025/2026', 'المستوى الأول', 'الفصل الأول', 'مقدمة قواعد البيانات', 'د. محمد عادل', 3.00, 100, 40, 60, '2025-12-28 11:20:32', '2025-12-28 11:20:32', 'bachelor', NULL),
(3, 1, 2, '2025/2026', 'المستوى الأول', 'الفصل الأول', 'رياضيات 1', 'د. سارة نبيل', 3.00, 100, 40, 60, '2025-12-28 11:20:32', '2025-12-28 11:20:32', 'bachelor', NULL),
(4, 1, 2, '2025/2026', 'المستوى الأول', 'الفصل الأول', 'مبادئ نظم التشغيل', 'د. سارة نبيل', 3.00, 100, 40, 60, '2025-12-28 11:20:32', '2025-12-28 11:20:32', 'bachelor', NULL),
(5, 1, 1, '2025/2026', 'المستوى الأول', 'الفصل الأول', 'شبكات الحاسوب', 'د. سارة نبيل', 3.00, 100, 40, 60, '2025-12-28 11:20:32', '2025-12-28 11:20:32', 'bachelor', NULL),
(6, 1, 1, '2025/2026', 'المستوى الأول', 'الفصل الأول', 'تحليل النظم', 'د. علي الطيب', 3.00, 100, 40, 60, '2025-12-28 11:20:32', '2025-12-28 11:20:32', 'bachelor', NULL),
(7, 2, 5, '2025/2026', 'المستوى الثاني', 'الفصل الأول', 'دوائر كهربائية', 'م. أحمد الطيب', 3.00, 100, 40, 60, '2025-12-28 11:20:32', '2025-12-28 11:20:32', 'bachelor', NULL),
(8, 2, 5, '2025/2026', 'المستوى الثاني', 'الفصل الأول', 'إلكترونيات', 'م. أحمد الطيب', 3.00, 100, 40, 60, '2025-12-28 11:20:32', '2025-12-28 11:20:32', 'bachelor', NULL),
(9, 3, 8, '2025/2026', 'المستوى الثاني', 'الفصل الأول', 'مبادئ الإدارة', 'د. نادر حسن', 3.00, 100, 40, 60, '2025-12-28 11:20:32', '2025-12-28 11:20:32', 'bachelor', NULL),
(10, 3, 8, '2025/2026', 'المستوى الثاني', 'الفصل الأول', 'إدارة الموارد البشرية', 'أ. ريم عمر', 3.00, 100, 40, 60, '2025-12-28 11:20:32', '2025-12-28 11:20:32', 'bachelor', NULL),
(11, 3, 9, '2025/2026', 'المستوى الثاني', 'الفصل الأول', 'اداره الاقتصاد', 'أ. ريم عمر', 3.00, 100, 40, 60, '2025-12-31 11:31:54', '0000-00-00 00:00:00', 'bachelor', NULL),
(12, 1, 3, '2026/2027', 'المستوى الأول', 'الفصل الأول', 'البرمجيات المدمجة', 'د. علي الطيب', 3.00, 100, 40, 60, '2025-12-31 13:51:49', '0000-00-00 00:00:00', 'bachelor', 'ماجستير البرمجيات المدمجة'),
(13, 1, 3, '2025/2026', 'المستوى الثاني', 'الفصل الأول', 'هندسة برمجيات', 'د. علي الطيب', 3.00, 100, 40, 60, '2026-01-13 06:43:27', '0000-00-00 00:00:00', 'bachelor', NULL),
(14, 1, 2, '2025/2026', 'المستوى الأول', 'الفصل الثاني', 'شبكات', 'د. سارة نبيل', 3.00, 100, 40, 60, '2026-02-04 11:29:48', '0000-00-00 00:00:00', 'bachelor', NULL),
(15, 1, 2, '2025/2026', 'المستوى الأول', 'الفصل الثاني', 'تفاعل الانسان والحاسوب', 'د. علي الطيب', 3.00, 100, 40, 60, '2026-02-05 08:02:49', '0000-00-00 00:00:00', 'bachelor', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `course_grades`
--

CREATE TABLE IF NOT EXISTS `course_grades` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `course_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `attempt_number` tinyint(3) unsigned NOT NULL DEFAULT '1',
  `coursework_mark` decimal(6,2) DEFAULT NULL,
  `final_exam_mark` decimal(6,2) DEFAULT NULL,
  `total_mark` decimal(6,2) DEFAULT NULL,
  `letter` varchar(10) DEFAULT NULL,
  `points` decimal(4,2) DEFAULT NULL,
  `is_repeat` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_student_course_attempt` (`student_id`,`course_id`,`attempt_number`),
  KEY `fk_course_grades_student` (`student_id`),
  KEY `fk_course_grades_course` (`course_id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=104 ;

--
-- Dumping data for table `course_grades`
--

INSERT INTO `course_grades` (`id`, `course_id`, `student_id`, `attempt_number`, `coursework_mark`, `final_exam_mark`, `total_mark`, `letter`, `points`, `is_repeat`, `created_at`, `updated_at`) VALUES
(21, 5, 2, 1, 35.00, 27.00, 62.00, 'C', 2.00, 0, '2025-12-28 11:20:32', '2025-12-28 11:20:32'),
(22, 6, 2, 1, 36.00, 39.00, 75.00, 'B', 3.00, 0, '2025-12-28 11:20:32', '2025-12-28 11:20:32'),
(23, 5, 6, 1, 35.00, 31.00, 66.00, 'C', 2.00, 0, '2025-12-28 11:20:32', '2025-12-28 11:20:32'),
(24, 6, 6, 1, 21.00, 57.00, 78.00, 'B', 3.00, 0, '2025-12-28 11:20:32', '2025-12-28 11:20:32'),
(25, 7, 9, 1, 36.00, 60.00, 96.00, 'A', 4.00, 0, '2025-12-28 11:20:32', '2025-12-28 11:20:32'),
(26, 8, 9, 1, 24.00, 43.00, 67.00, 'C', 2.00, 0, '2025-12-28 11:20:32', '2025-12-28 11:20:32'),
(27, 7, 10, 1, 21.00, 55.00, 76.00, 'B', 3.00, 0, '2025-12-28 11:20:32', '2025-12-28 11:20:32'),
(28, 8, 10, 1, 40.00, 24.00, 64.00, 'C', 2.00, 0, '2025-12-28 11:20:32', '2025-12-28 11:20:32'),
(29, 7, 11, 1, 36.00, 23.00, 59.00, 'D', 1.00, 0, '2025-12-28 11:20:32', '2025-12-28 11:20:32'),
(30, 8, 11, 1, 37.00, 33.00, 70.00, 'C+', 2.50, 0, '2025-12-28 11:20:32', '2025-12-28 11:20:32'),
(31, 9, 12, 1, 33.00, 54.00, 87.00, 'A', 4.00, 0, '2025-12-28 11:20:32', '2025-12-28 11:20:32'),
(33, 9, 13, 1, 32.00, 57.00, 89.00, 'A', 4.00, 0, '2025-12-28 11:20:32', '2025-12-28 11:20:32'),
(35, 9, 14, 1, 27.00, 35.00, 62.00, 'C', 2.00, 0, '2025-12-28 11:20:32', '2025-12-28 11:20:32'),
(43, 10, 14, 1, 35.00, 35.00, 70.00, 'B', 3.00, 0, '2026-01-31 09:57:36', '2026-02-04 12:33:36'),
(44, 10, 13, 1, 32.00, 43.00, 75.00, 'B+', 3.50, 0, '2026-01-31 09:57:36', '2026-02-04 12:33:36'),
(45, 10, 12, 1, 0.00, 20.00, 20.00, 'F', 0.00, 0, '2026-01-31 09:57:36', '2026-02-04 12:33:36'),
(46, 1, 8, 1, 39.00, 60.00, 99.00, 'A', 4.00, 0, '2026-02-03 11:59:37', '2026-02-04 10:47:32'),
(47, 1, 1, 1, 28.00, 29.00, 57.00, 'C+', 2.50, 0, '2026-02-03 11:59:37', '2026-02-04 10:47:32'),
(48, 1, 3, 1, 36.00, 23.00, 59.00, 'C+', 2.50, 0, '2026-02-03 11:59:37', '2026-02-04 10:47:32'),
(49, 1, 7, 1, 25.00, 60.00, 85.00, 'A', 4.00, 0, '2026-02-03 11:59:37', '2026-02-04 10:47:32'),
(50, 1, 4, 1, 20.00, 35.00, 55.00, 'C+', 2.50, 0, '2026-02-03 11:59:37', '2026-02-04 10:47:32'),
(56, 4, 8, 1, 31.00, 29.00, 60.00, 'C+', 2.50, 0, '2026-02-03 11:59:47', '0000-00-00 00:00:00'),
(57, 4, 1, 1, 21.00, 43.00, 64.00, 'C+', 2.50, 0, '2026-02-03 11:59:47', '0000-00-00 00:00:00'),
(58, 4, 3, 1, 31.00, 46.00, 77.00, 'B+', 3.50, 0, '2026-02-03 11:59:47', '0000-00-00 00:00:00'),
(59, 4, 7, 1, 36.00, 45.00, 81.00, 'B+', 3.50, 0, '2026-02-03 11:59:47', '0000-00-00 00:00:00'),
(60, 4, 4, 1, 36.00, 27.00, 63.00, 'C+', 2.50, 0, '2026-02-03 11:59:47', '0000-00-00 00:00:00'),
(61, 2, 8, 1, 19.00, 55.00, 74.00, 'B', 3.00, 0, '2026-02-03 11:59:50', '0000-00-00 00:00:00'),
(62, 2, 1, 1, 30.00, 23.00, 53.00, 'C', 2.00, 0, '2026-02-03 11:59:50', '0000-00-00 00:00:00'),
(63, 2, 3, 1, 34.00, 33.00, 67.00, 'B', 3.00, 0, '2026-02-03 11:59:50', '0000-00-00 00:00:00'),
(64, 2, 7, 1, 38.00, 57.00, 95.00, 'A', 4.00, 0, '2026-02-03 11:59:50', '2026-02-03 22:00:00'),
(65, 2, 4, 1, 20.00, 55.00, 75.00, 'B+', 3.50, 0, '2026-02-03 11:59:50', '2026-02-03 22:00:00'),
(83, 3, 3, 1, 10.00, 50.00, 60.00, 'C+', 2.50, 0, '2026-02-04 10:21:20', '2026-02-05 11:23:05'),
(84, 3, 3, 2, 10.00, 30.00, 40.00, 'F', 0.00, 1, '2026-02-04 10:48:51', '0000-00-00 00:00:00'),
(89, 14, 8, 1, 25.00, 40.00, 65.00, 'B', 3.00, 0, '2026-02-04 11:31:57', '2026-02-04 11:36:49'),
(90, 14, 1, 1, 25.00, 50.00, 75.00, 'B+', 3.50, 0, '2026-02-04 11:31:57', '2026-02-04 11:36:49'),
(91, 14, 3, 1, 25.00, 60.00, 85.00, 'A', 4.00, 0, '2026-02-04 11:31:57', '2026-02-04 11:36:49'),
(92, 14, 7, 1, 25.00, 45.00, 70.00, 'B', 3.00, 0, '2026-02-04 11:31:57', '2026-02-04 11:36:49'),
(93, 14, 4, 1, 25.00, 55.00, 80.00, 'B+', 3.50, 0, '2026-02-04 11:31:57', '2026-02-04 11:36:49'),
(94, 3, 3, 3, 10.00, 50.00, 60.00, 'C*', 2.00, 1, '2026-02-04 11:36:16', '0000-00-00 00:00:00'),
(95, 15, 8, 1, 30.00, 30.00, 60.00, 'C+', 2.50, 0, '2026-02-05 08:05:38', '0000-00-00 00:00:00'),
(96, 15, 1, 1, 30.00, 35.00, 65.00, 'B', 3.00, 0, '2026-02-05 08:05:38', '0000-00-00 00:00:00'),
(97, 15, 3, 1, 30.00, 40.00, 70.00, 'B', 3.00, 0, '2026-02-05 08:05:38', '0000-00-00 00:00:00'),
(98, 15, 7, 1, 30.00, 45.00, 75.00, 'B+', 3.50, 0, '2026-02-05 08:05:38', '0000-00-00 00:00:00'),
(99, 15, 4, 1, 30.00, 50.00, 80.00, 'B+', 3.50, 0, '2026-02-05 08:05:38', '0000-00-00 00:00:00'),
(100, 3, 8, 1, 40.00, 50.00, 90.00, 'A', 4.00, 0, '2026-02-05 11:23:05', '0000-00-00 00:00:00'),
(101, 3, 1, 1, 30.00, 30.00, 60.00, 'C+', 2.50, 0, '2026-02-05 11:23:05', '0000-00-00 00:00:00'),
(102, 3, 7, 1, 40.00, 10.00, 50.00, 'C', 2.00, 0, '2026-02-05 11:23:05', '0000-00-00 00:00:00'),
(103, 3, 4, 1, 20.00, 30.00, 50.00, 'C', 2.00, 0, '2026-02-05 11:23:05', '0000-00-00 00:00:00');

-- --------------------------------------------------------

--
-- Table structure for table `departments`
--

CREATE TABLE IF NOT EXISTS `departments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `faculty_id` int(11) NOT NULL,
  `department_name` varchar(200) CHARACTER SET utf8 NOT NULL,
  `levels_count` int(11) DEFAULT '4',
  PRIMARY KEY (`id`),
  KEY `faculty_id` (`faculty_id`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=12 ;

--
-- Dumping data for table `departments`
--

INSERT INTO `departments` (`id`, `faculty_id`, `department_name`, `levels_count`) VALUES
(1, 1, 'نظم معلومات', 4),
(2, 1, 'علوم حاسب', 4),
(3, 1, 'هندسة برمجيات', 4),
(4, 2, 'هندسة مدنية', 5),
(5, 2, 'هندسة كهربائية', 5),
(6, 2, 'هندسة معمارية', 5),
(7, 3, 'محاسبة', 4),
(8, 3, 'إدارة أعمال', 4),
(9, 3, 'اقتصاد', 4),
(10, 4, 'باطني', 4),
(11, 4, 'جراحه', 4);

-- --------------------------------------------------------

--
-- Table structure for table `faculties`
--

CREATE TABLE IF NOT EXISTS `faculties` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `faculty_name` varchar(200) CHARACTER SET utf8 NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=6 ;

--
-- Dumping data for table `faculties`
--

INSERT INTO `faculties` (`id`, `faculty_name`) VALUES
(1, 'كلية علوم الحاسوب'),
(2, 'كلية الهندسة'),
(3, 'كلية الاقتصاد'),
(4, 'كلية علوم التمريض'),
(5, 'كلية المختبرات الطبية');

-- --------------------------------------------------------

--
-- Table structure for table `grading_rules`
--

CREATE TABLE IF NOT EXISTS `grading_rules` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `rule_type` varchar(30) NOT NULL,
  `program_mode` varchar(20) DEFAULT NULL,
  `label` varchar(255) NOT NULL,
  `min_value` decimal(6,2) NOT NULL,
  `max_value` decimal(6,2) NOT NULL,
  `points` decimal(4,2) DEFAULT NULL,
  `term_calc_mode` enum('percentage','courses') DEFAULT NULL,
  `gpa_max` decimal(4,2) DEFAULT NULL,
  `cumulative_calc_mode` enum('simple_avg','weighted_avg') DEFAULT NULL,
  `sort_order` int(11) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `faculty_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_grading_rules_faculty` (`faculty_id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=164 ;

--
-- Dumping data for table `grading_rules`
--

INSERT INTO `grading_rules` (`id`, `rule_type`, `program_mode`, `label`, `min_value`, `max_value`, `points`, `term_calc_mode`, `gpa_max`, `cumulative_calc_mode`, `sort_order`, `created_at`, `updated_at`, `faculty_id`) VALUES
(53, 'gpa_settings', NULL, '{"total_mark":100,"final_exam_max":60,"coursework_max":40,"rounding_decimals":2}', 0.00, 0.00, NULL, 'courses', 4.00, 'weighted_avg', 0, '2025-12-28 13:29:04', '2025-12-28 13:29:04', 2),
(54, 'gpa_settings', NULL, '{"total_mark":100,"final_exam_max":60,"coursework_max":40,"rounding_decimals":2}', 0.00, 0.00, NULL, 'courses', 4.00, 'weighted_avg', 0, '2025-12-28 13:29:04', '2025-12-28 13:29:04', 3),
(56, 'grade_scale', NULL, 'A', 80.00, 100.00, 4.00, NULL, NULL, NULL, 1, '2025-12-28 13:29:04', '2025-12-28 13:29:04', 2),
(57, 'grade_scale', NULL, 'A', 80.00, 100.00, 4.00, NULL, NULL, NULL, 1, '2025-12-28 13:29:04', '2025-12-28 13:29:04', 3),
(59, 'grade_scale', NULL, 'B+', 75.00, 79.99, 3.50, NULL, NULL, NULL, 2, '2025-12-28 13:29:04', '2025-12-28 13:29:04', 2),
(60, 'grade_scale', NULL, 'B+', 75.00, 79.99, 3.50, NULL, NULL, NULL, 2, '2025-12-28 13:29:04', '2025-12-28 13:29:04', 3),
(62, 'grade_scale', NULL, 'B', 70.00, 74.99, 3.00, NULL, NULL, NULL, 3, '2025-12-28 13:29:04', '2025-12-28 13:29:04', 2),
(63, 'grade_scale', NULL, 'B', 70.00, 74.99, 3.00, NULL, NULL, NULL, 3, '2025-12-28 13:29:04', '2025-12-28 13:29:04', 3),
(65, 'grade_scale', NULL, 'C+', 60.00, 69.99, 2.50, NULL, NULL, NULL, 4, '2025-12-28 13:29:04', '2025-12-28 13:29:04', 2),
(66, 'grade_scale', NULL, 'C+', 60.00, 69.99, 2.50, NULL, NULL, NULL, 4, '2025-12-28 13:29:04', '2025-12-28 13:29:04', 3),
(68, 'grade_scale', NULL, 'C', 50.00, 59.99, 2.00, NULL, NULL, NULL, 5, '2025-12-28 13:29:04', '2025-12-28 13:29:04', 2),
(69, 'grade_scale', NULL, 'C', 50.00, 59.99, 2.00, NULL, NULL, NULL, 5, '2025-12-28 13:29:04', '2025-12-28 13:29:04', 3),
(71, 'grade_scale', NULL, 'F', 0.00, 49.99, 0.00, NULL, NULL, NULL, 7, '2025-12-28 13:29:04', '2025-12-28 13:29:04', 2),
(72, 'grade_scale', NULL, 'F', 0.00, 49.99, 0.00, NULL, NULL, NULL, 7, '2025-12-28 13:29:04', '2025-12-28 13:29:04', 3),
(87, 'grade_scale', NULL, 'C*', -1.00, -1.00, 2.00, NULL, NULL, NULL, 6, '2025-12-28 13:29:04', '2025-12-28 13:29:04', 2),
(88, 'grade_scale', NULL, 'C*', -1.00, -1.00, 2.00, NULL, NULL, NULL, 6, '2025-12-28 13:29:04', '2025-12-28 13:29:04', 3),
(90, 'gpa_classification', 'honors', 'مرتبة الشرف الأولى', 3.50, 4.00, NULL, NULL, NULL, NULL, 1, '2025-12-28 13:29:04', '2025-12-28 13:29:04', 2),
(91, 'gpa_classification', 'honors', 'مرتبة الشرف الأولى', 3.50, 4.00, NULL, NULL, NULL, NULL, 1, '2025-12-28 13:29:04', '2025-12-28 13:29:04', 3),
(93, 'gpa_classification', 'honors', 'مرتبة الشرف الثانية (القسم الأول)', 3.00, 3.49, NULL, NULL, NULL, NULL, 2, '2025-12-28 13:29:04', '2025-12-28 13:29:04', 2),
(94, 'gpa_classification', 'honors', 'مرتبة الشرف الثانية (القسم الأول)', 3.00, 3.49, NULL, NULL, NULL, NULL, 2, '2025-12-28 13:29:04', '2025-12-28 13:29:04', 3),
(96, 'gpa_classification', 'honors', 'مرتبة الشرف الثانية (القسم الثاني)', 2.50, 2.99, NULL, NULL, NULL, NULL, 3, '2025-12-28 13:29:04', '2025-12-28 13:29:04', 2),
(97, 'gpa_classification', 'honors', 'مرتبة الشرف الثانية (القسم الثاني)', 2.50, 2.99, NULL, NULL, NULL, NULL, 3, '2025-12-28 13:29:04', '2025-12-28 13:29:04', 3),
(99, 'gpa_classification', 'honors', 'مرتبة الشرف الثالثة', 2.00, 2.49, NULL, NULL, NULL, NULL, 4, '2025-12-28 13:29:04', '2025-12-28 13:29:04', 2),
(100, 'gpa_classification', 'honors', 'مرتبة الشرف الثالثة', 2.00, 2.49, NULL, NULL, NULL, NULL, 4, '2025-12-28 13:29:04', '2025-12-28 13:29:04', 3),
(105, 'gpa_classification', 'general', 'ممتاز', 3.50, 4.00, NULL, NULL, NULL, NULL, 1, '2025-12-28 13:29:04', '2025-12-28 13:29:04', 2),
(106, 'gpa_classification', 'general', 'ممتاز', 3.50, 4.00, NULL, NULL, NULL, NULL, 1, '2025-12-28 13:29:04', '2025-12-28 13:29:04', 3),
(108, 'gpa_classification', 'general', 'جيد جداً', 3.00, 3.49, NULL, NULL, NULL, NULL, 2, '2025-12-28 13:29:04', '2025-12-28 13:29:04', 2),
(109, 'gpa_classification', 'general', 'جيد جداً', 3.00, 3.49, NULL, NULL, NULL, NULL, 2, '2025-12-28 13:29:04', '2025-12-28 13:29:04', 3),
(111, 'gpa_classification', 'general', 'جيد', 2.50, 2.99, NULL, NULL, NULL, NULL, 3, '2025-12-28 13:29:04', '2025-12-28 13:29:04', 2),
(112, 'gpa_classification', 'general', 'جيد', 2.50, 2.99, NULL, NULL, NULL, NULL, 3, '2025-12-28 13:29:04', '2025-12-28 13:29:04', 3),
(114, 'gpa_classification', 'general', 'مقبول', 2.00, 2.49, NULL, NULL, NULL, NULL, 4, '2025-12-28 13:29:04', '2025-12-28 13:29:04', 2),
(115, 'gpa_classification', 'general', 'مقبول', 2.00, 2.49, NULL, NULL, NULL, NULL, 4, '2025-12-28 13:29:04', '2025-12-28 13:29:04', 3),
(148, 'gpa_settings', NULL, '{"total_mark":100,"final_exam_max":60,"coursework_max":40,"rounding_decimals":2}', 0.00, 0.00, NULL, 'courses', 4.00, 'weighted_avg', 0, '2026-02-03 13:58:46', '2026-02-03 13:58:46', 1),
(149, 'grade_scale', NULL, 'A', 85.00, 100.00, 4.00, NULL, NULL, NULL, 1, '2026-02-03 13:58:46', '2026-02-03 13:58:46', 1),
(150, 'grade_scale', NULL, 'B+', 75.00, 85.00, 3.50, NULL, NULL, NULL, 2, '2026-02-03 13:58:46', '2026-02-03 13:58:46', 1),
(151, 'grade_scale', NULL, 'B', 65.00, 75.00, 3.00, NULL, NULL, NULL, 3, '2026-02-03 13:58:46', '2026-02-03 13:58:46', 1),
(152, 'grade_scale', NULL, 'C+', 55.00, 65.00, 2.50, NULL, NULL, NULL, 4, '2026-02-03 13:58:46', '2026-02-03 13:58:46', 1),
(153, 'grade_scale', NULL, 'C', 50.00, 55.00, 2.00, NULL, NULL, NULL, 5, '2026-02-03 13:58:46', '2026-02-03 13:58:46', 1),
(154, 'grade_scale', NULL, 'C*', -1.00, -1.00, 2.00, NULL, NULL, NULL, 6, '2026-02-03 13:58:46', '2026-02-03 13:58:46', 1),
(155, 'grade_scale', NULL, 'F', 49.00, 0.00, 0.00, NULL, NULL, NULL, 7, '2026-02-03 13:58:46', '2026-02-03 13:58:46', 1),
(156, 'gpa_classification', 'honors', 'مرتبة الشرف الأولى', 3.50, 4.00, NULL, NULL, NULL, NULL, 1, '2026-02-03 13:58:46', '2026-02-03 13:58:46', 1),
(157, 'gpa_classification', 'honors', 'مرتبة الشرف الثانية (القسم الأول)', 3.00, 3.49, NULL, NULL, NULL, NULL, 2, '2026-02-03 13:58:46', '2026-02-03 13:58:46', 1),
(158, 'gpa_classification', 'honors', 'مرتبة الشرف الثانية (القسم الثاني)', 2.50, 2.99, NULL, NULL, NULL, NULL, 3, '2026-02-03 13:58:46', '2026-02-03 13:58:46', 1),
(159, 'gpa_classification', 'honors', 'مرتبة الشرف الثالثة', 2.00, 2.49, NULL, NULL, NULL, NULL, 4, '2026-02-03 13:58:46', '2026-02-03 13:58:46', 1),
(160, 'gpa_classification', 'general', 'ممتاز', 3.50, 4.00, NULL, NULL, NULL, NULL, 1, '2026-02-03 13:58:46', '2026-02-03 13:58:46', 1),
(161, 'gpa_classification', 'general', 'جيد جداً', 3.00, 3.49, NULL, NULL, NULL, NULL, 2, '2026-02-03 13:58:46', '2026-02-03 13:58:46', 1),
(162, 'gpa_classification', 'general', 'جيد', 2.50, 2.99, NULL, NULL, NULL, NULL, 3, '2026-02-03 13:58:46', '2026-02-03 13:58:46', 1),
(163, 'gpa_classification', 'general', 'مقبول', 2.00, 2.49, NULL, NULL, NULL, NULL, 4, '2026-02-03 13:58:46', '2026-02-03 13:58:46', 1);

-- --------------------------------------------------------

--
-- Table structure for table `rooms`
--

CREATE TABLE IF NOT EXISTS `rooms` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `room_name` varchar(100) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_room_name` (`room_name`),
  KEY `room_name` (`room_name`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=5 ;

--
-- Dumping data for table `rooms`
--

INSERT INTO `rooms` (`id`, `room_name`, `created_at`) VALUES
(1, 'قاعة 1', '2025-12-30 12:16:30'),
(2, 'قاعة 2', '2025-12-30 13:36:58'),
(3, 'قاعة 3', '2025-12-30 13:37:03'),
(4, 'قاعة 4', '2026-01-13 07:16:18');

-- --------------------------------------------------------

--
-- Table structure for table `staff_members`
--

CREATE TABLE IF NOT EXISTS `staff_members` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `full_name` varchar(255) NOT NULL,
  `staff_code` varchar(50) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `faculty_id` int(11) NOT NULL,
  `department_id` int(11) DEFAULT NULL,
  `academic_rank` varchar(100) DEFAULT NULL,
  `specialization` varchar(255) DEFAULT NULL,
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_staff_code` (`staff_code`),
  UNIQUE KEY `uq_staff_email` (`email`),
  KEY `idx_staff_faculty` (`faculty_id`),
  KEY `idx_staff_department` (`department_id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=11 ;

--
-- Dumping data for table `staff_members`
--

INSERT INTO `staff_members` (`id`, `full_name`, `staff_code`, `email`, `phone`, `faculty_id`, `department_id`, `academic_rank`, `specialization`, `status`, `created_at`, `updated_at`) VALUES
(1, 'د. محمد عادل', 'STF-001', 'm.adel@uni.edu', '0912345678', 1, 2, 'أستاذ مساعد', 'قواعد بيانات', 'active', '2025-12-28 11:20:32', '2025-12-28 11:20:32'),
(2, 'د. سارة نبيل', 'STF-002', 's.nabil@uni.edu', '0912345679', 1, 1, 'محاضر', 'شبكات', 'active', '2025-12-28 11:20:32', '2025-12-28 11:20:32'),
(3, 'د. علي الطيب', 'STF-003', 'a.tayeb@uni.edu', '0912345680', 1, 3, 'محاضر', 'هندسة برمجيات', 'active', '2025-12-28 11:20:32', '2025-12-28 11:20:32'),
(4, 'م. أحمد الطيب', 'STF-004', 'eng.ahmed@uni.edu', '0912345681', 2, 5, 'محاضر', 'قدرة وتحكم', 'active', '2025-12-28 11:20:32', '2025-12-28 11:20:32'),
(5, 'م. مروة صالح', 'STF-005', 'm.salih@uni.edu', '0912345682', 2, 4, 'محاضر', 'إنشاءات', 'active', '2025-12-28 11:20:32', '2025-12-28 11:20:32'),
(6, 'د. نادر حسن', 'STF-006', 'n.hassan@uni.edu', '0912345683', 3, 8, 'محاضر', 'إدارة', 'active', '2025-12-28 11:20:32', '2025-12-28 11:20:32'),
(7, 'أ. خالد صالح', 'STF-007', 'k.saleh@uni.edu', '0912345684', 3, 7, 'محاضر', 'محاسبة', 'active', '2025-12-28 11:20:32', '2025-12-28 11:20:32'),
(8, 'أ. ريم عمر', 'STF-008', 'r.omar@uni.edu', '0912345685', 3, 9, 'محاضر', 'اقتصاد', 'active', '2025-12-28 11:20:32', '2026-02-05 12:36:18'),
(10, 'د.محمد علي', NULL, NULL, '09090909', 4, NULL, 'أستاذ مساعد', 'جراحة', 'active', '2025-12-29 13:50:45', '0000-00-00 00:00:00');

-- --------------------------------------------------------

--
-- Table structure for table `students`
--

CREATE TABLE IF NOT EXISTS `students` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `full_name` varchar(255) CHARACTER SET utf8 DEFAULT NULL,
  `university_id` varchar(30) CHARACTER SET utf8 NOT NULL DEFAULT '0',
  `phone` varchar(50) CHARACTER SET utf8 DEFAULT NULL,
  `receipt_number` varchar(100) CHARACTER SET utf8 DEFAULT NULL,
  `department_id` int(11) DEFAULT NULL,
  `college` varchar(255) CHARACTER SET utf8 DEFAULT NULL,
  `level` varchar(100) CHARACTER SET utf8 DEFAULT NULL,
  `academic_year` varchar(50) CHARACTER SET utf8 DEFAULT NULL,
  `academic_status` varchar(100) CHARACTER SET utf8 DEFAULT NULL,
  `registration_status` varchar(100) CHARACTER SET utf8 DEFAULT NULL,
  `notes` text CHARACTER SET utf8,
  `registrar` varchar(255) CHARACTER SET utf8 DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_students_full_name` (`full_name`),
  KEY `fk_students_department` (`department_id`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=21 ;

--
-- Dumping data for table `students`
--

INSERT INTO `students` (`id`, `full_name`, `university_id`, `phone`, `receipt_number`, `department_id`, `college`, `level`, `academic_year`, `academic_status`, `registration_status`, `notes`, `registrar`, `created_at`) VALUES
(1, 'أحمد محمد', '240001', '0978901234', NULL, 2, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-12-28 11:20:32'),
(2, 'سارة علي', '240002', '0945678901', NULL, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-12-28 11:20:32'),
(3, 'عمر حسن', '240003', '0912345678', NULL, 2, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-12-28 11:20:32'),
(4, 'مريم عثمان', '240004', '0989012345', NULL, 2, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-12-28 11:20:32'),
(5, 'خالد يوسف', '240005', '0956789012', NULL, 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-12-28 11:20:32'),
(6, 'هبة أحمد', '240006', '0923456789', NULL, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-12-28 11:20:32'),
(7, 'محمد عبدالسلام', '240007', '0901122334', NULL, 2, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-12-28 11:20:32'),
(8, 'آلاء عمر', '240008', '0902233445', NULL, 2, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-12-28 11:20:32'),
(9, 'ريم خالد', '240009', '0903344556', NULL, 5, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-12-28 11:20:32'),
(10, 'مصطفى عادل', '240010', '0904455667', NULL, 5, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-12-28 11:20:32'),
(11, 'نهى حسن', '240011', '0905566778', NULL, 5, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-12-28 11:20:32'),
(12, 'ضياء أحمد', '240012', '0906677889', NULL, 8, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-12-28 11:20:32'),
(13, 'رنا يوسف', '240013', '0907788990', NULL, 8, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-12-28 11:20:32'),
(14, 'إيهاب عثمان', '240014', '0908899001', NULL, 8, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-12-28 11:20:32'),
(15, 'سلمى محمد', '240015', '0909900112', NULL, 7, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-12-28 11:20:32'),
(16, 'عبير عبده ادم صالح', '201822000313', '090123456', NULL, 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-12-31 13:50:37'),
(17, 'عبير عبده', '123456789', '09552288', NULL, 5, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-01-14 06:13:04'),
(19, 'علي هاشم', '147852369', '0987456321', NULL, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-01-14 08:08:11'),
(20, 'منعم احمد', '250003', '0905050545', NULL, 10, NULL, NULL, NULL, NULL, NULL, NULL, 'المسجل', '2026-02-05 12:32:20');

-- --------------------------------------------------------

--
-- Table structure for table `student_registrations`
--

CREATE TABLE IF NOT EXISTS `student_registrations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `academic_year` varchar(20) NOT NULL,
  `level_name` varchar(100) NOT NULL,
  `term_name` varchar(50) DEFAULT NULL,
  `academic_status` varchar(50) NOT NULL DEFAULT 'منتظم',
  `registration_status` varchar(50) NOT NULL DEFAULT 'مسجّل',
  `receipt_number` varchar(100) CHARACTER SET utf8 DEFAULT NULL,
  `notes` text CHARACTER SET utf8,
  `repeated_courses` text,
  `registrar` varchar(255) CHARACTER SET utf8 DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `result_status` tinyint(1) DEFAULT NULL COMMENT '1 = ناجح, 0 = راسب',
  `program_type` enum('diploma','bachelor','postgraduate') NOT NULL DEFAULT 'bachelor',
  `postgraduate_data` longtext,
  `postgraduate_program` varchar(255) DEFAULT NULL,
  `repeat_count` int(11) DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `fk_reg_student` (`student_id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8mb4 AUTO_INCREMENT=67 ;

--
-- Dumping data for table `student_registrations`
--

INSERT INTO `student_registrations` (`id`, `student_id`, `academic_year`, `level_name`, `term_name`, `academic_status`, `registration_status`, `receipt_number`, `notes`, `repeated_courses`, `registrar`, `created_at`, `result_status`, `program_type`, `postgraduate_data`, `postgraduate_program`, `repeat_count`) VALUES
(1, 1, '2025/2026', 'المستوى الأول', 'الفصل الأول', 'منتظم', 'مسجّل', 'REG-2025001', NULL, NULL, 'seed', '2025-12-28 09:20:32', 1, 'bachelor', NULL, NULL, 0),
(2, 2, '2025/2026', 'المستوى الأول', 'الفصل الأول', 'منتظم', 'مسجّل', 'REG-2025002', NULL, NULL, 'seed', '2025-12-28 09:20:32', NULL, 'bachelor', NULL, NULL, 0),
(3, 3, '2025/2026', 'المستوى الأول', 'الفصل الأول', 'منتظم', 'مسجّل', 'REG-2025003', NULL, NULL, 'seed', '2025-12-28 09:20:32', 1, 'bachelor', NULL, NULL, 0),
(4, 4, '2025/2026', 'المستوى الأول', 'الفصل الأول', 'منتظم', 'مسجّل', 'REG-2025004', NULL, NULL, 'seed', '2025-12-28 09:20:32', 1, 'bachelor', NULL, NULL, 0),
(5, 5, '2025/2026', 'المستوى الأول', 'الفصل الأول', 'منتظم', 'مسجّل', 'REG-2025005', NULL, NULL, 'seed', '2025-12-28 09:20:32', NULL, 'bachelor', NULL, NULL, 0),
(6, 6, '2025/2026', 'المستوى الأول', 'الفصل الأول', 'منتظم', 'مسجّل', 'REG-2025006', NULL, NULL, 'seed', '2025-12-28 09:20:32', NULL, 'bachelor', NULL, NULL, 0),
(7, 7, '2025/2026', 'المستوى الأول', 'الفصل الأول', 'منتظم', 'مسجّل', 'REG-2025007', NULL, NULL, 'seed', '2025-12-28 09:20:32', 1, 'bachelor', NULL, NULL, 0),
(8, 8, '2025/2026', 'المستوى الأول', 'الفصل الأول', 'منتظم', 'مسجّل', 'REG-2025008', NULL, NULL, 'seed', '2025-12-28 09:20:32', 1, 'bachelor', NULL, NULL, 0),
(9, 9, '2025/2026', 'المستوى الثاني', 'الفصل الأول', 'منتظم', 'مسجّل', 'REG-2025009', NULL, NULL, 'seed', '2025-12-28 09:20:32', 1, 'bachelor', NULL, NULL, 0),
(10, 10, '2025/2026', 'المستوى الثاني', 'الفصل الأول', 'منتظم', 'مسجّل', 'REG-2025010', NULL, NULL, 'seed', '2025-12-28 09:20:32', 1, 'bachelor', NULL, NULL, 0),
(11, 11, '2025/2026', 'المستوى الثاني', 'الفصل الأول', 'منتظم', 'مسجّل', 'REG-2025011', NULL, NULL, 'seed', '2025-12-28 09:20:32', 0, 'bachelor', NULL, NULL, 0),
(12, 12, '2025/2026', 'المستوى الثاني', 'الفصل الأول', 'منتظم', 'مسجّل', 'REG-2025012', NULL, NULL, 'seed', '2025-12-28 09:20:32', 1, 'bachelor', NULL, NULL, 0),
(13, 13, '2025/2026', 'المستوى الثاني', 'الفصل الأول', 'منتظم', 'مسجّل', 'REG-2025013', NULL, NULL, 'seed', '2025-12-28 09:20:32', 1, 'bachelor', NULL, NULL, 0),
(14, 14, '2025/2026', 'المستوى الثاني', 'الفصل الأول', 'منتظم', 'مسجّل', 'REG-2025014', NULL, NULL, 'seed', '2025-12-28 09:20:32', 1, 'bachelor', NULL, NULL, 0),
(15, 15, '2025/2026', 'المستوى الثاني', 'الفصل الأول', 'منتظم', 'مسجّل', 'REG-2025015', NULL, NULL, 'seed', '2025-12-28 09:20:32', NULL, 'bachelor', NULL, NULL, 0),
(16, 16, '2026/2027', 'المستوى الأول', 'الفصل الأول', 'مجمّد', 'مسجّل', NULL, NULL, NULL, 'admin', '2025-12-31 11:50:37', NULL, 'postgraduate', '{"prev_degree":"بكالوريوس","prev_university":"السودان","prev_grad_year":"2025","study_type":"بالبحث"}', 'ماجستير البرمجيات المدمجة', 0),
(32, 12, '2025/2026', 'المستوى الثاني', 'الفصل الثاني', 'منتظم', 'مسجّل', NULL, NULL, NULL, 'admin', '2026-02-01 08:36:31', NULL, 'bachelor', NULL, NULL, 0),
(33, 13, '2025/2026', 'المستوى الثاني', 'الفصل الثاني', 'منتظم', 'مسجّل', NULL, NULL, NULL, 'admin', '2026-02-01 08:36:31', NULL, 'bachelor', NULL, NULL, 0),
(34, 14, '2025/2026', 'المستوى الثاني', 'الفصل الثاني', 'منتظم', 'مسجّل', NULL, NULL, NULL, 'admin', '2026-02-01 08:36:31', NULL, 'bachelor', NULL, NULL, 0),
(35, 12, '2026/2027', 'المستوى الثالث', 'الفصل الأول', 'منتظم', 'مسجّل', NULL, NULL, NULL, 'admin', '2026-02-02 07:49:14', NULL, 'bachelor', NULL, NULL, 0),
(36, 13, '2026/2027', 'المستوى الثالث', 'الفصل الأول', 'منتظم', 'مسجّل', NULL, NULL, NULL, 'admin', '2026-02-02 07:49:14', NULL, 'bachelor', NULL, NULL, 0),
(37, 14, '2026/2027', 'المستوى الثالث', 'الفصل الأول', 'منتظم', 'مسجّل', NULL, NULL, NULL, 'admin', '2026-02-02 07:49:14', NULL, 'bachelor', NULL, NULL, 0),
(48, 1, '2025/2026', 'المستوى الأول', 'الفصل الثاني', 'منتظم', 'مسجّل', NULL, NULL, NULL, 'admin', '2026-02-03 14:25:48', 1, 'bachelor', NULL, NULL, 0),
(49, 3, '2025/2026', 'المستوى الأول', 'الفصل الثاني', 'منتظم', 'مسجّل', NULL, 'إعادة مادة راسبة', '3', 'admin', '2026-02-03 14:25:48', 1, 'bachelor', NULL, NULL, 0),
(50, 4, '2025/2026', 'المستوى الأول', 'الفصل الثاني', 'منتظم', 'مسجّل', NULL, NULL, NULL, 'admin', '2026-02-03 14:25:48', 1, 'bachelor', NULL, NULL, 0),
(51, 7, '2025/2026', 'المستوى الأول', 'الفصل الثاني', 'منتظم', 'مسجّل', NULL, NULL, NULL, 'admin', '2026-02-03 14:25:48', 1, 'bachelor', NULL, NULL, 0),
(52, 8, '2025/2026', 'المستوى الأول', 'الفصل الثاني', 'منتظم', 'مسجّل', NULL, NULL, NULL, 'admin', '2026-02-03 14:25:48', 1, 'bachelor', NULL, NULL, 0),
(53, 1, '2026/2027', 'المستوى الثاني', 'الفصل الأول', 'منتظم', 'مسجّل', NULL, NULL, NULL, 'admin', '2026-02-05 12:22:50', NULL, 'bachelor', NULL, NULL, 0),
(54, 3, '2026/2027', 'المستوى الثاني', 'الفصل الأول', 'منتظم', 'مسجّل', NULL, NULL, NULL, 'admin', '2026-02-05 12:22:50', NULL, 'bachelor', NULL, NULL, 0),
(55, 4, '2026/2027', 'المستوى الثاني', 'الفصل الأول', 'منتظم', 'مسجّل', NULL, NULL, NULL, 'admin', '2026-02-05 12:22:50', NULL, 'bachelor', NULL, NULL, 0),
(56, 7, '2026/2027', 'المستوى الثاني', 'الفصل الأول', 'منتظم', 'مسجّل', NULL, NULL, NULL, 'admin', '2026-02-05 12:22:50', NULL, 'bachelor', NULL, NULL, 0),
(57, 8, '2026/2027', 'المستوى الثاني', 'الفصل الأول', 'منتظم', 'مسجّل', NULL, NULL, NULL, 'admin', '2026-02-05 12:22:50', NULL, 'bachelor', NULL, NULL, 0),
(58, 20, '2025/2026', 'المستوى الأول', 'الفصل الأول', 'منتظم', 'مسجّل', NULL, NULL, NULL, 'admin', '2026-02-05 12:32:20', NULL, 'bachelor', NULL, NULL, 0),
(65, 17, '2025/2026', 'المستوى الخامس', 'الفصل الأول', 'منتظم', 'مسجّل', NULL, NULL, NULL, 'admin', '2026-02-07 11:10:34', NULL, 'bachelor', NULL, NULL, 0),
(66, 17, '2025/2026', 'المستوى الخامس', 'الفصل الثاني', 'منتظم', 'مسجّل', NULL, NULL, NULL, 'admin', '2026-02-07 11:11:04', 1, 'bachelor', NULL, NULL, 0);

-- --------------------------------------------------------

--
-- Table structure for table `term_results`
--

CREATE TABLE IF NOT EXISTS `term_results` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `faculty_id` int(11) NOT NULL,
  `department_id` int(11) NOT NULL,
  `academic_year` varchar(20) NOT NULL,
  `level_name` varchar(60) NOT NULL,
  `term_name` varchar(50) NOT NULL,
  `program_type` enum('diploma','bachelor','postgraduate') NOT NULL DEFAULT 'bachelor',
  `program_mode` enum('honors','general') NOT NULL DEFAULT 'honors',
  `term_gpa` decimal(4,2) DEFAULT NULL,
  `cumulative_gpa` decimal(4,2) DEFAULT NULL,
  `term_total_points` decimal(10,2) DEFAULT NULL,
  `term_total_hours` decimal(10,2) DEFAULT NULL,
  `classification_label` varchar(255) DEFAULT NULL,
  `courses_count` int(11) DEFAULT '0',
  `completed_courses` int(11) DEFAULT '0',
  `missing_courses` int(11) DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  `postgraduate_program` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_term_result` (`student_id`,`faculty_id`,`department_id`,`academic_year`,`level_name`,`term_name`,`program_type`,`postgraduate_program`,`program_mode`),
  KEY `idx_term_results_student` (`student_id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=28 ;

--
-- Dumping data for table `term_results`
--

INSERT INTO `term_results` (`id`, `student_id`, `faculty_id`, `department_id`, `academic_year`, `level_name`, `term_name`, `program_type`, `program_mode`, `term_gpa`, `cumulative_gpa`, `term_total_points`, `term_total_hours`, `classification_label`, `courses_count`, `completed_courses`, `missing_courses`, `created_at`, `updated_at`, `postgraduate_program`) VALUES
(10, 14, 3, 8, '2025/2026', 'المستوى الثاني', 'الفصل الأول', 'bachelor', 'honors', 2.00, 2.00, 12.00, 6.00, 'مرتبة الشرف الثالثة', 2, 2, 0, '2026-01-14 14:43:00', '2026-01-31 09:57:55', NULL),
(11, 13, 3, 8, '2025/2026', 'المستوى الثاني', 'الفصل الأول', 'bachelor', 'honors', 3.75, 3.75, 22.50, 6.00, 'مرتبة الشرف الأولى', 2, 2, 0, '2026-01-14 14:43:00', '2026-01-31 09:57:55', NULL),
(12, 12, 3, 8, '2025/2026', 'المستوى الثاني', 'الفصل الأول', 'bachelor', 'honors', 2.00, 2.00, 12.00, 6.00, 'مرتبة الشرف الثالثة', 2, 2, 0, '2026-01-14 14:43:00', '2026-01-31 09:57:55', NULL),
(13, 9, 2, 5, '2025/2026', 'المستوى الثاني', 'الفصل الأول', 'bachelor', 'honors', 3.00, 3.00, 18.00, 6.00, 'مرتبة الشرف الثانية (القسم الأول)', 2, 2, 0, '2026-01-17 12:05:10', '0000-00-00 00:00:00', NULL),
(14, 10, 2, 5, '2025/2026', 'المستوى الثاني', 'الفصل الأول', 'bachelor', 'honors', 2.50, 2.50, 15.00, 6.00, 'مرتبة الشرف الثانية (القسم الثاني)', 2, 2, 0, '2026-01-17 12:05:10', '0000-00-00 00:00:00', NULL),
(15, 11, 2, 5, '2025/2026', 'المستوى الثاني', 'الفصل الأول', 'bachelor', 'honors', 1.75, 1.75, 10.50, 6.00, NULL, 2, 2, 0, '2026-01-17 12:05:10', '0000-00-00 00:00:00', NULL),
(16, 8, 1, 2, '2025/2026', 'المستوى الأول', 'الفصل الأول', 'bachelor', 'honors', 3.42, 3.21, 44.50, 13.00, 'مرتبة الشرف الثانية (القسم الأول)', 4, 4, 0, '2026-01-18 14:29:54', '2026-02-05 11:24:47', NULL),
(17, 1, 1, 2, '2025/2026', 'المستوى الأول', 'الفصل الأول', 'bachelor', 'honors', 2.38, 2.66, 31.00, 13.00, 'مرتبة الشرف الثالثة', 4, 4, 0, '2026-01-18 14:29:54', '2026-02-05 11:24:47', NULL),
(18, 3, 1, 2, '2025/2026', 'المستوى الأول', 'الفصل الأول', 'bachelor', 'honors', 2.73, 2.56, 35.50, 13.00, 'مرتبة الشرف الثانية (القسم الثاني)', 4, 4, 0, '2026-01-18 14:29:54', '2026-02-05 11:24:47', NULL),
(19, 7, 1, 2, '2025/2026', 'المستوى الأول', 'الفصل الأول', 'bachelor', 'honors', 3.42, 3.37, 44.50, 13.00, 'مرتبة الشرف الثانية (القسم الأول)', 4, 4, 0, '2026-01-18 14:29:54', '2026-02-05 11:24:47', NULL),
(20, 4, 1, 2, '2025/2026', 'المستوى الأول', 'الفصل الأول', 'bachelor', 'honors', 2.62, 2.89, 34.00, 13.00, 'مرتبة الشرف الثانية (القسم الثاني)', 4, 4, 0, '2026-01-18 14:29:54', '2026-02-05 11:24:47', NULL),
(23, 8, 1, 2, '2025/2026', 'المستوى الأول', 'الفصل الثاني', 'bachelor', 'honors', 2.75, 3.21, 16.50, 6.00, 'مرتبة الشرف الثانية (القسم الثاني)', 2, 2, 0, '2026-02-05 08:16:16', '2026-02-05 11:25:45', NULL),
(24, 1, 1, 2, '2025/2026', 'المستوى الأول', 'الفصل الثاني', 'bachelor', 'honors', 3.25, 2.66, 19.50, 6.00, 'مرتبة الشرف الثانية (القسم الأول)', 2, 2, 0, '2026-02-05 08:16:16', '2026-02-05 11:25:45', NULL),
(25, 3, 1, 2, '2025/2026', 'المستوى الأول', 'الفصل الثاني', 'bachelor', 'honors', 3.50, 2.97, 21.00, 6.00, 'مرتبة الشرف الأولى', 2, 2, 0, '2026-02-05 08:16:16', '2026-02-05 11:25:45', NULL),
(26, 7, 1, 2, '2025/2026', 'المستوى الأول', 'الفصل الثاني', 'bachelor', 'honors', 3.25, 3.37, 19.50, 6.00, 'مرتبة الشرف الثانية (القسم الأول)', 2, 2, 0, '2026-02-05 08:16:16', '2026-02-05 11:25:45', NULL),
(27, 4, 1, 2, '2025/2026', 'المستوى الأول', 'الفصل الثاني', 'bachelor', 'honors', 3.50, 2.89, 21.00, 6.00, 'مرتبة الشرف الأولى', 2, 2, 0, '2026-02-05 08:16:16', '2026-02-05 11:25:45', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `timetable_sessions`
--

CREATE TABLE IF NOT EXISTS `timetable_sessions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `faculty_id` int(11) NOT NULL,
  `department_id` int(11) NOT NULL,
  `academic_year` varchar(20) NOT NULL,
  `level_name` varchar(50) NOT NULL,
  `term_name` varchar(50) NOT NULL,
  `program_type` enum('diploma','bachelor','postgraduate') NOT NULL DEFAULT 'bachelor',
  `postgraduate_program` varchar(120) DEFAULT NULL,
  `course_id` int(11) NOT NULL,
  `instructor_staff_id` int(11) DEFAULT NULL,
  `instructor_name` varchar(150) DEFAULT NULL,
  `room_id` int(11) NOT NULL,
  `day_of_week` varchar(20) NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_room_day_time` (`room_id`,`day_of_week`,`start_time`,`end_time`),
  KEY `idx_instructor_day_time` (`instructor_staff_id`,`day_of_week`,`start_time`,`end_time`),
  KEY `idx_scope` (`academic_year`,`term_name`,`program_type`,`postgraduate_program`),
  KEY `idx_ts_room_time` (`academic_year`,`term_name`,`program_type`,`postgraduate_program`,`day_of_week`,`room_id`,`start_time`,`end_time`),
  KEY `idx_ts_instructor_time` (`academic_year`,`term_name`,`program_type`,`postgraduate_program`,`day_of_week`,`instructor_staff_id`,`start_time`,`end_time`),
  KEY `idx_ts_dept_time` (`faculty_id`,`department_id`,`academic_year`,`level_name`,`term_name`,`program_type`,`postgraduate_program`,`day_of_week`,`start_time`,`end_time`),
  KEY `idx_instructor_time` (`instructor_staff_id`,`academic_year`,`term_name`,`program_type`,`day_of_week`,`start_time`,`end_time`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=22 ;

--
-- Dumping data for table `timetable_sessions`
--

INSERT INTO `timetable_sessions` (`id`, `faculty_id`, `department_id`, `academic_year`, `level_name`, `term_name`, `program_type`, `postgraduate_program`, `course_id`, `instructor_staff_id`, `instructor_name`, `room_id`, `day_of_week`, `start_time`, `end_time`, `created_at`) VALUES
(1, 3, 8, '2025/2026', 'المستوى الثاني', 'الفصل الأول', 'bachelor', NULL, 10, NULL, 'أ. ريم عمر', 2, 'الأحد', '08:00:00', '10:00:00', '2025-12-30 12:50:43'),
(5, 2, 5, '2025/2026', 'المستوى الثاني', 'الفصل الأول', 'bachelor', NULL, 8, NULL, 'م. أحمد الطيب', 3, 'الأحد', '10:00:00', '12:00:00', '2025-12-31 09:04:46'),
(11, 3, 9, '2025/2026', 'المستوى الثاني', 'الفصل الأول', 'bachelor', NULL, 11, NULL, 'أ. ريم عمر', 1, 'السبت', '08:00:00', '10:00:00', '2025-12-31 12:24:48'),
(12, 1, 3, '2026/2027', 'المسوى الأول', 'الفصل الأول', 'postgraduate', 'ماجستير البرمجيات المدمجة', 12, NULL, 'د. علي الطيب', 1, 'السبت', '08:00:00', '10:00:00', '2025-12-31 13:52:56'),
(13, 3, 8, '2025/2026', 'المستوى الثاني', 'الفصل الأول', 'bachelor', NULL, 9, NULL, 'د. نادر حسن', 3, 'السبت', '08:00:00', '10:00:00', '2026-01-12 08:44:34'),
(16, 1, 1, '2025/2026', 'المستوى الأول', 'الفصل الأول', 'bachelor', NULL, 6, NULL, 'د. علي الطيب', 2, 'السبت', '08:00:00', '10:00:00', '2026-01-13 06:35:14'),
(17, 3, 8, '2025/2026', 'المستوى الثاني', 'الفصل الأول', 'bachelor', NULL, 10, NULL, 'أ. ريم عمر', 1, 'السبت', '12:00:00', '14:00:00', '2026-01-13 08:24:23'),
(19, 1, 3, '2026/2027', 'المستوى الأول', 'الفصل الأول', 'postgraduate', 'ماجستير البرمجيات المدمجة', 12, NULL, 'د. علي الطيب', 1, 'الأحد', '08:00:00', '10:00:00', '2026-01-17 14:27:31'),
(21, 1, 2, '2025/2026', 'المستوى الأول', 'الفصل الثاني', 'bachelor', NULL, 15, NULL, 'د. علي الطيب', 2, 'السبت', '10:00:00', '12:00:00', '2026-02-05 12:46:29');

--
-- Triggers `timetable_sessions`
--
DROP TRIGGER IF EXISTS `trg_timetable_no_conflicts`;
DELIMITER //
CREATE TRIGGER `trg_timetable_no_conflicts` BEFORE INSERT ON `timetable_sessions`
 FOR EACH ROW BEGIN
  /* 1) Instructor conflict (GLOBAL by NAME) – خليتها كما هي، عشان مقيدة بالسنة والفصل */
  IF NEW.instructor_name IS NOT NULL
     AND EXISTS (
       SELECT 1
       FROM timetable_sessions
       WHERE instructor_name = NEW.instructor_name
         AND academic_year = NEW.academic_year
         AND term_name = NEW.term_name
         AND day_of_week = NEW.day_of_week
         AND NOT (
           end_time <= NEW.start_time
           OR start_time >= NEW.end_time
         )
     )
  THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'تضارب: الأستاذ لديه محاضرتان في نفس الزمن';
  END IF;

  /* 2) Room conflict – عدلتها: ازلت academic_year و term_name، عشان تكون عامة للكل (جميع الفصول والسنوات) */
  IF EXISTS (
    SELECT 1
    FROM timetable_sessions
    WHERE room_id = NEW.room_id
      AND day_of_week = NEW.day_of_week
      AND NOT (
        end_time <= NEW.start_time
        OR start_time >= NEW.end_time
      )
  )
  THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'تضارب: القاعة مشغولة في نفس الزمن ';
  END IF;

  /* 3) Department + Level conflict – خليتها كما هي، عشان مقيدة بالمستوى والقسم */
  IF EXISTS (
    SELECT 1
    FROM timetable_sessions
    WHERE faculty_id = NEW.faculty_id
      AND department_id = NEW.department_id
      AND level_name = NEW.level_name
      AND academic_year = NEW.academic_year
      AND term_name = NEW.term_name
      AND day_of_week = NEW.day_of_week
      AND NOT (
        end_time <= NEW.start_time
        OR start_time >= NEW.end_time
      )
  )
  THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'تضارب: نفس القسم والمستوى في نفس الزمن';
  END IF;

END
//
DELIMITER ;
DROP TRIGGER IF EXISTS `trg_timetable_no_conflicts_update`;
DELIMITER //
CREATE TRIGGER `trg_timetable_no_conflicts_update` BEFORE UPDATE ON `timetable_sessions`
 FOR EACH ROW BEGIN
  /* Instructor conflict (by NAME) – كما هي */
  IF NEW.instructor_name IS NOT NULL
     AND EXISTS (
       SELECT 1
       FROM timetable_sessions
       WHERE instructor_name = NEW.instructor_name
         AND academic_year = NEW.academic_year
         AND term_name = NEW.term_name
         AND day_of_week = NEW.day_of_week
         AND id <> OLD.id
         AND NOT (
           end_time <= NEW.start_time
           OR start_time >= NEW.end_time
         )
     )
  THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'تضارب: الأستاذ لديه محاضرتان في نفس الزمن';
  END IF;

  /* Room conflict – عدلتها: ازلت academic_year و term_name، عشان عامة */
  IF EXISTS (
    SELECT 1
    FROM timetable_sessions
    WHERE room_id = NEW.room_id
      AND day_of_week = NEW.day_of_week
      AND id <> OLD.id
      AND NOT (
        end_time <= NEW.start_time
        OR start_time >= NEW.end_time
      )
  )
  THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'تضارب: القاعة مشغولة في نفس الزمن ';
  END IF;

END
//
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE IF NOT EXISTS `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `full_name` varchar(150) DEFAULT NULL,
  `email` varchar(150) DEFAULT NULL,
  `role` varchar(50) DEFAULT 'user',
  `is_active` tinyint(1) DEFAULT '1',
  `allowed_pages` text,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  `last_login` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=6 ;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `password_hash`, `full_name`, `email`, `role`, `is_active`, `allowed_pages`, `created_at`, `updated_at`, `last_login`) VALUES
(1, 'admin', '$2b$10$2tEceOVDdetHyqCKPMLmE.T4TCsEWKyuT/WKXUevGMTrddaLBditK', 'mohamd Ahmed', 'ali@gmail.com', 'admin', 1, '["المكتبة","القبول والتسجيل","إعدادات النظام الأكاديمي","إدخال الدرجات","حساب النتائج","قوائم الطلاب","أعضاء هيئة التدريس","الجداول الدراسية","الشهادات","المستخدمين والصلاحيات"]', '2026-01-15 09:05:21', '0000-00-00 00:00:00', NULL),
(3, 'ahdi', '$2b$10$yX4rDI01wHzOyviHBF13MeQssEMxZcLtkIM/pr/CSPg4CXwvKL9gO', NULL, NULL, 'registrar', 1, '["القبول والتسجيل"]', '2026-01-15 10:53:16', '0000-00-00 00:00:00', NULL),
(4, 'ahmed', '$2b$10$jkTtj5fJ0tTHPnCBAJeSCu8V4fsczSPPxVGiO6kx79650aWS6gfLG', NULL, NULL, 'instructor', 1, '["إعدادات النظام الأكاديمي","إدخال الدرجات","حساب النتائج","قوائم الطلاب"]', '2026-01-15 10:53:52', '0000-00-00 00:00:00', NULL),
(5, 'منعم', '$2b$10$CY7u8awvnU30oYFzPPAHse/HxYXEEodE3N8swvztD7MIh73vN0mo.', NULL, NULL, 'user', 1, '["القبول والتسجيل","المكتبة"]', '2026-02-05 13:25:11', '0000-00-00 00:00:00', NULL);

--
-- Constraints for dumped tables
--

--
-- Constraints for table `books`
--
ALTER TABLE `books`
  ADD CONSTRAINT `fk_books_faculty` FOREIGN KEY (`faculty_id`) REFERENCES `faculties` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `borrowed_books`
--
ALTER TABLE `borrowed_books`
  ADD CONSTRAINT `borrowed_books_ibfk_1` FOREIGN KEY (`book_id`) REFERENCES `books` (`id`);

--
-- Constraints for table `courses`
--
ALTER TABLE `courses`
  ADD CONSTRAINT `fk_courses_department` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_courses_faculty` FOREIGN KEY (`faculty_id`) REFERENCES `faculties` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `course_grades`
--
ALTER TABLE `course_grades`
  ADD CONSTRAINT `fk_course_grades_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_course_grades_course` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `departments`
--
ALTER TABLE `departments`
  ADD CONSTRAINT `departments_ibfk_1` FOREIGN KEY (`faculty_id`) REFERENCES `faculties` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `students`
--
ALTER TABLE `students`
  ADD CONSTRAINT `fk_students_department` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`);

--
-- Constraints for table `student_registrations`
--
ALTER TABLE `student_registrations`
  ADD CONSTRAINT `fk_reg_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`);

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
