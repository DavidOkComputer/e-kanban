
<?php
/** 

 * API para gestión de Máquinas de Inyección - CRUD Completo 

 * Endpoint: /api/maquinas_crud.php 

 *  

 * GET    → Obtener todas o una específica (?id=) 

 * POST   → Crear nueva máquina 

 * PUT    → Actualizar máquina (id_maquina en body) 

 * DELETE → Eliminar máquina (?id=) 

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

$method = $_SERVER["REQUEST_METHOD"];

try {
  switch ($method) {
    case "GET":
      handleGet($conn);

      break;

    case "POST":
      handlePost($conn);

      break;

    case "PUT":
      handlePut($conn);

      break;

    case "DELETE":
      handleDelete($conn);

      break;

    default:
      http_response_code(405);

      echo json_encode([
        "success" => false,
        "message" => "Método no permitido",
      ]);
  }
} catch (Exception $e) {
  http_response_code(500);

  echo json_encode(["success" => false, "message" => $e->getMessage()]);
} finally {
  $conn->close();
}

function handleGet($conn)
{
  $id = isset($_GET["id"]) ? intval($_GET["id"]) : null;

  $estado = $_GET["estado"] ?? null;

  if ($id) {
    $stmt = $conn->prepare(
      "SELECT * FROM tbl_maquinas_inyeccion WHERE id_maquina = ?",
    );

    $stmt->bind_param("i", $id);

    $stmt->execute();

    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
      http_response_code(404);

      echo json_encode([
        "success" => false,
        "message" => "Máquina no encontrada",
      ]);
    } else {
      echo json_encode(["success" => true, "data" => $result->fetch_assoc()]);
    }

    $stmt->close();

    return;
  }

  $sql = "SELECT * FROM tbl_maquinas_inyeccion";

  $params = [];

  $types = "";

  if ($estado) {
    $sql .= " WHERE estado = ?";

    $params[] = $estado;

    $types .= "s";
  }

  $sql .= " ORDER BY identificador_maquina ASC";

  $stmt = $conn->prepare($sql);

  if (!empty($params)) {
    $stmt->bind_param($types, ...$params);
  }

  $stmt->execute();

  $result = $stmt->get_result();

  $maquinas = [];

  while ($row = $result->fetch_assoc()) {
    $maquinas[] = $row;
  }

  echo json_encode($maquinas);

  $stmt->close();
}

function handlePost($conn)
{
  $input = json_decode(file_get_contents("php://input"), true);

  if (empty($input["identificador_maquina"]) || empty($input["nombre"])) {
    http_response_code(400);

    echo json_encode([
      "success" => false,
      "message" => "Identificador y nombre son requeridos",
    ]);

    return;
  }

  $idUpper = strtoupper(trim($input["identificador_maquina"]));

  // Verificar duplicado

  $check = $conn->prepare(
    "SELECT id_maquina FROM tbl_maquinas_inyeccion WHERE identificador_maquina = ?",
  );

  $check->bind_param("s", $idUpper);

  $check->execute();

  if ($check->get_result()->num_rows > 0) {
    http_response_code(409);

    echo json_encode([
      "success" => false,
      "message" => "Ya existe una máquina con ese identificador",
    ]);

    $check->close();

    return;
  }

  $check->close();

  $sql = "INSERT INTO tbl_maquinas_inyeccion ( 

        identificador_maquina, nombre, marca, modelo, numero_serie, 

        descripcion, tonelaje_cierre, capacidad_inyeccion_g, 

        diametro_husillo_mm, distancia_barras_h_mm, distancia_barras_v_mm, 

        carrera_apertura_mm, espesor_molde_min_mm, espesor_molde_max_mm, 

        estado, ubicacion, notas, creado_en, actualizado_en 

    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())";

  $stmt = $conn->prepare($sql);

  $stmt->bind_param(
    "sssssssssssssssss",

    $idUpper,

    trim($input["nombre"]),

    $input["marca"] ?? null,

    $input["modelo"] ?? null,

    $input["numero_serie"] ?? null,

    $input["descripcion"] ?? null,

    $input["tonelaje_cierre"] ?? null,

    $input["capacidad_inyeccion_g"] ?? null,

    $input["diametro_husillo_mm"] ?? null,

    $input["distancia_barras_h_mm"] ?? null,

    $input["distancia_barras_v_mm"] ?? null,

    $input["carrera_apertura_mm"] ?? null,

    $input["espesor_molde_min_mm"] ?? null,

    $input["espesor_molde_max_mm"] ?? null,

    $input["estado"] ?? "activa",

    $input["ubicacion"] ?? null,

    $input["notas"] ?? null,
  );

  if ($stmt->execute()) {
    http_response_code(201);

    echo json_encode([
      "success" => true,

      "message" => "Máquina registrada exitosamente",

      "id_maquina" => $conn->insert_id,

      "identificador_maquina" => $idUpper,
    ]);
  } else {
    http_response_code(500);

    echo json_encode([
      "success" => false,
      "message" => "Error al crear la máquina: " . $stmt->error,
    ]);
  }

  $stmt->close();
}

function handlePut($conn)
{
  $input = json_decode(file_get_contents("php://input"), true);

  $id = $input["id_maquina"] ?? null;

  if (!$id) {
    http_response_code(400);

    echo json_encode([
      "success" => false,
      "message" => "El ID de la máquina es requerido",
    ]);

    return;
  }

  // Verificar que existe

  $check = $conn->prepare(
    "SELECT id_maquina FROM tbl_maquinas_inyeccion WHERE id_maquina = ?",
  );

  $check->bind_param("i", $id);

  $check->execute();

  if ($check->get_result()->num_rows === 0) {
    http_response_code(404);

    echo json_encode([
      "success" => false,
      "message" => "Máquina no encontrada",
    ]);

    $check->close();

    return;
  }

  $check->close();

  $allowedFields = [
    "nombre",
    "marca",
    "modelo",
    "numero_serie",
    "descripcion",

    "tonelaje_cierre",
    "capacidad_inyeccion_g",
    "diametro_husillo_mm",

    "distancia_barras_h_mm",
    "distancia_barras_v_mm",
    "carrera_apertura_mm",

    "espesor_molde_min_mm",
    "espesor_molde_max_mm",
    "estado",
    "ubicacion",
    "notas",
  ];

  $updates = [];

  $params = [];

  $types = "";

  foreach ($allowedFields as $field) {
    if (isset($input[$field])) {
      $updates[] = "$field = ?";

      $params[] = $input[$field];

      $types .= "s";
    }
  }

  if (empty($updates)) {
    http_response_code(400);

    echo json_encode([
      "success" => false,
      "message" => "No hay datos para actualizar",
    ]);

    return;
  }

  $updates[] = "actualizado_en = NOW()";

  $params[] = $id;

  $types .= "i";

  $sql =
    "UPDATE tbl_maquinas_inyeccion SET " .
    implode(", ", $updates) .
    " WHERE id_maquina = ?";

  $stmt = $conn->prepare($sql);

  $stmt->bind_param($types, ...$params);

  if ($stmt->execute()) {
    echo json_encode([
      "success" => true,
      "message" => "Máquina actualizada exitosamente",
    ]);
  } else {
    http_response_code(500);

    echo json_encode(["success" => false, "message" => "Error al actualizar"]);
  }

  $stmt->close();
}

function handleDelete($conn)
{
  $id = isset($_GET["id"]) ? intval($_GET["id"]) : null;

  if (!$id) {
    http_response_code(400);

    echo json_encode([
      "success" => false,
      "message" => "El ID de la máquina es requerido",
    ]);

    return;
  }

  // Verificar que existe

  $check = $conn->prepare(
    "SELECT id_maquina, identificador_maquina FROM tbl_maquinas_inyeccion WHERE id_maquina = ?",
  );

  $check->bind_param("i", $id);

  $check->execute();

  $result = $check->get_result();

  if ($result->num_rows === 0) {
    http_response_code(404);

    echo json_encode([
      "success" => false,
      "message" => "Máquina no encontrada",
    ]);

    $check->close();

    return;
  }

  $maquina = $result->fetch_assoc();

  $check->close();

  $identificador = $maquina["identificador_maquina"];

  // Desasignar moldes

  $countStmt = $conn->prepare(
    "SELECT COUNT(*) as count FROM tbl_moldes WHERE maquina_asignada = ?",
  );

  $countStmt->bind_param("s", $identificador);

  $countStmt->execute();

  $desasignados = $countStmt->get_result()->fetch_assoc()["count"];

  $countStmt->close();

  if ($desasignados > 0) {
    $updateStmt = $conn->prepare(
      "UPDATE tbl_moldes SET maquina_asignada = NULL WHERE maquina_asignada = ?",
    );

    $updateStmt->bind_param("s", $identificador);

    $updateStmt->execute();

    $updateStmt->close();
  }

  $delStmt = $conn->prepare(
    "DELETE FROM tbl_maquinas_inyeccion WHERE id_maquina = ?",
  );

  $delStmt->bind_param("i", $id);

  if ($delStmt->execute()) {
    echo json_encode([
      "success" => true,

      "message" => "Máquina eliminada exitosamente",

      "moldes_desasignados" => $desasignados,
    ]);
  } else {
    http_response_code(500);

    echo json_encode(["success" => false, "message" => "Error al eliminar"]);
  }

  $delStmt->close();
}

