
<?php 

//prensas.php la API para saber la lista de prensas 
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
    // Intentar obtener prensas de la tabla tbl_prensas si existe 
    $tableCheck = $conn->query("SHOW TABLES LIKE 'tbl_prensas'"); 

    if ($tableCheck->num_rows > 0) { 
        // Tabla existe, obtener datos 
        $sql = "SELECT id_prensa, nombre, descripcion, estado, tonelaje FROM tbl_prensas WHERE estado = 'activa' ORDER BY nombre ASC"; 
        $result = $conn->query($sql); 
        $prensas = []; 
        $prensas[] = ['value' => '', 'label' => 'Sin asignar']; 

        while ($row = $result->fetch_assoc()) { 
            $prensas[] = [ 
                'value' => $row['id_prensa'], 
                'label' => $row['nombre'] . ($row['tonelaje'] ? ' (' . $row['tonelaje'] . ' ton)' : ''), 
                'descripcion' => $row['descripcion'] 
            ]; 
        } 
        echo json_encode($prensas); 

    } else { 
        // Tabla no existe, devolver valores por defecto 
        $defaultPrenses = [ 
            ['value' => '', 'label' => 'Sin asignar'], 
            ['value' => 'P1', 'label' => 'Prensa 1 (P1)'], 
            ['value' => 'P2', 'label' => 'Prensa 2 (P2)'], 
            ['value' => 'P3', 'label' => 'Prensa 3 (P3)'], 
            ['value' => 'P4', 'label' => 'Prensa 4 (P4)'], 
            ['value' => 'P5', 'label' => 'Prensa 5 (P5)'], 
            ['value' => 'P6', 'label' => 'Prensa 6 (P6)'], 
            ['value' => 'P7', 'label' => 'Prensa 7 (P7)'], 
            ['value' => 'P8', 'label' => 'Prensa 8 (P8)'], 
        ]; 
        echo json_encode($defaultPrenses); 
    } 

} catch (Exception $e) { 
    http_response_code(500); 
    echo json_encode(['success' => false, 'message' => 'Error del servidor: ' . $e->getMessage()]); 
} finally { 
    $conn->close(); 
} 