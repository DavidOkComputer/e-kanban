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
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'ekanban_toolroom',
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

// Get all troqueles grouped by year
app.get('/api/troqueles', async (req, res) => {
  try {
    const [troqueles] = await pool.query(`
      SELECT t.*, 
             GROUP_CONCAT(
               CONCAT(p.year, ':', IFNULL(p.model, ''), ':', p.is_current) 
               ORDER BY p.year
             ) as prensas_data
      FROM troqueles t
      LEFT JOIN prensas p ON t.id = p.troquel_id
      GROUP BY t.id
      ORDER BY t.year, t.id
    `);

    // Transform data to group by year
    const groupedByYear = {};
    troqueles.forEach(t => {
      const year = t.year;
      if (!groupedByYear[year]) {
        groupedByYear[year] = [];
      }
      
      // Parse prensas data
      const prensas = t.prensas_data ? t.prensas_data.split(',').map(p => {
        const [yr, model, current] = p.split(':');
        return { year: parseInt(yr), model: model || null, current: current === '1' };
      }) : [];

      groupedByYear[year].push({
        id: t.id,
        name: t.name,
        status: t.status,
        model: t.model,
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
      'SELECT * FROM troqueles WHERE id = ?',
      [req.params.id]
    );
    
    if (troqueles.length === 0) {
      return res.status(404).json({ error: 'Troquel not found' });
    }

    const [prensas] = await pool.query(
      'SELECT year, model, is_current FROM prensas WHERE troquel_id = ? ORDER BY year',
      [req.params.id]
    );

    const troquel = {
      ...troqueles[0],
      golpesAcum: troqueles[0].golpes_acum,
      capacidadGolpes: troqueles[0].capacidad_golpes,
      prensas: prensas.map(p => ({ year: p.year, model: p.model, current: p.is_current }))
    };

    res.json(troquel);
  } catch (error) {
    console.error('Error fetching troquel:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update troquel status
app.patch('/api/troqueles/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    await pool.query(
      'UPDATE troqueles SET status = ? WHERE id = ?',
      [status, req.params.id]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get priority repairs
app.get('/api/priority-repairs', async (req, res) => {
  try {
    const [repairs] = await pool.query(`
      SELECT pr.priority, t.id, t.name
      FROM priority_repairs pr
      JOIN troqueles t ON pr.troquel_id = t.id
      ORDER BY pr.priority
    `);
    res.json(repairs.map(r => ({ priority: r.priority, name: r.name })));
  } catch (error) {
    console.error('Error fetching priority repairs:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get troqueles summary
app.get('/api/troqueles-summary', async (req, res) => {
  try {
    const [summary] = await pool.query(
      'SELECT label, count, goal, perf FROM troqueles_summary ORDER BY FIELD(label, "UP", "BACKUP", "TOTAL")'
    );
    res.json(summary);
  } catch (error) {
    console.error('Error fetching summary:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get fallas catalog
app.get('/api/fallas', async (req, res) => {
  try {
    const [fallas] = await pool.query(
      'SELECT id, description FROM fallas_catalog WHERE active = TRUE ORDER BY description'
    );
    res.json(fallas);
  } catch (error) {
    console.error('Error fetching fallas:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create action history entry
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
      `INSERT INTO action_history 
       (troquel_id, action_type, falla_id, modelo_nuevo, nivel_setup, grupo, comentarios, motivo, comentarios_supervisor)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [troquel_id, action_type, falla_id, modelo_nuevo, nivel_setup, grupo, comentarios, motivo, comentarios_supervisor]
    );

    res.json({ success: true, id: result.insertId });
  } catch (error) {
    console.error('Error creating action:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get action history for a troquel
app.get('/api/troqueles/:id/history', async (req, res) => {
  try {
    const [history] = await pool.query(`
      SELECT ah.*, fc.description as falla_description
      FROM action_history ah
      LEFT JOIN fallas_catalog fc ON ah.falla_id = fc.id
      WHERE ah.troquel_id = ?
      ORDER BY ah.created_at DESC
    `, [req.params.id]);
    res.json(history);
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ error: error.message });
  }
});

// Search troqueles
app.get('/api/search', async (req, res) => {
  try {
    const { q } = req.query;
    const searchTerm = `%${q}%`;
    const [results] = await pool.query(
      'SELECT id, name, status, year, model FROM troqueles WHERE id LIKE ? OR name LIKE ? OR model LIKE ?',
      [searchTerm, searchTerm, searchTerm]
    );
    res.json(results);
  } catch (error) {
    console.error('Error searching:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});