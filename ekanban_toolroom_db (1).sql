-- Database: `ekanban_toolroom_db`

DELIMITER $$
-- Procedures
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

-- Table structure for table `tbl_ciclos_reparacion`
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

INSERT INTO `tbl_ciclos_reparacion` (`id_ciclo_reparacion`, `troquel_id`, `troquel_nombre`, `modelo`, `fecha_inicio_reparacion`, `motivo_entrada`, `falla_id`, `falla_descripcion`, `folio_entrada`, `empleado_registro`, `comentarios_entrada`, `status_anterior`, `fecha_fin_reparacion`, `status_salida`, `empleado_cierre`, `comentarios_salida`, `folio_salida`, `prensa_origen`, `nivel_reparacion`, `grupo_reparacion`, `prioridad`, `fecha_bajado`, `fecha_recepcion_taller`, `fecha_inicio_trabajo`, `fecha_termino_trabajo`, `ciclo_activo`, `creado_el`, `actualizado_el`) VALUES
(1, 'T718', 'Alpha', 'F180 - 645101-31-F180', '2025-01-20 08:30:00', 'Falla de Troquel', NULL, 'Desgaste en punzón central', 'F-2025-001', 'Juan Pérez', NULL, 'En prensa', '2025-01-22 15:00:00', 'Listo', 'María García', NULL, NULL, 'Prensa 01', 2, 1, 1, '2025-01-20 08:30:00', '2025-01-20 09:15:00', '2025-01-20 10:00:00', '2025-01-22 14:30:00', 0, '2026-01-28 17:37:51', '2026-01-28 17:37:51'),
(2, 'T951', 'Beta', 'G3-VSS', '2025-01-25 14:00:00', 'Limpieza General', NULL, NULL, 'F-2025-002', 'Carlos López', NULL, 'En prensa', '2025-01-25 17:30:00', 'Listo-BackUp', 'Carlos López', NULL, NULL, 'Prensa 03', 1, 2, 3, '2025-01-25 14:00:00', '2025-01-25 14:30:00', '2025-01-25 15:00:00', '2025-01-25 17:00:00', 0, '2026-01-28 17:37:51', '2026-01-28 17:37:51'),
(3, 'T623', 'Gamma', 'H2-PRO', '2025-01-27 07:00:00', 'Cambio de Modelo', NULL, NULL, 'F-2025-003', 'Ana Martínez', NULL, 'En prensa', NULL, NULL, NULL, NULL, NULL, 'Prensa 02', 1, 1, 2, '2025-01-27 07:00:00', '2025-01-27 08:00:00', '2025-01-27 09:30:00', NULL, 1, '2026-01-28 17:37:51', '2026-01-28 17:37:51'),
(4, 'T718', 'Alpha', 'F180 - 645101-31-F180', '2025-01-20 08:30:00', 'Falla de Troquel', NULL, 'Desgaste en punzón central', 'F-2025-001', 'Juan Pérez', NULL, 'En prensa', '2025-01-22 15:00:00', 'Listo', 'María García', NULL, NULL, 'Prensa 01', 2, 1, 1, '2025-01-20 08:30:00', '2025-01-20 09:15:00', '2025-01-20 10:00:00', '2025-01-22 14:30:00', 0, '2026-01-28 17:38:28', '2026-01-28 17:38:28'),

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

INSERT INTO `tbl_estados` (`id_estado`, `codigo`, `nombre`, `color`, `descripcion`, `orden`, `activo`, `creado_en`) VALUES
(1, 'Pendiente', 'Pendiente', '#ff6b6b', 'Troquel pendiente de revisión o asignación', 1, 1, '2026-01-23 14:52:12'),
(2, 'En prensa', 'En Prensa', '#00ff88', 'Troquel actualmente en producción', 2, 1, '2026-01-23 14:52:12'),
(3, 'Listo', 'Listo', '#64ff64', 'Troquel listo para uso', 3, 1, '2026-01-23 14:52:12'),
(4, 'Listo-BackUp', 'Listo - BackUp', '#00c8ff', 'Troquel listo como respaldo', 4, 1, '2026-01-23 14:52:12'),
(5, 'Reparando', 'Reparando', '#ffc800', 'Troquel en proceso de reparación', 5, 1, '2026-01-23 14:52:12'),
(6, 'Baja', 'Baja / Obsoleto', '#888888', 'Troquel dado de baja o obsoleto', 6, 1, '2026-01-23 14:52:12');

CREATE TABLE `tbl_fallas_catalogo` (
  `id_fallas_catalogo` int(11) NOT NULL,
  `descripcion` varchar(255) NOT NULL,
  `activo` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `tbl_fallas_catalogo` (`id_fallas_catalogo`, `descripcion`, `activo`) VALUES
(1, 'AJUSTAR MATRIZ SLOTOS ROTOS', 1),
(2, 'AJUSTE DE LAINA', 1),
(3, 'AJUSTE MATRIZ DE FORMADO', 1),
(4, 'AJUSTE SENSOR MISFEED', 1),
(5, 'ARO RETENCION QUEBRADO', 1),

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

INSERT INTO `tbl_historial` (`id_historial`, `troquel_id`, `tipo_registro`, `action_type`, `id_falla`, `modelo_nuevo`, `nivel_setup`, `grupo`, `comentarios`, `motivo`, `comentarios_supervisor`, `empleado_troquel`, `empleado_asistencia`, `creado_el`, `folio`) VALUES
(1, 'T007', 'baja_troquel', 'Falla de Troquel', 12, NULL, NULL, '1', 'pr', NULL, NULL, 'fa', NULL, '2026-01-26 18:42:08', NULL);

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

INSERT INTO `tbl_prensas` (`id_prensa`, `identificador_prensa`, `nombre`, `modelo`, `descripcion`, `tonelaje`, `estado`, `ubicacion`, `creado_en`, `actualizado_en`) VALUES
(1, '', 'Prensa 8', NULL, 'Prensa de alta capacidad', 200, 'activa', NULL, '2026-01-23 14:51:09', '2026-01-23 14:51:09');

CREATE TABLE `tbl_prioridad_reparacion` (
  `id_prioridad_reparacion` int(11) NOT NULL,
  `prioridad` int(11) NOT NULL,
  `id_troquel` varchar(10) NOT NULL,
  `creado_el` timestamp NOT NULL DEFAULT current_timestamp(),
  `actualizado_el` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `tbl_prioridad_reparacion` (`id_prioridad_reparacion`, `prioridad`, `id_troquel`, `creado_el`, `actualizado_el`) VALUES
(1, 1, 'T954', '2026-01-12 15:08:54', '2026-01-12 15:08:54'),
(2, 2, 'T953', '2026-01-12 15:08:54', '2026-01-12 15:08:54'),
(3, 3, 'T951', '2026-01-12 15:08:54', '2026-01-12 15:08:54'),
(4, 4, 'T955', '2026-01-12 15:08:54', '2026-01-12 15:08:54'),
(5, 5, 'T952', '2026-01-12 15:08:54', '2026-01-12 15:08:54');

CREATE TABLE `tbl_resumen_troqueles` (
  `id_resumen_troqueles` int(11) NOT NULL,
  `etiqueta` enum('UP','BACKUP','TOTAL') NOT NULL,
  `count` varchar(20) DEFAULT '-',
  `goal` varchar(20) DEFAULT '-',
  `perf` varchar(20) DEFAULT '-',
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `tbl_resumen_troqueles` (`id_resumen_troqueles`, `etiqueta`, `count`, `goal`, `perf`, `updated_at`) VALUES
(1, 'UP', '-', '-', '-', '2026-01-12 15:09:52'),
(2, 'BACKUP', '-', '-', '-', '2026-01-12 15:09:52'),
(3, 'TOTAL', '-', '-', '-', '2026-01-12 15:09:52');

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

CREATE TABLE `tbl_tipos_troquel` (
  `id_tipo_troquel` int(11) NOT NULL,
  `codigo` varchar(20) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `activo` tinyint(1) DEFAULT 1,
  `creado_en` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `tbl_tipos_troquel` (`id_tipo_troquel`, `codigo`, `nombre`, `descripcion`, `activo`, `creado_en`) VALUES
(1, 'progresivo', 'Progresivo', 'Troquel de estaciones progresivas para operaciones secuenciales', 1, '2026-01-23 14:51:41'),
(2, 'transfer', 'Transfer', 'Troquel tipo transfer para piezas grandes', 1, '2026-01-23 14:51:41'),
(3, 'compound', 'Compound', 'Troquel compuesto para operaciones simultáneas', 1, '2026-01-23 14:51:41'),
(4, 'simple', 'Simple', 'Troquel de operación simple', 1, '2026-01-23 14:51:41'),
(5, 'blanking', 'Blanking', 'Troquel para corte de forma', 1, '2026-01-23 14:51:41'),
(6, 'bending', 'Doblado', 'Troquel para operaciones de doblado', 1, '2026-01-23 14:51:41'),
(7, 'drawing', 'Embutido', 'Troquel para embutido de piezas', 1, '2026-01-23 14:51:41');

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

INSERT INTO `tbl_troqueles` (`id_troquel`, `nombre`, `estado`, `año`, `modelo`, `golpes`, `golpes_acum`, `capacidad_golpes`, `rectificaciones`, `image_url`, `comentarios`, `prensa_asignada`, `tipo_troquel`, `ubicacion`, `numero_serie`, `proveedor`, `peso_kg`, `dimensiones`, `material_base`, `num_estaciones`, `cavidades`, `color`, `ciclos`, `n_parte_1`, `n_parte_2`, `n_parte_3`, `n_parte_4`, `n_parte_5`, `n_parte_6`, `creado_por`, `actualizado_por`, `creado_en`, `actualizado_el`) VALUES
('T001', 'Alpha', 'En prensa', 2024, 'G3-VSS', '257,540', '121,442,752', '250,000,000', '15', NULL, NULL, 'Prensa 1', 'progresivo', 'Plasticos', 'Rack A-01', 'Motores Reynosa Nidec', '20', '1.890x2.380', 'aluminio', '2', '8', NULL, '2', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-01-21 15:14:18', '2026-01-21 15:14:18'),

CREATE TABLE `tbl_troqueles_historial` (
  `id_historial` int(11) NOT NULL,
  `troquel_id` varchar(20) NOT NULL,
  `campo_modificado` varchar(50) NOT NULL,
  `valor_anterior` text DEFAULT NULL,
  `valor_nuevo` text DEFAULT NULL,
  `usuario_id` int(11) DEFAULT NULL,
  `fecha_cambio` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `tbl_troqueles_historial` (`id_historial`, `troquel_id`, `campo_modificado`, `valor_anterior`, `valor_nuevo`, `usuario_id`, `fecha_cambio`) VALUES
(1, 'T006', 'update', '{\"id_troquel\":\"T006\",\"nombre\":\"Echo\",\"estado\":\"Listo-BackUp\",\"a\\u00f1o\":2025,\"modelo\":\"G7-RTX\",\"golpes\":\"-\",\"golpes_acum\":\"0\",\"capacidad_golpes\":\"-\",\"rectificaciones\":\"0\",\"image_url\":null,\"comentarios\":null,\"prensa_asignada\":null,\"tipo_troquel\":\"\",\"ubicacion\":null,\"numero_serie\":null,\"proveedor\":null,\"peso_kg\":null,\"dimensiones\":null,\"material_base\":null,\"num_estaciones\":null,\"cavidades\":null,\"color\":null,\"ciclos\":null,\"n_parte_1\":null,\"n_parte_2\":null,\"n_parte_3\":null,\"n_parte_4\":null,\"n_parte_5\":null,\"n_parte_6\":null,\"creado_por\":null,\"actualizado_por\":null,\"creado_en\":\"2026-01-23 13:45:34\",\"actualizado_el\":\"2026-01-23 13:45:34\"}', '{\"id_troquel\":\"T006\",\"nombre\":\"Echo\",\"estado\":\"Listo-BackUp\",\"a\\u00f1o\":2025,\"modelo\":\"G7-RTX\",\"golpes\":\"10\",\"golpes_acum\":\"10\",\"capacidad_golpes\":\"10,000,000\",\"rectificaciones\":\"0\",\"tipo_troquel\":\"transfer\",\"ubicacion\":null,\"prensa_asignada\":null,\"numero_serie\":null,\"proveedor\":null,\"peso_kg\":null,\"dimensiones\":null,\"material_base\":null,\"num_estaciones\":null,\"vida_util_estimada\":null,\"comentarios\":\"actualizacion\",\"image_url\":null}', NULL, '2026-01-26 15:54:18'),

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

INSERT INTO `tbl_usuarios` (`id_usuario`, `nombre_usuario`, `acceso`, `nombre_completo`, `rol`, `activo`, `ultimo_acceso`, `fecha_creacion`, `fecha_modificacion`) VALUES
(1, 'admin', '$2y$10$M4mdwKL3Ya.fwZx9QyJdzOR/dAIWVkb94csvRmOjvv7nf0xA2hTcG', 'Administrador Sistema', 'admin', 1, '2026-01-29 08:05:24', '2026-01-19 19:30:48', '2026-01-29 14:05:24'),
(2, 'supervisor', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Supervisor Tool Room', 'supervisor', 1, NULL, '2026-01-19 19:31:20', '2026-01-19 19:31:20'),
(3, 'operador', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Operador Tool Room', 'operator', 1, NULL, '2026-01-19 19:31:20', '2026-01-19 19:31:20');

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

DROP TABLE IF EXISTS `vw_estadisticas_troquel`;
CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vw_estadisticas_troquel`  AS SELECT `tbl_ciclos_reparacion`.`troquel_id` AS `troquel_id`, `tbl_ciclos_reparacion`.`troquel_nombre` AS `troquel_nombre`, count(0) AS `total_reparaciones`, count(case when `tbl_ciclos_reparacion`.`ciclo_activo` = 0 then 1 end) AS `reparaciones_completadas`, count(case when `tbl_ciclos_reparacion`.`ciclo_activo` = 1 then 1 end) AS `reparaciones_activas`, avg(case when `tbl_ciclos_reparacion`.`ciclo_activo` = 0 then `tbl_ciclos_reparacion`.`tiempo_reparacion_horas` end) AS `promedio_horas_reparacion`, min(case when `tbl_ciclos_reparacion`.`ciclo_activo` = 0 then `tbl_ciclos_reparacion`.`tiempo_reparacion_horas` end) AS `min_horas_reparacion`, max(case when `tbl_ciclos_reparacion`.`ciclo_activo` = 0 then `tbl_ciclos_reparacion`.`tiempo_reparacion_horas` end) AS `max_horas_reparacion`, sum(case when `tbl_ciclos_reparacion`.`motivo_entrada` = 'Falla de Troquel' then 1 else 0 end) AS `total_fallas`, sum(case when `tbl_ciclos_reparacion`.`motivo_entrada` = 'Limpieza General' then 1 else 0 end) AS `total_limpiezas`, sum(case when `tbl_ciclos_reparacion`.`motivo_entrada` = 'Cambio de Modelo' then 1 else 0 end) AS `total_cambios_modelo`, sum(case when `tbl_ciclos_reparacion`.`motivo_entrada` = 'Mantenimiento Preventivo' then 1 else 0 end) AS `total_mantenimientos` FROM `tbl_ciclos_reparacion` GROUP BY `tbl_ciclos_reparacion`.`troquel_id`, `tbl_ciclos_reparacion`.`troquel_nombre` ;
DROP TABLE IF EXISTS `vw_historial_reparaciones`;
CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vw_historial_reparaciones`  AS SELECT `cr`.`id_ciclo_reparacion` AS `id_ciclo_reparacion`, `cr`.`troquel_id` AS `troquel_id`, `cr`.`troquel_nombre` AS `troquel_nombre`, `cr`.`modelo` AS `modelo`, `cr`.`fecha_inicio_reparacion` AS `fecha_inicio_reparacion`, `cr`.`fecha_fin_reparacion` AS `fecha_fin_reparacion`, `cr`.`motivo_entrada` AS `motivo_entrada`, `cr`.`falla_descripcion` AS `falla_descripcion`, `cr`.`status_anterior` AS `status_anterior`, `cr`.`status_salida` AS `status_salida`, `cr`.`tiempo_reparacion_horas` AS `tiempo_reparacion_horas`, `cr`.`prensa_origen` AS `prensa_origen`, `cr`.`empleado_registro` AS `empleado_registro`, `cr`.`empleado_cierre` AS `empleado_cierre`, CASE WHEN `cr`.`tiempo_reparacion_horas` <= 4 THEN 'Rápida (≤4h)' WHEN `cr`.`tiempo_reparacion_horas` <= 24 THEN 'Normal (4-24h)' WHEN `cr`.`tiempo_reparacion_horas` <= 72 THEN 'Extendida (1-3 días)' ELSE 'Prolongada (>3 días)' END AS `clasificacion_tiempo` FROM `tbl_ciclos_reparacion` AS `cr` WHERE `cr`.`ciclo_activo` = 0 ORDER BY `cr`.`fecha_fin_reparacion` DESC ;
DROP TABLE IF EXISTS `vw_reparaciones_activas`;
CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vw_reparaciones_activas`  AS SELECT `cr`.`id_ciclo_reparacion` AS `id_ciclo_reparacion`, `cr`.`troquel_id` AS `troquel_id`, `cr`.`troquel_nombre` AS `troquel_nombre`, `cr`.`modelo` AS `modelo`, `cr`.`fecha_inicio_reparacion` AS `fecha_inicio_reparacion`, `cr`.`motivo_entrada` AS `motivo_entrada`, `cr`.`falla_descripcion` AS `falla_descripcion`, `cr`.`prioridad` AS `prioridad`, `cr`.`prensa_origen` AS `prensa_origen`, timestampdiff(HOUR,`cr`.`fecha_inicio_reparacion`,current_timestamp()) AS `horas_en_reparacion`, timestampdiff(DAY,`cr`.`fecha_inicio_reparacion`,current_timestamp()) AS `dias_en_reparacion`, group_concat(distinct `tc`.`empleado_nombre` separator ', ') AS `tecnicos_asignados` FROM (`tbl_ciclos_reparacion` `cr` left join `tbl_tecnicos_ciclo` `tc` on(`cr`.`id_ciclo_reparacion` = `tc`.`ciclo_id` and `tc`.`fecha_fin` is null)) WHERE `cr`.`ciclo_activo` = 1 GROUP BY `cr`.`id_ciclo_reparacion` ORDER BY `cr`.`prioridad` ASC, `cr`.`fecha_inicio_reparacion` ASC ;
DROP TABLE IF EXISTS `vw_resumen_mensual`;
CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vw_resumen_mensual`  AS SELECT year(`tbl_ciclos_reparacion`.`fecha_inicio_reparacion`) AS `anio`, month(`tbl_ciclos_reparacion`.`fecha_inicio_reparacion`) AS `mes`, date_format(`tbl_ciclos_reparacion`.`fecha_inicio_reparacion`,'%Y-%m') AS `periodo`, count(0) AS `total_reparaciones`, count(case when `tbl_ciclos_reparacion`.`ciclo_activo` = 0 then 1 end) AS `completadas`, avg(case when `tbl_ciclos_reparacion`.`ciclo_activo` = 0 then `tbl_ciclos_reparacion`.`tiempo_reparacion_horas` end) AS `promedio_horas`, sum(case when `tbl_ciclos_reparacion`.`motivo_entrada` = 'Falla de Troquel' then 1 else 0 end) AS `por_falla`, sum(case when `tbl_ciclos_reparacion`.`motivo_entrada` = 'Limpieza General' then 1 else 0 end) AS `por_limpieza`, sum(case when `tbl_ciclos_reparacion`.`motivo_entrada` = 'Cambio de Modelo' then 1 else 0 end) AS `por_cambio_modelo` FROM `tbl_ciclos_reparacion` GROUP BY year(`tbl_ciclos_reparacion`.`fecha_inicio_reparacion`), month(`tbl_ciclos_reparacion`.`fecha_inicio_reparacion`) ORDER BY year(`tbl_ciclos_reparacion`.`fecha_inicio_reparacion`) DESC, month(`tbl_ciclos_reparacion`.`fecha_inicio_reparacion`) DESC ;
ALTER TABLE `tbl_asistencia_prensa`
  ADD PRIMARY KEY (`id_asistencia_prensa`);
ALTER TABLE `tbl_ciclos_reparacion`
  ADD PRIMARY KEY (`id_ciclo_reparacion`),
  ADD KEY `idx_troquel` (`troquel_id`),
  ADD KEY `idx_fecha_inicio` (`fecha_inicio_reparacion`),
  ADD KEY `idx_fecha_fin` (`fecha_fin_reparacion`),
  ADD KEY `idx_ciclo_activo` (`ciclo_activo`),
  ADD KEY `idx_motivo` (`motivo_entrada`),
  ADD KEY `idx_prioridad` (`prioridad`),
  ADD KEY `fk_falla` (`falla_id`);
ALTER TABLE `tbl_estados`
  ADD PRIMARY KEY (`id_estado`),
  ADD UNIQUE KEY `codigo` (`codigo`),
  ADD KEY `idx_estados_activo_orden` (`activo`,`orden`);
ALTER TABLE `tbl_fallas_catalogo`
  ADD PRIMARY KEY (`id_fallas_catalogo`);
ALTER TABLE `tbl_historial`
  ADD PRIMARY KEY (`id_historial`),
  ADD KEY `idx_troquel` (`troquel_id`),
  ADD KEY `idx_fecha` (`creado_el`),
  ADD KEY `idx_falla` (`id_falla`);
ALTER TABLE `tbl_prensas`
  ADD PRIMARY KEY (`id_prensa`),
  ADD UNIQUE KEY `identificador_prensa` (`identificador_prensa`),
  ADD KEY `idx_prensas_estado` (`estado`);
ALTER TABLE `tbl_prioridad_reparacion`
  ADD PRIMARY KEY (`id_prioridad_reparacion`),
  ADD UNIQUE KEY `prioridad` (`prioridad`);
ALTER TABLE `tbl_resumen_troqueles`
  ADD PRIMARY KEY (`id_resumen_troqueles`),
  ADD UNIQUE KEY `etiqueta` (`etiqueta`);
ALTER TABLE `tbl_tecnicos_ciclo`
  ADD PRIMARY KEY (`id_tecnicos_ciclos`),
  ADD KEY `idx_ciclo` (`ciclo_id`),
  ADD KEY `idx_empleado` (`empleado_numero`);
ALTER TABLE `tbl_tipos_troquel`
  ADD PRIMARY KEY (`id_tipo_troquel`),
  ADD UNIQUE KEY `codigo` (`codigo`),
  ADD KEY `idx_tipos_activo` (`activo`);
ALTER TABLE `tbl_troqueles`
  ADD PRIMARY KEY (`id_troquel`),
  ADD KEY `idx_estado` (`estado`),
  ADD KEY `idx_año` (`año`),
  ADD KEY `idx_prensa` (`prensa_asignada`),
  ADD KEY `idx_tipo` (`tipo_troquel`),
  ADD KEY `idx_creado` (`creado_en`);
ALTER TABLE `tbl_troqueles_historial`
  ADD PRIMARY KEY (`id_historial`),
  ADD KEY `idx_troquel` (`troquel_id`),
  ADD KEY `idx_fecha` (`fecha_cambio`);
ALTER TABLE `tbl_usuarios`
  ADD PRIMARY KEY (`id_usuario`),
  ADD UNIQUE KEY `nombre_usuario` (`nombre_usuario`),
  ADD KEY `idx_username` (`nombre_usuario`),
  ADD KEY `idx_rol` (`rol`),
  ADD KEY `idx_activo` (`activo`);
ALTER TABLE `tbl_asistencia_prensa`
  MODIFY `id_asistencia_prensa` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=43;
ALTER TABLE `tbl_ciclos_reparacion`
  MODIFY `id_ciclo_reparacion` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;
ALTER TABLE `tbl_estados`
  MODIFY `id_estado` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;
ALTER TABLE `tbl_fallas_catalogo`
  MODIFY `id_fallas_catalogo` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=73;
ALTER TABLE `tbl_historial`
  MODIFY `id_historial` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;
ALTER TABLE `tbl_prensas`
  MODIFY `id_prensa` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;
ALTER TABLE `tbl_prioridad_reparacion`
  MODIFY `id_prioridad_reparacion` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;
ALTER TABLE `tbl_resumen_troqueles`
  MODIFY `id_resumen_troqueles` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;
ALTER TABLE `tbl_tecnicos_ciclo`
  MODIFY `id_tecnicos_ciclos` int(11) NOT NULL AUTO_INCREMENT;
ALTER TABLE `tbl_tipos_troquel`
  MODIFY `id_tipo_troquel` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;
ALTER TABLE `tbl_troqueles_historial`
  MODIFY `id_historial` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;
ALTER TABLE `tbl_usuarios`
  MODIFY `id_usuario` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;
ALTER TABLE `tbl_ciclos_reparacion`
  ADD CONSTRAINT `fk_falla` FOREIGN KEY (`falla_id`) REFERENCES `tbl_fallas_catalogo` (`id_fallas_catalogo`) ON DELETE SET NULL;
ALTER TABLE `tbl_tecnicos_ciclo`
  ADD CONSTRAINT `tbl_tecnicos_ciclo_ibfk_1` FOREIGN KEY (`ciclo_id`) REFERENCES `tbl_ciclos_reparacion` (`id_ciclo_reparacion`) ON DELETE CASCADE;
ALTER TABLE `tbl_troqueles_historial`
  ADD CONSTRAINT `tbl_troqueles_historial_ibfk_1` FOREIGN KEY (`troquel_id`) REFERENCES `tbl_troqueles` (`id_troquel`) ON DELETE CASCADE;
COMMIT;