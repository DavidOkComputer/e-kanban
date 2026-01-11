-- E-Kanban Tool Room Database

CREATE DATABASE IF NOT EXISTS ekanban_toolroom_db;
USE ekanban_toolroom_db;

-- Troqueles tabla
CREATE TABLE IF NOT EXISTS tbl_troqueles (
    id_troquel VARCHAR(10) PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    status ENUM('En prensa', 'Listo-BackUp', 'Listo', 'Reparando', 'Pendiente') DEFAULT 'Pendiente',
    año INT NOT NULL,
    modelo VARCHAR(100),
    golpes VARCHAR(50) DEFAULT '-',
    golpes_acum VARCHAR(50) DEFAULT '-',
    capacidad_golpes VARCHAR(50) DEFAULT '-',
    rectificaciones VARCHAR(100) DEFAULT '0',
    url_imagen VARCHAR(255),
    num_pieza_1 varchar(50),
    num_pieza_2 varchar(50),
    num_pieza_3 varchar(50),
    num_pieza_4 varchar(50),
    creado_el TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_el TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Prensas tabla historial
CREATE TABLE IF NOT EXISTS tbl_prensas (
    id_prensa INT AUTO_INCREMENT PRIMARY KEY,
    fk_id_troquel VARCHAR(10) NOT NULL,
    año INT NOT NULL,
    modelo VARCHAR(100),
    es_actual BOOLEAN DEFAULT FALSE,
    creado_el TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- tabla de prioridades de reparacion
CREATE TABLE IF NOT EXISTS tbl_prioridad_reparacion (
    id_prioridad_reparacion INT AUTO_INCREMENT PRIMARY KEY,
    prioridad INT NOT NULL UNIQUE,
    id_troquel VARCHAR(10) NOT NULL,
    creado_el TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_el TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
);

-- tabla de resumen de troqueles
CREATE TABLE IF NOT EXISTS tbl_resumen_troqueles (
    id_resumen_troqueles INT AUTO_INCREMENT PRIMARY KEY,
    etiqueta ENUM('UP', 'BACKUP', 'TOTAL') NOT NULL UNIQUE,
    count VARCHAR(20) DEFAULT '-',
    goal VARCHAR(20) DEFAULT '-',
    perf VARCHAR(20) DEFAULT '-',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Fallas catalogo tabla
CREATE TABLE IF NOT EXISTS tbl_fallas_catalogo (
    id_fallas_catalogo INT AUTO_INCREMENT PRIMARY KEY,
    descripcion VARCHAR(255) NOT NULL,
    activo BOOLEAN DEFAULT TRUE
);

-- historial
CREATE TABLE IF NOT EXISTS tbl_historial (
    id_historial INT AUTO_INCREMENT PRIMARY KEY,
    troquel_id VARCHAR(10) NOT NULL,
    action_type ENUM('Limpieza General', 'Cambio de Modelo', 'Falla de Troquel', 'Asistencia en Prensa') NOT NULL,
    id_falla INT,
    modelo_nuevo VARCHAR(100),
    nivel_setup VARCHAR(50),
    grupo INT,
    comentarios TEXT,
    motivo VARCHAR(100),
    comentarios_supervisor TEXT,
    id_usuario INT,
    creado_el TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (troquel_id) REFERENCES troqueles(id) ON DELETE CASCADE,
    FOREIGN KEY (falla_id) REFERENCES fallas_catalog(id)
);

-- Indices
CREATE INDEX idx_troqueles_year ON troqueles(year);
CREATE INDEX idx_troqueles_status ON troqueles(status);
CREATE INDEX idx_prensas_troquel ON prensas(troquel_id);
CREATE INDEX idx_action_history_troquel ON action_history(troquel_id);