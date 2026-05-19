const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");
const bcrypt = require("bcrypt");
require("dotenv").config();
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(
    cors({
      origin: [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://localhost:3001",
        "http://10.109.17.87:5173",
        `http://localhost`,
        `localhost`,
        `http://10.109.17.87`,
        `http://127.0.0.1`,
      ],

      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    }),
);

app.use(express.json());

//conexion a la base de datos

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "ekanban_toolroom_db",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

//endpoints de autenticacion
app.post("/api/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Usuario y contraseña son requeridos",
      });
    }

    //buscar por nombre de usuario
    const [users] = await pool.query(
        "SELECT * FROM tbl_usuarios WHERE nombre_usuario = ? AND activo = 1",
        [username],
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Usuario o contraseña incorrectos",
      });
    }

    const user = users[0];

    //verificar contrasenia
    const passwordMatch = await bcrypt.compare(password, user.acceso);

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Usuario o contraseña incorrectos",
      });
    }

    //actualizar registro de ultimo acceso
    await pool.query(
        "UPDATE tbl_usuarios SET ultimo_acceso = NOW() WHERE id_usuario = ?",
        [user.id_usuario],
    );

    //devolver info del usurio, sin contrasenia
    res.json({
      success: true,
      message: "Login exitoso",
      user: {
        id: user.id_usuario,
        username: user.nombre_usuario,
        nombre: user.nombre_completo,
        rol: user.rol,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Error del servidor",
    });
  }
});

//estado y apis disponibles
app.get("/api/health", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT 1");

    res.json({
      status: "OK",
      database: "Connected",
    });
  } catch (error) {
    res.status(500).json({
      status: "Error",
      message: error.message,
    });
  }
});

app.get("/api/modelos", async (req, res) => {
  try {
    const { troquel_id } = req.query;
    let query = `
      SELECT
        m.id_modelo,
        m.nombre_modelo,
        m.troquel_id,
        m.descripcion,
        m.creado_en,
        m.actualizado_en,
        t.nombre AS troquel_nombre
      FROM tbl_modelos_troquel m
             LEFT JOIN tbl_troqueles t ON m.troquel_id = t.id_troquel
    `;

    const params = [];

    if (troquel_id) {
      query += " WHERE m.troquel_id = ?";
      params.push(troquel_id);
    }

    query += " ORDER BY m.nombre_modelo ASC";

    const [rows] = await pool.query(query, params);

    res.json(rows);
  } catch (err) {
    console.error("Error fetching modelos:", err);

    res.status(500).json({
      success: false,
      message: "Error al obtener modelos",
    });
  }
});

app.post("/api/modelos", async (req, res) => {
  try {
    const { nombre_modelo, troquel_id, descripcion } = req.body;

    if (!nombre_modelo)
      return res
          .status(400)

          .json({
            success: false,
            message: "El nombre del modelo es requerido",
          });

    if (!troquel_id)
      return res
          .status(400)
          .json({ success: false, message: "El troquel es requerido" });

    //revisar si existe el troquel
    const [troquelCheck] = await pool.query(
        "SELECT id_troquel FROM tbl_troqueles WHERE id_troquel = ?",
        [troquel_id],
    );

    if (troquelCheck.length === 0)
      return res.status(400).json({
        success: false,
        message: "El troquel especificado no existe",
      });

    //revisar duplicados
    const [dupCheck] = await pool.query(
        "SELECT id_modelo FROM tbl_modelos_troquel WHERE nombre_modelo = ? AND troquel_id = ?",
        [nombre_modelo, troquel_id],
    );

    if (dupCheck.length > 0)
      return res.status(400).json({
        success: false,
        message: "Ya existe un modelo con ese nombre para este troquel",
      });

    const [result] = await pool.query(
        "INSERT INTO tbl_modelos_troquel (nombre_modelo, troquel_id, descripcion) VALUES (?, ?, ?)",
        [nombre_modelo, troquel_id, descripcion || null],
    );

    res.status(201).json({
      success: true,
      message: "Modelo creado exitosamente",
      id_modelo: result.insertId,
    });
  } catch (err) {
    console.error("Error creating modelo:", err);

    res.status(500).json({
      success: false,
      message: "Error al crear modelo",
    });
  }
});

app.delete("/api/modelos/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [check] = await pool.query(
        "SELECT id_modelo FROM tbl_modelos_troquel WHERE id_modelo = ?",
        [id],
    );

    if (check.length === 0)
      return res
          .status(404)
          .json({ success: false, message: "Modelo no encontrado" });

    await pool.query("DELETE FROM tbl_modelos_troquel WHERE id_modelo = ?", [
      id,
    ]);

    res.json({ success: true, message: "Modelo eliminado exitosamente" });
  } catch (err) {
    console.error("Error deleting modelo:", err);

    res.status(500).json({
      success: false,
      message: "Error al eliminar modelo",
    });
  }
});

//actualizar modelo de troquel
app.put("/api/modelos", async (req, res) => {
  try {
    const { id_modelo, nombre_modelo, troquel_id, descripcion } = req.body;

    if (!id_modelo)
      return res.status(400).json({
        success: false,
        message: "El ID del modelo es requerido",
      });

    if (!nombre_modelo)
      return res
          .status(400)

          .json({
            success: false,
            message: "El nombre del modelo es requerido",
          });

    if (!troquel_id)
      return res
          .status(400)
          .json({ success: false, message: "El troquel es requerido" });
    const [checkModelo] = await pool.query(
        "SELECT id_modelo FROM tbl_modelos_troquel WHERE id_modelo = ?",
        [id_modelo],
    );

    if (checkModelo.length === 0)
      return res
          .status(404)
          .json({ success: false, message: "Modelo no encontrado" });
    const [dupCheck] = await pool.query(
        "SELECT id_modelo FROM tbl_modelos_troquel WHERE nombre_modelo = ? AND troquel_id = ? AND id_modelo != ?",
        [nombre_modelo, troquel_id, id_modelo],
    );

    if (dupCheck.length > 0)
      return res.status(400).json({
        success: false,
        message: "Ya existe otro modelo con ese nombre para este troquel",
      });

    await pool.query(
        "UPDATE tbl_modelos_troquel SET nombre_modelo = ?, troquel_id = ?, descripcion = ?, actualizado_en = NOW() WHERE id_modelo = ?",
        [nombre_modelo, troquel_id, descripcion || null, id_modelo],
    );

    res.json({ success: true, message: "Modelo actualizado exitosamente" });
  } catch (err) {
    console.error("Error updating modelo:", err);

    res.status(500).json({
      success: false,
      message: "Error al actualizar modelo",
    });
  }
});

//actualizar modelo
app.put("/api/modelos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre_modelo, troquel_id, descripcion } = req.body;

    if (!nombre_modelo)
      return res.status(400).json({
        success: false,
        message: "El nombre del modelo es requerido",
      });

    if (!troquel_id)
      return res
          .status(400)
          .json({ success: false, message: "El troquel es requerido" });

    //verificar que el modelo existe
    const [checkModelo] = await pool.query(
        "SELECT id_modelo FROM tbl_modelos_troquel WHERE id_modelo = ?",
        [id],
    );

    if (checkModelo.length === 0)
      return res
          .status(404)
          .json({ success: false, message: "Modelo no encontrado" });

    //verificar que no exista otro modelo con el mismo nombre para el mismo troquel
    const [dupCheck] = await pool.query(
        "SELECT id_modelo FROM tbl_modelos_troquel WHERE nombre_modelo = ? AND troquel_id = ? AND id_modelo != ?",
        [nombre_modelo, troquel_id, id],
    );

    if (dupCheck.length > 0)
      return res.status(400).json({
        success: false,
        message: "Ya existe otro modelo con ese nombre para este troquel",
      });

    await pool.query(
        "UPDATE tbl_modelos_troquel SET nombre_modelo = ?, troquel_id = ?, descripcion = ?, actualizado_en = NOW() WHERE id_modelo = ?",
        [nombre_modelo, troquel_id, descripcion || null, id],
    );

    res.json({ success: true, message: "Modelo actualizado exitosamente" });
  } catch (err) {
    console.error("Error updating modelo:", err);

    res.status(500).json({
      success: false,
      message: "Error al actualizar modelo",
    });
  }
});

app.get("/api/prensas", async (req, res) => {
  try {
    const [prensas] = await pool.query(
        "SELECT id_prensa, nombre, descripcion, estado, tonelaje FROM tbl_prensas WHERE estado = 'activa' ORDER BY nombre ASC",
    );

    const options = [
      {
        value: "",
        label: "Sin asignar",
      },
    ];

    prensas.forEach((p) => {
      options.push({
        value: p.nombre || p.id_prensa,
        label: p.nombre + (p.tonelaje ? ` (${p.tonelaje} ton)` : ""),
        descripcion: p.descripcion,
      });
    });

    res.json(options);
  } catch (error) {
    console.error("Error fetching prensas:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

//endpoints CRUD de prensas
//obtener todas las prensas o una prensa específica
app.get("/api/prensas/crud", async (req, res) => {
  try {
    const { id, estado } = req.query;

    if (id) {
      const [prensa] = await pool.query(
          "SELECT * FROM tbl_prensas WHERE id_prensa = ?",
          [id],
      );

      if (prensa.length === 0) {
        return res
            .status(404)
            .json({ success: false, message: "Prensa no encontrada" });
      }
      return res.json({ success: true, data: prensa[0] });
    }

    let sql = "SELECT * FROM tbl_prensas";
    const params = [];

    if (estado) {
      sql += " WHERE estado = ?";
      params.push(estado);
    }

    sql += " ORDER BY identificador_prensa ASC";
    const [prensas] = await pool.query(sql, params);
    res.json(prensas);
  } catch (error) {
    console.error("Error fetching prensas crud:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener prensas",
      error: error.message,
    });
  }
});

app.get("/api/prensas/crud/:id", async (req, res) => {
  try {
    const [prensa] = await pool.query(
        "SELECT * FROM tbl_prensas WHERE id_prensa = ?",
        [req.params.id],
    );

    if (prensa.length === 0) {
      return res
          .status(404)
          .json({ success: false, message: "Prensa no encontrada" });
    }

    res.json({ success: true, data: prensa[0] });
  } catch (error) {
    console.error("Error fetching prensa:", error);

    res.status(500).json({
      success: false,
      message: "Error al obtener prensa",
      error: error.message,
    });
  }
});

//crear nueva prensa
app.post("/api/prensas/crud", async (req, res) => {
  try {
    const {
      identificador_prensa,
      nombre,
      estado,
      tonelaje,
      marca,
      modelo,
      ubicacion,
      notas,
    } = req.body;

    if (!identificador_prensa || !identificador_prensa.trim()) {
      return res.status(400).json({
        success: false,
        message: "El identificador de la prensa es requerido",
      });
    }

    if (!nombre || !nombre.trim()) {
      return res.status(400).json({
        success: false,
        message: "El nombre de la prensa es requerido",
      });
    }

    const idUpper = identificador_prensa.trim().toUpperCase();

    //verificar si ya existe una prensa con ese identificador
    const [existing] = await pool.query(
        "SELECT id_prensa FROM tbl_prensas WHERE identificador_prensa = ?",
        [idUpper],
    );

    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Ya existe una prensa con ese identificador",
      });
    }

    const [result] = await pool.query(
        `INSERT INTO tbl_prensas (
          identificador_prensa, nombre, estado, tonelaje, marca, modelo, ubicacion, notas, creado_en, actualizado_en
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `,

        [
          idUpper,
          nombre.trim(),
          estado || "Activa",
          tonelaje || null,
          marca || null,
          modelo || null,
          ubicacion || null,
          notas || null,
        ],
    );

    res.status(201).json({
      success: true,
      message: "Prensa registrada exitosamente",
      id_prensa: result.insertId,
      identificador_prensa: idUpper,
    });
  } catch (error) {
    console.error("Error creating prensa:", error);

    res.status(500).json({
      success: false,
      message: "Error al crear la prensa",
      error: error.message,
    });
  }
});

//actualizar prensa
app.put("/api/prensas/crud", async (req, res) => {
  try {
    const data = req.body;
    const id = data.id_prensa;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "El ID de la prensa es requerido para actualizar",
      });
    }

    const [existing] = await pool.query(
        "SELECT id_prensa FROM tbl_prensas WHERE id_prensa = ?",
        [id],
    );

    if (existing.length === 0) {
      return res
          .status(404)
          .json({ success: false, message: "Prensa no encontrada" });
    }

    const allowedFields = [
      "nombre",
      "estado",
      "tonelaje",
      "marca",
      "modelo",
      "ubicacion",
      "notas",
    ];

    const updates = [];
    const params = [];

    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        updates.push(`${field} = ?`);
        params.push(data[field]);
      }
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No hay datos para actualizar",
      });
    }

    updates.push("actualizado_en = NOW()");
    params.push(id);

    await pool.query(
        `UPDATE tbl_prensas SET ${updates.join(", ")} WHERE id_prensa = ?`,
        params,
    );

    res.json({
      success: true,
      message: "Prensa actualizada exitosamente",
      rows_affected: 1,
    });
  } catch (error) {
    console.error("Error updating prensa:", error);

    res.status(500).json({
      success: false,
      message: "Error al actualizar la prensa",
      error: error.message,
    });
  }
});

//actualizar prensa (ID en URL)
app.put("/api/prensas/crud/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const [existing] = await pool.query(
        "SELECT id_prensa FROM tbl_prensas WHERE id_prensa = ?",
        [id],
    );

    if (existing.length === 0) {
      return res
          .status(404)
          .json({ success: false, message: "Prensa no encontrada" });
    }

    const allowedFields = [
      "nombre",
      "estado",
      "tonelaje",
      "marca",
      "modelo",
      "ubicacion",
      "notas",
    ];

    const updates = [];
    const params = [];

    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        updates.push(`${field} = ?`);
        params.push(data[field]);
      }
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No hay datos para actualizar",
      });
    }

    updates.push("actualizado_en = NOW()");
    params.push(id);

    await pool.query(
        `UPDATE tbl_prensas SET ${updates.join(", ")} WHERE id_prensa = ?`,
        params,
    );

    res.json({ success: true, message: "Prensa actualizada exitosamente" });
  } catch (error) {
    console.error("Error updating prensa:", error);

    res.status(500).json({
      success: false,
      message: "Error al actualizar la prensa",
      error: error.message,
    });
  }
});

//eliminar prensa
app.delete("/api/prensas/crud", async (req, res) => {
  try {
    const id = req.query.id;

    if (!id) {
      return res
          .status(400)

          .json({
            success: false,
            message: "El ID de la prensa es requerido",
          });
    }

    const [existing] = await pool.query(
        "SELECT id_prensa, identificador_prensa FROM tbl_prensas WHERE id_prensa = ?",
        [id],
    );

    if (existing.length === 0) {
      return res
          .status(404)
          .json({ success: false, message: "Prensa no encontrada" });
    }

    const identificador = existing[0].identificador_prensa;

    const [troquelesCount] = await pool.query(
        "SELECT COUNT(*) as count FROM tbl_troqueles WHERE prensa_asignada = ?",
        [identificador],
    );

    const desasignados = troquelesCount[0].count;

    if (desasignados > 0) {
      await pool.query(
          "UPDATE tbl_troqueles SET prensa_asignada = NULL WHERE prensa_asignada = ?",
          [identificador],
      );
    }

    await pool.query("DELETE FROM tbl_prensas WHERE id_prensa = ?", [id]);

    res.json({
      success: true,
      message: "Prensa eliminada exitosamente",
      troqueles_desasignados: desasignados,
    });
  } catch (error) {
    console.error("Error deleting prensa:", error);
    res.status(500).json({
      success: false,
      message: "Error al eliminar la prensa",
      error: error.message,
    });
  }
});

//eliminar prensa
app.delete("/api/prensas/crud/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [existing] = await pool.query(
        "SELECT id_prensa, identificador_prensa FROM tbl_prensas WHERE id_prensa = ?",
        [id],
    );

    if (existing.length === 0) {
      return res
          .status(404)
          .json({ success: false, message: "Prensa no encontrada" });
    }

    const identificador = existing[0].identificador_prensa;

    //verificar si hay troqueles asignados y desasignarlos
    const [troquelesCount] = await pool.query(
        "SELECT COUNT(*) as count FROM tbl_troqueles WHERE prensa_asignada = ?",
        [identificador],
    );

    const desasignados = troquelesCount[0].count;

    if (desasignados > 0) {
      await pool.query(
          "UPDATE tbl_troqueles SET prensa_asignada = NULL WHERE prensa_asignada = ?",
          [identificador],
      );
    }

    await pool.query("DELETE FROM tbl_prensas WHERE id_prensa = ?", [id]);

    res.json({
      success: true,
      message: "Prensa eliminada exitosamente",
      troqueles_desasignados: desasignados,
    });
  } catch (error) {
    console.error("Error deleting prensa:", error);

    res.status(500).json({
      success: false,
      message: "Error al eliminar la prensa",
      error: error.message,
    });
  }
});

app.get("/api/tipos_troquel", async (req, res) => {
  try {
    const [tipos] = await pool.query(
        "SELECT id_tipo_troquel as id, codigo, nombre, descripcion FROM tbl_tipos_troquel WHERE activo = 1 ORDER BY nombre ASC",
    );

    const options = tipos.map((t) => ({
      value: t.codigo || t.id,
      label: t.nombre,
      descripcion: t.descripcion,
    }));

    res.json(options);
  } catch (error) {
    console.error("Error fetching tipos_troquel:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

app.get("/api/estados", async (req, res) => {
  try {
    const [estados] = await pool.query(
        "SELECT id_estado as id, codigo, nombre, color, descripcion FROM tbl_estados WHERE activo = 1 ORDER BY orden ASC, nombre ASC",
    );

    const options = estados.map((e) => ({
      value: e.codigo || e.nombre,
      label: e.nombre,
      color: e.color,
      descripcion: e.descripcion,
    }));

    res.json(options);
  } catch (error) {
    console.error("Error fetching estados:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

app.get("/api/asistencia-prensa", async (req, res) => {
  try {
    const [asistencias] = await pool.query(
        "SELECT id_asistencia_prensa as id, descripcion FROM tbl_asistencia_prensa WHERE activo = 1 ORDER BY descripcion ASC",
    );

    res.json(
        asistencias.map((a) => ({
          id: a.id,
          description: a.descripcion,
        })),
    );
  } catch (error) {
    console.error("Error fetching asistencia_prensa:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

app.get("/api/fallas", async (req, res) => {
  try {
    const [fallas] = await pool.query(
        "SELECT id_fallas_catalogo, descripcion FROM tbl_fallas_catalogo WHERE activo = 1 ORDER BY descripcion",
    );

    res.json(
        fallas.map((f) => ({
          id: f.id_fallas_catalogo,
          description: f.descripcion,
        })),
    );
  } catch (error) {
    console.error("Error fetching fallas:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

//enpoint de troqueles
app.get("/api/troqueles", async (req, res) => {
  try {
    const [troqueles] = await pool.query(`
      SELECT t.*, cr.prioridad AS prioridad_reparacion
      FROM tbl_troqueles t
             LEFT JOIN tbl_ciclos_reparacion cr
                       ON cr.troquel_id COLLATE utf8mb4_general_ci = t.id_troquel AND cr.ciclo_activo = TRUE
      ORDER BY t.año DESC, t.id_troquel
    `);

    const groupedByYear = {};

    troqueles.forEach((t) => {
      const year = t.año;

      if (!groupedByYear[year]) {
        groupedByYear[year] = [];
      }

      groupedByYear[year].push({
        id: t.id_troquel,
        name: t.nombre,
        status: t.estado,
        year: t.año,
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
        comentarios: t.comentarios,
        prioridad_reparacion: t.prioridad_reparacion || null,
      });
    });

    res.json(groupedByYear);
  } catch (error) {
    console.error("Error fetching troqueles:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

app.get("/api/troqueles/list", async (req, res) => {
  try {
    const [troqueles] = await pool.query(`
      SELECT * FROM tbl_troqueles
      ORDER BY creado_en DESC
    `);

    res.json(troqueles);
  } catch (error) {
    console.error("Error fetching troqueles list:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

app.get("/api/troqueles/search", async (req, res) => {
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
    console.error("Error searching troqueles:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

app.get("/api/troqueles/:id", async (req, res) => {
  try {
    const [troqueles] = await pool.query(
        "SELECT * FROM tbl_troqueles WHERE id_troquel = ?",
        [req.params.id],
    );

    if (troqueles.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Troquel no encontrado",
      });
    }

    res.json(troqueles[0]);
  } catch (error) {
    console.error("Error fetching troquel:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

//obtener ciclo activo para el troquel
app.get("/api/troqueles/:id/ciclo-activo", async (req, res) => {
  try {
    const [rows] = await pool.query(
        `SELECT
           cr.*,
           TIMESTAMPDIFF(MINUTE, cr.fecha_inicio_reparacion, NOW()) AS minutos_transcurridos,
           TIMESTAMPDIFF(HOUR, cr.fecha_inicio_reparacion, NOW()) AS horas_transcurridas,
           TIMESTAMPDIFF(DAY, cr.fecha_inicio_reparacion, NOW()) AS dias_transcurridos
         FROM tbl_ciclos_reparacion cr
         WHERE cr.troquel_id = ? AND cr.ciclo_activo = TRUE
         ORDER BY cr.fecha_inicio_reparacion DESC
           LIMIT 1
        `,
        [req.params.id],
    );

    if (rows.length === 0) {
      return res.json({
        ciclo: null,
        message: "No active repair cycle found",
      });
    }

    //obtener el tecnico para el ciclo
    const [tecnicos] = await pool.query(
        `SELECT * FROM tbl_tecnicos_ciclo
         WHERE ciclo_id = ?
         ORDER BY fecha_inicio ASC`,
        [rows[0].id_ciclo_reparacion],
    );

    res.json({
      ciclo: rows[0],
      tecnicos: tecnicos,
    });
  } catch (error) {
    console.error("Error fetching active cycle:", error);

    res.status(500).json({
      error: "Failed to fetch active repair cycle",
    });
  }
});

//obtener el historial de reparacion para el troquel
app.get("/api/troqueles/:id/ciclos-historial", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;

    const [rows] = await pool.query(
        `SELECT
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
           LIMIT ?`,
        [req.params.id, limit],
    );

    res.json(rows);
  } catch (error) {
    console.error("Error fetching repair history:", error);
    res.status(500).json({
      error: "Failed to fetch repair history",
    });
  }
});

//obtener estadisticas del troquel
app.get("/api/troqueles/:id/estadisticas", async (req, res) => {
  try {
    const [stats] = await pool.query(
        `SELECT
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
         GROUP BY troquel_id`,
        [req.params.id],
    );

    res.json(
        stats[0] || {
          total_reparaciones: 0,
          reparaciones_completadas: 0,
          promedio_horas_reparacion: null,
        },
    );
  } catch (error) {
    console.error("Error fetching statistics:", error);

    res.status(500).json({
      error: "Failed to fetch statistics",
    });
  }
});

//obtener todas las reparaciones actvas
app.get("/api/reparaciones-activas", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        cr.id_ciclo_reparacion,
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
      ORDER BY cr.prioridad ASC, cr.fecha_inicio_reparacion ASC`);

    //obtener los tecnicos para cada reparacion activa
    for (let row of rows) {
      const [tecnicos] = await pool.query(
          `SELECT empleado_nombre, grupo, tipo
           FROM tbl_tecnicos_ciclo
           WHERE ciclo_id = ? AND fecha_fin IS NULL`,
          [row.id_ciclo_reparacion],
      );
      row.tecnicos = tecnicos;
    }

    res.json(rows);
  } catch (error) {
    console.error("Error fetching active repairs:", error);

    res.status(500).json({
      error: "Failed to fetch active repairs",
    });
  }
});

//obtener resumen mensual
app.get("/api/resumen-mensual", async (req, res) => {
  try {
    const year = req.query.year || new Date().getFullYear();

    const [rows] = await pool.query(
        `SELECT
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
        `,
        [year],
    );

    res.json(rows);
  } catch (error) {
    console.error("Error fetching monthly summary:", error);

    res.status(500).json({
      error: "Failed to fetch monthly summary",
    });
  }
});

//empezar nuevo ciclo de reparacion
app.post("/api/troqueles/:id/iniciar-ciclo", async (req, res) => {
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
      prioridad,
    } = req.body;

    //revisar si existe algun ciclo activo
    const [existing] = await connection.query(
        `SELECT id_ciclo_reparacion FROM tbl_ciclos_reparacion
         WHERE troquel_id = ? AND ciclo_activo = TRUE`,
        [req.params.id],
    );

    if (existing.length > 0) {
      await connection.rollback();

      return res.status(400).json({
        error: "Active repair cycle already exists",
        ciclo_id: existing[0].id_ciclo_reparacion,
      });
    }

    //insertar nuevo ciclo de reparacion
    const [result] = await connection.query(
        `INSERT INTO tbl_ciclos_reparacion (
          troquel_id, troquel_nombre, modelo,
          fecha_inicio_reparacion, motivo_entrada,
          falla_id, falla_descripcion,
          folio_entrada, empleado_registro, comentarios_entrada,
          status_anterior, prensa_origen,
          nivel_reparacion, grupo_reparacion, prioridad,
          fecha_bajado, ciclo_activo
        ) VALUES (?, ?, ?, NOW(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), TRUE)`,

        [
          req.params.id,
          troquel_nombre,
          modelo,
          motivo_entrada,
          falla_id || null,
          falla_descripcion || null,
          folio,
          empleado,
          comentarios || null,
          status_anterior || "En prensa",
          prensa_origen || null,
          nivel || null,
          grupo || null,
          prioridad || 3,
        ],
    );

    //actualizar el estado del troquel a reparando
    await connection.query(
        `UPDATE tbl_troqueles SET estado = 'Reparando' WHERE id_troquel = ?`,
        [req.params.id],
    );

    await connection.commit();

    res.json({
      success: true,
      ciclo_id: result.insertId,
      message: "Repair cycle started successfully",
    });
  } catch (error) {
    await connection.rollback();
    console.error("Error starting repair cycle:", error);

    res.status(500).json({
      error: "Failed to start repair cycle",
    });
  } finally {
    connection.release();
  }
});

//actualizar pasos de proceso de reparacion
app.post("/api/ciclos/:id/actualizar-paso", async (req, res) => {
  try {
    const { paso } = req.body;
    let field;

    switch (paso) {
      case "recepcion":
        field = "fecha_recepcion_taller";
        break;

      case "inicio":
        field = "fecha_inicio_trabajo";
        break;

      case "termino":
        field = "fecha_termino_trabajo";
        break;

      default:
        return res.status(400).json({
          error: "Invalid step",
        });
    }

    await pool.query(
        `UPDATE tbl_ciclos_reparacion
         SET ${field} = NOW()
         WHERE id_ciclo_reparacion = ? AND ciclo_activo = TRUE`,
        [req.params.id],
    );

    //obtener ciclo actualizado
    const [updated] = await pool.query(
        `SELECT fecha_bajado, fecha_recepcion_taller, fecha_inicio_trabajo, fecha_termino_trabajo
         FROM tbl_ciclos_reparacion WHERE id_ciclo_reparacion = ?`,
        [req.params.id],
    );

    res.json({
      success: true,
      proceso: updated[0],
    });
  } catch (error) {
    console.error("Error updating repair step:", error);

    res.status(500).json({
      error: "Failed to update repair step",
    });
  }
});

//agregar tecnico a ciclo de reparacion
app.post("/api/ciclos/:id/tecnicos", async (req, res) => {
  try {
    const { empleado_numero, empleado_nombre, grupo, tipo } = req.body;
    const [result] = await pool.query(
        `INSERT INTO tbl_tecnicos_ciclo (ciclo_id, empleado_numero, empleado_nombre, grupo, tipo)
         VALUES (?, ?, ?, ?, ?)`,
        [
          req.params.id,
          empleado_numero || null,
          empleado_nombre,
          grupo || null,
          tipo || "Técnico",
        ],
    );

    //obtener tecnico insertado
    const [tecnico] = await pool.query(
        `SELECT * FROM tbl_tecnicos_ciclo WHERE id_tecnicos_ciclos = ?`,
        [result.insertId],
    );

    res.json({
      success: true,

      tecnico: tecnico[0],
    });
  } catch (error) {
    console.error("Error adding technician:", error);

    res.status(500).json({
      error: "Failed to add technician",
    });
  }
});

//quitar tecnico del ciclo de reparacion
app.delete("/api/tecnicos/:id", async (req, res) => {
  try {
    await pool.query(
        `
          UPDATE tbl_tecnicos_ciclo SET fecha_fin = NOW() WHERE id_tecnicos_ciclos = ? AND fecha_fin IS NULL
        `,
        [req.params.id],
    );

    res.json({
      success: true,
    });
  } catch (error) {
    console.error("Error removing technician:", error);

    res.status(500).json({
      error: "Failed to remove technician",
    });
  }
});

//actualizar prioridad de ciclo

app.post("/api/ciclos/:id/prioridad", async (req, res) => {
  try {
    const { prioridad } = req.body;

    await pool.query(
        `

          UPDATE tbl_ciclos_reparacion SET prioridad = ? WHERE id_ciclo_reparacion = ?

        `,

        [prioridad, req.params.id],
    );

    res.json({
      success: true,
    });
  } catch (error) {
    console.error("Error updating priority:", error);

    res.status(500).json({
      error: "Failed to update priority",
    });
  }
});

//agregar detalle of falla al ciclo

app.post("/api/ciclos/:id/agregar-detalle", async (req, res) => {
  try {
    const { falla_id, falla_descripcion } = req.body;

    //obtener datos de la falla actual

    const [current] = await pool.query(
        `

          SELECT falla_descripcion FROM tbl_ciclos_reparacion WHERE id_ciclo_reparacion = ?

        `,

        [req.params.id],
    );

    //agregar nueva falla a la ya eixstente

    const newDescripcion = current[0].falla_descripcion
        ? `${current[0].falla_descripcion}; ${falla_descripcion}`
        : falla_descripcion;

    await pool.query(
        `

          UPDATE tbl_ciclos_reparacion

          SET falla_id = COALESCE(falla_id, ?), falla_descripcion = ?

          WHERE id_ciclo_reparacion = ?

        `,

        [falla_id, newDescripcion, req.params.id],
    );

    res.json({
      success: true,
    });
  } catch (error) {
    console.error("Error adding detail:", error);

    res.status(500).json({
      error: "Failed to add detail",
    });
  }
});

//poner el ciclo como pendiente

app.post("/api/ciclos/:id/pendiente", async (req, res) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const { fecha_liberacion, motivo, empleado } = req.body;

    //obtener informacion del ciclo

    const [ciclo] = await connection.query(
        `

          SELECT troquel_id FROM tbl_ciclos_reparacion WHERE id_ciclo_reparacion = ?

        `,

        [req.params.id],
    );

    if (ciclo.length === 0) {
      await connection.rollback();

      return res.status(404).json({
        error: "Repair cycle not found",
      });
    }

    //cerrar ciclo actual con estado pendiente

    await connection.query(
        `

          UPDATE tbl_ciclos_reparacion

          SET

            fecha_fin_reparacion = NOW(),

            status_salida = 'Pendiente',

            empleado_cierre = ?,

            comentarios_salida = ?,

            ciclo_activo = FALSE

          WHERE id_ciclo_reparacion = ?

        `,

        [
          empleado,

          `Pendiente hasta: ${fecha_liberacion}. Motivo: ${motivo}`,

          req.params.id,
        ],
    );

    //actualizar el estado del troquel

    await connection.query(
        `

          UPDATE tbl_troqueles SET estado = 'Pendiente' WHERE id_troquel = ?

        `,

        [ciclo[0].troquel_id],
    );

    await connection.commit();

    res.json({
      success: true,
    });
  } catch (error) {
    await connection.rollback();

    console.error("Error setting pending:", error);

    res.status(500).json({
      error: "Failed to set as pending",
    });
  } finally {
    connection.release();
  }
});

//cerrar e ciclo de reparacion

app.post("/api/ciclos/:id/cerrar", async (req, res) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const { status_salida, empleado_cierre, comentarios, folio } = req.body;

    //obtener el ciclo para encontrar el id del troquel

    const [ciclo] = await connection.query(
        `

          SELECT troquel_id FROM tbl_ciclos_reparacion WHERE id_ciclo_reparacion = ? AND ciclo_activo = TRUE

        `,

        [req.params.id],
    );

    if (ciclo.length === 0) {
      await connection.rollback();

      return res.status(404).json({
        error: "Active repair cycle not found",
      });
    }

    //cerrar el ciclo de reparacion

    await connection.query(
        `

          UPDATE tbl_ciclos_reparacion

          SET

            fecha_fin_reparacion = NOW(),

            status_salida = ?,

            empleado_cierre = ?,

            comentarios_salida = ?,

            folio_salida = ?,

            fecha_termino_trabajo = COALESCE(fecha_termino_trabajo, NOW()),

            ciclo_activo = FALSE

          WHERE id_ciclo_reparacion = ? AND ciclo_activo = TRUE

        `,

        [
          status_salida,

          empleado_cierre,

          comentarios || null,

          folio || null,

          req.params.id,
        ],
    );

    //cerrar todas las asignaciones de tecnicos

    await connection.query(
        `

          UPDATE tbl_tecnicos_ciclo

          SET fecha_fin = NOW()

          WHERE ciclo_id = ? AND fecha_fin IS NULL

        `,

        [req.params.id],
    );

    //actualizar el estado del troquel

    await connection.query(
        `

          UPDATE tbl_troqueles SET estado = ? WHERE id_troquel = ?

        `,

        [status_salida, ciclo[0].troquel_id],
    );

    await connection.commit();

    res.json({
      success: true,

      message: "Repair cycle closed successfully",
    });
  } catch (error) {
    await connection.rollback();

    console.error("Error closing repair cycle:", error);

    res.status(500).json({
      error: "Failed to close repair cycle",
    });
  } finally {
    connection.release();
  }
});

//registrar accion y empezar un nuevo ciclo

app.post("/api/troqueles/:id/action", async (req, res) => {
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

      new_status,
    } = req.body;

    //obtener info de troquel
    const [troquelInfo] = await connection.query(
        `
          SELECT id_troquel as troquel_id, nombre, modelo, estado as status, prensa_asignada as prensa_actual
          FROM tbl_troqueles WHERE id_troquel = ?
        `,
        [req.params.id],
    );

    if (troquelInfo.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        error: "Troquel not found",
      });
    }

    const troquel = troquelInfo[0];

    //obtener descripcion de falla si aplica
    let falla_descripcion = null;
    if (falla_id) {
      const [falla] = await connection.query(
          `
            SELECT descripcion FROM tbl_fallas_catalogo WHERE id_fallas_catalogo = ?
          `,

          [falla_id],
      );

      if (falla.length > 0) {
        falla_descripcion = falla[0].descripcion;
      }
    }

    //insertar en el historial

    const [historyResult] = await connection.query(
        `

          INSERT INTO tbl_historial (

            troquel_id, tipo_registro, action_type, id_falla, modelo_nuevo,

            folio, comentarios, empleado_troquel, nivel_setup, grupo

          ) VALUES (?, 'baja_troquel', ?, ?, ?, ?, ?, ?, ?, ?)

        `,

        [
          req.params.id,

          tipo_accion,

          falla_id || null,

          modelo_nuevo_id || null,

          folio,

          comentarios || null,

          empleado,

          nivel || null,

          grupo || null,
        ],
    );

    //actualizar estatus del troquel

    if (new_status) {
      await connection.query(
          `

            UPDATE tbl_troqueles SET estado = ? WHERE id_troquel = ?

          `,

          [new_status, req.params.id],
      );

      //si esta cambiando a reparando, crear nuevo ciclo de reparacion

      if (new_status === "Reparando") {
        //mapear el tipo de accion del motivo de entrada

        let motivo_entrada = "Otro";

        if (tipo_accion === "Falla de Troquel")
          motivo_entrada = "Falla de Troquel";
        else if (tipo_accion === "Limpieza General")
          motivo_entrada = "Limpieza General";
        else if (tipo_accion === "Cambio de Modelo")
          motivo_entrada = "Cambio de Modelo";

        //revisar por ciclos activos existentes

        const [existingCycle] = await connection.query(
            `

              SELECT id_ciclo_reparacion FROM tbl_ciclos_reparacion

              WHERE troquel_id = ? AND ciclo_activo = TRUE

            `,

            [req.params.id],
        );

        if (existingCycle.length === 0) {
          //crear nuevo ciclo de reparacion

          await connection.query(
              `

                INSERT INTO tbl_ciclos_reparacion (

                  troquel_id, troquel_nombre, modelo,

                  fecha_inicio_reparacion, motivo_entrada,

                  falla_id, falla_descripcion, folio_entrada,

                  empleado_registro, comentarios_entrada, status_anterior,

                  prensa_origen, nivel_reparacion, grupo_reparacion,

                  fecha_bajado, ciclo_activo

                ) VALUES (?, ?, ?, NOW(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), TRUE)

              `,

              [
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

                grupo || null,
              ],
          );
        }
      }
    }

    await connection.commit();

    res.json({
      success: true,

      history_id: historyResult.insertId,
    });
  } catch (error) {
    await connection.rollback();

    console.error("Error recording action:", error);

    res.status(500).json({
      error: "Error recording action",
    });
  } finally {
    connection.release();
  }
});

//crear nuevo troquel

app.post("/api/troqueles", async (req, res) => {
  try {
    const {
      id_troquel,

      nombre,

      estado = "Pendiente",

      año,

      modelo,

      golpes = "-",

      golpes_acum = "-",

      capacidad_golpes = "-",

      rectificaciones = "0",

      tipo_troquel = "Null",

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

      image_url,
    } = req.body;

    if (!id_troquel || !nombre || !año) {
      return res.status(400).json({
        success: false,

        message: "ID, nombre y año son requeridos",
      });
    }

    const id = id_troquel.trim().toUpperCase();

    const [existing] = await pool.query(
        "SELECT id_troquel FROM tbl_troqueles WHERE id_troquel = ?",

        [id],
    );

    if (existing.length > 0) {
      return res.status(409).json({
        success: false,

        message: "Ya existe un troquel con ese ID",
      });
    }

    await pool.query(
        `

          INSERT INTO tbl_troqueles (

            id_troquel, nombre, estado, año, modelo,

            golpes, golpes_acum, capacidad_golpes, rectificaciones,

            tipo_troquel, ubicacion, prensa_asignada, numero_serie,

            proveedor, peso_kg, dimensiones, material_base,

            num_estaciones, cavidades, color, ciclos,

            n_parte_1, n_parte_2, n_parte_3, n_parte_4, n_parte_5, n_parte_6,

            comentarios, image_url

          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)

        `,

        [
          id,

          nombre,

          estado,

          año,

          modelo,

          golpes,

          golpes_acum,

          capacidad_golpes,

          rectificaciones,

          tipo_troquel,

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

          image_url,
        ],
    );

    res.status(201).json({
      success: true,

      message: "Troquel registrado exitosamente",

      id: id,
    });
  } catch (error) {
    console.error("Error creating troquel:", error);

    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
});

//actualizar troquel

app.put("/api/troqueles/:id", async (req, res) => {
  try {
    const id = req.params.id;

    const [existing] = await pool.query(
        "SELECT * FROM tbl_troqueles WHERE id_troquel = ?",

        [id],
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,

        message: "Troquel no encontrado",
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

      image_url = current.image_url,
    } = req.body;

    await pool.query(
        `

          UPDATE tbl_troqueles SET

                                 nombre = ?, estado = ?, año = ?, modelo = ?,

                                 golpes = ?, golpes_acum = ?, capacidad_golpes = ?, rectificaciones = ?,

                                 tipo_troquel = ?, ubicacion = ?, prensa_asignada = ?, numero_serie = ?,

                                 proveedor = ?, peso_kg = ?, dimensiones = ?, material_base = ?,

                                 num_estaciones = ?, cavidades = ?, color = ?, ciclos = ?,

                                 n_parte_1 = ?, n_parte_2 = ?, n_parte_3 = ?, n_parte_4 = ?, n_parte_5 = ?, n_parte_6 = ?,

                                 comentarios = ?, image_url = ?

          WHERE id_troquel = ?

        `,

        [
          nombre,

          estado,

          año,

          modelo,

          golpes,

          golpes_acum,

          capacidad_golpes,

          rectificaciones,

          tipo_troquel,

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

          image_url,

          id,
        ],
    );

    await logChange(
        pool,

        id,

        "update",

        JSON.stringify(current),

        JSON.stringify(req.body),
    );

    res.json({
      success: true,

      message: "Troquel actualizado exitosamente",
    });
  } catch (error) {
    console.error("Error updating troquel:", error);

    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
});

//actualizar solamente el estado del troquel

app.patch("/api/troqueles/:id/status", async (req, res) => {
  try {
    const { status } = req.body;

    await pool.query(
        "UPDATE tbl_troqueles SET estado = ? WHERE id_troquel = ?",

        [status, req.params.id],
    );

    res.json({
      success: true,
    });
  } catch (error) {
    console.error("Error updating status:", error);

    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
});

//eliminar troquel

app.delete("/api/troqueles/:id", async (req, res) => {
  try {
    const id = req.params.id;

    const [existing] = await pool.query(
        "SELECT id_troquel, nombre FROM tbl_troqueles WHERE id_troquel = ?",

        [id],
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,

        message: "Troquel no encontrado",
      });
    }

    await pool.query("DELETE FROM tbl_troqueles WHERE id_troquel = ?", [id]);

    res.json({
      success: true,

      message: `Troquel ${id} eliminado correctamente`,
    });
  } catch (error) {
    console.error("Error deleting troquel:", error);

    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
});

//obtener historial de troquel

app.get("/api/troqueles/:id/history", async (req, res) => {
  try {
    const [history] = await pool.query(
        `

          SELECT

            h.*,

            fc.descripcion as falla_descripcion,

            ap.descripcion as motivo_descripcion

          FROM tbl_historial h

                 LEFT JOIN tbl_fallas_catalogo fc ON h.id_falla = fc.id_fallas_catalogo

                 LEFT JOIN tbl_asistencia_prensa ap ON h.id_falla = ap.id_asistencia_prensa

          WHERE h.troquel_id = ?

          ORDER BY h.creado_el DESC

        `,

        [req.params.id],
    );

    res.json(
        history.map((h) => ({
          id: h.id_historial,

          tipo_registro: h.tipo_registro || "legacy",

          action_type: h.action_type,

          folio: h.folio,

          falla_description: h.falla_descripcion,

          motivo_description: h.motivo_descripcion,

          modelo_nuevo: h.modelo_nuevo,

          nivel_setup: h.nivel_setup,

          grupo: h.grupo,

          comentarios: h.comentarios,

          comentarios_supervisor: h.comentarios_supervisor,

          empleado: h.empleado_troquel || h.empleado_asistencia,

          created_at: h.creado_el,
        })),
    );
  } catch (error) {
    console.error("Error fetching history:", error);

    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
});

//estadisticas y resumen

app.get("/api/estadisticas", async (req, res) => {
  try {
    const [total] = await pool.query(
        "SELECT COUNT(*) as count FROM tbl_troqueles",
    );

    const [activos] = await pool.query(
        "SELECT COUNT(*) as count FROM tbl_troqueles WHERE estado IN ('En prensa', 'Listo')",
    );

    const [reparando] = await pool.query(
        "SELECT COUNT(*) as count FROM tbl_troqueles WHERE estado = 'Reparando'",
    );

    const [pendientes] = await pool.query(
        "SELECT COUNT(*) as count FROM tbl_troqueles WHERE estado = 'Pendiente'",
    );

    res.json({
      total: total[0].count,

      activos: activos[0].count,

      reparando: reparando[0].count,

      pendientes: pendientes[0].count,
    });
  } catch (error) {
    console.error("Error fetching estadisticas:", error);

    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
});

app.get("/api/priority-repairs", async (req, res) => {
  try {
    const [repairs] = await pool.query(`

      SELECT cr.prioridad, t.id_troquel, t.nombre

      FROM tbl_ciclos_reparacion cr

             JOIN tbl_troqueles t ON cr.troquel_id COLLATE utf8mb4_general_ci = t.id_troquel

      WHERE cr.ciclo_activo = TRUE

      ORDER BY cr.prioridad ASC, cr.fecha_inicio_reparacion ASC

    `);

    res.json(
        repairs.map((r) => ({
          priority: r.prioridad,

          id: r.id_troquel,

          name: r.nombre,
        })),
    );
  } catch (error) {
    console.error("Error fetching priority repairs:", error);

    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
});

app.get("/api/troqueles-summary", async (req, res) => {
  try {
    const [summary] = await pool.query(
        'SELECT etiqueta, count, goal, perf FROM tbl_resumen_troqueles ORDER BY FIELD(etiqueta, "UP", "BACKUP", "TOTAL")',
    );

    if (summary.length > 0) {
      res.json(
          summary.map((s) => ({
            label: s.etiqueta,

            count: s.count,

            goal: s.goal,

            perf: s.perf,
          })),
      );
    } else {
      //fallback para calcular valores

      const [total] = await pool.query(
          "SELECT COUNT(*) as count FROM tbl_troqueles",
      );

      const [up] = await pool.query(
          "SELECT COUNT(*) as count FROM tbl_troqueles WHERE estado = 'En prensa'",
      );

      const [backup] = await pool.query(
          "SELECT COUNT(*) as count FROM tbl_troqueles WHERE estado = 'Listo-BackUp'",
      );

      res.json([
        {
          label: "UP",

          count: up[0].count,

          goal: null,

          perf: null,
        },

        {
          label: "BACKUP",

          count: backup[0].count,

          goal: null,

          perf: null,
        },

        {
          label: "TOTAL",

          count: total[0].count,

          goal: null,

          perf: null,
        },
      ]);
    }
  } catch (error) {
    console.error("Error fetching summary:", error);

    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
});

//endpoints antiguos querse con ellos para compatibilidad

app.post("/api/actions/baja-troquel", async (req, res) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const {
      troquel_id,

      action_type,

      folio,

      falla_id,

      modelo_nuevo,

      nivel_setup,

      grupo,

      comentarios,

      empleado,

      prioridad_reparacion,
    } = req.body;

    if (!troquel_id || !empleado?.trim() || !folio?.trim()) {
      await connection.rollback();

      return res.status(400).json({
        success: false,

        message: "Troquel ID, empleado y folio son requeridos",
      });
    }

    //obtener ifno del troquel

    const [troquelInfo] = await connection.query(
        "SELECT nombre, modelo, estado, prensa_asignada FROM tbl_troqueles WHERE id_troquel = ?",

        [troquel_id],
    );

    if (troquelInfo.length === 0) {
      await connection.rollback();

      return res.status(404).json({
        success: false,

        message: "Troquel no encontrado",
      });
    }

    const troquel = troquelInfo[0];

    //obtener descripcion de la falla si aplica

    let falla_descripcion = null;

    if (falla_id) {
      const [falla] = await connection.query(
          "SELECT descripcion FROM tbl_fallas_catalogo WHERE id_fallas_catalogo = ?",

          [falla_id],
      );

      if (falla.length > 0) {
        falla_descripcion = falla[0].descripcion;
      }
    }

    //insertar en el historial

    await connection.query(
        `

          INSERT INTO tbl_historial (

            troquel_id, tipo_registro, action_type, folio, id_falla,

            modelo_nuevo, nivel_setup, grupo, comentarios, empleado_troquel

          ) VALUES (?, 'baja_troquel', ?, ?, ?, ?, ?, ?, ?, ?)

        `,

        [
          troquel_id,

          action_type,

          folio.trim(),

          falla_id || null,

          modelo_nuevo || null,

          nivel_setup || null,

          grupo || null,

          comentarios || null,

          empleado.trim(),
        ],
    );

    //actualizar estado a reparando

    await connection.query(
        "UPDATE tbl_troqueles SET estado = 'Reparando' WHERE id_troquel = ?",

        [troquel_id],
    );

    //crear ciclo de reparacion

    const [existingCycle] = await connection.query(
        "SELECT id_ciclo_reparacion FROM tbl_ciclos_reparacion WHERE troquel_id = ? AND ciclo_activo = TRUE",

        [troquel_id],
    );

    if (existingCycle.length === 0) {
      await connection.query(
          `

            INSERT INTO tbl_ciclos_reparacion (

              troquel_id, troquel_nombre, modelo, fecha_inicio_reparacion,

              motivo_entrada, falla_id, falla_descripcion, folio_entrada,

              empleado_registro, comentarios_entrada, status_anterior,

              prensa_origen, nivel_reparacion, grupo_reparacion, prioridad,

              fecha_bajado, ciclo_activo

            ) VALUES (?, ?, ?, NOW(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), TRUE)

          `,

          [
            troquel_id,

            troquel.nombre,

            troquel.modelo,

            action_type,

            falla_id || null,

            falla_descripcion,

            folio.trim(),

            empleado.trim(),

            comentarios || null,

            troquel.estado,

            troquel.prensa_asignada,

            nivel_setup || null,

            grupo || null,

            prioridad_reparacion || 2,
          ],
      );
    }

    await connection.commit();

    res.json({
      success: true,

      message:
          'Baja de troquel registrada exitosamente. Estado cambiado a "Reparando"',
    });
  } catch (error) {
    await connection.rollback();

    console.error("Error creating baja troquel:", error);

    res.status(500).json({
      success: false,

      message: error.message,
    });
  } finally {
    connection.release();
  }
});

app.post("/api/actions/asistencia-prensa", async (req, res) => {
  try {
    const { troquel_id, folio, motivo_id, comentarios, empleado } = req.body;

    if (!troquel_id) {
      return res.status(400).json({
        success: false,

        message: "ID de troquel requerido",
      });
    }

    if (!empleado || !empleado.trim()) {
      return res.status(400).json({
        success: false,

        message: "Nombre del empleado requerido",
      });
    }

    if (!folio || !folio.trim()) {
      return res.status(400).json({
        success: false,

        message: "Número de folio requerido",
      });
    }

    if (!motivo_id) {
      return res.status(400).json({
        success: false,

        message: "Motivo de asistencia requerido",
      });
    }

    //obtener descricpcion de motivo para el tipo de accion

    let motivoDescription = "Asistencia en Prensa";

    try {
      const [motivos] = await pool.query(
          "SELECT descripcion FROM tbl_asistencia_prensa WHERE id_asistencia_prensa = ?",

          [motivo_id],
      );

      if (motivos.length > 0) {
        motivoDescription = motivos[0].descripcion;
      }
    } catch (e) {
      console.log("Could not get motivo description:", e.message);
    }

    //insertar al historial

    const [result] = await pool.query(
        `

          INSERT INTO tbl_historial (

            troquel_id,

            tipo_registro,

            action_type,

            folio,

            motivo,

            comentarios,

            empleado_asistencia

          ) VALUES (?, 'asistencia_prensa', ?, ?, ?, ?, ?)

        `,

        [
          troquel_id,

          motivoDescription,

          folio.trim(),

          motivoDescription,

          comentarios || null,

          empleado.trim(),
        ],
    );

    res.json({
      success: true,

      message: "Asistencia en prensa registrada exitosamente",

      id: result.insertId,
    });
  } catch (error) {
    console.error("Error creating asistencia:", error);

    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
});

//accion de bajar molde

app.post("/api/actions/baja-molde", async (req, res) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const {
      molde_id,

      action_type,

      folio,

      falla_id,

      modelo_nuevo,

      nivel_setup,

      grupo,

      comentarios,

      empleado,

      prioridad_reparacion,
    } = req.body;

    if (!molde_id || !empleado?.trim() || !folio?.trim()) {
      await connection.rollback();

      return res.status(400).json({
        success: false,

        message: "Molde ID, empleado y folio son requeridos",
      });
    }

    const [moldeInfo] = await connection.query(
        "SELECT nombre, modelo, estado, maquina_asignada FROM tbl_moldes WHERE id_molde = ?",

        [molde_id],
    );

    if (moldeInfo.length === 0) {
      await connection.rollback();

      return res
          .status(404)
          .json({ success: false, message: "Molde no encontrado" });
    }

    const molde = moldeInfo[0];

    let falla_descripcion = null;

    if (falla_id) {
      const [falla] = await connection.query(
          "SELECT descripcion FROM tbl_fallas_catalogo_molde WHERE id_falla_molde = ?",

          [falla_id],
      );

      if (falla.length > 0) falla_descripcion = falla[0].descripcion;
    }

    await connection.query(
        `INSERT INTO tbl_historial_molde (

          molde_id, tipo_registro, action_type, folio, id_falla,

          modelo_nuevo, nivel_setup, grupo, comentarios, empleado_molde

        ) VALUES (?, 'baja_molde', ?, ?, ?, ?, ?, ?, ?, ?)`,

        [
          molde_id,

          action_type,

          folio.trim(),

          falla_id || null,

          modelo_nuevo || null,

          nivel_setup || null,

          grupo || null,

          comentarios || null,

          empleado.trim(),
        ],
    );

    await connection.query(
        "UPDATE tbl_moldes SET estado = 'Reparando' WHERE id_molde = ?",

        [molde_id],
    );

    const [existingCycle] = await connection.query(
        "SELECT id_ciclo_reparacion FROM tbl_ciclos_reparacion_molde WHERE molde_id = ? AND ciclo_activo = TRUE",

        [molde_id],
    );

    if (existingCycle.length === 0) {
      await connection.query(
          `INSERT INTO tbl_ciclos_reparacion_molde (

            molde_id, molde_nombre, modelo, fecha_inicio_reparacion,

            motivo_entrada, falla_id, falla_descripcion, folio_entrada,

            empleado_registro, comentarios_entrada, status_anterior,

            maquina_origen, nivel_reparacion, grupo_reparacion, prioridad,

            fecha_bajado, ciclo_activo

          ) VALUES (?, ?, ?, NOW(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), TRUE)`,

          [
            molde_id,

            molde.nombre,

            molde.modelo,

            action_type,

            falla_id || null,

            falla_descripcion,

            folio.trim(),

            empleado.trim(),

            comentarios || null,

            molde.estado,

            molde.maquina_asignada,

            nivel_setup || null,

            grupo || null,

            prioridad_reparacion || 2,
          ],
      );
    }

    await connection.commit();

    res.json({
      success: true,

      message:
          'Baja de molde registrada exitosamente. Estado cambiado a "Reparando"',
    });
  } catch (error) {
    await connection.rollback();

    console.error("Error creating baja molde:", error);

    res.status(500).json({ success: false, message: error.message });
  } finally {
    connection.release();
  }
});

//accion de asistencia en maquina

app.post("/api/actions/asistencia-maquina", async (req, res) => {
  try {
    const { molde_id, folio, motivo_id, comentarios, empleado } = req.body;

    if (!molde_id)
      return res
          .status(400)
          .json({ success: false, message: "ID de molde requerido" });

    if (!empleado || !empleado.trim())
      return res
          .status(400)
          .json({ success: false, message: "Nombre del empleado requerido" });

    if (!folio || !folio.trim())
      return res
          .status(400)
          .json({ success: false, message: "Número de folio requerido" });

    if (!motivo_id)
      return res
          .status(400)
          .json({ success: false, message: "Motivo de asistencia requerido" });

    let motivoDescription = "Asistencia en Máquina";

    try {
      const [motivos] = await pool.query(
          "SELECT descripcion FROM tbl_asistencia_maquina WHERE id_asistencia_maquina = ?",

          [motivo_id],
      );

      if (motivos.length > 0) motivoDescription = motivos[0].descripcion;
    } catch (e) {
      console.log("Could not get motivo description:", e.message);
    }

    const [result] = await pool.query(
        `INSERT INTO tbl_historial_molde (

          molde_id, tipo_registro, action_type, folio,

          motivo, comentarios, empleado_asistencia

        ) VALUES (?, 'asistencia_maquina', ?, ?, ?, ?, ?)`,

        [
          molde_id,

          motivoDescription,

          folio.trim(),

          motivoDescription,

          comentarios || null,

          empleado.trim(),
        ],
    );

    res.json({
      success: true,

      message: "Asistencia en máquina registrada exitosamente",

      id: result.insertId,
    });
  } catch (error) {
    console.error("Error creating asistencia maquina:", error);

    res.status(500).json({ success: false, message: error.message });
  }
});

//compatibilidad antigua con el endpoint

app.post("/api/actions", async (req, res) => {
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

      empleado_asistencia,
    } = req.body;

    const [result] = await pool.query(
        `

          INSERT INTO tbl_historial (

            troquel_id, tipo_registro, action_type, folio, id_falla, modelo_nuevo,

            nivel_setup, grupo, comentarios, motivo, comentarios_supervisor,

            empleado_troquel, empleado_asistencia

          ) VALUES (?, 'legacy', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)

        `,

        [
          troquel_id,

          action_type,

          folio || null,

          falla_id || null,

          modelo_nuevo,

          nivel_setup,

          grupo,

          comentarios,

          motivo || null,

          comentarios_supervisor,

          empleado_troquel || null,

          empleado_asistencia || null,
        ],
    );

    res.json({
      success: true,

      id: result.insertId,
    });
  } catch (error) {
    console.error("Error creating action:", error);

    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
});

//buscar

app.get("/api/search", async (req, res) => {
  try {
    const { q } = req.query;

    const searchTerm = `%${q}%`;

    const [results] = await pool.query(
        "SELECT id_troquel, nombre, estado, año, modelo FROM tbl_troqueles WHERE id_troquel LIKE ? OR nombre LIKE ? OR modelo LIKE ?",

        [searchTerm, searchTerm, searchTerm],
    );

    res.json(
        results.map((r) => ({
          id: r.id_troquel,

          name: r.nombre,

          status: r.estado,

          year: r.año,

          model: r.modelo,
        })),
    );
  } catch (error) {
    console.error("Error searching:", error);

    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
});

//apis para el crud de usuarios

app.get("/api/usuarios/crud", async (req, res) => {
  try {
    const { id, rol, activo } = req.query;

    if (id) {
      const [user] = await pool.query(
          "SELECT id_usuario, nombre_usuario, nombre_completo, rol, activo, ultimo_acceso, fecha_creacion, fecha_modificacion FROM tbl_usuarios WHERE id_usuario = ?",

          [id],
      );

      if (user.length === 0) {
        return res

            .status(404)

            .json({ success: false, message: "Usuario no encontrado" });
      }

      return res.json({ success: true, data: user[0] });
    }

    let sql =
        "SELECT id_usuario, nombre_usuario, nombre_completo, rol, activo, ultimo_acceso, fecha_creacion, fecha_modificacion FROM tbl_usuarios";

    const conditions = [];

    const params = [];

    if (rol) {
      conditions.push("rol = ?");

      params.push(rol);
    }

    if (activo !== undefined) {
      conditions.push("activo = ?");

      params.push(activo);
    }

    if (conditions.length > 0) {
      sql += " WHERE " + conditions.join(" AND ");
    }

    sql += " ORDER BY id_usuario ASC";

    const [users] = await pool.query(sql, params);

    res.json(users);
  } catch (error) {
    console.error("Error fetching usuarios:", error);

    res.status(500).json({
      success: false,

      message: "Error al obtener usuarios",

      error: error.message,
    });
  }
});

app.get("/api/usuarios/crud/:id", async (req, res) => {
  try {
    const [user] = await pool.query(
        "SELECT id_usuario, nombre_usuario, nombre_completo, rol, activo, ultimo_acceso, fecha_creacion, fecha_modificacion FROM tbl_usuarios WHERE id_usuario = ?",

        [req.params.id],
    );

    if (user.length === 0) {
      return res

          .status(404)

          .json({ success: false, message: "Usuario no encontrado" });
    }

    res.json({ success: true, data: user[0] });
  } catch (error) {
    console.error("Error fetching usuario:", error);

    res.status(500).json({
      success: false,

      message: "Error al obtener usuario",

      error: error.message,
    });
  }
});

app.post("/api/usuarios/crud", async (req, res) => {
  try {
    const { nombre_usuario, acceso, nombre_completo, rol } = req.body;

    if (!nombre_usuario || !nombre_usuario.trim()) {
      return res

          .status(400)

          .json({
            success: false,

            message: "El nombre de usuario es requerido",
          });
    }

    if (!acceso || !acceso.trim()) {
      return res

          .status(400)

          .json({ success: false, message: "La contraseña es requerida" });
    }

    if (!nombre_completo || !nombre_completo.trim()) {
      return res

          .status(400)

          .json({
            success: false,

            message: "El nombre completo es requerido",
          });
    }

    if (acceso.trim().length < 4) {
      return res

          .status(400)

          .json({
            success: false,

            message: "La contraseña debe tener al menos 4 caracteres",
          });
    }

    // Verificar si ya existe el nombre de usuario

    const [existing] = await pool.query(
        "SELECT id_usuario FROM tbl_usuarios WHERE nombre_usuario = ?",

        [nombre_usuario.trim().toLowerCase()],
    );

    if (existing.length > 0) {
      return res

          .status(409)

          .json({
            success: false,

            message: "Ya existe un usuario con ese nombre de usuario",
          });
    }

    // Hashear la contraseña

    const saltRounds = 10;

    const hashedPassword = await bcrypt.hash(acceso.trim(), saltRounds);

    const validRoles = ["admin", "supervisor", "operator"];

    const userRol = validRoles.includes(rol) ? rol : "operator";

    const [result] = await pool.query(
        `

          INSERT INTO tbl_usuarios (nombre_usuario, acceso, nombre_completo, rol, activo, fecha_creacion, fecha_modificacion)

          VALUES (?, ?, ?, ?, 1, NOW(), NOW())

        `,

        [
          nombre_usuario.trim().toLowerCase(),

          hashedPassword,

          nombre_completo.trim(),

          userRol,
        ],
    );

    res.status(201).json({
      success: true,

      message: "Usuario creado exitosamente",

      id_usuario: result.insertId,
    });
  } catch (error) {
    console.error("Error creating usuario:", error);

    res.status(500).json({
      success: false,

      message: "Error al crear el usuario",

      error: error.message,
    });
  }
});

app.put("/api/usuarios/crud", async (req, res) => {
  try {
    const data = req.body;

    const id = data.id_usuario;

    if (!id) {
      return res

          .status(400)

          .json({
            success: false,

            message: "El ID del usuario es requerido para actualizar",
          });
    }

    const [existing] = await pool.query(
        "SELECT id_usuario, nombre_usuario FROM tbl_usuarios WHERE id_usuario = ?",

        [id],
    );

    if (existing.length === 0) {
      return res

          .status(404)

          .json({ success: false, message: "Usuario no encontrado" });
    }

    const updates = [];

    const params = [];

    // Actualizar nombre de usuario si se proporciona

    if (data.nombre_usuario !== undefined) {
      const newUsername = data.nombre_usuario.trim().toLowerCase();

      // Verificar que no exista otro usuario con ese nombre

      const [dupCheck] = await pool.query(
          "SELECT id_usuario FROM tbl_usuarios WHERE nombre_usuario = ? AND id_usuario != ?",

          [newUsername, id],
      );

      if (dupCheck.length > 0) {
        return res

            .status(409)

            .json({
              success: false,

              message: "Ya existe otro usuario con ese nombre de usuario",
            });
      }

      updates.push("nombre_usuario = ?");

      params.push(newUsername);
    }

    // Actualizar nombre completo

    if (data.nombre_completo !== undefined) {
      updates.push("nombre_completo = ?");

      params.push(data.nombre_completo.trim());
    }

    // Actualizar rol

    if (data.rol !== undefined) {
      const validRoles = ["admin", "supervisor", "operator"];

      if (!validRoles.includes(data.rol)) {
        return res

            .status(400)

            .json({
              success: false,

              message: "Rol no válido. Opciones: admin, supervisor, operator",
            });
      }

      updates.push("rol = ?");

      params.push(data.rol);
    }

    // Actualizar estado activo

    if (data.activo !== undefined) {
      updates.push("activo = ?");

      params.push(data.activo ? 1 : 0);
    }

    // Actualizar contraseña si se proporciona

    if (data.acceso && data.acceso.trim()) {
      if (data.acceso.trim().length < 4) {
        return res

            .status(400)

            .json({
              success: false,

              message: "La contraseña debe tener al menos 4 caracteres",
            });
      }

      const saltRounds = 10;

      const hashedPassword = await bcrypt.hash(
          data.acceso.trim(),

          saltRounds,
      );

      updates.push("acceso = ?");

      params.push(hashedPassword);
    }

    if (updates.length === 0) {
      return res

          .status(400)

          .json({
            success: false,

            message: "No hay datos para actualizar",
          });
    }

    updates.push("fecha_modificacion = NOW()");

    params.push(id);

    await pool.query(
        `UPDATE tbl_usuarios SET ${updates.join(", ")} WHERE id_usuario = ?`,

        params,
    );

    res.json({ success: true, message: "Usuario actualizado exitosamente" });
  } catch (error) {
    console.error("Error updating usuario:", error);

    res.status(500).json({
      success: false,

      message: "Error al actualizar el usuario",

      error: error.message,
    });
  }
});

app.put("/api/usuarios/crud/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const data = req.body;

    const [existing] = await pool.query(
        "SELECT id_usuario FROM tbl_usuarios WHERE id_usuario = ?",

        [id],
    );

    if (existing.length === 0) {
      return res

          .status(404)

          .json({ success: false, message: "Usuario no encontrado" });
    }

    const updates = [];

    const params = [];

    if (data.nombre_usuario !== undefined) {
      const newUsername = data.nombre_usuario.trim().toLowerCase();

      const [dupCheck] = await pool.query(
          "SELECT id_usuario FROM tbl_usuarios WHERE nombre_usuario = ? AND id_usuario != ?",

          [newUsername, id],
      );

      if (dupCheck.length > 0) {
        return res

            .status(409)

            .json({
              success: false,

              message: "Ya existe otro usuario con ese nombre de usuario",
            });
      }

      updates.push("nombre_usuario = ?");

      params.push(newUsername);
    }

    if (data.nombre_completo !== undefined) {
      updates.push("nombre_completo = ?");

      params.push(data.nombre_completo.trim());
    }

    if (data.rol !== undefined) {
      const validRoles = ["admin", "supervisor", "operator"];

      if (!validRoles.includes(data.rol)) {
        return res

            .status(400)

            .json({ success: false, message: "Rol no válido" });
      }

      updates.push("rol = ?");

      params.push(data.rol);
    }

    if (data.activo !== undefined) {
      updates.push("activo = ?");

      params.push(data.activo ? 1 : 0);
    }

    if (data.acceso && data.acceso.trim()) {
      if (data.acceso.trim().length < 4) {
        return res

            .status(400)

            .json({
              success: false,

              message: "La contraseña debe tener al menos 4 caracteres",
            });
      }

      const saltRounds = 10;

      const hashedPassword = await bcrypt.hash(
          data.acceso.trim(),

          saltRounds,
      );

      updates.push("acceso = ?");

      params.push(hashedPassword);
    }

    if (updates.length === 0) {
      return res

          .status(400)

          .json({
            success: false,

            message: "No hay datos para actualizar",
          });
    }

    updates.push("fecha_modificacion = NOW()");

    params.push(id);

    await pool.query(
        `UPDATE tbl_usuarios SET ${updates.join(", ")} WHERE id_usuario = ?`,

        params,
    );

    res.json({ success: true, message: "Usuario actualizado exitosamente" });
  } catch (error) {
    console.error("Error updating usuario:", error);

    res.status(500).json({
      success: false,

      message: "Error al actualizar el usuario",

      error: error.message,
    });
  }
});

app.delete("/api/usuarios/crud", async (req, res) => {
  try {
    const id = req.query.id;

    if (!id) {
      return res

          .status(400)

          .json({
            success: false,

            message: "El ID del usuario es requerido",
          });
    }

    const [existing] = await pool.query(
        "SELECT id_usuario, nombre_usuario, rol FROM tbl_usuarios WHERE id_usuario = ?",

        [id],
    );

    if (existing.length === 0) {
      return res

          .status(404)

          .json({ success: false, message: "Usuario no encontrado" });
    }

    // Prevenir eliminación del último admin

    if (existing[0].rol === "admin") {
      const [adminCount] = await pool.query(
          "SELECT COUNT(*) as count FROM tbl_usuarios WHERE rol = ? AND activo = 1",

          ["admin"],
      );

      if (adminCount[0].count <= 1) {
        return res

            .status(400)

            .json({
              success: false,

              message:
                  "No se puede eliminar el último administrador activo del sistema",
            });
      }
    }

    await pool.query("DELETE FROM tbl_usuarios WHERE id_usuario = ?", [id]);

    res.json({
      success: true,

      message: "Usuario eliminado exitosamente",
    });
  } catch (error) {
    console.error("Error deleting usuario:", error);

    res.status(500).json({
      success: false,

      message: "Error al eliminar el usuario",

      error: error.message,
    });
  }
});

app.delete("/api/usuarios/crud/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await pool.query(
        "SELECT id_usuario, nombre_usuario, rol FROM tbl_usuarios WHERE id_usuario = ?",

        [id],
    );

    if (existing.length === 0) {
      return res

          .status(404)

          .json({ success: false, message: "Usuario no encontrado" });
    }

    if (existing[0].rol === "admin") {
      const [adminCount] = await pool.query(
          "SELECT COUNT(*) as count FROM tbl_usuarios WHERE rol = ? AND activo = 1",

          ["admin"],
      );

      if (adminCount[0].count <= 1) {
        return res

            .status(400)

            .json({
              success: false,

              message:
                  "No se puede eliminar el último administrador activo del sistema",
            });
      }
    }

    await pool.query("DELETE FROM tbl_usuarios WHERE id_usuario = ?", [id]);

    res.json({
      success: true,

      message: "Usuario eliminado exitosamente",
    });
  } catch (error) {
    console.error("Error deleting usuario:", error);

    res.status(500).json({
      success: false,

      message: "Error al eliminar el usuario",

      error: error.message,
    });
  }
});

app.patch("/api/usuarios/crud/:id/toggle-active", async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await pool.query(
        "SELECT id_usuario, nombre_usuario, rol, activo FROM tbl_usuarios WHERE id_usuario = ?",

        [id],
    );

    if (existing.length === 0) {
      return res

          .status(404)

          .json({ success: false, message: "Usuario no encontrado" });
    }

    const user = existing[0];

    const newStatus = user.activo ? 0 : 1;

    // Si se está desactivando un admin, verificar que no sea el último

    if (user.rol === "admin" && newStatus === 0) {
      const [adminCount] = await pool.query(
          "SELECT COUNT(*) as count FROM tbl_usuarios WHERE rol = ? AND activo = 1",

          ["admin"],
      );

      if (adminCount[0].count <= 1) {
        return res

            .status(400)

            .json({
              success: false,

              message:
                  "No se puede desactivar el último administrador activo del sistema",
            });
      }
    }

    await pool.query(
        "UPDATE tbl_usuarios SET activo = ?, fecha_modificacion = NOW() WHERE id_usuario = ?",

        [newStatus, id],
    );

    res.json({
      success: true,

      message: newStatus
          ? "Usuario activado exitosamente"
          : "Usuario desactivado exitosamente",

      activo: newStatus,
    });
  } catch (error) {
    console.error("Error toggling usuario status:", error);

    res.status(500).json({
      success: false,

      message: "Error al cambiar estado del usuario",

      error: error.message,
    });
  }
});

//inicio de apis para crud de modelos

app.get("/api/maquinas", async (req, res) => {
  try {
    const [maquinas] = await pool.query(
        "SELECT id_maquina, identificador_maquina, nombre, modelo, tonelaje_cierre, estado FROM tbl_maquinas_inyeccion WHERE estado = 'activa' ORDER BY identificador_maquina ASC",
    );

    const options = [
      {
        value: "",

        label: "Sin asignar",
      },
    ];

    maquinas.forEach((m) => {
      options.push({
        value: m.identificador_maquina || m.nombre || m.id_maquina,

        label:
            (m.identificador_maquina || m.nombre) +
            (m.tonelaje_cierre ? ` (${m.tonelaje_cierre} ton)` : ""),

        modelo: m.modelo,
      });
    });

    res.json(options);
  } catch (error) {
    console.error("Error fetching maquinas:", error);

    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
});

app.get("/api/maquinas/crud", async (req, res) => {
  try {
    const { id, estado } = req.query;

    if (id) {
      const [maquina] = await pool.query(
          "SELECT * FROM tbl_maquinas_inyeccion WHERE id_maquina = ?",

          [id],
      );

      if (maquina.length === 0) {
        return res

            .status(404)

            .json({ success: false, message: "Máquina no encontrada" });
      }

      return res.json({ success: true, data: maquina[0] });
    }

    let sql = "SELECT * FROM tbl_maquinas_inyeccion";

    const params = [];

    if (estado) {
      sql += " WHERE estado = ?";

      params.push(estado);
    }

    sql += " ORDER BY identificador_maquina ASC";

    const [maquinas] = await pool.query(sql, params);

    res.json(maquinas);
  } catch (error) {
    console.error("Error fetching maquinas crud:", error);

    res.status(500).json({
      success: false,

      message: "Error al obtener máquinas",

      error: error.message,
    });
  }
});

app.get("/api/maquinas/crud/:id", async (req, res) => {
  try {
    const [maquina] = await pool.query(
        "SELECT * FROM tbl_maquinas_inyeccion WHERE id_maquina = ?",

        [req.params.id],
    );

    if (maquina.length === 0) {
      return res

          .status(404)

          .json({ success: false, message: "Máquina no encontrada" });
    }

    res.json({ success: true, data: maquina[0] });
  } catch (error) {
    console.error("Error fetching maquina:", error);

    res.status(500).json({
      success: false,

      message: "Error al obtener máquina",

      error: error.message,
    });
  }
});

// Crear nueva máquina

app.post("/api/maquinas/crud", async (req, res) => {
  try {
    const {
      identificador_maquina,

      nombre,

      marca,

      modelo,

      numero_serie,

      descripcion,

      tonelaje_cierre,

      capacidad_inyeccion_g,

      diametro_husillo_mm,

      distancia_barras_h_mm,

      distancia_barras_v_mm,

      carrera_apertura_mm,

      espesor_molde_min_mm,

      espesor_molde_max_mm,

      estado,

      ubicacion,

      notas,
    } = req.body;

    if (!identificador_maquina || !identificador_maquina.trim()) {
      return res

          .status(400)

          .json({
            success: false,

            message: "El identificador de la máquina es requerido",
          });
    }

    if (!nombre || !nombre.trim()) {
      return res

          .status(400)

          .json({
            success: false,

            message: "El nombre de la máquina es requerido",
          });
    }

    const idUpper = identificador_maquina.trim().toUpperCase();

    const [existing] = await pool.query(
        "SELECT id_maquina FROM tbl_maquinas_inyeccion WHERE identificador_maquina = ?",

        [idUpper],
    );

    if (existing.length > 0) {
      return res

          .status(409)

          .json({
            success: false,

            message: "Ya existe una máquina con ese identificador",
          });
    }

    const [result] = await pool.query(
        `

          INSERT INTO tbl_maquinas_inyeccion (

            identificador_maquina, nombre, marca, modelo, numero_serie,

            descripcion, tonelaje_cierre, capacidad_inyeccion_g,

            diametro_husillo_mm, distancia_barras_h_mm, distancia_barras_v_mm,

            carrera_apertura_mm, espesor_molde_min_mm, espesor_molde_max_mm,

            estado, ubicacion, notas, creado_en, actualizado_en

          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())

        `,

        [
          idUpper,

          nombre.trim(),

          marca || null,

          modelo || null,

          numero_serie || null,

          descripcion || null,

          tonelaje_cierre || null,

          capacidad_inyeccion_g || null,

          diametro_husillo_mm || null,

          distancia_barras_h_mm || null,

          distancia_barras_v_mm || null,

          carrera_apertura_mm || null,

          espesor_molde_min_mm || null,

          espesor_molde_max_mm || null,

          estado || "activa",

          ubicacion || null,

          notas || null,
        ],
    );

    res.status(201).json({
      success: true,

      message: "Máquina registrada exitosamente",

      id_maquina: result.insertId,

      identificador_maquina: idUpper,
    });
  } catch (error) {
    console.error("Error creating maquina:", error);

    res.status(500).json({
      success: false,

      message: "Error al crear la máquina",

      error: error.message,
    });
  }
});

// Actualizar máquina

app.put("/api/maquinas/crud", async (req, res) => {
  try {
    const data = req.body;

    const id = data.id_maquina;

    if (!id) {
      return res

          .status(400)

          .json({
            success: false,

            message: "El ID de la máquina es requerido para actualizar",
          });
    }

    const [existing] = await pool.query(
        "SELECT id_maquina FROM tbl_maquinas_inyeccion WHERE id_maquina = ?",

        [id],
    );

    if (existing.length === 0) {
      return res

          .status(404)

          .json({ success: false, message: "Máquina no encontrada" });
    }

    const allowedFields = [
      "nombre",

      "marca",

      "modelo",

      "numero_serie",

      "descripcion",

      "tonelaje_cierre",

      "capacidad_inyeccion_g",

      "diametro_husillo_mm",

      "distancia_barras_h_mm",

      "distancia_barras_v_mm",

      "carrera_apertura_mm",

      "espesor_molde_min_mm",

      "espesor_molde_max_mm",

      "estado",

      "ubicacion",

      "notas",
    ];

    const updates = [];

    const params = [];

    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        updates.push(`${field} = ?`);

        params.push(data[field]);
      }
    }

    if (updates.length === 0) {
      return res

          .status(400)

          .json({
            success: false,

            message: "No hay datos para actualizar",
          });
    }

    updates.push("actualizado_en = NOW()");

    params.push(id);

    await pool.query(
        `UPDATE tbl_maquinas_inyeccion SET ${updates.join(", ")} WHERE id_maquina = ?`,

        params,
    );

    res.json({ success: true, message: "Máquina actualizada exitosamente" });
  } catch (error) {
    console.error("Error updating maquina:", error);

    res.status(500).json({
      success: false,

      message: "Error al actualizar la máquina",

      error: error.message,
    });
  }
});

// Actualizar máquina

app.put("/api/maquinas/crud/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const data = req.body;

    const [existing] = await pool.query(
        "SELECT id_maquina FROM tbl_maquinas_inyeccion WHERE id_maquina = ?",

        [id],
    );

    if (existing.length === 0) {
      return res

          .status(404)

          .json({ success: false, message: "Máquina no encontrada" });
    }

    const allowedFields = [
      "nombre",

      "marca",

      "modelo",

      "numero_serie",

      "descripcion",

      "tonelaje_cierre",

      "capacidad_inyeccion_g",

      "diametro_husillo_mm",

      "distancia_barras_h_mm",

      "distancia_barras_v_mm",

      "carrera_apertura_mm",

      "espesor_molde_min_mm",

      "espesor_molde_max_mm",

      "estado",

      "ubicacion",

      "notas",
    ];

    const updates = [];

    const params = [];

    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        updates.push(`${field} = ?`);

        params.push(data[field]);
      }
    }

    if (updates.length === 0) {
      return res

          .status(400)

          .json({
            success: false,

            message: "No hay datos para actualizar",
          });
    }

    updates.push("actualizado_en = NOW()");

    params.push(id);

    await pool.query(
        `UPDATE tbl_maquinas_inyeccion SET ${updates.join(", ")} WHERE id_maquina = ?`,

        params,
    );

    res.json({ success: true, message: "Máquina actualizada exitosamente" });
  } catch (error) {
    console.error("Error updating maquina:", error);

    res.status(500).json({
      success: false,

      message: "Error al actualizar la máquina",

      error: error.message,
    });
  }
});

// Eliminar máquina

app.delete("/api/maquinas/crud", async (req, res) => {
  try {
    const id = req.query.id;

    if (!id) {
      return res

          .status(400)

          .json({
            success: false,

            message: "El ID de la máquina es requerido",
          });
    }

    const [existing] = await pool.query(
        "SELECT id_maquina, identificador_maquina FROM tbl_maquinas_inyeccion WHERE id_maquina = ?",

        [id],
    );

    if (existing.length === 0) {
      return res

          .status(404)

          .json({ success: false, message: "Máquina no encontrada" });
    }

    const identificador = existing[0].identificador_maquina;

    // Desasignar moldes que estén en esta máquina

    const [moldesCount] = await pool.query(
        "SELECT COUNT(*) as count FROM tbl_moldes WHERE maquina_asignada = ?",

        [identificador],
    );

    const desasignados = moldesCount[0].count;

    if (desasignados > 0) {
      await pool.query(
          "UPDATE tbl_moldes SET maquina_asignada = NULL WHERE maquina_asignada = ?",

          [identificador],
      );
    }

    await pool.query(
        "DELETE FROM tbl_maquinas_inyeccion WHERE id_maquina = ?",

        [id],
    );

    res.json({
      success: true,

      message: "Máquina eliminada exitosamente",

      moldes_desasignados: desasignados,
    });
  } catch (error) {
    console.error("Error deleting maquina:", error);

    res.status(500).json({
      success: false,

      message: "Error al eliminar la máquina",

      error: error.message,
    });
  }
});

// Eliminar máquina

app.delete("/api/maquinas/crud/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await pool.query(
        "SELECT id_maquina, identificador_maquina FROM tbl_maquinas_inyeccion WHERE id_maquina = ?",

        [id],
    );

    if (existing.length === 0) {
      return res

          .status(404)

          .json({ success: false, message: "Máquina no encontrada" });
    }

    const identificador = existing[0].identificador_maquina;

    const [moldesCount] = await pool.query(
        "SELECT COUNT(*) as count FROM tbl_moldes WHERE maquina_asignada = ?",

        [identificador],
    );

    const desasignados = moldesCount[0].count;

    if (desasignados > 0) {
      await pool.query(
          "UPDATE tbl_moldes SET maquina_asignada = NULL WHERE maquina_asignada = ?",

          [identificador],
      );
    }

    await pool.query(
        "DELETE FROM tbl_maquinas_inyeccion WHERE id_maquina = ?",

        [id],
    );

    res.json({
      success: true,

      message: "Máquina eliminada exitosamente",

      moldes_desasignados: desasignados,
    });
  } catch (error) {
    console.error("Error deleting maquina:", error);

    res.status(500).json({
      success: false,

      message: "Error al eliminar la máquina",

      error: error.message,
    });
  }
});

app.get("/api/tipos_molde", async (req, res) => {
  try {
    const [tipos] = await pool.query(
        "SELECT id_tipo_molde as id, codigo, nombre, descripcion FROM tbl_tipos_molde WHERE activo = 1 ORDER BY nombre ASC",
    );

    const options = tipos.map((t) => ({
      value: t.codigo || t.id,

      label: t.nombre,

      descripcion: t.descripcion,
    }));

    res.json(options);
  } catch (error) {
    console.error("Error fetching tipos_molde:", error);

    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
});

app.get("/api/fallas-molde", async (req, res) => {
  try {
    const [fallas] = await pool.query(
        "SELECT id_falla_molde, descripcion FROM tbl_fallas_catalogo_molde WHERE activo = 1 ORDER BY descripcion",
    );

    res.json(
        fallas.map((f) => ({
          id: f.id_falla_molde,

          description: f.descripcion,
        })),
    );
  } catch (error) {
    console.error("Error fetching fallas molde:", error);

    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
});

app.get("/api/asistencia-maquina", async (req, res) => {
  try {
    const [asistencias] = await pool.query(
        "SELECT id_asistencia_maquina as id, descripcion FROM tbl_asistencia_maquina WHERE activo = 1 ORDER BY descripcion ASC",
    );

    res.json(
        asistencias.map((a) => ({
          id: a.id,

          description: a.descripcion,
        })),
    );
  } catch (error) {
    console.error("Error fetching asistencia_maquina:", error);

    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
});

app.get("/api/modelos-molde", async (req, res) => {
  try {
    const { molde_id } = req.query;

    let query = `



      SELECT



        m.id_modelo,



        m.nombre_modelo,



        m.molde_id,



        m.descripcion,



        m.creado_en,



        m.actualizado_en,



        mo.nombre AS molde_nombre



      FROM tbl_modelos_molde m



             LEFT JOIN tbl_moldes mo ON m.molde_id = mo.id_molde



    `;

    const params = [];

    if (molde_id) {
      query += " WHERE m.molde_id = ?";

      params.push(molde_id);
    }

    query += " ORDER BY m.nombre_modelo ASC";

    const [rows] = await pool.query(query, params);

    res.json(rows);
  } catch (err) {
    console.error("Error fetching modelos molde:", err);

    res.status(500).json({
      success: false,

      message: "Error al obtener modelos de molde",
    });
  }
});

app.post("/api/modelos-molde", async (req, res) => {
  try {
    const { nombre_modelo, molde_id, descripcion } = req.body;

    if (!nombre_modelo)
      return res

          .status(400)

          .json({
            success: false,

            message: "El nombre del modelo es requerido",
          });

    if (!molde_id)
      return res

          .status(400)

          .json({ success: false, message: "El molde es requerido" });

    const [moldeCheck] = await pool.query(
        "SELECT id_molde FROM tbl_moldes WHERE id_molde = ?",

        [molde_id],
    );

    if (moldeCheck.length === 0)
      return res

          .status(400)

          .json({
            success: false,

            message: "El molde especificado no existe",
          });

    const [dupCheck] = await pool.query(
        "SELECT id_modelo FROM tbl_modelos_molde WHERE nombre_modelo = ? AND molde_id = ?",

        [nombre_modelo, molde_id],
    );

    if (dupCheck.length > 0)
      return res

          .status(400)

          .json({
            success: false,

            message: "Ya existe un modelo con ese nombre para este molde",
          });

    const [result] = await pool.query(
        "INSERT INTO tbl_modelos_molde (nombre_modelo, molde_id, descripcion) VALUES (?, ?, ?)",

        [nombre_modelo, molde_id, descripcion || null],
    );

    res.status(201).json({
      success: true,

      message: "Modelo creado exitosamente",

      id_modelo: result.insertId,
    });
  } catch (err) {
    console.error("Error creating modelo molde:", err);

    res.status(500).json({
      success: false,

      message: "Error al crear modelo",
    });
  }
});

app.put("/api/modelos-molde", async (req, res) => {
  try {
    const { id_modelo, nombre_modelo, molde_id, descripcion } = req.body;

    if (!id_modelo)
      return res

          .status(400)

          .json({
            success: false,

            message: "El ID del modelo es requerido",
          });

    if (!nombre_modelo)
      return res

          .status(400)

          .json({
            success: false,

            message: "El nombre del modelo es requerido",
          });

    if (!molde_id)
      return res

          .status(400)

          .json({ success: false, message: "El molde es requerido" });

    const [checkModelo] = await pool.query(
        "SELECT id_modelo FROM tbl_modelos_molde WHERE id_modelo = ?",

        [id_modelo],
    );

    if (checkModelo.length === 0)
      return res

          .status(404)

          .json({ success: false, message: "Modelo no encontrado" });

    const [dupCheck] = await pool.query(
        "SELECT id_modelo FROM tbl_modelos_molde WHERE nombre_modelo = ? AND molde_id = ? AND id_modelo != ?",

        [nombre_modelo, molde_id, id_modelo],
    );

    if (dupCheck.length > 0)
      return res

          .status(400)

          .json({
            success: false,

            message: "Ya existe otro modelo con ese nombre para este molde",
          });

    await pool.query(
        "UPDATE tbl_modelos_molde SET nombre_modelo = ?, molde_id = ?, descripcion = ?, actualizado_en = NOW() WHERE id_modelo = ?",

        [nombre_modelo, molde_id, descripcion || null, id_modelo],
    );

    res.json({ success: true, message: "Modelo actualizado exitosamente" });
  } catch (err) {
    console.error("Error updating modelo molde:", err);

    res.status(500).json({
      success: false,

      message: "Error al actualizar modelo",
    });
  }
});

app.put("/api/modelos-molde/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const { nombre_modelo, molde_id, descripcion } = req.body;

    if (!nombre_modelo)
      return res

          .status(400)

          .json({
            success: false,

            message: "El nombre del modelo es requerido",
          });

    if (!molde_id)
      return res

          .status(400)

          .json({ success: false, message: "El molde es requerido" });

    const [checkModelo] = await pool.query(
        "SELECT id_modelo FROM tbl_modelos_molde WHERE id_modelo = ?",

        [id],
    );

    if (checkModelo.length === 0)
      return res

          .status(404)

          .json({ success: false, message: "Modelo no encontrado" });

    const [dupCheck] = await pool.query(
        "SELECT id_modelo FROM tbl_modelos_molde WHERE nombre_modelo = ? AND molde_id = ? AND id_modelo != ?",

        [nombre_modelo, molde_id, id],
    );

    if (dupCheck.length > 0)
      return res

          .status(400)

          .json({
            success: false,

            message: "Ya existe otro modelo con ese nombre para este molde",
          });

    await pool.query(
        "UPDATE tbl_modelos_molde SET nombre_modelo = ?, molde_id = ?, descripcion = ?, actualizado_en = NOW() WHERE id_modelo = ?",

        [nombre_modelo, molde_id, descripcion || null, id],
    );

    res.json({ success: true, message: "Modelo actualizado exitosamente" });
  } catch (err) {
    console.error("Error updating modelo molde:", err);

    res.status(500).json({
      success: false,

      message: "Error al actualizar modelo",
    });
  }
});

app.delete("/api/modelos-molde/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [check] = await pool.query(
        "SELECT id_modelo FROM tbl_modelos_molde WHERE id_modelo = ?",

        [id],
    );

    if (check.length === 0)
      return res

          .status(404)

          .json({ success: false, message: "Modelo no encontrado" });

    await pool.query("DELETE FROM tbl_modelos_molde WHERE id_modelo = ?", [id]);

    res.json({ success: true, message: "Modelo eliminado exitosamente" });
  } catch (err) {
    console.error("Error deleting modelo molde:", err);

    res.status(500).json({
      success: false,

      message: "Error al eliminar modelo",
    });
  }
});

app.get("/api/moldes", async (req, res) => {
  try {
    const [moldes] = await pool.query(`



      SELECT m.*, cr.prioridad AS prioridad_reparacion



      FROM tbl_moldes m



             LEFT JOIN tbl_ciclos_reparacion_molde cr



                       ON cr.molde_id COLLATE utf8mb4_general_ci = m.id_molde AND cr.ciclo_activo = TRUE



      ORDER BY m.año DESC, m.id_molde



    `);

    const groupedByYear = {};

    moldes.forEach((m) => {
      const year = m.año;

      if (!groupedByYear[year]) {
        groupedByYear[year] = [];
      }

      groupedByYear[year].push({
        id: m.id_molde,

        name: m.nombre,

        status: m.estado,

        model: m.modelo,

        ciclos_inyeccion: m.ciclos_inyeccion,

        ciclos_acumulados: m.ciclos_acumulados,

        capacidad_ciclos: m.capacidad_ciclos,

        mantenimientos_preventivos: m.mantenimientos_preventivos,

        tipo_molde: m.tipo_molde,

        ubicacion: m.ubicacion,

        maquina_asignada: m.maquina_asignada,

        imageUrl: m.image_url,

        numero_serie: m.numero_serie,

        proveedor: m.proveedor,

        peso_kg: m.peso_kg,

        dimensiones: m.dimensiones,

        material_base: m.material_base,

        num_cavidades: m.num_cavidades,

        material_inyeccion: m.material_inyeccion,

        peso_pieza_g: m.peso_pieza_g,

        peso_colada_g: m.peso_colada_g,

        tiempo_ciclo_seg: m.tiempo_ciclo_seg,

        temperatura_molde_c: m.temperatura_molde_c,

        presion_inyeccion_bar: m.presion_inyeccion_bar,

        tonelaje_requerido: m.tonelaje_requerido,

        tipo_colada: m.tipo_colada,

        num_puntos_inyeccion: m.num_puntos_inyeccion,

        marca_colada_caliente: m.marca_colada_caliente,

        circuitos_enfriamiento: m.circuitos_enfriamiento,

        tipo_enfriamiento: m.tipo_enfriamiento,

        tipo_expulsion: m.tipo_expulsion,

        carrera_expulsion_mm: m.carrera_expulsion_mm,

        color: m.color,

        n_parte_1: m.n_parte_1,

        n_parte_2: m.n_parte_2,

        n_parte_3: m.n_parte_3,

        n_parte_4: m.n_parte_4,

        n_parte_5: m.n_parte_5,

        n_parte_6: m.n_parte_6,

        comentarios: m.comentarios,

        prioridad_reparacion: m.prioridad_reparacion || null,
      });
    });

    res.json(groupedByYear);
  } catch (error) {
    console.error("Error fetching moldes:", error);

    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
});

// Obtener lista plana de moldes

app.get("/api/moldes/list", async (req, res) => {
  try {
    const [moldes] = await pool.query(`



      SELECT * FROM tbl_moldes



      ORDER BY creado_en DESC



    `);

    res.json(moldes);
  } catch (error) {
    console.error("Error fetching moldes list:", error);

    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
});

// Buscar moldes con filtros

app.get("/api/moldes/search", async (req, res) => {
  try {
    const { year, status, search } = req.query;

    let sql = "SELECT * FROM tbl_moldes WHERE 1=1";

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
      sql +=
          " AND (id_molde LIKE ? OR nombre LIKE ? OR modelo LIKE ? OR material_inyeccion LIKE ?)";

      const searchTerm = `%${search}%`;

      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    sql += " ORDER BY creado_en DESC";

    const [moldes] = await pool.query(sql, params);

    res.json(moldes);
  } catch (error) {
    console.error("Error searching moldes:", error);

    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
});

// Obtener un molde por ID

app.get("/api/moldes/:id", async (req, res) => {
  try {
    const [moldes] = await pool.query(
        "SELECT * FROM tbl_moldes WHERE id_molde = ?",

        [req.params.id],
    );

    if (moldes.length === 0) {
      return res.status(404).json({
        success: false,

        message: "Molde no encontrado",
      });
    }

    res.json(moldes[0]);
  } catch (error) {
    console.error("Error fetching molde:", error);

    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
});

// Crear nuevo molde

app.post("/api/moldes", async (req, res) => {
  try {
    const {
      id_molde,

      nombre,

      estado = "Pendiente",

      año,

      modelo,

      ciclos_inyeccion = "-",

      ciclos_acumulados = "-",

      capacidad_ciclos = "-",

      mantenimientos_preventivos = "0",

      tipo_molde = "Null",

      ubicacion,

      maquina_asignada,

      numero_serie,

      proveedor,

      peso_kg,

      dimensiones,

      material_base,

      num_cavidades,

      material_inyeccion,

      peso_pieza_g,

      peso_colada_g,

      tiempo_ciclo_seg,

      temperatura_molde_c,

      presion_inyeccion_bar,

      tonelaje_requerido,

      tipo_colada = "Null",

      num_puntos_inyeccion,

      marca_colada_caliente,

      circuitos_enfriamiento,

      tipo_enfriamiento = "Null",

      tipo_expulsion = "Null",

      carrera_expulsion_mm,

      color,

      n_parte_1,

      n_parte_2,

      n_parte_3,

      n_parte_4,

      n_parte_5,

      n_parte_6,

      comentarios,

      image_url,
    } = req.body;

    if (!id_molde || !nombre || !año) {
      return res.status(400).json({
        success: false,

        message: "ID, nombre y año son requeridos",
      });
    }

    const id = id_molde.trim().toUpperCase();

    const [existing] = await pool.query(
        "SELECT id_molde FROM tbl_moldes WHERE id_molde = ?",

        [id],
    );

    if (existing.length > 0) {
      return res.status(409).json({
        success: false,

        message: "Ya existe un molde con ese ID",
      });
    }

    await pool.query(
        `



          INSERT INTO tbl_moldes (



            id_molde, nombre, estado, año, modelo,



            ciclos_inyeccion, ciclos_acumulados, capacidad_ciclos, mantenimientos_preventivos,



            tipo_molde, ubicacion, maquina_asignada, numero_serie,



            proveedor, peso_kg, dimensiones, material_base,



            num_cavidades, material_inyeccion, peso_pieza_g, peso_colada_g,



            tiempo_ciclo_seg, temperatura_molde_c, presion_inyeccion_bar,



            tonelaje_requerido, tipo_colada, num_puntos_inyeccion,



            marca_colada_caliente, circuitos_enfriamiento,



            tipo_enfriamiento, tipo_expulsion, carrera_expulsion_mm, color,



            n_parte_1, n_parte_2, n_parte_3, n_parte_4, n_parte_5, n_parte_6,



            comentarios, image_url



          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)



        `,

        [
          id,

          nombre,

          estado,

          año,

          modelo,

          ciclos_inyeccion,

          ciclos_acumulados,

          capacidad_ciclos,

          mantenimientos_preventivos,

          tipo_molde,

          ubicacion,

          maquina_asignada,

          numero_serie,

          proveedor,

          peso_kg,

          dimensiones,

          material_base,

          num_cavidades,

          material_inyeccion,

          peso_pieza_g,

          peso_colada_g,

          tiempo_ciclo_seg,

          temperatura_molde_c,

          presion_inyeccion_bar,

          tonelaje_requerido,

          tipo_colada,

          num_puntos_inyeccion,

          marca_colada_caliente,

          circuitos_enfriamiento,

          tipo_enfriamiento,

          tipo_expulsion,

          carrera_expulsion_mm,

          color,

          n_parte_1,

          n_parte_2,

          n_parte_3,

          n_parte_4,

          n_parte_5,

          n_parte_6,

          comentarios,

          image_url,
        ],
    );

    res.status(201).json({
      success: true,

      message: "Molde registrado exitosamente",

      id: id,
    });
  } catch (error) {
    console.error("Error creating molde:", error);

    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
});

// Actualizar molde

app.put("/api/moldes/:id", async (req, res) => {
  try {
    const id = req.params.id;

    const [existing] = await pool.query(
        "SELECT * FROM tbl_moldes WHERE id_molde = ?",

        [id],
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,

        message: "Molde no encontrado",
      });
    }

    const current = existing[0];

    const {
      nombre = current.nombre,

      estado = current.estado,

      año = current.año,

      modelo = current.modelo,

      ciclos_inyeccion = current.ciclos_inyeccion,

      ciclos_acumulados = current.ciclos_acumulados,

      capacidad_ciclos = current.capacidad_ciclos,

      mantenimientos_preventivos = current.mantenimientos_preventivos,

      tipo_molde = current.tipo_molde,

      ubicacion = current.ubicacion,

      maquina_asignada = current.maquina_asignada,

      numero_serie = current.numero_serie,

      proveedor = current.proveedor,

      peso_kg = current.peso_kg,

      dimensiones = current.dimensiones,

      material_base = current.material_base,

      num_cavidades = current.num_cavidades,

      material_inyeccion = current.material_inyeccion,

      peso_pieza_g = current.peso_pieza_g,

      peso_colada_g = current.peso_colada_g,

      tiempo_ciclo_seg = current.tiempo_ciclo_seg,

      temperatura_molde_c = current.temperatura_molde_c,

      presion_inyeccion_bar = current.presion_inyeccion_bar,

      tonelaje_requerido = current.tonelaje_requerido,

      tipo_colada = current.tipo_colada,

      num_puntos_inyeccion = current.num_puntos_inyeccion,

      marca_colada_caliente = current.marca_colada_caliente,

      circuitos_enfriamiento = current.circuitos_enfriamiento,

      tipo_enfriamiento = current.tipo_enfriamiento,

      tipo_expulsion = current.tipo_expulsion,

      carrera_expulsion_mm = current.carrera_expulsion_mm,

      color = current.color,

      n_parte_1 = current.n_parte_1,

      n_parte_2 = current.n_parte_2,

      n_parte_3 = current.n_parte_3,

      n_parte_4 = current.n_parte_4,

      n_parte_5 = current.n_parte_5,

      n_parte_6 = current.n_parte_6,

      comentarios = current.comentarios,

      image_url = current.image_url,
    } = req.body;

    await pool.query(
        `



          UPDATE tbl_moldes SET



                              nombre = ?, estado = ?, año = ?, modelo = ?,



                              ciclos_inyeccion = ?, ciclos_acumulados = ?, capacidad_ciclos = ?, mantenimientos_preventivos = ?,



                              tipo_molde = ?, ubicacion = ?, maquina_asignada = ?, numero_serie = ?,



                              proveedor = ?, peso_kg = ?, dimensiones = ?, material_base = ?,



                              num_cavidades = ?, material_inyeccion = ?, peso_pieza_g = ?, peso_colada_g = ?,



                              tiempo_ciclo_seg = ?, temperatura_molde_c = ?, presion_inyeccion_bar = ?,



                              tonelaje_requerido = ?, tipo_colada = ?, num_puntos_inyeccion = ?,



                              marca_colada_caliente = ?, circuitos_enfriamiento = ?,



                              tipo_enfriamiento = ?, tipo_expulsion = ?, carrera_expulsion_mm = ?, color = ?,



                              n_parte_1 = ?, n_parte_2 = ?, n_parte_3 = ?, n_parte_4 = ?, n_parte_5 = ?, n_parte_6 = ?,



                              comentarios = ?, image_url = ?



          WHERE id_molde = ?



        `,

        [
          nombre,

          estado,

          año,

          modelo,

          ciclos_inyeccion,

          ciclos_acumulados,

          capacidad_ciclos,

          mantenimientos_preventivos,

          tipo_molde,

          ubicacion,

          maquina_asignada,

          numero_serie,

          proveedor,

          peso_kg,

          dimensiones,

          material_base,

          num_cavidades,

          material_inyeccion,

          peso_pieza_g,

          peso_colada_g,

          tiempo_ciclo_seg,

          temperatura_molde_c,

          presion_inyeccion_bar,

          tonelaje_requerido,

          tipo_colada,

          num_puntos_inyeccion,

          marca_colada_caliente,

          circuitos_enfriamiento,

          tipo_enfriamiento,

          tipo_expulsion,

          carrera_expulsion_mm,

          color,

          n_parte_1,

          n_parte_2,

          n_parte_3,

          n_parte_4,

          n_parte_5,

          n_parte_6,

          comentarios,

          image_url,

          id,
        ],
    );

    await logMoldeChange(
        pool,

        id,

        "update",

        JSON.stringify(current),

        JSON.stringify(req.body),
    );

    res.json({
      success: true,

      message: "Molde actualizado exitosamente",
    });
  } catch (error) {
    console.error("Error updating molde:", error);

    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
});

// Actualizar solo el estado del molde

app.patch("/api/moldes/:id/status", async (req, res) => {
  try {
    const { status } = req.body;

    await pool.query(
        "UPDATE tbl_moldes SET estado = ? WHERE id_molde = ?",

        [status, req.params.id],
    );

    res.json({
      success: true,
    });
  } catch (error) {
    console.error("Error updating molde status:", error);

    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
});

// Eliminar molde

app.delete("/api/moldes/:id", async (req, res) => {
  try {
    const id = req.params.id;

    const [existing] = await pool.query(
        "SELECT id_molde, nombre FROM tbl_moldes WHERE id_molde = ?",

        [id],
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,

        message: "Molde no encontrado",
      });
    }

    await pool.query("DELETE FROM tbl_moldes WHERE id_molde = ?", [id]);

    res.json({
      success: true,

      message: `Molde ${id} eliminado correctamente`,
    });
  } catch (error) {
    console.error("Error deleting molde:", error);

    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
});

app.get("/api/moldes/:id/ciclo-activo", async (req, res) => {
  try {
    const [rows] = await pool.query(
        `



          SELECT



            cr.*,



            TIMESTAMPDIFF(MINUTE, cr.fecha_inicio_reparacion, NOW()) AS minutos_transcurridos,



            TIMESTAMPDIFF(HOUR, cr.fecha_inicio_reparacion, NOW()) AS horas_transcurridas,



            TIMESTAMPDIFF(DAY, cr.fecha_inicio_reparacion, NOW()) AS dias_transcurridos



          FROM tbl_ciclos_reparacion_molde cr



          WHERE cr.molde_id = ? AND cr.ciclo_activo = TRUE



          ORDER BY cr.fecha_inicio_reparacion DESC



            LIMIT 1



        `,

        [req.params.id],
    );

    if (rows.length === 0) {
      return res.json({
        ciclo: null,

        message: "No active repair cycle found",
      });
    }

    const [tecnicos] = await pool.query(
        `



          SELECT * FROM tbl_tecnicos_ciclo_molde



          WHERE ciclo_id = ?



          ORDER BY fecha_inicio ASC



        `,

        [rows[0].id_ciclo_reparacion],
    );

    res.json({
      ciclo: rows[0],

      tecnicos: tecnicos,
    });
  } catch (error) {
    console.error("Error fetching active molde cycle:", error);

    res.status(500).json({
      error: "Failed to fetch active repair cycle",
    });
  }
});

// Obtener historial de reparaciones del molde

app.get("/api/moldes/:id/ciclos-historial", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;

    const [rows] = await pool.query(
        `



          SELECT



            cr.*,



            CASE



              WHEN cr.tiempo_reparacion_horas <= 4 THEN 'Rápida (≤4h)'



              WHEN cr.tiempo_reparacion_horas <= 24 THEN 'Normal (4-24h)'



              WHEN cr.tiempo_reparacion_horas <= 72 THEN 'Extendida (1-3 días)'



              ELSE 'Prolongada (>3 días)'



              END AS clasificacion_tiempo



          FROM tbl_ciclos_reparacion_molde cr



          WHERE cr.molde_id = ?



          ORDER BY cr.fecha_inicio_reparacion DESC



            LIMIT ?



        `,

        [req.params.id, limit],
    );

    res.json(rows);
  } catch (error) {
    console.error("Error fetching molde repair history:", error);

    res.status(500).json({
      error: "Failed to fetch repair history",
    });
  }
});

// Estadísticas del molde

app.get("/api/moldes/:id/estadisticas", async (req, res) => {
  try {
    const [stats] = await pool.query(
        `



          SELECT



            molde_id,



            COUNT(*) AS total_reparaciones,



            COUNT(CASE WHEN ciclo_activo = FALSE THEN 1 END) AS reparaciones_completadas,



            COUNT(CASE WHEN ciclo_activo = TRUE THEN 1 END) AS reparaciones_activas,



            AVG(CASE WHEN ciclo_activo = FALSE THEN tiempo_reparacion_horas END) AS promedio_horas_reparacion,



            MIN(CASE WHEN ciclo_activo = FALSE THEN tiempo_reparacion_horas END) AS min_horas_reparacion,



            MAX(CASE WHEN ciclo_activo = FALSE THEN tiempo_reparacion_horas END) AS max_horas_reparacion,



            SUM(CASE WHEN motivo_entrada = 'Falla de Molde' THEN 1 ELSE 0 END) AS total_fallas,



            SUM(CASE WHEN motivo_entrada = 'Limpieza General' THEN 1 ELSE 0 END) AS total_limpiezas,



            SUM(CASE WHEN motivo_entrada = 'Cambio de Modelo' THEN 1 ELSE 0 END) AS total_cambios_modelo,



            SUM(CASE WHEN motivo_entrada = 'Mantenimiento Preventivo' THEN 1 ELSE 0 END) AS total_mantenimientos,



            SUM(CASE WHEN motivo_entrada = 'Cambio de Componente' THEN 1 ELSE 0 END) AS total_cambios_componente



          FROM tbl_ciclos_reparacion_molde



          WHERE molde_id = ?



          GROUP BY molde_id



        `,

        [req.params.id],
    );

    res.json(
        stats[0] || {
          total_reparaciones: 0,

          reparaciones_completadas: 0,

          promedio_horas_reparacion: null,
        },
    );
  } catch (error) {
    console.error("Error fetching molde statistics:", error);

    res.status(500).json({
      error: "Failed to fetch statistics",
    });
  }
});

// Iniciar nuevo ciclo de reparación de molde

app.post("/api/moldes/:id/iniciar-ciclo", async (req, res) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const {
      molde_nombre,

      modelo,

      motivo_entrada,

      falla_id,

      falla_descripcion,

      folio,

      empleado,

      comentarios,

      status_anterior,

      maquina_origen,

      nivel,

      grupo,

      prioridad,
    } = req.body;

    const [existing] = await connection.query(
        `



          SELECT id_ciclo_reparacion FROM tbl_ciclos_reparacion_molde



          WHERE molde_id = ? AND ciclo_activo = TRUE



        `,

        [req.params.id],
    );

    if (existing.length > 0) {
      await connection.rollback();

      return res.status(400).json({
        error: "Active repair cycle already exists",

        ciclo_id: existing[0].id_ciclo_reparacion,
      });
    }

    const [result] = await connection.query(
        `



          INSERT INTO tbl_ciclos_reparacion_molde (



            molde_id, molde_nombre, modelo,



            fecha_inicio_reparacion, motivo_entrada,



            falla_id, falla_descripcion,



            folio_entrada, empleado_registro, comentarios_entrada,



            status_anterior, maquina_origen,



            nivel_reparacion, grupo_reparacion, prioridad,



            fecha_bajado, ciclo_activo



          ) VALUES (?, ?, ?, NOW(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), TRUE)



        `,

        [
          req.params.id,

          molde_nombre,

          modelo,

          motivo_entrada,

          falla_id || null,

          falla_descripcion || null,

          folio,

          empleado,

          comentarios || null,

          status_anterior || "En maquina",

          maquina_origen || null,

          nivel || null,

          grupo || null,

          prioridad || 3,
        ],
    );

    await connection.query(
        `



          UPDATE tbl_moldes SET estado = 'Reparando' WHERE id_molde = ?



        `,

        [req.params.id],
    );

    await connection.commit();

    res.json({
      success: true,

      ciclo_id: result.insertId,

      message: "Repair cycle started successfully",
    });
  } catch (error) {
    await connection.rollback();

    console.error("Error starting molde repair cycle:", error);

    res.status(500).json({
      error: "Failed to start repair cycle",
    });
  } finally {
    connection.release();
  }
});

// Actualizar paso del proceso de reparación

app.patch("/api/ciclos-molde/:id/proceso", async (req, res) => {
  try {
    const { paso } = req.body;

    let field;

    switch (paso) {
      case "recepcion":
        field = "fecha_recepcion_taller";

        break;

      case "inicio":
        field = "fecha_inicio_trabajo";

        break;

      case "termino":
        field = "fecha_termino_trabajo";

        break;

      default:
        return res.status(400).json({
          error: "Invalid step",
        });
    }

    await pool.query(
        `



          UPDATE tbl_ciclos_reparacion_molde



          SET ${field} = NOW()



          WHERE id_ciclo_reparacion = ? AND ciclo_activo = TRUE



        `,

        [req.params.id],
    );

    const [updated] = await pool.query(
        `



          SELECT fecha_bajado, fecha_recepcion_taller, fecha_inicio_trabajo, fecha_termino_trabajo



          FROM tbl_ciclos_reparacion_molde WHERE id_ciclo_reparacion = ?



        `,

        [req.params.id],
    );

    res.json({
      success: true,

      proceso: updated[0],
    });
  } catch (error) {
    console.error("Error updating molde repair step:", error);

    res.status(500).json({
      error: "Failed to update repair step",
    });
  }
});

// Agregar técnico a ciclo de molde

app.post("/api/ciclos-molde/:id/tecnicos", async (req, res) => {
  try {
    const { empleado_numero, empleado_nombre, grupo, tipo } = req.body;

    const [result] = await pool.query(
        `



          INSERT INTO tbl_tecnicos_ciclo_molde (ciclo_id, empleado_numero, empleado_nombre, grupo, tipo)



          VALUES (?, ?, ?, ?, ?)



        `,

        [
          req.params.id,

          empleado_numero || null,

          empleado_nombre,

          grupo || null,

          tipo || "Técnico",
        ],
    );

    const [tecnico] = await pool.query(
        `



          SELECT * FROM tbl_tecnicos_ciclo_molde WHERE id_tecnico_ciclo = ?



        `,

        [result.insertId],
    );

    res.json({
      success: true,

      tecnico: tecnico[0],
    });
  } catch (error) {
    console.error("Error adding technician to molde cycle:", error);

    res.status(500).json({
      error: "Failed to add technician",
    });
  }
});

// Quitar técnico del ciclo de molde

app.delete("/api/tecnicos-molde/:id", async (req, res) => {
  try {
    await pool.query(
        `



          UPDATE tbl_tecnicos_ciclo_molde SET fecha_fin = NOW() WHERE id_tecnico_ciclo = ? AND fecha_fin IS NULL



        `,

        [req.params.id],
    );

    res.json({
      success: true,
    });
  } catch (error) {
    console.error("Error removing technician from molde cycle:", error);

    res.status(500).json({
      error: "Failed to remove technician",
    });
  }
});

// Actualizar prioridad de ciclo de molde

app.post("/api/ciclos-molde/:id/prioridad", async (req, res) => {
  try {
    const { prioridad } = req.body;

    await pool.query(
        `



          UPDATE tbl_ciclos_reparacion_molde SET prioridad = ? WHERE id_ciclo_reparacion = ?



        `,

        [prioridad, req.params.id],
    );

    res.json({
      success: true,
    });
  } catch (error) {
    console.error("Error updating molde priority:", error);

    res.status(500).json({
      error: "Failed to update priority",
    });
  }
});

// Agregar detalle de falla al ciclo de molde

app.post("/api/ciclos-molde/:id/agregar-detalle", async (req, res) => {
  try {
    const { falla_id, falla_descripcion } = req.body;

    const [current] = await pool.query(
        `



          SELECT falla_descripcion FROM tbl_ciclos_reparacion_molde WHERE id_ciclo_reparacion = ?



        `,

        [req.params.id],
    );

    const newDescripcion = current[0].falla_descripcion
        ? `${current[0].falla_descripcion}; ${falla_descripcion}`
        : falla_descripcion;

    await pool.query(
        `



          UPDATE tbl_ciclos_reparacion_molde



          SET falla_id = COALESCE(falla_id, ?), falla_descripcion = ?



          WHERE id_ciclo_reparacion = ?



        `,

        [falla_id, newDescripcion, req.params.id],
    );

    res.json({
      success: true,
    });
  } catch (error) {
    console.error("Error adding detail to molde cycle:", error);

    res.status(500).json({
      error: "Failed to add detail",
    });
  }
});

// Cerrar ciclo de reparación de molde

app.post("/api/ciclos-molde/:id/cerrar", async (req, res) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const { status_salida, empleado_cierre, comentarios, folio } = req.body;

    const [ciclo] = await connection.query(
        `



          SELECT molde_id FROM tbl_ciclos_reparacion_molde WHERE id_ciclo_reparacion = ? AND ciclo_activo = TRUE



        `,

        [req.params.id],
    );

    if (ciclo.length === 0) {
      await connection.rollback();

      return res.status(404).json({
        error: "Active repair cycle not found",
      });
    }

    await connection.query(
        `



          UPDATE tbl_ciclos_reparacion_molde



          SET



            fecha_fin_reparacion = NOW(),



            status_salida = ?,



            empleado_cierre = ?,



            comentarios_salida = ?,



            folio_salida = ?,



            fecha_termino_trabajo = COALESCE(fecha_termino_trabajo, NOW()),



            ciclo_activo = FALSE



          WHERE id_ciclo_reparacion = ? AND ciclo_activo = TRUE



        `,

        [
          status_salida,

          empleado_cierre,

          comentarios || null,

          folio || null,

          req.params.id,
        ],
    );

    await connection.query(
        `



          UPDATE tbl_tecnicos_ciclo_molde



          SET fecha_fin = NOW()



          WHERE ciclo_id = ? AND fecha_fin IS NULL



        `,

        [req.params.id],
    );

    await connection.query(
        `



          UPDATE tbl_moldes SET estado = ? WHERE id_molde = ?



        `,

        [status_salida, ciclo[0].molde_id],
    );

    await connection.commit();

    res.json({
      success: true,

      message: "Repair cycle closed successfully",
    });
  } catch (error) {
    await connection.rollback();

    console.error("Error closing molde repair cycle:", error);

    res.status(500).json({
      error: "Failed to close repair cycle",
    });
  } finally {
    connection.release();
  }
});

// Poner ciclo de molde como pendiente

app.post("/api/ciclos-molde/:id/pendiente", async (req, res) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const { fecha_liberacion, motivo, empleado } = req.body;

    const [ciclo] = await connection.query(
        `



          SELECT molde_id FROM tbl_ciclos_reparacion_molde WHERE id_ciclo_reparacion = ?



        `,

        [req.params.id],
    );

    if (ciclo.length === 0) {
      await connection.rollback();

      return res.status(404).json({
        error: "Repair cycle not found",
      });
    }

    await connection.query(
        `



          UPDATE tbl_ciclos_reparacion_molde



          SET



            fecha_fin_reparacion = NOW(),



            status_salida = 'Pendiente',



            empleado_cierre = ?,



            comentarios_salida = ?,



            ciclo_activo = FALSE



          WHERE id_ciclo_reparacion = ?



        `,

        [
          empleado,

          `Pendiente hasta: ${fecha_liberacion}. Motivo: ${motivo}`,

          req.params.id,
        ],
    );

    await connection.query(
        `



          UPDATE tbl_moldes SET estado = 'Pendiente' WHERE id_molde = ?



        `,

        [ciclo[0].molde_id],
    );

    await connection.commit();

    res.json({
      success: true,
    });
  } catch (error) {
    await connection.rollback();

    console.error("Error setting molde as pending:", error);

    res.status(500).json({
      error: "Failed to set as pending",
    });
  } finally {
    connection.release();
  }
});

app.post("/api/moldes/:id/action", async (req, res) => {
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

      new_status,
    } = req.body;

    const [moldeInfo] = await connection.query(
        `



          SELECT id_molde as molde_id, nombre, modelo, estado as status, maquina_asignada as maquina_actual



          FROM tbl_moldes WHERE id_molde = ?



        `,

        [req.params.id],
    );

    if (moldeInfo.length === 0) {
      await connection.rollback();

      return res.status(404).json({
        error: "Molde not found",
      });
    }

    const molde = moldeInfo[0];

    let falla_descripcion = null;

    if (falla_id) {
      const [falla] = await connection.query(
          `



            SELECT descripcion FROM tbl_fallas_catalogo_molde WHERE id_falla_molde = ?



          `,

          [falla_id],
      );

      if (falla.length > 0) {
        falla_descripcion = falla[0].descripcion;
      }
    }

    const [historyResult] = await connection.query(
        `



          INSERT INTO tbl_historial_molde (



            molde_id, tipo_registro, action_type, id_falla, modelo_nuevo,



            folio, comentarios, empleado_molde, nivel_setup, grupo



          ) VALUES (?, 'baja_molde', ?, ?, ?, ?, ?, ?, ?, ?)



        `,

        [
          req.params.id,

          tipo_accion,

          falla_id || null,

          modelo_nuevo_id || null,

          folio,

          comentarios || null,

          empleado,

          nivel || null,

          grupo || null,
        ],
    );

    if (new_status) {
      await connection.query(
          `



            UPDATE tbl_moldes SET estado = ? WHERE id_molde = ?



          `,

          [new_status, req.params.id],
      );

      if (new_status === "Reparando") {
        let motivo_entrada = "Otro";

        if (tipo_accion === "Falla de Molde") motivo_entrada = "Falla de Molde";
        else if (tipo_accion === "Limpieza General")
          motivo_entrada = "Limpieza General";
        else if (tipo_accion === "Cambio de Modelo")
          motivo_entrada = "Cambio de Modelo";

        const [existingCycle] = await connection.query(
            `



              SELECT id_ciclo_reparacion FROM tbl_ciclos_reparacion_molde



              WHERE molde_id = ? AND ciclo_activo = TRUE



            `,

            [req.params.id],
        );

        if (existingCycle.length === 0) {
          await connection.query(
              `



                INSERT INTO tbl_ciclos_reparacion_molde (



                  molde_id, molde_nombre, modelo,



                  fecha_inicio_reparacion, motivo_entrada,



                  falla_id, falla_descripcion, folio_entrada,



                  empleado_registro, comentarios_entrada, status_anterior,



                  maquina_origen, nivel_reparacion, grupo_reparacion,



                  fecha_bajado, ciclo_activo



                ) VALUES (?, ?, ?, NOW(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), TRUE)



              `,

              [
                req.params.id,

                molde.nombre,

                molde.modelo,

                motivo_entrada,

                falla_id || null,

                falla_descripcion,

                folio,

                empleado,

                comentarios || null,

                molde.status,

                molde.maquina_actual,

                nivel || null,

                grupo || null,
              ],
          );
        }
      }
    }

    await connection.commit();

    res.json({
      success: true,

      history_id: historyResult.insertId,
    });
  } catch (error) {
    await connection.rollback();

    console.error("Error recording molde action:", error);

    res.status(500).json({
      error: "Error recording action",
    });
  } finally {
    connection.release();
  }
});

// Obtener historial de molde

app.get("/api/moldes/:id/history", async (req, res) => {
  try {
    const [history] = await pool.query(
        `



          SELECT



            h.*,



            fc.descripcion as falla_descripcion,



            am.descripcion as motivo_descripcion



          FROM tbl_historial_molde h



                 LEFT JOIN tbl_fallas_catalogo_molde fc ON h.id_falla = fc.id_falla_molde



                 LEFT JOIN tbl_asistencia_maquina am ON h.id_falla = am.id_asistencia_maquina



          WHERE h.molde_id = ?



          ORDER BY h.creado_el DESC



        `,

        [req.params.id],
    );

    res.json(
        history.map((h) => ({
          id: h.id_historial,

          tipo_registro: h.tipo_registro || "legacy",

          action_type: h.action_type,

          folio: h.folio,

          falla_description: h.falla_descripcion,

          motivo_description: h.motivo_descripcion,

          modelo_nuevo: h.modelo_nuevo,

          nivel_setup: h.nivel_setup,

          grupo: h.grupo,

          comentarios: h.comentarios,

          comentarios_supervisor: h.comentarios_supervisor,

          empleado: h.empleado_molde || h.empleado_asistencia,

          created_at: h.creado_el,
        })),
    );
  } catch (error) {
    console.error("Error fetching molde history:", error);

    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
});

app.get("/api/estadisticas-moldes", async (req, res) => {
  try {
    const [total] = await pool.query(
        "SELECT COUNT(*) as count FROM tbl_moldes",
    );

    const [activos] = await pool.query(
        "SELECT COUNT(*) as count FROM tbl_moldes WHERE estado IN ('En maquina', 'Listo')",
    );

    const [reparando] = await pool.query(
        "SELECT COUNT(*) as count FROM tbl_moldes WHERE estado = 'Reparando'",
    );

    const [pendientes] = await pool.query(
        "SELECT COUNT(*) as count FROM tbl_moldes WHERE estado = 'Pendiente'",
    );

    res.json({
      total: total[0].count,

      activos: activos[0].count,

      reparando: reparando[0].count,

      pendientes: pendientes[0].count,
    });
  } catch (error) {
    console.error("Error fetching estadisticas moldes:", error);

    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
});

app.get("/api/reparaciones-activas-molde", async (req, res) => {
  try {
    const [rows] = await pool.query(`



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



    `);

    for (let row of rows) {
      const [tecnicos] = await pool.query(
          `



            SELECT empleado_nombre, grupo, tipo



            FROM tbl_tecnicos_ciclo_molde



            WHERE ciclo_id = ? AND fecha_fin IS NULL



          `,

          [row.id_ciclo_reparacion],
      );

      row.tecnicos = tecnicos;
    }

    res.json(rows);
  } catch (error) {
    console.error("Error fetching active molde repairs:", error);

    res.status(500).json({
      error: "Failed to fetch active repairs",
    });
  }
});

app.get("/api/priority-repairs-molde", async (req, res) => {
  try {
    const [repairs] = await pool.query(`



      SELECT cr.prioridad, m.id_molde, m.nombre



      FROM tbl_ciclos_reparacion_molde cr



             JOIN tbl_moldes m ON cr.molde_id COLLATE utf8mb4_general_ci = m.id_molde



      WHERE cr.ciclo_activo = TRUE



      ORDER BY cr.prioridad ASC, cr.fecha_inicio_reparacion ASC



    `);

    res.json(
        repairs.map((r) => ({
          priority: r.prioridad,

          id: r.id_molde,

          name: r.nombre,
        })),
    );
  } catch (error) {
    console.error("Error fetching molde priority repairs:", error);

    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
});

app.get("/api/moldes-summary", async (req, res) => {
  try {
    const [summary] = await pool.query(
        'SELECT etiqueta, count, goal, perf FROM tbl_resumen_moldes ORDER BY FIELD(etiqueta, "UP", "BACKUP", "TOTAL")',
    );

    if (summary.length > 0) {
      res.json(
          summary.map((s) => ({
            label: s.etiqueta,

            count: s.count,

            goal: s.goal,

            perf: s.perf,
          })),
      );
    } else {
      const [total] = await pool.query(
          "SELECT COUNT(*) as count FROM tbl_moldes",
      );

      const [up] = await pool.query(
          "SELECT COUNT(*) as count FROM tbl_moldes WHERE estado = 'En maquina'",
      );

      const [backup] = await pool.query(
          "SELECT COUNT(*) as count FROM tbl_moldes WHERE estado = 'Listo-BackUp'",
      );

      res.json([
        {
          label: "UP",

          count: up[0].count,

          goal: null,

          perf: null,
        },

        {
          label: "BACKUP",

          count: backup[0].count,

          goal: null,

          perf: null,
        },

        {
          label: "TOTAL",

          count: total[0].count,

          goal: null,

          perf: null,
        },
      ]);
    }
  } catch (error) {
    console.error("Error fetching molde summary:", error);

    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
});

app.get("/api/resumen-mensual-molde", async (req, res) => {
  try {
    const year = req.query.year || new Date().getFullYear();

    const [rows] = await pool.query(
        `



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



        `,

        [year],
    );

    res.json(rows);
  } catch (error) {
    console.error("Error fetching molde monthly summary:", error);

    res.status(500).json({
      error: "Failed to fetch monthly summary",
    });
  }
});

async function logMoldeChange(pool, moldeId, campo, valorAnterior, valorNuevo) {
  try {
    await pool.query(
        `



          INSERT INTO tbl_moldes_historial (molde_id, campo_modificado, valor_anterior, valor_nuevo)



          VALUES (?, ?, ?, ?)



        `,

        [moldeId, campo, valorAnterior, valorNuevo],
    );
  } catch (error) {
    console.error("Error logging molde change:", error);
  }
}

//fin de apis para crud de modelos

//funciones  complementarias

async function logChange(pool, troquelId, campo, valorAnterior, valorNuevo) {
  try {
    await pool.query(
        `

          INSERT INTO tbl_troqueles_historial (troquel_id, campo_modificado, valor_anterior, valor_nuevo)

          VALUES (?, ?, ?, ?)

        `,

        [troquelId, campo, valorAnterior, valorNuevo],
    );
  } catch (error) {
    console.error("Error logging change:", error);
  }
}

//inicializar srvidor

app.listen(PORT, () => {
  console.log(`\nE-Kanban Toolroom API Server running on port ${PORT}`);

  console.log(`\nAvailable endpoints:`);

  console.log(`Health check: http://localhost:${PORT}/api/health`);

  console.log(`Login: POST http://localhost:${PORT}/api/login`);

  console.log(`Troqueles: http://localhost:${PORT}/api/troqueles`);

  console.log(`Modelos: http://localhost:${PORT}/api/modelos`);

  console.log(`Modelos Update: PUT http://localhost:${PORT}/api/modelos/:id`);

  console.log(`Prensas (dropdown): http://localhost:${PORT}/api/prensas`);

  console.log(`Prensas CRUD: http://localhost:${PORT}/api/prensas/crud`);

  console.log(
      `Active Repairs: http://localhost:${PORT}/api/reparaciones-activas`,
  );

  console.log(`Statistics: http://localhost:${PORT}/api/estadisticas`);
});
