
<?php
/*API para Estadísticas y Resumen de Moldes */

require_once "cors.php";

require_once "db_config.php";

$method = $_SERVER["REQUEST_METHOD"];

$uri = $_SERVER["REQUEST_URI"];

// Parsear URI

$path = parse_url($uri, PHP_URL_PATH);

$pathParts = explode("/", trim($path, "/"));

$action = null;

foreach ($pathParts as $index => $part) {
  if ($part === "estadisticas_moldes" || $part === "estadisticas_moldes.php") {
    if (isset($pathParts[$index + 1])) {
      $action = $pathParts[$index + 1];
    }

    break;
  }
}

if ($method !== "GET") {
  http_response_code(405);

  echo json_encode(["success" => false, "message" => "Método no permitido"]);

  exit();
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
  switch ($action) {
    case "reparaciones-activas":
      getReparacionesActivas($conn);

      break;

    case "priority-repairs":
      getPriorityRepairs($conn);

      break;

    case "summary":
      getSummary($conn);

      break;

    case "resumen-mensual":
      getResumenMensual($conn);

      break;

    case null:

    case "estadisticas":

    default:
      getEstadisticas($conn);

      break;
  }
} catch (Exception $e) {
  http_response_code(500);

  echo json_encode(["success" => false, "message" => $e->getMessage()]);
} finally {
  $conn->close();
}

function getEstadisticas($conn)
{
  $total = $conn
    ->query("SELECT COUNT(*) as count FROM tbl_moldes")
    ->fetch_assoc()["count"];

  $activos = $conn
    ->query(
      "SELECT COUNT(*) as count FROM tbl_moldes WHERE estado IN ('En maquina', 'Listo')",
    )
    ->fetch_assoc()["count"];

  $reparando = $conn
    ->query(
      "SELECT COUNT(*) as count FROM tbl_moldes WHERE estado = 'Reparando'",
    )
    ->fetch_assoc()["count"];

  $pendientes = $conn
    ->query(
      "SELECT COUNT(*) as count FROM tbl_moldes WHERE estado = 'Pendiente'",
    )
    ->fetch_assoc()["count"];

  echo json_encode([
    "total" => (int) $total,

    "activos" => (int) $activos,

    "reparando" => (int) $reparando,

    "pendientes" => (int) $pendientes,
  ]);
}

function getReparacionesActivas($conn)
{
  $result = $conn->query(" 

        SELECT 

            cr.id_ciclo_reparacion, 

            cr.molde_id, 

            cr.molde_nombre, 

            cr.modelo, 

            cr.fecha_inicio_reparacion, 

            cr.motivo_entrada, 

            cr.falla_descripcion, 

            cr.prioridad, 

            cr.maquina_origen, 

            cr.nivel_reparacion, 

            cr.grupo_reparacion, 

            cr.fecha_bajado, 

            cr.fecha_recepcion_taller, 

            cr.fecha_inicio_trabajo, 

            TIMESTAMPDIFF(HOUR, cr.fecha_inicio_reparacion, NOW()) AS horas_en_reparacion, 

            TIMESTAMPDIFF(DAY, cr.fecha_inicio_reparacion, NOW()) AS dias_en_reparacion 

        FROM tbl_ciclos_reparacion_molde cr 

        WHERE cr.ciclo_activo = TRUE 

        ORDER BY cr.prioridad ASC, cr.fecha_inicio_reparacion ASC 

    ");

  $rows = [];

  while ($row = $result->fetch_assoc()) {
    // Obtener técnicos para cada ciclo

    $tecStmt = $conn->prepare(" 

            SELECT empleado_nombre, grupo, tipo  

            FROM tbl_tecnicos_ciclo_molde  

            WHERE ciclo_id = ? AND fecha_fin IS NULL 

        ");

    $tecStmt->bind_param("i", $row["id_ciclo_reparacion"]);

    $tecStmt->execute();

    $tecResult = $tecStmt->get_result();

    $tecnicos = [];

    while ($tec = $tecResult->fetch_assoc()) {
      $tecnicos[] = $tec;
    }

    $tecStmt->close();

    $row["tecnicos"] = $tecnicos;

    $rows[] = $row;
  }

  echo json_encode($rows);
}

function getPriorityRepairs($conn)
{
  $result = $conn->query(" 

        SELECT cr.prioridad, m.id_molde, m.nombre 

        FROM tbl_ciclos_reparacion_molde cr 

        JOIN tbl_moldes m ON cr.molde_id COLLATE utf8mb4_general_ci = m.id_molde 

        WHERE cr.ciclo_activo = TRUE 

        ORDER BY cr.prioridad ASC, cr.fecha_inicio_reparacion ASC 

    ");

  $repairs = [];

  while ($row = $result->fetch_assoc()) {
    $repairs[] = [
      "priority" => (int) $row["prioridad"],

      "id" => $row["id_molde"],

      "name" => $row["nombre"],
    ];
  }

  echo json_encode($repairs);
}

function getSummary($conn)
{
  $result = $conn->query(" 

        SELECT etiqueta, count, goal, perf  

        FROM tbl_resumen_moldes  

        ORDER BY FIELD(etiqueta, 'UP', 'BACKUP', 'TOTAL') 

    ");

  if ($result && $result->num_rows > 0) {
    $summary = [];

    while ($row = $result->fetch_assoc()) {
      $summary[] = [
        "label" => $row["etiqueta"],

        "count" => (int) $row["count"],

        "goal" => $row["goal"],

        "perf" => $row["perf"],
      ];
    }

    echo json_encode($summary);
  } else {
    // Fallback: calcular desde tbl_moldes

    $total = $conn
      ->query("SELECT COUNT(*) as count FROM tbl_moldes")
      ->fetch_assoc()["count"];

    $up = $conn
      ->query(
        "SELECT COUNT(*) as count FROM tbl_moldes WHERE estado = 'En maquina'",
      )
      ->fetch_assoc()["count"];

    $backup = $conn
      ->query(
        "SELECT COUNT(*) as count FROM tbl_moldes WHERE estado = 'Listo-BackUp'",
      )
      ->fetch_assoc()["count"];

    echo json_encode([
      ["label" => "UP", "count" => (int) $up, "goal" => null, "perf" => null],

      [
        "label" => "BACKUP",
        "count" => (int) $backup,
        "goal" => null,
        "perf" => null,
      ],

      [
        "label" => "TOTAL",
        "count" => (int) $total,
        "goal" => null,
        "perf" => null,
      ],
    ]);
  }
}

function getResumenMensual($conn)
{
  $year = isset($_GET["year"]) ? intval($_GET["year"]) : date("Y");

  $stmt = $conn->prepare(" 

        SELECT 

            YEAR(fecha_inicio_reparacion) AS anio, 

            MONTH(fecha_inicio_reparacion) AS mes, 

            DATE_FORMAT(fecha_inicio_reparacion, '%Y-%m') AS periodo, 

            COUNT(*) AS total_reparaciones, 

            COUNT(CASE WHEN ciclo_activo = FALSE THEN 1 END) AS completadas, 

            ROUND(AVG(CASE WHEN ciclo_activo = FALSE THEN tiempo_reparacion_horas END), 2) AS promedio_horas, 

            SUM(CASE WHEN motivo_entrada = 'Falla de Molde' THEN 1 ELSE 0 END) AS por_falla, 

            SUM(CASE WHEN motivo_entrada = 'Limpieza General' THEN 1 ELSE 0 END) AS por_limpieza, 

            SUM(CASE WHEN motivo_entrada = 'Cambio de Modelo' THEN 1 ELSE 0 END) AS por_cambio_modelo, 

            SUM(CASE WHEN motivo_entrada = 'Mantenimiento Preventivo' THEN 1 ELSE 0 END) AS por_mantenimiento, 

            SUM(CASE WHEN motivo_entrada = 'Cambio de Componente' THEN 1 ELSE 0 END) AS por_cambio_componente 

        FROM tbl_ciclos_reparacion_molde 

        WHERE YEAR(fecha_inicio_reparacion) = ? 

        GROUP BY YEAR(fecha_inicio_reparacion), MONTH(fecha_inicio_reparacion) 

        ORDER BY anio DESC, mes DESC 

    ");

  $stmt->bind_param("i", $year);

  $stmt->execute();

  $result = $stmt->get_result();

  $rows = [];

  while ($row = $result->fetch_assoc()) {
    $rows[] = $row;
  }

  echo json_encode($rows);

  $stmt->close();
}