
<?php
/** 

 * API para obtener catálogo de fallas de molde 

 * Endpoint: /api/fallas_molde.php 

 *  

 * GET → Lista de fallas activas 

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

        SELECT id_falla_molde, descripcion  

        FROM tbl_fallas_catalogo_molde  

        WHERE activo = 1  

        ORDER BY descripcion ASC 

    ");

  $fallas = [];

  while ($row = $result->fetch_assoc()) {
    $fallas[] = [
      "id" => (int) $row["id_falla_molde"],

      "description" => $row["descripcion"],
    ];
  }

  echo json_encode($fallas);
} catch (Exception $e) {
  http_response_code(500);

  echo json_encode(["success" => false, "message" => $e->getMessage()]);
} finally {
  $conn->close();
}

