import React, { useState, useCallback, useMemo, useEffect } from "react";
import ReactDOM from "react-dom";

import createStyles, {
  getStatusStyle,
  generateYears,
  cssAnimations,
} from "../styles/adminDieRegistration.styles";

// Configuración de la API

const API_BASE = "http://localhost:3001/api";

// Mapear datos del formulario al formato de la API

const mapMoldFormToApi = (formData) => {
  return {
    id_molde: formData.id?.trim().toUpperCase(),

    nombre: formData.name?.trim(),

    estado: formData.status,

    año: parseInt(formData.year),

    modelo: formData.model?.trim() || null,

    ciclos_inyeccion: formData.ciclos_inyeccion || "-",

    ciclos_acumulados: formData.ciclos_acumulados || "-",

    capacidad_ciclos: formData.capacidad_ciclos || "-",

    mantenimientos_preventivos: formData.mantenimientos_preventivos || "0",

    tipo_molde: formData.tipo_molde || "Null",

    ubicacion: formData.ubicacion || null,

    maquina_asignada: formData.maquina_asignada || null,

    numero_serie: formData.numero_serie || null,

    proveedor: formData.proveedor || null,

    peso_kg: formData.peso_kg || null,

    dimensiones: formData.dimensiones || null,

    material_base: formData.material_base || null,

    num_cavidades: formData.num_cavidades || null,

    material_inyeccion: formData.material_inyeccion || null,

    peso_pieza_g: formData.peso_pieza_g || null,

    peso_colada_g: formData.peso_colada_g || null,

    tiempo_ciclo_seg: formData.tiempo_ciclo_seg || null,

    temperatura_molde_c: formData.temperatura_molde_c || null,

    presion_inyeccion_bar: formData.presion_inyeccion_bar || null,

    tonelaje_requerido: formData.tonelaje_requerido || null,

    tipo_colada: formData.tipo_colada || "Null",

    num_puntos_inyeccion: formData.num_puntos_inyeccion || null,

    marca_colada_caliente: formData.marca_colada_caliente || null,

    circuitos_enfriamiento: formData.circuitos_enfriamiento || null,

    tipo_enfriamiento: formData.tipo_enfriamiento || "Null",

    tipo_expulsion: formData.tipo_expulsion || "Null",

    carrera_expulsion_mm: formData.carrera_expulsion_mm || null,

    color: formData.color || null,

    n_parte_1: formData.n_parte_1 || null,

    n_parte_2: formData.n_parte_2 || null,

    n_parte_3: formData.n_parte_3 || null,

    n_parte_4: formData.n_parte_4 || null,

    n_parte_5: formData.n_parte_5 || null,

    n_parte_6: formData.n_parte_6 || null,

    comentarios: formData.notes || null,

    image_url: formData.image_url || null,
  };
};

// Mapear datos de la API al formato del formulario

const mapApiToMoldForm = (apiData) => {
  return {
    id: apiData.id || apiData.id_molde || "",

    name: apiData.name || apiData.nombre || "",

    status: apiData.status || apiData.estado || "Pendiente",

    year: apiData.year || apiData.año || new Date().getFullYear(),

    model: apiData.model || apiData.modelo || "",

    ciclos_inyeccion: apiData.ciclos_inyeccion || "",

    ciclos_acumulados: apiData.ciclos_acumulados || "",

    capacidad_ciclos: apiData.capacidad_ciclos || "",

    mantenimientos_preventivos: apiData.mantenimientos_preventivos || "0",

    tipo_molde: apiData.tipo_molde || "Null",

    ubicacion: apiData.ubicacion || "",

    maquina_asignada: apiData.maquina_asignada || "",

    numero_serie: apiData.numero_serie || "",

    proveedor: apiData.proveedor || "",

    peso_kg: apiData.peso_kg || "",

    dimensiones: apiData.dimensiones || "",

    material_base: apiData.material_base || "",

    num_cavidades: apiData.num_cavidades || "",

    material_inyeccion: apiData.material_inyeccion || "",

    peso_pieza_g: apiData.peso_pieza_g || "",

    peso_colada_g: apiData.peso_colada_g || "",

    tiempo_ciclo_seg: apiData.tiempo_ciclo_seg || "",

    temperatura_molde_c: apiData.temperatura_molde_c || "",

    presion_inyeccion_bar: apiData.presion_inyeccion_bar || "",

    tonelaje_requerido: apiData.tonelaje_requerido || "",

    tipo_colada: apiData.tipo_colada || "Null",

    num_puntos_inyeccion: apiData.num_puntos_inyeccion || "",

    marca_colada_caliente: apiData.marca_colada_caliente || "",

    circuitos_enfriamiento: apiData.circuitos_enfriamiento || "",

    tipo_enfriamiento: apiData.tipo_enfriamiento || "Null",

    tipo_expulsion: apiData.tipo_expulsion || "Null",

    carrera_expulsion_mm: apiData.carrera_expulsion_mm || "",

    color: apiData.color || "",

    n_parte_1: apiData.n_parte_1 || "",

    n_parte_2: apiData.n_parte_2 || "",

    n_parte_3: apiData.n_parte_3 || "",

    n_parte_4: apiData.n_parte_4 || "",

    n_parte_5: apiData.n_parte_5 || "",

    n_parte_6: apiData.n_parte_6 || "",

    notes: apiData.notes || apiData.comentarios || "",

    image_url: apiData.image_url || "",
  };
};

// Defaults

const DEFAULT_MACHINE_OPTIONS = [{ value: "", label: "Sin asignar" }];

const DEFAULT_MOLD_TYPE_OPTIONS = [
  { value: "Null", label: "Sin especificar" },

  { value: "dos_placas", label: "Dos Placas" },

  { value: "tres_placas", label: "Tres Placas" },

  { value: "colada_caliente", label: "Colada Caliente" },

  { value: "stack", label: "Stack (Apilado)" },

  { value: "insertos", label: "Con Insertos" },

  { value: "desatornillado", label: "Desatornillado" },

  { value: "bi_inyeccion", label: "Bi-Inyección" },

  { value: "compresion", label: "Compresión" },
];

const DEFAULT_STATUS_OPTIONS = [
  { value: "Pendiente", label: "Pendiente" },

  { value: "En maquina", label: "En Máquina" },

  { value: "Listo", label: "Listo" },

  { value: "Listo-BackUp", label: "Listo - BackUp" },

  { value: "Reparando", label: "Reparando" },

  { value: "Calentando", label: "Calentando" },

  { value: "Baja", label: "Baja / Obsoleto" },
];

const COLADA_OPTIONS = [
  { value: "Null", label: "Sin especificar" },

  { value: "fria", label: "Fría" },

  { value: "caliente", label: "Caliente (Hot Runner)" },

  { value: "semi-caliente", label: "Semi-Caliente" },

  { value: "valvula", label: "Válvula (Valve Gate)" },
];

const ENFRIAMIENTO_OPTIONS = [
  { value: "Null", label: "Sin especificar" },

  { value: "agua", label: "Agua" },

  { value: "aceite", label: "Aceite" },

  { value: "mixto", label: "Mixto" },
];

const EXPULSION_OPTIONS = [
  { value: "Null", label: "Sin especificar" },

  { value: "pines", label: "Pines" },

  { value: "placa", label: "Placa" },

  { value: "aire", label: "Aire" },

  { value: "hidraulica", label: "Hidráulica" },

  { value: "mixto", label: "Mixto" },
];

const DEFAULT_MACHINE_STATUS_OPTIONS = [
  { value: "activa", label: "Activa" },

  { value: "mantenimiento", label: "En Mantenimiento" },

  { value: "inactiva", label: "Inactiva" },
];

// Format tipo values for display: null/Null → "Ninguno", underscores → spaces

const formatTipoDisplay = (value) => {
  if (!value || value.toLowerCase() === "null") return "Ninguno";

  return value.replace(/_/g, " ");
};

// Image compression utility

const compressImage = (
    file,

    { maxWidth = 1200, maxHeight = 1200, quality = 0.7 } = {},
) => {
  return new Promise((resolve, reject) => {
    if (file.size < 100 * 1024) {
      const reader = new FileReader();

      reader.onloadend = () => resolve(reader.result);

      reader.onerror = () => reject(new Error("Error al leer la imagen"));

      reader.readAsDataURL(file);

      return;
    }

    const img = new Image();

    const canvas = document.createElement("canvas");

    const ctx = canvas.getContext("2d");

    img.onload = () => {
      let { width, height } = img;

      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);

        width = Math.round(width * ratio);

        height = Math.round(height * ratio);
      }

      canvas.width = width;

      canvas.height = height;

      ctx.drawImage(img, 0, 0, width, height);

      const mimeType = file.type === "image/png" ? "image/png" : "image/jpeg";

      let outputQuality = quality;

      let result = canvas.toDataURL(mimeType, outputQuality);

      while (result.length > 500 * 1024 && outputQuality > 0.2) {
        outputQuality -= 0.1;

        result = canvas.toDataURL("image/jpeg", outputQuality);
      }

      URL.revokeObjectURL(img.src);

      resolve(result);
    };

    img.onerror = () => {
      URL.revokeObjectURL(img.src);

      reject(new Error("Error al cargar la imagen para compresión"));
    };

    img.src = URL.createObjectURL(file);
  });
};

// Collapsible Section Component

const CollapsibleSection = React.memo(
    ({ title, icon, isExpanded, onToggle, children, isRequired }) => {
      const sectionStyles = {
        container: {
          marginBottom: "16px",

          background: "rgba(0, 0, 0, 0.2)",

          borderRadius: "12px",

          border: "1px solid rgba(0, 255, 136, 0.1)",

          overflow: "hidden",

          transition: "all 0.3s ease",
        },

        header: {
          display: "flex",

          alignItems: "center",

          justifyContent: "space-between",

          padding: "16px 20px",

          cursor: "pointer",

          background: isExpanded ? "rgba(0, 255, 136, 0.08)" : "transparent",

          borderBottom: isExpanded
              ? "1px solid rgba(0, 255, 136, 0.15)"
              : "1px solid transparent",

          transition: "all 0.3s ease",

          userSelect: "none",
        },

        headerLeft: {
          display: "flex",

          alignItems: "center",

          gap: "12px",
        },

        icon: {
          fontSize: "18px",

          width: "28px",

          height: "28px",

          display: "flex",

          alignItems: "center",

          justifyContent: "center",

          background: isExpanded
              ? "rgba(0, 255, 136, 0.15)"
              : "rgba(255, 255, 255, 0.05)",

          borderRadius: "8px",

          transition: "all 0.3s ease",
        },

        title: {
          fontSize: "14px",

          fontWeight: 600,

          color: isExpanded ? "#00ff88" : "#ccc",

          letterSpacing: "0.3px",

          transition: "color 0.3s ease",
        },

        requiredBadge: {
          background: "rgba(255, 107, 107, 0.15)",

          color: "#ff6b6b",

          fontSize: "9px",

          padding: "3px 8px",

          borderRadius: "10px",

          fontWeight: 600,

          letterSpacing: "0.5px",
        },

        chevron: {
          width: "24px",

          height: "24px",

          display: "flex",

          alignItems: "center",

          justifyContent: "center",

          color: isExpanded ? "#00ff88" : "#666",

          transition: "transform 0.3s ease, color 0.3s ease",

          transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",

          fontSize: "18px",
        },

        content: {
          maxHeight: isExpanded ? "2000px" : "0",

          opacity: isExpanded ? 1 : 0,

          overflow: "hidden",

          transition:
              "max-height 0.4s ease, opacity 0.3s ease, padding 0.3s ease",

          padding: isExpanded ? "20px" : "0 20px",
        },
      };

      return (
          <div style={sectionStyles.container}>
            <div style={sectionStyles.header} onClick={onToggle}>
              <div style={sectionStyles.headerLeft}>
                <div style={sectionStyles.icon}>{icon || ""}</div>

                <span style={sectionStyles.title}>{title}</span>

                {isRequired && (
                    <span style={sectionStyles.requiredBadge}>REQUERIDO</span>
                )}
              </div>

              <div style={sectionStyles.chevron}>▼</div>
            </div>

            <div style={sectionStyles.content}>{children}</div>
          </div>
      );
    },
);

CollapsibleSection.displayName = "CollapsibleSection";

// Maquina status style helper

const getMaquinaStatusStyle = (status) => {
  const statusColors = {
    activa: {
      background: "rgba(0, 255, 136, 0.15)",

      color: "#00ff88",

      border: "1px solid rgba(0, 255, 136, 0.3)",
    },

    mantenimiento: {
      background: "rgba(255, 200, 0, 0.15)",

      color: "#ffc800",

      border: "1px solid rgba(255, 200, 0, 0.3)",
    },

    inactiva: {
      background: "rgba(255, 107, 107, 0.15)",

      color: "#ff6b6b",

      border: "1px solid rgba(255, 107, 107, 0.3)",
    },
  };

  return statusColors[status] || statusColors["activa"];
};

const AdminMoldRegistration = ({
                                 onNavigateBack,

                                 user,

                                 initialTab,

                                 hideChrome = false,

                                 onTabChange,
                               }) => {
  const styles = useMemo(() => createStyles(), []);

  const years = useMemo(() => generateYears(), []);

  // Tab state

  const [activeTab, _setActiveTab] = useState(initialTab || "register");

  // Sync tab from parent when it changes

  useEffect(() => {
    if (initialTab) _setActiveTab(initialTab);
  }, [initialTab]);

  // Wrap setActiveTab to notify parent

  const setActiveTab = useCallback(
      (tab) => {
        _setActiveTab(tab);

        if (onTabChange) onTabChange(tab);
      },

      [onTabChange],
  );

  // Collapsible sections

  const [expandedSections, setExpandedSections] = useState({
    basicInfo: true,

    production: false,

    injection: false,

    colada: false,

    cooling: false,

    expulsion: false,

    technical: false,

    partNumbers: false,

    image: false,

    notes: false,
  });

  // Dropdown options

  const [machineOptions, setMachineOptions] = useState(DEFAULT_MACHINE_OPTIONS);

  const [moldTypeOptions, setMoldTypeOptions] = useState(
      DEFAULT_MOLD_TYPE_OPTIONS,
  );

  const [statusOptions, setStatusOptions] = useState(DEFAULT_STATUS_OPTIONS);

  const [optionsLoading, setOptionsLoading] = useState(true);

  // Form state

  const [formData, setFormData] = useState({
    id: "",

    name: "",

    status: "Pendiente",

    year: new Date().getFullYear(),

    model: "",

    ciclos_inyeccion: "",

    ciclos_acumulados: "",

    capacidad_ciclos: "",

    mantenimientos_preventivos: "0",

    image_url: "",

    notes: "",

    maquina_asignada: "",

    tipo_molde: "",

    ubicacion: "",

    proveedor: "",

    peso_kg: "",

    dimensiones: "",

    material_base: "",

    numero_serie: "",

    num_cavidades: "",

    material_inyeccion: "",

    peso_pieza_g: "",

    peso_colada_g: "",

    tiempo_ciclo_seg: "",

    temperatura_molde_c: "",

    presion_inyeccion_bar: "",

    tonelaje_requerido: "",

    tipo_colada: "Null",

    num_puntos_inyeccion: "",

    marca_colada_caliente: "",

    circuitos_enfriamiento: "",

    tipo_enfriamiento: "Null",

    tipo_expulsion: "Null",

    carrera_expulsion_mm: "",

    color: "",

    n_parte_1: "",

    n_parte_2: "",

    n_parte_3: "",

    n_parte_4: "",

    n_parte_5: "",

    n_parte_6: "",
  });

  const [focusedField, setFocusedField] = useState(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [message, setMessage] = useState({ type: "", text: "" });

  const [imagePreview, setImagePreview] = useState(null);

  const [isCompressing, setIsCompressing] = useState(false);

  // List state

  const [molds, setMolds] = useState([]);

  const [isLoading, setIsLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");

  const [filterYear, setFilterYear] = useState("");

  const [filterStatus, setFilterStatus] = useState("");

  // Modal state

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [moldToDelete, setMoldToDelete] = useState(null);

  const [editingMold, setEditingMold] = useState(null);

  // Estado del modal de visualización de molde

  const [showViewMoldModal, setShowViewMoldModal] = useState(false);

  const [moldToView, setMoldToView] = useState(null);

  // Stats

  const [stats, setStats] = useState({
    total: 0,

    activos: 0,

    reparando: 0,

    pendientes: 0,
  });

  // Machine CRUD state

  const [maquinas, setMaquinas] = useState([]);

  const [maquinasLoading, setMaquinasLoading] = useState(false);

  const [maquinaSearchTerm, setMaquinaSearchTerm] = useState("");

  const [maquinaFilterStatus, setMaquinaFilterStatus] = useState("");

  const [editingMaquina, setEditingMaquina] = useState(null);

  const [showDeleteMaquinaModal, setShowDeleteMaquinaModal] = useState(false);

  const [maquinaToDelete, setMaquinaToDelete] = useState(null);

  const [maquinaFormData, setMaquinaFormData] = useState({
    identificador_maquina: "",

    nombre: "",

    estado: "activa",

    tonelaje_cierre: "",

    marca: "",

    modelo: "",

    capacidad_inyeccion_g: "",

    diametro_husillo_mm: "",

    ubicacion: "",

    notas: "",
  });

  const [maquinaExpandedSections, setMaquinaExpandedSections] = useState({
    basicInfo: true,

    technical: false,

    notes: false,
  });

  // Modelo CRUD state

  const [modelos, setModelos] = useState([]);

  const [modelosLoading, setModelosLoading] = useState(false);

  const [modeloSearchTerm, setModeloSearchTerm] = useState("");

  const [modeloFilterMolde, setModeloFilterMolde] = useState("");

  const [editingModelo, setEditingModelo] = useState(null);

  const [showDeleteModeloModal, setShowDeleteModeloModal] = useState(false);

  const [modeloToDelete, setModeloToDelete] = useState(null);

  const [modeloFormData, setModeloFormData] = useState({
    nombre_modelo: "",

    molde_id: "",

    descripcion: "",
  });

  // Toggle sections

  const toggleSection = useCallback((sectionKey) => {
    setExpandedSections((prev) => ({
      ...prev,

      [sectionKey]: !prev[sectionKey],
    }));
  }, []);

  const expandAllSections = useCallback(() => {
    setExpandedSections({
      basicInfo: true,

      production: true,

      injection: true,

      colada: true,

      cooling: true,

      expulsion: true,

      technical: true,

      partNumbers: true,

      image: true,

      notes: true,
    });
  }, []);

  const collapseAllSections = useCallback(() => {
    setExpandedSections({
      basicInfo: true,

      production: false,

      injection: false,

      colada: false,

      cooling: false,

      expulsion: false,

      technical: false,

      partNumbers: false,

      image: false,

      notes: false,
    });
  }, []);

  // Input handler

  const handleInputChange = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleMaquinaInputChange = useCallback((field, value) => {
    setMaquinaFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleModeloInputChange = useCallback((field, value) => {
    setModeloFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  // Dynamic input styles (matching adminDieRegistration pattern)

  const getInputStyle = useCallback(
      (fieldName, disabled = false) => ({
        ...styles.input,

        width: "100%",

        boxSizing: "border-box",

        borderColor:
            focusedField === fieldName ? "#00ff88" : "rgba(255, 255, 255, 0.08)",

        boxShadow:
            focusedField === fieldName ? "0 0 15px rgba(0, 255, 136, 0.2)" : "none",

        opacity: disabled ? 0.6 : 1,

        cursor: disabled ? "not-allowed" : "text",
      }),

      [focusedField, styles.input],
  );

  const getSelectStyle = useCallback(
      (fieldName) => ({
        ...styles.select,

        width: "100%",

        boxSizing: "border-box",

        borderColor:
            focusedField === fieldName ? "#00ff88" : "rgba(255, 255, 255, 0.08)",

        boxShadow:
            focusedField === fieldName ? "0 0 15px rgba(0, 255, 136, 0.2)" : "none",
      }),

      [focusedField, styles.select],
  );

  const handleFocus = useCallback((field) => {
    setFocusedField(field);
  }, []);

  const handleBlur = useCallback(() => {
    setFocusedField(null);
  }, []);

  // Fetch dropdown options (extracted as useCallback so it can be re-called after CRUD)

  const fetchOptions = useCallback(async () => {
    setOptionsLoading(true);

    try {
      const [maquinasRes, tiposRes] = await Promise.all([
        fetch(`${API_BASE}/maquinas`)
            .then((r) => r.json())

            .catch(() => null),

        fetch(`${API_BASE}/tipos_molde`)
            .then((r) => r.json())

            .catch(() => null),
      ]);

      if (maquinasRes && Array.isArray(maquinasRes)) {
        setMachineOptions([
          { value: "", label: "Sin asignar" },

          ...maquinasRes,
        ]);
      }

      if (tiposRes && Array.isArray(tiposRes)) {
        setMoldTypeOptions([
          { value: "Null", label: "Sin especificar" },

          ...tiposRes,
        ]);
      }
    } catch (error) {
      console.error("Error loading options:", error);
    } finally {
      setOptionsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOptions();
  }, [fetchOptions]);

  // Fetch molds list

  const fetchMolds = useCallback(async () => {
    setIsLoading(true);

    try {
      const res = await fetch(`${API_BASE}/moldes/list`);

      const data = await res.json();

      setMolds(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching molds:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch stats

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/estadisticas-moldes`);

      const data = await res.json();

      setStats(data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  }, []);

  // Fetch machines list

  const fetchMaquinas = useCallback(async () => {
    setMaquinasLoading(true);

    try {
      const res = await fetch(`${API_BASE}/maquinas/crud`);

      const data = await res.json();

      setMaquinas(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching maquinas:", error);
    } finally {
      setMaquinasLoading(false);
    }
  }, []);

  // Fetch modelos list

  const fetchModelos = useCallback(async () => {
    setModelosLoading(true);

    try {
      const res = await fetch(`${API_BASE}/modelos-molde`);

      const data = await res.json();

      setModelos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching modelos:", error);
    } finally {
      setModelosLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "list") {
      fetchMolds();

      fetchStats();
    } else if (activeTab === "maquinas") {
      fetchMaquinas();
    } else if (activeTab === "modelos") {
      fetchModelos();

      fetchMolds();
    } else if (activeTab === "register") {
      fetchOptions();
    }
  }, [
    activeTab,

    fetchMolds,

    fetchStats,

    fetchMaquinas,

    fetchModelos,

    fetchOptions,
  ]);

  // Image handler

  const handleImageChange = useCallback(async (e) => {
    const file = e.target.files[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMessage({
        type: "error",

        text: "Solo se permiten archivos de imagen",
      });

      return;
    }

    setIsCompressing(true);

    try {
      const compressed = await compressImage(file);

      setFormData((prev) => ({ ...prev, image_url: compressed }));

      setImagePreview(compressed);
    } catch {
      setMessage({ type: "error", text: "Error al procesar la imagen" });
    } finally {
      setIsCompressing(false);
    }
  }, []);

  // Submit mold form

  const handleSubmit = useCallback(
      async (e) => {
        e?.preventDefault();

        if (!formData.id.trim() || !formData.name.trim() || !formData.year) {
          setMessage({
            type: "error",

            text: "ID, Nombre y Año son campos requeridos",
          });

          setTimeout(() => setMessage({ type: "", text: "" }), 5000);

          return;
        }

        setIsSubmitting(true);

        setMessage({ type: "", text: "" });

        try {
          const apiData = mapMoldFormToApi(formData);

          const isEditing = !!editingMold;

          const url = isEditing
              ? `${API_BASE}/moldes/${editingMold.id_molde || editingMold.id}`
              : `${API_BASE}/moldes`;

          const method = isEditing ? "PUT" : "POST";

          const res = await fetch(url, {
            method,

            headers: { "Content-Type": "application/json" },

            body: JSON.stringify(apiData),
          });

          const result = await res.json();

          if (res.ok && result.success) {
            setMessage({
              type: "success",

              text: isEditing
                  ? "Molde actualizado exitosamente"
                  : "Molde registrado exitosamente",
            });

            resetForm();
          } else {
            setMessage({
              type: "error",

              text: result.message || "Error al guardar el molde",
            });
          }
        } catch (error) {
          setMessage({
            type: "error",

            text: "Error de conexión con el servidor",
          });
        } finally {
          setIsSubmitting(false);

          setTimeout(() => setMessage({ type: "", text: "" }), 5000);
        }
      },

      [formData, editingMold],
  );

  const resetForm = useCallback(() => {
    setFormData({
      id: "",

      name: "",

      status: "Pendiente",

      year: new Date().getFullYear(),

      model: "",

      ciclos_inyeccion: "",

      ciclos_acumulados: "",

      capacidad_ciclos: "",

      mantenimientos_preventivos: "0",

      image_url: "",

      notes: "",

      maquina_asignada: "",

      tipo_molde: "",

      ubicacion: "",

      proveedor: "",

      peso_kg: "",

      dimensiones: "",

      material_base: "",

      numero_serie: "",

      num_cavidades: "",

      material_inyeccion: "",

      peso_pieza_g: "",

      peso_colada_g: "",

      tiempo_ciclo_seg: "",

      temperatura_molde_c: "",

      presion_inyeccion_bar: "",

      tonelaje_requerido: "",

      tipo_colada: "Null",

      num_puntos_inyeccion: "",

      marca_colada_caliente: "",

      circuitos_enfriamiento: "",

      tipo_enfriamiento: "Null",

      tipo_expulsion: "Null",

      carrera_expulsion_mm: "",

      color: "",

      n_parte_1: "",

      n_parte_2: "",

      n_parte_3: "",

      n_parte_4: "",

      n_parte_5: "",

      n_parte_6: "",
    });

    setEditingMold(null);

    setImagePreview(null);

    collapseAllSections();
  }, [collapseAllSections]);

  // Edit mold

  const handleEdit = useCallback(
      (mold) => {
        setFormData(mapApiToMoldForm(mold));

        setEditingMold(mold);

        setImagePreview(mold.image_url || null);

        setActiveTab("register");

        expandAllSections();
      },

      [expandAllSections, setActiveTab],
  );

  // Ver detalle de molde

  const handleViewMold = useCallback((mold) => {
    setMoldToView(mold);

    setShowViewMoldModal(true);
  }, []);

  // Delete mold

  const handleDeleteClick = useCallback((mold) => {
    setMoldToDelete(mold);

    setShowDeleteModal(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!moldToDelete) return;

    try {
      const id = moldToDelete.id_molde || moldToDelete.id;

      const res = await fetch(`${API_BASE}/moldes/${id}`, {
        method: "DELETE",
      });

      const result = await res.json();

      if (res.ok && result.success) {
        setMessage({
          type: "success",

          text: "Molde eliminado exitosamente",
        });

        fetchMolds();

        fetchStats();
      } else {
        setMessage({
          type: "error",

          text: result.message || "Error al eliminar",
        });
      }
    } catch {
      setMessage({ type: "error", text: "Error de conexión" });
    } finally {
      setShowDeleteModal(false);

      setMoldToDelete(null);

      setTimeout(() => setMessage({ type: "", text: "" }), 5000);
    }
  }, [moldToDelete, fetchMolds, fetchStats]);

  // Machine CRUD handlers

  const handleMaquinaSubmit = useCallback(async () => {
    if (
        !maquinaFormData.identificador_maquina.trim() ||
        !maquinaFormData.nombre.trim()
    ) {
      setMessage({
        type: "error",

        text: "Identificador y nombre son requeridos",
      });

      setTimeout(() => setMessage({ type: "", text: "" }), 5000);

      return;
    }

    try {
      const isEditing = !!editingMaquina;

      const url = `${API_BASE}/maquinas/crud`;

      const method = isEditing ? "PUT" : "POST";

      const body = isEditing
          ? { ...maquinaFormData, id_maquina: editingMaquina.id_maquina }
          : maquinaFormData;

      const res = await fetch(url, {
        method,

        headers: { "Content-Type": "application/json" },

        body: JSON.stringify(body),
      });

      const result = await res.json();

      if (res.ok && (result.success || result.id_maquina)) {
        setMessage({
          type: "success",

          text: isEditing ? "Máquina actualizada" : "Máquina registrada",
        });

        resetMaquinaForm();

        setMaquinaExpandedSections({
          basicInfo: true,

          technical: false,

          notes: false,
        });

        fetchMaquinas();

        fetchOptions(); // Refresh dropdown options for mold registration form
      } else {
        setMessage({
          type: "error",

          text: result.message || "Error al guardar máquina",
        });
      }
    } catch {
      setMessage({ type: "error", text: "Error de conexión" });
    } finally {
      setTimeout(() => setMessage({ type: "", text: "" }), 5000);
    }
  }, [maquinaFormData, editingMaquina, fetchMaquinas, fetchOptions]);

  const resetMaquinaForm = useCallback(() => {
    setMaquinaFormData({
      identificador_maquina: "",

      nombre: "",

      estado: "activa",

      tonelaje_cierre: "",

      marca: "",

      modelo: "",

      capacidad_inyeccion_g: "",

      diametro_husillo_mm: "",

      ubicacion: "",

      notas: "",
    });

    setEditingMaquina(null);
  }, []);

  const handleEditMaquina = useCallback((maq) => {
    setMaquinaFormData({
      identificador_maquina: maq.identificador_maquina || "",

      nombre: maq.nombre || "",

      estado: maq.estado || "activa",

      tonelaje_cierre: maq.tonelaje_cierre || "",

      marca: maq.marca || "",

      modelo: maq.modelo || "",

      capacidad_inyeccion_g: maq.capacidad_inyeccion_g || "",

      diametro_husillo_mm: maq.diametro_husillo_mm || "",

      ubicacion: maq.ubicacion || "",

      notas: maq.notas || "",
    });

    setEditingMaquina(maq);

    setMaquinaExpandedSections({
      basicInfo: true,

      technical: true,

      notes: true,
    });
  }, []);

  const handleDeleteMaquinaClick = useCallback((maq) => {
    setMaquinaToDelete(maq);

    setShowDeleteMaquinaModal(true);
  }, []);

  const handleDeleteMaquinaConfirm = useCallback(async () => {
    if (!maquinaToDelete) return;

    try {
      const res = await fetch(
          `${API_BASE}/maquinas/crud?id=${maquinaToDelete.id_maquina}`,

          { method: "DELETE" },
      );

      const result = await res.json();

      if (res.ok && result.success) {
        setMessage({
          type: "success",

          text: "Máquina eliminada exitosamente",
        });

        fetchMaquinas();

        fetchOptions(); // Refresh dropdown options
      } else {
        setMessage({
          type: "error",

          text: result.message || "Error al eliminar",
        });
      }
    } catch {
      setMessage({ type: "error", text: "Error de conexión" });
    } finally {
      setShowDeleteMaquinaModal(false);

      setMaquinaToDelete(null);

      setTimeout(() => setMessage({ type: "", text: "" }), 5000);
    }
  }, [maquinaToDelete, fetchMaquinas, fetchOptions]);

  // Modelo CRUD handlers

  const handleModeloSubmit = useCallback(async () => {
    if (
        !modeloFormData.nombre_modelo.trim() ||
        !modeloFormData.molde_id.trim()
    ) {
      setMessage({
        type: "error",

        text: "Nombre del modelo y Molde son requeridos",
      });

      setTimeout(() => setMessage({ type: "", text: "" }), 5000);

      return;
    }

    try {
      const isEditing = !!editingModelo;

      const url = `${API_BASE}/modelos-molde`;

      const method = isEditing ? "PUT" : "POST";

      const body = isEditing
          ? { ...modeloFormData, id_modelo: editingModelo.id_modelo }
          : modeloFormData;

      const res = await fetch(url, {
        method,

        headers: { "Content-Type": "application/json" },

        body: JSON.stringify(body),
      });

      const result = await res.json();

      if (res.ok && (result.success || result.id_modelo)) {
        setMessage({
          type: "success",

          text: isEditing ? "Modelo actualizado" : "Modelo creado",
        });

        setModeloFormData({
          nombre_modelo: "",

          molde_id: "",

          descripcion: "",
        });

        setEditingModelo(null);

        fetchModelos();
      } else {
        setMessage({
          type: "error",

          text: result.message || "Error al guardar modelo",
        });
      }
    } catch {
      setMessage({ type: "error", text: "Error de conexión" });
    } finally {
      setTimeout(() => setMessage({ type: "", text: "" }), 5000);
    }
  }, [modeloFormData, editingModelo, fetchModelos]);

  const handleDeleteModeloClick = useCallback((modelo) => {
    setModeloToDelete(modelo);

    setShowDeleteModeloModal(true);
  }, []);

  const handleDeleteModeloConfirm = useCallback(async () => {
    if (!modeloToDelete) return;

    try {
      const res = await fetch(
          `${API_BASE}/modelos-molde/${modeloToDelete.id_modelo}`,

          { method: "DELETE" },
      );

      const result = await res.json();

      if (res.ok && result.success) {
        setMessage({
          type: "success",

          text: "Modelo eliminado exitosamente",
        });

        fetchModelos();
      } else {
        setMessage({
          type: "error",

          text: result.message || "Error al eliminar",
        });
      }
    } catch {
      setMessage({ type: "error", text: "Error de conexión" });
    } finally {
      setShowDeleteModeloModal(false);

      setModeloToDelete(null);

      setTimeout(() => setMessage({ type: "", text: "" }), 5000);
    }
  }, [modeloToDelete, fetchModelos]);

  // Filtered data

  const filteredMolds = useMemo(() => {
    return molds.filter((m) => {
      const matchSearch =
          !searchTerm ||
          (m.id_molde || "")

              .toLowerCase()

              .includes(searchTerm.toLowerCase()) ||
          (m.nombre || "")

              .toLowerCase()

              .includes(searchTerm.toLowerCase()) ||
          (m.modelo || "")

              .toLowerCase()

              .includes(searchTerm.toLowerCase()) ||
          (m.material_inyeccion || "")

              .toLowerCase()

              .includes(searchTerm.toLowerCase());

      const matchYear = !filterYear || String(m.año) === filterYear;

      const matchStatus = !filterStatus || m.estado === filterStatus;

      return matchSearch && matchYear && matchStatus;
    });
  }, [molds, searchTerm, filterYear, filterStatus]);

  const filteredMaquinas = useMemo(() => {
    return maquinas.filter((m) => {
      const matchSearch =
          !maquinaSearchTerm ||
          (m.identificador_maquina || "")

              .toLowerCase()

              .includes(maquinaSearchTerm.toLowerCase()) ||
          (m.nombre || "")

              .toLowerCase()

              .includes(maquinaSearchTerm.toLowerCase());

      const matchStatus =
          !maquinaFilterStatus || m.estado === maquinaFilterStatus;

      return matchSearch && matchStatus;
    });
  }, [maquinas, maquinaSearchTerm, maquinaFilterStatus]);

  const filteredModelos = useMemo(() => {
    return modelos.filter((m) => {
      const matchSearch =
          !modeloSearchTerm ||
          (m.nombre_modelo || "")

              .toLowerCase()

              .includes(modeloSearchTerm.toLowerCase()) ||
          (m.molde_id || "")

              .toLowerCase()

              .includes(modeloSearchTerm.toLowerCase());

      const matchMolde = !modeloFilterMolde || m.molde_id === modeloFilterMolde;

      return matchSearch && matchMolde;
    });
  }, [modelos, modeloSearchTerm, modeloFilterMolde]);

  // Estilos para controles de sección

  const sectionControlStyles = {
    container: {
      display: "flex",

      gap: "12px",

      marginBottom: "20px",

      justifyContent: "flex-end",
    },

    button: {
      background: "transparent",

      border: "1px solid rgba(0, 255, 136, 0.3)",

      color: "#00ff88",

      padding: "8px 16px",

      borderRadius: "8px",

      fontSize: "12px",

      cursor: "pointer",

      transition: "all 0.2s ease",

      display: "flex",

      alignItems: "center",

      gap: "6px",
    },
  };

  // Render modal de visualización de molde

  const renderMoldViewModal = () => {
    if (!showViewMoldModal || !moldToView) return null;

    const isFieldEmpty = (val) =>
        val === null ||
        val === undefined ||
        val === "" ||
        val === "Null" ||
        val === "-" ||
        val === "Ninguno";

    const id = moldToView.id_molde || moldToView.id;

    const name = moldToView.nombre || moldToView.name;

    const status = moldToView.estado || moldToView.status;

    const imageUrl = moldToView.image_url || moldToView.imageUrl;

    const fmtTipo = (val) =>
        val && val !== "Null" ? formatTipoDisplay(val) : null;

    const groups = [
      {
        title: "Información General",
        fields: [
          { label: "Año", value: moldToView.año || moldToView.year },
          { label: "Modelo", value: moldToView.modelo || moldToView.model },
          { label: "Tipo de Molde", value: fmtTipo(moldToView.tipo_molde) },
          {
            label: "Registrado",
            value: moldToView.creado_en
                ? new Date(moldToView.creado_en).toLocaleDateString("es-MX")
                : null,
          },
        ],
      },
      {
        title: "Asignación y Ubicación",
        fields: [
          { label: "Máquina Asignada", value: moldToView.maquina_asignada },
          { label: "Ubicación", value: moldToView.ubicacion },
          { label: "N° de Serie", value: moldToView.numero_serie },
        ],
      },
      {
        title: "Datos de Ciclos",
        fields: [
          { label: "Ciclos Inyección", value: moldToView.ciclos_inyeccion },
          {
            label: "Ciclos Acumulados",
            value: moldToView.ciclos_acumulados,
          },
          { label: "Capacidad Ciclos", value: moldToView.capacidad_ciclos },
          {
            label: "Mant. Preventivos",
            value: moldToView.mantenimientos_preventivos,
          },
        ],
      },
      {
        title: "Parámetros de Inyección",
        fields: [
          { label: "N° Cavidades", value: moldToView.num_cavidades },
          { label: "Material Inyección", value: moldToView.material_inyeccion },
          { label: "Peso Pieza (g)", value: moldToView.peso_pieza_g },
          { label: "Peso Colada (g)", value: moldToView.peso_colada_g },
          { label: "Tiempo Ciclo (seg)", value: moldToView.tiempo_ciclo_seg },
          {
            label: "Temp. Molde (°C)",
            value: moldToView.temperatura_molde_c,
          },
          {
            label: "Presión Iny. (bar)",
            value: moldToView.presion_inyeccion_bar,
          },
          {
            label: "Tonelaje Requerido",
            value: moldToView.tonelaje_requerido,
          },
        ],
      },
      {
        title: "Colada / Enfriamiento / Expulsión",
        fields: [
          { label: "Tipo de Colada", value: fmtTipo(moldToView.tipo_colada) },
          {
            label: "Puntos de Inyección",
            value: moldToView.num_puntos_inyeccion,
          },
          {
            label: "Marca Hot Runner",
            value: moldToView.marca_colada_caliente,
          },
          {
            label: "Circuitos Enfriamiento",
            value: moldToView.circuitos_enfriamiento,
          },
          {
            label: "Tipo Enfriamiento",
            value: fmtTipo(moldToView.tipo_enfriamiento),
          },
          {
            label: "Tipo Expulsión",
            value: fmtTipo(moldToView.tipo_expulsion),
          },
          {
            label: "Carrera Expulsión (mm)",
            value: moldToView.carrera_expulsion_mm,
          },
        ],
      },
      {
        title: "Especificaciones Físicas",
        fields: [
          { label: "Proveedor", value: moldToView.proveedor },
          { label: "Peso (kg)", value: moldToView.peso_kg },
          { label: "Dimensiones", value: moldToView.dimensiones },
          { label: "Material Base", value: moldToView.material_base },
          { label: "Color", value: moldToView.color },
        ],
      },
      {
        title: "Números de Parte",
        fields: [
          { label: "N° Parte 1", value: moldToView.n_parte_1 },
          { label: "N° Parte 2", value: moldToView.n_parte_2 },
          { label: "N° Parte 3", value: moldToView.n_parte_3 },
          { label: "N° Parte 4", value: moldToView.n_parte_4 },
          { label: "N° Parte 5", value: moldToView.n_parte_5 },
          { label: "N° Parte 6", value: moldToView.n_parte_6 },
        ],
      },
      {
        title: "Notas",
        fields: [
          {
            label: "Comentarios",
            value: moldToView.comentarios || moldToView.notes,
            fullWidth: true,
          },
        ],
      },
    ];

    return ReactDOM.createPortal(
        <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0,0,0,0.85)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 9999,
              backdropFilter: "blur(4px)",
              padding: "20px",
            }}
            onClick={() => setShowViewMoldModal(false)}
        >
          <div
              style={{
                background: "linear-gradient(135deg, #0d1117 0%, #111827 100%)",
                border: "1px solid rgba(0,255,136,0.25)",
                borderRadius: "16px",
                width: "100%",
                maxWidth: "720px",
                maxHeight: "85vh",
                overflowY: "auto",
                boxShadow:
                    "0 25px 60px rgba(0,0,0,0.8), 0 0 40px rgba(0,255,136,0.08)",
              }}
              onClick={(e) => e.stopPropagation()}
          >
            {/* Banner imagen */}

            {imageUrl && (
                <div
                    style={{
                      width: "100%",
                      height: "200px",
                      overflow: "hidden",
                      borderRadius: "15px 15px 0 0",
                    }}
                >
                  <img
                      src={imageUrl}
                      alt={name}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        display: "block",
                      }}
                  />
                </div>
            )}

            {/* Encabezado */}

            <div
                style={{
                  padding: "20px 24px 16px",
                  borderBottom: "1px solid rgba(0,255,136,0.1)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
            >
              <div>
                <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      marginBottom: "6px",
                      flexWrap: "wrap",
                    }}
                >
                <span
                    style={{
                      color: "#00ff88",
                      fontWeight: 700,
                      fontSize: "1.3rem",
                      letterSpacing: "0.05em",
                      fontFamily: "monospace",
                    }}
                >
                  {id}
                </span>

                  <span
                      style={{ ...styles.statusBadge, ...getStatusStyle(status) }}
                  >
                  {status}
                </span>
                </div>

                <div style={{ color: "#ccc", fontSize: "1rem" }}>{name}</div>
              </div>

              <button
                  style={{
                    background: "transparent",
                    border: "1px solid rgba(255,255,255,0.15)",
                    borderRadius: "8px",
                    color: "#888",
                    width: "32px",
                    height: "32px",
                    cursor: "pointer",
                    fontSize: "14px",
                    flexShrink: 0,
                    marginLeft: "12px",
                  }}
                  onClick={() => setShowViewMoldModal(false)}
              >
                ✕
              </button>
            </div>

            {/* Campos agrupados */}

            <div style={{ padding: "20px 24px 8px" }}>
              {groups.map((group) => {
                const visible = group.fields.filter(
                    (f) => !isFieldEmpty(f.value),
                );

                if (visible.length === 0) return null;

                return (
                    <div key={group.title} style={{ marginBottom: "22px" }}>
                      <div
                          style={{
                            color: "#00ff88",
                            fontSize: "10px",
                            fontWeight: 700,
                            letterSpacing: "1.5px",
                            textTransform: "uppercase",
                            marginBottom: "12px",
                            paddingBottom: "6px",
                            borderBottom: "1px solid rgba(0,255,136,0.12)",
                          }}
                      >
                        {group.title}
                      </div>

                      <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(2, 1fr)",
                            gap: "10px 24px",
                          }}
                      >
                        {visible.map((f) => (
                            <div
                                key={f.label}
                                style={f.fullWidth ? { gridColumn: "1 / -1" } : {}}
                            >
                              <div
                                  style={{
                                    color: "#555",
                                    fontSize: "10px",
                                    fontWeight: 600,
                                    letterSpacing: "0.5px",
                                    textTransform: "uppercase",
                                    marginBottom: "3px",
                                  }}
                              >
                                {f.label}
                              </div>

                              <div
                                  style={{
                                    color: "#e0e0e0",
                                    fontSize: "14px",
                                    lineHeight: "1.5",
                                  }}
                              >
                                {String(f.value)}
                              </div>
                            </div>
                        ))}
                      </div>
                    </div>
                );
              })}
            </div>

            {/* Botones de acción */}

            <div
                style={{
                  display: "flex",
                  gap: "12px",
                  justifyContent: "flex-end",
                  padding: "16px 24px",
                  borderTop: "1px solid rgba(0,255,136,0.1)",
                  position: "sticky",
                  bottom: 0,
                  background: "#0d1117",
                  borderRadius: "0 0 16px 16px",
                }}
            >
              <button
                  style={styles.btnSecondary}
                  onClick={() => setShowViewMoldModal(false)}
              >
                Cerrar
              </button>

              <button
                  style={styles.btnPrimary}
                  onClick={() => {
                    setShowViewMoldModal(false);

                    handleEdit(moldToView);
                  }}
              >
                ✏ Editar Molde
              </button>
            </div>
          </div>
        </div>,
        document.body
    );
  };

  //renderizar

  return (
      <div style={hideChrome ? {} : styles.container}>
        {/* Header - solo cuando es página independiente */}

        {!hideChrome && (
            <header style={styles.header}>
              <div style={styles.headerLeft}>
                <button style={styles.backBtn} onClick={onNavigateBack}>
                  ← Volver
                </button>

                <div>
                  <h1 style={styles.headerTitle}>
                    Gestión de Moldes por Inyección
                  </h1>

                  <p style={styles.headerSubtitle}>
                    Registro, edición y administración de moldes
                  </p>
                </div>
              </div>
            </header>
        )}

        {/*alerta de error o exito*/}

        {message.type === "success" && (
            <div style={styles.successMessage}>
              <div
                  style={{
                    ...styles.messageIcon,

                    background: "rgba(0, 255, 136, 0.15)",
                  }}
              >
                ✓
              </div>

              <div>
                <strong style={{ color: "#00ff88", fontSize: "14px" }}>
                  {message.text}
                </strong>
              </div>
            </div>
        )}

        {message.type === "error" && (
            <div style={styles.errorMessage}>
              <div
                  style={{
                    ...styles.messageIcon,

                    background: "rgba(255, 107, 107, 0.15)",
                  }}
              >
                ✕
              </div>

              <div>
                <strong style={{ color: "#ff6b6b", fontSize: "14px" }}>
                  {message.text}
                </strong>
              </div>
            </div>
        )}

        {/*contenido principal*/}

        <main
            style={
                styles.main || {
                  position: "relative",

                  zIndex: 5,

                  padding: "30px 40px 60px",

                  maxWidth: "1600px",

                  margin: "0 auto",

                  flex: 1,

                  width: "100%",

                  boxSizing: "border-box",
                }
            }
        >
          {/* pestania de registro o actualizacion*/}

          {activeTab === "register" && (
              <form onSubmit={handleSubmit}>
                <div style={styles.formContainer}>
                  {editingMold && (
                      <div
                          style={{
                            marginBottom: "20px",

                            display: "flex",

                            justifyContent: "space-between",

                            alignItems: "center",

                            background: "rgba(0, 255, 136, 0.08)",

                            padding: "14px 20px",

                            borderRadius: "10px",

                            border: "1px solid rgba(0, 255, 136, 0.2)",
                          }}
                      >
                  <span
                      style={{
                        color: "#00ff88",

                        fontWeight: 600,

                        fontSize: "14px",
                      }}
                  >
                    Editando molde: {editingMold.id_molde || editingMold.id}
                  </span>

                        <button
                            type="button"
                            style={styles.btnSecondary}
                            onClick={resetForm}
                        >
                          Cancelar Edición
                        </button>
                      </div>
                  )}

                  {/*controles de secciones*/}

                  <div style={sectionControlStyles.container}>
                    <button
                        type="button"
                        style={sectionControlStyles.button}
                        onClick={expandAllSections}
                    >
                      ▼ Expandir Todo
                    </button>

                    <button
                        type="button"
                        style={sectionControlStyles.button}
                        onClick={collapseAllSections}
                    >
                      ▲ Colapsar Todo
                    </button>
                  </div>

                  {/* Información Básica */}

                  <CollapsibleSection
                      title="Información Básica"
                      icon=""
                      isExpanded={expandedSections.basicInfo}
                      onToggle={() => toggleSection("basicInfo")}
                      isRequired
                  >
                    <div style={styles.formGrid}>
                      <div style={styles.inputGroup}>
                        <label style={styles.label}>
                          ID del Molde <span style={styles.requiredStar}>*</span>
                        </label>

                        <input
                            type="text"
                            style={getInputStyle("id")}
                            value={formData.id}
                            onChange={(e) => handleInputChange("id", e.target.value)}
                            onFocus={() => handleFocus("id")}
                            onBlur={handleBlur}
                            placeholder="Ej: M001"
                        />
                      </div>

                      <div style={styles.inputGroup}>
                        <label style={styles.label}>
                          Nombre <span style={styles.requiredStar}>*</span>
                        </label>

                        <input
                            type="text"
                            style={getInputStyle("name")}
                            value={formData.name}
                            onChange={(e) =>
                                handleInputChange("name", e.target.value)
                            }
                            onFocus={() => handleFocus("name")}
                            onBlur={handleBlur}
                            placeholder="Nombre del molde"
                        />
                      </div>

                      <div style={styles.inputGroup}>
                        <label style={styles.label}>Estado</label>

                        <select
                            style={getSelectStyle("status")}
                            value={formData.status}
                            onChange={(e) =>
                                handleInputChange("status", e.target.value)
                            }
                            onFocus={() => handleFocus("status")}
                            onBlur={handleBlur}
                        >
                          {statusOptions.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                          ))}
                        </select>
                      </div>

                      <div style={styles.inputGroup}>
                        <label style={styles.label}>
                          Año <span style={styles.requiredStar}>*</span>
                        </label>

                        <input
                            type="number"
                            style={getInputStyle("year")}
                            value={formData.year}
                            onChange={(e) =>
                                handleInputChange("year", e.target.value)
                            }
                            onFocus={() => handleFocus("year")}
                            onBlur={handleBlur}
                        />
                      </div>

                      <div style={styles.inputGroup}>
                        <label style={styles.label}>Modelo Producción</label>

                        <input
                            type="text"
                            style={getInputStyle("model")}
                            value={formData.model}
                            onChange={(e) =>
                                handleInputChange("model", e.target.value)
                            }
                            onFocus={() => handleFocus("model")}
                            onBlur={handleBlur}
                            placeholder="Modelo actual"
                        />
                      </div>

                      <div style={styles.inputGroup}>
                        <label style={styles.label}>Tipo de Molde</label>

                        <input
                            type="text"
                            style={getInputStyle("tipo_molde")}
                            value={formData.tipo_molde}
                            onChange={(e) =>
                                handleInputChange("tipo_molde", e.target.value)
                            }
                            onFocus={() => handleFocus("tipo_molde")}
                            onBlur={handleBlur}
                            placeholder="Ingrese tipo de molde"
                        />
                      </div>

                      <div style={styles.inputGroup}>
                        <label style={styles.label}>Máquina Asignada</label>

                        <select
                            style={getSelectStyle("maquina_asignada")}
                            value={formData.maquina_asignada}
                            onChange={(e) =>
                                handleInputChange("maquina_asignada", e.target.value)
                            }
                            onFocus={() => handleFocus("maquina_asignada")}
                            onBlur={handleBlur}
                            disabled={optionsLoading}
                        >
                          {machineOptions.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                          ))}
                        </select>
                      </div>

                      <div style={styles.inputGroup}>
                        <label style={styles.label}>Ubicación</label>

                        <input
                            type="text"
                            style={getInputStyle("ubicacion")}
                            value={formData.ubicacion}
                            onChange={(e) =>
                                handleInputChange("ubicacion", e.target.value)
                            }
                            onFocus={() => handleFocus("ubicacion")}
                            onBlur={handleBlur}
                            placeholder="Rack, almacén, etc."
                        />
                      </div>

                      <div style={styles.inputGroup}>
                        <label style={styles.label}>No. Serie</label>

                        <input
                            type="text"
                            style={getInputStyle("numero_serie")}
                            value={formData.numero_serie}
                            onChange={(e) =>
                                handleInputChange("numero_serie", e.target.value)
                            }
                            onFocus={() => handleFocus("numero_serie")}
                            onBlur={handleBlur}
                        />
                      </div>

                      <div style={styles.inputGroup}>
                        <label style={styles.label}>Proveedor</label>

                        <input
                            type="text"
                            style={getInputStyle("proveedor")}
                            value={formData.proveedor}
                            onChange={(e) =>
                                handleInputChange("proveedor", e.target.value)
                            }
                            onFocus={() => handleFocus("proveedor")}
                            onBlur={handleBlur}
                            placeholder="Fabricante del molde"
                        />
                      </div>
                    </div>
                  </CollapsibleSection>

                  {/* Producción / Ciclos */}

                  <CollapsibleSection
                      title="Producción / Ciclos"
                      icon=""
                      isExpanded={expandedSections.production}
                      onToggle={() => toggleSection("production")}
                  >
                    <div style={styles.formGrid}>
                      <div style={styles.inputGroup}>
                        <label style={styles.label}>Ciclos Inyección</label>

                        <input
                            type="text"
                            style={getInputStyle("ciclos_inyeccion")}
                            value={formData.ciclos_inyeccion}
                            onChange={(e) =>
                                handleInputChange("ciclos_inyeccion", e.target.value)
                            }
                            onFocus={() => handleFocus("ciclos_inyeccion")}
                            onBlur={handleBlur}
                            placeholder="Ciclos del periodo"
                        />
                      </div>

                      <div style={styles.inputGroup}>
                        <label style={styles.label}>Ciclos Acumulados</label>

                        <input
                            type="text"
                            style={getInputStyle("ciclos_acumulados")}
                            value={formData.ciclos_acumulados}
                            onChange={(e) =>
                                handleInputChange("ciclos_acumulados", e.target.value)
                            }
                            onFocus={() => handleFocus("ciclos_acumulados")}
                            onBlur={handleBlur}
                            placeholder="Total acumulado"
                        />
                      </div>

                      <div style={styles.inputGroup}>
                        <label style={styles.label}>Capacidad Ciclos</label>

                        <input
                            type="text"
                            style={getInputStyle("capacidad_ciclos")}
                            value={formData.capacidad_ciclos}
                            onChange={(e) =>
                                handleInputChange("capacidad_ciclos", e.target.value)
                            }
                            onFocus={() => handleFocus("capacidad_ciclos")}
                            onBlur={handleBlur}
                            placeholder="Máximo de ciclos"
                        />
                      </div>

                      <div style={styles.inputGroup}>
                        <label style={styles.label}>Mant. Preventivos</label>

                        <input
                            type="text"
                            style={getInputStyle("mantenimientos_preventivos")}
                            value={formData.mantenimientos_preventivos}
                            onChange={(e) =>
                                handleInputChange(
                                    "mantenimientos_preventivos",

                                    e.target.value,
                                )
                            }
                            onFocus={() => handleFocus("mantenimientos_preventivos")}
                            onBlur={handleBlur}
                            placeholder="0"
                        />
                      </div>
                    </div>
                  </CollapsibleSection>

                  {/* Inyección */}

                  <CollapsibleSection
                      title="Parámetros de Inyección"
                      icon=""
                      isExpanded={expandedSections.injection}
                      onToggle={() => toggleSection("injection")}
                  >
                    <div style={styles.formGrid}>
                      <div style={styles.inputGroup}>
                        <label style={styles.label}>Num. Cavidades</label>

                        <input
                            type="text"
                            style={getInputStyle("num_cavidades")}
                            value={formData.num_cavidades}
                            onChange={(e) =>
                                handleInputChange("num_cavidades", e.target.value)
                            }
                            onFocus={() => handleFocus("num_cavidades")}
                            onBlur={handleBlur}
                        />
                      </div>

                      <div style={styles.inputGroup}>
                        <label style={styles.label}>Material Inyección</label>

                        <input
                            type="text"
                            style={getInputStyle("material_inyeccion")}
                            value={formData.material_inyeccion}
                            onChange={(e) =>
                                handleInputChange("material_inyeccion", e.target.value)
                            }
                            onFocus={() => handleFocus("material_inyeccion")}
                            onBlur={handleBlur}
                            placeholder="PP, ABS, Nylon..."
                        />
                      </div>

                      <div style={styles.inputGroup}>
                        <label style={styles.label}>Peso Pieza (g)</label>

                        <input
                            type="text"
                            style={getInputStyle("peso_pieza_g")}
                            value={formData.peso_pieza_g}
                            onChange={(e) =>
                                handleInputChange("peso_pieza_g", e.target.value)
                            }
                            onFocus={() => handleFocus("peso_pieza_g")}
                            onBlur={handleBlur}
                            placeholder="Gramos"
                        />
                      </div>

                      <div style={styles.inputGroup}>
                        <label style={styles.label}>Peso Colada (g)</label>

                        <input
                            type="text"
                            style={getInputStyle("peso_colada_g")}
                            value={formData.peso_colada_g}
                            onChange={(e) =>
                                handleInputChange("peso_colada_g", e.target.value)
                            }
                            onFocus={() => handleFocus("peso_colada_g")}
                            onBlur={handleBlur}
                            placeholder="Gramos"
                        />
                      </div>

                      <div style={styles.inputGroup}>
                        <label style={styles.label}>Tiempo Ciclo (seg)</label>

                        <input
                            type="text"
                            style={getInputStyle("tiempo_ciclo_seg")}
                            value={formData.tiempo_ciclo_seg}
                            onChange={(e) =>
                                handleInputChange("tiempo_ciclo_seg", e.target.value)
                            }
                            onFocus={() => handleFocus("tiempo_ciclo_seg")}
                            onBlur={handleBlur}
                            placeholder="Segundos"
                        />
                      </div>

                      <div style={styles.inputGroup}>
                        <label style={styles.label}>Temp. Molde (°C)</label>

                        <input
                            type="text"
                            style={getInputStyle("temperatura_molde_c")}
                            value={formData.temperatura_molde_c}
                            onChange={(e) =>
                                handleInputChange("temperatura_molde_c", e.target.value)
                            }
                            onFocus={() => handleFocus("temperatura_molde_c")}
                            onBlur={handleBlur}
                            placeholder="°C"
                        />
                      </div>

                      <div style={styles.inputGroup}>
                        <label style={styles.label}>Presión Iny. (bar)</label>

                        <input
                            type="text"
                            style={getInputStyle("presion_inyeccion_bar")}
                            value={formData.presion_inyeccion_bar}
                            onChange={(e) =>
                                handleInputChange(
                                    "presion_inyeccion_bar",

                                    e.target.value,
                                )
                            }
                            onFocus={() => handleFocus("presion_inyeccion_bar")}
                            onBlur={handleBlur}
                            placeholder="bar"
                        />
                      </div>

                      <div style={styles.inputGroup}>
                        <label style={styles.label}>Tonelaje Requerido</label>

                        <input
                            type="text"
                            style={getInputStyle("tonelaje_requerido")}
                            value={formData.tonelaje_requerido}
                            onChange={(e) =>
                                handleInputChange("tonelaje_requerido", e.target.value)
                            }
                            onFocus={() => handleFocus("tonelaje_requerido")}
                            onBlur={handleBlur}
                            placeholder="Toneladas"
                        />
                      </div>
                    </div>
                  </CollapsibleSection>

                  {/* Sistema de Colada / Enfriamiento / Expulsión */}

                  <CollapsibleSection
                      title="Sistema de Colada / Enfriamiento / Expulsión"
                      icon=""
                      isExpanded={expandedSections.colada}
                      onToggle={() => toggleSection("colada")}
                  >
                    <div style={styles.formGrid}>
                      <div style={styles.inputGroup}>
                        <label style={styles.label}>Tipo de Colada</label>

                        <select
                            style={getSelectStyle("tipo_colada")}
                            value={formData.tipo_colada}
                            onChange={(e) =>
                                handleInputChange("tipo_colada", e.target.value)
                            }
                            onFocus={() => handleFocus("tipo_colada")}
                            onBlur={handleBlur}
                        >
                          {COLADA_OPTIONS.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                          ))}
                        </select>
                      </div>

                      <div style={styles.inputGroup}>
                        <label style={styles.label}>Puntos de Inyección</label>

                        <input
                            type="text"
                            style={getInputStyle("num_puntos_inyeccion")}
                            value={formData.num_puntos_inyeccion}
                            onChange={(e) =>
                                handleInputChange(
                                    "num_puntos_inyeccion",

                                    e.target.value,
                                )
                            }
                            onFocus={() => handleFocus("num_puntos_inyeccion")}
                            onBlur={handleBlur}
                        />
                      </div>

                      <div style={styles.inputGroup}>
                        <label style={styles.label}>Marca Hot Runner</label>

                        <input
                            type="text"
                            style={getInputStyle("marca_colada_caliente")}
                            value={formData.marca_colada_caliente}
                            onChange={(e) =>
                                handleInputChange(
                                    "marca_colada_caliente",

                                    e.target.value,
                                )
                            }
                            onFocus={() => handleFocus("marca_colada_caliente")}
                            onBlur={handleBlur}
                            placeholder="Si aplica"
                        />
                      </div>

                      <div style={styles.inputGroup}>
                        <label style={styles.label}>Tipo Enfriamiento</label>

                        <select
                            style={getSelectStyle("tipo_enfriamiento")}
                            value={formData.tipo_enfriamiento}
                            onChange={(e) =>
                                handleInputChange("tipo_enfriamiento", e.target.value)
                            }
                            onFocus={() => handleFocus("tipo_enfriamiento")}
                            onBlur={handleBlur}
                        >
                          {ENFRIAMIENTO_OPTIONS.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                          ))}
                        </select>
                      </div>

                      <div style={styles.inputGroup}>
                        <label style={styles.label}>
                          Circuitos de Enfriamiento
                        </label>

                        <input
                            type="text"
                            style={getInputStyle("circuitos_enfriamiento")}
                            value={formData.circuitos_enfriamiento}
                            onChange={(e) =>
                                handleInputChange(
                                    "circuitos_enfriamiento",

                                    e.target.value,
                                )
                            }
                            onFocus={() => handleFocus("circuitos_enfriamiento")}
                            onBlur={handleBlur}
                            placeholder="Cantidad"
                        />
                      </div>

                      <div style={styles.inputGroup}>
                        <label style={styles.label}>Tipo Expulsión</label>

                        <select
                            style={getSelectStyle("tipo_expulsion")}
                            value={formData.tipo_expulsion}
                            onChange={(e) =>
                                handleInputChange("tipo_expulsion", e.target.value)
                            }
                            onFocus={() => handleFocus("tipo_expulsion")}
                            onBlur={handleBlur}
                        >
                          {EXPULSION_OPTIONS.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                          ))}
                        </select>
                      </div>

                      <div style={styles.inputGroup}>
                        <label style={styles.label}>Carrera Expulsión (mm)</label>

                        <input
                            type="text"
                            style={getInputStyle("carrera_expulsion_mm")}
                            value={formData.carrera_expulsion_mm}
                            onChange={(e) =>
                                handleInputChange(
                                    "carrera_expulsion_mm",

                                    e.target.value,
                                )
                            }
                            onFocus={() => handleFocus("carrera_expulsion_mm")}
                            onBlur={handleBlur}
                            placeholder="mm"
                        />
                      </div>
                    </div>
                  </CollapsibleSection>

                  {/* Especificaciones Físicas */}

                  <CollapsibleSection
                      title="Especificaciones Físicas"
                      icon=""
                      isExpanded={expandedSections.technical}
                      onToggle={() => toggleSection("technical")}
                  >
                    <div style={styles.formGrid}>
                      <div style={styles.inputGroup}>
                        <label style={styles.label}>Peso (kg)</label>

                        <input
                            type="text"
                            style={getInputStyle("peso_kg")}
                            value={formData.peso_kg}
                            onChange={(e) =>
                                handleInputChange("peso_kg", e.target.value)
                            }
                            onFocus={() => handleFocus("peso_kg")}
                            onBlur={handleBlur}
                        />
                      </div>

                      <div style={styles.inputGroup}>
                        <label style={styles.label}>Dimensiones</label>

                        <input
                            type="text"
                            style={getInputStyle("dimensiones")}
                            value={formData.dimensiones}
                            onChange={(e) =>
                                handleInputChange("dimensiones", e.target.value)
                            }
                            onFocus={() => handleFocus("dimensiones")}
                            onBlur={handleBlur}
                            placeholder="LxAxH mm"
                        />
                      </div>

                      <div style={styles.inputGroup}>
                        <label style={styles.label}>Material Base</label>

                        <input
                            type="text"
                            style={getInputStyle("material_base")}
                            value={formData.material_base}
                            onChange={(e) =>
                                handleInputChange("material_base", e.target.value)
                            }
                            onFocus={() => handleFocus("material_base")}
                            onBlur={handleBlur}
                            placeholder="P20, H13, etc."
                        />
                      </div>

                      <div style={styles.inputGroup}>
                        <label style={styles.label}>Color Pieza</label>

                        <input
                            type="text"
                            style={getInputStyle("color")}
                            value={formData.color}
                            onChange={(e) =>
                                handleInputChange("color", e.target.value)
                            }
                            onFocus={() => handleFocus("color")}
                            onBlur={handleBlur}
                        />
                      </div>
                    </div>
                  </CollapsibleSection>

                  {/* Números de Parte */}

                  <CollapsibleSection
                      title="Números de Parte"
                      icon=""
                      isExpanded={expandedSections.partNumbers}
                      onToggle={() => toggleSection("partNumbers")}
                  >
                    <div style={styles.formGrid}>
                      {[
                        "n_parte_1",

                        "n_parte_2",

                        "n_parte_3",

                        "n_parte_4",

                        "n_parte_5",

                        "n_parte_6",
                      ].map((field, idx) => (
                          <div key={field} style={styles.inputGroup}>
                            <label style={styles.label}>N° Parte {idx + 1}</label>

                            <input
                                type="text"
                                style={getInputStyle(field)}
                                value={formData[field]}
                                onChange={(e) =>
                                    handleInputChange(field, e.target.value)
                                }
                                onFocus={() => handleFocus(field)}
                                onBlur={handleBlur}
                            />
                          </div>
                      ))}
                    </div>
                  </CollapsibleSection>

                  {/* Imagen */}

                  <CollapsibleSection
                      title="Imagen del Molde"
                      icon=""
                      isExpanded={expandedSections.image}
                      onToggle={() => toggleSection("image")}
                  >
                    {imagePreview ? (
                        <div style={styles.imagePreview}>
                          <img
                              src={imagePreview}
                              alt="Preview"
                              style={styles.imagePreviewImg}
                          />

                          <button
                              type="button"
                              style={styles.imageRemoveBtn}
                              onClick={() => {
                                setImagePreview(null);

                                handleInputChange("image_url", "");
                              }}
                          >
                            ✕
                          </button>
                        </div>
                    ) : (
                        <div
                            style={{
                              ...styles.imageUploadArea,

                              position: "relative",

                              overflow: "hidden",
                            }}
                        >
                          <div style={styles.imageUploadText}>
                            Haz clic para subir una imagen
                          </div>

                          <div style={styles.imageUploadHint}>
                            JPG, PNG — máx. 5MB
                          </div>

                          <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageChange}
                              style={{
                                position: "absolute",

                                top: 0,

                                left: 0,

                                width: "100%",

                                height: "100%",

                                opacity: 0,

                                cursor: "pointer",
                              }}
                          />
                        </div>
                    )}

                    {isCompressing && (
                        <p
                            style={{
                              color: "#ffc800",

                              marginTop: "12px",

                              fontSize: "13px",
                            }}
                        >
                          Comprimiendo imagen...
                        </p>
                    )}
                  </CollapsibleSection>

                  {/* Notas */}

                  <CollapsibleSection
                      title="Notas y Comentarios"
                      icon=""
                      isExpanded={expandedSections.notes}
                      onToggle={() => toggleSection("notes")}
                  >
                    <div style={styles.inputGroup}>
                      <label style={styles.label}>Comentarios</label>

                      <textarea
                          style={{
                            ...styles.textarea,

                            width: "100%",

                            boxSizing: "border-box",

                            borderColor:
                                focusedField === "notes"
                                    ? "#00ff88"
                                    : "rgba(255, 255, 255, 0.08)",

                            boxShadow:
                                focusedField === "notes"
                                    ? "0 0 15px rgba(0, 255, 136, 0.2)"
                                    : "none",
                          }}
                          value={formData.notes}
                          onChange={(e) => handleInputChange("notes", e.target.value)}
                          onFocus={() => handleFocus("notes")}
                          onBlur={handleBlur}
                          placeholder="Notas adicionales sobre el molde..."
                      />
                    </div>
                  </CollapsibleSection>

                  {/*botones para subir */}

                  <div style={styles.buttonGroup}>
                    <button
                        type="button"
                        style={styles.btnSecondary}
                        onClick={resetForm}
                    >
                      Limpiar
                    </button>

                    <button
                        type="submit"
                        style={styles.btnPrimary}
                        disabled={isSubmitting}
                    >
                      {isSubmitting && <span style={styles.loadingSpinner} />}

                      {isSubmitting
                          ? "Guardando..."
                          : editingMold
                              ? "Actualizar Molde"
                              : "Registrar Molde"}
                    </button>
                  </div>
                </div>
              </form>
          )}

          {/*pestania de lista */}

          {activeTab === "list" && (
              <div>
                {/*estadisticas */}

                <div style={styles.statsRow}>
                  {[
                    {
                      label: "Total Moldes",

                      value: stats.total,

                      color: "#00ff88",

                      icon: "",
                    },

                    {
                      label: "Activos",

                      value: stats.activos,

                      color: "#64ff64",

                      icon: "",
                    },

                    {
                      label: "Reparando",

                      value: stats.reparando,

                      color: "#ffc800",

                      icon: "",
                    },

                    {
                      label: "Pendientes",

                      value: stats.pendientes,

                      color: "#ff6b6b",

                      icon: "",
                    },
                  ].map((s) => (
                      <div key={s.label} style={styles.statCard}>
                        <div
                            style={{
                              ...styles.statIcon,

                              background: `${s.color}20`,
                            }}
                        >
                          <div style={{ ...styles.statValue, color: s.color }}>
                            {s.value}
                          </div>
                        </div>

                        <div>
                          <div style={styles.statLabel}>{s.label}</div>
                        </div>
                      </div>
                  ))}
                </div>

                {/*contenedor de tabla*/}

                <div style={styles.tableContainer}>
                  <div style={styles.tableHeader}>
                    <div style={styles.tableTitle}>
                      Moldes Registrados ({filteredMolds.length})
                    </div>

                    <div style={styles.tableControls}>
                      <input
                          style={styles.tableSearch}
                          placeholder="Buscar por ID, nombre, modelo..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                      />

                      <select
                          style={styles.tableFilter}
                          value={filterYear}
                          onChange={(e) => setFilterYear(e.target.value)}
                      >
                        <option value="">Todos los años</option>

                        {years.map((y) => (
                            <option key={y} value={y}>
                              {y}
                            </option>
                        ))}
                      </select>

                      <select
                          style={styles.tableFilter}
                          value={filterStatus}
                          onChange={(e) => setFilterStatus(e.target.value)}
                      >
                        <option value="">Todos los estados</option>

                        {statusOptions.map((s) => (
                            <option key={s.value} value={s.value}>
                              {s.label}
                            </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {isLoading ? (
                      <div style={{ textAlign: "center", padding: "40px" }}>
                        <span style={styles.loadingSpinner} />

                        <p style={{ color: "#888", marginTop: "12px" }}>
                          Cargando moldes...
                        </p>
                      </div>
                  ) : filteredMolds.length === 0 ? (
                      <div style={styles.emptyState}>
                        <div style={styles.emptyText}>No se encontraron moldes</div>
                      </div>
                  ) : (
                      <>
                        <div style={{ overflowX: "auto" }}>
                          <table style={styles.table}>
                            <thead>
                            <tr>
                              {[
                                "ID",

                                "Nombre",

                                "Estado",

                                "Año",

                                "Modelo",

                                "Tipo",

                                "Material Iny.",

                                "Cavidades",

                                "Máquina",

                                "Acciones",
                              ].map((h) => (
                                  <th key={h} style={styles.th}>
                                    {h}
                                  </th>
                              ))}
                            </tr>
                            </thead>

                            <tbody>
                            {filteredMolds.map((mold) => (
                                <tr key={mold.id_molde} style={styles.tableRow}>
                                  <td
                                      style={{
                                        ...styles.td,

                                        fontWeight: 600,

                                        color: "#00ff88",
                                      }}
                                  >
                                    {mold.id_molde}
                                  </td>

                                  <td style={styles.td}>{mold.nombre}</td>

                                  <td style={styles.td}>
                              <span
                                  style={{
                                    ...getStatusStyle(mold.estado),

                                    ...styles.statusBadge,
                                  }}
                              >
                                {mold.estado}
                              </span>
                                  </td>

                                  <td style={styles.td}>{mold.año}</td>

                                  <td style={styles.td}>{mold.modelo || "-"}</td>

                                  <td style={styles.td}>
                                    {formatTipoDisplay(mold.tipo_molde)}
                                  </td>

                                  <td style={styles.td}>
                                    {mold.material_inyeccion || "-"}
                                  </td>

                                  <td style={styles.td}>
                                    {mold.num_cavidades || "-"}
                                  </td>

                                  <td style={styles.td}>
                                    {mold.maquina_asignada || "-"}
                                  </td>

                                  <td style={styles.td}>
                                    <button
                                        style={{
                                          ...styles.actionBtn,

                                          color: "#00c8ff",
                                        }}
                                        onClick={() => handleViewMold(mold)}
                                        onMouseEnter={(e) => {
                                          e.target.style.borderColor = "#00c8ff";

                                          e.target.style.color = "#00c8ff";
                                        }}
                                        onMouseLeave={(e) => {
                                          e.target.style.borderColor =
                                              "rgba(255,255,255,0.15)";

                                          e.target.style.color = "#00c8ff";
                                        }}
                                    >
                                      Ver
                                    </button>

                                    <button
                                        style={styles.actionBtn}
                                        onClick={() => handleEdit(mold)}
                                    >
                                      Editar
                                    </button>

                                    <button
                                        style={{
                                          ...styles.actionBtn,

                                          color: "#ff6b6b",

                                          borderColor: "rgba(255,107,107,0.3)",
                                        }}
                                        onClick={() => handleDeleteClick(mold)}
                                    >
                                      Eliminar
                                    </button>
                                  </td>
                                </tr>
                            ))}
                            </tbody>
                          </table>
                        </div>

                        <div style={styles.pagination}>
                    <span style={styles.pageInfo}>
                      Mostrando {filteredMolds.length} de {molds.length} moldes
                    </span>
                        </div>
                      </>
                  )}
                </div>
              </div>
          )}

          {/*pestania de maquinas*/}

          {activeTab === "maquinas" && (
              <div
                  style={{
                    display: "grid",

                    gridTemplateColumns: "1fr 1fr",

                    gap: "24px",
                  }}
              >
                {/*tarjeta del form*/}

                <div style={styles.formContainer}>
                  <div style={{ ...styles.sectionTitle, marginTop: 0 }}>
                    {editingMaquina ? "Editar Máquina" : "Nueva Máquina"}
                  </div>

                  <CollapsibleSection
                      title="Información Básica"
                      icon=""
                      isExpanded={maquinaExpandedSections.basicInfo}
                      onToggle={() =>
                          setMaquinaExpandedSections((p) => ({
                            ...p,

                            basicInfo: !p.basicInfo,
                          }))
                      }
                      isRequired
                  >
                    <div style={styles.formGrid}>
                      <div style={styles.inputGroup}>
                        <label style={styles.label}>
                          Identificador <span style={styles.requiredStar}>*</span>
                        </label>

                        <input
                            style={getInputStyle(
                                "identificador_maquina",

                                !!editingMaquina,
                            )}
                            value={maquinaFormData.identificador_maquina}
                            onChange={(e) =>
                                handleMaquinaInputChange(
                                    "identificador_maquina",

                                    e.target.value,
                                )
                            }
                            onFocus={() => handleFocus("identificador_maquina")}
                            onBlur={handleBlur}
                            placeholder="Ej: INY-01"
                            disabled={!!editingMaquina}
                        />
                      </div>

                      <div style={styles.inputGroup}>
                        <label style={styles.label}>
                          Nombre <span style={styles.requiredStar}>*</span>
                        </label>

                        <input
                            style={getInputStyle("maq_nombre")}
                            value={maquinaFormData.nombre}
                            onChange={(e) =>
                                handleMaquinaInputChange("nombre", e.target.value)
                            }
                            onFocus={() => handleFocus("maq_nombre")}
                            onBlur={handleBlur}
                            placeholder="Nombre de la máquina"
                        />
                      </div>

                      <div style={styles.inputGroup}>
                        <label style={styles.label}>Estado</label>

                        <select
                            style={getSelectStyle("maq_estado")}
                            value={maquinaFormData.estado}
                            onChange={(e) =>
                                handleMaquinaInputChange("estado", e.target.value)
                            }
                            onFocus={() => handleFocus("maq_estado")}
                            onBlur={handleBlur}
                        >
                          {DEFAULT_MACHINE_STATUS_OPTIONS.map((o) => (
                              <option key={o.value} value={o.value}>
                                {o.label}
                              </option>
                          ))}
                        </select>
                      </div>

                      <div style={styles.inputGroup}>
                        <label style={styles.label}>Marca</label>

                        <input
                            style={getInputStyle("maq_marca")}
                            value={maquinaFormData.marca}
                            onChange={(e) =>
                                handleMaquinaInputChange("marca", e.target.value)
                            }
                            onFocus={() => handleFocus("maq_marca")}
                            onBlur={handleBlur}
                            placeholder="Fabricante"
                        />
                      </div>

                      <div style={styles.inputGroup}>
                        <label style={styles.label}>Modelo</label>

                        <input
                            style={getInputStyle("maq_modelo")}
                            value={maquinaFormData.modelo}
                            onChange={(e) =>
                                handleMaquinaInputChange("modelo", e.target.value)
                            }
                            onFocus={() => handleFocus("maq_modelo")}
                            onBlur={handleBlur}
                        />
                      </div>

                      <div style={styles.inputGroup}>
                        <label style={styles.label}>Ubicación</label>

                        <input
                            style={getInputStyle("maq_ubicacion")}
                            value={maquinaFormData.ubicacion}
                            onChange={(e) =>
                                handleMaquinaInputChange("ubicacion", e.target.value)
                            }
                            onFocus={() => handleFocus("maq_ubicacion")}
                            onBlur={handleBlur}
                        />
                      </div>
                    </div>
                  </CollapsibleSection>

                  <CollapsibleSection
                      title="Especificaciones Técnicas"
                      icon=""
                      isExpanded={maquinaExpandedSections.technical}
                      onToggle={() =>
                          setMaquinaExpandedSections((p) => ({
                            ...p,

                            technical: !p.technical,
                          }))
                      }
                  >
                    <div style={styles.formGrid}>
                      <div style={styles.inputGroup}>
                        <label style={styles.label}>Tonelaje Cierre</label>

                        <input
                            style={getInputStyle("maq_tonelaje")}
                            value={maquinaFormData.tonelaje_cierre}
                            onChange={(e) =>
                                handleMaquinaInputChange(
                                    "tonelaje_cierre",

                                    e.target.value,
                                )
                            }
                            onFocus={() => handleFocus("maq_tonelaje")}
                            onBlur={handleBlur}
                            placeholder="Toneladas"
                        />
                      </div>

                      <div style={styles.inputGroup}>
                        <label style={styles.label}>Capacidad Inyección (g)</label>

                        <input
                            style={getInputStyle("maq_capacidad")}
                            value={maquinaFormData.capacidad_inyeccion_g}
                            onChange={(e) =>
                                handleMaquinaInputChange(
                                    "capacidad_inyeccion_g",

                                    e.target.value,
                                )
                            }
                            onFocus={() => handleFocus("maq_capacidad")}
                            onBlur={handleBlur}
                            placeholder="Gramos"
                        />
                      </div>

                      <div style={styles.inputGroup}>
                        <label style={styles.label}>Diámetro Husillo (mm)</label>

                        <input
                            style={getInputStyle("maq_husillo")}
                            value={maquinaFormData.diametro_husillo_mm}
                            onChange={(e) =>
                                handleMaquinaInputChange(
                                    "diametro_husillo_mm",

                                    e.target.value,
                                )
                            }
                            onFocus={() => handleFocus("maq_husillo")}
                            onBlur={handleBlur}
                            placeholder="mm"
                        />
                      </div>
                    </div>
                  </CollapsibleSection>

                  <div style={styles.buttonGroup}>
                    {editingMaquina && (
                        <button
                            style={styles.btnSecondary}
                            onClick={resetMaquinaForm}
                        >
                          Cancelar
                        </button>
                    )}

                    <button style={styles.btnPrimary} onClick={handleMaquinaSubmit}>
                      {editingMaquina ? "Actualizar Máquina" : "Registrar Máquina"}
                    </button>
                  </div>
                </div>

                {/*tarjeta de tabla*/}

                <div style={styles.tableContainer}>
                  <div style={styles.tableHeader}>
                    <div style={styles.tableTitle}>
                      Máquinas Registradas ({maquinas.length})
                    </div>
                  </div>

                  <div style={{ padding: "16px 24px 8px" }}>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <input
                          style={{ ...styles.tableSearch, flex: 1, width: "auto" }}
                          placeholder="Buscar..."
                          value={maquinaSearchTerm}
                          onChange={(e) => setMaquinaSearchTerm(e.target.value)}
                      />

                      <select
                          style={styles.tableFilter}
                          value={maquinaFilterStatus}
                          onChange={(e) => setMaquinaFilterStatus(e.target.value)}
                      >
                        <option value="">Todos</option>

                        {DEFAULT_MACHINE_STATUS_OPTIONS.map((o) => (
                            <option key={o.value} value={o.value}>
                              {o.label}
                            </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {maquinasLoading ? (
                      <div style={{ textAlign: "center", padding: "40px" }}>
                        <p style={{ color: "#888" }}>Cargando...</p>
                      </div>
                  ) : filteredMaquinas.length === 0 ? (
                      <div style={styles.emptyState}>
                        <div style={styles.emptyText}>
                          No hay máquinas registradas
                        </div>
                      </div>
                  ) : (
                      <div style={{ overflowX: "auto" }}>
                        <table style={styles.table}>
                          <thead>
                          <tr>
                            {[
                              "ID",

                              "Nombre",

                              "Marca",

                              "Tonelaje",

                              "Estado",

                              "Acciones",
                            ].map((h) => (
                                <th key={h} style={styles.th}>
                                  {h}
                                </th>
                            ))}
                          </tr>
                          </thead>

                          <tbody>
                          {filteredMaquinas.map((maq) => (
                              <tr key={maq.id_maquina} style={styles.tableRow}>
                                <td
                                    style={{
                                      ...styles.td,

                                      fontWeight: 600,

                                      color: "#00ff88",
                                    }}
                                >
                                  {maq.identificador_maquina}
                                </td>

                                <td style={styles.td}>{maq.nombre}</td>

                                <td style={styles.td}>{maq.marca || "-"}</td>

                                <td style={styles.td}>
                                  {maq.tonelaje_cierre || "-"}
                                </td>

                                <td style={styles.td}>
                            <span
                                style={{
                                  ...getMaquinaStatusStyle(maq.estado),

                                  ...styles.statusBadge,
                                }}
                            >
                              {maq.estado}
                            </span>
                                </td>

                                <td style={styles.td}>
                                  <button
                                      style={styles.actionBtn}
                                      onClick={() => handleEditMaquina(maq)}
                                  >
                                    Editar
                                  </button>

                                  <button
                                      style={{
                                        ...styles.actionBtn,

                                        color: "#ff6b6b",

                                        borderColor: "rgba(255,107,107,0.3)",
                                      }}
                                      onClick={() => handleDeleteMaquinaClick(maq)}
                                  >
                                    Eliminar
                                  </button>
                                </td>
                              </tr>
                          ))}
                          </tbody>
                        </table>
                      </div>
                  )}
                </div>
              </div>
          )}

          {/*pestania de modelos*/}

          {activeTab === "modelos" && (
              <div
                  style={{
                    display: "grid",

                    gridTemplateColumns: "1fr 1fr",

                    gap: "24px",
                  }}
              >
                {/*tarjeta de form*/}

                <div style={styles.formContainer}>
                  <div style={{ ...styles.sectionTitle, marginTop: 0 }}>
                    {editingModelo ? "Editar Modelo" : "Nuevo Modelo"}
                  </div>

                  <div
                      style={{
                        display: "flex",

                        flexDirection: "column",

                        gap: "20px",
                      }}
                  >
                    <div style={styles.inputGroup}>
                      <label style={styles.label}>
                        Nombre del Modelo <span style={styles.requiredStar}>*</span>
                      </label>

                      <input
                          style={getInputStyle("modelo_nombre")}
                          value={modeloFormData.nombre_modelo}
                          onChange={(e) =>
                              handleModeloInputChange("nombre_modelo", e.target.value)
                          }
                          onFocus={() => handleFocus("modelo_nombre")}
                          onBlur={handleBlur}
                          placeholder="Nombre del modelo"
                      />
                    </div>

                    <div style={styles.inputGroup}>
                      <label style={styles.label}>
                        Molde Asignado <span style={styles.requiredStar}>*</span>
                      </label>

                      <select
                          style={getSelectStyle("modelo_molde")}
                          value={modeloFormData.molde_id}
                          onChange={(e) =>
                              handleModeloInputChange("molde_id", e.target.value)
                          }
                          onFocus={() => handleFocus("modelo_molde")}
                          onBlur={handleBlur}
                      >
                        <option value="">Seleccionar molde...</option>

                        {molds.map((m) => (
                            <option key={m.id_molde} value={m.id_molde}>
                              {m.id_molde} - {m.nombre}
                            </option>
                        ))}
                      </select>
                    </div>

                    <div style={styles.inputGroup}>
                      <label style={styles.label}>Descripción</label>

                      <textarea
                          style={{
                            ...styles.textarea,

                            width: "100%",

                            boxSizing: "border-box",

                            borderColor:
                                focusedField === "modelo_desc"
                                    ? "#00ff88"
                                    : "rgba(255, 255, 255, 0.08)",

                            boxShadow:
                                focusedField === "modelo_desc"
                                    ? "0 0 15px rgba(0, 255, 136, 0.2)"
                                    : "none",
                          }}
                          value={modeloFormData.descripcion}
                          onChange={(e) =>
                              handleModeloInputChange("descripcion", e.target.value)
                          }
                          onFocus={() => handleFocus("modelo_desc")}
                          onBlur={handleBlur}
                          placeholder="Descripción opcional"
                      />
                    </div>
                  </div>

                  <div style={styles.buttonGroup}>
                    {editingModelo && (
                        <button
                            style={styles.btnSecondary}
                            onClick={() => {
                              setEditingModelo(null);

                              setModeloFormData({
                                nombre_modelo: "",

                                molde_id: "",

                                descripcion: "",
                              });
                            }}
                        >
                          Cancelar
                        </button>
                    )}

                    <button style={styles.btnPrimary} onClick={handleModeloSubmit}>
                      {editingModelo ? "Actualizar Modelo" : "Crear Modelo"}
                    </button>
                  </div>
                </div>

                {/* tarjeta de tabla*/}

                <div style={styles.tableContainer}>
                  <div style={styles.tableHeader}>
                    <div style={styles.tableTitle}>Modelos ({modelos.length})</div>
                  </div>

                  <div style={{ padding: "16px 24px 8px" }}>
                    <input
                        style={{
                          ...styles.tableSearch,

                          width: "100%",

                          boxSizing: "border-box",
                        }}
                        placeholder="Buscar modelo o molde..."
                        value={modeloSearchTerm}
                        onChange={(e) => setModeloSearchTerm(e.target.value)}
                    />
                  </div>

                  {modelosLoading ? (
                      <div style={{ textAlign: "center", padding: "40px" }}>
                        <p style={{ color: "#888" }}>Cargando...</p>
                      </div>
                  ) : filteredModelos.length === 0 ? (
                      <div style={styles.emptyState}>
                        <div style={styles.emptyText}>No hay modelos registrados</div>
                      </div>
                  ) : (
                      <div style={{ overflowX: "auto" }}>
                        <table style={styles.table}>
                          <thead>
                          <tr>
                            {["Modelo", "Molde", "Descripción", "Acciones"].map(
                                (h) => (
                                    <th key={h} style={styles.th}>
                                      {h}
                                    </th>
                                ),
                            )}
                          </tr>
                          </thead>

                          <tbody>
                          {filteredModelos.map((mod) => (
                              <tr key={mod.id_modelo} style={styles.tableRow}>
                                <td style={{ ...styles.td, fontWeight: 600 }}>
                                  {mod.nombre_modelo}
                                </td>

                                <td style={{ ...styles.td, color: "#00ff88" }}>
                                  {mod.molde_id}
                                </td>

                                <td style={styles.td}>{mod.descripcion || "-"}</td>

                                <td style={styles.td}>
                                  <button
                                      style={styles.actionBtn}
                                      onClick={() => {
                                        setEditingModelo(mod);

                                        setModeloFormData({
                                          nombre_modelo: mod.nombre_modelo,

                                          molde_id: mod.molde_id,

                                          descripcion: mod.descripcion || "",
                                        });
                                      }}
                                  >
                                    Editar
                                  </button>

                                  <button
                                      style={{
                                        ...styles.actionBtn,

                                        color: "#ff6b6b",

                                        borderColor: "rgba(255,107,107,0.3)",
                                      }}
                                      onClick={() => handleDeleteModeloClick(mod)}
                                  >
                                    Eliminar
                                  </button>
                                </td>
                              </tr>
                          ))}
                          </tbody>
                        </table>
                      </div>
                  )}
                </div>
              </div>
          )}
        </main>

        {/* Modal de visualización de molde */}

        {renderMoldViewModal()}

        {/*modal para eliminar el molde */}

        {showDeleteModal && (
            <div
                style={styles.modalOverlay}
                onClick={() => setShowDeleteModal(false)}
            >
              <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
                <h2 style={styles.modalTitle}>Confirmar Eliminación</h2>

                <p style={styles.modalText}>
                  ¿Está seguro de que desea eliminar el molde{" "}
                  <strong style={{ color: "#00ff88" }}>
                    {moldToDelete?.id_molde || moldToDelete?.id}
                  </strong>{" "}
                  ({moldToDelete?.nombre || moldToDelete?.name})?
                  <br />
                  <br />
                  Esta acción no se puede deshacer.
                </p>

                <div style={styles.modalButtons}>
                  <button
                      style={styles.btnSecondary}
                      onClick={() => setShowDeleteModal(false)}
                  >
                    Cancelar
                  </button>

                  <button style={styles.btnDanger} onClick={handleDeleteConfirm}>
                    Eliminar Molde
                  </button>
                </div>
              </div>
            </div>
        )}

        {/*modal para eliminar una maquiuna */}

        {showDeleteMaquinaModal && (
            <div
                style={styles.modalOverlay}
                onClick={() => setShowDeleteMaquinaModal(false)}
            >
              <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
                <h2 style={styles.modalTitle}>Confirmar Eliminación</h2>

                <p style={styles.modalText}>
                  ¿Está seguro de que desea eliminar la máquina{" "}
                  <strong style={{ color: "#00ff88" }}>
                    {maquinaToDelete?.identificador_maquina}
                  </strong>{" "}
                  ({maquinaToDelete?.nombre})?
                  <br />
                  <br />
                  Esta acción puede afectar los moldes asignados a esta máquina.
                </p>

                <div style={styles.modalButtons}>
                  <button
                      style={styles.btnSecondary}
                      onClick={() => setShowDeleteMaquinaModal(false)}
                  >
                    Cancelar
                  </button>

                  <button
                      style={styles.btnDanger}
                      onClick={handleDeleteMaquinaConfirm}
                  >
                    Eliminar Máquina
                  </button>
                </div>
              </div>
            </div>
        )}

        {/*Modal de borrar modelo*/}

        {showDeleteModeloModal && (
            <div
                style={styles.modalOverlay}
                onClick={() => setShowDeleteModeloModal(false)}
            >
              <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
                <h2 style={styles.modalTitle}>Confirmar Eliminación</h2>

                <p style={styles.modalText}>
                  ¿Está seguro de que desea eliminar el modelo{" "}
                  <strong style={{ color: "#00ff88" }}>
                    {modeloToDelete?.nombre_modelo}
                  </strong>{" "}
                  del molde{" "}
                  <strong style={{ color: "#00c8ff" }}>
                    {modeloToDelete?.molde_id}
                  </strong>
                  ?
                  <br />
                  <br />
                  Esta acción no se puede deshacer.
                </p>

                <div style={styles.modalButtons}>
                  <button
                      style={styles.btnSecondary}
                      onClick={() => setShowDeleteModeloModal(false)}
                  >
                    Cancelar
                  </button>

                  <button
                      style={styles.btnDanger}
                      onClick={handleDeleteModeloConfirm}
                  >
                    Eliminar Modelo
                  </button>
                </div>
              </div>
            </div>
        )}

        {/*animacion css*/}

        <style>{cssAnimations}</style>
      </div>
  );
};

export default AdminMoldRegistration;
