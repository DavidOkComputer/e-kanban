
<?php
//troqueles.php la API para gestionar troqueles

require_once "cors.php";
require_once "db_config.php";

$method = $_SERVER["REQUEST_METHOD"];
$uri = $_SERVER["REQUEST_URI"];

// Parsear URI para obtener el ID del troquel
$path = parse_url($uri, PHP_URL_PATH);
$pathParts = explode("/", trim($path, "/"));
$troquelId = null;
$isSearch = false;

foreach ($pathParts as $index => $part) {
	if (
    	($part === "troqueles" || $part === "troqueles.php") &&
    	isset($pathParts[$index + 1])
	) {
    $nextPart = $pathParts[$index + 1];

    if ($nextPart === "search") {
    	$isSearch = true;
    } else {
    	$troquelId = urldecode($nextPart);
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
			} elseif ($troquelId) {
        		getTroquel($conn, $troquelId);
    		} else {
        		getAllTroqueles($conn);
    		}
    	break;

    	case "POST":
    		createTroquel($conn);

      break;

    case "PUT":
      if ($troquelId) {
        updateTroquel($conn, $troquelId);
      } else {
        http_response_code(400);

        echo json_encode([
          "success" => false,

          "message" => "ID de troquel requerido",
        ]);
      }

      break;

    case "DELETE":
      if ($troquelId) {
        deleteTroquel($conn, $troquelId);
      } else {
        http_response_code(400);

        echo json_encode([
          "success" => false,

          "message" => "ID de troquel requerido",
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

function getAllTroqueles($conn)
{
  $sql = "SELECT * FROM tbl_troqueles ORDER BY creado_en DESC";

  $result = $conn->query($sql);

  $troqueles = [];

  while ($row = $result->fetch_assoc()) {
    $troqueles[] = $row;
  }

  echo json_encode($troqueles);
}

function getTroquel($conn, $id)
{
  $stmt = $conn->prepare("SELECT * FROM tbl_troqueles WHERE id_troquel = ?");

  $stmt->bind_param("s", $id);

  $stmt->execute();

  $result = $stmt->get_result();

  if ($result->num_rows === 0) {
    http_response_code(404);

    echo json_encode([
      "success" => false,

      "message" => "Troquel no encontrado",
    ]);

    return;
  }

  echo json_encode($result->fetch_assoc());

  $stmt->close();
}

function handleSearch($conn)
{
  $year = $_GET["year"] ?? ($_GET["año"] ?? null);

  $status = $_GET["status"] ?? ($_GET["estado"] ?? null);

  $search = $_GET["search"] ?? null;

  $sql = "SELECT * FROM tbl_troqueles WHERE 1=1";

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
    $sql .= " AND (id_troquel LIKE ? OR nombre LIKE ? OR modelo LIKE ?)";

    $searchTerm = "%$search%";

    $params[] = $searchTerm;

    $params[] = $searchTerm;

    $params[] = $searchTerm;

    $types .= "sss";
  }

  $sql .= " ORDER BY creado_en DESC";

  $stmt = $conn->prepare($sql);

  if (!empty($params)) {
    $stmt->bind_param($types, ...$params);
  }

  $stmt->execute();

  $result = $stmt->get_result();

  $troqueles = [];

  while ($row = $result->fetch_assoc()) {
    $troqueles[] = $row;
  }

  echo json_encode($troqueles);

  $stmt->close();
}

function createTroquel($conn)
{
  $input = json_decode(file_get_contents("php://input"), true);

  // Validar campos requeridos

  if (
    empty($input["id_troquel"]) ||
    empty($input["nombre"]) ||
    empty($input["año"])
  ) {
    http_response_code(400);

    echo json_encode([
      "success" => false,

      "message" => "ID, nombre y año son requeridos",

      "received" => $input,
    ]);

    return;
  }

  $id = strtoupper(trim($input["id_troquel"]));

  // Revisar si ya existe el ID

  $checkStmt = $conn->prepare(
    "SELECT id_troquel FROM tbl_troqueles WHERE id_troquel = ?",
  );

  $checkStmt->bind_param("s", $id);

  $checkStmt->execute();

  if ($checkStmt->get_result()->num_rows > 0) {
    http_response_code(409);

    echo json_encode([
      "success" => false,

      "message" => "Ya existe un troquel con ese ID",
    ]);

    $checkStmt->close();

    return;
  }

  $checkStmt->close();

  // SQL con todas las columnas de la tabla

  $sql = "INSERT INTO tbl_troqueles ( 

        id_troquel, 

        nombre, 

        estado, 

        año, 

        modelo, 

        golpes, 

        golpes_acum, 

        capacidad_golpes, 

        rectificaciones, 

        tipo_troquel, 

        ubicacion, 

        prensa_asignada, 

        numero_serie, 

        proveedor, 

        peso_kg, 

        dimensiones, 

        material_base, 

        num_estaciones, 

        cavidades, 

        color, 

        ciclos, 

        n_parte_1, 

        n_parte_2, 

        n_parte_3, 

        n_parte_4, 

        n_parte_5, 

        n_parte_6, 

        comentarios, 

        image_url 

    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

  $stmt = $conn->prepare($sql);

  if (!$stmt) {
    http_response_code(500);

    echo json_encode([
      "success" => false,

      "message" => "Error preparando consulta: " . $conn->error,
    ]);

    return;
  }

  // Extraer valores del input con valores por defecto

  $nombre = trim($input["nombre"] ?? "");

  $estado = $input["estado"] ?? "Pendiente";

  $año = (int) ($input["año"] ?? date("Y"));

  $modelo = $input["modelo"] ?? null;

  $golpes = $input["golpes"] ?? "-";

  $golpes_acum = $input["golpes_acum"] ?? "-";

  $capacidad_golpes = $input["capacidad_golpes"] ?? "-";

  $rectificaciones = $input["rectificaciones"] ?? "0";

  $tipo_troquel = $input["tipo_troquel"] ?? "Null";

  $ubicacion = $input["ubicacion"] ?? null;

  $prensa_asignada = $input["prensa_asignada"] ?? null;

  $numero_serie = $input["numero_serie"] ?? null;

  $proveedor = $input["proveedor"] ?? null;

  $peso_kg = $input["peso_kg"] ?? null;

  $dimensiones = $input["dimensiones"] ?? null;

  $material_base = $input["material_base"] ?? null;

  $num_estaciones = $input["num_estaciones"] ?? null;

  $cavidades = $input["cavidades"] ?? null;

  $color = $input["color"] ?? null;

  $ciclos = $input["ciclos"] ?? null;

  $n_parte_1 = $input["n_parte_1"] ?? null;

  $n_parte_2 = $input["n_parte_2"] ?? null;

  $n_parte_3 = $input["n_parte_3"] ?? null;

  $n_parte_4 = $input["n_parte_4"] ?? null;

  $n_parte_5 = $input["n_parte_5"] ?? null;

  $n_parte_6 = $input["n_parte_6"] ?? null;

  $comentarios = $input["comentarios"] ?? null;

  $image_url = $input["image_url"] ?? null;

  // 29 parámetros - todos strings excepto año (integer)

  $stmt->bind_param(
    "sssisssssssssssssssssssssssss",

    $id, // 1. id_troquel (s)

    $nombre, // 2. nombre (s)

    $estado, // 3. estado (s)

    $año, // 4. año (i)

    $modelo, // 5. modelo (s)

    $golpes, // 6. golpes (s)

    $golpes_acum, // 7. golpes_acum (s)

    $capacidad_golpes, // 8. capacidad_golpes (s)

    $rectificaciones, // 9. rectificaciones (s)

    $tipo_troquel, // 10. tipo_troquel (s)

    $ubicacion, // 11. ubicacion (s)

    $prensa_asignada, // 12. prensa_asignada (s)

    $numero_serie, // 13. numero_serie (s)

    $proveedor, // 14. proveedor (s)

    $peso_kg, // 15. peso_kg (s)

    $dimensiones, // 16. dimensiones (s)

    $material_base, // 17. material_base (s)

    $num_estaciones, // 18. num_estaciones (s)

    $cavidades, // 19. cavidades (s)

    $color, // 20. color (s)

    $ciclos, // 21. ciclos (s)

    $n_parte_1, // 22. n_parte_1 (s)

    $n_parte_2, // 23. n_parte_2 (s)

    $n_parte_3, // 24. n_parte_3 (s)

    $n_parte_4, // 25. n_parte_4 (s)

    $n_parte_5, // 26. n_parte_5 (s)

    $n_parte_6, // 27. n_parte_6 (s)

    $comentarios, // 28. comentarios (s)

    $image_url, // 29. image_url (s)
  );

  if ($stmt->execute()) {
    http_response_code(201);

    echo json_encode([
      "success" => true,

      "message" => "Troquel registrado exitosamente",

      "id" => $id,
    ]);
  } else {
    http_response_code(500);

    echo json_encode([
      "success" => false,

      "message" => "Error al registrar el troquel: " . $stmt->error,
    ]);
  }

  $stmt->close();
}

function updateTroquel($conn, $id)
{
  $input = json_decode(file_get_contents("php://input"), true);

  // Revisar si existe el troquel

  $checkStmt = $conn->prepare(
    "SELECT * FROM tbl_troqueles WHERE id_troquel = ?",
  );

  $checkStmt->bind_param("s", $id);

  $checkStmt->execute();

  $existing = $checkStmt->get_result()->fetch_assoc();

  if (!$existing) {
    http_response_code(404);

    echo json_encode([
      "success" => false,

      "message" => "Troquel no encontrado",
    ]);

    $checkStmt->close();

    return;
  }

  $checkStmt->close();

  $sql = "UPDATE tbl_troqueles SET 

        nombre = ?, 

        estado = ?, 

        año = ?, 

        modelo = ?, 

        golpes = ?, 

        golpes_acum = ?, 

        capacidad_golpes = ?, 

        rectificaciones = ?, 

        tipo_troquel = ?, 

        ubicacion = ?, 

        prensa_asignada = ?, 

        numero_serie = ?, 

        proveedor = ?, 

        peso_kg = ?, 

        dimensiones = ?, 

        material_base = ?, 

        num_estaciones = ?, 

        cavidades = ?, 

        color = ?, 

        ciclos = ?, 

        n_parte_1 = ?, 

        n_parte_2 = ?, 

        n_parte_3 = ?, 

        n_parte_4 = ?, 

        n_parte_5 = ?, 

        n_parte_6 = ?, 

        comentarios = ?, 

        image_url = ? 

        WHERE id_troquel = ?";

  $stmt = $conn->prepare($sql);

  if (!$stmt) {
    http_response_code(500);

    echo json_encode([
      "success" => false,

      "message" => "Error preparando consulta: " . $conn->error,
    ]);

    return;
  }

  // Usar valores del input o mantener los existentes
$nombre = trim($input["nombre"] ?? $existing["nombre"]);

  $estado = $input["estado"] ?? $existing["estado"];

  $año = (int) ($input["año"] ?? $existing["año"]);

  $modelo = $input["modelo"] ?? $existing["modelo"];

  $golpes = $input["golpes"] ?? $existing["golpes"];

  $golpes_acum = $input["golpes_acum"] ?? $existing["golpes_acum"];

  $capacidad_golpes =
    $input["capacidad_golpes"] ?? $existing["capacidad_golpes"];

  $rectificaciones = $input["rectificaciones"] ?? $existing["rectificaciones"];

  $tipo_troquel = $input["tipo_troquel"] ?? $existing["tipo_troquel"];

  $ubicacion = $input["ubicacion"] ?? $existing["ubicacion"];

  $prensa_asignada = $input["prensa_asignada"] ?? $existing["prensa_asignada"];

  $numero_serie = $input["numero_serie"] ?? $existing["numero_serie"];

  $proveedor = $input["proveedor"] ?? $existing["proveedor"];

  $peso_kg = $input["peso_kg"] ?? $existing["peso_kg"];

  $dimensiones = $input["dimensiones"] ?? $existing["dimensiones"];

  $material_base = $input["material_base"] ?? $existing["material_base"];

  $num_estaciones = $input["num_estaciones"] ?? $existing["num_estaciones"];

  $cavidades = $input["cavidades"] ?? $existing["cavidades"];

  $color = $input["color"] ?? $existing["color"];

  $ciclos = $input["ciclos"] ?? $existing["ciclos"];

  $n_parte_1 = $input["n_parte_1"] ?? $existing["n_parte_1"];

  $n_parte_2 = $input["n_parte_2"] ?? $existing["n_parte_2"];

  $n_parte_3 = $input["n_parte_3"] ?? $existing["n_parte_3"];

  $n_parte_4 = $input["n_parte_4"] ?? $existing["n_parte_4"];

  $n_parte_5 = $input["n_parte_5"] ?? $existing["n_parte_5"];

  $n_parte_6 = $input["n_parte_6"] ?? $existing["n_parte_6"];

  $comentarios = $input["comentarios"] ?? $existing["comentarios"];

  $image_url = $input["image_url"] ?? $existing["image_url"];

  // 29 parámetros (28 campos + 1 WHERE)

  $stmt->bind_param(
    "ssissssssssssssssssssssssssss",

    $nombre, // 1

    $estado, // 2

    $año, // 3 (i)

    $modelo, // 4

    $golpes, // 5

    $golpes_acum, // 6

    $capacidad_golpes, // 7

    $rectificaciones, // 8

    $tipo_troquel, // 9

    $ubicacion, // 10

    $prensa_asignada, // 11

    $numero_serie, // 12

    $proveedor, // 13

    $peso_kg, // 14

    $dimensiones, // 15

    $material_base, // 16

    $num_estaciones, // 17

    $cavidades, // 18

    $color, // 19

    $ciclos, // 20

    $n_parte_1, // 21

    $n_parte_2, // 22

    $n_parte_3, // 23

    $n_parte_4, // 24

    $n_parte_5, // 25

    $n_parte_6, // 26

    $comentarios, // 27

    $image_url, // 28

    $id, // 29 - WHERE clause
  );

  if ($stmt->execute()) {
    // Registrar cambio en historial

    logChange(
      $conn,

      $id,

      "update",

      json_encode($existing),

      json_encode($input),
    );

    echo json_encode([
      "success" => true,

      "message" => "Troquel actualizado exitosamente",
    ]);
  } else {
    http_response_code(500);

    echo json_encode([
      "success" => false,

      "message" => "Error al actualizar el troquel: " . $stmt->error,
    ]);
  }

  $stmt->close();
}

function deleteTroquel($conn, $id)
{
  // Revisar si existe el troquel

  $checkStmt = $conn->prepare(
    "SELECT id_troquel, nombre FROM tbl_troqueles WHERE id_troquel = ?",
  );

  $checkStmt->bind_param("s", $id);

  $checkStmt->execute();

  $result = $checkStmt->get_result();

  if ($result->num_rows === 0) {
    http_response_code(404);

    echo json_encode([
      "success" => false,

      "message" => "Troquel no encontrado",
    ]);

    $checkStmt->close();

    return;
  }

  $troquel = $result->fetch_assoc();

  $checkStmt->close();

  // Eliminar troquel

  $stmt = $conn->prepare("DELETE FROM tbl_troqueles WHERE id_troquel = ?");

  $stmt->bind_param("s", $id);

  if ($stmt->execute()) {
    echo json_encode([
      "success" => true,

      "message" => "Troquel {$id} eliminado correctamente",
    ]);
  } else {
    http_response_code(500);

    echo json_encode([
      "success" => false,

      "message" => "Error al eliminar el troquel",
    ]);
  }

  $stmt->close();
}

function logChange($conn, $troquelId, $campo, $valorAnterior, $valorNuevo)
{
  $stmt = $conn->prepare(" 

        INSERT INTO tbl_troqueles_historial (troquel_id, campo_modificado, valor_anterior, valor_nuevo) 

        VALUES (?, ?, ?, ?) 

    ");

  $stmt->bind_param("ssss", $troquelId, $campo, $valorAnterior, $valorNuevo);

  $stmt->execute();

  $stmt->close();
}

