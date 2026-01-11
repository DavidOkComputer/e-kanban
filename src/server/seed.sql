-- E-Kanban Tool Room Seed Data
USE ekanban_toolroom;

-- Insert Troqueles (Dies)
INSERT INTO troqueles (id, name, status, year, model, golpes, golpes_acum, capacidad_golpes, rectificaciones) VALUES
-- 2025
('T951', 'Alpha', 'En prensa', 2025, 'G3-VSS - G3-VSS', '257,540', '121,442,752', '250,000,000', '15 - (28/10/2025)'),
('T952', 'Beta', 'Listo-BackUp', 2025, 'H2-XLS - H2-XLS', '180,200', '95,000,000', '200,000,000', '12 - (15/09/2025)'),
('T953', 'Gamma', 'Reparando', 2025, 'K1-PRO - K1-PRO', '320,100', '200,000,000', '300,000,000', '20 - (01/11/2025)'),
('T954', 'Delta', 'Pendiente', 2025, 'M4-STD - M4-STD', '95,000', '50,000,000', '150,000,000', '8 - (20/08/2025)'),
('T955', 'Echo', 'Listo', 2025, 'P2-MAX - P2-MAX', '410,000', '180,000,000', '400,000,000', '25 - (05/10/2025)'),
-- 2026
('T956', 'Zeta', 'Pendiente', 2026, 'R1-NEW', '-', '-', '250,000,000', '0'),
('T957', 'Eta', 'Pendiente', 2026, 'S3-ADV', '-', '-', '300,000,000', '0'),
('T958', 'Theta', 'Pendiente', 2026, 'T2-PRO', '-', '-', '200,000,000', '0'),
-- 2027
('T959', 'Iota', 'Pendiente', 2027, 'U1-TIT', '-', '-', '350,000,000', '0'),
('T960', 'Kappa', 'Pendiente', 2027, 'V2-AUT', '-', '-', '400,000,000', '0'),
('T961', 'Lambda', 'Pendiente', 2027, 'W1-STL', '-', '-', '280,000,000', '0'),
('T962', 'Mu', 'Pendiente', 2027, 'X3-ALU', '-', '-', '220,000,000', '0'),
('T963', 'Nu', 'Pendiente', 2027, 'Y1-ROB', '-', '-', '500,000,000', '0'),
('T964', 'Xi', 'Pendiente', 2027, 'Z2-ZNC', '-', '-', '180,000,000', '0'),
-- 2028
('T965', 'Omicron', 'Pendiente', 2028, 'A1-BRS', '-', '-', '150,000,000', '0'),
('T966', 'Pi', 'Pendiente', 2028, 'B2-ASM', '-', '-', '600,000,000', '0'),
-- 2029
('T967', 'Rho', 'Pendiente', 2029, 'C1-AER', '-', '-', '320,000,000', '0');

-- Insert Prensas history
INSERT INTO prensas (troquel_id, year, model, is_current) VALUES
-- T951 prensas
('T951', 2002, 'G3-VSS - G3-VSS', FALSE),
('T951', 2007, NULL, FALSE),
('T951', 2016, NULL, FALSE),
('T951', 2025, NULL, TRUE),
-- T952 prensas
('T952', 2005, 'H2-XLS', FALSE),
('T952', 2018, NULL, FALSE),
-- T953 prensas
('T953', 2010, 'K1-PRO', FALSE),
-- T954 prensas
('T954', 2015, 'M4-STD', FALSE),
-- T955 prensas
('T955', 2008, 'P2-MAX', FALSE),
('T955', 2020, NULL, FALSE);

-- Insert Priority Repairs
INSERT INTO priority_repairs (priority, troquel_id) VALUES
(1, 'T954'),
(2, 'T953'),
(3, 'T951'),
(4, 'T955'),
(5, 'T952');

-- Insert Troqueles Summary
INSERT INTO troqueles_summary (label, count, goal, perf) VALUES
('UP', '-', '-', '-'),
('BACKUP', '-', '-', '-'),
('TOTAL', '-', '-', '-');

-- Insert Fallas Catalog
INSERT INTO fallas_catalog (description) VALUES
('AJUSTAR MATRIZ SLOTOS ROTOS'),
('AJUSTE DE LAINA'),
('AJUSTE MATRIZ DE FORMADO'),
('AJUSTE SENSOR MISFEED'),
('ARO RETENCION QUEBRADO'),
('BANDA REVENTADA'),
('CANDADO ESTATOR QUEBRADO'),
('CILINDRO COUNTERBORE NO ACCIONA'),
('CILINDRO SEPARADOR NO ACCIONA'),
('CONCENTRICIDAD FUERA DE ESPECIFICACION'),
('DEPOSTILLADURA EN CUCHILLA ESTATOR'),
('DIA EXT DE ROTOR F/E'),
('DIAMETRO INTERIOR ESTATOR ABIERTO'),
('DIAMETRO INTERIOR ESTATOR CERRADO'),
('DIAMETRO INTERIOR ROTOR ABIERTO');