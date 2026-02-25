<?php

/* API para gestión de Moldes por Inyección */

require_once "cors.php";

require_once "db_config.php";

$method = $_SERVER["REQUEST_METHOD"];

$uri = $_SERVER["REQUEST_URI"];

// Parsear URI para obtener el ID del molde

$path = parse_url($uri, PHP_URL_PATH);

$pathParts = explode("/", trim($path, "/"));

$moldeId = null;

$isSearch = false;

$subAction = null;

foreach ($pathParts as $index => $part) {
  if (
    ($part === "moldes" || $part === "moldes.php") &&
    isset($pathParts[$index + 1])
  ) {
    $nextPart = $pathParts[$index + 1];

    if ($nextPart === "search") {
      $isSearch = true;
    } elseif ($nextPart === "list") {
      $subAction = "list";
    } else {
      $moldeId = urldecode($nextPart);
    }

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
      if ($isSearch) {
        handleSearch($conn);
      } elseif ($subAction === "list") {
        getAllMoldesList($conn);
      } elseif ($moldeId) {
        getMolde($conn, $moldeId);
      } else {
        getAllMoldes($conn);
      }

      break;

    case "POST":
      createMolde($conn);

      break;

    case "PUT":
      if ($moldeId) {
        updateMolde($conn, $moldeId);
      } else {
        http_response_code(400);

        echo json_encode([
          "success" => false,
          "message" => "ID de molde requerido",
        ]);
      }

      break;

    case "PATCH":
      if ($moldeId) {
        patchMolde($conn, $moldeId);
      } else {
        http_response_code(400);

        echo json_encode([
          "success" => false,
          "message" => "ID de molde requerido",
        ]);
      }

      break;

    case "DELETE":
      if ($moldeId) {
        deleteMolde($conn, $moldeId);
      } else {
        http_response_code(400);

        echo json_encode([
          "success" => false,
          "message" => "ID de molde requerido",
        ]);
      }

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

  echo json_encode([
    "success" => false,
    "message" => "Error del servidor: " . $e->getMessage(),
  ]);
} finally {
  $conn->close();
}

// ============================================================================

// FUNCIONES

// ============================================================================

/** 

 * GET - Todos los moldes agrupados por año (para EKanban dashboard) 

 */

function getAllMoldes($conn)
{
  $sql = " 

        SELECT m.*, cr.prioridad AS prioridad_reparacion 

        FROM tbl_moldes m 

        LEFT JOIN tbl_ciclos_reparacion_molde cr 

            ON cr.molde_id = m.id_molde AND cr.ciclo_activo = TRUE 

        ORDER BY m.año DESC, m.id_molde 

    ";

  $result = $conn->query($sql);

  $groupedByYear = [];

  while ($row = $result->fetch_assoc()) {
    $year = $row["año"];

    if (!isset($groupedByYear[$year])) {
      $groupedByYear[$year] = [];
    }

    $groupedByYear[$year][] = [
      "id" => $row["id_molde"],

      "name" => $row["nombre"],

      "status" => $row["estado"],

      "model" => $row["modelo"],

      "ciclos_inyeccion" => $row["ciclos_inyeccion"],

      "ciclos_acumulados" => $row["ciclos_acumulados"],

      "capacidad_ciclos" => $row["capacidad_ciclos"],

      "mantenimientos_preventivos" => $row["mantenimientos_preventivos"],

      "tipo_molde" => $row["tipo_molde"],

      "ubicacion" => $row["ubicacion"],

      "maquina_asignada" => $row["maquina_asignada"],

      "imageUrl" => $row["image_url"],

      "numero_serie" => $row["numero_serie"],

      "proveedor" => $row["proveedor"],

      "peso_kg" => $row["peso_kg"],

      "dimensiones" => $row["dimensiones"],

      "material_base" => $row["material_base"],

      "num_cavidades" => $row["num_cavidades"],

      "material_inyeccion" => $row["material_inyeccion"],

      "peso_pieza_g" => $row["peso_pieza_g"],

      "peso_colada_g" => $row["peso_colada_g"],

      "tiempo_ciclo_seg" => $row["tiempo_ciclo_seg"],

      "temperatura_molde_c" => $row["temperatura_molde_c"],

      "presion_inyeccion_bar" => $row["presion_inyeccion_bar"],

      "tonelaje_requerido" => $row["tonelaje_requerido"],

      "tipo_colada" => $row["tipo_colada"],

      "num_puntos_inyeccion" => $row["num_puntos_inyeccion"],

      "marca_colada_caliente" => $row["marca_colada_caliente"],

      "circuitos_enfriamiento" => $row["circuitos_enfriamiento"],

      "tipo_enfriamiento" => $row["tipo_enfriamiento"],

      "tipo_expulsion" => $row["tipo_expulsion"],

      "carrera_expulsion_mm" => $row["carrera_expulsion_mm"],

      "color" => $row["color"],

      "n_parte_1" => $row["n_parte_1"],

      "n_parte_2" => $row["n_parte_2"],

      "n_parte_3" => $row["n_parte_3"],

      "n_parte_4" => $row["n_parte_4"],

      "n_parte_5" => $row["n_parte_5"],

      "n_parte_6" => $row["n_parte_6"],

      "comentarios" => $row["comentarios"],

      "prioridad_reparacion" => $row["prioridad_reparacion"] ?? null,
    ];
  }

  echo json_encode($groupedByYear);
}

/** 

 * GET - Lista plana de todos los moldes (para admin panel) 

 */

function getAllMoldesList($conn)
{
  $result = $conn->query("SELECT * FROM tbl_moldes ORDER BY creado_en DESC");

  $moldes = [];

  while ($row = $result->fetch_assoc()) {
    $moldes[] = $row;
  }

  echo json_encode($moldes);
}

/** 

 * GET - Molde específico por ID 

 */

function getMolde($conn, $id)
{
  $stmt = $conn->prepare("SELECT * FROM tbl_moldes WHERE id_molde = ?");

  $stmt->bind_param("s", $id);

  $stmt->execute();

  $result = $stmt->get_result();

  if ($result->num_rows === 0) {
    http_response_code(404);

    echo json_encode(["success" => false, "message" => "Molde no encontrado"]);

    return;
  }

  echo json_encode($result->fetch_assoc());

  $stmt->close();
}

/** 

 * GET - Búsqueda con filtros 

 */

function handleSearch($conn)
{
  $year = $_GET["year"] ?? ($_GET["año"] ?? null);

  $status = $_GET["status"] ?? ($_GET["estado"] ?? null);

  $search = $_GET["search"] ?? null;

  $sql = "SELECT * FROM tbl_moldes WHERE 1=1";

  $params = [];

  $types = "";

  if ($year) {
    $sql .= " AND año = ?";

    $params[] = $year;

    $types .= "i";
  }

  if ($status) {
    $sql .= " AND estado = ?";

    $params[] = $status;

    $types .= "s";
  }

  if ($search) {
    $sql .=
      " AND (id_molde LIKE ? OR nombre LIKE ? OR modelo LIKE ? OR material_inyeccion LIKE ?)";

    $searchTerm = "%$search%";

    $params[] = $searchTerm;

    $params[] = $searchTerm;

    $params[] = $searchTerm;

    $params[] = $searchTerm;

    $types .= "ssss";
  }

  $sql .= " ORDER BY creado_en DESC";

  $stmt = $conn->prepare($sql);

  if (!empty($params)) {
    $stmt->bind_param($types, ...$params);
  }

  $stmt->execute();

  $result = $stmt->get_result();

  $moldes = [];

  while ($row = $result->fetch_assoc()) {
    $moldes[] = $row;
  }

  echo json_encode($moldes);

  $stmt->close();
}

/** 

 * POST - Crear nuevo molde 

 */

function createMolde($conn)
{
  $input = json_decode(file_get_contents("php://input"), true);

  if (
    empty($input["id_molde"]) ||
    empty($input["nombre"]) ||
    empty($input["año"])
  ) {
    http_response_code(400);

    echo json_encode([
      "success" => false,
      "message" => "ID, nombre y año son requeridos",
    ]);

    return;
  }

  $id = strtoupper(trim($input["id_molde"]));

  // Verificar duplicado

  $checkStmt = $conn->prepare(
    "SELECT id_molde FROM tbl_moldes WHERE id_molde = ?",
  );

  $checkStmt->bind_param("s", $id);

  $checkStmt->execute();

  if ($checkStmt->get_result()->num_rows > 0) {
    http_response_code(409);

    echo json_encode([
      "success" => false,
      "message" => "Ya existe un molde con ese ID",
    ]);

    $checkStmt->close();

    return;
  }

  $checkStmt->close();

  $sql = "INSERT INTO tbl_moldes ( 

        id_molde, nombre, estado, año, modelo, 

        ciclos_inyeccion, ciclos_acumulados, capacidad_ciclos, mantenimientos_preventivos, 

        tipo_molde, ubicacion, maquina_asignada, numero_serie, 

        proveedor, peso_kg, dimensiones, material_base, 

        num_cavidades, material_inyeccion, peso_pieza_g, peso_colada_g, 

        tiempo_ciclo_seg, temperatura_molde_c, presion_inyeccion_bar, 

        tonelaje_requerido, tipo_colada, num_puntos_inyeccion, 

        marca_colada_caliente, circuitos_enfriamiento, 

        tipo_enfriamiento, tipo_expulsion, carrera_expulsion_mm, color, 

        n_parte_1, n_parte_2, n_parte_3, n_parte_4, n_parte_5, n_parte_6, 

        comentarios, image_url 

    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

  $stmt = $conn->prepare($sql);

  $stmt->bind_param(
    "sssisssssssssssssssssssssssssssssssssssss" . "s",

    $id,

    $input["nombre"],

    $input["estado"] ?? "Pendiente",

    $input["año"],

    $input["modelo"] ?? null,

    $input["ciclos_inyeccion"] ?? "-",

    $input["ciclos_acumulados"] ?? "-",

    $input["capacidad_ciclos"] ?? "-",

    $input["mantenimientos_preventivos"] ?? "0",

    $input["tipo_molde"] ?? "Null",

    $input["ubicacion"] ?? null,

    $input["maquina_asignada"] ?? null,

    $input["numero_serie"] ?? null,

    $input["proveedor"] ?? null,

    $input["peso_kg"] ?? null,

    $input["dimensiones"] ?? null,

    $input["material_base"] ?? null,

    $input["num_cavidades"] ?? null,

    $input["material_inyeccion"] ?? null,

    $input["peso_pieza_g"] ?? null,

    $input["peso_colada_g"] ?? null,

    $input["tiempo_ciclo_seg"] ?? null,

    $input["temperatura_molde_c"] ?? null,

    $input["presion_inyeccion_bar"] ?? null,

    $input["tonelaje_requerido"] ?? null,

    $input["tipo_colada"] ?? "Null",

    $input["num_puntos_inyeccion"] ?? null,

    $input["marca_colada_caliente"] ?? null,

    $input["circuitos_enfriamiento"] ?? null,

    $input["tipo_enfriamiento"] ?? "Null",

    $input["tipo_expulsion"] ?? "Null",

    $input["carrera_expulsion_mm"] ?? null,

    $input["color"] ?? null,

    $input["n_parte_1"] ?? null,

    $input["n_parte_2"] ?? null,

    $input["n_parte_3"] ?? null,

    $input["n_parte_4"] ?? null,

    $input["n_parte_5"] ?? null,

    $input["n_parte_6"] ?? null,

    $input["comentarios"] ?? null,

    $input["image_url"] ?? null,
  );

  if ($stmt->execute()) {
    http_response_code(201);

    echo json_encode([
      "success" => true,
      "message" => "Molde registrado exitosamente",
      "id" => $id,
    ]);
  } else {
    http_response_code(500);

    echo json_encode([
      "success" => false,
      "message" => "Error al crear el molde: " . $stmt->error,
    ]);
  }

  $stmt->close();
}

/** 

 * PUT - Actualizar molde completo 

 */

function updateMolde($conn, $id)
{
  $input = json_decode(file_get_contents("php://input"), true);

  // Verificar que existe

  $checkStmt = $conn->prepare("SELECT * FROM tbl_moldes WHERE id_molde = ?");

  $checkStmt->bind_param("s", $id);

  $checkStmt->execute();

  $existing = $checkStmt->get_result();

  if ($existing->num_rows === 0) {
    http_response_code(404);

    echo json_encode(["success" => false, "message" => "Molde no encontrado"]);

    $checkStmt->close();

    return;
  }

  $current = $existing->fetch_assoc();

  $checkStmt->close();

  $sql = "UPDATE tbl_moldes SET 

        nombre = ?, estado = ?, año = ?, modelo = ?, 

        ciclos_inyeccion = ?, ciclos_acumulados = ?, capacidad_ciclos = ?, mantenimientos_preventivos = ?, 

        tipo_molde = ?, ubicacion = ?, maquina_asignada = ?, numero_serie = ?, 

        proveedor = ?, peso_kg = ?, dimensiones = ?, material_base = ?, 

        num_cavidades = ?, material_inyeccion = ?, peso_pieza_g = ?, peso_colada_g = ?, 

        tiempo_ciclo_seg = ?, temperatura_molde_c = ?, presion_inyeccion_bar = ?, 

        tonelaje_requerido = ?, tipo_colada = ?, num_puntos_inyeccion = ?, 

        marca_colada_caliente = ?, circuitos_enfriamiento = ?, 

        tipo_enfriamiento = ?, tipo_expulsion = ?, carrera_expulsion_mm = ?, color = ?, 

        n_parte_1 = ?, n_parte_2 = ?, n_parte_3 = ?, n_parte_4 = ?, n_parte_5 = ?, n_parte_6 = ?, 

        comentarios = ?, image_url = ? 

    WHERE id_molde = ?";

  $stmt = $conn->prepare($sql);

  $stmt->bind_param(
    "ssisssssssssssssssssssssssssssssssssssss" . "s" . "s",

    $input["nombre"] ?? $current["nombre"],

    $input["estado"] ?? $current["estado"],

    $input["año"] ?? $current["año"],

    $input["modelo"] ?? $current["modelo"],

    $input["ciclos_inyeccion"] ?? $current["ciclos_inyeccion"],

    $input["ciclos_acumulados"] ?? $current["ciclos_acumulados"],

    $input["capacidad_ciclos"] ?? $current["capacidad_ciclos"],

    $input["mantenimientos_preventivos"] ??
      $current["mantenimientos_preventivos"],

    $input["tipo_molde"] ?? $current["tipo_molde"],

    $input["ubicacion"] ?? $current["ubicacion"],

    $input["maquina_asignada"] ?? $current["maquina_asignada"],

    $input["numero_serie"] ?? $current["numero_serie"],

    $input["proveedor"] ?? $current["proveedor"],

    $input["peso_kg"] ?? $current["peso_kg"],

    $input["dimensiones"] ?? $current["dimensiones"],

    $input["material_base"] ?? $current["material_base"],

    $input["num_cavidades"] ?? $current["num_cavidades"],

    $input["material_inyeccion"] ?? $current["material_inyeccion"],

    $input["peso_pieza_g"] ?? $current["peso_pieza_g"],

    $input["peso_colada_g"] ?? $current["peso_colada_g"],

    $input["tiempo_ciclo_seg"] ?? $current["tiempo_ciclo_seg"],

    $input["temperatura_molde_c"] ?? $current["temperatura_molde_c"],

    $input["presion_inyeccion_bar"] ?? $current["presion_inyeccion_bar"],

    $input["tonelaje_requerido"] ?? $current["tonelaje_requerido"],

    $input["tipo_colada"] ?? $current["tipo_colada"],

    $input["num_puntos_inyeccion"] ?? $current["num_puntos_inyeccion"],

    $input["marca_colada_caliente"] ?? $current["marca_colada_caliente"],

    $input["circuitos_enfriamiento"] ?? $current["circuitos_enfriamiento"],

    $input["tipo_enfriamiento"] ?? $current["tipo_enfriamiento"],

    $input["tipo_expulsion"] ?? $current["tipo_expulsion"],

    $input["carrera_expulsion_mm"] ?? $current["carrera_expulsion_mm"],

    $input["color"] ?? $current["color"],

    $input["n_parte_1"] ?? $current["n_parte_1"],

    $input["n_parte_2"] ?? $current["n_parte_2"],

    $input["n_parte_3"] ?? $current["n_parte_3"],

    $input["n_parte_4"] ?? $current["n_parte_4"],

    $input["n_parte_5"] ?? $current["n_parte_5"],

    $input["n_parte_6"] ?? $current["n_parte_6"],

    $input["comentarios"] ?? $current["comentarios"],

    $input["image_url"] ?? $current["image_url"],

    $id,
  );

  if ($stmt->execute()) {
    // Log change

    logMoldeChange(
      $conn,
      $id,
      "update",
      json_encode($current),
      json_encode($input),
    );

    echo json_encode([
      "success" => true,
      "message" => "Molde actualizado exitosamente",
    ]);
  } else {
    http_response_code(500);

    echo json_encode([
      "success" => false,
      "message" => "Error al actualizar: " . $stmt->error,
    ]);
  }

  $stmt->close();
}

/** 

 * PATCH - Actualizar solo el estado del molde 

 */

function patchMolde($conn, $id)
{
  $input = json_decode(file_get_contents("php://input"), true);

  $status = $input["status"] ?? ($input["estado"] ?? null);

  if (!$status) {
    http_response_code(400);

    echo json_encode(["success" => false, "message" => "Estado es requerido"]);

    return;
  }

  $stmt = $conn->prepare("UPDATE tbl_moldes SET estado = ? WHERE id_molde = ?");

  $stmt->bind_param("ss", $status, $id);

  $stmt->execute();

  echo json_encode(["success" => true]);

  $stmt->close();
}

/** 

 * DELETE - Eliminar molde 

 */

function deleteMolde($conn, $id)
{
  $stmt = $conn->prepare(
    "SELECT id_molde, nombre FROM tbl_moldes WHERE id_molde = ?",
  );

  $stmt->bind_param("s", $id);

  $stmt->execute();

  if ($stmt->get_result()->num_rows === 0) {
    http_response_code(404);

    echo json_encode(["success" => false, "message" => "Molde no encontrado"]);

    $stmt->close();

    return;
  }

  $stmt->close();

  $delStmt = $conn->prepare("DELETE FROM tbl_moldes WHERE id_molde = ?");

  $delStmt->bind_param("s", $id);

  if ($delStmt->execute()) {
    echo json_encode([
      "success" => true,
      "message" => "Molde $id eliminado correctamente",
    ]);
  } else {
    http_response_code(500);

    echo json_encode(["success" => false, "message" => "Error al eliminar"]);
  }

  $delStmt->close();
}

/** 

 * Helper - Log de cambios 

 */

function logMoldeChange($conn, $moldeId, $campo, $valorAnterior, $valorNuevo)
{
  try {
    $stmt = $conn->prepare(
      "INSERT INTO tbl_moldes_historial (molde_id, campo_modificado, valor_anterior, valor_nuevo) VALUES (?, ?, ?, ?)",
    );

    $stmt->bind_param("ssss", $moldeId, $campo, $valorAnterior, $valorNuevo);

    $stmt->execute();

    $stmt->close();
  } catch (Exception $e) {
    error_log("Error logging molde change: " . $e->getMessage());
  }
}
