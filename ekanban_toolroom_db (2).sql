-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Feb 18, 2026 at 07:33 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

create Database ekanban_toolroom_db;

use ekanban_toolroom_db;


DELIMITER $$
--
-- Procedures
--
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_actualizar_proceso_reparacion` (IN `p_ciclo_id` INT, IN `p_paso` VARCHAR(50))   BEGIN 
    CASE p_paso 
        WHEN 'recepcion' THEN 
            UPDATE tbl_ciclos_reparacion  
            SET fecha_recepcion_taller = NOW()  
            WHERE id = p_ciclo_id; 
        WHEN 'inicio' THEN 
            UPDATE tbl_ciclos_reparacion  
            SET fecha_inicio_trabajo = NOW()  
            WHERE id = p_ciclo_id; 
        WHEN 'termino' THEN 
            UPDATE tbl_ciclos_reparacion  
            SET fecha_termino_trabajo = NOW()  
            WHERE id = p_ciclo_id; 
    END CASE; 
    SELECT ROW_COUNT() AS rows_affected; 
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_cerrar_ciclo_reparacion` (IN `p_ciclo_id` INT, IN `p_status_salida` VARCHAR(50), IN `p_empleado_cierre` VARCHAR(100), IN `p_comentarios` TEXT, IN `p_folio` VARCHAR(50))   BEGIN 
    UPDATE tbl_ciclos_reparacion 
    SET  
        fecha_fin_reparacion = NOW(), 
        status_salida = p_status_salida, 
        empleado_cierre = p_empleado_cierre, 
        comentarios_salida = p_comentarios, 
        folio_salida = p_folio, 
        fecha_termino_trabajo = NOW(), 
        ciclo_activo = FALSE 
    WHERE id = p_ciclo_id AND ciclo_activo = TRUE; 
    -- Also close all technician assignments 
    UPDATE tbl_tecnicos_ciclo 
    SET fecha_fin = NOW() 
    WHERE ciclo_id = p_ciclo_id AND fecha_fin IS NULL; 
    SELECT ROW_COUNT() AS rows_affected; 
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_iniciar_ciclo_reparacion` (IN `p_troquel_id` VARCHAR(20), IN `p_troquel_nombre` VARCHAR(100), IN `p_modelo` VARCHAR(100), IN `p_motivo_entrada` VARCHAR(50), IN `p_falla_id` INT, IN `p_falla_descripcion` VARCHAR(255), IN `p_folio` VARCHAR(50), IN `p_empleado` VARCHAR(100), IN `p_comentarios` TEXT, IN `p_status_anterior` VARCHAR(50), IN `p_prensa_origen` VARCHAR(50), IN `p_nivel` TINYINT, IN `p_grupo` TINYINT)   BEGIN 
    INSERT INTO tbl_ciclos_reparacion ( 
        troquel_id, 
        troquel_nombre, 
        modelo, 
        fecha_inicio_reparacion, 
        motivo_entrada, 
        falla_id, 
        falla_descripcion, 
        folio_entrada, 
        empleado_registro, 
        comentarios_entrada, 
        status_anterior, 
        prensa_origen, 
        nivel_reparacion, 
        grupo_reparacion, 
        fecha_bajado, 
        ciclo_activo 
    ) VALUES ( 
        p_troquel_id, 
        p_troquel_nombre, 
        p_modelo, 
        NOW(), 
        p_motivo_entrada, 
        p_falla_id, 
        p_falla_descripcion, 
        p_folio, 
        p_empleado, 
        p_comentarios, 
        p_status_anterior, 
        p_prensa_origen, 
        p_nivel, 
        p_grupo, 
        NOW(), 
        TRUE 
    ); 
    SELECT LAST_INSERT_ID() AS ciclo_id; 
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_obtener_ciclo_activo` (IN `p_troquel_id` VARCHAR(20))   BEGIN 
    SELECT  
        cr.*, 
        TIMESTAMPDIFF(HOUR, cr.fecha_inicio_reparacion, NOW()) AS horas_transcurridas 
    FROM tbl_ciclos_reparacion cr 
    WHERE cr.troquel_id = p_troquel_id  
        AND cr.ciclo_activo = TRUE 
    ORDER BY cr.fecha_inicio_reparacion DESC 
    LIMIT 1; 
END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_asistencia_prensa`
--

CREATE TABLE `tbl_asistencia_prensa` (
  `id_asistencia_prensa` int(11) NOT NULL,
  `descripcion` varchar(255) NOT NULL,
  `activo` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbl_asistencia_prensa`
--

INSERT INTO `tbl_asistencia_prensa` (`id_asistencia_prensa`, `descripcion`, `activo`) VALUES
(1, 'AJUSTE SENSOR MISFEED', 1),
(2, 'BANDA REVENTADA', 1),
(3, 'CAMBIO DE MODELO', 1),
(4, 'CANDADO ESTATOR QUEBRADO', 1),
(5, 'CILINDRO CONTERBORE NO ACCIONA', 1),
(6, 'CILINDRO SEPARADOR NO ACCIONA', 1),
(7, 'DEPOSTILLADURA EN CUCHILLA ESTATOR', 1),
(8, 'DIA EXT DE ROTOR F/E', 1),
(9, 'DIAMETRO INTERIOR ESTATOR ABIERTO', 1),
(10, 'DIAMETRO INTERIOR ESTATOR CERRADO', 1),
(11, 'DIAMETRO INTERIOR ROTOR ABIERTO', 1),
(12, 'DIAMETRO INTERIOR ROTOR CERRADO', 1),
(13, 'ELEVADOR DEFORMA LAMINA', 1),
(14, 'FALLA SENSOR DOBLE ESPESOR', 1),
(15, 'GAPS', 1),
(16, 'GRAPADO FRAGIL', 1),
(17, 'GUIA QUEBRADA', 1),
(18, 'LAMINA SE ATORA EN TROQUEL', 1),
(19, 'MATRIZ FORMADO TAPADA', 1),
(20, 'MATRIZ ROTACIONAL AMARRADA', 1),
(21, 'MATRIZ TAPADA', 1),
(22, 'MTTO EN CONECTORES', 1),
(23, 'NO RETIENE LA REBABA', 1),
(24, 'PILOTO INICIO ATORADO', 1),
(25, 'PILOTO JALA LA TIRA', 1),
(26, 'PILOTO SACA LA LAMINA', 1),
(27, 'PISTON AMARRADO', 1),
(28, 'PLANICIDAD', 1),
(29, 'POLEA ROTACIONAL CAIDA', 1),
(30, 'PROGRESION AJUSTADA', 1),
(31, 'REBABA DIAMETRO EXTERIOR ESTATOR', 1),
(32, 'REBABA DIAMETRO EXTERIOR ROTOR', 1),
(33, 'REBABA DIAMETRO INTERIOR ESTATOR', 1),
(34, 'REBABA DIAMETRO INTERIOR ROTOR', 1),
(35, 'REBABA DIAMETRO PILOTO', 1),
(36, 'REBABA DIAMETRO TORNILLO', 1),
(37, 'REBABA EN ESTATOR Y ROTOR', 1),
(38, 'REBABA EN VENTANA', 1),
(39, 'REBABA SLOT ESTATOR', 1),
(40, 'REBABA SLOT ROTOR', 1),
(41, 'REVISION SERVO-MOTOR', 1),
(42, 'SKEW GIRADO', 1);

-- --------------------------------------------------------

--
-- Table structure for table `tbl_ciclos_reparacion`
--

CREATE TABLE `tbl_ciclos_reparacion` (
  `id_ciclo_reparacion` int(11) NOT NULL,
  `troquel_id` varchar(20) NOT NULL,
  `troquel_nombre` varchar(100) DEFAULT NULL,
  `modelo` varchar(100) DEFAULT NULL,
  `fecha_inicio_reparacion` datetime NOT NULL,
  `motivo_entrada` enum('Falla de Troquel','Limpieza General','Cambio de Modelo','Mantenimiento Preventivo','Otro') NOT NULL,
  `falla_id` int(11) DEFAULT NULL,
  `falla_descripcion` varchar(255) DEFAULT NULL,
  `folio_entrada` varchar(50) DEFAULT NULL,
  `empleado_registro` varchar(100) DEFAULT NULL,
  `comentarios_entrada` text DEFAULT NULL,
  `status_anterior` varchar(50) DEFAULT 'En prensa',
  `fecha_fin_reparacion` datetime DEFAULT NULL,
  `status_salida` varchar(50) DEFAULT NULL,
  `empleado_cierre` varchar(100) DEFAULT NULL,
  `comentarios_salida` text DEFAULT NULL,
  `folio_salida` varchar(50) DEFAULT NULL,
  `tiempo_reparacion_minutos` int(11) GENERATED ALWAYS AS (case when `fecha_fin_reparacion` is not null then timestampdiff(MINUTE,`fecha_inicio_reparacion`,`fecha_fin_reparacion`) else NULL end) STORED,
  `tiempo_reparacion_horas` decimal(10,2) GENERATED ALWAYS AS (case when `fecha_fin_reparacion` is not null then timestampdiff(MINUTE,`fecha_inicio_reparacion`,`fecha_fin_reparacion`) / 60.0 else NULL end) STORED,
  `prensa_origen` varchar(50) DEFAULT NULL,
  `nivel_reparacion` tinyint(4) DEFAULT NULL,
  `grupo_reparacion` tinyint(4) DEFAULT NULL,
  `prioridad` tinyint(4) DEFAULT 3,
  `fecha_bajado` datetime DEFAULT NULL,
  `fecha_recepcion_taller` datetime DEFAULT NULL,
  `fecha_inicio_trabajo` datetime DEFAULT NULL,
  `fecha_termino_trabajo` datetime DEFAULT NULL,
  `ciclo_activo` tinyint(1) DEFAULT 1,
  `creado_el` timestamp NOT NULL DEFAULT current_timestamp(),
  `actualizado_el` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `tbl_ciclos_reparacion`
--

INSERT INTO `tbl_ciclos_reparacion` (`id_ciclo_reparacion`, `troquel_id`, `troquel_nombre`, `modelo`, `fecha_inicio_reparacion`, `motivo_entrada`, `falla_id`, `falla_descripcion`, `folio_entrada`, `empleado_registro`, `comentarios_entrada`, `status_anterior`, `fecha_fin_reparacion`, `status_salida`, `empleado_cierre`, `comentarios_salida`, `folio_salida`, `prensa_origen`, `nivel_reparacion`, `grupo_reparacion`, `prioridad`, `fecha_bajado`, `fecha_recepcion_taller`, `fecha_inicio_trabajo`, `fecha_termino_trabajo`, `ciclo_activo`, `creado_el`, `actualizado_el`) VALUES
(1, 'T718', 'Alpha', 'F180 - 645101-31-F180', '2025-01-20 08:30:00', 'Falla de Troquel', NULL, 'Desgaste en punzón central', 'F-2025-001', 'Juan Pérez', NULL, 'En prensa', '2025-01-22 15:00:00', 'Listo', 'María García', NULL, NULL, 'Prensa 01', 2, 1, 1, '2025-01-20 08:30:00', '2025-01-20 09:15:00', '2025-01-20 10:00:00', '2025-01-22 14:30:00', 0, '2026-01-28 17:37:51', '2026-01-28 17:37:51'),
(2, 'T951', 'Beta', 'G3-VSS', '2025-01-25 14:00:00', 'Limpieza General', NULL, NULL, 'F-2025-002', 'Carlos López', NULL, 'En prensa', '2025-01-25 17:30:00', 'Listo-BackUp', 'Carlos López', NULL, NULL, 'Prensa 03', 1, 2, 3, '2025-01-25 14:00:00', '2025-01-25 14:30:00', '2025-01-25 15:00:00', '2025-01-25 17:00:00', 0, '2026-01-28 17:37:51', '2026-01-28 17:37:51'),
(3, 'T623', 'Gamma', 'H2-PRO', '2025-01-27 07:00:00', 'Cambio de Modelo', NULL, NULL, 'F-2025-003', 'Ana Martínez', NULL, 'En prensa', NULL, NULL, NULL, NULL, NULL, 'Prensa 02', 1, 1, 2, '2025-01-27 07:00:00', '2025-01-27 08:00:00', '2025-01-27 09:30:00', NULL, 1, '2026-01-28 17:37:51', '2026-01-28 17:37:51'),
(4, 'T718', 'Alpha', 'F180 - 645101-31-F180', '2025-01-20 08:30:00', 'Falla de Troquel', NULL, 'Desgaste en punzón central', 'F-2025-001', 'Juan Pérez', NULL, 'En prensa', '2025-01-22 15:00:00', 'Listo', 'María García', NULL, NULL, 'Prensa 01', 2, 1, 1, '2025-01-20 08:30:00', '2025-01-20 09:15:00', '2025-01-20 10:00:00', '2025-01-22 14:30:00', 0, '2026-01-28 17:38:28', '2026-01-28 17:38:28'),
(5, 'T951', 'Beta', 'G3-VSS', '2025-01-25 14:00:00', 'Limpieza General', NULL, NULL, 'F-2025-002', 'Carlos López', NULL, 'En prensa', '2025-01-25 17:30:00', 'Listo-BackUp', 'Carlos López', NULL, NULL, 'Prensa 03', 1, 2, 3, '2025-01-25 14:00:00', '2025-01-25 14:30:00', '2025-01-25 15:00:00', '2025-01-25 17:00:00', 0, '2026-01-28 17:38:28', '2026-01-28 17:38:28'),
(6, 'T623', 'Gamma', 'H2-PRO', '2025-01-27 07:00:00', 'Cambio de Modelo', NULL, NULL, 'F-2025-003', 'Ana Martínez', NULL, 'En prensa', NULL, NULL, NULL, NULL, NULL, 'Prensa 02', 1, 1, 2, '2025-01-27 07:00:00', '2025-01-27 08:00:00', '2025-01-27 09:30:00', NULL, 1, '2026-01-28 17:38:28', '2026-01-28 17:38:28'),
(7, 'T718', 'Alpha', 'F180 - 645101-31-F180', '2025-01-20 08:30:00', 'Falla de Troquel', NULL, 'Desgaste en punzón central', 'F-2025-001', 'Juan Pérez', NULL, 'En prensa', '2025-01-22 15:00:00', 'Listo', 'María García', NULL, NULL, 'Prensa 01', 2, 1, 1, '2025-01-20 08:30:00', '2025-01-20 09:15:00', '2025-01-20 10:00:00', '2025-01-22 14:30:00', 0, '2026-01-28 17:38:37', '2026-01-28 17:38:37'),
(8, 'T951', 'Beta', 'G3-VSS', '2025-01-25 14:00:00', 'Limpieza General', NULL, NULL, 'F-2025-002', 'Carlos López', NULL, 'En prensa', '2025-01-25 17:30:00', 'Listo-BackUp', 'Carlos López', NULL, NULL, 'Prensa 03', 1, 2, 3, '2025-01-25 14:00:00', '2025-01-25 14:30:00', '2025-01-25 15:00:00', '2025-01-25 17:00:00', 0, '2026-01-28 17:38:37', '2026-01-28 17:38:37'),
(9, 'T623', 'Gamma', 'H2-PRO', '2025-01-27 07:00:00', 'Cambio de Modelo', NULL, NULL, 'F-2025-003', 'Ana Martínez', NULL, 'En prensa', NULL, NULL, NULL, NULL, NULL, 'Prensa 02', 1, 1, 2, '2025-01-27 07:00:00', '2025-01-27 08:00:00', '2025-01-27 09:30:00', NULL, 1, '2026-01-28 17:38:37', '2026-01-28 17:38:37'),
(10, 'T718', 'Alpha', 'F180 - 645101-31-F180', '2025-01-20 08:30:00', 'Falla de Troquel', NULL, 'Desgaste en punzón central', 'F-2025-001', 'Juan Pérez', NULL, 'En prensa', '2025-01-22 15:00:00', 'Listo', 'María García', NULL, NULL, 'Prensa 01', 2, 1, 1, '2025-01-20 08:30:00', '2025-01-20 09:15:00', '2025-01-20 10:00:00', '2025-01-22 14:30:00', 0, '2026-01-28 17:39:07', '2026-01-28 17:39:07'),
(11, 'T951', 'Beta', 'G3-VSS', '2025-01-25 14:00:00', 'Limpieza General', NULL, NULL, 'F-2025-002', 'Carlos López', NULL, 'En prensa', '2025-01-25 17:30:00', 'Listo-BackUp', 'Carlos López', NULL, NULL, 'Prensa 03', 1, 2, 3, '2025-01-25 14:00:00', '2025-01-25 14:30:00', '2025-01-25 15:00:00', '2025-01-25 17:00:00', 0, '2026-01-28 17:39:07', '2026-01-28 17:39:07'),
(12, 'T623', 'Gamma', 'H2-PRO', '2025-01-27 07:00:00', 'Cambio de Modelo', NULL, NULL, 'F-2025-003', 'Ana Martínez', NULL, 'En prensa', NULL, NULL, NULL, NULL, NULL, 'Prensa 02', 1, 1, 2, '2025-01-27 07:00:00', '2025-01-27 08:00:00', '2025-01-27 09:30:00', NULL, 1, '2026-01-28 17:39:07', '2026-01-28 17:39:07'),
(13, 'T718', 'Alpha', 'F180 - 645101-31-F180', '2025-01-20 08:30:00', 'Falla de Troquel', NULL, 'Desgaste en punzón central', 'F-2025-001', 'Juan Pérez', NULL, 'En prensa', '2025-01-22 15:00:00', 'Listo', 'María García', NULL, NULL, 'Prensa 01', 2, 1, 1, '2025-01-20 08:30:00', '2025-01-20 09:15:00', '2025-01-20 10:00:00', '2025-01-22 14:30:00', 0, '2026-01-28 17:39:24', '2026-01-28 17:39:24'),
(14, 'T951', 'Beta', 'G3-VSS', '2025-01-25 14:00:00', 'Limpieza General', NULL, NULL, 'F-2025-002', 'Carlos López', NULL, 'En prensa', '2025-01-25 17:30:00', 'Listo-BackUp', 'Carlos López', NULL, NULL, 'Prensa 03', 1, 2, 3, '2025-01-25 14:00:00', '2025-01-25 14:30:00', '2025-01-25 15:00:00', '2025-01-25 17:00:00', 0, '2026-01-28 17:39:24', '2026-01-28 17:39:24'),
(15, 'T623', 'Gamma', 'H2-PRO', '2025-01-27 07:00:00', 'Cambio de Modelo', NULL, NULL, 'F-2025-003', 'Ana Martínez', NULL, 'En prensa', NULL, NULL, NULL, NULL, NULL, 'Prensa 02', 1, 1, 2, '2025-01-27 07:00:00', '2025-01-27 08:00:00', '2025-01-27 09:30:00', NULL, 1, '2026-01-28 17:39:24', '2026-01-28 17:39:24');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_estados`
--

CREATE TABLE `tbl_estados` (
  `id_estado` int(11) NOT NULL,
  `codigo` varchar(20) NOT NULL,
  `nombre` varchar(50) NOT NULL,
  `color` varchar(10) DEFAULT NULL,
  `descripcion` text DEFAULT NULL,
  `orden` int(11) DEFAULT 0,
  `activo` tinyint(1) DEFAULT 1,
  `creado_en` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbl_estados`
--

INSERT INTO `tbl_estados` (`id_estado`, `codigo`, `nombre`, `color`, `descripcion`, `orden`, `activo`, `creado_en`) VALUES
(1, 'Pendiente', 'Pendiente', '#ff6b6b', 'Troquel pendiente de revisión o asignación', 1, 1, '2026-01-23 14:52:12'),
(2, 'En prensa', 'En Prensa', '#00ff88', 'Troquel actualmente en producción', 2, 1, '2026-01-23 14:52:12'),
(3, 'Listo', 'Listo', '#64ff64', 'Troquel listo para uso', 3, 1, '2026-01-23 14:52:12'),
(4, 'Listo-BackUp', 'Listo - BackUp', '#00c8ff', 'Troquel listo como respaldo', 4, 1, '2026-01-23 14:52:12'),
(5, 'Reparando', 'Reparando', '#ffc800', 'Troquel en proceso de reparación', 5, 1, '2026-01-23 14:52:12'),
(6, 'Baja', 'Baja / Obsoleto', '#888888', 'Troquel dado de baja o obsoleto', 6, 1, '2026-01-23 14:52:12');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_fallas_catalogo`
--

CREATE TABLE `tbl_fallas_catalogo` (
  `id_fallas_catalogo` int(11) NOT NULL,
  `descripcion` varchar(255) NOT NULL,
  `activo` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbl_fallas_catalogo`
--

INSERT INTO `tbl_fallas_catalogo` (`id_fallas_catalogo`, `descripcion`, `activo`) VALUES
(1, 'AJUSTAR MATRIZ SLOTOS ROTOS', 1),
(2, 'AJUSTE DE LAINA', 1),
(3, 'AJUSTE MATRIZ DE FORMADO', 1),
(4, 'AJUSTE SENSOR MISFEED', 1),
(5, 'ARO RETENCION QUEBRADO', 1),
(6, 'BANDA REVENTADA', 1),
(7, 'CANDADO ESTATOR QUEBRADO', 1),
(8, 'CILINDRO COUNTERBORE NO ACCIONA', 1),
(9, 'CILINDRO SEPARADOR NO ACCIONA', 1),
(10, 'CONCENTRICIDAD FUERA DE ESPECIFICACION', 1),
(11, 'DEPOSTILLADURA EN CUCHILLA ESTATOR', 1),
(12, 'DIA EXT DE ROTOR F/E', 1),
(13, 'DIAMETRO INTERIOR ESTATOR ABIERTO', 1),
(14, 'DIAMETRO INTERIOR ESTATOR CERRADO', 1),
(15, 'DIAMETRO INTERIOR ROTOR ABIERTO', 1),
(16, 'DIAMETRO INTERIOR ROTOR CERRADO', 1),
(17, 'ELEVADOR DEFORMA LAMINA', 1),
(18, 'FALLA SENSOR DOBLE ESPESOR', 1),
(19, 'GAPS', 1),
(20, 'GRAPA EXPUESTA LADO CORTO', 1),
(21, 'GRAPA EXPUESTA LADO LARGO', 1),
(22, 'GRAPADO FRAGIL', 1),
(23, 'GUIA QUEBRADA', 1),
(24, 'INSERTO DE STIRPER QUEBRADO', 1),
(25, 'LAMINA SE ATORA EN TROQUEL', 1),
(26, 'MAL GRAPADO Y REBABA EN ESTATOR', 1),
(27, 'MATRIZ DEPOSTILLADA', 1),
(28, 'MATRIZ FORMADO DEPOSTILLADA', 1),
(29, 'MATRIZ FORMADO TAPADA', 1),
(30, 'MATRIZ ROTACIONAL AMARRADA', 1),
(31, 'MATRIZ SUELTA', 1),
(32, 'MATRIZ TAPADA', 1),
(33, 'MATRIZES Y PUNZONES DEPOSTILLADOS', 1),
(34, 'MTTO EN CONECTORES', 1),
(35, 'MULTIPUERTO DAÑADO', 1),
(36, 'NO RETIENE LA REBABA', 1),
(37, 'PILOTO INICIO ATORADO', 1),
(38, 'PILOTO JALA LA TIRA', 1),
(39, 'PILOTO QUEBRADO', 1),
(40, 'PILOTO SACA LA LAMINA', 1),
(41, 'PISTON AMARRADO', 1),
(42, 'PLANICIDAD', 1),
(43, 'POLEA DE ROTACIONAL DAÑADA', 1),
(44, 'POLEA ROTACIONAL CAIDA', 1),
(45, 'PROGRESION AJUSTADA', 1),
(46, 'PRUEBA DE ALINEACION', 1),
(47, 'PUNZON DE COUNTERBORE CAIDO', 1),
(48, 'PUNZON DE PILOTAJE', 1),
(49, 'PUNZON DE SCROLL DEPOSTILLADO', 1),
(50, 'PUNZON DIA EXT ESTATOR CAIDO', 1),
(51, 'PUNZON FORMADO QUEBRADO', 1),
(52, 'PUNZON SEPARADO QUEBRADO', 1),
(53, 'PUNZON SKEW QUEBRADO', 1),
(54, 'PUNZON SLOT ESTATOR QUEBRADO', 1),
(55, 'PUNZON SLOT ESTATOR SUELTO', 1),
(56, 'PUNZON SLOT ROTOR QUEBRADO', 1),
(57, 'PUNZON SLOT ROTOR SUELTO', 1),
(58, 'PUNZON VENTANA QUEBRADO', 1),
(59, 'REBABA DIAMETRO EXTERIOR ESTATOR', 1),
(60, 'REBABA DIAMETRO EXTERIOR ROTOR', 1),
(61, 'REBABA DIAMETRO INTERIOR ESTATOR', 1),
(62, 'REBABA DIAMETRO INTERIOR ROTOR', 1),
(63, 'REBABA DIAMETRO PILOTO', 1),
(64, 'REBABA DIAMETRO TORNILLO', 1),
(65, 'REBABA EN ESTATOR Y ROTOR', 1),
(66, 'REBABA EN VENTANA', 1),
(67, 'REBABA SLOT ESTATOR', 1),
(68, 'REBABA SLOT ROTOR', 1),
(69, 'RECTIFICADO GENERAL', 1),
(70, 'REVISION SERVO-MOTOR', 1),
(71, 'SKEW GIRADO', 1),
(72, 'TORNILLO CAPADO', 1);

-- --------------------------------------------------------

--
-- Table structure for table `tbl_historial`
--

CREATE TABLE `tbl_historial` (
  `id_historial` int(11) NOT NULL,
  `troquel_id` varchar(50) NOT NULL,
  `tipo_registro` varchar(50) DEFAULT NULL,
  `action_type` varchar(50) NOT NULL,
  `id_falla` int(11) DEFAULT NULL,
  `modelo_nuevo` varchar(100) DEFAULT NULL,
  `nivel_setup` varchar(10) DEFAULT NULL,
  `grupo` varchar(10) DEFAULT NULL,
  `comentarios` text DEFAULT NULL,
  `motivo` varchar(100) DEFAULT NULL,
  `comentarios_supervisor` text DEFAULT NULL,
  `empleado_troquel` varchar(100) DEFAULT NULL,
  `empleado_asistencia` varchar(100) DEFAULT NULL,
  `creado_el` timestamp NOT NULL DEFAULT current_timestamp(),
  `folio` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbl_historial`
--

INSERT INTO `tbl_historial` (`id_historial`, `troquel_id`, `tipo_registro`, `action_type`, `id_falla`, `modelo_nuevo`, `nivel_setup`, `grupo`, `comentarios`, `motivo`, `comentarios_supervisor`, `empleado_troquel`, `empleado_asistencia`, `creado_el`, `folio`) VALUES
(1, 'T007', 'baja_troquel', 'Falla de Troquel', 12, NULL, NULL, '1', 'pr', NULL, NULL, 'fa', NULL, '2026-01-26 18:42:08', NULL),
(2, 'T001', 'baja_troquel', 'Falla de Troquel', 13, NULL, '2', '2', 'Prueba de registro de baja de troquel', NULL, NULL, 'David Barreto', NULL, '2026-02-04 13:12:02', '0608'),
(3, 'T001', 'asistencia_prensa', 'DEPOSTILLADURA EN CUCHILLA ESTATOR', NULL, NULL, NULL, NULL, 'prueba de asistencia en prensa', 'DEPOSTILLADURA EN CUCHILLA ESTATOR', NULL, NULL, 'Francisco Valdez', '2026-02-04 14:48:13', '556');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_modelos_troquel`
--

CREATE TABLE `tbl_modelos_troquel` (
  `id_modelo` int(11) NOT NULL,
  `nombre_modelo` varchar(100) NOT NULL COMMENT 'Nombre del modelo (ej: F180, G3-VSS)',
  `troquel_id` varchar(20) NOT NULL COMMENT 'ID del troquel al que pertenece',
  `descripcion` text DEFAULT NULL COMMENT 'Descripción opcional del modelo',
  `creado_en` timestamp NOT NULL DEFAULT current_timestamp(),
  `actualizado_en` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbl_modelos_troquel`
--

INSERT INTO `tbl_modelos_troquel` (`id_modelo`, `nombre_modelo`, `troquel_id`, `descripcion`, `creado_en`, `actualizado_en`) VALUES
(1, 'F180', 'T718', 'Modelo principal para producción estándar', '2026-02-05 00:48:12', '2026-02-05 00:48:12'),
(2, 'F180-A', 'T718', 'Variante A del modelo F180', '2026-02-05 00:48:12', '2026-02-05 00:48:12'),
(3, 'G3-VSS', 'T951', 'Modelo para sistema VSS', '2026-02-05 00:48:12', '2026-02-05 00:48:12'),
(4, 'H2-PRO', 'T623', 'Modelo profesional H2', '2026-02-05 00:48:12', '2026-02-05 00:48:12'),
(6, 'MRJ-45', 'T003', 'Prueba de creacion de modelo para troquel.', '2026-02-09 19:09:10', '2026-02-09 19:09:27');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_prensas`
--

CREATE TABLE `tbl_prensas` (
  `id_prensa` int(11) NOT NULL,
  `identificador_prensa` varchar(10) NOT NULL,
  `nombre` varchar(100) DEFAULT NULL,
  `modelo` varchar(100) DEFAULT NULL,
  `descripcion` text DEFAULT NULL,
  `tonelaje` int(11) DEFAULT NULL,
  `estado` enum('activa','inactiva','mantenimiento') DEFAULT 'activa',
  `ubicacion` varchar(100) DEFAULT NULL,
  `creado_en` timestamp NOT NULL DEFAULT current_timestamp(),
  `actualizado_en` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `marca` varchar(100) DEFAULT NULL COMMENT 'Marca/fabricante de la prensa',
  `notas` text DEFAULT NULL COMMENT 'Notas adicionales'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbl_prensas`
--

INSERT INTO `tbl_prensas` (`id_prensa`, `identificador_prensa`, `nombre`, `modelo`, `descripcion`, `tonelaje`, `estado`, `ubicacion`, `creado_en`, `actualizado_en`, `marca`, `notas`) VALUES
(1, '', 'Prensa 8', NULL, 'Prensa de alta capacidad', 200, 'activa', NULL, '2026-01-23 14:51:09', '2026-01-23 14:51:09', NULL, NULL),
(3, 'P01', 'Prensa Hidráulica 01', 'SN-2018-0001', NULL, 250, 'activa', 'Nave 1 - Línea A', '2026-01-31 21:15:24', '2026-01-31 21:15:24', 'AIDA', '1500 x 800 mm'),
(4, 'P02', 'Prensa Mecánica 02', 'SN-2020-0042', NULL, 160, 'activa', 'Nave 1 - Línea B', '2026-01-31 21:15:24', '2026-01-31 21:15:24', 'Komatsu', NULL),
(5, 'P03', 'Prensa Servo 03', 'SN-2022-0103', NULL, 300, '', 'Nave 2 - Línea C', '2026-01-31 21:15:24', '2026-01-31 21:15:24', 'Schuler', 'En mantenimiento preventivo programado'),
(6, 'P04', 'Prensa Hidráulica 04', 'SN-2019-0078', NULL, 200, 'activa', 'Nave 2 - Línea D', '2026-01-31 21:15:24', '2026-01-31 21:15:24', 'AIDA', NULL),
(7, 'P05', 'Prensa Transfer 05', 'SN-2015-0012', NULL, 400, 'inactiva', 'Nave 3 - Almacén', '2026-01-31 21:15:24', '2026-01-31 21:15:24', 'Schuler', 'Pendiente de reubicación'),
(8, 'P10', 'PRENSA TRANSFER 50', 'SN-2026-0050', NULL, 500, '', 'NAVE 5 - TALLER', '2026-02-03 17:36:40', '2026-02-03 17:36:40', 'AIDA', 'Prueba de creacion de prensa');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_prioridad_reparacion`
--

CREATE TABLE `tbl_prioridad_reparacion` (
  `id_prioridad_reparacion` int(11) NOT NULL,
  `prioridad` int(11) NOT NULL,
  `id_troquel` varchar(10) NOT NULL,
  `creado_el` timestamp NOT NULL DEFAULT current_timestamp(),
  `actualizado_el` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbl_prioridad_reparacion`
--

INSERT INTO `tbl_prioridad_reparacion` (`id_prioridad_reparacion`, `prioridad`, `id_troquel`, `creado_el`, `actualizado_el`) VALUES
(1, 1, 'T954', '2026-01-12 15:08:54', '2026-01-12 15:08:54'),
(2, 2, 'T953', '2026-01-12 15:08:54', '2026-01-12 15:08:54'),
(3, 3, 'T951', '2026-01-12 15:08:54', '2026-01-12 15:08:54'),
(4, 4, 'T955', '2026-01-12 15:08:54', '2026-01-12 15:08:54'),
(5, 5, 'T952', '2026-01-12 15:08:54', '2026-01-12 15:08:54');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_resumen_troqueles`
--

CREATE TABLE `tbl_resumen_troqueles` (
  `id_resumen_troqueles` int(11) NOT NULL,
  `etiqueta` enum('UP','BACKUP','TOTAL') NOT NULL,
  `count` varchar(20) DEFAULT '-',
  `goal` varchar(20) DEFAULT '-',
  `perf` varchar(20) DEFAULT '-',
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbl_resumen_troqueles`
--

INSERT INTO `tbl_resumen_troqueles` (`id_resumen_troqueles`, `etiqueta`, `count`, `goal`, `perf`, `updated_at`) VALUES
(1, 'UP', '-', '-', '-', '2026-01-12 15:09:52'),
(2, 'BACKUP', '-', '-', '-', '2026-01-12 15:09:52'),
(3, 'TOTAL', '-', '-', '-', '2026-01-12 15:09:52');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_tecnicos_ciclo`
--

CREATE TABLE `tbl_tecnicos_ciclo` (
  `id_tecnicos_ciclos` int(11) NOT NULL,
  `ciclo_id` int(11) NOT NULL,
  `empleado_numero` varchar(20) DEFAULT NULL,
  `empleado_nombre` varchar(100) NOT NULL,
  `grupo` tinyint(4) DEFAULT NULL,
  `fecha_inicio` datetime DEFAULT current_timestamp(),
  `fecha_fin` datetime DEFAULT NULL,
  `tipo` enum('Técnico','Supervisor','Apoyo') DEFAULT 'Técnico',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_tipos_troquel`
--

CREATE TABLE `tbl_tipos_troquel` (
  `id_tipo_troquel` int(11) NOT NULL,
  `codigo` varchar(20) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `activo` tinyint(1) DEFAULT 1,
  `creado_en` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbl_tipos_troquel`
--

INSERT INTO `tbl_tipos_troquel` (`id_tipo_troquel`, `codigo`, `nombre`, `descripcion`, `activo`, `creado_en`) VALUES
(1, 'progresivo', 'Progresivo', 'Troquel de estaciones progresivas para operaciones secuenciales', 1, '2026-01-23 14:51:41'),
(2, 'transfer', 'Transfer', 'Troquel tipo transfer para piezas grandes', 1, '2026-01-23 14:51:41'),
(3, 'compound', 'Compound', 'Troquel compuesto para operaciones simultáneas', 1, '2026-01-23 14:51:41'),
(4, 'simple', 'Simple', 'Troquel de operación simple', 1, '2026-01-23 14:51:41'),
(5, 'blanking', 'Blanking', 'Troquel para corte de forma', 1, '2026-01-23 14:51:41'),
(6, 'bending', 'Doblado', 'Troquel para operaciones de doblado', 1, '2026-01-23 14:51:41'),
(7, 'drawing', 'Embutido', 'Troquel para embutido de piezas', 1, '2026-01-23 14:51:41');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_troqueles`
--

CREATE TABLE `tbl_troqueles` (
  `id_troquel` varchar(50) NOT NULL,
  `nombre` varchar(100) DEFAULT NULL,
  `estado` enum('Pendiente','En prensa','Listo','Listo-BackUp','Reparando','Baja') DEFAULT 'Pendiente',
  `año` int(11) DEFAULT NULL,
  `modelo` varchar(100) DEFAULT NULL,
  `golpes` varchar(50) DEFAULT '-',
  `golpes_acum` varchar(50) DEFAULT '-',
  `capacidad_golpes` varchar(50) DEFAULT '-',
  `rectificaciones` varchar(100) DEFAULT '0',
  `image_url` text DEFAULT NULL,
  `comentarios` text DEFAULT NULL,
  `prensa_asignada` varchar(50) DEFAULT NULL,
  `tipo_troquel` enum('progresivo','transfer','simple','compuesto','multiple','Null') DEFAULT 'Null',
  `ubicacion` varchar(100) DEFAULT NULL,
  `numero_serie` varchar(100) DEFAULT NULL,
  `proveedor` varchar(150) DEFAULT NULL,
  `peso_kg` varchar(50) DEFAULT NULL,
  `dimensiones` varchar(100) DEFAULT NULL,
  `material_base` varchar(100) DEFAULT NULL,
  `num_estaciones` varchar(20) DEFAULT NULL,
  `cavidades` varchar(50) DEFAULT NULL,
  `color` varchar(50) DEFAULT NULL,
  `ciclos` varchar(50) DEFAULT NULL,
  `n_parte_1` varchar(50) DEFAULT NULL,
  `n_parte_2` varchar(50) DEFAULT NULL,
  `n_parte_3` varchar(50) DEFAULT NULL,
  `n_parte_4` varchar(50) DEFAULT NULL,
  `n_parte_5` varchar(50) DEFAULT NULL,
  `n_parte_6` varchar(50) DEFAULT NULL,
  `creado_por` int(11) DEFAULT NULL,
  `actualizado_por` int(11) DEFAULT NULL,
  `creado_en` timestamp NOT NULL DEFAULT current_timestamp(),
  `actualizado_el` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbl_troqueles`
--

INSERT INTO `tbl_troqueles` (`id_troquel`, `nombre`, `estado`, `año`, `modelo`, `golpes`, `golpes_acum`, `capacidad_golpes`, `rectificaciones`, `image_url`, `comentarios`, `prensa_asignada`, `tipo_troquel`, `ubicacion`, `numero_serie`, `proveedor`, `peso_kg`, `dimensiones`, `material_base`, `num_estaciones`, `cavidades`, `color`, `ciclos`, `n_parte_1`, `n_parte_2`, `n_parte_3`, `n_parte_4`, `n_parte_5`, `n_parte_6`, `creado_por`, `actualizado_por`, `creado_en`, `actualizado_el`) VALUES
('T001', 'Alpha', 'Reparando', 2024, 'G3-VSS', '257,540', '121,442,752', '250,000,000', '15', NULL, NULL, 'Prensa 1', 'progresivo', 'Plasticos', 'Rack A-01', 'Motores Reynosa Nidec', '20', '1.890x2.380', 'aluminio', '2', '8', NULL, '2', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-01-21 15:14:18', '2026-02-04 13:12:02'),
('T002', 'Beta', 'Listo', 2023, 'G3-VTS', '180,200', '95,320,100', '250,000,000', '12', NULL, NULL, 'Prensa 2', 'progresivo', 'Plasticos', 'Rack A-02', 'Motores Reynosa Nidec', '20', '1.890x2.380', 'aluminio', '3', '10', NULL, '5', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-01-21 15:14:18', '2026-01-21 15:14:18'),
('T003', 'Gamma', 'Listo', 2022, 'G4-XLS', '320,100', '156,780,500', '300,000,000', '18', NULL, NULL, 'Prensa 3', 'transfer', 'Plasticos', 'Taller', 'Motores Reynosa Nidec', '30', '1.890x2.380', 'acero templado', '4', '8', NULL, '1', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-01-21 15:14:18', '2026-02-18 17:27:18'),
('T004', 'Delta', 'Listo', 2026, 'G5-PRO', '-', '450', '150,000,000', '0', NULL, NULL, NULL, 'progresivo', 'Plasticos', 'Almacen', 'Motores Reynosa Nidec', '20', '1.890x2.380', 'aluminio', '0', '16', NULL, '0', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-01-21 15:14:18', '2026-02-18 17:24:53'),
('T006', 'Echo', 'Listo-BackUp', 2025, 'G7-RTX', '10', '10', '10,000,000', '0', NULL, 'actualizacion', NULL, 'transfer', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-01-23 19:45:34', '2026-01-26 15:54:18');
INSERT INTO `tbl_troqueles` (`id_troquel`, `nombre`, `estado`, `año`, `modelo`, `golpes`, `golpes_acum`, `capacidad_golpes`, `rectificaciones`, `image_url`, `comentarios`, `prensa_asignada`, `tipo_troquel`, `ubicacion`, `numero_serie`, `proveedor`, `peso_kg`, `dimensiones`, `material_base`, `num_estaciones`, `cavidades`, `color`, `ciclos`, `n_parte_1`, `n_parte_2`, `n_parte_3`, `n_parte_4`, `n_parte_5`, `n_parte_6`, `creado_por`, `actualizado_por`, `creado_en`, `actualizado_el`) VALUES
('T007', 'Charlie', 'Baja', 2027, 'TR-30V', '50', '500', '50,000,000', '10', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAACbEAAAUrCAYAAAAeoXjCAAAACXBIWXMAAC4jAAAuIwF4pT92AAAgAElEQVR4nOzd33EU27nG4deucy9lIDkC5AiYDCADJgOUAcrgyBF4MvDeEViOwBCBUQQHIuBc9HaV/6AWokd6V08/TxXFVWu+Es2aqerfrPW7b9++BQAAAAAAAAAAABp+3x4AAAAAAAAAAACA7RKxAQAAAAAAAAAAUCNiAwAAAAAAAAAAoEbEBgAAAAAAAAAAQI2IDQAAAAAAAAAAgBoRGwAAAAAAAAAAADUiNgAAAAAAAAAAAGpEbAAAAAAAAAAAANSI2AAAAAAAAAAAAKgRsQEAAAAAAAAAAFAjYgMAAAAAAAAAAKBGxAYAAAAAAAAAAECNiA0AAAAAAAAAAIAaERsAAAAAAAAAAAA1IjYAAAAAAAAAAABqRGwAAAAAAAAAAADUiNgAAAAAAAAAAACoEbEBAAAAAAAAAABQI2IDAAAAAAAAAACgRsQGAAAAAAAAAABAjYgNAAAAAAAAAACAGhEbAAAAAAAAAAAANSI2AAAAAAAAAAAAakRsAAAAAAAAAAAA1IjYAAAAAAAAAAAAqBGxAQAAAAAAAAAAUCNiAwAAAAAAAAAAoEbEBgAAAAAAAAAAQI2IDQAAAAAAAAAAgBoRGwAAAAAAAAAAADUiNgAAAAAAAAAAAGpEbAAAAAAAAAAAANSI2AAAAAAAAAAAAKgRsQEAAAAAAAAAAFAjYgMAAAAAAAAAAKBGxAYAAAAAAAAAAECNiA0AAAAAAAAAAIAaERsAAAAAAAAAAAA1IjYAAAAAAAAAAABqRGwAAAAAAAAAAADUiNgAAAAAAAAAAACoEbEBAAAAAAAAAABQI2IDAAAAAAAAAACgRsQGAAAAAAAAAABAjYgNAAAAAAAAAACAGhEbAAAAAAAAAAAANSI2AAAAAAAAAAAAakRsAAAAAAAAAAAA1IjYAAAAAAAAAAAAqBGxAQAAAAAAAAAAUCNiAwAAAAAAAAAAoEbEBgAAAAAAAAAAQI2IDQAAAAAAAAAAgBoRGwAAAAAAAAAAADUiNgAAAAAAAAAAAGpEbAAAAAAAAAAAANSI2AAAAAAAAAAAAKgRsQEAAAAAAAAAAFAjYgMAAAAAAAAAAKBGxAYAAAAAAAAAAECNiA0AAAAAAAAAAIAaERsAAAAAAAAAAAA1IjYAAAAAAAAAAABqRGwAAAAAAAAAAADUiNgAAAAAAAAAAACoEbEBAAAAAAAAAABQI2IDAAAAAAAAAACgRsQGAAAAAAAAAABAjYgNAAAAAAAAAACAGhEbAAAAAAAAAAAANSI2AAAAAAAAAAAAakRsAAAAAAAAAAAA1IjYAAAAAAAAAAAAqBGxAQAAAAAAAAAAUCNiAwAAAAAAAAAAoEbEBgAAAAAAAAAAQI2IDQAAAAAAAAAAgBoRGwAAAAAAAAAAADUiNgAAAAAAAAAAAGpEbAAAAAAAAAAAANSI2AAAAAAAAAAAAKgRsQEAAAAAAAAAAFAjYgMAAAAAAAAAAKBGxAYAAAAAAAAAAECNiA0AAAAAAAAAAIAaERsAAAAAAAAAAAA1IjYAAAAAAAAAAABqRGwAAAAAAAAAAADUiNgAAAAAAAAAAACoEbEBAAAAAAAAAABQI2IDAAAAAAAAAACgRsQGAAAAAAAAAABAjYgNAAAAAAAAAACAGhEbAAAAAAAAAAAANSI2AAAAAAAAAAAAakRsAAAAAAAAAAAA1IjYAAAAAAAAAAAAqBGxAQAAAAAAAAAAUCNiAwAAAAAAAAAAoEbEBgAAAAAAAAAAQI2IDQAAAAAAAAAAgBoRGwAAAAAAAAAAADUiNgAAAAAAAAAAAGpEbAAAAAAAAAAAANSI2AAAAAAAAAAAAKgRsQEAAAAAAAAAAFAjYgMAAAAAAAAAAKBGxAYAAAAAAAAAAECNiA0AAAAAAAAAAIAaERsAAAAAAAAAAAA1IjYAAAAAAAAAAABqRGwAAAAAAAAAAADUiNgAAAAAAAAAAACoEbEBAAAAAAAAAABQI2IDAAAAAAAAAACgRsQGAAAAAAAAAABAjYgNAAAAAAAAAACAGhEbAAAAAAAAAAAANSI2AAAAAAAAAAAAakRsAAAAAAAAAAAA1IjYAAAAAAAAAAAAqBGxAQAAAAAAAAAAUCNiAwAAAAAAAAAAoEbEBgAAAAAAAAAAQI2IDQAAAAAAAAAAgBoRGwAAAAAAAAAAADUiNgAAAAAAAAAAAGpEbAAAAAAAAAAAANSI2AAAAAAAAAAAAKgRsQEAAAAAAAAAAFAjYgMAAAAAAAAAAKBGxAYAAAAAAAAAAECNiA0AAAAAAAAAAIAaERsAAAAAAAAAAAA1IjYAAAAAAAAAAABqRGwAAAAAAAAAAADUiNgAAAAAAAAAAACoEbEBAAAAAAAAAABQI2IDAAAAAAAAAACgRsQGAAAAAAAAAABAjYgNAAAAAAAAAACAGhEbAAAAAAAAAAAANSI2AAAAAAAAAAAAakRsAAAAAAAAAAAA1IjYAAAAAAAAAAAAqBGxAQAAAAAAAAAAUCNiAwAAAAAAAAAAoEbEBgAAAAAAAAAAQI2IDQAAAAAAAAAAgBoRGwAAAAAAAAAAADUiNgAAAAAAAAAAAGpEbAAAAAAAAAAAANSI2AAAAAAAAAAAAKgRsQEAAAAAAAAAAFAjYgMAAAAAAAAAAKBGxAYAAAAAAAAAAECNiA0AAAAAAAAAAIAaERsAAAAAAAAAAAA1IjYAAAAAAAAAAABqRGwAAAAAAAAAAADUiNgAAAAAAAAAAACoEbEBAAAAAAAAAABQI2IDAAAAAAAAAACgRsQGAAAAAAAAAABAjYgNAAAAAAAAAACAGhEbAAAAAAAAAAAANSI2AAAAAAAAAAAAakRsAAAAAAAAAAAA1IjYAAAAAAAAAAAAqBGxAQAAAAAAAAAAUCNiAwAAAAAAAAAAoEbEBgAAAAAAAAAAQI2IDQAAAAAAAAAAgBoRGwAAAAAAAAAAADUiNgAAAAAAAAAAAGpEbAAAAAAAAAAAANSI2AAAAAAAAAAAAKgRsQEAAAAAAAAAAFAjYgMAAAAAAAAAAKBGxAYAAAAAAAAAAECNiA0AAAAAAAAAAIAaERsAAAAAAAAAAAA1IjYAAAAAAAAAAABqRGwAAAAAAAAAAADUiNgAAAAAAAAAAACoEbEBAAAAAAAAAABQI2IDAAAAAAAAAACgRsQGAAAAAAAAAABAjYgNAAAAAAAAAACAGhEbAAAAAAAAAAAANSI2AAAAAAAAAAAAakRsAAAAAAAAAAAA1IjYAAAAAAAAAAAAqBGxAQAAAAAAAAAAUCNiAwAAAAAAAAAAoEbEBgAAAAAAAAAAQI2IDQAAAAAAAAAAgBoRGwAAAAAAAAAAADUiNgAAAAAAAAAAAGpEbAAAAAAAAAAAANSI2AAAAAAAAAAAAKgRsQEAAAAAAAAAAFAjYgMAAAAAAAAAAKBGxAYAAAAAAAAAAECNiA0AAAAAAAAAAIAaERsAAAAAAAAAAAA1IjYAAAAAAAAAAABqRGwAAAAAAAAAAADUiNgAAAAAAAAAAACoEbEBAAAAAAAAAABQI2IDAAAAAAAAAACgRsQGAAAAAAAAAABAjYgNAAAAAAAAAACAGhEbAAAAAAAAAAAANSI2AAAAAAAAAAAAakRsAAAAAAAAAAAA1IjYAAAAAAAAAAAAqBGxAQAAAAAAAAAAUCNiAwAAAAAAAAAAoEbEBgAAAAAAAAAAQI2IDQAAAAAAAAAAgBoRGwAAAAAAAAAAADUiNgAAAAAAAAAAAGpEbAAAAAAAAAAAANSI2AAAAAAAAAAAAKgRsQEAAAAAAAAAAFAjYgMAAAAAAAAAAKBGxAYAAAAAAAAAAECNiA0AAAAAAAAAAIAaERsAAAAAAAAAAAA1IjYAAAAAAAAAAABqRGwAAAAAAAAAAADUiNgAAAAAAAAAAACoEbEBAAAAAAAAAABQI2IDAAAAAAAAAACgRsQGAAAAAAAAAABAjYgNAAAAAAAAAACAGhEbAAAAAAAAAAAANSI2AAAAAAAAAAAAakRsAAAAAAAAAAAA1IjYAAAAAAAAAAAAqBGxAQAAAAAAAAAAUCNiAwAAAAAAAAAAoEbEBgAAAAAAAAAAQI2IDQAAAAAAAAAAgBoRGwAAAAAAAAAAADUiNgAAAAAAAAAAAGpEbAAAAAAAAAAAANSI2AAAAAAAAAAAAKgRsQEAAAAAAAAAAFAjYgMAAAAAAAAAAKBGxAYAAAAAAAAAAECNiA0AAAAAAAAAAIAaERsAAAAAAAAAAAA1IjYAAAAAAAAAAABqRGwAAAAAAAAAAADUiNgAAAAAAAAAAACoEbEBAAAAAAAAAABQI2IDAAAAAAAAAACgRsQGAAAAAAAAAABAjYgNAAAAAAAAAACAGhEbAAAAAAAAAAAANSI2AAAAAAAAAAAAakRsAAAAAAAAAAAA1IjYAAAAAAAAAAAAqBGxAQAAAAAAAAAAUCNiAwAAAAAAAAAAoEbEBgAAAAAAAAAAQI2IDQAAAAAAAAAAgBoRGwAAAAAAAAAAADUiNgAAAAAAAAAAAGpEbAAAAAAAAAAAANSI2AAAAAAAAAAAAKgRsQEAAAAAAAAAAFAjYgMAAAAAAAAAAKBGxAYAAAAAAAAAAECNiA0AAAAAAAAAAIAaERsAAAAAAAAAAAA1IjYAAAAAAAAAAABqRGwAAAAAAAAAAADUiNgAAAAAAAAAAACoEbEBAAAAAAAAAABQI2IDAAAAAAAAAACgRsQGAAAAAAAAAABAjYgN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AAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAA6UtklgAABcFJREFUAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAy/wDjwm67SnlB4wAAAABJRU5ErkJggg==', 'actualizacion', '1', 'Null', NULL, NULL, NULL, NULL, NULL, NULL, '2', '8', 'azul', '10', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-01-26 17:13:20', '2026-01-26 17:34:18');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_troqueles_historial`
--

CREATE TABLE `tbl_troqueles_historial` (
  `id_historial` int(11) NOT NULL,
  `troquel_id` varchar(20) NOT NULL,
  `campo_modificado` varchar(50) NOT NULL,
  `valor_anterior` text DEFAULT NULL,
  `valor_nuevo` text DEFAULT NULL,
  `usuario_id` int(11) DEFAULT NULL,
  `fecha_cambio` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbl_troqueles_historial`
--

INSERT INTO `tbl_troqueles_historial` (`id_historial`, `troquel_id`, `campo_modificado`, `valor_anterior`, `valor_nuevo`, `usuario_id`, `fecha_cambio`) VALUES
(1, 'T006', 'update', '{\"id_troquel\":\"T006\",\"nombre\":\"Echo\",\"estado\":\"Listo-BackUp\",\"a\\u00f1o\":2025,\"modelo\":\"G7-RTX\",\"golpes\":\"-\",\"golpes_acum\":\"0\",\"capacidad_golpes\":\"-\",\"rectificaciones\":\"0\",\"image_url\":null,\"comentarios\":null,\"prensa_asignada\":null,\"tipo_troquel\":\"\",\"ubicacion\":null,\"numero_serie\":null,\"proveedor\":null,\"peso_kg\":null,\"dimensiones\":null,\"material_base\":null,\"num_estaciones\":null,\"cavidades\":null,\"color\":null,\"ciclos\":null,\"n_parte_1\":null,\"n_parte_2\":null,\"n_parte_3\":null,\"n_parte_4\":null,\"n_parte_5\":null,\"n_parte_6\":null,\"creado_por\":null,\"actualizado_por\":null,\"creado_en\":\"2026-01-23 13:45:34\",\"actualizado_el\":\"2026-01-23 13:45:34\"}', '{\"id_troquel\":\"T006\",\"nombre\":\"Echo\",\"estado\":\"Listo-BackUp\",\"a\\u00f1o\":2025,\"modelo\":\"G7-RTX\",\"golpes\":\"10\",\"golpes_acum\":\"10\",\"capacidad_golpes\":\"10,000,000\",\"rectificaciones\":\"0\",\"tipo_troquel\":\"transfer\",\"ubicacion\":null,\"prensa_asignada\":null,\"numero_serie\":null,\"proveedor\":null,\"peso_kg\":null,\"dimensiones\":null,\"material_base\":null,\"num_estaciones\":null,\"vida_util_estimada\":null,\"comentarios\":\"actualizacion\",\"image_url\":null}', NULL, '2026-01-26 15:54:18'),
(2, 'T007', 'update', '{\"id_troquel\":\"T007\",\"nombre\":\"Charlie\",\"estado\":\"Baja\",\"a\\u00f1o\":2027,\"modelo\":\"TR-30V\",\"golpes\":\"50\",\"golpes_acum\":\"500\",\"capacidad_golpes\":\"50,000,000\",\"rectificaciones\":\"10\",\"image_url\":null,\"comentarios\":null,\"prensa_asignada\":\"1\",\"tipo_troquel\":\"\",\"ubicacion\":null,\"numero_serie\":null,\"proveedor\":null,\"peso_kg\":null,\"dimensiones\":null,\"material_base\":null,\"num_estaciones\":\"2\",\"cavidades\":\"8\",\"color\":\"azul\",\"ciclos\":\"10\",\"n_parte_1\":null,\"n_parte_2\":null,\"n_parte_3\":null,\"n_parte_4\":null,\"n_parte_5\":null,\"n_parte_6\":null,\"creado_por\":null,\"actualizado_por\":null,\"creado_en\":\"2026-01-26 11:13:20\",\"actualizado_el\":\"2026-01-26 11:13:20\"}', '{\"id_troquel\":\"T007\",\"nombre\":\"Charlie\",\"estado\":\"Baja\",\"a\\u00f1o\":2027,\"modelo\":\"TR-30V\",\"golpes\":\"50\",\"golpes_acum\":\"500\",\"capacidad_golpes\":\"50,000,000\",\"rectificaciones\":\"10\",\"tipo_troquel\":\"Null\",\"ubicacion\":null,\"prensa_asignada\":\"1\",\"numero_serie\":null,\"proveedor\":null,\"peso_kg\":null,\"dimensiones\":null,\"material_base\":null,\"num_estaciones\":\"2\",\"cavidades\":\"8\",\"color\":\"azul\",\"ciclos\":\"10\",\"n_parte_1\":null,\"n_parte_2\":null,\"n_parte_3\":null,\"n_parte_4\":null,\"n_parte_5\":null,\"n_parte_6\":null,\"comentarios\":\"actualizacion\",\"image_url\":null}', NULL, '2026-01-26 17:20:18');
INSERT INTO `tbl_troqueles_historial` (`id_historial`, `troquel_id`, `campo_modificado`, `valor_anterior`, `valor_nuevo`, `usuario_id`, `fecha_cambio`) VALUES
(3, 'T007', 'update', '{\"id_troquel\":\"T007\",\"nombre\":\"Charlie\",\"estado\":\"Baja\",\"a\\u00f1o\":2027,\"modelo\":\"TR-30V\",\"golpes\":\"50\",\"golpes_acum\":\"500\",\"capacidad_golpes\":\"50,000,000\",\"rectificaciones\":\"10\",\"image_url\":null,\"comentarios\":\"actualizacion\",\"prensa_asignada\":\"1\",\"tipo_troquel\":\"Null\",\"ubicacion\":null,\"numero_serie\":null,\"proveedor\":null,\"peso_kg\":null,\"dimensiones\":null,\"material_base\":null,\"num_estaciones\":\"2\",\"cavidades\":\"8\",\"color\":\"azul\",\"ciclos\":\"10\",\"n_parte_1\":null,\"n_parte_2\":null,\"n_parte_3\":null,\"n_parte_4\":null,\"n_parte_5\":null,\"n_parte_6\":null,\"creado_por\":null,\"actualizado_por\":null,\"creado_en\":\"2026-01-26 11:13:20\",\"actualizado_el\":\"2026-01-26 11:20:18\"}', '{\"id_troquel\":\"T007\",\"nombre\":\"Charlie\",\"estado\":\"Baja\",\"a\\u00f1o\":2027,\"modelo\":\"TR-30V\",\"golpes\":\"50\",\"golpes_acum\":\"500\",\"capacidad_golpes\":\"50,000,000\",\"rectificaciones\":\"10\",\"tipo_troquel\":\"Null\",\"ubicacion\":null,\"prensa_asignada\":\"1\",\"numero_serie\":null,\"proveedor\":null,\"peso_kg\":null,\"dimensiones\":null,\"material_base\":null,\"num_estaciones\":\"2\",\"cavidades\":\"8\",\"color\":\"azul\",\"ciclos\":\"10\",\"n_parte_1\":null,\"n_parte_2\":null,\"n_parte_3\":null,\"n_parte_4\":null,\"n_parte_5\":null,\"n_parte_6\":null,\"comentarios\":\"actualizacion\",\"image_url\":\"data:image\\/png;base64,iVBORw0KGgoAAAANSUhEUgAACbEAAAUrCAYAAAAeoXjCAAAACXBIWXMAAC4jAAAuIwF4pT92AAAgAElEQVR4nOzd33EU27nG4deucy9lIDkC5AiYDCADJgOUAcrgyBF4MvDeEViOwBCBUQQHIuBc9HaV\\/6AWokd6V08\\/TxXFVWu+Es2aqerfrPW7b9++BQAAAAAAAAAAABp+3x4AAAAAAAAAAACA7RKxAQAAAAAAAAAAUCNiAwAAAAAAAAAAoEbEBgAAAAAAAAAAQI2IDQAAAAAAAAAAgBoRGwAAAAAAAAAAADUiNgAAAAAAAAAAAGpEbAAAAAAAAAAAANSI2AAAAAAAAAAAAKgRsQEAAAAAAAAAAFAjYgMAAAAAAAAAAKBGxAYAAAAAAAAAAECNiA0AAAAAAAAAAIAaERsAAAAAAAAAAAA1IjYAAAAAAAAAAABqRGwAAAAAAAAAAADUiNgAAAAAAAAAAACoEbEBAAAAAAAAAABQI2IDAAAAAAAAAACgRsQGAAAAAAAAAABAjYgNAAAAAAAAAACAGhEbAAAAAAAAAAAANSI2AAAAAAAAAAAAakRsAAAAAAAAAAAA1IjYAAAAAAAAAAAAqBGxAQAAAAAAAAAAUCNiAwAAAAAAAAAAoEbEBgAAAAAAAAAAQI2IDQAAAAAAAAAAgBoRGwAAAAAAAAAAADUiNgAAAAAAAAAAAGpEbAAAAAAAAAAAANSI2AAAAAAAAAAAAKgRsQEAAAAAAAAAAFAjYgMAAAAAAAAAAKBGxAYAAAAAAAAAAECNiA0AAAAAAAAAAIAaERsAAAAAAAAAAAA1IjYAAAAAAAAAAABqRGwAAAAAAAAAAADUiNgAAAAAAAAAAACoEbEBAAAAAAAAAABQI2IDAAAAAAAAAACgRsQGAAAAAAAAAABAjYgNAAAAAAAAAACAGhEbAAAAAAAAAAAANSI2AAAAAAAAAAAAakRsAAAAAAAAAAAA1IjYAAAAAAAAAAAAqBGxAQAAAAAAAAAAUCNiAwAAAAAAAAAAoEbEBgAAAAAAAAAAQI2IDQAAAAAAAAAAgBoRGwAAAAAAAAAAADUiNgAAAAAAAAAAAGpEbAAAAAAAAAAAANSI2AAAAAAAAAAAAKgRsQEAAAAAAAAAAFAjYgMAAAAAAAAAAKBGxAYAAAAAAAAAAECNiA0AAAAAAAAAAIAaERsAAAAAAAAAAAA1IjYAAAAAAAAAAABqRGwAAAAAAAAAAADUiNgAAAAAAAAAAACoEbEBAAAAAAAAAABQI2IDAAAAAAAAAACgRsQGAAAAAAAAAABAjYgNAAAAAAAAAACAGhEbAAAAAAAAAAAANSI2AAAAAAAAAAAAakRsAAAAAAAAAAAA1IjYAAAAAAAAAAAAqBGxAQAAAAAAAAAAUCNiAwAAAAAAAAAAoEbEBgAAAAAAAAAAQI2IDQAAAAAAAAAAgBoRGwAAAAAAAAAAADUiNgAAAAAAAAAAAGpEbAAAAAAAAAAAANSI2AAAAAAAAAAAAKgRsQEAAAAAAAAAAFAjYgMAAAAAAAAAAKBGxAYAAAAAAAAAAECNiA0AAAAAAAAAAIAaERsAAAAAAAAAAAA1IjYAAAAAAAAAAABqRGwAAAAAAAAAAADUiNgAAAAAAAAAAACoEbEBAAAAAAAAAABQI2IDAAAAAAAAAACgRsQGAAAAAAAAAABAjYgNAAAAAAAAAACAGhEbAAAAAAAAAAAANSI2AAAAAAAAAAAAakRsAAAAAAAAAAAA1IjYAAAAAAAAAAAAqBGxAQAAAAAAAAAAUCNiAwAAAAAAAAAAoEbEBgAAAAAAAAAAQI2IDQAAAAAAAAAAgBoRGwAAAAAAAAAAADUiNgAAAAAAAAAAAGpEbAAAAAAAAAAAANSI2AAAAAAAAAAAAKgRsQEAAAAAAAAAAFAjYgMAAAAAAAAAAKBGxAYAAAAAAAAAAECNiA0AAAAAAAAAAIAaERsAAAAAAAAAAAA1IjYAAAAAAAAAAABqRGwAAAAAAAAAAADUiNgAAAAAAAAAAACoEbEBAAAAAAAAAABQI2IDAAAAAAAAAACgRsQGAAAAAAAAAABAjYgNAAAAAAAAAACAGhEbAAAAAAAAAAAANSI2AAAAAAAAAAAAakRsAAAAAAAAAAAA1IjYAAAAAAAAAAAAqBGxAQAAAAAAAAAAUCNiAwAAAAAAAAAAoEbEBgAAAAAAAAAAQI2IDQAAAAAAAAAAgBoRGwAAAAAAAAAAADUiNgAAAAAAAAAAAGpEbAAAAAAAAAAAANSI2AAAAAAAAAAAAKgRsQEAAAAAAAAAAFAjYgMAAAAAAAAAAKBGxAYAAAAAAAAAAECNiA0AAAAAAAAAAIAaERsAAAAAAAAAAAA1IjYAAAAAAAAAAABqRGwAAAAAAAAAAADUiNgAAAAAAAAAAACoEbEBAAAAAAAAAABQI2IDAAAAAAAAAACgRsQGAAAAAAAAAABAjYgNAAAAAAAAAACAGhEbAAAAAAAAAAAANSI2AAAAAAAAAAAAakRsAAAAAAAAAAAA1IjYAAAAAAAAAAAAqBGxAQAAAAAAAAAAUCNiAwAAAAAAAAAAoEbEBgAAAAAAAAAAQI2IDQAAAAAAAAAAgBoRGwAAAAAAAAAAADUiNgAAAAAAAAAAAGpEbAAAAAAAAAAAANSI2AAAAAAAAAAAAKgRsQEAAAAAAAAAAFAjYgMAAAAAAAAAAKBGxAYAAAAAAAAAAECNiA0AAAAAAAAAAIAaERsAAAAAAAAAAAA1IjYAAAAAAAAAAABqRGwAAAAAAAAAAADUiNgAAAAAAAAAAACoEbEBAAAAAAAAAABQI2IDAAAAAAAAAACgRsQGAAAAAAAAAABAjYgNAAAAAAAAAACAGhEbAAAAAAAAAAAANSI2AAAAAAAAAAAAakRsAAAAAAAAAAAA1IjYAAAAAAAAAAAAqBGxAQAAAAAAAAAAUCNiAwAAAAAAAAAAoEbEBgAAAAAAAAAAQI2IDQAAAAAAAAAAgBoRGwAAAAAAAAAAADUiNgAAAAAAAAAAAGpEbAAAAAAAAAAAANSI2AAAAAAAAAAAAKgRsQEAAAAAAAAAAFAjYgMAAAAAAAAAAKBGxAYAAAAAAAAAAECNiA0AAAAAAAAAAIAaERsAAAAAAAAAAAA1IjYAAAAAAAAAAABqRGwAAAAAAAAAAADUiNgAAAAAAAAAAACoEbEBAAAAAAAAAABQI2IDAAAAAAAAAACgRsQGAAAAAAAAAABAjYgNAAAAAAAAAACAGhEbAAAAAAAAAAAANSI2AAAAAAAAAAAAakRsAAAAAAAAAAAA1IjYAAAAAAAAAAAAqBGxAQAAAAAAAAAAUCNiAwAAAAAAAAAAoEbEBgAAAAAAAAAAQI2IDQAAAAAAAAAAgBoRGwAAAAAAAAAAADUiNgAAAAAAAAAAAGpEbAAAAAAAAAAAANSI2AAAAAAAAAAAAKgRsQEAAAAAAAAAAFAjYgMAAAAAAAAAAKBGxAYAAAAAAAAAAECNiA0AAAAAAAAAAIAaERsAAAAAAAAAAAA1IjYAAAAAAAAAAABqRGwAAAAAAAAAAADUiNgAAAAAAAAAAACoEbEBAAAAAAAAAABQI2IDAAAAAAAAAACgRsQGAAAAAAAAAABAjYgNAAAAAAAAAACAGhEbAAAAAAAAAAAANSI2AAAAAAAAAAAAakRsAAAAAAAAAAAA1IjYAAAAAAAAAAAAqBGxAQAAAAAAAAAAUCNiAwAAAAAAAAAAoEbEBgAAAAAAAAAAQI2IDQAAAAAAAAAAgBoRGwAAAAAAAAAAADUiNgAAAAAAAAAAAGpEbAAAAAAAAAAAANSI2AAAAAAAAAAAAKgRsQEAAAAAAAAAAFAjYgMAAAAAAAAAAKBGxAYAAAAAAAAAAECNiA0AAAAAAAAAAIAaERsAAAAAAAAAAAA1IjYAAAAAAAAAAABqRGwAAAAAAAAAAADUiNgAAAAAAAAAAACoEbEBAAAAAAAAAABQI2IDAAAAAAAAAACgRsQGAAAAAAAAAABAjYgNAAAAAAAAAACAGhEbAAAAAAAAAAAANSI2AAAAAAAAAAAAakRsAAAAAAAAAAAA1IjYAAAAAAAAAAAAqBGxAQAAAAAAAAAAUCNiAwAAAAAAAAAAoEbEBgAAAAAAAAAAQI2IDQAAAAAAAAAAgBoRGwAAAAAAAAAAADUiNgAAAAAAAAAAAGpEbAAAAAAAAAAAANSI2AAAAAAAAAAAAKgRsQEAAAAAAAAAAFAjYgMAAAAAAAAAAKBGxAYAAAAAAAAAAECNiA0AAAAAAAAAAIAaERsAAAAAAAAAAAA1IjYAAAAAAAAAAABqRGwAAAAAAAAAAADUiNgAAAAAAAAAAACoEbEBAAAAAAAAAABQI2IDAAAAAAAAAACgRsQGAAAAAAAAAABAjYgNAAAAAAAAAACAGhEbAAAAAAAAAAAANSI2AAAAAAAAAAAAakRsAAAAAAAAAAAA1IjYAAAAAAAAAAAAqBGxAQAAAAAAAAAAUCNiAwAAAAAAAAAAoEbEBgAAAAAAAAAAQI2IDQAAAAAAAAAAgBoRGwAAAAAAAAAAADUiNgAAAAAAAAAAAGpEbAAAAAAAAAAAANSI2AAAAAAAAAAAAKgRsQEAAAAAAAAAAFAjYgMAAAAAAAAAAKBGxAYAAAAAAAAAAECNiA0AAAAAAAAAAIAaERsAAAAAAAAAAAA1IjYAAAAAAAAAAABqRGwAAAAAAAAAAADUiNgAAAAAAAAAAACoEbEBAAAAAAAAAABQI2IDAAAAAAAAAACgRsQGAAAAAAAAAABAjYgNAAAAAAAAAACAGhEbAAAAAAAAAAAANSI2AAAAAAAAAAAAakRsAAAAAAAAAAAA1IjYAAAAAAAAAAAAqBGxAQAAAAAAAAAAUCNiAwAAAAAAAAAAoEbEBgAAAAAAAAAAQI2IDQAAAAAAAAAAgBoRGwAAAAAAAAAAADUiNgAAAAAAAAAAAGpEbAAAAAAAAAAAANSI2AAAAAAAAAAAAKgRsQEAAAAAAAAAAFAjYgMAAAAAAAAAAKBGxAYAAAAAAAAAAECNiA0AAAAAAAAAAIAaERsAAAAAAAAAAAA1IjYAAAAAAAAAAABqRGwAAAAAAAAAAADUiNgAAAAAAAAAAACoEbEBAAAAAAAAAABQI2IDAAAAAAAAAACgRsQGAAAAAAAAAABAjYgNAAAAAAAAAACAGhEbAAAAAAAAAAAANSI2AAAAAAAAAAAAakRsAAAAAAAAAAAA1IjYAAAAAAAAAAAAqBGxAQAAAAAAAAAAUCNiAwAAAAAAAAAAoEbEBgAAAAAAAAAAQI2IDQAAAAAAAAAAgBoRGwAAAAAAAAAAADUiNgAAAAAAAAAAAGpEbAAAAAAAAAAAANSI2AAAAAAAAAAAAKgRsQEAAAAAAAAAAFAjYgMAAAAAAAAAAKBGxAYAAAAAAAAAAECNiA0AAAAAAAAAAIAaERsAAAAAAAAAAAA1IjYAAAAAAAAAAABqRGwAAAAAAAAAAADUiNgAAAAAAAAAAACoEbEBAAAAAAAAAABQI2IDAAAAAAAAAACgRsQGAAAAAAAAAABAjYgNAAAAAAAAAACAGhEbAAAAAAAAAAAANSI2AAAAAAAAAAAAakRsAAAAAAAAAAAA1IjYAAAAAAAAAAAAqBGxAQAAAAAAAAAAUCNiAwAAAAAAAAAAoOZ\\/2gMAAPyEu\\/YALPJLktv2ELBSvyQ5X3D97W8\\/Ywt2mX5XV\\/\\/yNz\\/u7re\\/P\\/7253NtEiCZ1m\\/rGA\\/5mOS6PQQAAADAEr\\/79u1bewYAgKd4m+Qv7SFY7A8RRMBTXSX5+8Kfcar\\/984zvT\\/sMv2eXlWnOU33mcK2X7KdEBJGcZ7k\\/9pDMLQ\\/RcQGAAAArJyd2ACAtXnbHoCjOGSKTYAft3T9u89pBWyXmX4n+4jWXsJFkne\\/\\/bnPtI7fJvlSnAm2wudfHnNoDwAAAACw1O\\/bAwAAPJGHeKfhdfxbwlMt\\/T9zCrtnnWeK1j4m+UeS\\/42AreEiyYdMUaSdf+D57doDMLT7TO+LAAAAAKvmOFEAYE12Sf7aHoKjuc907J9dfOBxl5mirSX+mPU+5L7MFK9dJzmrTsL3fMoUWX4uzwGn6kusfTzMUaIAAADASbATGwCwJnbuOi0X8cANftQxjhJdY8B2numItH9k2vlLxDGmV5nuL+\\/TcHxvY+1j3qE9AAAAAMAxiNgAgDXxcPz0fMi0Gxswb7\\/w+jUeJXqTaWevd90x+EFnSf6S5fcq8O98\\/mXO16wzUgcAAAD4LyI2AGAtrjLt3MXpuW0PAIM7z7TT1RJrith2meI1O6+t058jZINjErExZ03v7wAAAACzRGwAwFrs2wPwbF7Hvy\\/MWRowfE1yd4Q5ntt5pqj1rxEtr91t7LIJx3AVMS\\/zRGwAAADAyRCxAQBrsWsPwLO6zRSwAP9tacS2hgfcV5mOQ3vfHoSjOMt031nXYZl9ewCG9jXreI8HAAAA+CEiNgBgDS6z\\/Cg9xnaW5KY9BAzoPMmbhT9j9Afc+yR\\/j93XTs1FrOuwlKNEmTP6+zsAAADAk4jYAIA18ABvG97H8XPwn45xlOjID7kPSf7cHoJn8z5TiA483VXEvcy7aw8AAAAAcEwiNgBgDfbtAXgxt+0BYDC7hdffHWGG53CeKa571x6EZ3fTHgBWypc4eMzIkToAAADAk4nYAIDRXcZRolvyOsl1ewgYyNKIYcQH3OeZ4rqlx6SyDu9iNzb4GSI25vya5Et7CAAAAIBjErEBAKPzAG97bjJFLrB1b5OcLfwZo0Vs\\/wzYxMnb4r0cnuYy1knmjfb+DgAAALCYiA0AGN2uPQAv7iyOFYVkefgz2i4tArbt2rcHgJURfvIYERsAAABwckRsAMDIzuO4ua16FwEjnNpRorcRsG3Vq9hhE55i3x6AoX3KWJE6AAAAwFGI2ACAkdmFYtvsxsaWXWX5UaJ3R5jjWG4zxals1649AKzEeQS\\/zDu0BwAAAAB4DiI2AGBkIrZte5Xkuj0ElOwXXv8pyeflYxzFPsn79hDUXbUHgJXw+ZfHjLbTKgAAAMBRiNgAgJE5SpSbOIKObVoaMRyOMcQRXMWuikxEbPBjRGzMGSlSBwAAADgqERsAMCoP8Eim4xQP7SHghV0luVj4M0bZpeWQ5ceichoEyfC48\\/gSB\\/NGeX8HAAAAODoRGwAwKhEb\\/\\/Qmya49BLygpevfKLu03GQ6FhiAH+PzL48RsQEAAAAnS8QGAIzKQzz+1aE9ALygpevf3TGGWOgqyYf2EAAr4\\/Mvc+6TfGwPAQAAAPBcRGwAwIjexvFz\\/LuLTLs6wam7zPLdyw7Lx1jstj0AwArt2gMwNLuwAQAAACdNxAYAjGjXHoAhXWcKfOCULd2FZ4RdWvZJXpdnAFgbX+LgMYf2AAAAAADPScQGAIzIUUp8z1ns7sTp2y+8foRdWm7aAwCskM+\\/zBkhUgcAAAB4ViI2AGA0V5mOjoTveRM79XG6LrP8KNF2xLaPNZzv+9weAAYnYmPOXXsAAAAAgOcmYgMARrNvD8DwDknO20PAM9gtvP5r+g+5b8qvz7g+tweAge3iKFHmtSN1AAAAgGcnYgMARmMXCh5zkeS6PQQ8g6XrX\\/sB9z52YeNhjsGDh\\/n8y5yv6b\\/HAwAAADw7ERsAMJLLCCD4MR8y3S9wKs4zHZe7RPsBt7iUOSI2eJiIjTnt93cAAACAFyFiAwBG4gEeT3FoDwBHtHT9a+\\/ScpXkVfH1Gdt9HCcKD7mKL3EwT8QGAAAAbIKIDQAYyb49AKvyOsJHTscpHCUKD7lrDwAD27cHYHh37QEAAAAAXoKIDQAYxWXs4sPT3WY6hhHWbrfw+rsjzLDEvvz6jO2uPQAMbNcegKH9muRLewgAAACAlyBiAwBGYUctfsZFkuv2ELDQ2yRnC39Gcye2XZbPz2lr7xQIo7qML3Ewz\\/oJAAAAbIaIDQAYxa49AKv1IclVewhYYGnE296lRYTMnPb9CSOzfvIYERsAAACwGSI2AGAE50netIdg1W7bA8ACSyOG9gNuEQZz2vcnjGzfHoCh\\/S0iYAAAAGBDRGwAwAgEECz1Oh4Es067rPso0atMx\\/rCQ0Rs8H2XcZQo86yfAAAAwKaI2ACAEYjYOIbbTLv6wZosXf8+pbtLy7742oyvfX\\/CyHbtARieiA0AAADYFBEbANDmKFGO5SzJTXsIeKKlEdvhGEMssCu\\/PmM7tAeAgfkSB3M+JfncHgIAAADgJYnYAIC2XXsATsr7TMcbwhoc4yjO5i4tl3EUHvPsIgTf50scPObQHgAAAADgpYnYAIA2u1BwbLftAeAH7Rde396lxfrNnPb9CSOzfvIYETAAAACwOSI2AKDNQzyO7XWWx0HwEnYLr28\\/4N6XX5+xte9PGJnPv8y5jwgYAAAA2CARGwDQ9DbJWXsITtJtpqO6YFSXWX4Up6NEGZmIDR62aw\\/A0KyfAAAAwCaJ2ACAJrtQ8FzO4lhRxrZ0\\/btP8vEYg\\/ykXfG1GV\\/7\\/oSR+RIHjzm0BwAAAABoELEBAE279gCctHdxjzGu\\/cLr27u0iJCZ074\\/YWTWT+aIgAEAAIDNErEBAC1XSS7aQ3Dy7MbGiC6z\\/CjOw\\/Ixftp5kjfF12d8h\\/YAMDARG3NEwAAAAMBmidgAgJZ9ewA24VWS6\\/YQ8B92C6\\/\\/mu4uLQIM5rTvTxjZLo4SZd5dewAAAACAFhEbANAiguCl3GTaOQpGsXT9a+\\/Ssiu\\/PmNr358wMp9\\/mfM11lAAAABgw0RsAECDo0R5SWdxrCjjOMZRnO0H3CIM5rTvTxiZ9ZM51k8AAABg00RsAEDDrj0Am\\/Mu7jvGsDRgaO\\/S8jaOwuNh7fsTRuZLHDzG+gkAAABsmogNAGjYtwdgkw7tASDrP0rULkLMad+fMLJ9ewCGZw0FAAAANk3EBgC8tMskr9pDsEkXSW7aQ7B5u4XX3x1hhiVEbMy5aw8AA9u1B2Bov7YHAAAAAGgTsQEAL00AQdN1ppASGo5xFGdzl5arOEqUeXYRgu+7jC9xMM\\/6CQAAAGyeiA0AeGkiNprOkty2h2Czlq5\\/vyb5coxBftK++NqMr31\\/wsh8\\/uUxIjYAAABg80RsAMBLOk\\/yuj0Em\\/cmjvSiY2nE0H7ALcJgTvv+hJHt2wMwNBEwAAAAQERsAPw\\/e3d4HUdypQn7nT3zn1gLWGMBMRawPgvItaBLFgiyQGgLBrJgqi2YpgVbtGBICwawYAkL9P1I8ajVIqIARFbdyKznOUdn9uxM4V5J0VFAxptx4bwEIBjFvroBLs4aRom+LazP+ITY4Mc2MUqUtkN1AwAAAAAjEGIDAM5JiI1RvE1yW90EF2Xb+fnPqb2lxf5Ny9e4RQiesq1ugOEJAQMAAABEiA0AOJ+rTGMcYRR\\/znQ7CpyDUaKs2b66ARiY\\/ZOWr0nuq5sAAAAAGIEQGwBwLtvqBuAH9tUNcBHmGMVZGWLbxCg82qpDljAqL3FwzL66AQAAAIBRCLEBAOfiFgpG9D7WJqe36\\/x89S0t\\/hmhpXp9wsjsnxwjBAwAAADwN0JsAMC5OMRjVHeZbkqBU+nd\\/\\/ZzNNFhV1yfsQlgwNP8\\/kuLEDAAAADAbwixAQDn8DHJm+om4Alvk9xUN8FqbdI\\/SvTQ38arXcUoUdqE2OBp2+oGGNqhugEAAACAkQixAQDn4BYKRvfnTGEjmFvv\\/veQ5MscjbyS\\/ZuW6vUJI\\/MSB8fsqxsAAAAAGIkQGwBwDkIQLMG+ugFWadf5+epbruzftFSvTxiZ\\/ZMWIWAAAACA3xFiAwBO7TpuoWAZ3qc\\/cAS\\/tUn\\/KM59fxuvdpXkQ2F9xifEBk8TYqPF\\/gkAAADwO0JsAMCp7aobgBe4yxTcgTksfZTotrA243tIcqhuAga1jZc4aBNiAwAAAPgdITYA4NTcQsGSvElyW90Eq7Ht\\/Pxhhh562L9pEcCAp9k\\/aXlM\\/Xc8AAAAwHCE2ACAU7pO8ra6CXihP2Zau9BjjlGc1SGhbXF9xnZX3QAMTIiNlurvdwAAAIAhCbEBAKfkAI+lEs6gV+\\/+95jaQ+6rCCHztM9J7qubgEF5iYNjhNgAAAAAfkCIDQA4JSE2lup9kl11Eyxa7\\/5XfcDtNkJabqsbgIHtqhtgaNUhdQAAAIBhCbEBAKeySfKuugnocJfpNip4jaWPEhVi4ymfkxyqm4CBbasbYGiH6gYAAAAARiXEBgCcilvYWLo3MVaU15lj\\/zvM8DN6CHDylNvqBmBgm3iJg7bqkDoAAADAsITYAIBT2VU3ADP4KW5U4eV6Q2yfknybo5EOQmz8iFvYoM1LHBwjxAYAAADwBCE2AOAUruIWCtbDbWy8VG+IYYQDbuNE+ZHb6gZgcLvqBhjaCCF1AAAAgGEJsQEAp+AWCtbkXZKb6iZYjI+ZRtH2GCHEBr\\/3S9zCBi2beImDNt\\/vAAAAAA1CbADAKQixsTa3MV6R59l2fv5z3NLCeB4jzAvHbKsbYHiH6gYAAAAARibEBgDM7SrJh+omYGZvYqwoz7OGUaJJcl\\/dAEPZRbgSjvESBy1f47sVAAAAoEmIDQCYmwM81uqnuGWFtuskbzt\\/hhAbo\\/kl46xLGJWXODhmX90AAAAAwOiE2ACAuW2rG4AT2lc3wNB2nZ8f6ZYWt26RTGvSGFE4zkscHCMMDAAAAHCEEBsAMDeHeKzZ2yS31U0wrN79bz9HEzP5Ut0A5R5jjCg8l99\\/aRkppA4AAAAwLCE2AGBOH5O8qW4CTuwmyaa6CYazplGiSXKoboByHyPMCM+1rW6AoY30\\/Q4AAAAwLCE2AGBObqHgErxJclfdBMPZdn7+IePd0vK1ugHK\\/CGCjPBcXuLgGCE2AAAAgGcQYgMA5iTExqX4ELeu8I92nZ8f8YB7X90AJf4Q\\/93DS\\/j9l5aHuNUSAAAA4FmE2ACAuVzHLRRcln11Awxjk+Rd58\\/Y97cxuxGDdZyWABu8nBAbLb5LAQAAAJ5JiA0AmMuuugE4s7dJbqubYAi9AcI29jkAACAASURBVIZRb2m5T\\/KpugnORoANXm4bL3HQtq9uAAAAAGAphNgAgLm4hYJL9OdMt3Bx2Xr3v5FvabmrboCTe4wAG7yW339pecyYIXUAAACAIQmxAQBzuM50KxVcon11A5S6SvK+82ccZujjVA5xG9uaPWa6SWpf2wYslhAbLSOH1AEAAACGI8QGAMxhV90AFHofh9iXrPe\\/+8eMf8h9k6lP1uVzppsk3RIEr+MlDo4Z\\/fsdAAAAYChCbADAHLbVDUCxu0w3cnF51jxK9Lv7TEE21uPnTN\\/d34r7gCXbVTfA0JYQUgcAAAAYihAbANBrk+RddRNQ7G2EfC7RVZIPnT9jKQfc+yS\\/VDdBt69J\\/j3JbXEfsAbb6gYY2lK+3wEAAACGIcQGAPQyRhEmf84U6uRybGf4GUs65N5FkG2pHjPdvnYd40NhDpt4iYO2Q3UDAAAAAEsjxAYA9NpVNwAD2Vc3wFn1hng\\/zdLFee0iyLY0v2QK3NzWtgGr4iUOjllSSB0AAABgCEJsAECPTdxCAb\\/1PoKdl6Q3xLDUA+5dkj9VN8FRvyT5t0z\\/fX2rbQVWZ1fdAEP7FPsuAAAAwIsJsQEAPbbVDcCA7pJcVTfByX1M8qbzZyw1xJZM6\\/zfk3yuboR\\/8H1s6Pfw2n1lM7BSm3iJg7Ylf78DAAAAlBFiAwB6GKUE\\/+xNjO27BHOMEl36LS1fMoWZ\\/5DkobaVi\\/dLkv+TKUB7G+E1OKVtdQMMT4gNAAAA4BX+5a9\\/\\/Wt1DwDAMl0l+X\\/VTcDA\\/j1TyId1uk\\/ytuPzf8p0m9mafMx0+9eH4j4uwUOSQ6aghLAEnNevsc\\/xtK9JrqubAAAAAFgiITYA4LV2Sf6zugkY2Oe4rWWtrpP8d+fP+Les97asq0xrf5vpP6vr9I9evWRfM62VL7\\/5131hP3DJvMTBMWsMqQMAAACcxb9WNwAALJZRotD2PlPYc1\\/bBiew6\\/z891DSWn3Lj28I2\\/ztXzzPoboB4J\\/4\\/Zdj3I4JAAAA8EpuYgMAXutb3KwDxzxmCu18K+6Ded3HKFGAS2SUKC1GiQIAAAB0+F\\/VDQAAi\\/QxAmzwHG8irLQ21+kLsCVuaQFYqm11AwxtX90AAAAAwJIJsQEAr2GUEjzfT3HovSbbzs8\\/ZN2jRAHWykscHHOobgAAAABgyYTYAIDXEGKDl3Eb23rsOj\\/vFjaAZfL7Ly0PSb5UNwEAAACwZEJsAMBLbeMWCnipd0luqpug2ybTf5c99v1tAFBAiI0WIXUAAACATkJsAMBLOcCD17lNclXdBF169z+3tAAs0zZe4qBtX90AAAAAwNIJsQEALyXEBq\\/zJsaKLt2u8\\/NuaQFYJr\\/\\/0iKkDgAAADADITYA4CWuk7ytbgIW7KdMt7mwPFfpHyUqxAawTEJstByqGwAAAABYAyE2AOAldtUNwAq4jW2ZegMMj3HIDbBEXuLgGCF1AAAAgBkIsQEAL7GtbgBW4F2S2+omeLHeEJsDboBl2lU3wNAe4zseAAAAYBZCbADAc23SP0oPmNxk+meKZbhK8qHzZzjgBlimbXUDDM33OwAAAMBMhNgAgOfqvYUI+Ls3MVZ0SeYYJeqQG2B5NvESB22+3wEAAABmIsQGADzXrroBWJkPcbvLUmw7P3+YoQcAzs9LHBxzqG4AAAAAYC2E2ACA59jELRRwCvvqBniW3hCDW1oAlmlX3QBD+5TkW3UTAAAAAGshxAYAPIdbKOA03ia5rW6Cpo+Zxr\\/2EGIDWJ5NvMRBm+93AAAAgBkJsQEAz7GtbgBW7CbTQTlj6g3xuqUFYJm21Q0wPCE2AAAAgBkJsQEAx1wl+VDdBKzYmxgrOjKjRAEuk5uIafkcIXUAAACAWQmxAQDHOMCD03sf\\/6yN6Dr9o0QPM\\/QBwHl5iYNjhNQBAAAAZibEBgAcI1gD53GX6dCccew6P\\/81yX1\\/GwCcmd9\\/OUaIDQAAAGBmQmwAwDFuoYDzeJvkproJ\\/kFviGE\\/RxMAnJ0QGy1C6gAAAAAnIMQGALQ4wIPz+nOSTXUTJJlGib7t\\/BluaQFYpm11AwxtX90AAAAAwBoJsQEALUJscH776gZI0r\\/\\/uaUFYJk+JnlT3QRDE1IHAAAAOAEhNgCgRYgNzu99\\/LM3gt7\\/Dg5zNAHA2fkOpuUhQuoAAAAAJyHEBgA8xS0UUGef5Kq6iQu2SfKu82fs+9sAoIAQGy1uYQMAAAA4ESE2AOAp2+oG4IK9SXJb3cQF6w0wPCT5MkcjAJzVNl7ioG1f3QAAAADAWgmxAQBPcQsF1PpjkuvqJi7UrvPzbmkBWCa\\/\\/9IipA4AAABwQkJsAMCPXCd5W90EkLvqBi7QVfpHiQqxASyTEBstvt8BAAAATkiIDQD4kV11A0CS5H3883huvQGGxySHGfoA4Ly8xMExh+oGAAAAANZMiA0A+BG3UMA47jLdDsZ59O5\\/bmkBWKZddQMM7TG+4wEAAABOSogNAPi9TdxCASN5k+S2uokLcZXkQ+fPcMANsExe4qDF9zsAAADAiQmxAQC\\/5wAPxvPHJNvqJi7AHKNEHXIDLM8mXuKgzfc7AAAAwIn9a3UDAMBwdp2ff8x0cxQwr7sk19VNrNy28\\/PVB9x3mQKP8COfcxlh2E2mvfL6b\\/\\/vTaZbFt+VdcS5PST5kuSQZJ\\/k2zM+4yUOjqn+jj+Hbf6+d17H3glr9DXT9+Ihf\\/+ufM73JG2\\/\\/d3z+\\/55Hc\\/GgD7\\/nmmvBoCL8i9\\/\\/etfq3sAAMaxSfI\\/nT\\/j\\/8t0yONhHczvT5mCSpzGt\\/TtXX\\/IFJioch83CfG0n7PO0cTXmYIX3\\/\\/l9w9+7y+Z1n7rkP5LhHV42qesM+j4MX\\/fO61\\/uFxfM\\/0Ns49A23P5\\/RM4tYdMz+kB4OIIsQEAv3WT5D86Pv\\/9D+yPSf5rjoaAf\\/CY6Z8xhwvzm2Pf+t+p++\\/mOsl\\/F9VmGdb0Fvd1pptjP0Zwk+d5yLRefvTPwCb9L3GwbtUh9Tl9\\/M2\\/hC6A33rM9ELibaaXY\\/hHfv8EzukvmZ7TA8DF+V\\/VDQAAQ+m9YeDX3\\/zPz50\\/C\\/hnb+ImtlPp3f8+pTZcuCuszfi+j1dcsqtMD\\/HvMwU2\\/xgHiDzf20wj0340lnuNN2wxr6WPEt3k77cR\\/leSnyLABvyzN5n2hy9Z5+29r3GV6e+sL\\/H7J3Be++oGAKCKEBsA8N1VkvedP+O3Bzy7zp8F\\/NhPmUaWMK+5QrxVtsX1GVv1+uyxyRTevc90W6yDQ17rTaYg29Xv\\/v+3Z++EJakOqffYZDoA\\/Z8kf47gGvA8bzLtGV9yuaPsrvL3G+n+M0YuA+f1mOW\\/hAYArybEBgB81xvgeMx0MPjdfZKfO38m8GNuY5vXNv0Hu5UhoU0crNC2r27gFa4y7XX\\/k+nWC+EL5vD7G02vknwo6oVlOFQ38Aqb\\/D289lNpJ8CSvcsUovjRLaZr9dvwmvAvUGXJL6EBQDchNgDgu1PcQnSXaYQZMK93MeJlTr3739fU3tJiFB4tS3yL+zbT4eEfa9tgpX7K32+WsX9yzJIOEX8b\\/hVeA+bw\\/RbTS\\/i+3EV4DRjDkn7\\/BIDZCbEBAMk8t1D86A\\/sb0luOn8u8GM3udzxLnPrPZTZz9FEh11xfca2pAfg20yBO4eHnNr3308v4VCe1\\/uaKdCwBB8z7Z\\/Cv8Dc3mT6e2etN7JdZwrq\\/Wf8\\/gnUe8yy\\/oYHgNkJsQEAyXRo3KP1B\\/avST53\\/nzgn\\/1+JBqvc53kbefPMEqUkS3lAfhdkv8b65nz+H4Qb5QoLfvqBp7hKtM+\\/1\\/p\\/30G4Cnfb2S7Ku5jbjdJ\\/jvJ++pGAP5mKX+\\/A8DJCLEBAEn\\/LRSHI\\/\\/7XefPB37sQ\\/pDqJdu1\\/n56lta3CJEyxLe4t7E7UGc3\\/vYPzlu9P3zOtP+KYwJnMObjL8vPtdVpudY\\/1HcB8DvHaobAIBqQmwAQNJ\\/iHfsQeZ9kp87awA\\/tq9uYOG2nZ+vPsjZFtdnbNXr85jv4+\\/cvkYFITZaqkPqx+wy3R7k9jXgnNYQAr\\/OtL+7fQ0Y0eh\\/wwPAyQmxAQAfM71R2+M5f2DfJnnorAP8s7eZ\\/vni5TbpD89UPmC8ittXaBv5AfhNpvF3vb+DwGst\\/RCe0zpUN9CwT\\/Kf1U0AF+uuuoEOu0z7u98\\/gRF9SvKtugkAqCbEBgD0HuC95A\\/sXWct4MduMgWyeJne\\/e8h0y1SVQQwOOZQ3cAT9jG+iXoOsGnZVzfwhH2Sn6qbAC7a2yzz2c4uUwDY9z8wqpFfQgOAsxFiAwC2nZ9\\/yR\\/Yh0yhN2BebzLuYevIdp2fr37AKMRGy6hvce8jgAGMrTqk\\/iNXmf6Wsn8CI7ipbuCFdnGDJTC+6mdMADAEITYAuGzXmd6i7XF44f\\/9TZLHzprAP3sfoaaX2KR\\/lOi+v40uRonSMuID8H0EMIDxjbh\\/\\/prpdz2AEbzL9DxpCXYRYAPG9zVjvoQGAGcnxAYAl23X+fmvSe5f+Jn7JHeddYEfu8t0UwfHbTs\\/\\/xijRBnbaCGMfQTYgGUYcf8UYANGs4S\\/R3YRYAOWYV\\/dAACM4l+rGwAASvU+dNy\\/8nO3mR4m9t4CB\\/yjt5luO7wt7mMJeve\\/6gPuJRwaUedzxnqL+yYCbLze99Dw4Yn\\/\\/TYCPsznMS+\\/afqU9rF\\/0udzphfJ7n\\/wv9vG\\/snrbasbOGIXATbqPGTad79k+rvsW8YbVc5YrA8A+Jt\\/+etf\\/1rdAwBQ4zrJf3f+jH\\/Ly29i+26b5P921gd+rOefzUtwleT\\/df6M\\/5PaINu3JG8K6zO2P2WcW08\\/Jvmv6iZYnK+ZwjuHPO9A5yrTWruLvZE+v6T\\/tuq57CKAwcs9ZPod9dc8L5D5ff+8jZfMeLl\\/qW7gCdeZ1r\\/fCTiH7wH47y9dHAp7AQBYPCE2ALhcN0n+o+PzXzM9GOyxj5sF4BQ+Z\\/w34yvt0nco\\/Jjasa1CQRwzSpDVASIv9Uv+Hl57jau\\/ff7DPO1wgapD6t\\/N8cIRl+Vzpv1v\\/8rPX2UKsv1xnna4EP+e8W4PusrUk1Amp\\/TSwDAAAM\\/0v6obAADK7Do\\/P8fhzk2mMAgwr\\/cxbrJl6aNEt8X1GdvXjBFg+x4mEmDjOT5nOgjfpe8g8FumPf6X\\/pa4QI+p\\/45Ppv3zUN0Ei\\/GQ5A+Zfj\\/cd\\/ycb5n+Pv9Df0tckMoXe57yawTYOJ1fMgXeN5n2zENlMwAAayTEBgCXaZPkXefPmOOA51umt72B+e0z5qHCCLadnz\\/M0EMPAUVa9tUN\\/M1t+n\\/XYP0eM42\\/3Wbem1x2EWTj5Q7VDfzNPgLAPM8vmW7t28\\/4M\\/dJfp7x57Fum+oGfucm0wtdMKfHTPvi\\/870O+YIgXcAgNUSYgOAy9QbgHjIfAeNd5lujQHm9SZCoj\\/yMf0Hw5UPra\\/jZgHaDtUNZAokGUfGMQ+Z1srdiX7+zd9qwHONcCj9McbhctxjphvTdpleDJvbbfyNzvNsqhv4jU38\\/cu8vofXNpnW1in2WwAAfkeIDQAu02ij9G5m\\/nnA5I+ZQk\\/8Xe\\/+9ym1D693hbUZ35wh8x776gYY3tdM30+nXK9u\\/OWlqkNs38cwQ8tj+keHPoe\\/0VmafdxiyXyE1wAAigixAcDluUr\\/eIX9DH381iFGPsGpnOqGm6UaLcT7UkaJ0lK9PpPpoMdtgbR8zRTAOMeB4D5T4AOOqQ6pJ9PvbAIYtHwPsJ0jsH6I29hYjl2MEWUen5P8W4TXAADKCLEBwOXpDUA85jQPzW\\/ikBFO4X3c3vXdNsseJbqJcBBt++L6m7i5hbbvAYxzHgqOEO5kfNXr5DrJT8U9ML6POe+Nq9X\\/XDC+EUI+V3HzKv0ek\\/wp0++p96WdAABcOCE2ALg8o95C9C0OvuFU7jI93L90vfvf59Qe1LiFjZYRRonexi1CtG1z\\/n30\\/sz1WKZDcX0353LMn3L+dXrueixP9e+eyfQcyYs+9Ph+S7DvYgCAAQixAcBluUryofNnnPJt7H2mkAgwrzfxdnoyboj3uXbF9Rnbobj+Jm4Rou3n1Bx2HwpqsixfUxt23MYYPNo+R7gCfuQqXoakzy+ZbkMdIZAJAECE2ADg0swxSvTUIQ4PIOE0\\/pjpkPRSXaf\\/Df3qUaLvCuszvuqQ5W1xfcb2EGuEce2L698W12d8u+oG4AmH4vo3cQswr\\/eH2F8BAIYjxAYAl2Xb+flzHJB\\/SfKXM9SBS3TJNzjsOj9ffUuLUaK0nCNk3nIVt7DRtiusvS2szTJUh9TdwkbLzzEWmTE9VDcQASRe5zHJ\\/0l9iB0AgB8QYgOAy9IbgjjM0cQz3GZ6qATM610u97bD3v1vP0cTHbbF9Rlb9S1sl7qv8DxfU3tTy6awNuOrDqnfFtZmGSpfQrkurM34qscv7tJ\\/0zaX5zHT39bVfz8BAPAEITYAuBwf0z9m4VwPeb7FgTicym2mW5MuySb9BxyH\\/jZe7SrJh8L6jK\\/6EGZXXJ+xVd8C6iZLWqpvsbQ+afkl09\\/GVbaFtRnfobj+rrg+y\\/M9wFYdwAQAoEGIDQAuR+8Byaec9wH6PsnnM9aDS\\/Em9YGCc+vd\\/x5S+6DbATfHHAprb+MWDJ72mNqbLHfpf4mDdasMsc3xkhHrVvk7+yZeoqDNKGaWRIANAGAhhNgA4HL0hiAqHlDuCmrCJfgpl3Wzwq7z89W3XAmx0XLukPnv7QprM77q\\/XNbXJ+xCakzMuuTkT2kdhSz9clL3USADQBgEYTYAOAyXGc5o0R\\/6z7JzwV14RJcym1smyTvOn\\/Gvr+NLm7BoKU6JOQQkRbrk5FVjxL1\\/U5L9f65La7P2KrX5664Psvyp9T\\/TQ8AwDMJsQHAZdh1fv5r6m55ucv0li8wr3dJbqubOAOjRFm7ykPEOULyrNuhsLZRjRyzL6zt+51jDoW1hSw5Zl9Ye5P+l5S4HL\\/kcl7gAwBYBSE2ALgMvYck+zmaeKVvma79B+Z3k+kQYM22nZ8\\/zNBDD4fctHyOUaKMq3rUrf2TlscIqTOux9SG1K1PWrzkw1J8jeeJAACLI8QGAOt3neRt58+oHhXxa6aDemBeb7Lut5LnuEWiev9zSEOL9cnIrE9GVr0+t8X1GVv1+rR\\/0lK9PrfF9VmGx0wv3FS+UAEAwCsIsQHA+vU+gP6a5H6GPnrtqhuAlfqQ9R4E9O5\\/I9yCYRQeLdWjRHtD8qxb5frcxv5Jm+93Rla5Po0S5ZhDYW3rk+e6Te2NgQAAvJIQGwCsX2+Io\\/ot2+\\/uk\\/xc3QSs1L66gRNZ+v7nFgxaqkPm1ict1aNurU9aRgipQ0t1CBieYv9kCT5n3TfOAwCsmhAbAKzbJsm7zp9RHeL4rdskD9VNwAq9zfTP19osfZTotrg+Y9sX13eISEv1\\/ml90mJ9MrJPxfWtT1rsnyzBTXUDAAC8nhAbAKxb7wO+h4x3\\/f6uugFYqZtMwde1mOOA4zDDz3gtoxo55lBYe5P+kDzrZtQtIzsU1t7GKFHahIQYWfX6NEqUY37JeM8xAQB4ASE2AFi3Xefnqx9Q\\/sgh9W+nwxq9ybpGbvQewH1K7Si8XWFtxlcdMnfATUv1qNtdYW2WwSg8Rla9PoUsaalen9DyGLewAQAsnhAbAKzXVfpvSdnP0Mcp3GR6OAXM60PWczjQ+++jOsS7lv8eOI3q9bkrrs\\/Y9sX1t8X1GVt1SN33Oy3WJyOrfpnQ+uSYu9TuoQAAzECIDQDWq\\/cB32PGvYL\\/Puu6MQpGcpcpBLtkc9wiYRQeI9sX1p4jJM+6HQprb2J90ub7nZEdiutvi+sztuqXKITYaHmM54QAAKsgxAYA67X0W4iOuc00Tg2Y19ssfwTHtvPzn1P7Bve2sDbjM0qUkVmfjK7yb5xdYW2WQciSkVWPEjXqlpZ93MIGALAKQmwAsE5XmcYC9hg9xJY4CIJT+XOm22yWaukh3l1xfcZWvT6FhGipXp+74vqM7WuMamRcXzPdOF5lV1ib8Rl1y+jcwgYAsBJCbACwTnOMEq0+hHyOQ5JfqpuAldpXN\\/BKc9wiUbn\\/bWIUHm2HwtpzhORZt31h7U3sn7TtC2tv4pYr2vbF9YWEaDkU198W12dsn1IbAgYAYEZCbACwTtvOzy8hwPbdTabQHTCv91nmYdau8\\/PVt2As8T9zzqc6ZG590lI9SnRbWJtlsH8yMqNEGZn1yciW9AwTAIAjhNgAYJ2WPkrvJb4lua1uAlbqLtPNS0vSu\\/\\/t52iig0NuWqq\\/n7fF9Rnbobi+\\/ZOW6pD6rrA243tI7frcFtZmfPZPRvaY+r\\/hAQCYkRAbAKzPxyRvOn\\/GYYY+zuku04NVYF5vs6yQ6CbLHiV6lekGPHhKdYhNSIiW6v3TqFta9oW1NzHqlrbq7\\/ddcX3Gti+u7\\/dPWqr3TwAAZibEBgDr0\\/uA71Om282W5qa6AVipP2Ya4bIEvftf9S0YDmg4pnoUXm9InvUy6pbRHQprW58csy+svYmQJW1GiTKyQ3UDAADMS4gNANbnkkaJ\\/tYhyS\\/VTcBK3VU38Ey7zs9X738OuWn5VFzf+qTF\\/snIHpJ8Kay\\/LazN+KrXp\\/2TluqXfLaFtVmG6t9BAQCYmRAbAKzLNv23pCz5AdBNpptAgHm9z\\/hjhjbpv0Vi39\\/GqxmFxzHV388OuWmpXp\\/b4vqMzahbRla9f\\/p+p6V6fe6K6zO2pU6SAACgQYgNANal9wH05yz7AdC3GCsKp3KX6SB2VHOMEnVLCyOrPETcxihR2g6FtY265Zh9YW0BIY45FNa+yvSyCjxlX1h7E6NuaasOWQIAcAJCbACwLpc6SvS39pnCeMC83iS5rW6iYen7n0NuWqpvGbA+abE+GVl1SN36pOUxtb+DWp+02D8ZXfXf8AAAnIAQGwCsx3WSt50\\/Yy0PgNzGBqfxx0x7zWjmuEXiMEMfPRzS0HIorm990lL9+6P1ScuhuL5RorTYPxmZ9cnIvmbZkyQAAHiCEBsArMeu8\\/Nfk9z3tzGEL0n+Ut0ErNS+uoEf6D3gGOEWDKPwaKlcn3OE5Fk3o24ZWfX3O7RUrs+rCFnSdiisbdQtx+yrGwAA4DSE2ABgPbadn9\\/P0MNIbjMFU4B5vct4tx0aJcqaVYfMd4W1Gd\\/nGCXKuEYIqUNLdQgYnmL\\/ZHTVf8MDAHAiQmwAsA6bTMGSHof+NobyLeMFbWAtbjO9HT+COW6RqH4Avi2uz9j2xfW3xfUZW\\/X+6ZCbFuuTkX0qrm990mL\\/ZGTVL\\/kAAHBCQmwAsA69D\\/geMo3gXJt9phtCgHm9SXJX3cTfbGf4GUY1MrLK9blJf0iedbN\\/MrLqW4SMuqVFSIiRGXXLyPbVDQAAcDpCbACwDrvOz1c\\/QD+lXXUDsFI\\/ZYwbmnoP4KpvwdgV12dsD6m9ZcABNy3Vt2DsCmuzDIfC2tvC2iyDkCWjqh4lui2szTIcqhsAAOB0hNgAYPk26b8lZd\\/fxrDuk\\/xc3QSs1Ai3sfWGbKpDvEJCtFSvz11xfca2L66\\/La7P2D4l+VZY3\\/c7LdYnIzsU17c+aVnrJAkAAP5GiA0Alm\\/b+flLeAB0l+nfJzCvd0luCuvPcYuEUXiMbF9YexOjRGkz6paR+X5nZIfi+tvi+oyt+iUKITZaqtcnAAAnJsQGAMvX+4DvMEcTg\\/uW2qANrNltpjBBhTlGiVbegrEtrM34qkPm28LajM+oW0ZXeci9K6zNMghZMjKjbhnZvroBAABOS4gNAJbtKsmHzp9xKW8x\\/prkc3UTsEJvUjdWdNv5+cMMPfTYFddnbNXfz0JCtFSvz11xfcb2OUY1Mq6vqQ0B7wprM77ql3zsn7RUv+QDAMAZCLEBwLL1PuB7TP0h5DntqhuAlfqQ89\\/aNMctEkbhMbJDYe05QvKs276w9ib2T9rccsXI9sX1hYRoqX4+ZH3ScqhuAACA0xNiA4Bl633AV\\/2A8tzuk\\/xc3QSs1P7M9Xadn6++BcMBDS3VIXPrk5bqWzCsT46p3D+3hbVZBiFLRnYorH0do0Rpu7RnmAAAF0mIDQCWbdv5+Ut8AHSb6fAVmNfbTP98nUtviGE\\/RxMddsX1GVv197OQEC3V63NbXJ+xVYfUd4W1Gd9DvETBuOyfjKz6JR8AAM5EiA0Alutj+t9SPczQxxLtqhuAlbrJNObt1JY+SvQqRuHRVn1Asy2uz9gOhbWNuuWYfWHtTXy\\/01b9\\/S7ERsu+uL71SUv1\\/gkAwJkIsQHAcvU+4PuU5NscjSzQIdO\\/f2Beb5LcnaHOtvPz1bcMOKDhmOpRokY58ZTqWzDsnxxjfTKyfWHtTYQsaTPqlpEJsQEAXAghNgBYrt5Dkkt\\/AHST6SAWmNeHnP4Qd9f5+cMMPfRwyE1Ldcja+qSl+vdH65MWoxoZ2UOSL4X1rU9avOTD6A7VDQAAcB5CbACwTNv035JSfQhZ7T7nuTEKLtFdppFvp7BJ\\/y0S+\\/42Xs0oPI6p\\/n52iEhL9fq0f9JSPSr8fWF9xle9f+6K6zO2Q3F9v3\\/ScsmTJAAALo4QGwAsU+8Dvs\\/xAChJbjO9EQ\\/M622m2w5PoXf\\/cwsGo6sehWeUKC3V6xNa9oW1rU+OqQ5ZGiVKy76w9ibWJ23VIWAAAM5IiA0Alsko0fnsqhuAlfpzpgOJuS19\\/9sW12ds1bcMbAtrMz6jbhmZkDoje0ztTVfWJy32T0ZX\\/Tc8AABnJMQGAMtznemWox4eAP3dIfWHsrBW+5l\\/3hyjuqr3P4c0tFifjMz6ZGTVt1wZdUuL\\/ZORVa\\/PXXF9xlb9kg8AAGcmxAYAy7Pr\\/PzXJPf9bazKLtPb8cC83mfeQ7PenzXCLRhGNdJyKKw9R0iedaseJWr\\/pOVQWHtbWJtlELJkZNXr0yhRWg7VDQAAcF5CbACwPL0hjv0cTazMtyS31U3ASt1lOpyYw9JHiboFg5bqkPmusDbjq74FY1tYm\\/E9pj5kCU+xPhnZCC\\/5oPnf7wAAIABJREFUQEv13\\/AAAJyZEBsALMsmRomeyl2mAAEwr7eZJyQ6xy0S1fufQxpa9sX1rU9aDsX1rU9afL8zskNx\\/W1xfcZm\\/2Rk1S\\/5AABQQIgNAJal9wHfQzwAarmpbgBW6o+ZRhX2mGOUaOUhzXWMwqOtcn1uYpQobdX7p\\/VJS\\/UtV77faRESYmTVo0SNuqVlX90AAADnJ8QGAMuy6\\/x89QP00R2S\\/FLdBKzUXefnt52fP3R+vteuuD5jq75lwAE3LdXrc1dYm2WoDrFBS\\/X6FLLkKdUv+dg\\/OcYzTACACyTEBgDLsUnyrvNn7PvbWL2bTA9zgXm9T18QofeQo\\/oBuEMaWg7F9XfF9Rnbvri+\\/ZOWT8X1rU9aPiX5Vljf+qTlUFzf+qTFJAkAgAslxAYAyzHHKNEvczSyct+S3FY3ASt1l2lszEvNcYuEUXiMbF9Ye5P+kDzrZtQtI6v+fnfLFS1eomBk1etzW1yfsVWvTwAAigixAcBybDs\\/7wHQ890l+VzdBKzQm7wuJNp7AOcWDEZWHTK3PmmpvgXD+uSYyr9xdoW1WYZDYW0hS46pHiVqfdKyr24AAIAaQmwAsAxXST50\\/ozDDH1ckpvqBmCl\\/pjpUO0ljBJlzarX57a4PmOrXp+74vqMTUidkX1NbQh4V1ib8dk\\/GVn1Sz4AABQSYgOAZeh9wPeY+kPIpfmS5C\\/VTcBK7V\\/wfzvHLRKHzs\\/32MSoRtoqv5\\/nCMmzbvvC2pvYP2k7FNY2Kpxj9sX1hYRoqX4+ZH3SUr0+AQAoJMQGAMuw9FuIluo2UwAQmNe7PP+2w11nrepbMBzQ0PKY2hCG9UlL9S0Y1ifHVI\\/Cg5bK9SlkyTGHwtrbGCVK26G6AQAA6gixAcAy9N6SIsT2Ot9irCicym2mW6CO6T0k3nd+vteuuD5jq\\/5+FsKgpXp9bovrMzYhdUZmfTIy65ORmSQBAHDhhNgAYHxzPODzAOj19kk+VzcBK\\/Qmyd2R\\/5s5bpGoHtVoFB4t1d\\/PRonSciisbdQtx+wLa2\\/i+522Q3F9ISFa9sX1rU9aqv8+AgCgmBAbAIyv9wHfp1m6uGxuY4PT+Cntm3Z69z+3DDCy6lsGrE9arE9GZ30ysn1h7U2ELGkz6paRCbEBAFw4ITYAGF\\/vIYkHQP2+JPm5uglYqdZtbL3736Hz870cctNyKK5vfdJS\\/fuj9UlLdUh9V1ib8T1k+vuxiv2TFvsno6v+HRQAgGJCbAAwto+ZRu718ABoHneZDiSAeb3Lj2873KT\\/Fol95+d7GIXHMdXfzw65aakexWz\\/pOVQWNuocI6p\\/n7fFddnbIfi+tvi+ozNJAkAAITYAGBw287Pf0rybYY+mP5zNFYUTuM2U2jtt3oDNm7BYHTVo\\/B6Q\\/KsV\\/Uo0W1hbZZhX1jb9zvHVIeAhSxp2RfW3sT6pK06BAwAwACE2ABgbEsfpbc2vyb5XN0ErNCb\\/PNY0V3nz6x+AL4trs\\/YqkPmQhi0HIrrW5+0CKkzssfU7qHWJy32T0ZX\\/Tc8AAADEGIDgHFdJ3nb+TM8AJrfrroBWKkP+Xvwa45bJPadn+\\/lkIaW6u\\/nbXF9xla9Pu2ftFTfcmXULS32T0ZWvT53xfUZW\\/VLPgAADEKIDQDGtev8\\/Nck9\\/1t8Dv3SX6ubgJWav+3\\/9l7APeY+lsGjGqk5VBYe46QPOtm1C0jq16f0CJkycj2hbU3MUqUtuqQJQAAgxBiA4Bx9R6S7Odogh+6yzSKA5jX2yS36d\\/\\/qh+AO+SmpTpkviuszfiqb8Gwf9JSPapxW1ib8T1GyJJxVb\\/ksy2szTIcqhsAAGAMQmwAMKZNjBId2bcIAcCp3KT\\/Fonq\\/c8hIi374vrWJy3V++e2uD5jq16f9k9aDsX1t8X1GZv9k5FVv+QDAMBAhNgAYEy9D\\/ge4gHQqR0y3VYCzKt3jFz1LRjXMQqPtur1aZQoLYfC2tYnx1TfcuX7nRYhIUZm1C0j21c3AADAOITYAGBMu87PVz9AvxQ3mQIzwDiq979dcX3GVn3LwLawNuOrXp+7wtqMrzqkLiDEMdXrU8iSp9g\\/GV313\\/AAAAxEiA0AxrNJ8q7zZ+z72+AZ7pPcVTcB\\/INDcX2HNLQciuvviusztn1xffsnLYfi+tYnLZ+SfCusb33SUh0Qsj5pqX6JAgCAwQixAcB45hgl+mWORniW20z\\/mQNjMKqRke0La2\\/SH5Jn3eyfjKxyfW7jlivahIQY2aG4vlGitByqGwAAYCxCbAAwnt4H0NUP0C\\/RrroBIEn9LRi7wtqMrzpk7oCblupbMLaFtVkGo\\/AY2aGw9jZClrTZPxnZvroBAADGIsQGAGO5SvK+82ccZuiDlzlkCs8AtapDvNvi+oyten06RKTlUFx\\/V1yfsVWH1O2ftFSHgK1PWuyfjKz6JR8AAAYkxAYAY+l9wPeY+kPyS7XL9J8\\/UKdy\\/9vEqEba9oW15wjJs277wtqb2D9pM+qWke2L6wsJ0VL9fMj6pKV6fQIAMKB\\/rW4AAPgHRoku17ckt0n+o7gPuFRf45YBxvUYo0QZV\\/UtGNYnxxwKa+8Ka7MM31J3G+8mQpa0VY8SNeqWFs8wAQD4J0JsADCOqyQfOn+GB0C17jIddLlNBM5vX1x\\/V1yfsVV\\/PwsJ0WJ9MrLqUY3bwtosw39WNwBPqH7JZ1tYm\\/E9pn6cPQAAAzJOFADGse38vFGiY7ipbgAulFGijKxyfc4RkmfdqtenUbe07Atrb+L7HViufXF9IXVaPL8EAOCHhNgAYBy9D\\/gOczRBt0OSX6qbgAvjlhZGVh0yd4BIS\\/UtGNYnx9g\\/AV6ncv+8jlG3tAmxAQDwQ0JsADCO3kMSD4DGcZPpUBg4j+r9zyE3LdXrc1tcn7FVr0\\/7Jy3VIfVdYW2AHvZPRlb9kg8AAAMTYgOAMXxM8qbzZ3gANI5vSW6rm4ALUj0Kz6hGWg7F9YWEaLF\\/MjKjwgFep\\/r5kN8\\/aTlUNwAAwLiE2ABgDL0P+D5lCk4xjrskn6ubgAvwkORLYX0HNBxTPQqvNyTPelXfgrEtrM0yWJ8Ar1MdAjZKlJbqkCUAAAMTYgOAMWw7P+8B0JhuqhuAC1C9\\/wmx0VIdMrc+aTkU17c+aRFSB3gd+yejq\\/4bHgCAgQmxAUC96\\/S\\/pXqYoQ\\/m9yXJX6qbgJXbF9ffFtdnbNUHNA4RabE+GZlRtwCvU\\/39viuuz9iqX\\/IBAGBwQmwAUG\\/X+fmvSe772+BEbjON6wLm95j6WwaMaqSl8hDxOtYnbUbdMrJ9YW0BS2DJ9oW1N0neFdZnfNUhSwAABifEBgD1eg9J9nM0wcl8i7GicCrVD8AdctPyNbW3DOwKazO+6lsw7J+0jBBSB1gi+yejq\\/4bHgCAwQmxAUCtOUaJegA0vn2Sz9VNwApV738OaWjZF9e3Pmmp3j+3xfUZm\\/UJ8Dr2T0ZW\\/ZIPAAALIMQGALW2nZ83SnQ53MYG83pM7SHNNkbh0VY9SrQ3JM+6WZ+MzKhbgNep3D+vknworM\\/49tUNAAAwPiE2AKi16\\/z8YYYeOI8vSX6ubgJWpPqWAbdc0VIdMrc+aam+BWNXWJvxVYfU7Z\\/AUtk\\/GV313\\/AAACyAEBsA1Nkkedf5M\\/b9bXBGd0keqpuAlah+AO6Qhhbrk5Hti+tbn7TYPwFex\\/7JyKpf8gEAYCGE2ACgTu8DvodMt3uxHN9irCjM5VBY2yg8jqk8RNykPyTPuhklysgOhbWNEgWW7FBY2yhRjqkOWQIAsBBCbABQpzfE5gHQMv2a5HN1E7Bwn2IUHuOqDpm7BYOW6lswrE+OqfwbZ1tYG6CX\\/ZOReYYJAMCz\\/Gt1AwBwoa6SvO\\/8GR4ALdcuyf9UNwELVr3\\/bYvrM7bq9bkrrs\\/YqtenEBst1SF165OWX+I7Fp5i\\/6Sl+iUfAAAWxE1sAFCj9wHfY2pHRdDnPsnP1U3AghnVyMj2hbWvYn3SZv9kZEbdMrLqEDCMTIiNFvsnAADPJsQGADWMEuUu09uowMt8jltaGNdjjBJlXNW3YFifHFP5N86usDbje4y\\/weEpH5O8qW6Coe2rGwAAYDmE2ADg\\/K6SfOj8GR6gL9+3OCyD16je\\/3bF9Rlb9foUEqKlen3uiusztq8RUmdch+oGYGD2T1qqX\\/IBAGBhhNgA4PzmGCVafQjJPA5JPlU3AQtjFB4jq1yfc4TkWbd9YW2jbjlmX1h7E6NEafP3NzxtW90AQ7N\\/AgDwIkJsAHB+287PH2bogXHcZAomAsd9TXJfWH9bWJvxVYfM3YJBS\\/UtGNYnx9g\\/GZkQBvzYdYSAabN\\/AgDwIkJsAHB+vYckHgCty32Su+omYCH2xfUdctNS\\/f1sfdJifTKy6pD6rrA24\\/uU2lG3MLJddQMMrfolHwAAFkiIDQDO62OSN50\\/wwOg9blN8lDdBCzAobC2UY0ccyiuvy2uz9iMumVk+8Lamxh1S5u\\/v+FpQuq02D8BAHgxITYAOK\\/eB3zeAl+vXXUDMLiHGIXH2KpH4fWG5Fmv6lsw7J8ccyisbX1yjBAG\\/JhRohxj\\/wQA4MWE2ADgvIwS5SmHTCFF4Meq9z+H3LRUh8ytT1qq989tcX3GVh1S3xbWZnxf4yUyeMq2ugGGd6huAACA5RFiA4DzuU7\\/LSmHGfpgXDeZbksB\\/tm+uL5ReLRUh4SE2Gg5FNe3Pmkx6paR7asbgIHtqhtgaNUv+QAAsFBCbABwPrvOz39Nct\\/fBgO7T3Jb3AOMqPqWFgEMjqkMYWxjlCht1aNErU9a9oW1fb9zTHVIHUa1SfKuugmGZv8EAOBVhNgA4Hx6D0n2czTB8O4yBRaBvzsU13fITcvnGCXKuKpvwbA+aRFSZ2ReIoOn2T85RogNAIBXEWIDgPO4TvK282d4AHQ5bqobgMFU738OaWixPhmZ9cnIDsX1jRKlZV\\/dAAzM9zst1S\\/5AACwYEJsAHAevQ\\/4vAV+WQ5JfqluAgbxGKPwGFvl+pwjJM+6Va9P+yct1d\\/v0FIdAoZRXSV5X90EQ7N\\/AgDwakJsAHAevYckhzmaYFFuMoV34NJVPwDfFtdnbNUh811hbcb3NbW3YOwKazO+EULq8JSHeIkMnmL\\/5Jjqv+EBAFgwITYAOL1NknedP2Pf3wYL8y3JbXUTMIDqB+AOaWjZF9ffFtdnbPvi+vZPWny\\/M7Lq9Qkjs3\\/SUv2SDwAACyfEBgCn1\\/uA7yHJlzkaYXHuMj0AhEt2KKxtVCPHHAprb9IfkmfdqkeJ2j9pqb6FzahbWvbVDcCgrpJ8qG6Coe2rGwAAYNmE2ADg9Hadn\\/cW+GXbVTcAhT7FKDzGVR0ydwsGLdW3YFifHHMorG190lL9\\/Q4js39yzKG6AQAAlk2IDQBO6ypGidLnS5K\\/VDcBRapDvA5paKlen7vi+oyten3aP2mpDqlvC2szvur9E0a2rW6AoQkBAwDQTYgNAE6r9wDvMR4AkdxmWgtwaSoPETcxCo+2fWHtTYwSpa16\\/7Q+aTHqlpEJscHThNRpsX8CANBNiA0ATqv3AZ8HQCTTTRU31U3AmVXf0uKAhpbqWwa2hbUZX\\/X6tH9yTOXfOLvC2ozvMUbhwVM+JnlT3QRD21c3AADA8gmxAcDpXCX50PkzhNj4bp\\/kc3UTcEaH4vq74vqM7VBcX0iIlurfH3fF9Rnb5wipM67q\\/RNGZv+kpfolCgAAVkKIDQBOZ45Roh6i81tuY+OSGIXHyCrX5xwhedZtX1j7KvZP2owSZWT+\\/oanCbHRcqhuAACAdRBiA4DT2XZ+3gN0fu9Lkr9UNwFn8DXJfWF9BzS0VIfMrU9aqm\\/BsD45pnL\\/3BbWZnzV3+8wsusYJUqb\\/RMAgFkIsQHA6fQe4h3maILVuc10QA1rti+uvy2uz9iqD2iEhGg5FNe3PmmpDqnvCmszvurvdxjZrroBhiYEDADAbITYAOA0Pqb\\/LVUPgPiRbzFWlPUzqpGRVX8\\/W5+02D8Z2b6w9iZG3dJ2qG4ABiakTkv130cAAKyIEBsAnEbvA75PmcJK8CO\\/Jvlc3QScyEOMEmVsh8La1ict1bdgWJ8cY30yMiEM+LHrJG+rm2Bo9k8AAGYjxAYAp9F7SOIBEMfsqhuAE6ne\\/xxy01IdMrc+abF\\/MjIhdUZW\\/f0OI7N\\/ckz176AAAKyIEBsAzG8bo0Q5vfskP1c3ASewL65vFB4t1d\\/PDhFpqV6f2+L6jK161O37wvqMr3r\\/hJH5\\/ZOWT9UNAACwLkJsADC\\/3gd8X+MtcJ7nLtOtFrAWD0m+FNZ3QMMx1aPwekPyrNuhsLb1yTH7wtq+3zlGiA1+bJPkXXUTDM3+CQDArITYAGB+vYck+zma4CJ8S3JT3QTMqPoBuENuWj6nNmS+LazN+KpH4dk\\/aRFSZ2TV3+8wMvsnx1T\\/DQ8AwMoIsQHAvK6TvO38GR4A8RK\\/xvgG1uNQXN8hDS3V38\\/WJy3WJyOrHiVqVDgt1fsnjGxX3QBDq36JAgCAFRJiA4B57To\\/\\/zXJfX8bXJibJI\\/VTUCnxxjVyNgq1+ccIXnWrXJ9bmP\\/pO1QWHtbWJtlEGKDH9vEKFHaDtUNAACwPkJsADCvbefnPUDnNe6T3FU3AZ2q979tcX3GVh0y3xXWZnzVo\\/DcwkbLCCF1eEr19zuMbFvdAMOr\\/hseAIAVEmIDgPls0v+WqgdAvNZtkofqJqBD9f7nkJuWfXF965MW+ycjsz4Z2b66ARiY\\/ZMWIWAAAE5CiA0A5tP7gO8hyZc5GuFi7aobgA5GNTKyQ2HtTaxP2uyfjKz6FjajbmmpDlnCqK6SfKhugqHtqxsAAGCdhNgAYD67zs97gE6vQ5JP1U3AK1Sv211xfcZWHTJ3CwYt1bdg7AprswzVITZ4ykPcIgRPsX9yjGeYAACchBAbAMxjk\\/5Rovv+NiA3SR6rm4AXqn4A7pCGlur1uSuuz9j2xfW3xfUZW3VI3fc7LdXf7zAy+yctQsAAAJyMEBsAzGPb+fnHGCXKPO6T3Bb3AC9lFB4j2xfW3qQ\\/JM+6HQprb2J90lb9\\/W6UKC376gZgYNvqBhiaEDAAACcjxAYA8+h9S9UDIOZ0l2m8GCzBpyTfCutvC2szPqNEGZn1yegq\\/8bZFdZmfNX7J4zsY4SAadtXNwAAwHoJsQFAv6skHzp\\/hhAbc7upbgCe6VBcf1dcn7FVfz9vi+sztur1uSuuz9iqQ+pClrRU758wMvsnLULAAACclBAbAPTrfcD3GA\\/Rmd8hyS\\/VTcAzVO5\\/mxiFR9uhsPYcIXnWbV9YexP7J22HwtpGhXPMvroBGJgQGy2eXwIAcFJCbADQzyhRRnWTKSQJo\\/qa5L6wvgMaWqpD5tYnLdW3YGwLa7MM9k9G9Ri3CMFTtjFKlDbPMAEAOCkhNgDot+38\\/GGGHuBHviW5rW4CGvbF9R1y01J9QGN90nIorm990iKkzsiqv99hZPZPWh5T\\/zsoAAArJ8QGAH0+pv8tVQ\\/ROaW7TAeJMKLK\\/e8qyfvC+oyven0aJUqL9cnI9oW1NzHqljZ\\/f8PThNhosX8CAHByQmwA0Kf3Ad+nTLdlwSntqhuAH3BLC6OrPKTZFtZmfEbdMjrrk1FV758wsuskb6ubYGj2TwAATk6IDQD69B6SeADEOXxJ8pfqJuB3DsX1HXLT8qm4vvVJS\\/Xvj9YnLdUh9V1hbcZXvX\\/CyHbVDTA0IWAAAM5CiA0AXm8bo0RZjttMDx1hFPvC2kbhcUz197OQEC3V63NbXJ+xHQprX8UoUdqq908Y2ba6AYZ2qG4AAIDLIMQGAK\\/Xe8D8OUaJcj7fktxUNwF\\/85DphsAq28LaLEP1KLzekDzrdiisbX1yzL6wtgAwxxyqG4BBbSIETJsQMAAAZyHEBgCvZ5QoS7PPFJ6EatX7n0NuWj6lNmRufdJifTKy6pC69UlL9f4JI7N\\/ckz13\\/AAAFwIITYAeJ3rJG87f4YHQFRwGxsjqN7\\/HNLQciiuvy2uz9jsn4yscn0aFc4x1fsnjGxX3QBDEwIGAOBshNgA4HV2nZ\\/\\/muS+vw14sS9J\\/lLdBBftMUbhMbbKQ+45QvKsm1G3jKx6fUKLEBv82CZGidJm\\/wQA4GyE2ADgdXoPSfZzNAGvdJtp3BNUqH4A7pCbluqQ+a6wNuOrvgVjW1ib8VWH1LeFtRlf9f4JI\\/P3EcccqhsAAOByCLEBwMtt0n9LyqG\\/DXi1bzFWlDrVIbZtcX3Gti+u7xCRlkNxfeuTlurvd+uTlkN1AzCwbXUDDK36JR8AAC6MEBsAvFzvAclDppGOUOnXJJ+rm+DiPMaoRsZmfTIy65ORVY8SNeqWluqQJYzqKsmH6iYY2r66AQAALosQGwC83K7z8x6gM4pddQNcnENx\\/V1xfcb2kNpbBraFtRlf9S0Yu8LajK86pO4WNlqq908Ymf2TYzzDBADgrITYAOBlNknedf6MfX8bMIv7JD9XN8FFqX4A7pCGlur1uSuuz9j2xfXtn7Qciutbn7RUf7\\/DyOyftFS\\/5AMAwAUSYgOAlzFKlLW5y7Qu4RyMwmNk+8Lam\\/SH5Fm3yv1zE\\/snbZXrcxujRGk7VDcAAzNKlBYhYAAAzk6IDQBeZtv5+cMMPcCcviW5qW6Ci\\/Ap03qrsi2szfiqQ+ZuwaCl+hYM65NjjBJlZIfqBmBQ9k+O8RIuAABnJ8QGAM93lf63VL3FyIh+zRQwglOq3v92xfUZm\\/XJyKxPRlYdUhfCoOVzdQMwMPsnxwixAQBwdkJsAPB8vQ\\/4HlN\\/CAlPucm0RuFUDoW1NzGqkbZDYe2rWJ+07Qtrb2J90mZUOCO7r24ABibExjFCbAAAnJ0QGwA8X+8DPgE2Rnaf5K66CVbra4zCY1zVIXPrkxajbhld5f65K6zNMtxXNwCD+pjkTXUTDO1rdQMAAFwmITYAeD6jRFm720yH5TC3fXF9IQxaqr+frU9aqtfntrg+Y\\/ua2lGi28LaLEPl+oSRbasbYHj2TwAASgixAcDzzHHAfJjhZ8Cp7aobYJUqQxhXSd4X1md81euzNyTPuh0Ka1ufHLMvrL2JUbccZxQe\\/JiXKAAAgCEJsQHA8\\/Q+4PsUbzGyDIdM6xXmYpQoozNKlFEZdcvorE+A5blO8ra6CQAAgB8RYgOA5+k9JKkeBQUvcZPp4BzmcCiu75CblurQ7ra4PmOr\\/v3R\\/klLdUh9V1gbYMl21Q0AAAA8RYgNAI77mORN58+oPoSEl7hPclvcA+uxL6xtFB7HVH8\\/CwnRUr0+7Z+0VK7PTYwSBXgtv38CAADDEmIDgOO2nZ\\/\\/HKNEWZ67TDdsQI+HJF8K6zug4ZjqUXi9IXnWrXp9Qkvl+twW1mZZttUNwGA2MUoUAAAYmBAbABxnlOj\\/z97dXsltZGuifs9d\\/V91LVAeC1RjAXMsEK8FjbFAbAuUsuBQFgzagtNlwSQtuCwLpmjBsCzo+ZGq0yWKLBWAACKQ8TxrafVXIrAbhUAmmW\\/tTa\\/e1S6A3av9\\/DtWPj9tu0vdkLmQEC+pPerW\\/clLhNQB9snzk9c61C4AAIA+CbEBwMtus\\/y3VGuHOGCuc5K\\/1y6CXRsrn9+XNLzkXPn87k9eUvvzo\\/uTl9S8P40KZ4pj7QKgMUPtAtiN73N5zwUAgE0JsQHAy4aFx98neVheBlTzLslj7SLYpcfU79JiVCMvqRnCuI37k5fVHiXq\\/uQlY8VzC1gyxW3tAqAhhyQ\\/1C6CXfEMBQBgc0JsAPCypV+SjCWKgIo+JznVLoJd0kWIltUOmQ8Vz037ao+6PVY8N+1rIaQOr\\/VdhDDgiecnUx1rFwAAQH+E2ADg2w5ZPkr0vLwMqO59LoEPmEKIjZaNlc\\/v\\/uQltZ+fQ+Xz07ba9+ex8vnZn2PtAqARx9oFsDv+zAIAwOaE2ADg25b+Zc2n1O1SACW9q10Au\\/IYoxppW83785DlIXmuW837c4jnJy+reX8e4\\/5kuqF2AdCIH2sXwO78kMufXQAAYDNCbADwbcPC42t3KYCSzkl+rV0Eu1H7+TdUPj9tqz1K9Fjx3LTvQ+qOEh0qnpv21Q6pHyuem\\/36Ie4dONYugN3yC40AAGxKiA0Avu6Qy192LzEuLwOacsrly0v4M+fK5zf2hJecK5\\/\\/UPn8tK1mF99jkjcVz0\\/7aofUbyufn\\/061S4AKvP8ZK4hyU3tIgAA6IcQGwB8nVGi8Eef47dweZ3ao0SNauQlY+XzHyufn7bV7MI2Vjw3+3CufP5D5fOzX2\\/i\\/Ze+HWoXwG59F0FgAAA2JMQGAF+3NMRWu0sBrGXMZdQZfMtd6oYwdGHjJS2EzA+Vzw9fc4oAMH+u9p9xlnbKpm\\/vaxcAFenExhI\\/xT0EAMBGhNgA4I9usnyU0rlAHdAq3dh4Se0vuIXYeEnt+zMRFOJlx0rn\\/LnCedmX2iF1WOqH6CYEMNcYY0UBANiAEBsA\\/NHSAMRj2viSHNbyMcmvtYugWTWff4fo0sLLvD\\/Tuq27XNzGvuB1at8nOsBQws\\/xCw\\/0yTOUpX6IjpYAAGxAiA0A\\/sgoUfhzp1wCm\\/DcfYwSpV2P0SmV9n2X7Z5lt7nsie82Oh\\/7VvvPOLq\\/UMoYgR76472eEv6ayzMUAABWI8QGAL93k+THhWvU\\/oIHtvA5yVC7CJozVj7\\/UPn8tM37M3uxxdhuATam+BCjRLke3+Xy\\/DvWLQNglwTZAABYlRAbAPzescAaviSnF\\/\\/I5UtNeFLz+XcTo0R5mfdn9uJN1u3G9jYCbEzTwvNTiI6Svkvyv7JNaBjg2vw1l88GuqQCAFCcEBsA\\/N7SLwzvilQB+zHULoBm3Cd5qHh+o0R5yWPaCGHAa40pP+7uJsn7JP8ZATamaeH5+bF2AVyl\\/8jl\\/j5UrgPW5pfPKO3HXN6bj5XrAADgygixAcDvLQ1BtPAFD2zpIckvtYugCbWff0JsvORcu4BnPtUugF14GndXKsg25PJF40+UKR2TAAAgAElEQVSF1qMftUPqsLanIMYpugoBTPF9Ll0txwgDAwBQiBAbAPzL2yzvSlE7xAE1vI9QBvVHif5Y8fy0r6X354faBbAbT0G2uePubnIJrz0k+Z+5fNEIU421C3jmvnYBXK3vkvycy\\/Pyfcp3woTadLNkTX9N8r9z+TOXXy4DAGARITYA+JcSo0Q\\/lygEduZz5n\\/BznX4lLpfjPiLcv5MSyE2XyIyxXe5jLt7yCWQ9mddgg6\\/ve4fSf5PhNdY7ly7gGc8P1nbd7l0rPz\\/869A29voMMT+eX6yhR9zGVv\\/OZcQ\\/BChYAAAJvq3f\\/7zn7VrAIBWPGTZl3x\\/y+UvuaFX5yRvahdBFb+mbpBxzOW3v+Fr7tJW0PFtLl\\/uwFz3+fovTngPprRPaSu8M+QSzIRavvX8hS+dcxlR24rbXMKZUIvnJ6\\/1OW39+R0A2NhfahcAAI24zfIuFS11eYEahlx+w3vpWF72Z6x8fn\\/ByUtae38+1y6A3fuhdgF0w\\/MTfs\\/zl9caaxfwhY+5BJN1Z6UWz09e6++1CwAA6jJOFAAuhoXH3+fSyQ169hDdCHv0mPqjRAUnecm5dgFf+JxLdziA1o21C\\/jCQy5\\/7gJo3bl2AV\\/RWjAZ4GvOtQsAAOoSYgOAi6VdfMYSRcAVOOXyG970o\\/aXIbqw8ZJWQ+a19w3An\\/mUuiH1b\\/ELE0DrWv386fkJ7IE\\/KwNA54TYAMAoUShtqF0Am6r9\\/BNi4yVj7QK+YYzAL9C2c+0CvmHMpQssQKvG2gV8w0OSD7WLAHjBXS6dywGAjgmxAUByXHj8p7T5W7ZQyzlG5fXiMXVDbLcxSpSX1Q5ZvuRUuwCAF3h+Aszj+QkwT8vPTwBgI0JsALC8a5Q\\/YMMfvYsuGT2o\\/fwbKp+ftrU6yunJmEuNAK2pHVL\\/M+\\/j+Qm0qfXPn+ckf69dBMA3tPz5EwDYiBAbAL07JPlh4Rrj8jLg6jzk8gUj1632XzAaJcpLzrULeIWhdgEAX1H7\\/f01htoFAHzFuXYBr+AXzoAW3ccoUQAgQmwAsDQA8SnJxxKFwBU6RZeMa3eueO7bJN9XPD\\/tG2sX8Aofk\\/ytdhEAX9hDiM3zE2jRWLuAV\\/ic5Fi7CIAvjLULAADaIMQGQO+Whtj28AUP1PSudgGs5i51f0t2qHhu2renkPn7GOsEtOVcu4BX8vwEWrKnz58fk\\/yP2kUAPOPv2AGAJEJsAPTtJsmbhWucC9QB1+wcXy5eq9p\\/wXisfH7aVvv+nGqIZyXQhtoh9amGeH4Cbdjb588xgmxAG+6TPNQuAgBogxAbAD1b2oXtMfv7S0qo4V0u+4XrUvP5d0jyQ8Xz0749vj8PSX6tXQTQvb0+P3+pXQTQvT0+P8dcgmz+vA7UtMfnJwCwEiE2AHpmlChs43OSU+0iKOpD6nZpWfr85ro9Zr+dUt8l+f\\/ii0Sgnr3+GeeU5L\\/nMs4PYGt7\\/vw55tLl+r5uGUDH9vr5EwBYgRAbAL26SfLjwjX8ARte7338pfg1qf38Gyqfn7bVvj+X+kcu3QaNxwO2trdRol86J7mNrpbA9vb++fNjLs\\/Pv8UvUwDb+pTLMwgAIIkQGwD9KtHFZ+9\\/SQlbe1e7AIoxSpSWXcP78+dcwpr\\/HmE2YDvn2gUU8DmXz5z\\/nkuYTRgD2MI1fP5MLr98dshlRLPOlsAWruX5CQAU8m\\/\\/\\/Oc\\/a9cAADWMSf664Pi7GGcHc7xP8lPtIljkPpff0q9lSPI\\/K56ftj3m0m312tzk8rnjbZZ3kgX4ln9P8lC7iBUMuYzKe5vku6qVANfoWj9\\/Jv\\/6\\/HlM8n3dUoAr9d+iExsA8IwQGwC9+keW\\/SXj+\\/hNMZjjJvbO3o2\\/\\/VPLKZcvUeBrzrncI9fumEuY9Cb2A1DGQ\\/oY133I5fn5FMh\\/epYCzPUxfXQdP\\/z2z\\/G3\\/3z8xusApjjWLgAAaIsQGwAAAAAAAAAAANX8P7ULAAAAAAAAAAAAoF9CbAAAAAAAAAAAAFQjxAYAAAAAAAAAAEA1QmwAAAAAAAAAAABUI8QGAAAAAAAAAABANUJsAAAAAAAAAAAAVCPEBgAAAAAAAAAAQDVCbAAAAAAAAAAAAFQjxAYAAAAAAAAAAEA1QmwAAAAAAAAAAABUI8QGAAAAAAAAAABANUJsAAAAAAAAAAAAVCPEBgAAAAAAAAAAQDVCbAAAAAAAAAAAAFQjxAYAAAAAAAAAAEA1QmwAAAAAAAAAAABUI8QGAAAAAAAAAABANUJsAAAAAAAAAAAAVCPEBgAAAAAAAAAAQDVCbAAAAAAAAAAAAFQjxAYAAAAAAAAAAEA1QmwAAAAAAAAAAABUI8QGAAAAAAAAAABANUJsAAAAAAAAAAAAVCPEBgAAAAAAAAAAQDVCbAAAAAAAAAAAAFQjxAYAAAAAAAAAAEA1QmwAAAAAAAAAAABUI8QGAAAAAAAAAABANUJsAAAAAAAAAAAAVCPEBgAAAAAAAAAAQDVCbAAAAAAAAAAAAFQjxAYAAAAAAAAAAEA1QmwAAAAAAAAAAABUI8QGAAAAAAAAAABANUJsAAAAAAAAAAAAVCPEBgAAAAAAAAAAQDVCbAAAAAAAAAAAAFQjxAYAAAAAAAAAAEA1QmwAAAAAAAAAAABUI8QGAAAAAAAAAABANUJsAAAAAAAAAAAAVCPEBgAAAAAAAAAAQDVCbAAAAAAAAAAAAFQjxAYAAAAAAAAAAEA1QmwAAAAAAAAAAABUI8QGAAAAAAAAAABANUJsAAAAAAAAAAAAVCPEBgAAAAAAAAAAQDVCbAAAAAAAAAAAAFQjxAYAAAAAAAAAAEA1QmwAAAAAAAAAAABUI8QGAAAAAAAAAABANUJsAAAAAAAAAAAAVCPEBgAAAAAAAAAAQDVCbAAAAAAAAAAAAFQjxAYAAAAAAAAAAEA1QmwAAAAAAAAAAABUI8QGAAAAAAAAAABANUJsAAAAAAAAAAAAVCPEBgAAAAAAAAAAQDVCbAAAAAAAAAAAAFQjxAYAAAAAAAAAAEA1QmwAAAAAAAAAAABUI8QGAAAAAAAAAABANUJsAAAAAAAAAAAAVCPEBgAAAAAAAAAAQDVCbAAAAAAAAAAAAFQjxAYAAAAAAAAAAEA1QmwAAAAAAAAAAABUI8QGAAAAAAAAAABANUJsAAAAAAAAAAAAVCPEBgAAAAAAAAAAQDVCbAAAAAAAAAAAAFQjxAYAAAAAAAAAAEA1QmwAAAAAAAAAAABUI8QGAAAAAAAAAABANUJsAAAAAAAAAAAAVCPEBgAAAAAAAAAAQDVCbAAAAAAAAAAAAFQjxAYAAAAAAAAAAEA1QmwAAAAAAAAAAABUI8QGAAAAAAAAAABANUJsAAAAAAAAAAAAVCPEBgAAAAAAAAAAQDVCbAAAAAAAAAAAAFQjxAYAAAAAAAAAAEA1QmwAAAAAAAAAAABUI8QGAAAAAAAAAABANUJsAAAAAAAAAAAAVCPEBgAAAAAAAAAAQDVCbAAAAAAAAAAAAFQjxAYAAAAAAAAAAEA1QmwAAAAAAAAAAABUI8QGAAAAAAAAAABANX+pXQAAAAB04m2S25nHnn\\/7Z6nbJMOCOkp5l+Rj5Rr24Db\\/um9ukrypWw4ruk\\/yOZd9\\/o\\/U2x\\/vk\\/xU6dy1\\/beUv+4fk\\/xQeM1W\\/ZLkVLsI\\/uCcft477nJ5zwQAAGCnhNgAAABgfbdJ\\/nPmsY+5BEtKGNNGoOKmdgENu8kl5Dck+b5uKWzoaV++SfJzkg+5BILOG9fRawDkMeUDbIe08bylX+\\/ST4AtuQSAAQAA2DHjRAEAAGB944Jj3+XSoWmpUwQqWnaTy8\\/o\\/+QSYhJg69ubJP8rl\\/2\\/ldv0e9+tEX7pNRBIGw7przOeEBsAAMDO6cQGAAAA6zplfnjsQ5YF4J4csm0Yhmne5vJz\\/q5yHbTnP37711LdGF8ybHCOVq0RfjmusCa81vv09Z5ylzKBfwAAACrSiQ0AAADWc5tLV605HlMuVDKmry+z9+R9LqNm\\/Xz4lv\\/INoGoXjuHPaZ8iO0myY+F12ydMdHteJv+7j9d2AAAAK6AEBsAAACsZ1xw7CnJQ4Ea3uUympC23CQ5J\\/mpch3sw2nl9Y0SLavHQOBt7QJIcnlvGWsXUYEQGwAAwBUQYgMAAIB1vMuyMaIlxgcesn74hemeAmzChbzWm1z281qOK67dOiE2rsmY\\/jp73scoUQAAgKsgxAYAAADlHTI\\/PGaM6PX7R+YHHOnXmsGoYcW1W3cuvF6Po0RpQ49jRJM+O88BAABcJSE2AAAAKG\\/M\\/PDYKdc\\/RvRQu4CK3qfdnwttW2tc4yH9hirvUr6D07HwevAavY4RTYwSBQAAuBpCbAAAAFDWkvDYffoYI3qoXUAlxyQ\\/1S6C3TqstG7Poy+NEuVajOmz8+p9ygT\\/AQAAaIAQGwAAAJRzyLLw2FCkiksQrscvs1vWc5cc2jbULqAiITauQa9jRBPvqwAAAFdFiA0AAADKGTM\\/PPZLko8Fauj5y+yWvUvyfe0i2LXSYy+TS7jSKNFy3kaAmG3dpEwH17061y4AAACAcv5SuwAAAAC4EkOWjRE9FahBt692vatdQEX3KdPx6pC+Q0IlQq5f6rlr2HmFNXu+ntRxSr8B6U9Z57kIAABAJUJsAAAAsNzSTihDoTrG9BvwadmQPn8u97mE984F1zz8tl6PoY3zCmv2HLoySpS9Oyb5qXYRFa2xhwEAAKjIOFEAAABYbowxonxbj8GWvye5Tfng1UP67Gr3mPLX8ib9PjPuc7mXSrpNn2FV6tB51f9\\/AACAqyPEBgAAAMssCY99ijGiPegtKPQh5boLfk2P3XfOK6zZY7jyybjCmsMKa8K3nNJnR8onRokCAABcISE2AAAAmG9peGwoU0beRwegVvUYFBpqF3CFjL4sy\\/Vkz47pe4xo0meYGQAA4OoJsQEAAMB8Y+aHx35Nme5KxyR\\/LbAO6+gt2PL3lB\\/T+KXblddv0RqBjeMKa+7BWqNEe+6KlVxC3axP59WLc+0CAAAAKE+IDQAAAOYxRpTX6C3EtkV3nGGDc7TkLsnnwmu+Tb\\/dG88rrDmssObe\\/FC7gE6cIjD5GJ3YAAAArpIQGwAAAEx3k8sIz7mGlAmlnOLL7Jb1FhTaKlggGLhcb9fwuXGFNY8rrAlfuo0xookAGwAAwNUSYgMAAIDpTpkfHis5RtSX2W3rLSh03uAcPY5tFGIr51OSj4XXPEQXMrYx1i6gEUJsAAAAV0qIDQAAAKY5Zn54zBjRi0PtAjZyrF3AxnRhK+8+RomWJBDIXp0iLJkYJQoAAHDVhNgAAADg9ZaGx97FGNGkjxCbjmHr6C0wNK6w5nGFNfdiXGHNYYU14bnbJD\\/XLqIR59oFAAAAsB4hNgAAAHi9U+YHk+5SJuRzG2NE92CoXcDG7lK+Y9iXDumvE5HOYeU8xihR9mmsXUBDdGEDAAC4YkJsAAAA8DrHzA+PPaZcqGkstA7r6i0opAtbefdJHgqv2WOHwCcCgezRKYKSzwmxAQAAXDEhNgAAAHidccGxQ8qNEfVldvt6DAptESwYNjhHS8YV1hxWWHMvhNjYG2NEf2+Ljp8AAABUJMQGAAAAf+6UNsaI+jJ7H3oLttzHKNE1nFdYs7d788ljyofYbpK8KbwmPPe+dgGN0YUNAADgygmxAQAAwMuWhMeMEe1Tb0GhcYNzHDc4R0s+JflYeM0eOwQ+0YWNvXkXIckvCbEBAABcOSE2AAAAeNm44Nh3MUa0N4f097PaIljQW2BojWt6XGHNvRBiY08Oubzv8y9bdPwEAACgMiE2AAAA+LZT5geSPqRMh6pDjBHdk96CLfdJHlY+x02SH1c+R2vGFdYcVlhzL86F1+vxnmQ7Y5LvahfRmLF2AQAAAKxPiA0AAAC+zhhR5hhqF7CxcYNz9BYMXGOU6CH9dQh8cpfyHZx6uydf66Z2AVfAGNGvM0oUAACgA0JsAAAA8HXjgmNPKdOdypfZ+3JIf0Gh8wbn6C0wZPRlWUazbue2dgE7d4gxol+zRcdPAAAAGiDEBgAAAH\\/0LsvGiL4vUMMhvszem2PtAja2Rsewr+ltbON5hTWHFdbcC6FA9mKMMaJfM9YuAAAAgG0IsQEAAMDvHTI\\/PFZ6jKgvs\\/elt2DLFuPderumjyl\\/XW\\/SX4fAJ2uNEvVspjSdV7\\/tXLsAAAAAtiHEBgAAAL83Zn5A4RRjRF\\/jULuAFdykv45h4wbn6C3EpmtYWecV1uz5erKOm+i8+i1bdfwEAACgAUJsAAAA8C9LwmPGiL7e97ULWEFvwZatggW9XVchtrJcT\\/ZgjO5+37JFx08AAAAaIcQGAAAAF4csC4+9K1OGL7N3qrdgy1ajRHvaC2uNEu2tQ+CT+5TpjPncMX3dk6zvbfrdo68x1i4AAACA7QixAQAAwMWY+eGEX1KmK9XbXPcY0WvWWwjhvME5egsGnldYs7dr+Ny4wpo9X0\\/Ku4mQ1kuMEgUAAOiMEBsAAAAkQ+aHx+5TZvynL7P3q7dgyxodw77muME5WmL0ZVktXM+7FWrgeoyZFp5\\/zGV0eS+MEgUAAOiMEBsAAAC9u0nyfsHxQ6E6xhhTt1e9BYW2CBbcJvl+g\\/O0ZI3r2luHwCdrjBKdc08K4fAtc8aIvktf3VrPtQsAAABgW0JsAAAA9G5MG2NEew2bXAMhtvKGDc7Rkrsknwuv2dt9+dx5hTWHGccIsfE1czqvrvGMaNlWHT8BAABoiBAbAAAAPVsSHjNGlORyD\\/XUQW+rYEFvAawWRl9ek3GFNeeMEv2cvsY\\/8jpjpo8RHdLXnhZgAwAA6JAQGwAAAL1aGh57V6iOMX2FoK5NT6GCZJvxbkaJltHbvfnkU8p0yHzukOn35LlwDVyHY+aNEf2cvva0EBsAAECHhNgAAADo1Zj54bFfUyagcIwxont3rF3AxnRhK+8+64wS7TUc20ogsMcQzk3tAho3Jzz\\/4bdjetrTRokCAAB0SogNAACAHi0ZI\\/opxohyoWPYOnoLsY0rrNnbNXxuXGHNYeLr75M8lC+jebe1C2jcKdPeM57GiCZ97WkBNgAAgE4JsQEAANCbmyTvFxw\\/pEzXpFP6C0Bdm6F2ARu7S\\/mOYV86JPlh5XO0Zo3AxnGFNfdgrVGiU+\\/JsXAN7N8xyU8TjznlX2HInkJs59oFAAAAUIcQGwAAAL05ZX54rOQY0alfZtOenkIFiS5sa1ijY1ePHQKfnFdY0yhRlpo7RvQpcH+bfkaJJvYPAABAt4TYAAAA6Mkx88NjxoiWdVO7gIV6DAptESwYNjhHS8YV1hxWWHMv1rhHp4bYeh0lyredMn+MaNLXnt6i4ycAAACNEmIDAACgF0vDY0OMES3ptnYBC\\/XYMcwo0fLOK6zZ27355DHlQ2w3Sd5MPOZcuAb27ZhlY0STvva0LmwAAAAdE2IDAACgF6fMD4\\/dxRhRfq+nUEGyTffA4wbnaMmnJB8Lr9ljh8AnLXRhS3Ta5PfGia9\\/PkY06W9PC7EBAAB0TIgNAACAHhwzPzz25VivJd7\\/+UvYgUP66xi2RbCgt2BgK6Gra9HC9VwjmMh+nTI9gDb8yX++Zh9ilCgAAEDXhNgAAAC4di2NEe0t+HStegsK3ef3o+3WcJPkx5XP0ZpxhTV7uzefW2OU6NR7Uhcpntwm+XniMb\\/kj8\\/anva0\\/QMAANA5ITYAAACu3bssGyNa4kvVOV9m066hdgEbGzc4R09BjWSdjl2H9BuUvVthTaNEWWKc+Pr7XMLuzx1ilCgAAAAdEWIDAADgmi0Jj5UcIzouOHaNcAbzHdJfUOi8wTl6C7G1MPrymqxxPY8TX2+UKE9Omf4+MXzlv+tpT2\\/R8RMAAIDG\\/aV2AQAAALCiccGxQ+qPEf2Q5H36G7PYsmPtAja2VTDnlMu93ouHFdYcVlhzL1oIBZ5f+O\\/fLKqEPZk7RvRrz9lhcTX7MdYuAAAAgPqE2AAAALhWpywLj9UeI\\/rUCe5QoA7K6akzTrLdeDcdrJY5pL8OgU\\/uUiZw\\/NzbJN9NPMYoRJIyY0ST\\/va0\\/QMAAIBxogAAAFylVsaILuksdYrRWq25SX9d8cbaBfAqx9oFVNRCF7bHlepgX04pM0Y06Ssw\\/Sk+7wAAABAhNgAAAK7TuODYU8p8mfou80fI3aev0Yp70VOoINlulCjL9XZvPndeYc2p11OA7eJYu4CKDik3RjTpa0\\/bPwAAACQRYgMAAOD6nLJsjGiJ8NghXx8P9lrDs39\\/s6QQiuopVJAIFuxFjx0Cn9ynfAenY4wSZbpx4us\\/5dufE24yPwS\\/R2PtAgAAAGiDEBsAAADX5JBLB7Q5So4RHTM9BPHky84st4uroZTegkLn2gXwKr2FK58bV1hzzvUUYuvbnM6rwwv\\/W097WsdPAAAA\\/osQGwAAANdkzPzw2CltjBE9FahhD\\/bWYa6nUEFyCXUK5uxDb\\/fmc2vco1Ov590KNbAfh0x\\/3\\/41L4eEe9rT3mcAAAD4L0JsAAAAXIsl4bEWx4heu711mOspVJAIFuxJbx0Cn6wxSvQ2yfcTj7FX+jZmWnj+pTGiSX\\/jge0fAAAA\\/osQGwAAANfgkGXhsbkjSL80ptwYUdoixEaLersvn1vjHh1mHGOv9GvuGNHPL\\/zvPe3pxxhbDQAAwDNCbAAAAFyDMfXDY0Pmd4L7s84s1PU28++vPTJKdD96Crx8qZVRoi8Fkrheh5QfI5okx+ml7Jb3GQAAAH5HiA0AAIC9WzJG9D5lwmM3WTaOdChQA+vpLSgkWLAfvd2bTz6lfOfKQ4wS5fXGlB0j+qSnPW3\\/AAAA8DtCbAAAAOzZTZaF0IYyZSzqBPeazizU1VOoIHE\\/7kVvHQKfa6ELW2Kv9GpI+TGiSV97WsdPAAAA\\/kCIDQAAgD0bU3+M6NskP8489jWdWY4z16aM2\\/QTKngiWLAPvYUrnxtXWHOY+Pr7JA\\/ly6Bxczqv3uV1gcee9rT3GQAAAP5AiA0AAIC9WhIeKzlGdFxw\\/JA\\/78xCXUPtAjZ2F\\/fkXhxrF1DJWqNEf5h4zPjK15WulbrGTAs2P+b17yM9hdjOtQsAAACgPUJsAAAA7NHS8Ni7QnWMMUb02vUUKkh0x9mL2yTf1y6ikvMKa87Z56\\/dK0Kh12NOeH7I6+6BY\\/rq+um9BgAAgD8QYgMAAGCPxtQPj609RpT6egwKCRbsw1C7gIrWuEenhtiMEu3PnPD8XV5\\/v\\/YUmNbxEwAAgK8SYgMAAGBvWgiP3SR5v+D4Ib7A3YOhdgEb+xD35V70FHh57jHlQ2w3Sd5MPEbY8+umXsc9GbPeGNGkrz1t\\/wAAAPBVQmwAAADsydIxokPKhHROmd+h6y7GiO7FsXYBGxMs2IceOwQ+aaELW2Kv9GbNMaJJf3va\\/gEAAOCrhNgAAADYk1PqjxE9Jvlp5rFTO7NQzyHJD7WL2JhgwT701LHpSy2E2D4l+bhCHbRp7TGiSV+fC3T8BAAA4JuE2AAAANiLY+aHx0qOER0XHD9k+pe3hwXna9lN7QL+RG9BofskD7WL4FV6uzefW2OU6NQOW8KefTll3TGiSV972v4BAADgm4TYAAAA2INrGSM658vbax0xdlu7gD8x1C5gY2PtAniVQ\\/rrEPjkboU154SHxtJF0KxjpofnT5n2eeOQ632f\\/xohNgAAAL5JiA0AAIA9OGVZeOxcoIZjjBHtxSH9BYUEC\\/ahp45NXzJKlC3NCc9\\/SPJ+4jE97WkdPwEAAHiREBsAAACtO6aN8Ni44NghZTrBsY2eQgXJJZjzULsIXmWoXUBFa4TYjhNff16hBtp0yrTw\\/NzPG3OO2auxdgEAAAC0TYgNAACAlvU8RpR6jrUL2Jj7cx8O6a9D4JO7lA8Cv03y3cRj7JU+HDNvjOjDxGMO6WtP2z8AAAC8SIgNAACAlr1L\\/fDYbZKfZx77mMv\\/B\\/bjJsmPtYvY2Fi7AF7lWLuAiloYJfq4Uh20ZasxoklfXT91\\/AQAAOBPCbEBAADQqqXhsaFQHeOCY0\\/xpe3e9BQqSC7Bgo+1i+BVers3nzuvsObU6ynA1odTthkjmvS1p+0fAAAA\\/pQQGwAAAK0aFxw7pNwY0bmjvuZ2ZqGunkIFiWDBXvTYIfDJfcqHgbccJSokuh\\/HbDNGNLns6TczjtursXYBAAAAtE+IDQAAgBadsiw81sIY0aFADccCa\\/B6PQaFhNj2obdw5XPjCmseZxwzd6+UCFSzjanB8yVh9Z72tI6fAAAAvIoQGwAAAK1pITyWGCPao2PtAjb2mHXGNFJeT4GXL60RtJx6Pe9WqIG2nDI9PP9uwfl62tPC0gAAALyKEBsAAACtGRcce0qZ8Ni7GCPao55CBYlgwZ701iHwyRqjRG+TfD\\/xGHvl9Y61C5hhTnj+l8zvLtZb10\\/7BwAAgFcRYgMAAKAlp9QPjx1+q2OuoUAN1CHERot6uy+fW+MeHWYcY69ct3Hi6++z7HNCT3tax08AAABeTYgNAACAVhwyfzRX6TGi38089pcYI7pXbzP\\/575HjxHM2YueAi9famWU6OcV6qANp0wPzw8Lz3lcePyeeJ8BAADg1YTYAAAAaMWY+SGiU8qNEX0z89ilnVl6c1O7gC\\/0FhQSLNiP3u7NJ58yf1zjtxglynNbjxF90tOetn8AAAB4NSE2AAAAWrAkPGaM6D7NHRu7lp5CBYnxbnvRW4fA59YIvxxnHHMuXAPtGCe+vkRYvac9reMnAAAAkwixAQAAUNshy74UnjuC9Etjlo0RLd0xKLlcG9Z3m35CBU8EC\\/aht3Dlc+MKaw4TX38fI6Kv1SnbjxFN+trT3mcAAACYRIgNAACA2sbUD4+1Okb0sNK6\\/N5Qu4CN3SX5XLsIXuVYu4BK1hglesj00NJYuAbacMj0APyvKXNP9hRiO9cuAAAAgH0RYgMAAKCmFsJjNwvXGQrUQF09hdHBndMAACAASURBVAoS3XH24jbJ97WLqOS8wppz9rm9cp3GTAvPf0qZzxvHiefdO\\/sHAACASYTYAAAAqKWV8NiY+p3gqKfHoJBgwT4MtQuoaI17dJj4eqNEr9Oc8PyQMt0rewpM6\\/gJAADAZEJsAAAA1DKmfnjsbZIfZx77Kcn7AjVQ11C7gI19iGDBXvQUeHnuMeVDbDeZPkpU2PP6HDI9PP9rynUG7GlP2z8AAABMJsQGAABADUvCYyXHiI4Ljh8iDHQNjrUL2JhgwT702CHwyRr3aO1RovcF12K+MXXGiCb97WnvNQAAAEwmxAYAAMDWSoTHShgzvxNcyc4s1HPI9O5MeydYsA9D7QIqaiHE9illR0ULPNdXc4zo01q9MEoUAACAWYTYAAAA2NqYZeGxFsaIngrUQH09jXZLLt2gHmoXwascaxdQ0RqjRKc+74U9r8shdceIJn2935xrFwAAAMA+CbEBAACwpRbCY3saI3rc6Dy9GmoXsLGxdgG8yiH9dQh8crfCmnPCQ2PpIjpyrF3AV7xPvTGiyWVPGyUKAAAAf0KIDQAAgK20Eh47xRhR+gwKCRbsQ08dm750jaNEqWtOeP5dyobVe9rTOn4CAAAwmxAbAAAAWzmlfnjsmOSnmccaI3pdegoVJJf796F2EbzKULuAitYIsR0nvv68Qg3UMSc8f5fy9+FQeL2WjbULAAAAYL+E2AAAANjCMfXDY0s7wZXuzEJdx9oFbEwXtn04pL8OgU\\/uUv4Z+zbTw9P2yvUYM+3n\\/5jygbND+trT9g8AAACzCbEBAACwtpbGiH4\\/89g1OrNQL0h2k+nj5fZurF0Ar9Jbh8DnWhgl+rhSHWxvzhjRIesEKXthlCgAAACLCLEBAACwtlPmh8f+nvpjRNfozEJdPYUKkks3w4+1i+BVjrULqKiFEJsA23VoZYxo0tf7zbl2AQAAAOybEBsAAABrOmZZeOxdgRpa6QRHO3oKFSSCOXvRY4fAJ\\/cxSpRyxtQfI5pc9vSbFdZt1Vi7AAAAAPZNiA0AAIC1tBIee5f9jhE9VDz3teoxKCSYsw+9hSufG1dY8zjx9UaJXodWxogmfe1pHT8BAABYTIgNAACAtbQQHrtN8vPMY1sYIzr3+vFtx9oFbOwxRrztRU+Bly+1MMbxvEINbOsmyfuJx6wZVu9pTwuAAgAAsJgQGwAAAGtoJTw2Ljh2iDGi16inUEEiWLAXPXYIfHKf5KHwmreZHgK2V\\/bvlGk\\/91Jjy7+mtz091i4AAACA\\/RNiAwAAYA3jgmOHlAmPnZL8MPPYDxFouFZCbLToWLuAisYV1hxmHLPmXjFmcX3HJD9NPOaU8gHKJz291zzGPQ4AAEABQmwAAACUdsr88JgxoqzpbZLvahexoccIse1FT4GXL51XWHPq9bzLup03dfVc102mhyE\\/ZPro0Sl62tPeZwAAAChCiA0AAICSlobHSo31Ghcce8p6nVmoq6dQQSJYsCe93ZtPPqV8ByejRPtzyvQxosMqlfzLceX1W2L\\/AAAAUMRfahcAAADAVRkXHHtKmfDYKcvGiK7ZmYW6egsKnTc4x9tcQkO9eEj58Ze9dQh8bo3wy3HGMUI45Wz9PDimrTGiSV97WsdPAAAAihFiAwAAoJRT6ofHDpnfza21MaI3tQu4MrfpJ1TwZItgwSnz9\\/0e\\/W2FNXsLVz43rrDmMPH19zHus6Qt37taHCOa9LWnBdgAAAAoxjhRAAAASjhk2RjRoVAdY+YHlU5pa4xoT92ttjDULmBjd1k\\/mHNIXwG2ZJ3ARk+Bl+fWGCV6yPR7cixcA9s5pb0xoklfe1qIDQAAgGKE2AAAAChhXHDsKWXCY++SvJl5rDGi16+nUEGyTbCgt2t6n\\/JB1x47BD5pJRAohLNPt5k+RvR91g+r9zRKNNlmbDUAAACdEGIDAABgqRbCY4dcwnBzzR1ByjLHjc5zm2ndeq7BFsGcYYNztGRcYc1hhTX34rzCmsPE168RTGQb48TX32fZ54TXOm5wjlZs0fETAACAjgixAQAAsMQhy74UHopUsWyM6C8pP9KOtgy1C9iYUaLraKVz2DV4TPnreROjRHtxyvSf9VC+jK\\/qaU\\/rYggAAEBRQmwAAAAsMWZZeOyhQA1LOsFt1ZmFuo61C9jYeYNz9BTUSNYbJdpbh8AnrQQCz6WLYHW3SX6eeMxWYfXe9rQQGwAAAEUJsQEAADBXC+Gxw8J1hgI10LZDdAxbw3GDc7TkvMKawwpr7kULIbZP0YVzj8aJr98yrD5sdJ4WGCUKAABAcUJsAAAAzHFIG+Gx9zFGlJfpGFbeTZIfVz5Ha8YV1jyusOYerDVKdOo9qYvU\\/pzS7hjRpK\\/3m3PtAgAAALg+QmwAAADM0UJ47G3mB2n2MEb0tnYBV2KoXcDGxg3O0VNQI1mnY9ch\\/XUIfHJeYc059+RYughW1fIY0cQoUQAAAFhMiA0AAICpWgiP3WRZAGEoUMPabmoXcAUO6S8otEWwoLcQWwujL69JC9dz61GiDxue61q9n\\/j6rcPqxw3PVdsWHT8BAADokBAbAAAAU7QSHhszvxPcrzFGtBe9BYWMEl3HuMKawwpr7sUaIbZjAzW85GHj812bd0nezDhmS8PG56tprF0AAAAA1+kvtQsAAABgV8bUD48t6QT3mMsou2OBOtZ2qF3AFegtxHbe4By9XdPHGCVa0l2Sz4XXfJvp70vnwjWwnkOmd1T7Ndv+jA\\/pa08bJQoAAMAqhNgAAAB4rSXhsU9pY4zod0n+s0AdtO8m0zv37N24wTmOG5yjJS2MvrwmLVzPx5Xq4OK28HpjpoUUS33emKKnPW2UKAAAAKsxThQAAIDXKDFGtET3nfeZ3wmOvvQUKkguwY0txuT2dl1bGH15TVoIsQmwravke\\/ScMaJDynf7e805e3GuXQAAAADXS4gNAACA11gSHis11uuY5K8F1qEPwlblzRnbuGdrdOy6yfyOlnt3nzZGiQqx7cMh7Y8RTS57uqdRomPtAgAAALheQmwAAAD8mWPmh8daGSNKX3oMCo0bnEMwcLneruFz4wprHie+3ijR\\/RjT\\/hjRpK89vVXHTwAAADolxAYAAMBLWhkjekryfYF1aMtxpXV7ChUkl2COUaLlCbGV1cL1PK9QA+XtZYxo0teeFgAFAABgVUJsAAAAvOSU+eGxv6fcGNGfCqxDP461C9jYFsGCY\\/oaJZqUDzz12CHwyX2Sh8Jr3mb6+5MQTvtuso8xokl\\/e3qsXQAAAADXTYgNAACAbzlmfnjsMZdOKksZI8ocPXXGSbYJ5vR2Te9SvqvTsfB6ezKusOYw4xghtvaNmRaYfUydMaJJX8\\/FrTp+AgAA0DEhNgAAAL7GGFH26m366hj2GCG2NbQw+vKanFdYc+r1XCOYSFlvM72z2ZB6P9ee9rQAKAAAAKsTYgMAAOBrTpkfHrtLmS87b2OMKNP1FCpItgkWzBnbuHdCbOV8SvkOTkaJXp854flSnzfmOlY899bsHwAAAFYnxAYAAMCXloTHHjNvxNvXjIXWoS+9BYW2CBYMG5yjJWt07OqtQ+BzrQQChXDaNmb6GNFhlUpep6c9vVXHTwAAADonxAYAAMCXxgXHDik3RvSHAuvQl2P6CRU8OW9wjt6CgecV1uztGj43rrDm1Ot5n7qjRB8qnnsP9jZGNOlrTwuwAQAAsAkhNgAAAJ47ZX54rOQY0Z8LrEN\\/egoVJOt0DPvSIUaJltDbvflkjVGih0x\\/nxoL1zDVQ+Xzt2yPY0STvvZ07WsNAABAJ4TYAAAAeLIkPPaY5F2hOsYFx\\/4tyb9dyT9M11OoINkmWNDbNb1P+cDRbfrrEPiklUCgEE67xuxrjGjS1yjRZJuOnwAAACDEBgAAwH8ZFxx7SpngxynzO8F9SPK+QA3s0210DFvDsME5WjKusOawwpp7cV5hzWHi69cIJvKy21e+7pj9jRFNLnX3YouOnwAAAJBEiA0AAICLU+qHxw5Z1gluKFAD+zXULmBjW40Snftc2KtWOoddg8eUv56H7G+UaI9uXvmaceK6H9JGV72e9nQL1xsAAIBOCLEBAABwSBvhsXHBsafotNO7nkIFyTbj3Xq7pmuNEu2tQ+CTNcIvxxnHnAvXQBmnTNsbrYTVe9vTQmwAAABsRogNAACAccGxp5QJfbxL8mbmscaIckhfoYJkm2BBbyG28wprDiusuRctdLX7lOTjCnWwzDHJTxOPOaWNsPpQu4ANGSUKAADApoTYAAAA+tZCeOyQy5fTc7TSmYV55t57X+otbLVGx7Av3aTcz2cvxhXWPK6w5h6sMUr0JsmPE4\\/RRao9c8eIthJW7+n95ly7AAAAAPoixAYAANCvQ+aHx5KyY0S\\/m3ns+7TRmaW0m9oF7MxQu4CNjRuco6egRrJOx65Dkh8Kr7kX5xXWnHNPjqWLYLFT9jlGNDFKFAAAAFYlxAYAANCvMfPDY7+k\\/hjR+ywL4bXstnYBO3JIf0Eho0TLa2H05TVp4XoaJdqeY\\/Y7RjTpq7PiFh0\\/AQAA4HeE2AAAAPrUQnjssHCdoUAN7F9vQaGtRolOHdu4d+MKaw4rrLkXa4TYjBLdv3Hi61saI5r0tafH2gUAAADQHyE2AACA\\/hzSRnhszLJOcDrskPQXYjtvcI7eruljjBIt6S7J58Jrzrknz4VrYJlTpo\\/iHMqXMdshfe1pIVAAAAA2J8QGAADQn\\/epHx57m\\/qd4Ni\\/m8y\\/j\\/Zq3OAcxw3O0ZIWRl9ekxau5+NKdTDPbZKfJx5Tamx5KT3taaNEAQAAqEKIDQAAoC9vM39MYKnw2E2WBXGGAjVwHXoKFSTJp2zTgbC367pG2Om4wpp70UKIrcUA26faBVQ0Tnx9i2H1oXYBGzrXLgAAAIA+CbEBAAD0o5Xw2Jj6neC4DsJW5b3N\\/P25R2t07LrJ\\/LDw3t1nnVGiU+\\/JFkNsD7ULqOSU6WM4h\\/JlLHKTvkaJjrULAAAAoE9CbAAAAP0YMz+c8mvKjRGdG+74lMsoVEj6DAqdNzjHuw3O0ZIWuoZdk3GFNY0S3a+5Y0RbC6v3tKe36vgJAAAAfyDEBgAA0Iel4bFTgRpKdIIr3eGnVbe1C9iBnkIFTw4rr39K8mblc7RGiK2sFkaznleogWme3sPGice1OEY06WtPC4ACAABQjRAbAADA9WslPDZmWSe4c4Ea9uKmdgE7cKxdQAVrBilOmd4x6RqcC6\\/XY4fAJ\\/cpPzLzNsn3E48RwqnvJtcxRjTpb0+PtQsAAACgX0JsAAAA1+996ofHjqnfCY7r0lNnnCdvUj5gcMxlj\\/cYYPt7ynd37PG+fDKusOYw4xghtvoOuY4xoklfe9ooUQAAAKr6S+0CAAAAWNUxyV9nHmuMKK06ZH4wc+\\/+msu+\\/phlYYPDb+tM7XJ1TcYV1jyusOZetDCa9S7eL1ow9XNHy2H1nkJs59oFAAAA0DchNgAAgOvVSnjslPlBmd7GiPbomOk\\/40PxKvbl+9\\/+6WnEXWkfss6zpafAy3OfYpQo8w21C3jBsXYBG7J\\/AAAAqMo4UQAAgOt1Sv3w2DHJTzOPfUy7nVmAfTutsObb9NshsIUubIkQzh61HFbvaU8\\/xv4BAACgMiE2AACA63RM\\/fBYK53gAJ5bKzTTaxe2ZJ3RrFOv54d4z9iblseIJn3taQE2AAAAqhNiAwAAuD6thMdOmd8J7i59f6F6qF0AXKn7JO9WWrunwMtzn5J8LLzmIckPE4\\/p+T1jr4a0HTzsaU\\/bPwAAAFQnxAYAAHB9TqkfHjtmWSe4oUANe3aoXUDjzrULYJcec3k2reGYfsYOfskoUeZoeYxo0tco0cT+AQAAoAFCbAAAANflNm2Ex94vOHZI251ZaMNd7QLYlacA21rPlp46Nn1pjfDLMPH190keypfBSlofI5qsF3htkfdTAAAAmiDEBgAAcF3GBccOKTdGdOoYuCe9jxHl9ZYEJenLfS6BlNIjL5\\/rNcT2mPLdtA6Z\\/h4yFq5hDQ+1C2jIkPbD6j3taZ+7AAAAaIIQGwAAwPU4pX547DbJzzOPNUaUKc7RPYY\\/d5f1A2y3mT\\/Cee\\/WCL8cZxyzhxDOQ+0CGvH3tD1GNOlvT+9h\\/wAAANABITYAAIDr0Ep4bFxw7Cntd2ahLUMuXbbgS49J\\/pZLN6W1nyvDyuu3bI3wy9QOWJ8iILYXj0ne1S7iFYbaBWzoLj57AQAA0AghNgAAgOswLjj2lPpjRD\\/EeEim+5xL16YPleugLX\\/PZSTlVs+UnsYOPveY8iG2myQ\\/TjxGF6n9GLKPwFRPe9r+AQAAoBlCbAAAAPt3Sv3wWCud4OjPU5Dtf+TSkYk+fUryS5L\\/N9sGZQ7pa+zgcy10YUuWhbjZTqmx5WvrbZTouXYBAAAA8OQvtQsAAACgiF9mHjcWOv+SINwpRsF9TS\\/dxUqFjcbf\\/rnNJQhzm0tXJ67XOZdnx9O\\/1nCbfvbql9YIJB0y7Xp+TvJxhTrW8JB+75VkP2H1nvb0Q3z+AgAAoCH\\/9s9\\/\\/rN2DQD\\/t707LK6rCsMw+g0GiAPigOCgOEBCJURCUAAo4DoAFEAVUBwEB60Dftx2BjpterPPGZ5Jzlr\\/98wW8Mz3AgDwtN3OzA+Lb1\\/N+YoWAAAAAABwUCI2AAAAtrie8xWcLxfevp3zxZP7Hf8DAAAAAAA8MV\\/UHwAAAOBJO81awDZjRhQAAAAAABiX2AAAAFi3ZUb0rzlfYQMAAAAAAA5OxAYAAMCK61mfEZ2Z+ebdewAAAAAA4ODMiQIAALDiNOsB2\\/cjYAMAAAAAAN5xiQ0AAIDHejkzPy++NSMKAAAAAAD8h4gNAACAx7iamfsxIwoAAAAAAOzEnCgAAACPcRozogAAAAAAwI5cYgMAAOBS383ML4tv\\/56Z6\\/2+AgAAAAAAPBciNgAAAC6xdUb025n5Y6\\/PAAAAAAAAz4c5UQAAAC5xmvWA7acRsAEAAAAAAJ\\/gEhsAAACfs3VG9GZm3uz3HQAAAAAA4DkRsQEAAPCQq5l5PTNfLb43IwoAAAAAADzInCgAAAAPuZv1gM2MKAAAAAAA8FkusQEAAPApL2bm98W3ZkQBAAAAAICLuMQGAADAx1zNzGnD+9sRsAEAAAAAABcQsQEAAPAxd7M+I\\/rbzPy631cAAAAAAIDnzJwoAAAAH3ox6zOib2fmelxhAwAAAAAALuQSGwAAAB86bXj7cgRsAAAAAADAI4jYAAAA+Le7MSMKAAAAAAD8j8yJAgAA8N7NzPy5+NaMKAAAAAAAsMQlNgAAAN47bXh7OwI2AAAAAABggYgNAACAmfOM6NeLb1\\/NtgAOAAAAAAA4MHOiAAAAbJ0RvZmZ+91+AwAAAAAAHIpLbAAAAJw2vL0bARsAAAAAALCBiA0AAODYbmfbjOiPO\\/4FAAAAAAA4IHOiAAAAx3YzM1eLb1\\/PzJsd\\/wIAAAAAAByQiA0AAAAAAAAAAICMOVEAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAA6UtklgAABcFJREFUAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAyIjYAAAAAAAAAAAAy\\/wDjwm67SnlB4wAAAABJRU5ErkJggg==\"}', NULL, '2026-01-26 17:34:18');
INSERT INTO `tbl_troqueles_historial` (`id_historial`, `troquel_id`, `campo_modificado`, `valor_anterior`, `valor_nuevo`, `usuario_id`, `fecha_cambio`) VALUES
(4, 'T004', 'update', '{\"id_troquel\":\"T004\",\"nombre\":\"Delta\",\"estado\":\"Pendiente\",\"a\\u00f1o\":2026,\"modelo\":\"G5-PRO\",\"golpes\":\"-\",\"golpes_acum\":\"-\",\"capacidad_golpes\":\"150,000,000\",\"rectificaciones\":\"0\",\"image_url\":null,\"comentarios\":null,\"prensa_asignada\":null,\"tipo_troquel\":\"simple\",\"ubicacion\":\"Plasticos\",\"numero_serie\":\"Almacen\",\"proveedor\":\"Motores Reynosa Nidec\",\"peso_kg\":\"20\",\"dimensiones\":\"1.890x2.380\",\"material_base\":\"aluminio\",\"num_estaciones\":\"0\",\"cavidades\":\"16\",\"color\":null,\"ciclos\":\"0\",\"n_parte_1\":null,\"n_parte_2\":null,\"n_parte_3\":null,\"n_parte_4\":null,\"n_parte_5\":null,\"n_parte_6\":null,\"creado_por\":null,\"actualizado_por\":null,\"creado_en\":\"2026-01-21 09:14:18\",\"actualizado_el\":\"2026-01-21 09:14:18\"}', '{\"id_troquel\":\"T004\",\"nombre\":\"Delta\",\"estado\":\"Pendiente\",\"a\\u00f1o\":2026,\"modelo\":\"G5-PRO\",\"golpes\":\"-\",\"golpes_acum\":\"-\",\"capacidad_golpes\":\"150,000,000\",\"rectificaciones\":\"0\",\"tipo_troquel\":\"progresivo\",\"ubicacion\":\"Plasticos\",\"prensa_asignada\":null,\"numero_serie\":\"Almacen\",\"proveedor\":\"Motores Reynosa Nidec\",\"peso_kg\":\"20\",\"dimensiones\":\"1.890x2.380\",\"material_base\":\"aluminio\",\"num_estaciones\":\"0\",\"cavidades\":\"16\",\"color\":null,\"ciclos\":\"0\",\"n_parte_1\":null,\"n_parte_2\":null,\"n_parte_3\":null,\"n_parte_4\":null,\"n_parte_5\":null,\"n_parte_6\":null,\"comentarios\":null,\"image_url\":null}', NULL, '2026-02-18 17:15:50'),
(5, 'T004', 'update', '{\"id_troquel\":\"T004\",\"nombre\":\"Delta\",\"estado\":\"Pendiente\",\"a\\u00f1o\":2026,\"modelo\":\"G5-PRO\",\"golpes\":\"-\",\"golpes_acum\":\"-\",\"capacidad_golpes\":\"150,000,000\",\"rectificaciones\":\"0\",\"image_url\":null,\"comentarios\":null,\"prensa_asignada\":null,\"tipo_troquel\":\"progresivo\",\"ubicacion\":\"Plasticos\",\"numero_serie\":\"Almacen\",\"proveedor\":\"Motores Reynosa Nidec\",\"peso_kg\":\"20\",\"dimensiones\":\"1.890x2.380\",\"material_base\":\"aluminio\",\"num_estaciones\":\"0\",\"cavidades\":\"16\",\"color\":null,\"ciclos\":\"0\",\"n_parte_1\":null,\"n_parte_2\":null,\"n_parte_3\":null,\"n_parte_4\":null,\"n_parte_5\":null,\"n_parte_6\":null,\"creado_por\":null,\"actualizado_por\":null,\"creado_en\":\"2026-01-21 09:14:18\",\"actualizado_el\":\"2026-02-18 11:15:50\"}', '{\"id_troquel\":\"T004\",\"nombre\":\"Delta\",\"estado\":\"Pendiente\",\"a\\u00f1o\":2026,\"modelo\":\"G5-PRO\",\"golpes\":\"-\",\"golpes_acum\":\"450\",\"capacidad_golpes\":\"150,000,000\",\"rectificaciones\":\"0\",\"tipo_troquel\":\"progresivo\",\"ubicacion\":\"Plasticos\",\"prensa_asignada\":null,\"numero_serie\":\"Almacen\",\"proveedor\":\"Motores Reynosa Nidec\",\"peso_kg\":\"20\",\"dimensiones\":\"1.890x2.380\",\"material_base\":\"aluminio\",\"num_estaciones\":\"0\",\"cavidades\":\"16\",\"color\":null,\"ciclos\":\"0\",\"n_parte_1\":null,\"n_parte_2\":null,\"n_parte_3\":null,\"n_parte_4\":null,\"n_parte_5\":null,\"n_parte_6\":null,\"comentarios\":null,\"image_url\":null}', NULL, '2026-02-18 17:18:23'),
(6, 'T004', 'update', '{\"id_troquel\":\"T004\",\"nombre\":\"Delta\",\"estado\":\"Pendiente\",\"a\\u00f1o\":2026,\"modelo\":\"G5-PRO\",\"golpes\":\"-\",\"golpes_acum\":\"450\",\"capacidad_golpes\":\"150,000,000\",\"rectificaciones\":\"0\",\"image_url\":null,\"comentarios\":null,\"prensa_asignada\":null,\"tipo_troquel\":\"progresivo\",\"ubicacion\":\"Plasticos\",\"numero_serie\":\"Almacen\",\"proveedor\":\"Motores Reynosa Nidec\",\"peso_kg\":\"20\",\"dimensiones\":\"1.890x2.380\",\"material_base\":\"aluminio\",\"num_estaciones\":\"0\",\"cavidades\":\"16\",\"color\":null,\"ciclos\":\"0\",\"n_parte_1\":null,\"n_parte_2\":null,\"n_parte_3\":null,\"n_parte_4\":null,\"n_parte_5\":null,\"n_parte_6\":null,\"creado_por\":null,\"actualizado_por\":null,\"creado_en\":\"2026-01-21 09:14:18\",\"actualizado_el\":\"2026-02-18 11:18:23\"}', '{\"id_troquel\":\"T004\",\"nombre\":\"Delta\",\"estado\":\"Listo\",\"a\\u00f1o\":2026,\"modelo\":\"G5-PRO\",\"golpes\":\"-\",\"golpes_acum\":\"450\",\"capacidad_golpes\":\"150,000,000\",\"rectificaciones\":\"0\",\"tipo_troquel\":\"progresivo\",\"ubicacion\":\"Plasticos\",\"prensa_asignada\":null,\"numero_serie\":\"Almacen\",\"proveedor\":\"Motores Reynosa Nidec\",\"peso_kg\":\"20\",\"dimensiones\":\"1.890x2.380\",\"material_base\":\"aluminio\",\"num_estaciones\":\"0\",\"cavidades\":\"16\",\"color\":null,\"ciclos\":\"0\",\"n_parte_1\":null,\"n_parte_2\":null,\"n_parte_3\":null,\"n_parte_4\":null,\"n_parte_5\":null,\"n_parte_6\":null,\"comentarios\":null,\"image_url\":null}', NULL, '2026-02-18 17:24:53'),
(7, 'T003', 'update', '{\"id_troquel\":\"T003\",\"nombre\":\"Gamma\",\"estado\":\"Reparando\",\"a\\u00f1o\":2022,\"modelo\":\"G4-XLS\",\"golpes\":\"320,100\",\"golpes_acum\":\"156,780,500\",\"capacidad_golpes\":\"300,000,000\",\"rectificaciones\":\"18\",\"image_url\":null,\"comentarios\":null,\"prensa_asignada\":\"Prensa 3\",\"tipo_troquel\":\"transfer\",\"ubicacion\":\"Plasticos\",\"numero_serie\":\"Taller\",\"proveedor\":\"Motores Reynosa Nidec\",\"peso_kg\":\"30\",\"dimensiones\":\"1.890x2.380\",\"material_base\":\"acero templado\",\"num_estaciones\":\"4\",\"cavidades\":\"8\",\"color\":null,\"ciclos\":\"1\",\"n_parte_1\":null,\"n_parte_2\":null,\"n_parte_3\":null,\"n_parte_4\":null,\"n_parte_5\":null,\"n_parte_6\":null,\"creado_por\":null,\"actualizado_por\":null,\"creado_en\":\"2026-01-21 09:14:18\",\"actualizado_el\":\"2026-01-21 09:14:18\"}', '{\"id_troquel\":\"T003\",\"nombre\":\"Gamma\",\"estado\":\"Listo\",\"a\\u00f1o\":2022,\"modelo\":\"G4-XLS\",\"golpes\":\"320,100\",\"golpes_acum\":\"156,780,500\",\"capacidad_golpes\":\"300,000,000\",\"rectificaciones\":\"18\",\"tipo_troquel\":\"transfer\",\"ubicacion\":\"Plasticos\",\"prensa_asignada\":\"Prensa 3\",\"numero_serie\":\"Taller\",\"proveedor\":\"Motores Reynosa Nidec\",\"peso_kg\":\"30\",\"dimensiones\":\"1.890x2.380\",\"material_base\":\"acero templado\",\"num_estaciones\":\"4\",\"cavidades\":\"8\",\"color\":null,\"ciclos\":\"1\",\"n_parte_1\":null,\"n_parte_2\":null,\"n_parte_3\":null,\"n_parte_4\":null,\"n_parte_5\":null,\"n_parte_6\":null,\"comentarios\":null,\"image_url\":null}', NULL, '2026-02-18 17:27:18');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_usuarios`
--

CREATE TABLE `tbl_usuarios` (
  `id_usuario` int(11) NOT NULL,
  `nombre_usuario` varchar(50) NOT NULL,
  `acceso` varchar(255) NOT NULL,
  `nombre_completo` varchar(100) NOT NULL,
  `rol` enum('admin','supervisor','operator') DEFAULT 'operator',
  `activo` tinyint(1) DEFAULT 1,
  `ultimo_acceso` datetime DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbl_usuarios`
--

INSERT INTO `tbl_usuarios` (`id_usuario`, `nombre_usuario`, `acceso`, `nombre_completo`, `rol`, `activo`, `ultimo_acceso`, `fecha_creacion`, `fecha_modificacion`) VALUES
(1, 'admin', '$2y$10$M4mdwKL3Ya.fwZx9QyJdzOR/dAIWVkb94csvRmOjvv7nf0xA2hTcG', 'Administrador Sistema', 'admin', 1, '2026-02-18 11:57:09', '2026-01-19 19:30:48', '2026-02-18 17:57:09'),
(2, 'supervisor', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Supervisor Tool Room', 'supervisor', 1, NULL, '2026-01-19 19:31:20', '2026-01-19 19:31:20'),
(3, 'operador', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Operador Tool Room', 'operator', 1, NULL, '2026-01-19 19:31:20', '2026-01-19 19:31:20');

-- --------------------------------------------------------

--
-- Stand-in structure for view `vw_estadisticas_troquel`
-- (See below for the actual view)
--
CREATE TABLE `vw_estadisticas_troquel` (
`troquel_id` varchar(20)
,`troquel_nombre` varchar(100)
,`total_reparaciones` bigint(21)
,`reparaciones_completadas` bigint(21)
,`reparaciones_activas` bigint(21)
,`promedio_horas_reparacion` decimal(14,6)
,`min_horas_reparacion` decimal(10,2)
,`max_horas_reparacion` decimal(10,2)
,`total_fallas` decimal(22,0)
,`total_limpiezas` decimal(22,0)
,`total_cambios_modelo` decimal(22,0)
,`total_mantenimientos` decimal(22,0)
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `vw_historial_reparaciones`
-- (See below for the actual view)
--
CREATE TABLE `vw_historial_reparaciones` (
`id_ciclo_reparacion` int(11)
,`troquel_id` varchar(20)
,`troquel_nombre` varchar(100)
,`modelo` varchar(100)
,`fecha_inicio_reparacion` datetime
,`fecha_fin_reparacion` datetime
,`motivo_entrada` enum('Falla de Troquel','Limpieza General','Cambio de Modelo','Mantenimiento Preventivo','Otro')
,`falla_descripcion` varchar(255)
,`status_anterior` varchar(50)
,`status_salida` varchar(50)
,`tiempo_reparacion_horas` decimal(10,2)
,`prensa_origen` varchar(50)
,`empleado_registro` varchar(100)
,`empleado_cierre` varchar(100)
,`clasificacion_tiempo` varchar(20)
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `vw_reparaciones_activas`
-- (See below for the actual view)
--
CREATE TABLE `vw_reparaciones_activas` (
`id_ciclo_reparacion` int(11)
,`troquel_id` varchar(20)
,`troquel_nombre` varchar(100)
,`modelo` varchar(100)
,`fecha_inicio_reparacion` datetime
,`motivo_entrada` enum('Falla de Troquel','Limpieza General','Cambio de Modelo','Mantenimiento Preventivo','Otro')
,`falla_descripcion` varchar(255)
,`prioridad` tinyint(4)
,`prensa_origen` varchar(50)
,`horas_en_reparacion` bigint(21)
,`dias_en_reparacion` bigint(21)
,`tecnicos_asignados` mediumtext
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `vw_resumen_mensual`
-- (See below for the actual view)
--
CREATE TABLE `vw_resumen_mensual` (
`anio` int(4)
,`mes` int(2)
,`periodo` varchar(7)
,`total_reparaciones` bigint(21)
,`completadas` bigint(21)
,`promedio_horas` decimal(14,6)
,`por_falla` decimal(22,0)
,`por_limpieza` decimal(22,0)
,`por_cambio_modelo` decimal(22,0)
);

-- --------------------------------------------------------

--
-- Structure for view `vw_estadisticas_troquel`
--
DROP TABLE IF EXISTS `vw_estadisticas_troquel`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vw_estadisticas_troquel`  AS SELECT `tbl_ciclos_reparacion`.`troquel_id` AS `troquel_id`, `tbl_ciclos_reparacion`.`troquel_nombre` AS `troquel_nombre`, count(0) AS `total_reparaciones`, count(case when `tbl_ciclos_reparacion`.`ciclo_activo` = 0 then 1 end) AS `reparaciones_completadas`, count(case when `tbl_ciclos_reparacion`.`ciclo_activo` = 1 then 1 end) AS `reparaciones_activas`, avg(case when `tbl_ciclos_reparacion`.`ciclo_activo` = 0 then `tbl_ciclos_reparacion`.`tiempo_reparacion_horas` end) AS `promedio_horas_reparacion`, min(case when `tbl_ciclos_reparacion`.`ciclo_activo` = 0 then `tbl_ciclos_reparacion`.`tiempo_reparacion_horas` end) AS `min_horas_reparacion`, max(case when `tbl_ciclos_reparacion`.`ciclo_activo` = 0 then `tbl_ciclos_reparacion`.`tiempo_reparacion_horas` end) AS `max_horas_reparacion`, sum(case when `tbl_ciclos_reparacion`.`motivo_entrada` = 'Falla de Troquel' then 1 else 0 end) AS `total_fallas`, sum(case when `tbl_ciclos_reparacion`.`motivo_entrada` = 'Limpieza General' then 1 else 0 end) AS `total_limpiezas`, sum(case when `tbl_ciclos_reparacion`.`motivo_entrada` = 'Cambio de Modelo' then 1 else 0 end) AS `total_cambios_modelo`, sum(case when `tbl_ciclos_reparacion`.`motivo_entrada` = 'Mantenimiento Preventivo' then 1 else 0 end) AS `total_mantenimientos` FROM `tbl_ciclos_reparacion` GROUP BY `tbl_ciclos_reparacion`.`troquel_id`, `tbl_ciclos_reparacion`.`troquel_nombre` ;

-- --------------------------------------------------------

--
-- Structure for view `vw_historial_reparaciones`
--
DROP TABLE IF EXISTS `vw_historial_reparaciones`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vw_historial_reparaciones`  AS SELECT `cr`.`id_ciclo_reparacion` AS `id_ciclo_reparacion`, `cr`.`troquel_id` AS `troquel_id`, `cr`.`troquel_nombre` AS `troquel_nombre`, `cr`.`modelo` AS `modelo`, `cr`.`fecha_inicio_reparacion` AS `fecha_inicio_reparacion`, `cr`.`fecha_fin_reparacion` AS `fecha_fin_reparacion`, `cr`.`motivo_entrada` AS `motivo_entrada`, `cr`.`falla_descripcion` AS `falla_descripcion`, `cr`.`status_anterior` AS `status_anterior`, `cr`.`status_salida` AS `status_salida`, `cr`.`tiempo_reparacion_horas` AS `tiempo_reparacion_horas`, `cr`.`prensa_origen` AS `prensa_origen`, `cr`.`empleado_registro` AS `empleado_registro`, `cr`.`empleado_cierre` AS `empleado_cierre`, CASE WHEN `cr`.`tiempo_reparacion_horas` <= 4 THEN 'Rápida (≤4h)' WHEN `cr`.`tiempo_reparacion_horas` <= 24 THEN 'Normal (4-24h)' WHEN `cr`.`tiempo_reparacion_horas` <= 72 THEN 'Extendida (1-3 días)' ELSE 'Prolongada (>3 días)' END AS `clasificacion_tiempo` FROM `tbl_ciclos_reparacion` AS `cr` WHERE `cr`.`ciclo_activo` = 0 ORDER BY `cr`.`fecha_fin_reparacion` DESC ;

-- --------------------------------------------------------

--
-- Structure for view `vw_reparaciones_activas`
--
DROP TABLE IF EXISTS `vw_reparaciones_activas`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vw_reparaciones_activas`  AS SELECT `cr`.`id_ciclo_reparacion` AS `id_ciclo_reparacion`, `cr`.`troquel_id` AS `troquel_id`, `cr`.`troquel_nombre` AS `troquel_nombre`, `cr`.`modelo` AS `modelo`, `cr`.`fecha_inicio_reparacion` AS `fecha_inicio_reparacion`, `cr`.`motivo_entrada` AS `motivo_entrada`, `cr`.`falla_descripcion` AS `falla_descripcion`, `cr`.`prioridad` AS `prioridad`, `cr`.`prensa_origen` AS `prensa_origen`, timestampdiff(HOUR,`cr`.`fecha_inicio_reparacion`,current_timestamp()) AS `horas_en_reparacion`, timestampdiff(DAY,`cr`.`fecha_inicio_reparacion`,current_timestamp()) AS `dias_en_reparacion`, group_concat(distinct `tc`.`empleado_nombre` separator ', ') AS `tecnicos_asignados` FROM (`tbl_ciclos_reparacion` `cr` left join `tbl_tecnicos_ciclo` `tc` on(`cr`.`id_ciclo_reparacion` = `tc`.`ciclo_id` and `tc`.`fecha_fin` is null)) WHERE `cr`.`ciclo_activo` = 1 GROUP BY `cr`.`id_ciclo_reparacion` ORDER BY `cr`.`prioridad` ASC, `cr`.`fecha_inicio_reparacion` ASC ;

-- --------------------------------------------------------

--
-- Structure for view `vw_resumen_mensual`
--
DROP TABLE IF EXISTS `vw_resumen_mensual`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vw_resumen_mensual`  AS SELECT year(`tbl_ciclos_reparacion`.`fecha_inicio_reparacion`) AS `anio`, month(`tbl_ciclos_reparacion`.`fecha_inicio_reparacion`) AS `mes`, date_format(`tbl_ciclos_reparacion`.`fecha_inicio_reparacion`,'%Y-%m') AS `periodo`, count(0) AS `total_reparaciones`, count(case when `tbl_ciclos_reparacion`.`ciclo_activo` = 0 then 1 end) AS `completadas`, avg(case when `tbl_ciclos_reparacion`.`ciclo_activo` = 0 then `tbl_ciclos_reparacion`.`tiempo_reparacion_horas` end) AS `promedio_horas`, sum(case when `tbl_ciclos_reparacion`.`motivo_entrada` = 'Falla de Troquel' then 1 else 0 end) AS `por_falla`, sum(case when `tbl_ciclos_reparacion`.`motivo_entrada` = 'Limpieza General' then 1 else 0 end) AS `por_limpieza`, sum(case when `tbl_ciclos_reparacion`.`motivo_entrada` = 'Cambio de Modelo' then 1 else 0 end) AS `por_cambio_modelo` FROM `tbl_ciclos_reparacion` GROUP BY year(`tbl_ciclos_reparacion`.`fecha_inicio_reparacion`), month(`tbl_ciclos_reparacion`.`fecha_inicio_reparacion`) ORDER BY year(`tbl_ciclos_reparacion`.`fecha_inicio_reparacion`) DESC, month(`tbl_ciclos_reparacion`.`fecha_inicio_reparacion`) DESC ;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `tbl_asistencia_prensa`
--
ALTER TABLE `tbl_asistencia_prensa`
  ADD PRIMARY KEY (`id_asistencia_prensa`);

--
-- Indexes for table `tbl_ciclos_reparacion`
--
ALTER TABLE `tbl_ciclos_reparacion`
  ADD PRIMARY KEY (`id_ciclo_reparacion`),
  ADD KEY `idx_troquel` (`troquel_id`),
  ADD KEY `idx_fecha_inicio` (`fecha_inicio_reparacion`),
  ADD KEY `idx_fecha_fin` (`fecha_fin_reparacion`),
  ADD KEY `idx_ciclo_activo` (`ciclo_activo`),
  ADD KEY `idx_motivo` (`motivo_entrada`),
  ADD KEY `idx_prioridad` (`prioridad`),
  ADD KEY `fk_falla` (`falla_id`);

--
-- Indexes for table `tbl_estados`
--
ALTER TABLE `tbl_estados`
  ADD PRIMARY KEY (`id_estado`),
  ADD UNIQUE KEY `codigo` (`codigo`),
  ADD KEY `idx_estados_activo_orden` (`activo`,`orden`);

--
-- Indexes for table `tbl_fallas_catalogo`
--
ALTER TABLE `tbl_fallas_catalogo`
  ADD PRIMARY KEY (`id_fallas_catalogo`);

--
-- Indexes for table `tbl_historial`
--
ALTER TABLE `tbl_historial`
  ADD PRIMARY KEY (`id_historial`),
  ADD KEY `idx_troquel` (`troquel_id`),
  ADD KEY `idx_fecha` (`creado_el`),
  ADD KEY `idx_falla` (`id_falla`);

--
-- Indexes for table `tbl_modelos_troquel`
--
ALTER TABLE `tbl_modelos_troquel`
  ADD PRIMARY KEY (`id_modelo`),
  ADD UNIQUE KEY `unique_modelo_troquel` (`nombre_modelo`,`troquel_id`);

--
-- Indexes for table `tbl_prensas`
--
ALTER TABLE `tbl_prensas`
  ADD PRIMARY KEY (`id_prensa`),
  ADD UNIQUE KEY `identificador_prensa` (`identificador_prensa`),
  ADD KEY `idx_prensas_estado` (`estado`);

--
-- Indexes for table `tbl_prioridad_reparacion`
--
ALTER TABLE `tbl_prioridad_reparacion`
  ADD PRIMARY KEY (`id_prioridad_reparacion`),
  ADD UNIQUE KEY `prioridad` (`prioridad`);

--
-- Indexes for table `tbl_resumen_troqueles`
--
ALTER TABLE `tbl_resumen_troqueles`
  ADD PRIMARY KEY (`id_resumen_troqueles`),
  ADD UNIQUE KEY `etiqueta` (`etiqueta`);

--
-- Indexes for table `tbl_tecnicos_ciclo`
--
ALTER TABLE `tbl_tecnicos_ciclo`
  ADD PRIMARY KEY (`id_tecnicos_ciclos`),
  ADD KEY `idx_ciclo` (`ciclo_id`),
  ADD KEY `idx_empleado` (`empleado_numero`);

--
-- Indexes for table `tbl_tipos_troquel`
--
ALTER TABLE `tbl_tipos_troquel`
  ADD PRIMARY KEY (`id_tipo_troquel`),
  ADD UNIQUE KEY `codigo` (`codigo`),
  ADD KEY `idx_tipos_activo` (`activo`);

--
-- Indexes for table `tbl_troqueles`
--
ALTER TABLE `tbl_troqueles`
  ADD PRIMARY KEY (`id_troquel`),
  ADD KEY `idx_estado` (`estado`),
  ADD KEY `idx_año` (`año`),
  ADD KEY `idx_prensa` (`prensa_asignada`),
  ADD KEY `idx_tipo` (`tipo_troquel`),
  ADD KEY `idx_creado` (`creado_en`);

--
-- Indexes for table `tbl_troqueles_historial`
--
ALTER TABLE `tbl_troqueles_historial`
  ADD PRIMARY KEY (`id_historial`),
  ADD KEY `idx_troquel` (`troquel_id`),
  ADD KEY `idx_fecha` (`fecha_cambio`);

--
-- Indexes for table `tbl_usuarios`
--
ALTER TABLE `tbl_usuarios`
  ADD PRIMARY KEY (`id_usuario`),
  ADD UNIQUE KEY `nombre_usuario` (`nombre_usuario`),
  ADD KEY `idx_username` (`nombre_usuario`),
  ADD KEY `idx_rol` (`rol`),
  ADD KEY `idx_activo` (`activo`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `tbl_asistencia_prensa`
--
ALTER TABLE `tbl_asistencia_prensa`
  MODIFY `id_asistencia_prensa` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=43;

--
-- AUTO_INCREMENT for table `tbl_ciclos_reparacion`
--
ALTER TABLE `tbl_ciclos_reparacion`
  MODIFY `id_ciclo_reparacion` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `tbl_estados`
--
ALTER TABLE `tbl_estados`
  MODIFY `id_estado` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `tbl_fallas_catalogo`
--
ALTER TABLE `tbl_fallas_catalogo`
  MODIFY `id_fallas_catalogo` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=73;

--
-- AUTO_INCREMENT for table `tbl_historial`
--
ALTER TABLE `tbl_historial`
  MODIFY `id_historial` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `tbl_modelos_troquel`
--
ALTER TABLE `tbl_modelos_troquel`
  MODIFY `id_modelo` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `tbl_prensas`
--
ALTER TABLE `tbl_prensas`
  MODIFY `id_prensa` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `tbl_prioridad_reparacion`
--
ALTER TABLE `tbl_prioridad_reparacion`
  MODIFY `id_prioridad_reparacion` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `tbl_resumen_troqueles`
--
ALTER TABLE `tbl_resumen_troqueles`
  MODIFY `id_resumen_troqueles` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `tbl_tecnicos_ciclo`
--
ALTER TABLE `tbl_tecnicos_ciclo`
  MODIFY `id_tecnicos_ciclos` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tbl_tipos_troquel`
--
ALTER TABLE `tbl_tipos_troquel`
  MODIFY `id_tipo_troquel` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `tbl_troqueles_historial`
--
ALTER TABLE `tbl_troqueles_historial`
  MODIFY `id_historial` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `tbl_usuarios`
--
ALTER TABLE `tbl_usuarios`
  MODIFY `id_usuario` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `tbl_ciclos_reparacion`
--
ALTER TABLE `tbl_ciclos_reparacion`
  ADD CONSTRAINT `fk_falla` FOREIGN KEY (`falla_id`) REFERENCES `tbl_fallas_catalogo` (`id_fallas_catalogo`) ON DELETE SET NULL;

--
-- Constraints for table `tbl_tecnicos_ciclo`
--
ALTER TABLE `tbl_tecnicos_ciclo`
  ADD CONSTRAINT `tbl_tecnicos_ciclo_ibfk_1` FOREIGN KEY (`ciclo_id`) REFERENCES `tbl_ciclos_reparacion` (`id_ciclo_reparacion`) ON DELETE CASCADE;

--
-- Constraints for table `tbl_troqueles_historial`
--
ALTER TABLE `tbl_troqueles_historial`
  ADD CONSTRAINT `tbl_troqueles_historial_ibfk_1` FOREIGN KEY (`troquel_id`) REFERENCES `tbl_troqueles` (`id_troquel`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
