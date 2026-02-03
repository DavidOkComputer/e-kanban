<?php
require_once 'cors.php';
 
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}
 
header('Content-Type: application/json');
 
require_once 'db_config.php';
session_start();
 
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Método no permitido']);
    exit();
}
 
$input = json_decode(file_get_contents('php://input'), true);
 
if (!isset($input['username']) || !isset($input['password'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Datos incompletos']);
    exit();
}
 
$username = trim($input['username']);
$password = $input['password'];
 
if (empty($username) || empty($password)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Usuario y contraseña son requeridos']);
    exit();
}

$conn = getDBConnection();
if (!$conn) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error de conexión con la base de datos']);
    exit();
}

try {
    $stmt = $conn->prepare("
        SELECT id_usuario, nombre_usuario, acceso, nombre_completo, rol, activo
        FROM tbl_usuarios
        WHERE nombre_usuario = ?
        LIMIT 1
    ");
    $stmt->bind_param("s", $username);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Usuario o contraseña incorrectos']);
        $stmt->close();
        $conn->close();
        exit();
    }

    $user = $result->fetch_assoc();

    if ($user['activo'] != 1) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Usuario desactivado']);
        $stmt->close();
        $conn->close();
        exit();
    }

    if (!password_verify($password, $user['acceso'])) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Usuario o contraseña incorrectos']);
        $stmt->close();
        $conn->close();
        exit();
    }

    //actualizar el momento del ultimo acceso
    $updateStmt = $conn->prepare("UPDATE tbl_usuarios SET ultimo_acceso = NOW() WHERE id_usuario = ?");
    $updateStmt->bind_param("i", $user['id_usuario']);
    $updateStmt->execute();
    $updateStmt->close();
    
    //crear sesion
    $_SESSION['user_id'] = $user['id_usuario'];
    $_SESSION['username'] = $user['nombre_usuario'];  
    $_SESSION['nombre_completo'] = $user['nombre_completo'];
    $_SESSION['rol'] = $user['rol'];
    $_SESSION['logged_in'] = true;
    $_SESSION['login_time'] = time();
    session_regenerate_id(true);
    
    $stmt->close();
    $conn->close();

    //enviar respuesta de acceso exitoso
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'Login exitoso',
        'user' => [
            'id' => $user['id_usuario'],
            'username' => $user['nombre_usuario'],
            'nombre' => $user['nombre_completo'],
            'role' => $user['rol']
        ]
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error en el servidor: ' . $e->getMessage()]);
    if (isset($stmt)) $stmt->close();
    if (isset($conn)) $conn->close();
}