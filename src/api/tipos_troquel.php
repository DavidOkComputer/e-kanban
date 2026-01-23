
<?php 

//tipos_troquel.php la API para obtener tipos de troquel 
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
    // Intentar obtener tipos de la tabla tbl_tipos_troquel si existe 
    $tableCheck = $conn->query("SHOW TABLES LIKE 'tbl_tipos_troquel'"); 

    if ($tableCheck->num_rows > 0) { 
        // Tabla existe, obtener datos 
        $sql = "SELECT id_tipo_troquel, codigo, nombre, descripcion FROM tbl_tipos_troquel WHERE activo = 1 ORDER BY nombre ASC"; 
        $result = $conn->query($sql); 
        $tipos = []; 

        while ($row = $result->fetch_assoc()) { 
            $tipos[] = [ 
                'value' => $row['codigo'] ?? $row['id'], 
                'label' => $row['nombre'], 
                'descripcion' => $row['descripcion'] 
            ]; 
        } 
        echo json_encode($tipos); 

    } else { 
        // Tabla no existe, devolver valores por defecto 
        $defaultTipos = [ 
            ['value' => 'progresivo', 'label' => 'Progresivo', 'descripcion' => 'Troquel de estaciones progresivas'], 
            ['value' => 'transfer', 'label' => 'Transfer', 'descripcion' => 'Troquel tipo transfer'], 
            ['value' => 'compound', 'label' => 'Compound', 'descripcion' => 'Troquel compuesto'], 
            ['value' => 'simple', 'label' => 'Simple', 'descripcion' => 'Troquel de operación simple'], 
        ]; 
        echo json_encode($defaultTipos); 
    } 
} catch (Exception $e) { 
    http_response_code(500); 
    echo json_encode(['success' => false, 'message' => 'Error del servidor: ' . $e->getMessage()]); 
} finally { 
    $conn->close(); 
} 