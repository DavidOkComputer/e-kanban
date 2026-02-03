<?php

/*API para obtener prensas para dropdown */

// Headers CORS
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

// Manejar preflight requests
if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit();
}

// Solo permitir GET
if ($_SERVER["REQUEST_METHOD"] !== "GET") {
    http_response_code(405);
    echo json_encode([
        "success" => false,
        "message" => "Método no permitido",
    ]);
    exit();
}

// Configuración de la base de datos
$host = "localhost";
$dbname = "ekanban_toolroom_db";
$username = "root";
$password = "";

try {
    $pdo = new PDO(
        "mysql:host=$host;dbname=$dbname;charset=utf8mb4",
        $username,
        $password,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ],
    );

    // Obtener parámetro para filtrar solo activas
    $onlyActive = isset($_GET["active"]) && $_GET["active"] === "true";

    // Query para obtener prensas
    $sql = "SELECT identificador_prensa, nombre, estado FROM tbl_prensas";
    if ($onlyActive) {
        $sql .= " WHERE estado = 'Activa'";
    }

    $sql .= " ORDER BY identificador_prensa ASC";
    $stmt = $pdo->query($sql);
    $prensas = $stmt->fetchAll();

    // Formatear para dropdown
    $options = [["value" => "", "label" => "Sin asignar"]];
    foreach ($prensas as $prensa) {
        $label = $prensa["identificador_prensa"];
        if (!empty($prensa["nombre"])) {
            $label .= " - " . $prensa["nombre"];
        }

        if ($prensa["estado"] !== "Activa") {
            $label .= " (" . $prensa["estado"] . ")";
        }

        $options[] = [
            "value" => $prensa["identificador_prensa"],
            "label" => $label,
        ];
    }
    echo json_encode($options);
} catch (PDOException $e) {

    // En caso de error, retornar opciones por defecto
    http_response_code(200); // Retornar 200 para no romper el frontend
    echo json_encode([
        ["value" => "", "label" => "Sin asignar"],
        ["value" => "P1", "label" => "Prensa 1 (P1)"],
        ["value" => "P2", "label" => "Prensa 2 (P2)"],
        ["value" => "P3", "label" => "Prensa 3 (P3)"],
        ["value" => "P4", "label" => "Prensa 4 (P4)"],
        ["value" => "P5", "label" => "Prensa 5 (P5)"],
        ["value" => "P6", "label" => "Prensa 6 (P6)"],
        ["value" => "P7", "label" => "Prensa 7 (P7)"],
        ["value" => "P8", "label" => "Prensa 8 (P8)"],
    ]);
}
?> 
