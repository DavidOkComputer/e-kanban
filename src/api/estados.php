<?php 

//estados.php la API para saber estados de troquel 

require_once 'cors.php'; 
require_once 'db_config.php'; 

$method = $_SERVER['REQUEST_METHOD']; 

if ($method !== 'GET') { 
    http_response_code(405); 
    echo json_encode(['success' => false, 'message' => 'Método no permitido']); 
    exit(); 
} 

$conn = getDBConnection(); 

if (!$conn) { 
    http_response_code(500); 
    echo json_encode(['success' => false, 'message' => 'Database connection failed']); 
    exit(); 
} 

try { 
    // Intentar obtener estados de la tabla tbl_estados si existe 
    $tableCheck = $conn->query("SHOW TABLES LIKE 'tbl_estados'"); 

    if ($tableCheck->num_rows > 0) { 
        // Tabla existe, obtener datos 
        $sql = "SELECT id_estado, codigo, nombre, color, descripcion FROM tbl_estados WHERE activo = 1 ORDER BY orden ASC, nombre ASC"; 
        $result = $conn->query($sql); 
        $estados = []; 

        while ($row = $result->fetch_assoc()) { 
            $estados[] = [ 
                'value' => $row['codigo'] ?? $row['nombre'], 
                'label' => $row['nombre'], 
                'color' => $row['color'], 
                'descripcion' => $row['descripcion'] 
            ]; 
        } 
        echo json_encode($estados); 

    } else { 
        // Tabla no existe, devolver valores por defecto 
        $defaultEstados = [ 
            ['value' => 'Pendiente', 'label' => 'Pendiente', 'color' => '#ff6b6b'], 
            ['value' => 'En prensa', 'label' => 'En Prensa', 'color' => '#00ff88'], 
            ['value' => 'Listo', 'label' => 'Listo', 'color' => '#64ff64'], 
            ['value' => 'Listo-BackUp', 'label' => 'Listo - BackUp', 'color' => '#00c8ff'], 
            ['value' => 'Reparando', 'label' => 'Reparando', 'color' => '#ffc800'], 
            ['value' => 'Baja', 'label' => 'Baja / Obsoleto', 'color' => '#888888'], 
        ]; 
        echo json_encode($defaultEstados); 
    } 
} catch (Exception $e) { 
    http_response_code(500); 
    echo json_encode(['success' => false, 'message' => 'Error del servidor: ' . $e->getMessage()]); 
} finally { 
    $conn->close(); 
} 