SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

-- Database: `ekanban_toolroom_db`

-- Table structure for table `tbl_asistencia_prensa`

CREATE TABLE `tbl_asistencia_prensa` (
  `id_asistencia_prensa` int(11) NOT NULL,
  `descripcion` varchar(255) NOT NULL,
  `activo` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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

-- Table structure for table `tbl_estados`

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

-- Dumping data for table `tbl_estados`
INSERT INTO `tbl_estados` (`id_estado`, `codigo`, `nombre`, `color`, `descripcion`, `orden`, `activo`, `creado_en`) VALUES
(1, 'Pendiente', 'Pendiente', '#ff6b6b', 'Troquel pendiente de revisión o asignación', 1, 1, '2026-01-23 14:52:12'),
(2, 'En prensa', 'En Prensa', '#00ff88', 'Troquel actualmente en producción', 2, 1, '2026-01-23 14:52:12'),
(3, 'Listo', 'Listo', '#64ff64', 'Troquel listo para uso', 3, 1, '2026-01-23 14:52:12'),
(4, 'Listo-BackUp', 'Listo - BackUp', '#00c8ff', 'Troquel listo como respaldo', 4, 1, '2026-01-23 14:52:12'),
(5, 'Reparando', 'Reparando', '#ffc800', 'Troquel en proceso de reparación', 5, 1, '2026-01-23 14:52:12'),
(6, 'Baja', 'Baja / Obsoleto', '#888888', 'Troquel dado de baja o obsoleto', 6, 1, '2026-01-23 14:52:12');

-- Table structure for table `tbl_fallas_catalogo`
CREATE TABLE `tbl_fallas_catalogo` (
  `id_fallas_catalogo` int(11) NOT NULL,
  `descripcion` varchar(255) NOT NULL,
  `activo` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table `tbl_fallas_catalogo`
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

-- Table structure for table `tbl_prensas`
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
  `actualizado_en` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table `tbl_prensas`
INSERT INTO `tbl_prensas` (`id_prensa`, `identificador_prensa`, `nombre`, `modelo`, `descripcion`, `tonelaje`, `estado`, `ubicacion`, `creado_en`, `actualizado_en`) VALUES
(1, '', 'Prensa 8', NULL, 'Prensa de alta capacidad', 200, 'activa', NULL, '2026-01-23 14:51:09', '2026-01-23 14:51:09');

-- Table structure for table `tbl_prioridad_reparacion`
CREATE TABLE `tbl_prioridad_reparacion` (
  `id_prioridad_reparacion` int(11) NOT NULL,
  `prioridad` int(11) NOT NULL,
  `id_troquel` varchar(10) NOT NULL,
  `creado_el` timestamp NOT NULL DEFAULT current_timestamp(),
  `actualizado_el` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table `tbl_prioridad_reparacion`
INSERT INTO `tbl_prioridad_reparacion` (`id_prioridad_reparacion`, `prioridad`, `id_troquel`, `creado_el`, `actualizado_el`) VALUES
(1, 1, 'T954', '2026-01-12 15:08:54', '2026-01-12 15:08:54'),
(2, 2, 'T953', '2026-01-12 15:08:54', '2026-01-12 15:08:54'),
(3, 3, 'T951', '2026-01-12 15:08:54', '2026-01-12 15:08:54'),
(4, 4, 'T955', '2026-01-12 15:08:54', '2026-01-12 15:08:54'),
(5, 5, 'T952', '2026-01-12 15:08:54', '2026-01-12 15:08:54');

-- Table structure for table `tbl_resumen_troqueles`
CREATE TABLE `tbl_resumen_troqueles` (
  `id_resumen_troqueles` int(11) NOT NULL,
  `etiqueta` enum('UP','BACKUP','TOTAL') NOT NULL,
  `count` varchar(20) DEFAULT '-',
  `goal` varchar(20) DEFAULT '-',
  `perf` varchar(20) DEFAULT '-',
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table `tbl_resumen_troqueles`
INSERT INTO `tbl_resumen_troqueles` (`id_resumen_troqueles`, `etiqueta`, `count`, `goal`, `perf`, `updated_at`) VALUES
(1, 'UP', '-', '-', '-', '2026-01-12 15:09:52'),
(2, 'BACKUP', '-', '-', '-', '2026-01-12 15:09:52'),
(3, 'TOTAL', '-', '-', '-', '2026-01-12 15:09:52');

-- Table structure for table `tbl_tipos_troquel`
CREATE TABLE `tbl_tipos_troquel` (
  `id_tipo_troquel` int(11) NOT NULL,
  `codigo` varchar(20) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `activo` tinyint(1) DEFAULT 1,
  `creado_en` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table `tbl_tipos_troquel`
INSERT INTO `tbl_tipos_troquel` (`id_tipo_troquel`, `codigo`, `nombre`, `descripcion`, `activo`, `creado_en`) VALUES
(1, 'progresivo', 'Progresivo', 'Troquel de estaciones progresivas para operaciones secuenciales', 1, '2026-01-23 14:51:41'),
(2, 'transfer', 'Transfer', 'Troquel tipo transfer para piezas grandes', 1, '2026-01-23 14:51:41'),
(3, 'compound', 'Compound', 'Troquel compuesto para operaciones simultáneas', 1, '2026-01-23 14:51:41'),
(4, 'simple', 'Simple', 'Troquel de operación simple', 1, '2026-01-23 14:51:41'),
(5, 'blanking', 'Blanking', 'Troquel para corte de forma', 1, '2026-01-23 14:51:41'),
(6, 'bending', 'Doblado', 'Troquel para operaciones de doblado', 1, '2026-01-23 14:51:41'),
(7, 'drawing', 'Embutido', 'Troquel para embutido de piezas', 1, '2026-01-23 14:51:41');

-- Table structure for table `tbl_troqueles`
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

-- Dumping data for table `tbl_troqueles`
INSERT INTO `tbl_troqueles` (`id_troquel`, `nombre`, `estado`, `año`, `modelo`, `golpes`, `golpes_acum`, `capacidad_golpes`, `rectificaciones`, `image_url`, `comentarios`, `prensa_asignada`, `tipo_troquel`, `ubicacion`, `numero_serie`, `proveedor`, `peso_kg`, `dimensiones`, `material_base`, `num_estaciones`, `cavidades`, `color`, `ciclos`, `n_parte_1`, `n_parte_2`, `n_parte_3`, `n_parte_4`, `n_parte_5`, `n_parte_6`, `creado_por`, `actualizado_por`, `creado_en`, `actualizado_el`) VALUES
('T001', 'Alpha', 'En prensa', 2024, 'G3-VSS', '257,540', '121,442,752', '250,000,000', '15', NULL, NULL, 'Prensa 1', 'progresivo', 'Plasticos', 'Rack A-01', 'Motores Reynosa Nidec', '20', '1.890x2.380', 'aluminio', '2', '8', NULL, '2', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-01-21 15:14:18', '2026-01-21 15:14:18'),
('T002', 'Beta', 'Listo', 2023, 'G3-VTS', '180,200', '95,320,100', '250,000,000', '12', NULL, NULL, 'Prensa 2', 'progresivo', 'Plasticos', 'Rack A-02', 'Motores Reynosa Nidec', '20', '1.890x2.380', 'aluminio', '3', '10', NULL, '5', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-01-21 15:14:18', '2026-01-21 15:14:18'),
('T003', 'Gamma', 'Reparando', 2022, 'G4-XLS', '320,100', '156,780,500', '300,000,000', '18', NULL, NULL, 'Prensa 3', 'transfer', 'Plasticos', 'Taller', 'Motores Reynosa Nidec', '30', '1.890x2.380', 'acero templado', '4', '8', NULL, '1', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-01-21 15:14:18', '2026-01-21 15:14:18'),
('T004', 'Delta', 'Pendiente', 2026, 'G5-PRO', '-', '-', '150,000,000', '0', NULL, NULL, NULL, 'simple', 'Plasticos', 'Almacen', 'Motores Reynosa Nidec', '20', '1.890x2.380', 'aluminio', '0', '16', NULL, '0', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-01-21 15:14:18', '2026-01-21 15:14:18'),
('T006', 'Echo', 'Listo-BackUp', 2025, 'G7-RTX', '10', '10', '10,000,000', '0', NULL, 'actualizacion', NULL, 'transfer', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-01-23 19:45:34', '2026-01-26 15:54:18'),
('T007', 'Charlie', 'Baja', 2027, 'TR-30V', '50', '500', '50,000,000', '10', NULL, 'actualizacion', '1', 'Null', NULL, NULL, NULL, NULL, NULL, NULL, '2', '8', 'azul', '10', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-01-26 17:13:20', '2026-01-26 17:20:18');

-- Table structure for table `tbl_troqueles_historial`
CREATE TABLE `tbl_troqueles_historial` (
  `id_historial` int(11) NOT NULL,
  `troquel_id` varchar(20) NOT NULL,
  `campo_modificado` varchar(50) NOT NULL,
  `valor_anterior` text DEFAULT NULL,
  `valor_nuevo` text DEFAULT NULL,
  `usuario_id` int(11) DEFAULT NULL,
  `fecha_cambio` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table `tbl_troqueles_historial`
INSERT INTO `tbl_troqueles_historial` (`id_historial`, `troquel_id`, `campo_modificado`, `valor_anterior`, `valor_nuevo`, `usuario_id`, `fecha_cambio`) VALUES
(1, 'T006', 'update', '{\"id_troquel\":\"T006\",\"nombre\":\"Echo\",\"estado\":\"Listo-BackUp\",\"a\\u00f1o\":2025,\"modelo\":\"G7-RTX\",\"golpes\":\"-\",\"golpes_acum\":\"0\",\"capacidad_golpes\":\"-\",\"rectificaciones\":\"0\",\"image_url\":null,\"comentarios\":null,\"prensa_asignada\":null,\"tipo_troquel\":\"\",\"ubicacion\":null,\"numero_serie\":null,\"proveedor\":null,\"peso_kg\":null,\"dimensiones\":null,\"material_base\":null,\"num_estaciones\":null,\"cavidades\":null,\"color\":null,\"ciclos\":null,\"n_parte_1\":null,\"n_parte_2\":null,\"n_parte_3\":null,\"n_parte_4\":null,\"n_parte_5\":null,\"n_parte_6\":null,\"creado_por\":null,\"actualizado_por\":null,\"creado_en\":\"2026-01-23 13:45:34\",\"actualizado_el\":\"2026-01-23 13:45:34\"}', '{\"id_troquel\":\"T006\",\"nombre\":\"Echo\",\"estado\":\"Listo-BackUp\",\"a\\u00f1o\":2025,\"modelo\":\"G7-RTX\",\"golpes\":\"10\",\"golpes_acum\":\"10\",\"capacidad_golpes\":\"10,000,000\",\"rectificaciones\":\"0\",\"tipo_troquel\":\"transfer\",\"ubicacion\":null,\"prensa_asignada\":null,\"numero_serie\":null,\"proveedor\":null,\"peso_kg\":null,\"dimensiones\":null,\"material_base\":null,\"num_estaciones\":null,\"vida_util_estimada\":null,\"comentarios\":\"actualizacion\",\"image_url\":null}', NULL, '2026-01-26 15:54:18'),
(2, 'T007', 'update', '{\"id_troquel\":\"T007\",\"nombre\":\"Charlie\",\"estado\":\"Baja\",\"a\\u00f1o\":2027,\"modelo\":\"TR-30V\",\"golpes\":\"50\",\"golpes_acum\":\"500\",\"capacidad_golpes\":\"50,000,000\",\"rectificaciones\":\"10\",\"image_url\":null,\"comentarios\":null,\"prensa_asignada\":\"1\",\"tipo_troquel\":\"\",\"ubicacion\":null,\"numero_serie\":null,\"proveedor\":null,\"peso_kg\":null,\"dimensiones\":null,\"material_base\":null,\"num_estaciones\":\"2\",\"cavidades\":\"8\",\"color\":\"azul\",\"ciclos\":\"10\",\"n_parte_1\":null,\"n_parte_2\":null,\"n_parte_3\":null,\"n_parte_4\":null,\"n_parte_5\":null,\"n_parte_6\":null,\"creado_por\":null,\"actualizado_por\":null,\"creado_en\":\"2026-01-26 11:13:20\",\"actualizado_el\":\"2026-01-26 11:13:20\"}', '{\"id_troquel\":\"T007\",\"nombre\":\"Charlie\",\"estado\":\"Baja\",\"a\\u00f1o\":2027,\"modelo\":\"TR-30V\",\"golpes\":\"50\",\"golpes_acum\":\"500\",\"capacidad_golpes\":\"50,000,000\",\"rectificaciones\":\"10\",\"tipo_troquel\":\"Null\",\"ubicacion\":null,\"prensa_asignada\":\"1\",\"numero_serie\":null,\"proveedor\":null,\"peso_kg\":null,\"dimensiones\":null,\"material_base\":null,\"num_estaciones\":\"2\",\"cavidades\":\"8\",\"color\":\"azul\",\"ciclos\":\"10\",\"n_parte_1\":null,\"n_parte_2\":null,\"n_parte_3\":null,\"n_parte_4\":null,\"n_parte_5\":null,\"n_parte_6\":null,\"comentarios\":\"actualizacion\",\"image_url\":null}', NULL, '2026-01-26 17:20:18');

-- Table structure for table `tbl_usuarios`
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

-- Dumping data for table `tbl_usuarios`
INSERT INTO `tbl_usuarios` (`id_usuario`, `nombre_usuario`, `acceso`, `nombre_completo`, `rol`, `activo`, `ultimo_acceso`, `fecha_creacion`, `fecha_modificacion`) VALUES
(1, 'admin', '$2y$10$M4mdwKL3Ya.fwZx9QyJdzOR/dAIWVkb94csvRmOjvv7nf0xA2hTcG', 'Administrador Sistema', 'admin', 1, '2026-01-26 11:12:29', '2026-01-19 19:30:48', '2026-01-26 17:12:29'),
(2, 'supervisor', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Supervisor Tool Room', 'supervisor', 1, NULL, '2026-01-19 19:31:20', '2026-01-19 19:31:20'),
(3, 'operador', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Operador Tool Room', 'operator', 1, NULL, '2026-01-19 19:31:20', '2026-01-19 19:31:20');

-- Indexes for table `tbl_asistencia_prensa`
ALTER TABLE `tbl_asistencia_prensa`
  ADD PRIMARY KEY (`id_asistencia_prensa`);

-- Indexes for table `tbl_estados`
ALTER TABLE `tbl_estados`
  ADD PRIMARY KEY (`id_estado`),
  ADD UNIQUE KEY `codigo` (`codigo`),
  ADD KEY `idx_estados_activo_orden` (`activo`,`orden`);

-- Indexes for table `tbl_fallas_catalogo`
ALTER TABLE `tbl_fallas_catalogo`
  ADD PRIMARY KEY (`id_fallas_catalogo`);

-- Indexes for table `tbl_prensas`
ALTER TABLE `tbl_prensas`
  ADD PRIMARY KEY (`id_prensa`),
  ADD UNIQUE KEY `identificador_prensa` (`identificador_prensa`),
  ADD KEY `idx_prensas_estado` (`estado`);

-- Indexes for table `tbl_prioridad_reparacion`
ALTER TABLE `tbl_prioridad_reparacion`
  ADD PRIMARY KEY (`id_prioridad_reparacion`),
  ADD UNIQUE KEY `prioridad` (`prioridad`);

-- Indexes for table `tbl_resumen_troqueles`
ALTER TABLE `tbl_resumen_troqueles`
  ADD PRIMARY KEY (`id_resumen_troqueles`),
  ADD UNIQUE KEY `etiqueta` (`etiqueta`);

-- Indexes for table `tbl_tipos_troquel`
ALTER TABLE `tbl_tipos_troquel`
  ADD PRIMARY KEY (`id_tipo_troquel`),
  ADD UNIQUE KEY `codigo` (`codigo`),
  ADD KEY `idx_tipos_activo` (`activo`);

-- Indexes for table `tbl_troqueles`
ALTER TABLE `tbl_troqueles`
  ADD PRIMARY KEY (`id_troquel`),
  ADD KEY `idx_estado` (`estado`),
  ADD KEY `idx_año` (`año`),
  ADD KEY `idx_prensa` (`prensa_asignada`),
  ADD KEY `idx_tipo` (`tipo_troquel`),
  ADD KEY `idx_creado` (`creado_en`);

-- Indexes for table `tbl_troqueles_historial`
ALTER TABLE `tbl_troqueles_historial`
  ADD PRIMARY KEY (`id_historial`),
  ADD KEY `idx_troquel` (`troquel_id`),
  ADD KEY `idx_fecha` (`fecha_cambio`);

-- Indexes for table `tbl_usuarios`
ALTER TABLE `tbl_usuarios`
  ADD PRIMARY KEY (`id_usuario`),
  ADD UNIQUE KEY `nombre_usuario` (`nombre_usuario`),
  ADD KEY `idx_username` (`nombre_usuario`),
  ADD KEY `idx_rol` (`rol`),
  ADD KEY `idx_activo` (`activo`);

-- AUTO_INCREMENT for table `tbl_asistencia_prensa`
ALTER TABLE `tbl_asistencia_prensa`
  MODIFY `id_asistencia_prensa` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=43;

-- AUTO_INCREMENT for table `tbl_estados`
ALTER TABLE `tbl_estados`
  MODIFY `id_estado` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

-- AUTO_INCREMENT for table `tbl_fallas_catalogo`
ALTER TABLE `tbl_fallas_catalogo`
  MODIFY `id_fallas_catalogo` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=73;

-- AUTO_INCREMENT for table `tbl_prensas`
ALTER TABLE `tbl_prensas`
  MODIFY `id_prensa` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

-- AUTO_INCREMENT for table `tbl_prioridad_reparacion`
ALTER TABLE `tbl_prioridad_reparacion`
  MODIFY `id_prioridad_reparacion` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

-- AUTO_INCREMENT for table `tbl_resumen_troqueles`
ALTER TABLE `tbl_resumen_troqueles`
  MODIFY `id_resumen_troqueles` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

-- AUTO_INCREMENT for table `tbl_tipos_troquel`
ALTER TABLE `tbl_tipos_troquel`
  MODIFY `id_tipo_troquel` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

-- AUTO_INCREMENT for table `tbl_troqueles_historial
ALTER TABLE `tbl_troqueles_historial`
  MODIFY `id_historial` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

-- AUTO_INCREMENT for table `tbl_usuarios`
ALTER TABLE `tbl_usuarios`
  MODIFY `id_usuario` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

-- Constraints for dumped tables
-- Constraints for table `tbl_troqueles_historial`
ALTER TABLE `tbl_troqueles_historial`
  ADD CONSTRAINT `tbl_troqueles_historial_ibfk_1` FOREIGN KEY (`troquel_id`) REFERENCES `tbl_troqueles` (`id_troquel`) ON DELETE CASCADE;
COMMIT;