<?php
/*API para obtener máquinas de inyección activas (dropdown) */

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

        SELECT id_maquina, identificador_maquina, nombre, modelo, tonelaje_cierre, estado  

        FROM tbl_maquinas_inyeccion  

        WHERE estado = 'activa'  

        ORDER BY identificador_maquina ASC 

    ");

  $options = [["value" => "", "label" => "Sin asignar"]];

  while ($row = $result->fetch_assoc()) {
    $label = $row["identificador_maquina"] ?: $row["nombre"];

    if ($row["tonelaje_cierre"]) {
      $label .= " ({$row["tonelaje_cierre"]} ton)";
    }

    $options[] = [
      "value" =>
        $row["identificador_maquina"] ?: $row["nombre"] ?: $row["id_maquina"],

      "label" => $label,

      "modelo" => $row["modelo"],
    ];
  }

  echo json_encode($options);
} catch (Exception $e) {
  http_response_code(500);

  echo json_encode(["success" => false, "message" => $e->getMessage()]);
} finally {
  $conn->close();
}
