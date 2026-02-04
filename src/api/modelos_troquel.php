<?php

header('Content-Type: application/json; charset=UTF-8'); 
header('Access-Control-Allow-Origin: *'); 
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS'); 
header('Access-Control-Allow-Headers: Content-Type, Authorization'); 
header('Access-Control-Allow-Credentials: true'); 

require_once 'cors.php'; 
require_once 'db_config.php'; 

//manejar preflight requests 
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { 
    http_response_code(200); 
    exit(); 
} 

//incluir conexion a baes de datos
try { 
    $conn = getDBConnection(); 

} catch (Exception $e) { 
    http_response_code(500); 
    echo json_encode(['success' => false, 'message' => 'Error de conexión a la base de datos']); 
    exit(); 
} 

$method = $_SERVER['REQUEST_METHOD']; 

switch ($method) { 
    case 'GET': 
        getModelos($conn); 
        break; 
    case 'POST': 
        createModelo($conn); 
        break; 
    case 'PUT': 
        updateModelo($conn); 
        break; 
    case 'DELETE': 
        deleteModelo($conn); 
        break; 
    default: 
        http_response_code(405); 
        echo json_encode(['success' => false, 'message' => 'Método no permitido']); 
        break; 
} 

function getModelos($conn) { 
    try { 
        $sql = "SELECT  
                    m.id_modelo, 
                    m.nombre_modelo, 
                    m.troquel_id, 
                    m.descripcion, 
                    m.creado_en, 
                    m.actualizado_en, 
                    t.nombre as troquel_nombre 
                FROM tbl_modelos_troquel m 
                LEFT JOIN tbl_troqueles t ON m.troquel_id = t.id_troquel"; 
        $params = []; 

        // Filtrar por troquel si se proporciona 
        if (isset($_GET['troquel_id']) && !empty($_GET['troquel_id'])) { 
            $sql .= " WHERE m.troquel_id = troquel_id"; 
            $params['troquel_id'] = $_GET['troquel_id']; 
        } 

        $sql .= " ORDER BY m.nombre_modelo ASC"; 
        $stmt = $conn->prepare($sql); 
        foreach ($params as $key => $value) { 
            $stmt->bindParam($key, $value); 
        } 
        $stmt->execute(); 

        $resultSet=$stmt->get_result();
        $modelos = $resultSet->fetch_all(MYSQLI_ASSOC); 

        http_response_code(200); 
        echo json_encode($modelos); 

    } catch (PDOException $e) { 
        http_response_code(500); 
        echo json_encode(['success' => false, 'message' => 'Error al obtener modelos: ' . $e->getMessage()]); 
    } 
} 

function createModelo($conn) { 
    try { 
        $data = json_decode(file_get_contents('php://input'), true); 

        // Validaciones 
        if (empty($data['nombre_modelo'])) { 
            http_response_code(400); 
            echo json_encode(['success' => false, 'message' => 'El nombre del modelo es requerido']); 
            return; 
        } 

        if (empty($data['troquel_id'])) { 
            http_response_code(400); 
            echo json_encode(['success' => false, 'message' => 'El troquel es requerido']); 
            return; 
        } 

        // Verificar que el troquel existe 
        $checkTroquel = $conn->prepare("SELECT id_troquel FROM tbl_troqueles WHERE id_troquel = :id"); 
        $checkTroquel->bindParam(':id', $data['troquel_id']); 
        $checkTroquel->execute(); 

        if ($checkTroquel->rowCount() === 0) { 
            http_response_code(400); 
            echo json_encode(['success' => false, 'message' => 'El troquel especificado no existe']); 
            return; 
        } 

        // Verificar que no exista un modelo con el mismo nombre para el mismo troquel 
        $checkDuplicate = $conn->prepare("SELECT id_modelo FROM tbl_modelos_troquel WHERE nombre_modelo = :nombre AND troquel_id = :troquel_id"); 
        $checkDuplicate->bindParam(':nombre', $data['nombre_modelo']); 
        $checkDuplicate->bindParam(':troquel_id', $data['troquel_id']); 
        $checkDuplicate->execute(); 

        if ($checkDuplicate->rowCount() > 0) { 
            http_response_code(400); 
            echo json_encode(['success' => false, 'message' => 'Ya existe un modelo con ese nombre para este troquel']); 
            return; 
        } 

        // Insertar modelo 
        $sql = "INSERT INTO tbl_modelos_troquel (nombre_modelo, troquel_id, descripcion)  
                VALUES (:nombre_modelo, :troquel_id, :descripcion)"; 
        $stmt = $conn->prepare($sql); 
        $stmt->bindParam(':nombre_modelo', $data['nombre_modelo']); 
        $stmt->bindParam(':troquel_id', $data['troquel_id']); 
        $stmt->bindParam(':descripcion', $data['descripcion'] ?? null); 

        if ($stmt->execute()) { 
            $lastId = $conn->lastInsertId(); 
            http_response_code(201); 
            echo json_encode([ 
                'success' => true, 
                'message' => 'Modelo creado exitosamente', 
                'id_modelo' => $lastId 
            ]); 
        } else { 
            throw new Exception('Error al crear el modelo'); 
        } 

    } catch (PDOException $e) { 
        http_response_code(500); 
        echo json_encode(['success' => false, 'message' => 'Error al crear modelo: ' . $e->getMessage()]); 
    } 
} 

function updateModelo($conn) { 
    try { 
        $data = json_decode(file_get_contents('php://input'), true); 
        if (empty($data['id_modelo'])) { 
            http_response_code(400); 
            echo json_encode(['success' => false, 'message' => 'El ID del modelo es requerido']); 
            return; 
        } 

        if (empty($data['nombre_modelo'])) { 
            http_response_code(400); 
            echo json_encode(['success' => false, 'message' => 'El nombre del modelo es requerido']); 
            return; 
        } 

        if (empty($data['troquel_id'])) { 
            http_response_code(400); 
            echo json_encode(['success' => false, 'message' => 'El troquel es requerido']); 
            return; 
        } 

        // Verificar que el modelo existe 
        $checkModelo = $conn->prepare("SELECT id_modelo FROM tbl_modelos_troquel WHERE id_modelo = :id"); 
        $checkModelo->bindParam(':id', $data['id_modelo']); 
        $checkModelo->execute(); 

        if ($checkModelo->rowCount() === 0) { 
            http_response_code(404); 
            echo json_encode(['success' => false, 'message' => 'Modelo no encontrado']); 
            return; 
        } 

        // Verificar que no exista otro modelo con el mismo nombre para el mismo troquel 
        $checkDuplicate = $conn->prepare("SELECT id_modelo FROM tbl_modelos_troquel WHERE nombre_modelo = :nombre AND troquel_id = :troquel_id AND id_modelo != :id_modelo"); 
        $checkDuplicate->bindParam(':nombre', $data['nombre_modelo']); 
        $checkDuplicate->bindParam(':troquel_id', $data['troquel_id']); 
        $checkDuplicate->bindParam(':id_modelo', $data['id_modelo']); 
        $checkDuplicate->execute(); 

        if ($checkDuplicate->rowCount() > 0) { 
            http_response_code(400); 
            echo json_encode(['success' => false, 'message' => 'Ya existe otro modelo con ese nombre para este troquel']); 
            return; 
        } 

        // Actualizar modelo 
        $sql = "UPDATE tbl_modelos_troquel  
                SET nombre_modelo = :nombre_modelo,  
                    troquel_id = :troquel_id,  
                    descripcion = :descripcion, 
                    actualizado_en = NOW() 
                WHERE id_modelo = :id_modelo"; 
        $stmt = $conn->prepare($sql); 
        $stmt->bindParam(':nombre_modelo', $data['nombre_modelo']); 
        $stmt->bindParam(':troquel_id', $data['troquel_id']); 
        $stmt->bindParam(':descripcion', $data['descripcion'] ?? null); 
        $stmt->bindParam(':id_modelo', $data['id_modelo']); 

        if ($stmt->execute()) { 
            http_response_code(200); 
            echo json_encode([ 
                'success' => true, 
                'message' => 'Modelo actualizado exitosamente' 
            ]); 
        } else { 
            throw new Exception('Error al actualizar el modelo'); 
        } 

    } catch (PDOException $e) { 
        http_response_code(500); 
        echo json_encode(['success' => false, 'message' => 'Error al actualizar modelo: ' . $e->getMessage()]); 
    } 
} 

function deleteModelo($conn) { 
    try { 
        if (empty($_GET['id'])) { 
            http_response_code(400); 
            echo json_encode(['success' => false, 'message' => 'El ID del modelo es requerido']); 
            return; 
        } 

        $id = $_GET['id']; 

        // Verificar que el modelo existe 
        $checkModelo = $conn->prepare("SELECT id_modelo FROM tbl_modelos_troquel WHERE id_modelo = :id"); 
        $checkModelo->bindParam(':id', $id); 
        $checkModelo->execute(); 

        if ($checkModelo->rowCount() === 0) { 
            http_response_code(404); 
            echo json_encode(['success' => false, 'message' => 'Modelo no encontrado']); 
            return; 
        } 

        // Eliminar modelo 
        $sql = "DELETE FROM tbl_modelos_troquel WHERE id_modelo = :id"; 
        $stmt = $conn->prepare($sql); 
        $stmt->bindParam(':id', $id); 

        if ($stmt->execute()) { 
            http_response_code(200); 
            echo json_encode([ 
                'success' => true, 
                'message' => 'Modelo eliminado exitosamente' 
            ]); 
        } else { 
            throw new Exception('Error al eliminar el modelo'); 
        } 

    } catch (PDOException $e) { 
        http_response_code(500); 
        echo json_encode(['success' => false, 'message' => 'Error al eliminar modelo: ' . $e->getMessage()]); 
    } 
} 
?>