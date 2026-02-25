
<?php
/** 

 * API para obtener catálogo de asistencia en máquina 

 * Endpoint: /api/asistencia_maquina.php 

 *  

 * GET → Lista de tipos de asistencia activos 

 */

require_once "cors.php";

require_once "db_config.php";

$conn = getDBConnection();

if (!$conn) {
  http_response_code(500);

  echo json_encode([
    "success" => false,
    "message" => "Database connection failed",
  ]);

  exit();
}

try {
  $result = $conn->query(" 

        SELECT id_asistencia_maquina, descripcion  

        FROM tbl_asistencia_maquina  

        WHERE activo = 1  

        ORDER BY descripcion ASC 

    ");

  $asistencias = [];

  while ($row = $result->fetch_assoc()) {
    $asistencias[] = [
      "id" => (int) $row["id_asistencia_maquina"],

      "description" => $row["descripcion"],
    ];
  }

  echo json_encode($asistencias);
} catch (Exception $e) {
  http_response_code(500);

  echo json_encode(["success" => false, "message" => $e->getMessage()]);
} finally {
  $conn->close();
}

