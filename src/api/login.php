<?php
// login.php para iniciar sesion
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
 
//manejo de solicitudes especificas
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}
 
require_once 'db_config.php';
session_start();
 
//permitir solicitudes POST 
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Método no permitido']);
    exit();
}
 
//obtener el input en JSON
$input = json_decode(file_get_contents('php://input'), true);
 
//validar el input
if (!isset($input['username']) || !isset($input['password'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Datos incompletos']);
    exit();
}
 
$username = trim($input['username']);
$password = $input['password'];
 
//validar que no este vacio
if (empty($username) || empty($password)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Usuario y contraseña son requeridos']);
    exit();
}
 
//obtener conexion a base de datos
$conn = getDBConnection();
 
if (!$conn) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error de conexión con la base de datos']);
    exit();
}
 
try {
    //preparar la query SQL antes de insertarla
    $stmt = $conn->prepare("
        SELECT id_usuario, username, password, nombre_completo, rol, activo
        FROM tbl_usuarios
        WHERE username = ?
        LIMIT 1
    ");
    
    $stmt->bind_param("s", $username);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        //si no se encuentra el usuario
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Usuario o contraseña incorrectos']);
        $stmt->close();
        $conn->close();
        exit();
    }
    
    $user = $result->fetch_assoc();
    
    //revisar si el usuario esta activo
    if ($user['activo'] != 1) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Usuario desactivado. Contacte al administrador']);
        $stmt->close();
        $conn->close();
        exit();
    }
    
    //verificar contrasenia
    if (!password_verify($password, $user['password'])) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Usuario o contraseña incorrectos']);
        $stmt->close();
        $conn->close();
        exit();
    }
    
    // Update last access time
    $updateStmt = $conn->prepare("UPDATE tbl_usuarios SET ultimo_acceso = NOW() WHERE id_usuario = ?");
    $updateStmt->bind_param("i", $user['id_usuario']);
    $updateStmt->execute();
    $updateStmt->close();
    
    //crear la sesion
    $_SESSION['user_id'] = $user['id_usuario'];
    $_SESSION['username'] = $user['username'];
    $_SESSION['nombre_completo'] = $user['nombre_completo'];
    $_SESSION['rol'] = $user['rol'];
    $_SESSION['logged_in'] = true;
    $_SESSION['login_time'] = time();
    
    //regenerar el ID de la sesion por seguridad
    session_regenerate_id(true);
    
    //devolver respuesta de exito
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'Login exitoso',
        'user' => [
            'id' => $user['id_usuario'],
            'username' => $user['username'],
            'nombre' => $user['nombre_completo'],
            'role' => $user['rol']
        ]
    ]);
    
    $stmt->close();
    $conn->close();
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error en el servidor']);
    error_log("Login error: " . $e->getMessage());
    
    if (isset($stmt)) $stmt->close();
    if (isset($conn)) $conn->close();
}
?>