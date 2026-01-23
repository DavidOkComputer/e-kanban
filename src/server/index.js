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
		//.revisar si existe la tabla
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
			//devolver valores default si no existe la tabla
			res.json([{
					value: '',
					label: 'Sin asignar'
				},
				{
					value: 'P1',
					label: 'Prensa 1 (P1)'
				},
				{
					value: 'P2',
					label: 'Prensa 2 (P2)'
				},
				{
					value: 'P3',
					label: 'Prensa 3 (P3)'
				},
				{
					value: 'P4',
					label: 'Prensa 4 (P4)'
				},
				{
					value: 'P5',
					label: 'Prensa 5 (P5)'
				},
				{
					value: 'P6',
					label: 'Prensa 6 (P6)'
				},
				{
					value: 'P7',
					label: 'Prensa 7 (P7)'
				},
				{
					value: 'P8',
					label: 'Prensa 8 (P8)'
				}
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
				"SELECT id, codigo, nombre, descripcion FROM tbl_tipos_troquel WHERE activo = 1 ORDER BY nombre ASC"
			);
			const options = tipos.map(t => ({
				value: t.codigo || t.id,
				label: t.nombre,
				descripcion: t.descripcion
			}));
			res.json(options);
		} else {
			res.json([{
					value: 'progresivo',
					label: 'Progresivo',
					descripcion: 'Troquel de estaciones progresivas'
				},
				{
					value: 'transfer',
					label: 'Transfer',
					descripcion: 'Troquel tipo transfer'
				},
				{
					value: 'compound',
					label: 'Compound',
					descripcion: 'Troquel compuesto'
				},
				{
					value: 'simple',
					label: 'Simple',
					descripcion: 'Troquel de operación simple'
				}
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
				"SELECT id, codigo, nombre, color, descripcion FROM tbl_estados WHERE activo = 1 ORDER BY orden ASC, nombre ASC"
			);
			const options = estados.map(e => ({
				value: e.codigo || e.nombre,
				label: e.nombre,
				color: e.color,
				descripcion: e.descripcion
			}));
			res.json(options);
		} else {
			res.json([{
					value: 'Pendiente',
					label: 'Pendiente',
					color: '#ff6b6b'
				},
				{
					value: 'En prensa',
					label: 'En Prensa',
					color: '#00ff88'
				},
				{
					value: 'Listo',
					label: 'Listo',
					color: '#64ff64'
				},
				{
					value: 'Listo-BackUp',
					label: 'Listo - BackUp',
					color: '#00c8ff'
				},
				{
					value: 'Reparando',
					label: 'Reparando',
					color: '#ffc800'
				},
				{
					value: 'Baja',
					label: 'Baja / Obsoleto',
					color: '#888888'
				}
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

app.get('/api/troqueles', async (req, res) => {
	try {
		const [troqueles] = await pool.query(` 
		SELECT * FROM tbl_troqueles  
			ORDER BY año DESC, id_troquel 
		`);
		//agrupar por año para compatibilidad con el dashboard
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
				imageUrl: t.image_url
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
		//devolver como array para el panel de admin
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
		const {
			year,
			status,
			search
		} = req.query;
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
			tipo_troquel = 'progresivo',
			ubicacion,
			prensa_asignada,
			numero_serie,
			proveedor,
			peso_kg,
			dimensiones,
			material_base,
			num_estaciones,
			vida_util_estimada,
			comentarios,
			image_url
		} = req.body;
		//validar campos requeridos
		if (!id_troquel || !nombre || !año) {
			return res.status(400).json({
				success: false,
				message: 'ID, nombre y año son requeridos'
			});
		}
		const id = id_troquel.trim().toUpperCase();
		//revisar si el ID ya existe
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
		//insertar nuevo troquel
		await pool.query(` 
			INSERT INTO tbl_troqueles ( 
				id_troquel, nombre, estado, año, modelo, 
				golpes, golpes_acum, capacidad_golpes, rectificaciones, 
				tipo_troquel, ubicacion, prensa_asignada, numero_serie, 
				proveedor, peso_kg, dimensiones, material_base, 
				num_estaciones, vida_util_estimada, comentarios, image_url 
				) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) 
	`, [
			id, nombre, estado, año, modelo,
			golpes, golpes_acum, capacidad_golpes, rectificaciones,
			tipo_troquel, ubicacion, prensa_asignada, numero_serie,
			proveedor, peso_kg, dimensiones, material_base,
			num_estaciones, vida_util_estimada, comentarios, image_url
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
		//revisar si existe el troquel
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
				vida_util_estimada = current.vida_util_estimada,
				comentarios = current.comentarios,
				image_url = current.image_url
		} = req.body;
		await pool.query(` 
			UPDATE tbl_troqueles SET 
				nombre = ?, estado = ?, año = ?, modelo = ?, 
				golpes = ?, golpes_acum = ?, capacidad_golpes = ?, rectificaciones = ?, 
				tipo_troquel = ?, ubicacion = ?, prensa_asignada = ?, numero_serie = ?, 
				proveedor = ?, peso_kg = ?, dimensiones = ?, material_base = ?, 
				num_estaciones = ?, vida_util_estimada = ?, comentarios = ?, image_url = ? 
				WHERE id_troquel = ? 
	`, [
			nombre, estado, año, modelo,
			golpes, golpes_acum, capacidad_golpes, rectificaciones,
			tipo_troquel, ubicacion, prensa_asignada, numero_serie,
			proveedor, peso_kg, dimensiones, material_base,
			num_estaciones, vida_util_estimada, comentarios, image_url,
			id
		]);
		//loguear el cambio
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
		const {
			status
		} = req.body;
		await pool.query(
			'UPDATE tbl_troqueles SET estado = ? WHERE id_troquel = ?',
			[status, req.params.id]
		);
		res.json({
			success: true
		});
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
		//revisar si el troquel existe
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
			//calcular desde la tabla de troqueles
			const [total] = await pool.query('SELECT COUNT(*) as count FROM tbl_troqueles');
			const [up] = await pool.query("SELECT COUNT(*) as count FROM tbl_troqueles WHERE estado = 'En prensa'");
			const [backup] = await pool.query("SELECT COUNT(*) as count FROM tbl_troqueles WHERE estado = 'Listo-BackUp'");
			res.json([{
					label: 'UP',
					count: up[0].count,
					goal: null,
					perf: null
				},
				{
					label: 'BACKUP',
					count: backup[0].count,
					goal: null,
					perf: null
				},
				{
					label: 'TOTAL',
					count: total[0].count,
					goal: null,
					perf: null
				}
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
		const [result] = await pool.query(` 
				INSERT INTO tbl_historial ( 
					troquel_id, action_type, id_falla, modelo_nuevo, 
					nivel_setup, grupo, comentarios, motivo, comentarios_supervisor 
				) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) 
`, [
			troquel_id, action_type, falla_id || null, modelo_nuevo,
			nivel_setup, grupo, comentarios, motivo, comentarios_supervisor
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

app.get('/api/troqueles/:id/history', async (req, res) => {
	try {
		const [history] = await pool.query(` 
			SELECT ah.*, fc.descripcion as falla_descripcion 
				FROM tbl_historial ah 
				LEFT JOIN tbl_fallas_catalogo fc ON ah.id_falla = fc.id_fallas_catalogo 
				WHERE ah.troquel_id = ? 
				ORDER BY ah.creado_el DESC 
	`, [req.params.id]);
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
		console.error('Error fetching history:', error);
		res.status(500).json({
			success: false,
			message: error.message
		});
	}
});

app.get('/api/search', async (req, res) => {
	try {
		const {
			q
		} = req.query;
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
});