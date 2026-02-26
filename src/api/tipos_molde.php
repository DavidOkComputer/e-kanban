
<?php
/*API para obtener tipos de molde en los dropdown */

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

        SELECT id_tipo_molde, codigo, nombre, descripcion  

        FROM tbl_tipos_molde  

        WHERE activo = 1  

        ORDER BY nombre ASC 

    ");

  if ($result && $result->num_rows > 0) {
    $options = [];

    while ($row = $result->fetch_assoc()) {
      $options[] = [
        "value" => $row["codigo"] ?: $row["id_tipo_molde"],

        "label" => $row["nombre"],

        "descripcion" => $row["descripcion"],
      ];
    }

    echo json_encode($options);
  } else {
    // Valores por defecto si la tabla está vacía

    echo json_encode([
      ["value" => "dos_placas", "label" => "Dos Placas"],

      ["value" => "tres_placas", "label" => "Tres Placas"],

      ["value" => "colada_caliente", "label" => "Colada Caliente (Hot Runner)"],

      ["value" => "stack", "label" => "Stack (Apilado)"],

      ["value" => "insertos", "label" => "De Insertos"],

      ["value" => "desatornillado", "label" => "Desatornillado"],

      ["value" => "bi_inyeccion", "label" => "Bi-Inyección"],

      ["value" => "compresion", "label" => "Compresión"],
    ]);
  }
} catch (Exception $e) {
  http_response_code(500);

  echo json_encode(["success" => false, "message" => $e->getMessage()]);
} finally {
  $conn->close();
}

