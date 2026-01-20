<?php
// check_session.php para revisar que los usuarios hayan iniciado sesion
 
require_once 'cors.php';
require_once 'db_config.php';
 
//manejo de solicitudes especificas preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}
 
header('Content-Type: application/json');
 
session_start();
 
if (isset($_SESSION['logged_in']) && $_SESSION['logged_in'] === true) {
    echo json_encode([
        'authenticated' => true,
        'user' => [
            'id' => $_SESSION['user_id'],
            'username' => $_SESSION['username'],
            'nombre' => $_SESSION['nombre_completo'],
            'role' => $_SESSION['rol']
        ]
    ]);
} else {
    http_response_code(401);
    echo json_encode(['authenticated' => false]);
}