 1. MySQL Database Schema 

-- Create database (or use existing) 
CREATE DATABASE IF NOT EXISTS toolroom_kanban_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci; 

USE toolroom_kanban_db; 

-- Main troqueles (dies) table 
CREATE TABLE IF NOT EXISTS tbl_troqueles ( 
    id VARCHAR(20) PRIMARY KEY,
    name VARCHAR(100) NOT NULL, 
    status ENUM('Pendiente', 'En prensa', 'Listo', 'Listo-BackUp', 'Reparando', 'Baja') DEFAULT 'Pendiente', 
    year INT NOT NULL, 
    model VARCHAR(100) NULL, 
    golpes VARCHAR(50) DEFAULT '-', 
    golpes_acum VARCHAR(50) DEFAULT '-', 
    capacidad_golpes VARCHAR(50) DEFAULT '-', 
    rectificaciones VARCHAR(100) DEFAULT '0', 
    image_url TEXT NULL, 
    notes TEXT NULL, 

    -- Additional fields 
    prensa_asignada VARCHAR(50) NULL, 
    tipo_troquel ENUM('progresivo', 'transfer', 'simple', 'compuesto', 'multiple') DEFAULT 'progresivo', 
    ubicacion VARCHAR(100) NULL, 
    numero_serie VARCHAR(100) NULL,
    peso_kg VARCHAR(50) NULL, 
    dimensiones VARCHAR(100) NULL, 
    material_base VARCHAR(100) NULL, 
    num_estaciones VARCHAR(20) NULL, 
    vida_util_estimada VARCHAR(50) NULL, 

    -- Audit fields 
    created_by INT NULL, 
    updated_by INT NULL, 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, 

    -- Indexes 
    INDEX idx_status (status), 
    INDEX idx_year (year),
    INDEX idx_cliente (cliente), 
    INDEX idx_prensa (prensa_asignada), 
    INDEX idx_tipo (tipo_troquel), 
    INDEX idx_created (created_at) 
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci; 

-- History/audit log for changes 
CREATE TABLE IF NOT EXISTS tbl_troqueles_historial ( 
    id_historial INT AUTO_INCREMENT PRIMARY KEY, 
    troquel_id VARCHAR(20) NOT NULL, 
    campo_modificado VARCHAR(50) NOT NULL, 
    valor_anterior TEXT NULL, 
    valor_nuevo TEXT NULL, 
    usuario_id INT NULL, 
    fecha_cambio TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
    INDEX idx_troquel (troquel_id), 
    INDEX idx_fecha (fecha_cambio), 
    FOREIGN KEY (troquel_id) REFERENCES tbl_troqueles(id) ON DELETE CASCADE 
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci; 

-- Maintenance/repair records 
CREATE TABLE IF NOT EXISTS tbl_troqueles_mantenimiento ( 
    id_mantenimiento INT AUTO_INCREMENT PRIMARY KEY, 
    troquel_id VARCHAR(20) NOT NULL, 
    tipo_mantenimiento ENUM('preventivo', 'correctivo', 'rectificacion', 'emergencia') NOT NULL, 
    descripcion TEXT NOT NULL, 
    fecha_inicio DATE NOT NULL, 
    fecha_fin DATE NULL, 
    costo DECIMAL(10,2) NULL, 
    proveedor_servicio VARCHAR(150) NULL, 
    responsable VARCHAR(100) NULL, 
    observaciones TEXT NULL, 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
    INDEX idx_troquel (troquel_id), 
    INDEX idx_tipo (tipo_mantenimiento), 
    INDEX idx_fecha (fecha_inicio), 
    FOREIGN KEY (troquel_id) REFERENCES tbl_troqueles(id) ON DELETE CASCADE 
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci; 

-- Insert sample data 
INSERT INTO tbl_troqueles (id, name, status, year, model, golpes, golpes_acum, capacidad_golpes, rectificaciones, tipo_troquel, cliente, prensa_asignada, ubicacion) VALUES 
('T001', 'Alpha', 'En prensa', 2024, 'G3-VSS', '257,540', '121,442,752', '250,000,000', '15', 'progresivo', 'Cliente A', 'Prensa 1', 'Rack A-01'), 
('T002', 'Beta', 'Listo', 2024, 'G3-VTS', '180,200', '95,320,100', '200,000,000', '12', 'progresivo', 'Cliente B', 'Prensa 2', 'Rack A-02'), 
('T003', 'Gamma', 'Reparando', 2023, 'G4-XLS', '320,100', '156,780,500', '300,000,000', '18', 'transfer', 'Cliente A', NULL, 'Taller'), 
('T004', 'Delta', 'Pendiente', 2025, 'G5-PRO', '-', '-', '150,000,000', '0', 'simple', 'Cliente C', NULL, 'Almacén'), 
('T005', 'Epsilon', 'Listo-BackUp', 2023, 'G3-VSS', '145,600', '88,920,300', '250,000,000', '10', 'progresivo', 'Cliente B', NULL, 'Rack B-05'); 

2. PHP API Files  
`api/troqueles/index.php` (Main Router) 

<?php 
// api/troqueles/index.php 
header('Content-Type: application/json'); 
header('Access-Control-Allow-Origin: *'); 
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS'); 
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight 
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { 
    http_response_code(200); 
    exit(); 
} 
require_once '../../db_config.php'; 
$method = $_SERVER['REQUEST_METHOD']; 
$uri = $_SERVER['REQUEST_URI']; 

// Parse the URI to get the troquel ID if present 
$path = parse_url($uri, PHP_URL_PATH); 
$pathParts = explode('/', trim($path, '/')); 

// Find the troquel ID (after 'troqueles') 
$troquelId = null; 
$isSearch = false; 

foreach ($pathParts as $index => $part) { 
    if ($part === 'troqueles' && isset($pathParts[$index + 1])) { 
        $nextPart = $pathParts[$index + 1]; 
        if ($nextPart === 'search') { 
            $isSearch = true; 
        } else { 
            $troquelId = urldecode($nextPart); 
        } 
        break; 
    } 
} 
$conn = getDBConnection(); 

if (!$conn) { 
    http_response_code(500); 
    echo json_encode(['success' => false, 'message' => 'Database connection failed']); 
    exit(); 
} 

try { 
    switch ($method) { 
        case 'GET': 
            if ($isSearch) { 
                handleSearch($conn); 
            } elseif ($troquelId) { 
                getTroquel($conn, $troquelId); 
            } else { 
                getAllTroqueles($conn); 
            } 
            break; 
        case 'POST': 
            createTroquel($conn); 
            break; 
        case 'PUT': 
            if ($troquelId) { 
                updateTroquel($conn, $troquelId); 
            } else { 
                http_response_code(400); 
                echo json_encode(['success' => false, 'message' => 'ID de troquel requerido']); 
            } 
            break; 

        case 'DELETE': 
            if ($troquelId) { 
                deleteTroquel($conn, $troquelId); 
            } else { 
                http_response_code(400); 
                echo json_encode(['success' => false, 'message' => 'ID de troquel requerido']); 
            } 
            break;
            
        default: 
            http_response_code(405); 
            echo json_encode(['success' => false, 'message' => 'Método no permitido']); 
    } 
} catch (Exception $e) { 
    http_response_code(500); 
    echo json_encode(['success' => false, 'message' => 'Error del servidor: ' . $e->getMessage()]); 
} finally { 
    $conn->close(); 
} 

// ============ HANDLER FUNCTIONS ============ 
function getAllTroqueles($conn) { 
    $sql = "SELECT * FROM tbl_troqueles ORDER BY created_at DESC"; 
    $result = $conn->query($sql); 
    $troqueles = []; 

    while ($row = $result->fetch_assoc()) { 
        $troqueles[] = $row; 
    } 
    echo json_encode($troqueles); 
} 

function getTroquel($conn, $id) { 
    $stmt = $conn->prepare("SELECT * FROM tbl_troqueles WHERE id = ?"); 
    $stmt->bind_param("s", $id); 
    $stmt->execute(); 
    $result = $stmt->get_result(); 

    if ($result->num_rows === 0) { 
        http_response_code(404); 
        echo json_encode(['success' => false, 'message' => 'Troquel no encontrado']); 
        return; 
    } 

    echo json_encode($result->fetch_assoc()); 
    $stmt->close(); 
} 

function handleSearch($conn) { 
    $year = $_GET['year'] ?? null; 
    $status = $_GET['status'] ?? null; 
    $search = $_GET['search'] ?? null; 
    $cliente = $_GET['cliente'] ?? null;
    $sql = "SELECT * FROM tbl_troqueles WHERE 1=1"; 
    $params = []; 
    $types = ""; 

    if ($year) { 
        $sql .= " AND year = ?"; 
        $params[] = $year; 
        $types .= "i"; 
    } 

    if ($status) { 
        $sql .= " AND status = ?"; 
        $params[] = $status; 
        $types .= "s"; 
    } 

    if ($cliente) { 
        $sql .= " AND cliente = ?"; 
        $params[] = $cliente; 
        $types .= "s"; 
    } 

    if ($search) { 
        $sql .= " AND (id LIKE ? OR name LIKE ? OR model LIKE ?)"; 
        $searchTerm = "%$search%"; 
        $params[] = $searchTerm; 
        $params[] = $searchTerm; 
        $params[] = $searchTerm; 
        $types .= "sss"; 
    } 

    $sql .= " ORDER BY created_at DESC";      

    $stmt = $conn->prepare($sql);
     
    if (!empty($params)) { 
        $stmt->bind_param($types, ...$params); 
    } 

    $stmt->execute(); 
    $result = $stmt->get_result(); 
    $troqueles = []; 

    while ($row = $result->fetch_assoc()) { 
        $troqueles[] = $row; 
    } 

    echo json_encode($troqueles); 
    $stmt->close(); 
} 

function createTroquel($conn) { 
    $input = json_decode(file_get_contents('php://input'), true); 

    // Validate required fields 
    if (empty($input['id']) || empty($input['name']) || empty($input['year'])) { 
        http_response_code(400); 
        echo json_encode(['success' => false, 'message' => 'ID, nombre y año son requeridos']); 
        return; 
    } 

    // Check if ID already exists 
    $checkStmt = $conn->prepare("SELECT id FROM tbl_troqueles WHERE id = ?"); 
    $checkStmt->bind_param("s", $input['id']); 
    $checkStmt->execute(); 

    if ($checkStmt->get_result()->num_rows > 0) { 
        http_response_code(409); 
        echo json_encode(['success' => false, 'message' => 'Ya existe un troquel con ese ID']); 
        $checkStmt->close(); 
        return; 
    } 
    $checkStmt->close(); 

    $sql = "INSERT INTO tbl_troqueles ( 
        id, name, status, year, model, golpes, golpes_acum, capacidad_golpes, 
        rectificaciones, image_url, notes, cliente, prensa_asignada, tipo_troquel, 
        ubicacion, numero_serie, proveedor, fecha_fabricacion, peso_kg, 
        dimensiones, material_base, num_estaciones, vida_util_estimada 
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"; 

    $stmt = $conn->prepare($sql); 
    $id = strtoupper(trim($input['id'])); 
    $name = trim($input['name']); 
    $status = $input['status'] ?? 'Pendiente'; 
    $year = (int)$input['year']; 
    $model = $input['model'] ?? null; 
    $golpes = $input['golpes'] ?? '-'; 
    $golpes_acum = $input['golpes_acum'] ?? '-'; 
    $capacidad_golpes = $input['capacidad_golpes'] ?? '-'; 
    $rectificaciones = $input['rectificaciones'] ?? '0'; 
    $image_url = $input['image_url'] ?? null; 
    $notes = $input['notes'] ?? null; 
    $cliente = $input['cliente'] ?? null; 
    $prensa_asignada = $input['prensa_asignada'] ?? null; 
    $tipo_troquel = $input['tipo_troquel'] ?? 'progresivo'; 
    $ubicacion = $input['ubicacion'] ?? null; 
    $numero_serie = $input['numero_serie'] ?? null; 
    $proveedor = $input['proveedor'] ?? null; 
    $fecha_fabricacion = !empty($input['fecha_fabricacion']) ? $input['fecha_fabricacion'] : null; 
    $peso_kg = $input['peso_kg'] ?? null; 
    $dimensiones = $input['dimensiones'] ?? null; 
    $material_base = $input['material_base'] ?? null; 
    $num_estaciones = $input['num_estaciones'] ?? null; 
    $vida_util_estimada = $input['vida_util_estimada'] ?? null; 

    $stmt->bind_param( 
        "sssisssssssssssssssssss", 
        $id, $name, $status, $year, $model, $golpes, $golpes_acum, $capacidad_golpes, 
        $rectificaciones, $image_url, $notes, $cliente, $prensa_asignada, $tipo_troquel, 
        $ubicacion, $numero_serie, $proveedor, $fecha_fabricacion, $peso_kg, 
        $dimensiones, $material_base, $num_estaciones, $vida_util_estimada 
    ); 

    if ($stmt->execute()) { 
        http_response_code(201); 
        echo json_encode([ 
            'success' => true, 
            'message' => 'Troquel registrado exitosamente', 
            'id' => $id 
        ]); 
    } else { 
        http_response_code(500); 
        echo json_encode(['success' => false, 'message' => 'Error al registrar el troquel']); 
    } 
    $stmt->close(); 
} 

function updateTroquel($conn, $id) { 
    $input = json_decode(file_get_contents('php://input'), true); 

    // Check if troquel exists 
    $checkStmt = $conn->prepare("SELECT * FROM tbl_troqueles WHERE id = ?"); 
    $checkStmt->bind_param("s", $id); 
    $checkStmt->execute(); 
    $existing = $checkStmt->get_result()->fetch_assoc(); 

    if (!$existing) { 
        http_response_code(404); 
        echo json_encode(['success' => false, 'message' => 'Troquel no encontrado']); 
        $checkStmt->close(); 
        return; 
    } 
    $checkStmt->close(); 

    $sql = "UPDATE tbl_troqueles SET 
        name = ?, status = ?, year = ?, model = ?, golpes = ?, golpes_acum = ?, 
        capacidad_golpes = ?, rectificaciones = ?, image_url = ?, notes = ?, 
        cliente = ?, prensa_asignada = ?, tipo_troquel = ?, ubicacion = ?, 
        numero_serie = ?, proveedor = ?, fecha_fabricacion = ?, peso_kg = ?, 
        dimensiones = ?, material_base = ?, num_estaciones = ?, vida_util_estimada = ? 
        WHERE id = ?"; 

    $stmt = $conn->prepare($sql); 

    $name = trim($input['name'] ?? $existing['name']); 
    $status = $input['status'] ?? $existing['status']; 
    $year = (int)($input['year'] ?? $existing['year']); 
    $model = $input['model'] ?? $existing['model']; 
    $golpes = $input['golpes'] ?? $existing['golpes']; 
    $golpes_acum = $input['golpes_acum'] ?? $existing['golpes_acum']; 
    $capacidad_golpes = $input['capacidad_golpes'] ?? $existing['capacidad_golpes']; 
    $rectificaciones = $input['rectificaciones'] ?? $existing['rectificaciones']; 
    $image_url = $input['image_url'] ?? $existing['image_url']; 
    $notes = $input['notes'] ?? $existing['notes']; 
    $cliente = $input['cliente'] ?? $existing['cliente']; 
    $prensa_asignada = $input['prensa_asignada'] ?? $existing['prensa_asignada']; 
    $tipo_troquel = $input['tipo_troquel'] ?? $existing['tipo_troquel']; 
    $ubicacion = $input['ubicacion'] ?? $existing['ubicacion']; 
    $numero_serie = $input['numero_serie'] ?? $existing['numero_serie']; 
    $proveedor = $input['proveedor'] ?? $existing['proveedor']; 
    $fecha_fabricacion = !empty($input['fecha_fabricacion']) ? $input['fecha_fabricacion'] : $existing['fecha_fabricacion']; 
    $peso_kg = $input['peso_kg'] ?? $existing['peso_kg']; 
    $dimensiones = $input['dimensiones'] ?? $existing['dimensiones']; 
    $material_base = $input['material_base'] ?? $existing['material_base']; 
    $num_estaciones = $input['num_estaciones'] ?? $existing['num_estaciones']; 
    $vida_util_estimada = $input['vida_util_estimada'] ?? $existing['vida_util_estimada']; 

    $stmt->bind_param( 
        "ssisssssssssssssssssss", 
        $name, $status, $year, $model, $golpes, $golpes_acum, 
        $capacidad_golpes, $rectificaciones, $image_url, $notes, 
        $cliente, $prensa_asignada, $tipo_troquel, $ubicacion, 
        $numero_serie, $proveedor, $fecha_fabricacion, $peso_kg, 
        $dimensiones, $material_base, $num_estaciones, $vida_util_estimada, 
        $id 
    ); 

    if ($stmt->execute()) { 
        // Log the change 
        logChange($conn, $id, 'update', json_encode($existing), json_encode($input)); 

        echo json_encode([ 
            'success' => true, 
            'message' => 'Troquel actualizado exitosamente' 
        ]); 

    } else { 
        http_response_code(500); 
        echo json_encode(['success' => false, 'message' => 'Error al actualizar el troquel']); 
    } 
    $stmt->close(); 
} 

function deleteTroquel($conn, $id) { 
    // Check if troquel exists 
    $checkStmt = $conn->prepare("SELECT id, name FROM tbl_troqueles WHERE id = ?"); 
    $checkStmt->bind_param("s", $id); 
    $checkStmt->execute(); 
    $result = $checkStmt->get_result(); 

    if ($result->num_rows === 0) { 
        http_response_code(404); 
        echo json_encode(['success' => false, 'message' => 'Troquel no encontrado']); 
        $checkStmt->close(); 
        return; 
    } 

    $troquel = $result->fetch_assoc(); 
    $checkStmt->close(); 

    // Delete the troquel 
    $stmt = $conn->prepare("DELETE FROM tbl_troqueles WHERE id = ?"); 
    $stmt->bind_param("s", $id); 

    if ($stmt->execute()) { 
        echo json_encode([ 
            'success' => true, 
            'message' => "Troquel {$id} eliminado correctamente" 
        ]); 
    } else { 
        http_response_code(500); 
        echo json_encode(['success' => false, 'message' => 'Error al eliminar el troquel']); 
    } 

    $stmt->close(); 
} 

function logChange($conn, $troquelId, $campo, $valorAnterior, $valorNuevo) { 
    $stmt = $conn->prepare(" 
        INSERT INTO tbl_troqueles_historial (troquel_id, campo_modificado, valor_anterior, valor_nuevo) 
        VALUES (?, ?, ?, ?) 
    "); 

    $stmt->bind_param("ssss", $troquelId, $campo, $valorAnterior, $valorNuevo); 
    $stmt->execute(); 
    $stmt->close(); 
} 

?> 

`api/troqueles/stats.php` (Statistics Endpoint) 

<?php 
// api/troqueles/stats.php 
header('Content-Type: application/json'); 
header('Access-Control-Allow-Origin: *'); 

require_once '../../db_config.php'; 

$conn = getDBConnection(); 

if (!$conn) { 
    http_response_code(500); 
    echo json_encode(['success' => false, 'message' => 'Database connection failed']); 
    exit(); 
} 

try { 
    $stats = []; 

    // Total count 
    $result = $conn->query("SELECT COUNT(*) as total FROM tbl_troqueles"); 
    $stats['total'] = (int)$result->fetch_assoc()['total']; 

    // Count by status 
    $result = $conn->query(" 
        SELECT status, COUNT(*) as count  
        FROM tbl_troqueles  
        GROUP BY status 
    "); 

    $stats['by_status'] = []; 

    while ($row = $result->fetch_assoc()) { 
        $stats['by_status'][$row['status']] = (int)$row['count']; 
    } 

    // Activos (En prensa + Listo) 
    $stats['activos'] = ($stats['by_status']['En prensa'] ?? 0) + ($stats['by_status']['Listo'] ?? 0); 
    $stats['reparando'] = $stats['by_status']['Reparando'] ?? 0; 
    $stats['pendientes'] = $stats['by_status']['Pendiente'] ?? 0; 

    // Count by year 
    $result = $conn->query(" 
        SELECT year, COUNT(*) as count  
        FROM tbl_troqueles  
        GROUP BY year 
        ORDER BY year DESC 
    "); 

    $stats['by_year'] = []; 

    while ($row = $result->fetch_assoc()) { 
        $stats['by_year'][$row['year']] = (int)$row['count']; 
    } 

    // Count by cliente 
    $result = $conn->query(" 
        SELECT cliente, COUNT(*) as count  
        FROM tbl_troqueles  
        WHERE cliente IS NOT NULL AND cliente != '' 
        GROUP BY cliente  
        ORDER BY count DESC 
    "); 

    $stats['by_cliente'] = []; 
    while ($row = $result->fetch_assoc()) { 
        $stats['by_cliente'][$row['cliente']] = (int)$row['count']; 
    } 

    echo json_encode($stats);      

} catch (Exception $e) { 
    http_response_code(500); 
    echo json_encode(['success' => false, 'message' => $e->getMessage()]); 
} finally { 
    $conn->close(); 
} 

?> 

3. `.htaccess` for Clean URLs 

```apache 

# api/.htaccess 

RewriteEngine On 
RewriteCond %{REQUEST_FILENAME} !-f 
RewriteCond %{REQUEST_FILENAME} !-d 

# Route /api/troqueles and /api/troqueles/* to index.php 
RewriteRule ^troqueles/?$ troqueles/index.php [L,QSA] 
RewriteRule ^troqueles/(.+)$ troqueles/index.php [L,QSA] 

## 4. Update Your React API_BASE 
In your React component, update the API_BASE if needed: 

```javascript 

// For PHP backend 
const API_BASE = 'http://localhost/toolroom/api'; 
// Make sure your endpoints match: 
// GET    /api/troqueles           - Get all 
// GET    /api/troqueles/search    - Search with filters 
// GET    /api/troqueles/{id}      - Get one 
// POST   /api/troqueles           - Create 
// PUT    /api/troqueles/{id}      - Update 
// DELETE /api/troqueles/{id}      - Delete 

5. Folder Structure 

toolroom/ 
├── db_config.php 
├── api/ 
│   ├── .htaccess 
│   ├── login.php 
│   ├── logout.php 
│   └── troqueles/ 
│       ├── index.php 
│       └── stats.php 

This setup gives you: 

- ✅ Full CRUD operations for dies/troqueles 
- ✅ Search and filter by year, status, client 
- ✅ Statistics endpoint for dashboard 
- ✅ Change history logging 
- ✅ Maintenance records table (for future use) 
- ✅ SQL injection protection with prepared statements 
- ✅ CORS headers for React frontend 