

<?php
/** 

 * API para Acciones e Historial de Moldes 

 * Endpoint: /api/acciones_molde.php 

 *  

 * POST /action/{moldeId}   → Registrar acción (baja_molde) y opcionalmente iniciar ciclo 

 * GET  /history/{moldeId}   → Obtener historial del molde 

 */

require_once "cors.php";

require_once "db_config.php";

$method = $_SERVER["REQUEST_METHOD"];

$uri = $_SERVER["REQUEST_URI"];

// Parsear URI

$path = parse_url($uri, PHP_URL_PATH);

$pathParts = explode("/", trim($path, "/"));

$action = null;

$moldeId = null;

foreach ($pathParts as $index => $part) {
  if ($part === "acciones_molde" || $part === "acciones_molde.php") {
    if (isset($pathParts[$index + 1])) {
      $action = $pathParts[$index + 1];
    }

    if (isset($pathParts[$index + 2])) {
      $moldeId = urldecode($pathParts[$index + 2]);
    }

    break;
  }
}

$input = json_decode(file_get_contents("php://input"), true) ?: [];

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
  if ($method === "POST" && $action === "action" && $moldeId) {
    registrarAccion($conn, $moldeId, $input);
  } elseif ($method === "GET" && $action === "history" && $moldeId) {
    getHistorial($conn, $moldeId);
  } else {
    http_response_code(404);

    echo json_encode(["error" => "Endpoint not found"]);
  }
} catch (Exception $e) {
  http_response_code(500);

  echo json_encode(["error" => $e->getMessage()]);
} finally {
  $conn->close();
}

/** 

 * POST - Registrar acción y opcionalmente iniciar ciclo de reparación 

 */

function registrarAccion($conn, $moldeId, $input)
{
  $conn->begin_transaction();

  try {
    // Obtener info del molde

    $moldeStmt = $conn->prepare(" 

            SELECT id_molde AS molde_id, nombre, modelo, estado AS status, maquina_asignada AS maquina_actual  

            FROM tbl_moldes WHERE id_molde = ? 

        ");

    $moldeStmt->bind_param("s", $moldeId);

    $moldeStmt->execute();

    $moldeResult = $moldeStmt->get_result();

    if ($moldeResult->num_rows === 0) {
      $conn->rollback();

      http_response_code(404);

      echo json_encode(["error" => "Molde not found"]);

      $moldeStmt->close();

      return;
    }

    $molde = $moldeResult->fetch_assoc();

    $moldeStmt->close();

    // Obtener descripción de falla si hay falla_id

    $fallaDescripcion = null;

    $fallaId = $input["falla_id"] ?? null;

    if ($fallaId) {
      $fallaStmt = $conn->prepare(
        "SELECT descripcion FROM tbl_fallas_catalogo_molde WHERE id_falla_molde = ?",
      );

      $fallaStmt->bind_param("i", $fallaId);

      $fallaStmt->execute();

      $fallaResult = $fallaStmt->get_result();

      if ($fallaResult->num_rows > 0) {
        $fallaDescripcion = $fallaResult->fetch_assoc()["descripcion"];
      }

      $fallaStmt->close();
    }

    // Insertar registro en historial

    $tipoAccion = $input["tipo_accion"] ?? null;

    $modeloNuevoId = $input["modelo_nuevo_id"] ?? null;

    $folio = $input["folio"] ?? null;

    $comentarios = $input["comentarios"] ?? null;

    $empleado = $input["empleado"] ?? null;

    $nivel = $input["nivel"] ?? null;

    $grupo = $input["grupo"] ?? null;

    $histStmt = $conn->prepare(" 

            INSERT INTO tbl_historial_molde ( 

                molde_id, tipo_registro, action_type, id_falla, modelo_nuevo, 

                folio, comentarios, empleado_molde, nivel_setup, grupo 

            ) VALUES (?, 'baja_molde', ?, ?, ?, ?, ?, ?, ?, ?) 

        ");

    $histStmt->bind_param(
      "ssissssss",

      $moldeId,
      $tipoAccion,
      $fallaId,
      $modeloNuevoId,

      $folio,
      $comentarios,
      $empleado,
      $nivel,
      $grupo,
    );

    $histStmt->execute();

    $historyId = $conn->insert_id;

    $histStmt->close();

    // Si se envía nuevo status, actualizar molde

    $newStatus = $input["new_status"] ?? null;

    if ($newStatus) {
      $updateMolde = $conn->prepare(
        "UPDATE tbl_moldes SET estado = ? WHERE id_molde = ?",
      );

      $updateMolde->bind_param("ss", $newStatus, $moldeId);

      $updateMolde->execute();

      $updateMolde->close();

      // Si va a Reparando, crear ciclo automáticamente

      if ($newStatus === "Reparando") {
        $motivoEntrada = "Otro";

        if ($tipoAccion === "Falla de Molde") {
          $motivoEntrada = "Falla de Molde";
        } elseif ($tipoAccion === "Limpieza General") {
          $motivoEntrada = "Limpieza General";
        } elseif ($tipoAccion === "Cambio de Modelo") {
          $motivoEntrada = "Cambio de Modelo";
        }

        // Verificar que no exista ciclo activo

        $checkCiclo = $conn->prepare(" 

                    SELECT id_ciclo_reparacion FROM tbl_ciclos_reparacion_molde  

                    WHERE molde_id = ? AND ciclo_activo = TRUE 

                ");

        $checkCiclo->bind_param("s", $moldeId);

        $checkCiclo->execute();

        $existingCiclo = $checkCiclo->get_result();

        $checkCiclo->close();

        if ($existingCiclo->num_rows === 0) {
          $cicloStmt = $conn->prepare(" 

                        INSERT INTO tbl_ciclos_reparacion_molde ( 

                            molde_id, molde_nombre, modelo, 

                            fecha_inicio_reparacion, motivo_entrada, 

                            falla_id, falla_descripcion, folio_entrada, 

                            empleado_registro, comentarios_entrada, status_anterior, 

                            maquina_origen, nivel_reparacion, grupo_reparacion, 

                            fecha_bajado, ciclo_activo 

                        ) VALUES (?, ?, ?, NOW(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), TRUE) 

                    ");

          $cicloStmt->bind_param(
            "ssssisssssssss",

            $moldeId,
            $molde["nombre"],
            $molde["modelo"],

            $motivoEntrada,
            $fallaId,
            $fallaDescripcion,

            $folio,
            $empleado,
            $comentarios,

            $molde["status"],
            $molde["maquina_actual"],

            $nivel,
            $grupo,
          );

          $cicloStmt->execute();

          $cicloStmt->close();
        }
      }
    }

    $conn->commit();

    echo json_encode(["success" => true, "history_id" => $historyId]);
  } catch (Exception $e) {
    $conn->rollback();

    http_response_code(500);

    echo json_encode([
      "error" => "Error recording action: " . $e->getMessage(),
    ]);
  }
}

/** 

 * GET - Historial del molde con descripciones de falla/asistencia 

 */

function getHistorial($conn, $moldeId)
{
  $stmt = $conn->prepare(" 

        SELECT  

            h.*, 

            fc.descripcion AS falla_descripcion, 

            am.descripcion AS motivo_descripcion 

        FROM tbl_historial_molde h 

        LEFT JOIN tbl_fallas_catalogo_molde fc ON h.id_falla = fc.id_falla_molde 

        LEFT JOIN tbl_asistencia_maquina am ON h.id_falla = am.id_asistencia_maquina 

        WHERE h.molde_id = ? 

        ORDER BY h.creado_el DESC 

    ");

  $stmt->bind_param("s", $moldeId);

  $stmt->execute();

  $result = $stmt->get_result();

  $history = [];

  while ($row = $result->fetch_assoc()) {
    $history[] = [
      "id" => $row["id_historial"],

      "tipo_registro" => $row["tipo_registro"] ?? "legacy",

      "action_type" => $row["action_type"],

      "folio" => $row["folio"],

      "falla_description" => $row["falla_descripcion"],

      "motivo_description" => $row["motivo_descripcion"],

      "modelo_nuevo" => $row["modelo_nuevo"],

      "nivel_setup" => $row["nivel_setup"],

      "grupo" => $row["grupo"],

      "comentarios" => $row["comentarios"],

      "comentarios_supervisor" => $row["comentarios_supervisor"],

      "empleado" => $row["empleado_molde"] ?: $row["empleado_asistencia"],

      "created_at" => $row["creado_el"],
    ];
  }

  echo json_encode($history);

  $stmt->close();
}

