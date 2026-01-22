-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jan 21, 2026 at 03:09 PM
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
-- Database: `ekanban_toolroom_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `tbl_troqueles`
--

CREATE TABLE `tbl_troqueles` (
  `id_troquel` varchar(10) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `status` enum('En prensa','Listo-BackUp','Listo','Reparando','Pendiente') DEFAULT 'Pendiente',
  `año` int(11) NOT NULL,
  `modelo` varchar(100) DEFAULT NULL,
  `golpes` varchar(50) DEFAULT '-',
  `golpes_acum` varchar(50) DEFAULT '-',
  `capacidad_golpes` varchar(50) DEFAULT '-',
  `rectificaciones` varchar(100) DEFAULT '0',
  `url_imagen` varchar(255) DEFAULT NULL,
  `num_pieza_1` varchar(50) DEFAULT NULL,
  `num_pieza_2` varchar(50) DEFAULT NULL,
  `num_pieza_3` varchar(50) DEFAULT NULL,
  `num_pieza_4` varchar(50) DEFAULT NULL,
  `creado_el` timestamp NOT NULL DEFAULT current_timestamp(),
  `actualizado_el` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbl_troqueles`
--

INSERT INTO `tbl_troqueles` (`id_troquel`, `nombre`, `status`, `año`, `modelo`, `golpes`, `golpes_acum`, `capacidad_golpes`, `rectificaciones`, `url_imagen`, `num_pieza_1`, `num_pieza_2`, `num_pieza_3`, `num_pieza_4`, `creado_el`, `actualizado_el`) VALUES
('T951', 'Alpha', 'En prensa', 2025, 'G3-VSS - G3-VSS', '257,540', '121,442,752', '250,000,000', '15 - (28/10/2025)', 'C:xampphtdocsekanban-toolroomsrcassets	roquel.png', NULL, NULL, NULL, NULL, '2026-01-12 14:55:11', '2026-01-12 14:55:11'),
('T952', 'Beta', 'Listo-BackUp', 2025, 'H2-XLS - H2-XLS', '180,200', '95,000,000', '200,000,000', '12 - (15/09/2025)', 'C:xampphtdocsekanban-toolroomsrcassets	roquel.png', NULL, NULL, NULL, NULL, '2026-01-12 14:55:11', '2026-01-12 14:55:11'),
('T953', 'Gamma', 'Reparando', 2025, 'K1-PRO - K1-PRO', '320,100', '200,000,000', '300,000,000', '20 - (01/11/2025)', 'C:xampphtdocsekanban-toolroomsrcassets	roquel.png', NULL, NULL, NULL, NULL, '2026-01-12 14:55:11', '2026-01-12 14:55:11'),
('T954', 'Delta', 'Pendiente', 2025, 'M4-STD - M4-STD', '95,000', '50,000,000', '150,000,000', '8 - (20/08/2025)', 'C:xampphtdocsekanban-toolroomsrcassets	roquel.png', NULL, NULL, NULL, NULL, '2026-01-12 14:55:11', '2026-01-12 14:55:11'),
('T955', 'Echo', 'Listo', 2025, 'P2-MAX - P2-MAX', '410,000', '180,000,000', '400,000,000', '25 - (05/10/2025)', 'C:xampphtdocsekanban-toolroomsrcassets	roquel.png', NULL, NULL, NULL, NULL, '2026-01-12 14:55:11', '2026-01-12 14:55:11'),
('T956', 'Zeta', 'Pendiente', 2026, 'R1-NEW', '-', '-', '250,000,000', '0', 'C:xampphtdocsekanban-toolroomsrcassets	roquel.png', NULL, NULL, NULL, NULL, '2026-01-12 14:55:11', '2026-01-12 14:55:11'),
('T957', 'Eta', 'Pendiente', 2026, 'S3-ADV', '-', '-', '300,000,000', '0', 'C:xampphtdocsekanban-toolroomsrcassets	roquel.png', NULL, NULL, NULL, NULL, '2026-01-12 14:55:11', '2026-01-12 14:55:11'),
('T958', 'Theta', 'Pendiente', 2026, 'T2-PRO', '-', '-', '200,000,000', '0', 'C:xampphtdocsekanban-toolroomsrcassets	roquel.png', NULL, NULL, NULL, NULL, '2026-01-12 14:55:11', '2026-01-12 14:55:11'),
('T959', 'Iota', 'Pendiente', 2027, 'U1-TIT', '-', '-', '350,000,000', '0', 'C:xampphtdocsekanban-toolroomsrcassets	roquel.png', NULL, NULL, NULL, NULL, '2026-01-12 14:55:11', '2026-01-12 14:55:11'),
('T960', 'Kappa', 'Pendiente', 2027, 'V2-AUT', '-', '-', '400,000,000', '0', 'C:xampphtdocsekanban-toolroomsrcassets	roquel.png', NULL, NULL, NULL, NULL, '2026-01-12 14:55:11', '2026-01-12 14:55:11'),
('T961', 'Lambda', 'Pendiente', 2027, 'W1-STL', '-', '-', '280,000,000', '0', 'C:xampphtdocsekanban-toolroomsrcassets	roquel.png', NULL, NULL, NULL, NULL, '2026-01-12 14:55:11', '2026-01-12 14:55:11'),
('T962', 'Mu', 'Pendiente', 2027, 'X3-ALU', '-', '-', '220,000,000', '0', 'C:xampphtdocsekanban-toolroomsrcassets	roquel.png', NULL, NULL, NULL, NULL, '2026-01-12 14:55:11', '2026-01-12 14:55:11'),
('T963', 'Nu', 'Pendiente', 2027, 'Y1-ROB', '-', '-', '500,000,000', '0', 'C:xampphtdocsekanban-toolroomsrcassets	roquel.png', NULL, NULL, NULL, NULL, '2026-01-12 14:55:11', '2026-01-12 14:55:11'),
('T964', 'Xi', 'Pendiente', 2027, 'Z2-ZNC', '-', '-', '180,000,000', '0', 'C:xampphtdocsekanban-toolroomsrcassets	roquel.png', NULL, NULL, NULL, NULL, '2026-01-12 14:55:11', '2026-01-12 14:55:11'),
('T965', 'Omicron', 'Pendiente', 2028, 'A1-BRS', '-', '-', '150,000,000', '0', 'C:xampphtdocsekanban-toolroomsrcassets	roquel.png', NULL, NULL, NULL, NULL, '2026-01-12 14:55:11', '2026-01-12 14:55:11'),
('T966', 'Pi', 'Pendiente', 2028, 'B2-ASM', '-', '-', '600,000,000', '0', 'C:xampphtdocsekanban-toolroomsrcassets	roquel.png', NULL, NULL, NULL, NULL, '2026-01-12 14:55:11', '2026-01-12 14:55:11'),
('T967', 'Rho', 'Pendiente', 2029, 'C1-AER', '-', '-', '320,000,000', '0', 'C:xampphtdocsekanban-toolroomsrcassets	roquel.png', NULL, NULL, NULL, NULL, '2026-01-12 14:55:11', '2026-01-12 14:55:11');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `tbl_troqueles`
--
ALTER TABLE `tbl_troqueles`
  ADD PRIMARY KEY (`id_troquel`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
