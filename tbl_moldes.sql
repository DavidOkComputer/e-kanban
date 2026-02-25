-- ============================================================================ 

-- MOLDES POR INYECCIÓN - Schema Extension for ekanban_toolroom_db 

-- ============================================================================ 

-- This script adds injection mold management tables parallel to the existing 

-- troqueles (stamping dies) system. Run against the existing database. 

-- ============================================================================ 

 

USE `ekanban_toolroom_db`; 

 

-- ============================================================================ 

-- 1. ESTADOS MOLDE (reuses tbl_estados but adds molde-specific if needed) 

--    We add new states specific to injection molds 

-- ============================================================================ 

 

INSERT IGNORE INTO `tbl_estados` (`codigo`, `nombre`, `color`, `descripcion`, `orden`, `activo`) 

VALUES  

  ('En maquina', 'En Máquina', '#00ff88', 'Molde actualmente montado en máquina de inyección', 7, 1), 

  ('Calentando', 'Calentando', '#ff8800', 'Molde en proceso de precalentamiento', 8, 1); 

 

 

-- ============================================================================ 

-- 2. TIPOS DE MOLDE (parallel to tbl_tipos_troquel) 

-- ============================================================================ 

 

CREATE TABLE IF NOT EXISTS `tbl_tipos_molde` ( 

  `id_tipo_molde` INT(11) NOT NULL AUTO_INCREMENT, 

  `codigo` VARCHAR(30) NOT NULL, 

  `nombre` VARCHAR(100) NOT NULL, 

  `descripcion` TEXT DEFAULT NULL, 

  `activo` TINYINT(1) DEFAULT 1, 

  `creado_en` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, 

  PRIMARY KEY (`id_tipo_molde`), 

  UNIQUE KEY `uk_tipos_molde_codigo` (`codigo`), 

  KEY `idx_tipos_molde_activo` (`activo`) 

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci; 

 

INSERT INTO `tbl_tipos_molde` (`codigo`, `nombre`, `descripcion`, `activo`) VALUES 

  ('dos_placas',     'Dos Placas',        'Molde estándar de dos placas con línea de partición simple', 1), 

  ('tres_placas',    'Tres Placas',       'Molde de tres placas con sistema de colada fría separado', 1), 

  ('colada_caliente','Colada Caliente',   'Molde con sistema de colada caliente (hot runner)', 1), 

  ('stack',          'Stack (Apilado)',   'Molde apilado de múltiples niveles de partición', 1), 

  ('insertos',       'Con Insertos',      'Molde diseñado para sobre-moldeo con insertos', 1), 

  ('desatornillado', 'Desatornillado',    'Molde con mecanismo de desatornillado para roscas', 1), 

  ('bi_inyeccion',   'Bi-Inyección',      'Molde para inyección de dos materiales/colores', 1), 

  ('compresion',     'Compresión',        'Molde para moldeo por compresión', 1); 

 

 

-- ============================================================================ 

-- 3. MÁQUINAS DE INYECCIÓN (parallel to tbl_prensas) 

-- ============================================================================ 

 

CREATE TABLE IF NOT EXISTS `tbl_maquinas_inyeccion` ( 

  `id_maquina` INT(11) NOT NULL AUTO_INCREMENT, 

  `identificador_maquina` VARCHAR(20) NOT NULL COMMENT 'Identificador único visible (ej: INY-01)', 

  `nombre` VARCHAR(100) DEFAULT NULL, 

  `marca` VARCHAR(100) DEFAULT NULL COMMENT 'Marca/fabricante de la máquina', 

  `modelo` VARCHAR(100) DEFAULT NULL COMMENT 'Modelo de la máquina', 

  `numero_serie` VARCHAR(100) DEFAULT NULL, 

  `descripcion` TEXT DEFAULT NULL, 

  `tonelaje_cierre` INT(11) DEFAULT NULL COMMENT 'Fuerza de cierre en toneladas', 

  `capacidad_inyeccion_g` DECIMAL(10,2) DEFAULT NULL COMMENT 'Capacidad de inyección en gramos', 

  `diametro_husillo_mm` DECIMAL(8,2) DEFAULT NULL COMMENT 'Diámetro del husillo en mm', 

  `distancia_barras_h_mm` DECIMAL(10,2) DEFAULT NULL COMMENT 'Distancia entre barras horizontal mm', 

  `distancia_barras_v_mm` DECIMAL(10,2) DEFAULT NULL COMMENT 'Distancia entre barras vertical mm', 

  `carrera_apertura_mm` DECIMAL(10,2) DEFAULT NULL COMMENT 'Carrera de apertura máxima mm', 

  `espesor_molde_min_mm` DECIMAL(10,2) DEFAULT NULL COMMENT 'Espesor mínimo de molde mm', 

  `espesor_molde_max_mm` DECIMAL(10,2) DEFAULT NULL COMMENT 'Espesor máximo de molde mm', 

  `estado` ENUM('activa','inactiva','mantenimiento') DEFAULT 'activa', 

  `ubicacion` VARCHAR(100) DEFAULT NULL, 

  `notas` TEXT DEFAULT NULL, 

  `creado_en` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, 

  `actualizado_en` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, 

  PRIMARY KEY (`id_maquina`), 

  UNIQUE KEY `uk_identificador_maquina` (`identificador_maquina`), 

  KEY `idx_maquinas_estado` (`estado`) 

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci; 

 

 

-- ============================================================================ 

-- 4. MOLDES - Tabla principal (parallel to tbl_troqueles) 

-- ============================================================================ 

 

CREATE TABLE IF NOT EXISTS `tbl_moldes` ( 

  `id_molde` VARCHAR(50) NOT NULL COMMENT 'Identificador único del molde (ej: M001)', 

  `nombre` VARCHAR(100) DEFAULT NULL COMMENT 'Nombre descriptivo del molde', 

  `estado` ENUM('Pendiente','En maquina','Listo','Listo-BackUp','Reparando','Baja','Calentando') DEFAULT 'Pendiente', 

  `año` INT(11) DEFAULT NULL COMMENT 'Año de fabricación o adquisición', 

  `modelo` VARCHAR(100) DEFAULT NULL COMMENT 'Modelo de producción actual', 

 

  -- Contadores de producción 

  `ciclos_inyeccion` VARCHAR(50) DEFAULT '-' COMMENT 'Ciclos de inyección del periodo actual', 

  `ciclos_acumulados` VARCHAR(50) DEFAULT '-' COMMENT 'Ciclos de inyección acumulados totales', 

  `capacidad_ciclos` VARCHAR(50) DEFAULT '-' COMMENT 'Capacidad máxima de ciclos antes de mantenimiento mayor', 

  `mantenimientos_preventivos` VARCHAR(100) DEFAULT '0' COMMENT 'Número de mantenimientos preventivos realizados', 

 

  -- Imagen y notas 

  `image_url` TEXT DEFAULT NULL, 

  `comentarios` TEXT DEFAULT NULL, 

 

  -- Asignación a máquina 

  `maquina_asignada` VARCHAR(50) DEFAULT NULL COMMENT 'Máquina de inyección donde está montado', 

 

  -- Clasificación 

  `tipo_molde` ENUM('dos_placas','tres_placas','colada_caliente','stack','insertos','desatornillado','bi_inyeccion','compresion','Null') DEFAULT 'Null', 

 

  -- Ubicación y serie 

  `ubicacion` VARCHAR(100) DEFAULT NULL COMMENT 'Ubicación física (rack, almacén, etc.)', 

  `numero_serie` VARCHAR(100) DEFAULT NULL, 

  `proveedor` VARCHAR(150) DEFAULT NULL COMMENT 'Fabricante o proveedor del molde', 

 

  -- Especificaciones físicas del molde 

  `peso_kg` VARCHAR(50) DEFAULT NULL, 

  `dimensiones` VARCHAR(100) DEFAULT NULL COMMENT 'Largo x Ancho x Alto en mm', 

  `material_base` VARCHAR(100) DEFAULT NULL COMMENT 'Material del molde (ej: acero P20, H13)', 

 

  -- Especificaciones técnicas de inyección 

  `num_cavidades` VARCHAR(20) DEFAULT NULL COMMENT 'Número de cavidades', 

  `material_inyeccion` VARCHAR(100) DEFAULT NULL COMMENT 'Material plástico que procesa (ej: PP, ABS, Nylon)', 

  `peso_pieza_g` VARCHAR(50) DEFAULT NULL COMMENT 'Peso de la pieza inyectada en gramos', 

  `peso_colada_g` VARCHAR(50) DEFAULT NULL COMMENT 'Peso de la colada en gramos', 

  `tiempo_ciclo_seg` VARCHAR(50) DEFAULT NULL COMMENT 'Tiempo de ciclo estándar en segundos', 

  `temperatura_molde_c` VARCHAR(50) DEFAULT NULL COMMENT 'Temperatura de operación del molde en °C', 

  `presion_inyeccion_bar` VARCHAR(50) DEFAULT NULL COMMENT 'Presión de inyección estándar en bar', 

  `tonelaje_requerido` VARCHAR(50) DEFAULT NULL COMMENT 'Fuerza de cierre requerida en toneladas', 

 

  -- Sistema de colada 

  `tipo_colada` ENUM('fria','caliente','semi-caliente','valvula','Null') DEFAULT 'Null' COMMENT 'Tipo de sistema de colada', 

  `num_puntos_inyeccion` VARCHAR(20) DEFAULT NULL COMMENT 'Número de puntos de inyección (gates)', 

  `marca_colada_caliente` VARCHAR(100) DEFAULT NULL COMMENT 'Marca del sistema hot runner si aplica', 

 

  -- Sistema de enfriamiento 

  `circuitos_enfriamiento` VARCHAR(20) DEFAULT NULL COMMENT 'Número de circuitos de enfriamiento', 

  `tipo_enfriamiento` ENUM('agua','aceite','mixto','Null') DEFAULT 'Null', 

 

  -- Sistema de expulsión 

  `tipo_expulsion` ENUM('pines','placa','aire','hidraulica','mixto','Null') DEFAULT 'Null', 

  `carrera_expulsion_mm` VARCHAR(50) DEFAULT NULL COMMENT 'Carrera de expulsión en mm', 

 

  -- Números de parte (hasta 6 como en troqueles) 

  `n_parte_1` VARCHAR(50) DEFAULT NULL, 

  `n_parte_2` VARCHAR(50) DEFAULT NULL, 

  `n_parte_3` VARCHAR(50) DEFAULT NULL, 

  `n_parte_4` VARCHAR(50) DEFAULT NULL, 

  `n_parte_5` VARCHAR(50) DEFAULT NULL, 

  `n_parte_6` VARCHAR(50) DEFAULT NULL, 

 

  -- Color de la pieza 

  `color` VARCHAR(50) DEFAULT NULL, 

 

  -- Auditoría 

  `creado_por` INT(11) DEFAULT NULL, 

  `actualizado_por` INT(11) DEFAULT NULL, 

  `creado_en` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, 

  `actualizado_el` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, 

 

  PRIMARY KEY (`id_molde`), 

  KEY `idx_molde_estado` (`estado`), 

  KEY `idx_molde_año` (`año`), 

  KEY `idx_molde_maquina` (`maquina_asignada`), 

  KEY `idx_molde_tipo` (`tipo_molde`), 

  KEY `idx_molde_creado` (`creado_en`), 

  KEY `idx_molde_material_inyeccion` (`material_inyeccion`) 

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci; 

 

 

-- ============================================================================ 

-- 5. MODELOS POR MOLDE (parallel to tbl_modelos_troquel) 

-- ============================================================================ 

 

CREATE TABLE IF NOT EXISTS `tbl_modelos_molde` ( 

  `id_modelo` INT(11) NOT NULL AUTO_INCREMENT, 

  `nombre_modelo` VARCHAR(100) NOT NULL COMMENT 'Nombre del modelo de producción', 

  `molde_id` VARCHAR(50) NOT NULL COMMENT 'ID del molde al que pertenece', 

  `descripcion` TEXT DEFAULT NULL, 

  `creado_en` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, 

  `actualizado_en` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, 

  PRIMARY KEY (`id_modelo`), 

  UNIQUE KEY `uk_modelo_molde` (`nombre_modelo`, `molde_id`), 

  KEY `idx_modelos_molde_id` (`molde_id`), 

  CONSTRAINT `fk_modelos_molde` FOREIGN KEY (`molde_id`) REFERENCES `tbl_moldes` (`id_molde`) ON DELETE CASCADE 

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci; 

 

 

-- ============================================================================ 

-- 6. CATÁLOGO DE FALLAS DE MOLDES (parallel to tbl_fallas_catalogo) 

-- ============================================================================ 

 

CREATE TABLE IF NOT EXISTS `tbl_fallas_catalogo_molde` ( 

  `id_falla_molde` INT(11) NOT NULL AUTO_INCREMENT, 

  `descripcion` VARCHAR(255) NOT NULL, 

  `activo` TINYINT(1) DEFAULT 1, 

  PRIMARY KEY (`id_falla_molde`) 

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci; 

 

INSERT INTO `tbl_fallas_catalogo_molde` (`descripcion`, `activo`) VALUES 

  ('FUGA DE AGUA EN CIRCUITO DE ENFRIAMIENTO', 1), 

  ('CAVIDAD DAÑADA / GOLPEADA', 1), 

  ('CORAZÓN ROTO', 1), 

  ('PINES DE EXPULSIÓN ROTOS', 1), 

  ('PINES DE EXPULSIÓN ATORADOS', 1), 

  ('REBABA EXCESIVA EN LÍNEA DE PARTICIÓN', 1), 

  ('COLADA CALIENTE TAPADA', 1), 

  ('RESISTENCIA DE HOT RUNNER QUEMADA', 1), 

  ('TERMOPAR DAÑADO', 1), 

  ('DESGASTE EN GUÍAS / BUJES', 1), 

  ('FRACTURA EN PLACA / INSERTO', 1), 

  ('PROBLEMA DE VENTEO (GAS TRAPPED)', 1), 

  ('MARCA DE HUNDIMIENTO (SINK MARK)', 1), 

  ('PIEZA PEGADA EN CAVIDAD', 1), 

  ('PIEZA PEGADA EN CORAZÓN', 1), 

  ('SISTEMA DE DESATORNILLADO FALLANDO', 1), 

  ('OXIDACIÓN / CORROSIÓN EN CAVIDAD', 1), 

  ('CIRCUITO DE ENFRIAMIENTO OBSTRUIDO', 1), 

  ('FUGA DE MATERIAL POR BOQUILLA', 1), 

  ('O-RINGS DAÑADOS', 1), 

  ('AJUSTE DE DIMENSIONES FUERA DE ESPECIFICACIÓN', 1), 

  ('PROBLEMA ELÉCTRICO EN HOT RUNNER', 1), 

  ('MANIFOLD DAÑADO', 1), 

  ('LÍNEA DE UNIÓN VISIBLE (WELD LINE)', 1), 

  ('DESGASTE EN SUPERFICIE TEXTURIZADA', 1), 

  ('SISTEMA HIDRÁULICO DE CORES FALLANDO', 1), 

  ('PROBLEMA DE LLENADO INCOMPLETO (SHORT SHOT)', 1), 

  ('MANTENIMIENTO PREVENTIVO PROGRAMADO', 1); 

 

 

-- ============================================================================ 

-- 7. ASISTENCIA EN MÁQUINA (parallel to tbl_asistencia_prensa) 

-- ============================================================================ 

 

CREATE TABLE IF NOT EXISTS `tbl_asistencia_maquina` ( 

  `id_asistencia_maquina` INT(11) NOT NULL AUTO_INCREMENT, 

  `descripcion` VARCHAR(255) NOT NULL, 

  `activo` TINYINT(1) DEFAULT 1, 

  PRIMARY KEY (`id_asistencia_maquina`) 

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci; 

 

INSERT INTO `tbl_asistencia_maquina` (`descripcion`, `activo`) VALUES 

  ('AJUSTE DE PARÁMETROS DE INYECCIÓN', 1), 

  ('CAMBIO DE MODELO / COLOR', 1), 

  ('LIMPIEZA DE BOQUILLA', 1), 

  ('AJUSTE DE TEMPERATURA DE MOLDE', 1), 

  ('PURGA DE MATERIAL', 1), 

  ('AJUSTE DE EXPULSIÓN', 1), 

  ('REVISIÓN DE CIRCUITOS DE ENFRIAMIENTO', 1), 

  ('AJUSTE DE CIERRE DE MOLDE', 1), 

  ('CAMBIO DE O-RINGS', 1), 

  ('LUBRICACIÓN DE COMPONENTES', 1), 

  ('REVISIÓN DE COLADA CALIENTE', 1), 

  ('REVISIÓN DE PIEZA (DIMENSIONAL)', 1), 

  ('AJUSTE DE PRESIÓN DE SOSTENIMIENTO', 1), 

  ('LIMPIEZA DE VENTEOS', 1), 

  ('AJUSTE DE ROBOT / EXTRACTOR', 1); 

 

 

-- ============================================================================ 

-- 8. CICLOS DE REPARACIÓN DE MOLDES (parallel to tbl_ciclos_reparacion) 

-- ============================================================================ 

 

CREATE TABLE IF NOT EXISTS `tbl_ciclos_reparacion_molde` ( 

  `id_ciclo_reparacion` INT(11) NOT NULL AUTO_INCREMENT, 

  `molde_id` VARCHAR(50) NOT NULL, 

  `molde_nombre` VARCHAR(100) DEFAULT NULL, 

  `modelo` VARCHAR(100) DEFAULT NULL, 

  `fecha_inicio_reparacion` DATETIME NOT NULL, 

  `motivo_entrada` ENUM( 

    'Falla de Molde', 

    'Limpieza General', 

    'Cambio de Modelo', 

    'Mantenimiento Preventivo', 

    'Cambio de Componente', 

    'Otro' 

  ) NOT NULL, 

  `falla_id` INT(11) DEFAULT NULL, 

  `falla_descripcion` VARCHAR(255) DEFAULT NULL, 

  `folio_entrada` VARCHAR(50) DEFAULT NULL, 

  `empleado_registro` VARCHAR(100) DEFAULT NULL, 

  `comentarios_entrada` TEXT DEFAULT NULL, 

  `status_anterior` VARCHAR(50) DEFAULT 'En maquina', 

  `fecha_fin_reparacion` DATETIME DEFAULT NULL, 

  `status_salida` VARCHAR(50) DEFAULT NULL, 

  `empleado_cierre` VARCHAR(100) DEFAULT NULL, 

  `comentarios_salida` TEXT DEFAULT NULL, 

  `folio_salida` VARCHAR(50) DEFAULT NULL, 

 

  -- Calculated fields 

  `tiempo_reparacion_minutos` INT(11) GENERATED ALWAYS AS ( 

    CASE WHEN `fecha_fin_reparacion` IS NOT NULL 

      THEN TIMESTAMPDIFF(MINUTE, `fecha_inicio_reparacion`, `fecha_fin_reparacion`) 

      ELSE NULL 

    END 

  ) STORED, 

  `tiempo_reparacion_horas` DECIMAL(10,2) GENERATED ALWAYS AS ( 

    CASE WHEN `fecha_fin_reparacion` IS NOT NULL 

      THEN TIMESTAMPDIFF(MINUTE, `fecha_inicio_reparacion`, `fecha_fin_reparacion`) / 60.0 

      ELSE NULL 

    END 

  ) STORED, 

 

  `maquina_origen` VARCHAR(50) DEFAULT NULL COMMENT 'Máquina de inyección de procedencia', 

  `nivel_reparacion` TINYINT(4) DEFAULT NULL, 

  `grupo_reparacion` TINYINT(4) DEFAULT NULL, 

  `prioridad` TINYINT(4) DEFAULT 3, 

  `fecha_bajado` DATETIME DEFAULT NULL, 

  `fecha_recepcion_taller` DATETIME DEFAULT NULL, 

  `fecha_inicio_trabajo` DATETIME DEFAULT NULL, 

  `fecha_termino_trabajo` DATETIME DEFAULT NULL, 

  `ciclo_activo` TINYINT(1) DEFAULT 1, 

  `creado_el` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, 

  `actualizado_el` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, 

 

  PRIMARY KEY (`id_ciclo_reparacion`), 

  KEY `idx_molde_rep_molde` (`molde_id`), 

  KEY `idx_molde_rep_fecha_inicio` (`fecha_inicio_reparacion`), 

  KEY `idx_molde_rep_fecha_fin` (`fecha_fin_reparacion`), 

  KEY `idx_molde_rep_activo` (`ciclo_activo`), 

  KEY `idx_molde_rep_motivo` (`motivo_entrada`), 

  KEY `idx_molde_rep_prioridad` (`prioridad`), 

  KEY `fk_falla_molde` (`falla_id`), 

  CONSTRAINT `fk_falla_molde` FOREIGN KEY (`falla_id`) 

    REFERENCES `tbl_fallas_catalogo_molde` (`id_falla_molde`) ON DELETE SET NULL 

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci; 

 

 

-- ============================================================================ 

-- 9. TÉCNICOS ASIGNADOS A CICLOS DE MOLDE (parallel to tbl_tecnicos_ciclo) 

-- ============================================================================ 

 

CREATE TABLE IF NOT EXISTS `tbl_tecnicos_ciclo_molde` ( 

  `id_tecnico_ciclo` INT(11) NOT NULL AUTO_INCREMENT, 

  `ciclo_id` INT(11) NOT NULL, 

  `empleado_numero` VARCHAR(20) DEFAULT NULL, 

  `empleado_nombre` VARCHAR(100) NOT NULL, 

  `grupo` TINYINT(4) DEFAULT NULL, 

  `fecha_inicio` DATETIME DEFAULT CURRENT_TIMESTAMP, 

  `fecha_fin` DATETIME DEFAULT NULL, 

  `tipo` ENUM('Técnico','Supervisor','Apoyo') DEFAULT 'Técnico', 

  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, 

 

  PRIMARY KEY (`id_tecnico_ciclo`), 

  KEY `idx_tcm_ciclo` (`ciclo_id`), 

  KEY `idx_tcm_empleado` (`empleado_numero`), 

  CONSTRAINT `fk_tcm_ciclo` FOREIGN KEY (`ciclo_id`) 

    REFERENCES `tbl_ciclos_reparacion_molde` (`id_ciclo_reparacion`) ON DELETE CASCADE 

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci; 

 

 

-- ============================================================================ 

-- 10. HISTORIAL DE CAMBIOS DE MOLDES (parallel to tbl_troqueles_historial) 

-- ============================================================================ 

 

CREATE TABLE IF NOT EXISTS `tbl_moldes_historial` ( 

  `id_historial` INT(11) NOT NULL AUTO_INCREMENT, 

  `molde_id` VARCHAR(50) NOT NULL, 

  `campo_modificado` VARCHAR(50) NOT NULL, 

  `valor_anterior` TEXT DEFAULT NULL, 

  `valor_nuevo` TEXT DEFAULT NULL, 

  `usuario_id` INT(11) DEFAULT NULL, 

  `fecha_cambio` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, 

 

  PRIMARY KEY (`id_historial`), 

  KEY `idx_mh_molde` (`molde_id`), 

  KEY `idx_mh_fecha` (`fecha_cambio`), 

  CONSTRAINT `fk_mh_molde` FOREIGN KEY (`molde_id`) 

    REFERENCES `tbl_moldes` (`id_molde`) ON DELETE CASCADE 

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci; 

 

 

-- ============================================================================ 

-- 11. HISTORIAL DE ACCIONES (parallel to tbl_historial) 

-- ============================================================================ 

 

CREATE TABLE IF NOT EXISTS `tbl_historial_molde` ( 

  `id_historial` INT(11) NOT NULL AUTO_INCREMENT, 

  `molde_id` VARCHAR(50) NOT NULL, 

  `tipo_registro` VARCHAR(50) DEFAULT NULL, 

  `action_type` VARCHAR(50) NOT NULL, 

  `id_falla` INT(11) DEFAULT NULL, 

  `modelo_nuevo` VARCHAR(100) DEFAULT NULL, 

  `nivel_setup` VARCHAR(10) DEFAULT NULL, 

  `grupo` VARCHAR(10) DEFAULT NULL, 

  `comentarios` TEXT DEFAULT NULL, 

  `motivo` VARCHAR(100) DEFAULT NULL, 

  `comentarios_supervisor` TEXT DEFAULT NULL, 

  `empleado_molde` VARCHAR(100) DEFAULT NULL, 

  `empleado_asistencia` VARCHAR(100) DEFAULT NULL, 

  `creado_el` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, 

  `folio` VARCHAR(100) DEFAULT NULL, 

 

  PRIMARY KEY (`id_historial`), 

  KEY `idx_hm_molde` (`molde_id`), 

  KEY `idx_hm_fecha` (`creado_el`), 

  KEY `idx_hm_falla` (`id_falla`) 

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci; 

 

 

-- ============================================================================ 

-- 12. PRIORIDAD DE REPARACIÓN MOLDES (parallel to tbl_prioridad_reparacion) 

-- ============================================================================ 

 

CREATE TABLE IF NOT EXISTS `tbl_prioridad_reparacion_molde` ( 

  `id_prioridad` INT(11) NOT NULL AUTO_INCREMENT, 

  `prioridad` INT(11) NOT NULL, 

  `id_molde` VARCHAR(50) NOT NULL, 

  `creado_el` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, 

  `actualizado_el` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, 

 

  PRIMARY KEY (`id_prioridad`), 

  UNIQUE KEY `uk_prioridad_molde` (`prioridad`) 

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci; 

 

 

-- ============================================================================ 

-- 13. RESUMEN DE MOLDES (parallel to tbl_resumen_troqueles) 

-- ============================================================================ 

 

CREATE TABLE IF NOT EXISTS `tbl_resumen_moldes` ( 

  `id_resumen` INT(11) NOT NULL AUTO_INCREMENT, 

  `etiqueta` ENUM('UP','BACKUP','TOTAL') NOT NULL, 

  `count` VARCHAR(20) DEFAULT '-', 

  `goal` VARCHAR(20) DEFAULT '-', 

  `perf` VARCHAR(20) DEFAULT '-', 

  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, 

 

  PRIMARY KEY (`id_resumen`), 

  UNIQUE KEY `uk_resumen_molde_etiqueta` (`etiqueta`) 

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci; 

 

INSERT INTO `tbl_resumen_moldes` (`etiqueta`, `count`, `goal`, `perf`) VALUES 

  ('UP',     '-', '-', '-'), 

  ('BACKUP', '-', '-', '-'), 

  ('TOTAL',  '-', '-', '-'); 

 

 

-- ============================================================================ 

-- 14. STORED PROCEDURES 

-- ============================================================================ 

 

DELIMITER $$ 

 

-- SP: Iniciar ciclo de reparación de molde 

CREATE PROCEDURE `sp_iniciar_ciclo_reparacion_molde` ( 

  IN `p_molde_id` VARCHAR(50), 

  IN `p_molde_nombre` VARCHAR(100), 

  IN `p_modelo` VARCHAR(100), 

  IN `p_motivo_entrada` VARCHAR(50), 

  IN `p_falla_id` INT, 

  IN `p_falla_descripcion` VARCHAR(255), 

  IN `p_folio` VARCHAR(50), 

  IN `p_empleado` VARCHAR(100), 

  IN `p_comentarios` TEXT, 

  IN `p_status_anterior` VARCHAR(50), 

  IN `p_maquina_origen` VARCHAR(50), 

  IN `p_nivel` TINYINT, 

  IN `p_grupo` TINYINT 

) 

BEGIN 

  INSERT INTO tbl_ciclos_reparacion_molde ( 

    molde_id, molde_nombre, modelo, 

    fecha_inicio_reparacion, motivo_entrada, 

    falla_id, falla_descripcion, 

    folio_entrada, empleado_registro, comentarios_entrada, 

    status_anterior, maquina_origen, 

    nivel_reparacion, grupo_reparacion, 

    fecha_bajado, ciclo_activo 

  ) VALUES ( 

    p_molde_id, p_molde_nombre, p_modelo, 

    NOW(), p_motivo_entrada, 

    p_falla_id, p_falla_descripcion, 

    p_folio, p_empleado, p_comentarios, 

    p_status_anterior, p_maquina_origen, 

    p_nivel, p_grupo, 

    NOW(), TRUE 

  ); 

  SELECT LAST_INSERT_ID() AS ciclo_id; 

END$$ 

 

-- SP: Actualizar proceso de reparación de molde 

CREATE PROCEDURE `sp_actualizar_proceso_reparacion_molde` ( 

  IN `p_ciclo_id` INT, 

  IN `p_paso` VARCHAR(50) 

) 

BEGIN 

  CASE p_paso 

    WHEN 'recepcion' THEN 

      UPDATE tbl_ciclos_reparacion_molde 

      SET fecha_recepcion_taller = NOW() 

      WHERE id_ciclo_reparacion = p_ciclo_id; 

    WHEN 'inicio' THEN 

      UPDATE tbl_ciclos_reparacion_molde 

      SET fecha_inicio_trabajo = NOW() 

      WHERE id_ciclo_reparacion = p_ciclo_id; 

    WHEN 'termino' THEN 

      UPDATE tbl_ciclos_reparacion_molde 

      SET fecha_termino_trabajo = NOW() 

      WHERE id_ciclo_reparacion = p_ciclo_id; 

  END CASE; 

  SELECT ROW_COUNT() AS rows_affected; 

END$$ 

 

-- SP: Cerrar ciclo de reparación de molde 

CREATE PROCEDURE `sp_cerrar_ciclo_reparacion_molde` ( 

  IN `p_ciclo_id` INT, 

  IN `p_status_salida` VARCHAR(50), 

  IN `p_empleado_cierre` VARCHAR(100), 

  IN `p_comentarios` TEXT, 

  IN `p_folio` VARCHAR(50) 

) 

BEGIN 

  UPDATE tbl_ciclos_reparacion_molde 

  SET fecha_fin_reparacion = NOW(), 

      status_salida = p_status_salida, 

      empleado_cierre = p_empleado_cierre, 

      comentarios_salida = p_comentarios, 

      folio_salida = p_folio, 

      fecha_termino_trabajo = NOW(), 

      ciclo_activo = FALSE 

  WHERE id_ciclo_reparacion = p_ciclo_id 

    AND ciclo_activo = TRUE; 

 

  -- Also close all technician assignments 

  UPDATE tbl_tecnicos_ciclo_molde 

  SET fecha_fin = NOW() 

  WHERE ciclo_id = p_ciclo_id 

    AND fecha_fin IS NULL; 

 

  SELECT ROW_COUNT() AS rows_affected; 

END$$ 

 

-- SP: Obtener ciclo activo de un molde 

CREATE PROCEDURE `sp_obtener_ciclo_activo_molde` ( 

  IN `p_molde_id` VARCHAR(50) 

) 

BEGIN 

  SELECT cr.*, 

    TIMESTAMPDIFF(HOUR, cr.fecha_inicio_reparacion, NOW()) AS horas_transcurridas 

  FROM tbl_ciclos_reparacion_molde cr 

  WHERE cr.molde_id = p_molde_id 

    AND cr.ciclo_activo = TRUE 

  ORDER BY cr.fecha_inicio_reparacion DESC 

  LIMIT 1; 

END$$ 

 

DELIMITER ; 

 

 

-- ============================================================================ 

-- 15. VIEWS 

-- ============================================================================ 

 

-- View: Reparaciones activas de moldes 

CREATE OR REPLACE VIEW `vw_reparaciones_activas_molde` AS 

SELECT 

  cr.`id_ciclo_reparacion`, 

  cr.`molde_id`, 

  cr.`molde_nombre`, 

  cr.`modelo`, 

  cr.`fecha_inicio_reparacion`, 

  cr.`motivo_entrada`, 

  cr.`falla_descripcion`, 

  cr.`prioridad`, 

  cr.`maquina_origen`, 

  TIMESTAMPDIFF(HOUR, cr.`fecha_inicio_reparacion`, CURRENT_TIMESTAMP()) AS `horas_en_reparacion`, 

  TIMESTAMPDIFF(DAY, cr.`fecha_inicio_reparacion`, CURRENT_TIMESTAMP()) AS `dias_en_reparacion`, 

  GROUP_CONCAT(DISTINCT tc.`empleado_nombre` SEPARATOR ', ') AS `tecnicos_asignados` 

FROM `tbl_ciclos_reparacion_molde` cr 

LEFT JOIN `tbl_tecnicos_ciclo_molde` tc 

  ON cr.`id_ciclo_reparacion` = tc.`ciclo_id` AND tc.`fecha_fin` IS NULL 

WHERE cr.`ciclo_activo` = 1 

GROUP BY cr.`id_ciclo_reparacion` 

ORDER BY cr.`prioridad` ASC, cr.`fecha_inicio_reparacion` ASC; 

 

 

-- View: Historial de reparaciones completadas de moldes 

CREATE OR REPLACE VIEW `vw_historial_reparaciones_molde` AS 

SELECT 

  cr.`id_ciclo_reparacion`, 

  cr.`molde_id`, 

  cr.`molde_nombre`, 

  cr.`modelo`, 

  cr.`fecha_inicio_reparacion`, 

  cr.`fecha_fin_reparacion`, 

  cr.`motivo_entrada`, 

  cr.`falla_descripcion`, 

  cr.`status_anterior`, 

  cr.`status_salida`, 

  cr.`tiempo_reparacion_horas`, 

  cr.`maquina_origen`, 

  cr.`empleado_registro`, 

  cr.`empleado_cierre`, 

  CASE 

    WHEN cr.`tiempo_reparacion_horas` <= 4  THEN 'Rápida (≤4h)' 

    WHEN cr.`tiempo_reparacion_horas` <= 24 THEN 'Normal (4-24h)' 

    WHEN cr.`tiempo_reparacion_horas` <= 72 THEN 'Extendida (1-3 días)' 

    ELSE 'Prolongada (>3 días)' 

  END AS `clasificacion_tiempo` 

FROM `tbl_ciclos_reparacion_molde` cr 

WHERE cr.`ciclo_activo` = 0 

ORDER BY cr.`fecha_fin_reparacion` DESC; 

 

 

-- View: Estadísticas por molde 

CREATE OR REPLACE VIEW `vw_estadisticas_molde` AS 

SELECT 

  `molde_id`, 

  `molde_nombre`, 

  COUNT(*) AS `total_reparaciones`, 

  COUNT(CASE WHEN `ciclo_activo` = 0 THEN 1 END) AS `reparaciones_completadas`, 

  COUNT(CASE WHEN `ciclo_activo` = 1 THEN 1 END) AS `reparaciones_activas`, 

  AVG(CASE WHEN `ciclo_activo` = 0 THEN `tiempo_reparacion_horas` END) AS `promedio_horas_reparacion`, 

  MIN(CASE WHEN `ciclo_activo` = 0 THEN `tiempo_reparacion_horas` END) AS `min_horas_reparacion`, 

  MAX(CASE WHEN `ciclo_activo` = 0 THEN `tiempo_reparacion_horas` END) AS `max_horas_reparacion`, 

  SUM(CASE WHEN `motivo_entrada` = 'Falla de Molde' THEN 1 ELSE 0 END) AS `total_fallas`, 

  SUM(CASE WHEN `motivo_entrada` = 'Limpieza General' THEN 1 ELSE 0 END) AS `total_limpiezas`, 

  SUM(CASE WHEN `motivo_entrada` = 'Cambio de Modelo' THEN 1 ELSE 0 END) AS `total_cambios_modelo`, 

  SUM(CASE WHEN `motivo_entrada` = 'Mantenimiento Preventivo' THEN 1 ELSE 0 END) AS `total_mantenimientos`, 

  SUM(CASE WHEN `motivo_entrada` = 'Cambio de Componente' THEN 1 ELSE 0 END) AS `total_cambios_componente` 

FROM `tbl_ciclos_reparacion_molde` 

GROUP BY `molde_id`, `molde_nombre`; 

 

 

-- View: Resumen mensual de reparaciones de moldes 

CREATE OR REPLACE VIEW `vw_resumen_mensual_molde` AS 

SELECT 

  YEAR(`fecha_inicio_reparacion`) AS `anio`, 

  MONTH(`fecha_inicio_reparacion`) AS `mes`, 

  DATE_FORMAT(`fecha_inicio_reparacion`, '%Y-%m') AS `periodo`, 

  COUNT(*) AS `total_reparaciones`, 

  COUNT(CASE WHEN `ciclo_activo` = 0 THEN 1 END) AS `completadas`, 

  AVG(CASE WHEN `ciclo_activo` = 0 THEN `tiempo_reparacion_horas` END) AS `promedio_horas`, 

  SUM(CASE WHEN `motivo_entrada` = 'Falla de Molde' THEN 1 ELSE 0 END) AS `por_falla`, 

  SUM(CASE WHEN `motivo_entrada` = 'Limpieza General' THEN 1 ELSE 0 END) AS `por_limpieza`, 

  SUM(CASE WHEN `motivo_entrada` = 'Cambio de Modelo' THEN 1 ELSE 0 END) AS `por_cambio_modelo`, 

  SUM(CASE WHEN `motivo_entrada` = 'Mantenimiento Preventivo' THEN 1 ELSE 0 END) AS `por_mantenimiento`, 

  SUM(CASE WHEN `motivo_entrada` = 'Cambio de Componente' THEN 1 ELSE 0 END) AS `por_cambio_componente` 

FROM `tbl_ciclos_reparacion_molde` 

GROUP BY YEAR(`fecha_inicio_reparacion`), MONTH(`fecha_inicio_reparacion`) 

ORDER BY YEAR(`fecha_inicio_reparacion`) DESC, MONTH(`fecha_inicio_reparacion`) DESC; 

 

 

-- ============================================================================ 

-- DONE - Summary of objects created: 

-- ============================================================================ 

-- TABLES (12): 

--   tbl_tipos_molde              - Catalog of mold types 

--   tbl_maquinas_inyeccion       - Injection machines (like prensas) 

--   tbl_moldes                   - Main molds table (like troqueles) 

--   tbl_modelos_molde            - Production models per mold 

--   tbl_fallas_catalogo_molde    - Failure catalog for molds 

--   tbl_asistencia_maquina       - Machine assistance catalog 

--   tbl_ciclos_reparacion_molde  - Repair cycles for molds 

--   tbl_tecnicos_ciclo_molde     - Technician assignments 

--   tbl_moldes_historial         - Field change history 

--   tbl_historial_molde          - Action history 

--   tbl_prioridad_reparacion_molde - Repair priority queue 

--   tbl_resumen_moldes           - Summary stats 

-- 

-- STORED PROCEDURES (4): 

--   sp_iniciar_ciclo_reparacion_molde 

--   sp_actualizar_proceso_reparacion_molde 

--   sp_cerrar_ciclo_reparacion_molde 

--   sp_obtener_ciclo_activo_molde 

-- 

-- VIEWS (4): 

--   vw_reparaciones_activas_molde 

--   vw_historial_reparaciones_molde 

--   vw_estadisticas_molde 

--   vw_resumen_mensual_molde 

-- ============================================================================ 