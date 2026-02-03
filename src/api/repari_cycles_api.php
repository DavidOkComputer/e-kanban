<?php
// repair_cycles_api.php API par el ciclo de reparacion

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
  http_response_code(200);
  exit();
}

//configuracion de bd
$host = "localhost";
$dbname = "ekanban_db";
$username = "root";
$password = "";

try {
  $pdo = new PDO(
    "mysql:host=$host;dbname=$dbname;charset=utf8mb4",
    $username,
    $password,
  );
  $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
  http_response_code(500);
  echo json_encode([
    "error" => "Database connection failed: " . $e->getMessage(),
  ]);
  exit();
}

$requestUri = $_SERVER["REQUEST_URI"];
$method = $_SERVER["REQUEST_METHOD"];

$basePath = "/ekanban/api/repair_cycles_api.php";
$path = str_replace($basePath, "", parse_url($requestUri, PHP_URL_PATH));
$pathParts = array_filter(explode("/", $path));
$pathParts = array_values($pathParts);

//obtener el cuerpo en JSON
$input = json_decode(file_get_contents("php://input"), true);

// rutas
try {
  // GET /ciclo-activo/{troquelId}
  if (
    $method === "GET" &&
    count($pathParts) === 2 &&
    $pathParts[0] === "ciclo-activo"
  ) {
    $troquelId = $pathParts[1];
    getCicloActivo($pdo, $troquelId);
  }

  // GET /ciclos-historial/{troquelId}
  elseif (
    $method === "GET" &&
    count($pathParts) === 2 &&
    $pathParts[0] === "ciclos-historial"
  ) {
    $troquelId = $pathParts[1];
    getCiclosHistorial($pdo, $troquelId);
  }

  // GET /reparaciones-activas
  elseif (
    $method === "GET" &&
    count($pathParts) === 1 &&
    $pathParts[0] === "reparaciones-activas"
  ) {
    getReparacionesActivas($pdo);
  }

  // GET /estadisticas/{troquelId}
  elseif (
    $method === "GET" &&
    count($pathParts) === 2 &&
    $pathParts[0] === "estadisticas"
  ) {
    $troquelId = $pathParts[1];

    getEstadisticas($pdo, $troquelId);
  }

  // POST /iniciar-ciclo/{troquelId}
  elseif (
    $method === "POST" &&
    count($pathParts) === 2 &&
    $pathParts[0] === "iniciar-ciclo"
  ) {
    $troquelId = $pathParts[1];

    iniciarCiclo($pdo, $troquelId, $input);
  }

  // POST /cerrar-ciclo/{cicloId}
  elseif (
    $method === "POST" &&
    count($pathParts) === 2 &&
    $pathParts[0] === "cerrar-ciclo"
  ) {
    $cicloId = $pathParts[1];

    cerrarCiclo($pdo, $cicloId, $input);
  }

  // POST /actualizar-paso/{cicloId}
  elseif (
    $method === "POST" &&
    count($pathParts) === 2 &&
    $pathParts[0] === "actualizar-paso"
  ) {
    $cicloId = $pathParts[1];

    actualizarPaso($pdo, $cicloId, $input);
  }

  // POST /prioridad/{cicloId}
  elseif (
    $method === "POST" &&
    count($pathParts) === 2 &&
    $pathParts[0] === "prioridad"
  ) {
    $cicloId = $pathParts[1];

    actualizarPrioridad($pdo, $cicloId, $input);
  }

  // POST /tecnicos/{cicloId}
  elseif (
    $method === "POST" &&
    count($pathParts) === 2 &&
    $pathParts[0] === "tecnicos"
  ) {
    $cicloId = $pathParts[1];

    agregarTecnico($pdo, $cicloId, $input);
  }

  // DELETE /tecnicos/{tecnicoId}
  elseif (
    $method === "DELETE" &&
    count($pathParts) === 2 &&
    $pathParts[0] === "tecnicos"
  ) {
    $tecnicoId = $pathParts[1];

    removerTecnico($pdo, $tecnicoId);
  }

  // POST /pendiente/{cicloId}
  elseif (
    $method === "POST" &&
    count($pathParts) === 2 &&
    $pathParts[0] === "pendiente"
  ) {
    $cicloId = $pathParts[1];

    marcarPendiente($pdo, $cicloId, $input);
  }

  // POST /agregar-detalle/{cicloId}
  elseif (
    $method === "POST" &&
    count($pathParts) === 2 &&
    $pathParts[0] === "agregar-detalle"
  ) {
    $cicloId = $pathParts[1];

    agregarDetalle($pdo, $cicloId, $input);
  }

  // GET /resumen-mensual
  elseif (
    $method === "GET" &&
    count($pathParts) === 1 &&
    $pathParts[0] === "resumen-mensual"
  ) {
    getResumenMensual($pdo);
  } else {
    http_response_code(404);

    echo json_encode(["error" => "Endpoint not found"]);
  }
} catch (Exception $e) {
  http_response_code(500);

  echo json_encode(["error" => $e->getMessage()]);
}

function getCicloActivo($pdo, $troquelId)
{
  $stmt = $pdo->prepare(" 
        SELECT  
            cr.*, 
            TIMESTAMPDIFF(MINUTE, cr.fecha_inicio_reparacion, NOW()) AS minutos_transcurridos, 
            TIMESTAMPDIFF(HOUR, cr.fecha_inicio_reparacion, NOW()) AS horas_transcurridas, 
            TIMESTAMPDIFF(DAY, cr.fecha_inicio_reparacion, NOW()) AS dias_transcurridos 
        FROM tbl_ciclos_reparacion cr 
        WHERE cr.troquel_id = ? AND cr.ciclo_activo = TRUE 
        ORDER BY cr.fecha_inicio_reparacion DESC 
        LIMIT 1 
    ");

  $stmt->execute([$troquelId]);
  $ciclo = $stmt->fetch(PDO::FETCH_ASSOC);

  if (!$ciclo) {
    echo json_encode([
      "ciclo" => null,
      "message" => "No active repair cycle found",
    ]);

    return;
  }

  //obtener tecnicos
  $stmtTec = $pdo->prepare(" 
        SELECT * FROM tbl_tecnicos_ciclo WHERE ciclo_id = ? ORDER BY fecha_inicio ASC 
    ");

  $stmtTec->execute([$ciclo["id"]]);
  $tecnicos = $stmtTec->fetchAll(PDO::FETCH_ASSOC);
  echo json_encode(["ciclo" => $ciclo, "tecnicos" => $tecnicos]);
}

function getCiclosHistorial($pdo, $troquelId)
{
  $limit = isset($_GET["limit"]) ? intval($_GET["limit"]) : 20;
  $stmt = $pdo->prepare(" 
        SELECT  
            cr.*, 
            CASE  
                WHEN cr.tiempo_reparacion_horas <= 4 THEN 'Rápida (≤4h)' 
                WHEN cr.tiempo_reparacion_horas <= 24 THEN 'Normal (4-24h)' 
                WHEN cr.tiempo_reparacion_horas <= 72 THEN 'Extendida (1-3 días)' 
                ELSE 'Prolongada (>3 días)' 
            END AS clasificacion_tiempo 
        FROM tbl_ciclos_reparacion cr 
        WHERE cr.troquel_id = ? 
        ORDER BY cr.fecha_inicio_reparacion DESC 
        LIMIT ? 
    ");
  $stmt->execute([$troquelId, $limit]);
  $ciclos = $stmt->fetchAll(PDO::FETCH_ASSOC);
  echo json_encode($ciclos);
}

function getReparacionesActivas($pdo)
{
  $stmt = $pdo->query(" 
        SELECT  
            cr.id, 
            cr.troquel_id, 
            cr.troquel_nombre, 
            cr.modelo, 
            cr.fecha_inicio_reparacion, 
            cr.motivo_entrada, 
            cr.falla_descripcion, 
            cr.prioridad, 
            cr.prensa_origen, 
            cr.nivel_reparacion, 
            cr.grupo_reparacion, 
            TIMESTAMPDIFF(HOUR, cr.fecha_inicio_reparacion, NOW()) AS horas_en_reparacion, 
            TIMESTAMPDIFF(DAY, cr.fecha_inicio_reparacion, NOW()) AS dias_en_reparacion 
        FROM tbl_ciclos_reparacion cr 
        WHERE cr.ciclo_activo = TRUE 
        ORDER BY cr.prioridad ASC, cr.fecha_inicio_reparacion ASC 
    ");

  $reparaciones = $stmt->fetchAll(PDO::FETCH_ASSOC);

  foreach ($reparaciones as &$rep) {
    $stmtTec = $pdo->prepare(" 
            SELECT empleado_nombre, grupo, tipo FROM tbl_tecnicos_ciclo  
            WHERE ciclo_id = ? AND fecha_fin IS NULL 
        ");

    $stmtTec->execute([$rep["id"]]);
    $rep["tecnicos"] = $stmtTec->fetchAll(PDO::FETCH_ASSOC);
  }

  echo json_encode($reparaciones);
}

function getEstadisticas($pdo, $troquelId)
{
  $stmt = $pdo->prepare(" 
        SELECT  
            troquel_id, 
            COUNT(*) AS total_reparaciones, 
            COUNT(CASE WHEN ciclo_activo = FALSE THEN 1 END) AS reparaciones_completadas, 
            COUNT(CASE WHEN ciclo_activo = TRUE THEN 1 END) AS reparaciones_activas, 
            AVG(CASE WHEN ciclo_activo = FALSE THEN tiempo_reparacion_horas END) AS promedio_horas_reparacion, 
            MIN(CASE WHEN ciclo_activo = FALSE THEN tiempo_reparacion_horas END) AS min_horas_reparacion, 
            MAX(CASE WHEN ciclo_activo = FALSE THEN tiempo_reparacion_horas END) AS max_horas_reparacion, 
            SUM(CASE WHEN motivo_entrada = 'Falla de Troquel' THEN 1 ELSE 0 END) AS total_fallas, 
            SUM(CASE WHEN motivo_entrada = 'Limpieza General' THEN 1 ELSE 0 END) AS total_limpiezas, 
            SUM(CASE WHEN motivo_entrada = 'Cambio de Modelo' THEN 1 ELSE 0 END) AS total_cambios_modelo, 
            SUM(CASE WHEN motivo_entrada = 'Mantenimiento Preventivo' THEN 1 ELSE 0 END) AS total_mantenimientos 
        FROM tbl_ciclos_reparacion 
        WHERE troquel_id = ? 
        GROUP BY troquel_id 
    ");

  $stmt->execute([$troquelId]);
  $stats = $stmt->fetch(PDO::FETCH_ASSOC);

  if (!$stats) {
    $stats = [
      "total_reparaciones" => 0,
      "reparaciones_completadas" => 0,
      "promedio_horas_reparacion" => null,
    ];
  }
  echo json_encode($stats);
}

function iniciarCiclo($pdo, $troquelId, $input)
{
  $pdo->beginTransaction();

  try {
    //revisar si hay un ciclo activo 

    $stmt = $pdo->prepare(
      "SELECT id FROM tbl_ciclos_reparacion WHERE troquel_id = ? AND ciclo_activo = TRUE",
    );

    $stmt->execute([$troquelId]);

    if ($stmt->fetch()) {
      $pdo->rollBack();
      http_response_code(400);
      echo json_encode(["error" => "Active repair cycle already exists"]);
      return;
    }

    //insertar nuevo ciclo
    $stmt = $pdo->prepare(" 
            INSERT INTO tbl_ciclos_reparacion ( 
                troquel_id, troquel_nombre, modelo, 
                fecha_inicio_reparacion, motivo_entrada, 
                falla_id, falla_descripcion, 
                folio_entrada, empleado_registro, comentarios_entrada, 
                status_anterior, prensa_origen, 
                nivel_reparacion, grupo_reparacion, prioridad, 
                fecha_bajado, ciclo_activo 
            ) VALUES (?, ?, ?, NOW(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), TRUE) 
        ");

    $stmt->execute([
      $troquelId,
      $input["troquel_nombre"] ?? null,
      $input["modelo"] ?? null,
      $input["motivo_entrada"],
      $input["falla_id"] ?? null,
      $input["falla_descripcion"] ?? null,
      $input["folio"] ?? null,
      $input["empleado"] ?? null,
      $input["comentarios"] ?? null,
      $input["status_anterior"] ?? "En prensa",
      $input["prensa_origen"] ?? null,
      $input["nivel"] ?? null,
      $input["grupo"] ?? null,
      $input["prioridad"] ?? 3,
    ]);

    $cicloId = $pdo->lastInsertId();

    //actualizar el estado del troquel
    $stmt = $pdo->prepare(
      "UPDATE tbl_troqueles SET status = 'Reparando' WHERE troquel_id = ?",
    );

    $stmt->execute([$troquelId]);
    $pdo->commit();

    echo json_encode(["success" => true, "ciclo_id" => $cicloId]);
  } catch (Exception $e) {
    $pdo->rollBack();

    throw $e;
  }
}

function cerrarCiclo($pdo, $cicloId, $input)
{
  $pdo->beginTransaction();

  try {
    //obtener la info del ciclo

    $stmt = $pdo->prepare(
      "SELECT troquel_id FROM tbl_ciclos_reparacion WHERE id = ? AND ciclo_activo = TRUE",
    );

    $stmt->execute([$cicloId]);
    $ciclo = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$ciclo) {
      $pdo->rollBack();
      http_response_code(404);
      echo json_encode(["error" => "Active repair cycle not found"]);
      return;
    }

    //cerrar el ciclo

    $stmt = $pdo->prepare(" 
            UPDATE tbl_ciclos_reparacion 
            SET  
                fecha_fin_reparacion = NOW(), 
                status_salida = ?, 
                empleado_cierre = ?, 
                comentarios_salida = ?, 
                folio_salida = ?, 
                fecha_termino_trabajo = COALESCE(fecha_termino_trabajo, NOW()), 
                ciclo_activo = FALSE 
            WHERE id = ? 
        ");

    $stmt->execute([
      $input["status_salida"],
      $input["empleado_cierre"] ?? null,
      $input["comentarios"] ?? null,
      $input["folio"] ?? null,
      $cicloId,
    ]);

    //cerrar las asignaciones del tecnico
    $stmt = $pdo->prepare(
      "UPDATE tbl_tecnicos_ciclo SET fecha_fin = NOW() WHERE ciclo_id = ? AND fecha_fin IS NULL",
    );

    $stmt->execute([$cicloId]);

    //actualizar el estado del troquel
    $stmt = $pdo->prepare(
      "UPDATE tbl_troqueles SET status = ? WHERE troquel_id = ?",
    );
    $stmt->execute([$input["status_salida"], $ciclo["troquel_id"]]);
    $pdo->commit();
    echo json_encode(["success" => true]);
  } catch (Exception $e) {
    $pdo->rollBack();

    throw $e;
  }
}

function actualizarPaso($pdo, $cicloId, $input)
{
  $paso = $input["paso"];
  $fieldMap = [
    "recepcion" => "fecha_recepcion_taller",
    "inicio" => "fecha_inicio_trabajo",
    "termino" => "fecha_termino_trabajo",
  ];

  if (!isset($fieldMap[$paso])) {
    http_response_code(400);
    echo json_encode(["error" => "Invalid step"]);
    return;
  }

  $field = $fieldMap[$paso];
  $stmt = $pdo->prepare(
    "UPDATE tbl_ciclos_reparacion SET $field = NOW() WHERE id = ? AND ciclo_activo = TRUE",
  );

  $stmt->execute([$cicloId]);

  //obtener las fechas actualizadas
  $stmt = $pdo->prepare(" 
        SELECT fecha_bajado, fecha_recepcion_taller, fecha_inicio_trabajo, fecha_termino_trabajo 
        FROM tbl_ciclos_reparacion WHERE id = ? 
    ");

  $stmt->execute([$cicloId]);
  $proceso = $stmt->fetch(PDO::FETCH_ASSOC);
  echo json_encode(["success" => true, "proceso" => $proceso]);
}

function actualizarPrioridad($pdo, $cicloId, $input)
{
  $stmt = $pdo->prepare(
    "UPDATE tbl_ciclos_reparacion SET prioridad = ? WHERE id = ?",
  );

  $stmt->execute([$input["prioridad"], $cicloId]);
  echo json_encode(["success" => true]);
}

function agregarTecnico($pdo, $cicloId, $input)
{
  $stmt = $pdo->prepare(" 
        INSERT INTO tbl_tecnicos_ciclo (ciclo_id, empleado_numero, empleado_nombre, grupo, tipo) 
        VALUES (?, ?, ?, ?, ?) 
    ");

  $stmt->execute([
    $cicloId,
    $input["empleado_numero"] ?? null,
    $input["empleado_nombre"],
    $input["grupo"] ?? null,
    $input["tipo"] ?? "Técnico",
  ]);

  $tecnicoId = $pdo->lastInsertId();

  //obtener el tecnico registrado
  $stmt = $pdo->prepare("SELECT * FROM tbl_tecnicos_ciclo WHERE id = ?");
  $stmt->execute([$tecnicoId]);
  $tecnico = $stmt->fetch(PDO::FETCH_ASSOC);
  echo json_encode(["success" => true, "tecnico" => $tecnico]);
}

function removerTecnico($pdo, $tecnicoId)
{
  $stmt = $pdo->prepare(
    "UPDATE tbl_tecnicos_ciclo SET fecha_fin = NOW() WHERE id = ? AND fecha_fin IS NULL",
  );

  $stmt->execute([$tecnicoId]);

  echo json_encode(["success" => true]);
}

function marcarPendiente($pdo, $cicloId, $input)
{
  $pdo->beginTransaction();

  try {
    //obtener info del ciclo
    $stmt = $pdo->prepare(
      "SELECT troquel_id FROM tbl_ciclos_reparacion WHERE id = ?",
    );

    $stmt->execute([$cicloId]);
    $ciclo = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$ciclo) {
      $pdo->rollBack();
      http_response_code(404);
      echo json_encode(["error" => "Repair cycle not found"]);
      return;
    }

    $comentario = "Pendiente hasta: {$input["fecha_liberacion"]}. Motivo: {$input["motivo"]}";

    //cerrar el ciclo con estado de pendiente
    $stmt = $pdo->prepare(" 
            UPDATE tbl_ciclos_reparacion 
            SET  
                fecha_fin_reparacion = NOW(), 
                status_salida = 'Pendiente', 
                empleado_cierre = ?, 
                comentarios_salida = ?, 
                ciclo_activo = FALSE 
            WHERE id = ? 
        ");

    $stmt->execute([$input["empleado"] ?? null, $comentario, $cicloId]);

    //actualizar el estado del troquel
    $stmt = $pdo->prepare(
      "UPDATE tbl_troqueles SET status = 'Pendiente' WHERE troquel_id = ?",
    );

    $stmt->execute([$ciclo["troquel_id"]]);
    $pdo->commit();

    echo json_encode(["success" => true]);
  } catch (Exception $e) {
    $pdo->rollBack();

    throw $e;
  }
}

function agregarDetalle($pdo, $cicloId, $input)
{
  //obtener la descripcion de la falla actual
  $stmt = $pdo->prepare(
    "SELECT falla_descripcion FROM tbl_ciclos_reparacion WHERE id = ?",
  );

  $stmt->execute([$cicloId]);
  $current = $stmt->fetch(PDO::FETCH_ASSOC);
  $newDesc = $current["falla_descripcion"]
    ? "{$current["falla_descripcion"]}; {$input["falla_descripcion"]}"
    : $input["falla_descripcion"];

  $stmt = $pdo->prepare(" 
        UPDATE tbl_ciclos_reparacion  
        SET falla_id = COALESCE(falla_id, ?), falla_descripcion = ? 
        WHERE id = ? 
    ");

  $stmt->execute([$input["falla_id"] ?? null, $newDesc, $cicloId]);
  echo json_encode(["success" => true]);
}

function getResumenMensual($pdo)
{
  $year = isset($_GET["year"]) ? intval($_GET["year"]) : date("Y");
  $stmt = $pdo->prepare(" 
        SELECT  
            YEAR(fecha_inicio_reparacion) AS anio, 
            MONTH(fecha_inicio_reparacion) AS mes, 
            DATE_FORMAT(fecha_inicio_reparacion, '%Y-%m') AS periodo, 
            COUNT(*) AS total_reparaciones, 
            COUNT(CASE WHEN ciclo_activo = FALSE THEN 1 END) AS completadas, 
            ROUND(AVG(CASE WHEN ciclo_activo = FALSE THEN tiempo_reparacion_horas END), 2) AS promedio_horas, 
            SUM(CASE WHEN motivo_entrada = 'Falla de Troquel' THEN 1 ELSE 0 END) AS por_falla, 
            SUM(CASE WHEN motivo_entrada = 'Limpieza General' THEN 1 ELSE 0 END) AS por_limpieza, 
            SUM(CASE WHEN motivo_entrada = 'Cambio de Modelo' THEN 1 ELSE 0 END) AS por_cambio_modelo 
        FROM tbl_ciclos_reparacion 
        WHERE YEAR(fecha_inicio_reparacion) = ? 
        GROUP BY YEAR(fecha_inicio_reparacion), MONTH(fecha_inicio_reparacion) 
        ORDER BY anio DESC, mes DESC 
    ");

  $stmt->execute([$year]);
  $resumen = $stmt->fetchAll(PDO::FETCH_ASSOC);
  echo json_encode($resumen);
}