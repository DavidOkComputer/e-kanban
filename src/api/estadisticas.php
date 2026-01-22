<?php 
// api estadisticas.php  para obtener las estadisticas 
require_once 'estadisticas.php';
require_once 'db_config.php'; 
 
$conn = getDBConnection(); 

if (!$conn) { 
    http_response_code(500); 
    echo json_encode(['success' => false, 'message' => 'Database connection failed']); 
    exit(); 
} 

try { 
    $stats = []; 

    //cuenta total de roqueles
    $result = $conn->query("SELECT COUNT(*) as total FROM tbl_troqueles"); 
    $stats['total'] = (int)$result->fetch_assoc()['total']; 

    //cuenta dependiendo del estatus
    $result = $conn->query(" 
        SELECT estado, COUNT(*) as count  
        FROM tbl_troqueles  
        GROUP BY estado
    "); 
     
    $stats['by_status'] = []; 
    while ($row = $result->fetch_assoc()) { 
        $stats['by_status'][$row['status']] = (int)$row['count']; 
    } 

    // Activos los que estan En prensa + Listo
    $stats['activos'] = ($stats['by_status']['En prensa'] ?? 0) + ($stats['by_status']['Listo'] ?? 0); 
    $stats['reparando'] = $stats['by_status']['Reparando'] ?? 0; 
    $stats['pendientes'] = $stats['by_status']['Pendiente'] ?? 0; 
     
    //cuenta por año
    $result = $conn->query(" 
        SELECT año, COUNT(*) as count  
        FROM tbl_troqueles  
        GROUP BY año  
        ORDER BY año DESC 
    "); 

    $stats['by_year'] = []; 

    while ($row = $result->fetch_assoc()) { 
        $stats['by_year'][$row['year']] = (int)$row['count']; 
    } 
    echo json_encode($stats); 

} catch (Exception $e) { 
    http_response_code(500); 
    echo json_encode(['success' => false, 'message' => $e->getMessage()]); 
} finally { 
    $conn->close(); 
} 