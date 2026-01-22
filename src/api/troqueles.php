
<?php 
// api troqueles.php para obtener los troqueles de la base de datos
require_once 'cors.php';
require_once 'db_config.php'; 

$method = $_SERVER['REQUEST_METHOD']; 
$uri = $_SERVER['REQUEST_URI']; 

//pasar el uri para obtener el id del troquel si se presenta
$path = parse_url($uri, PHP_URL_PATH); 
$pathParts = explode('/', trim($path, '/')); 

//para encontrar el id del troquel
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

function getAllTroqueles($conn) { 
    $sql = "SELECT * FROM tbl_troqueles ORDER BY creado_en DESC"; 
    $result = $conn->query($sql); 
     
    $troqueles = []; 
    while ($row = $result->fetch_assoc()) { 
        $troqueles[] = $row; 
    } 
    echo json_encode($troqueles); 
} 

function getTroquel($conn, $id) { 
    $stmt = $conn->prepare("SELECT * FROM tbl_troqueles WHERE id_troquel = ?"); 
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
    $year = $_GET['año'] ?? null; 
    $status = $_GET['estado'] ?? null; 
    $search = $_GET['search'] ?? null; 
    $sql = "SELECT * FROM tbl_troqueles WHERE 1=1"; 
    $params = []; 
    $types = ""; 

    if ($year) { 
        $sql .= " AND año = ?"; 
        $params[] = $year; 
        $types .= "i"; 
    } 

    if ($status) { 
        $sql .= " AND estado = ?"; 
        $params[] = $status; 
        $types .= "s"; 
    } 

    if ($search) { 
        $sql .= " AND (id_troquel LIKE ? OR nombre LIKE ? OR modelo LIKE ?)"; 
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

    //validar campos requeridos
    if (empty($input['id_troquel']) || empty($input['nombre']) || empty($input['año'])) { 
        http_response_code(400); 
        echo json_encode(['success' => false, 'message' => 'ID, nombre y año son requeridos']); 
        return; 
    } 
    //revisar si ya existe el id
    $checkStmt = $conn->prepare("SELECT id_troquel FROM tbl_troqueles WHERE id_troquel = ?"); 
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
        id_troquel, nombre, estado, año, modelo, golpes, golpes_acum, capacidad_golpes, 
        rectificaciones, tipo_troquel, ubicacion, prensa_asignada, numero_serie, proveedor, 
        peso_kg, dimensiones, material_base, num_estaciones, cavidades, ciclos, comentarios
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?)"; 

    $stmt = $conn->prepare($sql); 
    $id = strtoupper(trim($input['id_troquel'])); 
    $name = trim($input['name']); 
    $status = $input['status'] ?? 'Pendiente'; 
    $year = (int)$input['año']; 
    $model = $input['modelo'] ?? null; 
    $golpes = $input['golpes'] ?? '-'; 
    $golpes_acum = $input['golpes_acum'] ?? '-'; 
    $capacidad_golpes = $input['capacidad_golpes'] ?? '-'; 
    $rectificaciones = $input['rectificaciones'] ?? '0'; 
    $image_url = $input['image_url'] ?? null; 
    $notes = $input['comentarios'] ?? null; 
    $prensa_asignada = $input['prensa_asignada'] ?? null; 
    $tipo_troquel = $input['tipo_troquel'] ?? 'progresivo'; 
    $ubicacion = $input['ubicacion'] ?? null; 
    $numero_serie = $input['numero_serie'] ?? null; 
    $proveedor = $input['proveedor'] ?? null; 
    $peso_kg = $input['peso_kg'] ?? null; 
    $dimensiones = $input['dimensiones'] ?? null; 
    $material_base = $input['material_base'] ?? null; 
    $num_estaciones = $input['num_estaciones'] ?? null; 

    $stmt->bind_param( 
        "sssissssssssssssssss", //20
        $id, $name, $status, $year, $model, $golpes, $golpes_acum, $capacidad_golpes, 
        $rectificaciones, $image_url, $notes, $prensa_asignada, $tipo_troquel, 
        $ubicacion, $numero_serie, $proveedor, $peso_kg, 
        $dimensiones, $material_base, $num_estaciones
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

    //revisar si existe el troquel
    $checkStmt = $conn->prepare("SELECT * FROM tbl_troqueles WHERE id_troquel = ?"); 
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
        nombre = ?, estado = ?, año = ?, model = ?, golpes = ?, golpes_acum = ?, 
        capacidad_golpes = ?, rectificaciones = ?, image_url = ?, comentarios = ?, 
        prensa_asignada = ?, tipo_troquel = ?, ubicacion = ?, 
        numero_serie = ?, proveedor = ?, peso_kg = ?, dimensiones = ?, material_base = ?, 
        num_estaciones = ?, vida_util_estimada = ? 
        WHERE id_troqueles = ?"; 
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
    $peso_kg = $input['peso_kg'] ?? $existing['peso_kg']; 
    $dimensiones = $input['dimensiones'] ?? $existing['dimensiones']; 
    $material_base = $input['material_base'] ?? $existing['material_base']; 
    $num_estaciones = $input['num_estaciones'] ?? $existing['num_estaciones']; 

    $stmt->bind_param( 
        "ssisssssssssssssssss", 
        $name, $status, $year, $model, $golpes, $golpes_acum, 
        $capacidad_golpes, $rectificaciones, $image_url, $notes, 
        $cliente, $prensa_asignada, $tipo_troquel, $ubicacion, 
        $numero_serie, $proveedor, $peso_kg, $dimensiones, $material_base, 
        $num_estaciones,  $id 
    ); 

    if ($stmt->execute()) { 
        // crear registro del cambio
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

    //revisar si existe el troquel
    $checkStmt = $conn->prepare("SELECT id_troquel, nombre FROM tbl_troqueles WHERE id_troquel = ?"); 
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

    //eliminar tr4oquel
    $stmt = $conn->prepare("DELETE FROM tbl_troqueles WHERE id_troquel = ?"); 
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
        INSERT INTO tbl_troqueles_historial 
        (troquel_id, campo_modificado, valor_anterior, valor_nuevo) 
        VALUES (?, ?, ?, ?) 
    "); 
    $stmt->bind_param("ssss", $troquelId, $campo, $valorAnterior, $valorNuevo); 
    $stmt->execute(); 
    $stmt->close(); 
} 