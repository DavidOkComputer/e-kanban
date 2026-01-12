const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
require('dotenv').config();
 
const app = express();
const PORT = process.env.PORT || 3001;
 
// Middleware
app.use(cors());
app.use(express.json());
 
// Database connection pool
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
 
// Test database connection
app.get('/api/health', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1');
    res.json({ status: 'OK', database: 'Connected' });
  } catch (error) {
    res.status(500).json({ status: 'Error', message: error.message });
  }
});
 
// Obtener todos los troqueles agrupados por año
app.get('/api/troqueles', async (req, res) => {
  try {
    const [troqueles] = await pool.query(`
      SELECT
        t.*,
        GROUP_CONCAT(
          CONCAT(p.año, ':', IFNULL(p.modelo, ''), ':', p.es_actual)
          ORDER BY p.año
        ) as prensas_info
      FROM tbl_troqueles t
      LEFT JOIN tbl_prensas p ON t.id_troquel = p.fk_id_troquel
      GROUP BY t.id_troquel
      ORDER BY t.año, t.id_troquel
    `);
 
    // Transformar info agrupada por año
    const groupedByYear = {};
 
    troqueles.forEach(t => {
      // Use the correct Spanish column name: año
      const year = t.año;
      
      if (!groupedByYear[year]) {
        groupedByYear[year] = [];
      }
 
      // Parsear info de prensas
      const prensas = t.prensas_info
        ? t.prensas_info.split(',').map(p => {
            const [yr, model, current] = p.split(':');
            return {
              year: parseInt(yr),
              model: model || null,
              current: current === '1'
            };
          })
        : [];
 
      // Map Spanish column names to English property names for frontend
      groupedByYear[year].push({
        id: t.id_troquel,           // id_troquel -> id
        name: t.nombre,             // nombre -> name
        status: t.status,
        model: t.modelo,            // modelo -> model
        golpes: t.golpes,
        golpesAcum: t.golpes_acum,
        capacidadGolpes: t.capacidad_golpes,
        rectificaciones: t.rectificaciones,
        prensas
      });
    });
 
    res.json(groupedByYear);
  } catch (error) {
    console.error('Error fetching troqueles:', error);
    res.status(500).json({ error: error.message });
  }
});
 
// Get single troquel by ID
app.get('/api/troqueles/:id', async (req, res) => {
  try {
    const [troqueles] = await pool.query(
      'SELECT * FROM tbl_troqueles WHERE id_troquel = ?',
      [req.params.id]
    );
 
    if (troqueles.length === 0) {
      return res.status(404).json({ error: 'Troquel no encontrado' });
    }
 
    const [prensas] = await pool.query(
      'SELECT año, modelo, es_actual FROM tbl_prensas WHERE fk_id_troquel = ? ORDER BY año',
      [req.params.id]
    );
 
    const t = troqueles[0];
    
    // Map Spanish column names to English property names
    const troquel = {
      id: t.id_troquel,
      name: t.nombre,
      status: t.status,
      model: t.modelo,
      golpes: t.golpes,
      golpesAcum: t.golpes_acum,
      capacidadGolpes: t.capacidad_golpes,
      rectificaciones: t.rectificaciones,
      prensas: prensas.map(p => ({
        year: p.año,
        model: p.modelo,
        current: p.es_actual
      }))
    };
 
    res.json(troquel);
  } catch (error) {
    console.error('Error buscando el troquel:', error);
    res.status(500).json({ error: error.message });
  }
});
 
// Actualizar el estado del troquel
app.patch('/api/troqueles/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    await pool.query(
      'UPDATE tbl_troqueles SET status = ? WHERE id_troquel = ?',
      [status, req.params.id]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Error al actualizar el estado:', error);
    res.status(500).json({ error: error.message });
  }
});
 
// Obtener prioridad de reparación
app.get('/api/priority-repairs', async (req, res) => {
  try {
    const [repairs] = await pool.query(`
      SELECT
        pr.prioridad,
        t.id_troquel,
        t.nombre
      FROM tbl_prioridad_reparacion pr
      JOIN tbl_troqueles t ON pr.id_troquel = t.id_troquel
      ORDER BY pr.prioridad
    `);
 
    // Map to frontend expected format
    res.json(repairs.map(r => ({
      priority: r.prioridad,
      name: r.nombre
    })));
  } catch (error) {
    console.error('Error obteniendo las prioridades de reparación:', error);
    res.status(500).json({ error: error.message });
  }
});
 
// Obtener resumen de troqueles
app.get('/api/troqueles-summary', async (req, res) => {
  try {
    const [summary] = await pool.query(
      'SELECT etiqueta, count, goal, perf FROM tbl_resumen_troqueles ORDER BY FIELD(etiqueta, "UP", "BACKUP", "TOTAL")'
    );
 
    // Map to frontend expected format
    res.json(summary.map(s => ({
      label: s.etiqueta,
      count: s.count,
      goal: s.goal,
      perf: s.perf
    })));
  } catch (error) {
    console.error('Error obteniendo el resumen:', error);
    res.status(500).json({ error: error.message });
  }
});
 
// Obtener catálogo de fallas
app.get('/api/fallas', async (req, res) => {
  try {
    const [fallas] = await pool.query(
      'SELECT id_fallas_catalogo, descripcion FROM tbl_fallas_catalogo WHERE activo = TRUE ORDER BY descripcion'
    );
 
    // Map to frontend expected format
    res.json(fallas.map(f => ({
      id: f.id_fallas_catalogo,
      description: f.descripcion
    })));
  } catch (error) {
    console.error('Error obteniendo fallas:', error);
    res.status(500).json({ error: error.message });
  }
});
 
// Crear entrada de historial de acciones
app.post('/api/actions', async (req, res) => {
  try {
    const {
      troquel_id,
      action_type,
      falla_id,
      modelo_nuevo,
      nivel_setup,
      grupo,
      comentarios,
      motivo,
      comentarios_supervisor
    } = req.body;
 
    const [result] = await pool.query(
      `INSERT INTO tbl_historial
        (troquel_id, action_type, id_falla, modelo_nuevo, nivel_setup, grupo, comentarios, motivo, comentarios_supervisor)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [troquel_id, action_type, falla_id || null, modelo_nuevo, nivel_setup, grupo, comentarios, motivo, comentarios_supervisor]
    );
 
    res.json({ success: true, id: result.insertId });
  } catch (error) {
    console.error('Error creando acción:', error);
    res.status(500).json({ error: error.message });
  }
});
 
// Obtener el historial para el troquel
app.get('/api/troqueles/:id/history', async (req, res) => {
  try {
    const [history] = await pool.query(`
      SELECT
        ah.*,
        fc.descripcion as falla_descripcion
      FROM tbl_historial ah
      LEFT JOIN tbl_fallas_catalogo fc ON ah.id_falla = fc.id_fallas_catalogo
      WHERE ah.troquel_id = ?
      ORDER BY ah.creado_el DESC
    `, [req.params.id]);
 
    // Map to frontend expected format
    res.json(history.map(h => ({
      id: h.id_historial,
      action_type: h.action_type,
      falla_description: h.falla_descripcion,
      modelo_nuevo: h.modelo_nuevo,
      nivel_setup: h.nivel_setup,
      grupo: h.grupo,
      comentarios: h.comentarios,
      motivo: h.motivo,
      comentarios_supervisor: h.comentarios_supervisor,
      created_at: h.creado_el
    })));
  } catch (error) {
    console.error('Error obteniendo el historial:', error);
    res.status(500).json({ error: error.message });
  }
});
 
// Buscar troqueles
app.get('/api/search', async (req, res) => {
  try {
    const { q } = req.query;
    const searchTerm = `%${q}%`;
 
    const [results] = await pool.query(
      'SELECT id_troquel, nombre, status, año, modelo FROM tbl_troqueles WHERE id_troquel LIKE ? OR nombre LIKE ? OR modelo LIKE ?',
      [searchTerm, searchTerm, searchTerm]
    );
 
    // Map to frontend expected format
    res.json(results.map(r => ({
      id: r.id_troquel,
      name: r.nombre,
      status: r.status,
      year: r.año,
      model: r.modelo
    })));
  } catch (error) {
    console.error('Error al buscar:', error);
    res.status(500).json({ error: error.message });
  }
});
 
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});