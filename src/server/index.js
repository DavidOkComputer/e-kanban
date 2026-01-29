const express = require('express'); 
const mysql = require('mysql2/promise'); 
const cors = require('cors'); 
require('dotenv').config(); 
const app = express(); 
const PORT = process.env.PORT || 3001; 

// Middleware   
app.use(cors({ 
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'], 
  credentials: true, 
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'], 
  allowedHeaders: ['Content-Type', 'Authorization'] 
})); 

app.use(express.json()); 

// Conexión a la base de datos   
const pool = mysql.createPool({ 
  host: process.env.DB_HOST || '127.0.0.1', 
  port: process.env.DB_PORT || 3306, 
  user: process.env.DB_USER || 'root', 
  password: process.env.DB_PASSWORD || '', 
  database: process.env.DB_NAME || 'ekanban_toolroom_db', 
  waitForConnections: true, 
  connectionLimit: 10, 
  queueLimit: 0 
}); 

app.get('/api/health', async (req, res) => { 
  try { 
    const [rows] = await pool.query('SELECT 1'); 
    res.json({ 
      status: 'OK', 
      database: 'Connected' 
    }); 
  } catch (error) { 
    res.status(500).json({ 
      status: 'Error', 
      message: error.message 
    }); 
  } 
}); 

app.get('/api/prensas', async (req, res) => { 
  try { 
    const [tables] = await pool.query("SHOW TABLES LIKE 'tbl_prensas'"); 
    if (tables.length > 0) { 
      const [prensas] = await pool.query( 
        "SELECT id_prensa, nombre, descripcion, estado, tonelaje FROM tbl_prensas WHERE estado = 'activa' ORDER BY nombre ASC" 
      ); 

      const options = [{ 
        value: '', 
        label: 'Sin asignar' 
      }]; 

      prensas.forEach(p => { 
        options.push({ 
          value: p.id_prensa, 
          label: p.nombre + (p.tonelaje ? ` (${p.tonelaje} ton)` : ''), 
          descripcion: p.descripcion 
        }); 
      }); 
      res.json(options); 
    } else { 
      res.json([ 
        { value: '', label: 'Sin asignar' }, 
        { value: 'P1', label: 'Prensa 1 (P1)' }, 
        { value: 'P2', label: 'Prensa 2 (P2)' }, 
        { value: 'P3', label: 'Prensa 3 (P3)' }, 
        { value: 'P4', label: 'Prensa 4 (P4)' }, 
        { value: 'P5', label: 'Prensa 5 (P5)' }, 
        { value: 'P6', label: 'Prensa 6 (P6)' }, 
        { value: 'P7', label: 'Prensa 7 (P7)' }, 
        { value: 'P8', label: 'Prensa 8 (P8)' } 
      ]); 
    } 
  } catch (error) { 
    console.error('Error fetching prensas:', error); 
    res.status(500).json({ 
      success: false, 
      message: error.message 
    }); 
  } 
}); 

app.get('/api/tipos_troquel', async (req, res) => { 
  try { 
    const [tables] = await pool.query("SHOW TABLES LIKE 'tbl_tipos_troquel'"); 
    if (tables.length > 0) { 
      const [tipos] = await pool.query( 
        "SELECT id_tipo_troquel as id, codigo, nombre, descripcion FROM tbl_tipos_troquel WHERE activo = 1 ORDER BY nombre ASC" 
      ); 
      const options = tipos.map(t => ({ 
        value: t.codigo || t.id, 
        label: t.nombre, 
        descripcion: t.descripcion 
      })); 
      res.json(options); 
    } else { 
      res.json([ 
        { value: 'progresivo', label: 'Progresivo', descripcion: 'Troquel de estaciones progresivas' }, 
        { value: 'transfer', label: 'Transfer', descripcion: 'Troquel tipo transfer' }, 
        { value: 'compound', label: 'Compound', descripcion: 'Troquel compuesto' }, 
        { value: 'simple', label: 'Simple', descripcion: 'Troquel de operación simple' } 
      ]); 
    } 
  } catch (error) { 
    console.error('Error fetching tipos_troquel:', error); 
    res.status(500).json({ 
      success: false, 
      message: error.message 
    }); 
  } 
}); 

app.get('/api/estados', async (req, res) => { 
  try { 
    const [tables] = await pool.query("SHOW TABLES LIKE 'tbl_estados'"); 
    if (tables.length > 0) { 
      const [estados] = await pool.query( 
        "SELECT id_estado as id, codigo, nombre, color, descripcion FROM tbl_estados WHERE activo = 1 ORDER BY orden ASC, nombre ASC" 
      ); 
      const options = estados.map(e => ({ 
        value: e.codigo || e.nombre, 
        label: e.nombre, 
        color: e.color, 
        descripcion: e.descripcion 
      })); 
      res.json(options); 
    } else { 
      res.json([ 
        { value: 'Pendiente', label: 'Pendiente', color: '#ff6b6b' }, 
        { value: 'En prensa', label: 'En Prensa', color: '#00ff88' }, 
        { value: 'Listo', label: 'Listo', color: '#64ff64' }, 
        { value: 'Listo-BackUp', label: 'Listo - BackUp', color: '#00c8ff' }, 
        { value: 'Reparando', label: 'Reparando', color: '#ffc800' }, 
        { value: 'Baja', label: 'Baja / Obsoleto', color: '#888888' } 
      ]); 
    } 
  } catch (error) { 
    console.error('Error fetching estados:', error); 
    res.status(500).json({ 
      success: false, 
      message: error.message 
    }); 
  } 
}); 

// Endpoint para asistencia en prensa (motivos) 
app.get('/api/asistencia-prensa', async (req, res) => { 
  try { 
    const [tables] = await pool.query("SHOW TABLES LIKE 'tbl_asistencia_prensa'"); 
    if (tables.length > 0) { 
      const [asistencias] = await pool.query( 
        "SELECT id_asistencia_prensa as id, descripcion FROM tbl_asistencia_prensa WHERE activo = 1 ORDER BY descripcion ASC" 
      ); 
      res.json(asistencias.map(a => ({ 
        id: a.id, 
        description: a.descripcion 
      }))); 
    } else { 
      res.json([ 
        { id: 1, description: 'Mantenimiento' }, 
        { id: 2, description: 'Ajuste' }, 
        { id: 3, description: 'Cambio de Modelo' }, 
        { id: 4, description: 'Falla Mecánica' }, 
        { id: 5, description: 'Otro' } 
      ]); 
    } 

  } catch (error) { 
    console.error('Error fetching asistencia_prensa:', error); 
    res.status(500).json({ 
      success: false, 
      message: error.message 
    }); 
  } 
}); 

app.get('/api/troqueles', async (req, res) => { 
  try { 
    const [troqueles] = await pool.query(`   
      SELECT * FROM tbl_troqueles    
      ORDER BY año DESC, id_troquel   
    `); 
    const groupedByYear = {}; 
    troqueles.forEach(t => { 
      const year = t.año; 
      if (!groupedByYear[year]) { 
        groupedByYear[year] = []; 
      } 
      groupedByYear[year].push({ 
        id: t.id_troquel, 
        name: t.nombre, 
        status: t.estado, 
        model: t.modelo, 
        golpes: t.golpes, 
        golpesAcum: t.golpes_acum, 
        capacidadGolpes: t.capacidad_golpes, 
        rectificaciones: t.rectificaciones, 
        tipoTroquel: t.tipo_troquel, 
        ubicacion: t.ubicacion, 
        prensaAsignada: t.prensa_asignada, 
        imageUrl: t.image_url, 
        numeroSerie: t.numero_serie, 
        proveedor: t.proveedor, 
        pesoKg: t.peso_kg, 
        dimensiones: t.dimensiones, 
        materialBase: t.material_base, 
        numEstaciones: t.num_estaciones, 
        cavidades: t.cavidades, 
        color: t.color, 
        ciclos: t.ciclos, 
        nParte1: t.n_parte_1, 
        nParte2: t.n_parte_2, 
        nParte3: t.n_parte_3, 
        nParte4: t.n_parte_4, 
        nParte5: t.n_parte_5, 
        nParte6: t.n_parte_6, 
        comentarios: t.comentarios 
      }); 
    }); 
    res.json(groupedByYear); 
  } catch (error) { 
    console.error('Error fetching troqueles:', error); 
    res.status(500).json({ 
      success: false, 
      message: error.message 
    }); 
  } 
}); 

app.get('/api/troqueles/list', async (req, res) => { 
  try { 
    const [troqueles] = await pool.query(`   
      SELECT * FROM tbl_troqueles    
      ORDER BY creado_en DESC   
    `); 
    res.json(troqueles); 
  } catch (error) { 
    console.error('Error fetching troqueles list:', error); 
    res.status(500).json({ 
      success: false, 
      message: error.message 
    }); 
  } 
}); 

app.get('/api/troqueles/search', async (req, res) => { 
  try { 
    const { year, status, search } = req.query; 
    let sql = "SELECT * FROM tbl_troqueles WHERE 1=1"; 
    const params = []; 

    if (year) { 
      sql += " AND año = ?"; 
      params.push(parseInt(year)); 
    } 

    if (status) { 
      sql += " AND estado = ?"; 
      params.push(status); 
    } 

    if (search) { 
      sql += " AND (id_troquel LIKE ? OR nombre LIKE ? OR modelo LIKE ?)"; 
      const searchTerm = `%${search}%`; 
      params.push(searchTerm, searchTerm, searchTerm); 
    } 

    sql += " ORDER BY creado_en DESC"; 
    const [troqueles] = await pool.query(sql, params); 
    res.json(troqueles); 
  } catch (error) { 
    console.error('Error searching troqueles:', error); 
    res.status(500).json({ 
      success: false, 
      message: error.message 
    }); 
  } 
}); 

app.get('/api/troqueles/:id', async (req, res) => { 
  try { 
    const [troqueles] = await pool.query( 
      'SELECT * FROM tbl_troqueles WHERE id_troquel = ?', 
      [req.params.id] 
    ); 
    if (troqueles.length === 0) { 
      return res.status(404).json({ 
        success: false, 
        message: 'Troquel no encontrado' 
      }); 
    } 
    res.json(troqueles[0]); 
  } catch (error) { 
    console.error('Error fetching troquel:', error); 
    res.status(500).json({ 
      success: false, 
      message: error.message 
    }); 
  } 
}); 

//obtener los ciclos de reparacion para el troquel
app.get('/api/troqueles/:id/ciclo-activo', async (req, res) => { 
  try { 
    const [rows] = await pool.query(` 
      SELECT  
        cr.*, 
        TIMESTAMPDIFF(MINUTE, cr.fecha_inicio_reparacion, NOW()) AS minutos_transcurridos, 
        TIMESTAMPDIFF(HOUR, cr.fecha_inicio_reparacion, NOW()) AS horas_transcurridas, 
        TIMESTAMPDIFF(DAY, cr.fecha_inicio_reparacion, NOW()) AS dias_transcurridos 
      FROM tbl_ciclos_reparacion cr 
      WHERE cr.troquel_id = ? AND cr.ciclo_activo = TRUE 
      ORDER BY cr.fecha_inicio_reparacion DESC 
      LIMIT 1 
    `, [req.params.id]); 

    if (rows.length === 0) { 
      return res.json({ ciclo: null, message: 'No active repair cycle found' }); 
    } 

    //obtener a los tecnicos para el ciclo
    const [tecnicos] = await pool.query(` 
      SELECT * FROM tbl_tecnicos_ciclo  
      WHERE ciclo_id = ? 
      ORDER BY fecha_inicio ASC 
    `, [rows[0].id]); 

    res.json({  
      ciclo: rows[0], 
      tecnicos: tecnicos 
    }); 

  } catch (error) { 

    console.error('Error fetching active cycle:', error); 

    res.status(500).json({ error: 'Failed to fetch active repair cycle' }); 

  } 

}); 

 

//obtener el historial de reparacion para el troquel
app.get('/api/troqueles/:id/ciclos-historial', async (req, res) => { 
  try { 
    const limit = parseInt(req.query.limit) || 20; 
    const [rows] = await pool.query(` 
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
    `, [req.params.id, limit]); 
    res.json(rows); 
  } catch (error) { 
    console.error('Error fetching repair history:', error); 
    res.status(500).json({ error: 'Failed to fetch repair history' }); 
  } 
}); 

//obtener las estadisticas del troquel
app.get('/api/troqueles/:id/estadisticas', async (req, res) => { 
  try { 
    const [stats] = await pool.query(` 
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
    `, [req.params.id]); 

    res.json(stats[0] || { 
      total_reparaciones: 0, 
      reparaciones_completadas: 0, 
      promedio_horas_reparacion: null 
    }); 
  } catch (error) { 
    console.error('Error fetching statistics:', error); 
    res.status(500).json({ error: 'Failed to fetch statistics' }); 
  } 
}); 

//obtener todas las reparaciones activas
app.get('/api/reparaciones-activas', async (req, res) => { 
  try { 
    const [rows] = await pool.query(` 
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
        cr.fecha_bajado, 
        cr.fecha_recepcion_taller, 
        cr.fecha_inicio_trabajo, 
        TIMESTAMPDIFF(HOUR, cr.fecha_inicio_reparacion, NOW()) AS horas_en_reparacion, 
        TIMESTAMPDIFF(DAY, cr.fecha_inicio_reparacion, NOW()) AS dias_en_reparacion 
      FROM tbl_ciclos_reparacion cr 
      WHERE cr.ciclo_activo = TRUE 
      ORDER BY cr.prioridad ASC, cr.fecha_inicio_reparacion ASC 
    `); 

    //obtener tecnicos para cada reparacion activa
    for (let row of rows) { 
      const [tecnicos] = await pool.query(` 
        SELECT empleado_nombre, grupo, tipo  
        FROM tbl_tecnicos_ciclo  
        WHERE ciclo_id = ? AND fecha_fin IS NULL 
      `, [row.id]); 
      row.tecnicos = tecnicos; 
    } 
    res.json(rows); 
  } catch (error) { 
    console.error('Error fetching active repairs:', error); 
    res.status(500).json({ error: 'Failed to fetch active repairs' }); 
  } 
}); 

//obtener resumen mensual
app.get('/api/resumen-mensual', async (req, res) => { 
  try { 
    const year = req.query.year || new Date().getFullYear(); 
    const [rows] = await pool.query(` 
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
    `, [year]); 
    res.json(rows); 
  } catch (error) { 
    console.error('Error fetching monthly summary:', error); 
    res.status(500).json({ error: 'Failed to fetch monthly summary' }); 
  } 
}); 

//empezar un nuevo ciclo de reparacion
app.post('/api/troqueles/:id/iniciar-ciclo', async (req, res) => { 
  const connection = await pool.getConnection(); 
  try { 
    await connection.beginTransaction(); 
    const { 
      troquel_nombre, 
      modelo, 
      motivo_entrada, 
      falla_id, 
      falla_descripcion, 
      folio, 
      empleado, 
      comentarios, 
      status_anterior, 
      prensa_origen, 
      nivel, 
      grupo, 
      prioridad 
    } = req.body; 

    //revisar si ya hay un ciclo activo
    const [existing] = await connection.query(` 
      SELECT id FROM tbl_ciclos_reparacion  
      WHERE troquel_id = ? AND ciclo_activo = TRUE 
    `, [req.params.id]); 

    if (existing.length > 0) { 
      await connection.rollback(); 
      return res.status(400).json({  
        error: 'Active repair cycle already exists', 
        ciclo_id: existing[0].id  
      }); 
    } 

    //insertar nuevo ciclo de reparacion
    const [result] = await connection.query(` 
      INSERT INTO tbl_ciclos_reparacion ( 
        troquel_id, troquel_nombre, modelo, 
        fecha_inicio_reparacion, motivo_entrada, 
        falla_id, falla_descripcion, 
        folio_entrada, empleado_registro, comentarios_entrada, 
        status_anterior, prensa_origen, 
        nivel_reparacion, grupo_reparacion, prioridad, 
        fecha_bajado, ciclo_activo 
      ) VALUES (?, ?, ?, NOW(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), TRUE) 
    `, [ 
      req.params.id, troquel_nombre, modelo, 
      motivo_entrada, falla_id || null, falla_descripcion || null, 
      folio, empleado, comentarios || null, 
      status_anterior || 'En prensa', prensa_origen || null, 
      nivel || null, grupo || null, prioridad || 3 
    ]); 

    //actualizar el estado del troquel a reparando
    await connection.query(` 
      UPDATE tbl_troqueles SET estado = 'Reparando' WHERE id_troquel = ? 
    `, [req.params.id]); 
    await connection.commit(); 
    res.json({  
      success: true,  
      ciclo_id: result.insertId, 
      message: 'Repair cycle started successfully' 
    }); 
  } catch (error) { 
    await connection.rollback(); 
    console.error('Error starting repair cycle:', error); 
    res.status(500).json({ error: 'Failed to start repair cycle' }); 
  } finally { 
    connection.release(); 
  } 
}); 

//actualizar el paso de proceso de reparacion
app.post('/api/ciclos/:id/actualizar-paso', async (req, res) => { 
  try { 
    const { paso } = req.body; 
    let field; 
    switch (paso) { 
      case 'recepcion': 
        field = 'fecha_recepcion_taller'; 
        break; 
      case 'inicio': 
        field = 'fecha_inicio_trabajo'; 
        break; 
      case 'termino': 
        field = 'fecha_termino_trabajo'; 
        break; 
      default: 
        return res.status(400).json({ error: 'Invalid step' }); 
    } 
    await pool.query(` 
      UPDATE tbl_ciclos_reparacion  
      SET ${field} = NOW() 
      WHERE id = ? AND ciclo_activo = TRUE 
    `, [req.params.id]); 

    //obtener ciclo actualizado
    const [updated] = await pool.query(` 
      SELECT fecha_bajado, fecha_recepcion_taller, fecha_inicio_trabajo, fecha_termino_trabajo 
      FROM tbl_ciclos_reparacion WHERE id = ? 
    `, [req.params.id]); 
    res.json({  
      success: true,  
      proceso: updated[0] 
    }); 
  } catch (error) { 
    console.error('Error updating repair step:', error); 
    res.status(500).json({ error: 'Failed to update repair step' }); 
  } 
}); 

//agregar tecnico a ciclo de reparacion
app.post('/api/ciclos/:id/tecnicos', async (req, res) => { 
  try { 
    const { empleado_numero, empleado_nombre, grupo, tipo } = req.body; 
    const [result] = await pool.query(` 
      INSERT INTO tbl_tecnicos_ciclo (ciclo_id, empleado_numero, empleado_nombre, grupo, tipo) 
      VALUES (?, ?, ?, ?, ?) 
    `, [req.params.id, empleado_numero || null, empleado_nombre, grupo || null, tipo || 'Técnico']); 

    //obtener el tecnico insertado
    const [tecnico] = await pool.query(` 
      SELECT * FROM tbl_tecnicos_ciclo WHERE id = ? 
    `, [result.insertId]); 

    res.json({  
      success: true,  
      tecnico: tecnico[0] 
    }); 
  } catch (error) { 
    console.error('Error adding technician:', error); 
    res.status(500).json({ error: 'Failed to add technician' }); 
  } 
}); 

//remover el tecnico del ciclo de reparacion
app.delete('/api/tecnicos/:id', async (req, res) => { 
  try { 
    await pool.query(` 
      UPDATE tbl_tecnicos_ciclo SET fecha_fin = NOW() WHERE id = ? AND fecha_fin IS NULL 
    `, [req.params.id]); 
    res.json({ success: true }); 
  } catch (error) { 
    console.error('Error removing technician:', error); 
    res.status(500).json({ error: 'Failed to remove technician' }); 
  } 
}); 

//actualizar la prioridad de ciclo
app.post('/api/ciclos/:id/prioridad', async (req, res) => { 
  try { 
    const { prioridad } = req.body; 

    await pool.query(` 
      UPDATE tbl_ciclos_reparacion SET prioridad = ? WHERE id = ? 
    `, [prioridad, req.params.id]); 
    res.json({ success: true }); 
  } catch (error) { 
    console.error('Error updating priority:', error); 
    res.status(500).json({ error: 'Failed to update priority' }); 
  } 
}); 

//agregar detalle o falla al ciclo
app.post('/api/ciclos/:id/agregar-detalle', async (req, res) => { 
  try { 
    const { falla_id, falla_descripcion } = req.body; 

    //obtener la informacion de la falla
    const [current] = await pool.query(` 
      SELECT falla_descripcion FROM tbl_ciclos_reparacion WHERE id = ? 
    `, [req.params.id]); 

    //agregar nueva falla a la existente
    const newDescripcion = current[0].falla_descripcion  
      ? `${current[0].falla_descripcion}; ${falla_descripcion}` 
      : falla_descripcion; 
    await pool.query(` 
      UPDATE tbl_ciclos_reparacion  
      SET falla_id = COALESCE(falla_id, ?), falla_descripcion = ? 
      WHERE id = ? 
    `, [falla_id, newDescripcion, req.params.id]); 
    res.json({ success: true }); 
  } catch (error) { 
    console.error('Error adding detail:', error); 
    res.status(500).json({ error: 'Failed to add detail' }); 
  } 
}); 

//asignar el ciclo como pendiente, pendiente de reparar
app.post('/api/ciclos/:id/pendiente', async (req, res) => { 
  const connection = await pool.getConnection(); 
  try { 
    await connection.beginTransaction(); 
    const { fecha_liberacion, motivo, empleado } = req.body; 

    //obtener info del ciclo
    const [ciclo] = await connection.query(` 
      SELECT troquel_id FROM tbl_ciclos_reparacion WHERE id = ? 
    `, [req.params.id]); 
    if (ciclo.length === 0) { 
      await connection.rollback(); 
      return res.status(404).json({ error: 'Repair cycle not found' }); 
    } 

    //cerrar el ciclo actual con estado de pendiente
    await connection.query(` 
      UPDATE tbl_ciclos_reparacion 
      SET  
        fecha_fin_reparacion = NOW(), 
        status_salida = 'Pendiente', 
        empleado_cierre = ?, 
        comentarios_salida = ?, 
        ciclo_activo = FALSE 
      WHERE id = ? 
    `, [empleado, `Pendiente hasta: ${fecha_liberacion}. Motivo: ${motivo}`, req.params.id]); 

    //actualizar el estado del troquel a pendiente
    await connection.query(` 
      UPDATE tbl_troqueles SET estado = 'Pendiente' WHERE id_troquel = ? 
    `, [ciclo[0].troquel_id]); 
    await connection.commit(); 
    res.json({ success: true }); 
  } catch (error) { 
    await connection.rollback(); 
    console.error('Error setting pending:', error); 
    res.status(500).json({ error: 'Failed to set as pending' }); 
  } finally { 
    connection.release(); 
  } 
}); 

//cerrar el ciclo de reparacion
app.post('/api/ciclos/:id/cerrar', async (req, res) => { 
  const connection = await pool.getConnection(); 
  try { 
    await connection.beginTransaction(); 

    const { 
      status_salida, 
      empleado_cierre, 
      comentarios, 
      folio 
    } = req.body; 

    //obtener el ciclo para encontrar el id de troquel
    const [ciclo] = await connection.query(` 
      SELECT troquel_id FROM tbl_ciclos_reparacion WHERE id = ? AND ciclo_activo = TRUE 
    `, [req.params.id]); 

    if (ciclo.length === 0) { 
      await connection.rollback(); 
      return res.status(404).json({ error: 'Active repair cycle not found' }); 
    } 

    //cerrar el ciclo de reparacion
    await connection.query(` 
      UPDATE tbl_ciclos_reparacion 
      SET  
        fecha_fin_reparacion = NOW(), 
        status_salida = ?, 
        empleado_cierre = ?, 
        comentarios_salida = ?, 
        folio_salida = ?, 
        fecha_termino_trabajo = COALESCE(fecha_termino_trabajo, NOW()), 
        ciclo_activo = FALSE 
      WHERE id = ? AND ciclo_activo = TRUE 
    `, [status_salida, empleado_cierre, comentarios || null, folio || null, req.params.id]); 

    //cerrar todos los asignados de los tecnicos
    await connection.query(` 
      UPDATE tbl_tecnicos_ciclo 
      SET fecha_fin = NOW() 
      WHERE ciclo_id = ? AND fecha_fin IS NULL 
    `, [req.params.id]); 
    
    //ctualizar el estado del troquel
    await connection.query(` 
      UPDATE tbl_troqueles SET estado = ? WHERE id_troquel = ? 
    `, [status_salida, ciclo[0].troquel_id]); 
    await connection.commit(); 

    res.json({  
      success: true,  
      message: 'Repair cycle closed successfully' 
    }); 
  } catch (error) { 
    await connection.rollback(); 
    console.error('Error closing repair cycle:', error); 
    res.status(500).json({ error: 'Failed to close repair cycle' }); 
  } finally { 
    connection.release(); 
  } 
}); 

//POST registrar accion y empezar un nuevo ciclo
app.post('/api/troqueles/:id/action', async (req, res) => { 
  const connection = await pool.getConnection(); 
  try { 
    await connection.beginTransaction(); 
    const { 
      action_type, 
      tipo_accion, 
      falla_id, 
      modelo_nuevo_id, 
      folio, 
      comentarios, 
      empleado, 
      nivel, 
      grupo, 
      new_status 
    } = req.body; 

    //obtener la info del troquel
    const [troquelInfo] = await connection.query(` 
      SELECT id_troquel as troquel_id, nombre, modelo, estado as status, prensa_asignada as prensa_actual  
      FROM tbl_troqueles WHERE id_troquel = ? 
    `, [req.params.id]); 
     
    if (troquelInfo.length === 0) { 
      await connection.rollback(); 
      return res.status(404).json({ error: 'Troquel not found' }); 
    } 

     

    const troquel = troquelInfo[0]; 

     

    //obtener la descripcion si es que aplica

    let falla_descripcion = null; 

    if (falla_id) { 

      const [falla] = await connection.query(` 

        SELECT descripcion FROM tbl_fallas_catalogo WHERE id_fallas_catalogo = ? 

      `, [falla_id]); 

      if (falla.length > 0) { 

        falla_descripcion = falla[0].descripcion; 

      } 

    } 

     

    //insertar al historial

    const [historyResult] = await connection.query(` 

      INSERT INTO tbl_historial ( 

        troquel_id, tipo_registro, action_type, id_falla, modelo_nuevo, 

        folio, comentarios, empleado, nivel_setup, grupo, creado_el 

      ) VALUES (?, 'baja_troquel', ?, ?, ?, ?, ?, ?, ?, ?, NOW()) 

    `, [req.params.id, tipo_accion, falla_id || null, modelo_nuevo_id || null, 

        folio, comentarios || null, empleado, nivel || null, grupo || null]); 

     

    //actualizar el estado del troquel

    if (new_status) { 

      await connection.query(` 

        UPDATE tbl_troqueles SET estado = ? WHERE id_troquel = ? 

      `, [new_status, req.params.id]); 

       

      // si se cambia a reparando, crear nuevo ciclo de reapracion

      if (new_status === 'Reparando') { 

        //mapear el tipo de accion a motivo de entrada enum

        let motivo_entrada = 'Otro'; 

        if (tipo_accion === 'Falla de Troquel') motivo_entrada = 'Falla de Troquel'; 

        else if (tipo_accion === 'Limpieza General') motivo_entrada = 'Limpieza General'; 

        else if (tipo_accion === 'Cambio de Modelo') motivo_entrada = 'Cambio de Modelo'; 

         

        //revisar si hay ciclos activos 

        const [existingCycle] = await connection.query(` 

          SELECT id FROM tbl_ciclos_reparacion  

          WHERE troquel_id = ? AND ciclo_activo = TRUE 

        `, [req.params.id]); 

         

        if (existingCycle.length === 0) { 

          //crear nuevo ciclo de reparacion

          await connection.query(` 

            INSERT INTO tbl_ciclos_reparacion ( 

              troquel_id, troquel_nombre, modelo, 

              fecha_inicio_reparacion, motivo_entrada, 

              falla_id, falla_descripcion, folio_entrada, 

              empleado_registro, comentarios_entrada, status_anterior, 

              prensa_origen, nivel_reparacion, grupo_reparacion, 

              fecha_bajado, ciclo_activo 

            ) VALUES (?, ?, ?, NOW(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), TRUE) 

          `, [ 

            req.params.id, 

            troquel.nombre, 

            troquel.modelo, 

            motivo_entrada, 

            falla_id || null, 

            falla_descripcion, 

            folio, 

            empleado, 

            comentarios || null, 

            troquel.status, 

            troquel.prensa_actual, 

            nivel || null, 

            grupo || null 

          ]); 

        } 

      } 

    } 

     

    await connection.commit(); 

     

    res.json({  

      success: true,  

      history_id: historyResult.insertId  

    }); 

  } catch (error) { 

    await connection.rollback(); 

    console.error('Error recording action:', error); 

    res.status(500).json({ error: 'Error recording action' }); 

  } finally { 

    connection.release(); 

  } 

}); 

 

app.post('/api/troqueles', async (req, res) => { 

  try { 

    const { 

      id_troquel, 

      nombre, 

      estado = 'Pendiente', 

      año, 

      modelo, 

      golpes = '-', 

      golpes_acum = '-', 

      capacidad_golpes = '-', 

      rectificaciones = '0', 

      tipo_troquel = 'Null', 

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

    } = req.body; 

 

    if (!id_troquel || !nombre || !año) { 

      return res.status(400).json({ 

        success: false, 

        message: 'ID, nombre y año son requeridos' 

      }); 

    } 

 

    const id = id_troquel.trim().toUpperCase(); 

 

    const [existing] = await pool.query( 

      'SELECT id_troquel FROM tbl_troqueles WHERE id_troquel = ?', 

      [id] 

    ); 

    if (existing.length > 0) { 

      return res.status(409).json({ 

        success: false, 

        message: 'Ya existe un troquel con ese ID' 

      }); 

    } 

 

    await pool.query(`   

      INSERT INTO tbl_troqueles (   

        id_troquel, nombre, estado, año, modelo,   

        golpes, golpes_acum, capacidad_golpes, rectificaciones,   

        tipo_troquel, ubicacion, prensa_asignada, numero_serie,   

        proveedor, peso_kg, dimensiones, material_base,   

        num_estaciones, cavidades, color, ciclos,  

        n_parte_1, n_parte_2, n_parte_3, n_parte_4, n_parte_5, n_parte_6,  

        comentarios, image_url   

      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)   

    `, [ 

      id, nombre, estado, año, modelo, 

      golpes, golpes_acum, capacidad_golpes, rectificaciones, 

      tipo_troquel, ubicacion, prensa_asignada, numero_serie, 

      proveedor, peso_kg, dimensiones, material_base, 

      num_estaciones, cavidades, color, ciclos, 

      n_parte_1, n_parte_2, n_parte_3, n_parte_4, n_parte_5, n_parte_6, 

      comentarios, image_url 

    ]); 

 

    res.status(201).json({ 

      success: true, 

      message: 'Troquel registrado exitosamente', 

      id: id 

    }); 

  } catch (error) { 

    console.error('Error creating troquel:', error); 

    res.status(500).json({ 

      success: false, 

      message: error.message 

    }); 

  } 

}); 

 

app.put('/api/troqueles/:id', async (req, res) => { 

  try { 

    const id = req.params.id; 

 

    const [existing] = await pool.query( 

      'SELECT * FROM tbl_troqueles WHERE id_troquel = ?', 

      [id] 

    ); 

    if (existing.length === 0) { 

      return res.status(404).json({ 

        success: false, 

        message: 'Troquel no encontrado' 

      }); 

    } 

 

    const current = existing[0]; 

    const { 

      nombre = current.nombre, 

      estado = current.estado, 

      año = current.año, 

      modelo = current.modelo, 

      golpes = current.golpes, 

      golpes_acum = current.golpes_acum, 

      capacidad_golpes = current.capacidad_golpes, 

      rectificaciones = current.rectificaciones, 

      tipo_troquel = current.tipo_troquel, 

      ubicacion = current.ubicacion, 

      prensa_asignada = current.prensa_asignada, 

      numero_serie = current.numero_serie, 

      proveedor = current.proveedor, 

      peso_kg = current.peso_kg, 

      dimensiones = current.dimensiones, 

      material_base = current.material_base, 

      num_estaciones = current.num_estaciones, 

      cavidades = current.cavidades, 

      color = current.color, 

      ciclos = current.ciclos, 

      n_parte_1 = current.n_parte_1, 

      n_parte_2 = current.n_parte_2, 

      n_parte_3 = current.n_parte_3, 

      n_parte_4 = current.n_parte_4, 

      n_parte_5 = current.n_parte_5, 

      n_parte_6 = current.n_parte_6, 

      comentarios = current.comentarios, 

      image_url = current.image_url 

    } = req.body; 

 

    await pool.query(`   

      UPDATE tbl_troqueles SET   

        nombre = ?, estado = ?, año = ?, modelo = ?,   

        golpes = ?, golpes_acum = ?, capacidad_golpes = ?, rectificaciones = ?,   

        tipo_troquel = ?, ubicacion = ?, prensa_asignada = ?, numero_serie = ?,   

        proveedor = ?, peso_kg = ?, dimensiones = ?, material_base = ?,   

        num_estaciones = ?, cavidades = ?, color = ?, ciclos = ?,  

        n_parte_1 = ?, n_parte_2 = ?, n_parte_3 = ?, n_parte_4 = ?, n_parte_5 = ?, n_parte_6 = ?,  

        comentarios = ?, image_url = ?   

      WHERE id_troquel = ?   

    `, [ 

      nombre, estado, año, modelo, 

      golpes, golpes_acum, capacidad_golpes, rectificaciones, 

      tipo_troquel, ubicacion, prensa_asignada, numero_serie, 

      proveedor, peso_kg, dimensiones, material_base, 

      num_estaciones, cavidades, color, ciclos, 

      n_parte_1, n_parte_2, n_parte_3, n_parte_4, n_parte_5, n_parte_6, 

      comentarios, image_url, 

      id 

    ]); 

 

    await logChange(pool, id, 'update', JSON.stringify(current), JSON.stringify(req.body)); 

 

    res.json({ 

      success: true, 

      message: 'Troquel actualizado exitosamente' 

    }); 

  } catch (error) { 

    console.error('Error updating troquel:', error); 

    res.status(500).json({ 

      success: false, 

      message: error.message 

    }); 

  } 

}); 

 

app.patch('/api/troqueles/:id/status', async (req, res) => { 

  try { 

    const { status } = req.body; 

    await pool.query( 

      'UPDATE tbl_troqueles SET estado = ? WHERE id_troquel = ?', 

      [status, req.params.id] 

    ); 

    res.json({ success: true }); 

  } catch (error) { 

    console.error('Error updating status:', error); 

    res.status(500).json({ 

      success: false, 

      message: error.message 

    }); 

  } 

}); 

 

app.delete('/api/troqueles/:id', async (req, res) => { 

  try { 

    const id = req.params.id; 

 

    const [existing] = await pool.query( 

      'SELECT id_troquel, nombre FROM tbl_troqueles WHERE id_troquel = ?', 

      [id] 

    ); 

    if (existing.length === 0) { 

      return res.status(404).json({ 

        success: false, 

        message: 'Troquel no encontrado' 

      }); 

    } 

 

    await pool.query('DELETE FROM tbl_troqueles WHERE id_troquel = ?', [id]); 

 

    res.json({ 

      success: true, 

      message: `Troquel ${id} eliminado correctamente` 

    }); 

  } catch (error) { 

    console.error('Error deleting troquel:', error); 

    res.status(500).json({ 

      success: false, 

      message: error.message 

    }); 

  } 

}); 

 

app.get('/api/estadisticas', async (req, res) => { 

  try { 

    const [total] = await pool.query('SELECT COUNT(*) as count FROM tbl_troqueles'); 

    const [activos] = await pool.query( 

      "SELECT COUNT(*) as count FROM tbl_troqueles WHERE estado IN ('En prensa', 'Listo')" 

    ); 

    const [reparando] = await pool.query( 

      "SELECT COUNT(*) as count FROM tbl_troqueles WHERE estado = 'Reparando'" 

    ); 

    const [pendientes] = await pool.query( 

      "SELECT COUNT(*) as count FROM tbl_troqueles WHERE estado = 'Pendiente'" 

    ); 

    res.json({ 

      total: total[0].count, 

      activos: activos[0].count, 

      reparando: reparando[0].count, 

      pendientes: pendientes[0].count 

    }); 

  } catch (error) { 

    console.error('Error fetching estadisticas:', error); 

    res.status(500).json({ 

      success: false, 

      message: error.message 

    }); 

  } 

}); 

 

app.get('/api/priority-repairs', async (req, res) => { 

  try { 

    const [repairs] = await pool.query(`   

      SELECT pr.prioridad, t.id_troquel, t.nombre   

      FROM tbl_prioridad_reparacion pr   

      JOIN tbl_troqueles t ON pr.id_troquel = t.id_troquel   

      ORDER BY pr.prioridad   

    `); 

    res.json(repairs.map(r => ({ 

      priority: r.prioridad, 

      id: r.id_troquel, 

      name: r.nombre 

    }))); 

  } catch (error) { 

    console.error('Error fetching priority repairs:', error); 

    res.status(500).json({ 

      success: false, 

      message: error.message 

    }); 

  } 

}); 

 

app.get('/api/troqueles-summary', async (req, res) => { 

  try { 

    const [tables] = await pool.query("SHOW TABLES LIKE 'tbl_resumen_troqueles'"); 

    if (tables.length > 0) { 

      const [summary] = await pool.query( 

        'SELECT etiqueta, count, goal, perf FROM tbl_resumen_troqueles ORDER BY FIELD(etiqueta, "UP", "BACKUP", "TOTAL")' 

      ); 

      res.json(summary.map(s => ({ 

        label: s.etiqueta, 

        count: s.count, 

        goal: s.goal, 

        perf: s.perf 

      }))); 

    } else { 

      const [total] = await pool.query('SELECT COUNT(*) as count FROM tbl_troqueles'); 

      const [up] = await pool.query("SELECT COUNT(*) as count FROM tbl_troqueles WHERE estado = 'En prensa'"); 

      const [backup] = await pool.query("SELECT COUNT(*) as count FROM tbl_troqueles WHERE estado = 'Listo-BackUp'"); 

      res.json([ 

        { label: 'UP', count: up[0].count, goal: null, perf: null }, 

        { label: 'BACKUP', count: backup[0].count, goal: null, perf: null }, 

        { label: 'TOTAL', count: total[0].count, goal: null, perf: null } 

      ]); 

    } 

  } catch (error) { 

    console.error('Error fetching summary:', error); 

    res.status(500).json({ 

      success: false, 

      message: error.message 

    }); 

  } 

}); 

 

app.get('/api/fallas', async (req, res) => { 

  try { 

    const [fallas] = await pool.query( 

      'SELECT id_fallas_catalogo, descripcion FROM tbl_fallas_catalogo WHERE activo = TRUE ORDER BY descripcion' 

    ); 

    res.json(fallas.map(f => ({ 

      id: f.id_fallas_catalogo, 

      description: f.descripcion 

    }))); 

  } catch (error) { 

    console.error('Error fetching fallas:', error); 

    res.status(500).json({ 

      success: false, 

      message: error.message 

    }); 

  } 

}); 

 

app.post('/api/actions/baja-troquel', async (req, res) => { 

  try { 

    const { 

      troquel_id, 

      action_type, 

      folio, 

      falla_id, 

      modelo_nuevo, 

      nivel_setup, 

      grupo, 

      comentarios, 

      empleado 

    } = req.body; 

 

    if (!troquel_id) { 

      return res.status(400).json({ 

        success: false, 

        message: 'ID de troquel requerido' 

      }); 

    } 

 

    if (!empleado || !empleado.trim()) { 

      return res.status(400).json({ 

        success: false, 

        message: 'Nombre del empleado requerido' 

      }); 

    } 

 

    if (!folio || !folio.trim()) { 

      return res.status(400).json({ 

        success: false, 

        message: 'Número de folio requerido' 

      }); 

    } 

 

    //insertar a la tabla de historial

    const [result] = await pool.query(`   

      INSERT INTO tbl_historial (   

        troquel_id,   

        tipo_registro,  

        action_type,  

        folio,  

        id_falla,   

        modelo_nuevo,   

        nivel_setup,   

        grupo,   

        comentarios,  

        empleado  

      ) VALUES (?, 'baja_troquel', ?, ?, ?, ?, ?, ?, ?, ?)   

    `, [ 

      troquel_id, 

      action_type, 

      folio.trim(), 

      falla_id || null, 

      modelo_nuevo || null, 

      nivel_setup || null, 

      grupo || null, 

      comentarios || null, 

      empleado.trim() 

    ]); 

 

    //actualizar el estado de troquel a reparando

    await pool.query( 

      "UPDATE tbl_troqueles SET estado = 'Reparando' WHERE id_troquel = ?", 

      [troquel_id] 

    ); 

 

    res.json({ 

      success: true, 

      message: 'Baja de troquel registrada exitosamente. Estado cambiado a "Reparando"', 

      id: result.insertId 

    }); 

  } catch (error) { 

    console.error('Error creating baja troquel:', error); 

    res.status(500).json({ 

      success: false, 

      message: error.message 

    }); 

  } 

}); 

 


app.post('/api/actions/asistencia-prensa', async (req, res) => { 

  try { 

    const { 

      troquel_id, 

      folio, 

      motivo_id, 

      comentarios, 

      empleado 

    } = req.body; 

 

    if (!troquel_id) { 

      return res.status(400).json({ 

        success: false, 

        message: 'ID de troquel requerido' 

      }); 

    } 

 

    if (!empleado || !empleado.trim()) { 

      return res.status(400).json({ 

        success: false, 

        message: 'Nombre del empleado requerido' 

      }); 

    } 

 

    if (!folio || !folio.trim()) { 

      return res.status(400).json({ 

        success: false, 

        message: 'Número de folio requerido' 

      }); 

    } 

 

    if (!motivo_id) { 

      return res.status(400).json({ 

        success: false, 

        message: 'Motivo de asistencia requerido' 

      }); 

    } 

 

    //obtener la descripcion de motivo para el tipo de accion

    let motivoDescription = 'Asistencia en Prensa'; 

    try { 

      const [motivos] = await pool.query( 

        'SELECT descripcion FROM tbl_asistencia_prensa WHERE id_asistencia_prensa = ?', 

        [motivo_id] 

      ); 

      if (motivos.length > 0) { 

        motivoDescription = motivos[0].descripcion; 

      } 

    } catch (e) { 

      console.log('Could not get motivo description:', e.message); 

    } 

 

    //insertar a la tabla de historial

    const [result] = await pool.query(`   

      INSERT INTO tbl_historial (   

        troquel_id,   

        tipo_registro,  

        action_type,  

        folio,  

        id_motivo_asistencia,  

        comentarios,  

        empleado  

      ) VALUES (?, 'asistencia_prensa', ?, ?, ?, ?, ?)   

    `, [ 

      troquel_id, 

      motivoDescription, 

      folio.trim(), 

      motivo_id, 

      comentarios || null, 

      empleado.trim() 

    ]); 

 

    //actualizar el estado del troquel a reparando

    await pool.query( 

      "UPDATE tbl_troqueles SET estado = 'Reparando' WHERE id_troquel = ?", 

      [troquel_id] 

    ); 

 

    res.json({ 

      success: true, 

      message: 'Asistencia en prensa registrada exitosamente. Estado cambiado a "Reparando"', 

      id: result.insertId 

    }); 

  } catch (error) { 

    console.error('Error creating asistencia:', error); 

    res.status(500).json({ 

      success: false, 

      message: error.message 

    }); 

  } 

}); 

 

// compatibilidad

app.post('/api/actions', async (req, res) => { 

  try { 

    const { 

      troquel_id, 

      action_type, 

      folio, 

      falla_id, 

      modelo_nuevo, 

      nivel_setup, 

      grupo, 

      comentarios, 

      motivo, 

      comentarios_supervisor, 

      empleado_troquel, 

      empleado_asistencia 

    } = req.body; 

 

    const [result] = await pool.query(`   

      INSERT INTO tbl_historial (   

        troquel_id, tipo_registro, action_type, folio, id_falla, modelo_nuevo,   

        nivel_setup, grupo, comentarios, id_motivo_asistencia, comentarios_supervisor,  

        empleado  

      ) VALUES (?, 'legacy', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)   

    `, [ 

      troquel_id, action_type, folio || null, falla_id || null, modelo_nuevo, 

      nivel_setup, grupo, comentarios, motivo || null, comentarios_supervisor, 

      empleado_troquel || empleado_asistencia || null 

    ]); 

 

    res.json({ 

      success: true, 

      id: result.insertId 

    }); 

  } catch (error) { 

    console.error('Error creating action:', error); 

    res.status(500).json({ 

      success: false, 

      message: error.message 

    }); 

  } 

}); 

 

//obtener el historial para el troquel

app.get('/api/troqueles/:id/history', async (req, res) => { 

  try { 

    const [history] = await pool.query(`   

      SELECT   

        h.*,  

        fc.descripcion as falla_descripcion,  

        ap.descripcion as motivo_descripcion  

      FROM tbl_historial h  

      LEFT JOIN tbl_fallas_catalogo fc ON h.id_falla = fc.id_fallas_catalogo   

      LEFT JOIN tbl_asistencia_prensa ap ON h.id_falla = ap.id_asistencia_prensa  

      WHERE h.troquel_id = ?   

      ORDER BY h.creado_el DESC   

    `, [req.params.id]); 

 

    res.json(history.map(h => ({ 

      id: h.id_historial, 

      tipo_registro: h.tipo_registro || 'legacy', 

      action_type: h.action_type, 

      folio: h.folio, 

      falla_description: h.falla_descripcion, 

      motivo_description: h.motivo_descripcion, 

      modelo_nuevo: h.modelo_nuevo, 

      nivel_setup: h.nivel_setup, 

      grupo: h.grupo, 

      comentarios: h.comentarios, 

      comentarios_supervisor: h.comentarios_supervisor, 

      empleado: h.empleado, 

      created_at: h.creado_el 

    }))); 

  } catch (error) { 

    console.error('Error fetching history:', error); 

    res.status(500).json({ 

      success: false, 

      message: error.message 

    }); 

  } 

}); 

 

app.get('/api/search', async (req, res) => { 

  try { 

    const { q } = req.query; 

    const searchTerm = `%${q}%`; 

    const [results] = await pool.query( 

      'SELECT id_troquel, nombre, estado, año, modelo FROM tbl_troqueles WHERE id_troquel LIKE ? OR nombre LIKE ? OR modelo LIKE ?', 

      [searchTerm, searchTerm, searchTerm] 

    ); 

    res.json(results.map(r => ({ 

      id: r.id_troquel, 

      name: r.nombre, 

      status: r.estado, 

      year: r.año, 

      model: r.modelo 

    }))); 

  } catch (error) { 

    console.error('Error searching:', error); 

    res.status(500).json({ 

      success: false, 

      message: error.message 

    }); 

  } 

}); 

 

async function logChange(pool, troquelId, campo, valorAnterior, valorNuevo) { 

  try { 

    await pool.query(`   

      INSERT INTO tbl_troqueles_historial (troquel_id, campo_modificado, valor_anterior, valor_nuevo)   

      VALUES (?, ?, ?, ?)   

    `, [troquelId, campo, valorAnterior, valorNuevo]); 

  } catch (error) { 

    console.error('Error logging change:', error); 

  } 

} 

 

app.listen(PORT, () => { 

  console.log(`E-Kanban Toolroom API Server running on port ${PORT}`); 

  console.log(`Health check: http://localhost:${PORT}/api/health`); 

  console.log(`Troqueles API: http://localhost:${PORT}/api/troqueles`); 

  console.log(`Active Cycle: http://localhost:${PORT}/api/troqueles/:id/ciclo-activo`); 

  console.log(`Repair History: http://localhost:${PORT}/api/troqueles/:id/ciclos-historial`); 

  console.log(`Statistics: http://localhost:${PORT}/api/troqueles/:id/estadisticas`); 

}); 