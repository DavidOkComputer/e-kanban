
<?php
/** 

 * API para gestión de Modelos por Molde - CRUD Completo 

 * Endpoint: /api/modelos_molde.php 

 *  

 * GET    → Listar modelos (opcional ?molde_id= para filtrar) 

 * POST   → Crear nuevo modelo 

 * PUT    → Actualizar modelo (id_modelo en body o URL) 

 * DELETE → Eliminar modelo (?id= o URL) 

 */

require_once "cors.php";

require_once "db_config.php";

$method = $_SERVER["REQUEST_METHOD"];

$uri = $_SERVER["REQUEST_URI"];

// Parsear ID del URL

$path = parse_url($uri, PHP_URL_PATH);

$pathParts = explode("/", trim($path, "/"));

$modeloId = null;

foreach ($pathParts as $index => $part) {
  if (
    ($part === "modelos_molde" || $part === "modelos_molde.php") &&
    isset($pathParts[$index + 1])
  ) {
    $modeloId = intval($pathParts[$index + 1]);

    break;
  }
}

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
  switch ($method) {
    case "GET":
      handleGet($conn, $modeloId);

      break;

    case "POST":
      handlePost($conn);

      break;

    case "PUT":
      handlePut($conn, $modeloId);

      break;

    case "DELETE":
      $deleteId =
        $modeloId ?: (isset($_GET["id"]) ? intval($_GET["id"]) : null);

      handleDelete($conn, $deleteId);

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

function handleGet($conn, $id)
{
  if ($id) {
    $stmt = $conn->prepare(" 

            SELECT m.*, mo.nombre AS molde_nombre  

            FROM tbl_modelos_molde m  

            LEFT JOIN tbl_moldes mo ON m.molde_id = mo.id_molde  

            WHERE m.id_modelo = ? 

        ");

    $stmt->bind_param("i", $id);

    $stmt->execute();

    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
      http_response_code(404);

      echo json_encode([
        "success" => false,
        "message" => "Modelo no encontrado",
      ]);
    } else {
      echo json_encode($result->fetch_assoc());
    }

    $stmt->close();

    return;
  }

  $moldeId = $_GET["molde_id"] ?? null;

  $sql = " 

        SELECT m.id_modelo, m.nombre_modelo, m.molde_id, m.descripcion,  

               m.creado_en, m.actualizado_en, mo.nombre AS molde_nombre 

        FROM tbl_modelos_molde m 

        LEFT JOIN tbl_moldes mo ON m.molde_id = mo.id_molde 

    ";

  $params = [];

  $types = "";

  if ($moldeId) {
    $sql .= " WHERE m.molde_id = ?";

    $params[] = $moldeId;

    $types .= "s";
  }

  $sql .= " ORDER BY m.nombre_modelo ASC";

  $stmt = $conn->prepare($sql);

  if (!empty($params)) {
    $stmt->bind_param($types, ...$params);
  }

  $stmt->execute();

  $result = $stmt->get_result();

  $modelos = [];

  while ($row = $result->fetch_assoc()) {
    $modelos[] = $row;
  }

  echo json_encode($modelos);

  $stmt->close();
}

function handlePost($conn)
{
  $input = json_decode(file_get_contents("php://input"), true);

  if (empty($input["nombre_modelo"])) {
    http_response_code(400);

    echo json_encode([
      "success" => false,
      "message" => "El nombre del modelo es requerido",
    ]);

    return;
  }

  if (empty($input["molde_id"])) {
    http_response_code(400);

    echo json_encode([
      "success" => false,
      "message" => "El molde es requerido",
    ]);

    return;
  }

  // Verificar que el molde existe

  $checkMolde = $conn->prepare(
    "SELECT id_molde FROM tbl_moldes WHERE id_molde = ?",
  );

  $checkMolde->bind_param("s", $input["molde_id"]);

  $checkMolde->execute();

  if ($checkMolde->get_result()->num_rows === 0) {
    http_response_code(400);

    echo json_encode([
      "success" => false,
      "message" => "El molde especificado no existe",
    ]);

    $checkMolde->close();

    return;
  }

  $checkMolde->close();

  // Verificar duplicado

  $dupCheck = $conn->prepare(
    "SELECT id_modelo FROM tbl_modelos_molde WHERE nombre_modelo = ? AND molde_id = ?",
  );

  $dupCheck->bind_param("ss", $input["nombre_modelo"], $input["molde_id"]);

  $dupCheck->execute();

  if ($dupCheck->get_result()->num_rows > 0) {
    http_response_code(400);

    echo json_encode([
      "success" => false,
      "message" => "Ya existe un modelo con ese nombre para este molde",
    ]);

    $dupCheck->close();

    return;
  }

  $dupCheck->close();

  $stmt = $conn->prepare(
    "INSERT INTO tbl_modelos_molde (nombre_modelo, molde_id, descripcion) VALUES (?, ?, ?)",
  );

  $descripcion = $input["descripcion"] ?? null;

  $stmt->bind_param(
    "sss",
    $input["nombre_modelo"],
    $input["molde_id"],
    $descripcion,
  );

  if ($stmt->execute()) {
    http_response_code(201);

    echo json_encode([
      "success" => true,

      "message" => "Modelo creado exitosamente",

      "id_modelo" => $conn->insert_id,
    ]);
  } else {
    http_response_code(500);

    echo json_encode([
      "success" => false,
      "message" => "Error al crear modelo: " . $stmt->error,
    ]);
  }

  $stmt->close();
}

function handlePut($conn, $urlId)
{
  $input = json_decode(file_get_contents("php://input"), true);

  $id = $urlId ?: $input["id_modelo"] ?? null;

  if (!$id) {
    http_response_code(400);

    echo json_encode([
      "success" => false,
      "message" => "El ID del modelo es requerido",
    ]);

    return;
  }

  if (empty($input["nombre_modelo"])) {
    http_response_code(400);

    echo json_encode([
      "success" => false,
      "message" => "El nombre del modelo es requerido",
    ]);

    return;
  }

  if (empty($input["molde_id"])) {
    http_response_code(400);

    echo json_encode([
      "success" => false,
      "message" => "El molde es requerido",
    ]);

    return;
  }

  // Verificar que existe

  $check = $conn->prepare(
    "SELECT id_modelo FROM tbl_modelos_molde WHERE id_modelo = ?",
  );

  $check->bind_param("i", $id);

  $check->execute();

  if ($check->get_result()->num_rows === 0) {
    http_response_code(404);

    echo json_encode(["success" => false, "message" => "Modelo no encontrado"]);

    $check->close();

    return;
  }

  $check->close();

  // Verificar duplicado (excluyendo el actual)

  $dupCheck = $conn->prepare(
    "SELECT id_modelo FROM tbl_modelos_molde WHERE nombre_modelo = ? AND molde_id = ? AND id_modelo != ?",
  );

  $dupCheck->bind_param(
    "ssi",
    $input["nombre_modelo"],
    $input["molde_id"],
    $id,
  );

  $dupCheck->execute();

  if ($dupCheck->get_result()->num_rows > 0) {
    http_response_code(400);

    echo json_encode([
      "success" => false,
      "message" => "Ya existe otro modelo con ese nombre para este molde",
    ]);

    $dupCheck->close();

    return;
  }

  $dupCheck->close();

  $descripcion = $input["descripcion"] ?? null;

  $stmt = $conn->prepare(
    "UPDATE tbl_modelos_molde SET nombre_modelo = ?, molde_id = ?, descripcion = ?, actualizado_en = NOW() WHERE id_modelo = ?",
  );

  $stmt->bind_param(
    "sssi",
    $input["nombre_modelo"],
    $input["molde_id"],
    $descripcion,
    $id,
  );

  if ($stmt->execute()) {
    echo json_encode([
      "success" => true,
      "message" => "Modelo actualizado exitosamente",
    ]);
  } else {
    http_response_code(500);

    echo json_encode([
      "success" => false,
      "message" => "Error al actualizar modelo",
    ]);
  }

  $stmt->close();
}

function handleDelete($conn, $id)
{
  if (!$id) {
    http_response_code(400);

    echo json_encode([
      "success" => false,
      "message" => "El ID del modelo es requerido",
    ]);

    return;
  }

  $check = $conn->prepare(
    "SELECT id_modelo FROM tbl_modelos_molde WHERE id_modelo = ?",
  );

  $check->bind_param("i", $id);

  $check->execute();

  if ($check->get_result()->num_rows === 0) {
    http_response_code(404);

    echo json_encode(["success" => false, "message" => "Modelo no encontrado"]);

    $check->close();

    return;
  }

  $check->close();

  $stmt = $conn->prepare("DELETE FROM tbl_modelos_molde WHERE id_modelo = ?");

  $stmt->bind_param("i", $id);

  if ($stmt->execute()) {
    echo json_encode([
      "success" => true,
      "message" => "Modelo eliminado exitosamente",
    ]);
  } else {
    http_response_code(500);

    echo json_encode([
      "success" => false,
      "message" => "Error al eliminar modelo",
    ]);
  }

  $stmt->close();
}

