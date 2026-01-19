<?php
//check_session.php para revisar que los usuarios hayan iniciado sesion
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Credentials: true');
 
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
?>