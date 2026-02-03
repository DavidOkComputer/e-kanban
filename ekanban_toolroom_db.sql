-- Database: `ekanban_toolroom_db`

-- Table structure for table `tbl_asistencia_prensa`
CREATE TABLE `tbl_asistencia_prensa` (
  `id_asistencia_prensa` int(11) NOT NULL,
  `descripcion` varchar(255) NOT NULL,
  `activo` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


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

-- Table structure for table `tbl_fallas_catalogo`
CREATE TABLE `tbl_fallas_catalogo` (
  `id_fallas_catalogo` int(11) NOT NULL,
  `descripcion` varchar(255) NOT NULL,
  `activo` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


-- Table structure for table `tbl_historial`
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

-- Table structure for table `tbl_prioridad_reparacion`
CREATE TABLE `tbl_prioridad_reparacion` (
  `id_prioridad_reparacion` int(11) NOT NULL,
  `prioridad` int(11) NOT NULL,
  `id_troquel` varchar(10) NOT NULL,
  `creado_el` timestamp NOT NULL DEFAULT current_timestamp(),
  `actualizado_el` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


-- Table structure for table `tbl_resumen_troqueles`
CREATE TABLE `tbl_resumen_troqueles` (
  `id_resumen_troqueles` int(11) NOT NULL,
  `etiqueta` enum('UP','BACKUP','TOTAL') NOT NULL,
  `count` varchar(20) DEFAULT '-',
  `goal` varchar(20) DEFAULT '-',
  `perf` varchar(20) DEFAULT '-',
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Table structure for table `tbl_tipos_troquel`
CREATE TABLE `tbl_tipos_troquel` (
  `id_tipo_troquel` int(11) NOT NULL,
  `codigo` varchar(20) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `activo` tinyint(1) DEFAULT 1,
  `creado_en` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
