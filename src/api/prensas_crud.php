
<?php 

/** 

 * API para gestión de Prensas - CRUD Completo 

 * Endpoint: /api/prensas_crud.php 

 *  

 * Métodos soportados: 

 * - GET: Obtener todas las prensas o una específica por ID 

 * - POST: Crear nueva prensa 

 * - PUT: Actualizar prensa existente 

 * - DELETE: Eliminar prensa 

 */ 

 

// Headers CORS 

header('Access-Control-Allow-Origin: http://localhost:5173'); 

header('Access-Control-Allow-Credentials: true'); 

header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS'); 

header('Access-Control-Allow-Headers: Content-Type, Authorization'); 

header('Content-Type: application/json; charset=UTF-8'); 

 

// Manejar preflight requests 

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { 

    http_response_code(200); 

    exit(); 

} 

 

// Configuración de la base de datos 

$host = 'localhost'; 

$dbname = 'ekanban_toolroom_db'; 

$username = 'root'; 

$password = ''; 

 

try { 

    $pdo = new PDO( 

        "mysql:host=$host;dbname=$dbname;charset=utf8mb4", 

        $username, 

        $password, 

        [ 

            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, 

            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC, 

            PDO::ATTR_EMULATE_PREPARES => false 

        ] 

    ); 

} catch (PDOException $e) { 

    http_response_code(500); 

    echo json_encode([ 

        'success' => false, 

        'message' => 'Error de conexión a la base de datos', 

        'error' => $e->getMessage() 

    ]); 

    exit(); 

} 

 

$method = $_SERVER['REQUEST_METHOD']; 

 

switch ($method) { 

    case 'GET': 

        handleGet($pdo); 

        break; 

    case 'POST': 

        handlePost($pdo); 

        break; 

    case 'PUT': 

        handlePut($pdo); 

        break; 

    case 'DELETE': 

        handleDelete($pdo); 

        break; 

    default: 

        http_response_code(405); 

        echo json_encode([ 

            'success' => false, 

            'message' => 'Método no permitido' 

        ]); 

        break; 

} 

 

/** 

 * GET - Obtener prensas 

 */ 

function handleGet($pdo) { 

    try { 

        // Verificar si se solicita una prensa específica 

        $id = isset($_GET['id']) ? intval($_GET['id']) : null; 

        $estado = isset($_GET['estado']) ? $_GET['estado'] : null; 

         

        if ($id) { 

            // Obtener prensa específica 

            $stmt = $pdo->prepare("SELECT * FROM tbl_prensas WHERE id_prensa = ?"); 

            $stmt->execute([$id]); 

            $prensa = $stmt->fetch(); 

             

            if ($prensa) { 

                echo json_encode([ 

                    'success' => true, 

                    'data' => $prensa 

                ]); 

            } else { 

                http_response_code(404); 

                echo json_encode([ 

                    'success' => false, 

                    'message' => 'Prensa no encontrada' 

                ]); 

            } 

        } else { 

            // Obtener todas las prensas con filtro opcional 

            $sql = "SELECT * FROM tbl_prensas"; 

            $params = []; 

             

            if ($estado) { 

                $sql .= " WHERE estado = ?"; 

                $params[] = $estado; 

            } 

             

            $sql .= " ORDER BY identificador_prensa ASC"; 

             

            $stmt = $pdo->prepare($sql); 

            $stmt->execute($params); 

            $prensas = $stmt->fetchAll(); 

             

            echo json_encode($prensas); 

        } 

    } catch (PDOException $e) { 

        http_response_code(500); 

        echo json_encode([ 

            'success' => false, 

            'message' => 'Error al obtener prensas', 

            'error' => $e->getMessage() 

        ]); 

    } 

} 

 

/** 

 * POST - Crear nueva prensa 

 */ 

function handlePost($pdo) { 

    try { 

        $data = json_decode(file_get_contents('php://input'), true); 

         

        // Validaciones requeridas 

        if (empty($data['identificador_prensa'])) { 

            http_response_code(400); 

            echo json_encode([ 

                'success' => false, 

                'message' => 'El identificador de la prensa es requerido' 

            ]); 

            return; 

        } 

         

        if (empty($data['nombre'])) { 

            http_response_code(400); 

            echo json_encode([ 

                'success' => false, 

                'message' => 'El nombre de la prensa es requerido' 

            ]); 

            return; 

        } 

         

        // Verificar si ya existe una prensa con ese identificador 

        $checkStmt = $pdo->prepare("SELECT id_prensa FROM tbl_prensas WHERE identificador_prensa = ?"); 

        $checkStmt->execute([strtoupper(trim($data['identificador_prensa']))]); 

         

        if ($checkStmt->fetch()) { 

            http_response_code(409); 

            echo json_encode([ 

                'success' => false, 

                'message' => 'Ya existe una prensa con ese identificador' 

            ]); 

            return; 

        } 

         

        // Preparar datos para inserción 

        $sql = "INSERT INTO tbl_prensas ( 

            identificador_prensa, 

            nombre, 

            estado, 

            tonelaje, 

            marca, 

            modelo, 

            año_fabricacion, 

            numero_serie, 

            ubicacion, 

            velocidad_max, 

            carrera, 

            area_trabajo, 

            fecha_ultimo_mantenimiento, 

            notas, 

            creado_en, 

            actualizado_en 

        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())"; 

         

        $stmt = $pdo->prepare($sql); 

        $stmt->execute([ 

            strtoupper(trim($data['identificador_prensa'])), 

            trim($data['nombre']), 

            $data['estado'] ?? 'Activa', 

            $data['tonelaje'] ?? null, 

            $data['marca'] ?? null, 

            $data['modelo'] ?? null, 

            $data['año_fabricacion'] ?? null, 

            $data['numero_serie'] ?? null, 

            $data['ubicacion'] ?? null, 

            $data['velocidad_max'] ?? null, 

            $data['carrera'] ?? null, 

            $data['area_trabajo'] ?? null, 

            !empty($data['fecha_ultimo_mantenimiento']) ? $data['fecha_ultimo_mantenimiento'] : null, 

            $data['notas'] ?? null 

        ]); 

         

        $newId = $pdo->lastInsertId(); 

         

        http_response_code(201); 

        echo json_encode([ 

            'success' => true, 

            'message' => 'Prensa registrada exitosamente', 

            'id_prensa' => $newId, 

            'identificador_prensa' => strtoupper(trim($data['identificador_prensa'])) 

        ]); 

         

    } catch (PDOException $e) { 

        http_response_code(500); 

        echo json_encode([ 

            'success' => false, 

            'message' => 'Error al crear la prensa', 

            'error' => $e->getMessage() 

        ]); 

    } 

} 

 

/** 

 * PUT - Actualizar prensa existente 

 */ 

function handlePut($pdo) { 

    try { 

        $data = json_decode(file_get_contents('php://input'), true); 

         

        // Validar ID 

        if (empty($data['id_prensa'])) { 

            http_response_code(400); 

            echo json_encode([ 

                'success' => false, 

                'message' => 'El ID de la prensa es requerido para actualizar' 

            ]); 

            return; 

        } 

         

        // Verificar que la prensa existe 

        $checkStmt = $pdo->prepare("SELECT id_prensa FROM tbl_prensas WHERE id_prensa = ?"); 

        $checkStmt->execute([$data['id_prensa']]); 

         

        if (!$checkStmt->fetch()) { 

            http_response_code(404); 

            echo json_encode([ 

                'success' => false, 

                'message' => 'Prensa no encontrada' 

            ]); 

            return; 

        } 

         

        // Construir query de actualización dinámica 

        $updates = []; 

        $params = []; 

         

        $allowedFields = [ 

            'nombre', 'estado', 'tonelaje', 'marca', 'modelo', 

            'año_fabricacion', 'numero_serie', 'ubicacion', 

            'velocidad_max', 'carrera', 'area_trabajo', 

            'fecha_ultimo_mantenimiento', 'notas' 

        ]; 

         

        foreach ($allowedFields as $field) { 

            if (array_key_exists($field, $data)) { 

                $value = $data[$field]; 

                // Manejar campos vacíos para fechas 

                if ($field === 'fecha_ultimo_mantenimiento' && empty($value)) { 

                    $value = null; 

                } 

                $updates[] = "$field = ?"; 

                $params[] = $value; 

            } 

        } 

         

        if (empty($updates)) { 

            http_response_code(400); 

            echo json_encode([ 

                'success' => false, 

                'message' => 'No hay datos para actualizar' 

            ]); 

            return; 

        } 

         

        // Agregar timestamp de actualización 

        $updates[] = "actualizado_en = NOW()"; 

        $params[] = $data['id_prensa']; 

         

        $sql = "UPDATE tbl_prensas SET " . implode(', ', $updates) . " WHERE id_prensa = ?"; 

         

        $stmt = $pdo->prepare($sql); 

        $stmt->execute($params); 

         

        echo json_encode([ 

            'success' => true, 

            'message' => 'Prensa actualizada exitosamente', 

            'rows_affected' => $stmt->rowCount() 

        ]); 

         

    } catch (PDOException $e) { 

        http_response_code(500); 

        echo json_encode([ 

            'success' => false, 

            'message' => 'Error al actualizar la prensa', 

            'error' => $e->getMessage() 

        ]); 

    } 

} 

 

/** 

 * DELETE - Eliminar prensa 

 */ 

function handleDelete($pdo) { 

    try { 

        $id = isset($_GET['id']) ? intval($_GET['id']) : null; 

         

        if (!$id) { 

            http_response_code(400); 

            echo json_encode([ 

                'success' => false, 

                'message' => 'El ID de la prensa es requerido' 

            ]); 

            return; 

        } 

         

        // Verificar que la prensa existe 

        $checkStmt = $pdo->prepare("SELECT identificador_prensa FROM tbl_prensas WHERE id_prensa = ?"); 

        $checkStmt->execute([$id]); 

        $prensa = $checkStmt->fetch(); 

         

        if (!$prensa) { 

            http_response_code(404); 

            echo json_encode([ 

                'success' => false, 

                'message' => 'Prensa no encontrada' 

            ]); 

            return; 

        } 

         

        // Verificar si hay troqueles asignados a esta prensa 

        $checkTroquelesStmt = $pdo->prepare( 

            "SELECT COUNT(*) as count FROM tbl_troqueles WHERE prensa_asignada = ?" 

        ); 

        $checkTroquelesStmt->execute([$prensa['identificador_prensa']]); 

        $troquelesCount = $checkTroquelesStmt->fetch()['count']; 

         

        if ($troquelesCount > 0) { 

            // Opcionalmente, actualizar los troqueles para quitar la asignación 

            $updateTroquelesStmt = $pdo->prepare( 

                "UPDATE tbl_troqueles SET prensa_asignada = NULL WHERE prensa_asignada = ?" 

            ); 

            $updateTroquelesStmt->execute([$prensa['identificador_prensa']]); 

        } 

         

        // Eliminar la prensa 

        $deleteStmt = $pdo->prepare("DELETE FROM tbl_prensas WHERE id_prensa = ?"); 

        $deleteStmt->execute([$id]); 

         

        echo json_encode([ 

            'success' => true, 

            'message' => 'Prensa eliminada exitosamente', 

            'troqueles_desasignados' => $troquelesCount 

        ]); 

         

    } catch (PDOException $e) { 

        http_response_code(500); 

        echo json_encode([ 

            'success' => false, 

            'message' => 'Error al eliminar la prensa', 

            'error' => $e->getMessage() 

        ]); 

    } 

} 

?> 

 