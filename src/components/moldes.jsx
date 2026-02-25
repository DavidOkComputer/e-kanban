import React, {useState, useCallback, useMemo, useEffect} from "react";

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

9999999999999999999999;

// Defaults

const DEFAULT_MACHINE_OPTIONS = [{value: "", label: "Sin asignar"}];

const DEFAULT_MOLD_TYPE_OPTIONS = [
    {value: "Null", label: "Sin especificar"},

    {value: "dos_placas", label: "Dos Placas"},

    {value: "tres_placas", label: "Tres Placas"},

    {value: "colada_caliente", label: "Colada Caliente"},

    {value: "stack", label: "Stack (Apilado)"},

    {value: "insertos", label: "Con Insertos"},

    {value: "desatornillado", label: "Desatornillado"},

    {value: "bi_inyeccion", label: "Bi-Inyección"},

    {value: "compresion", label: "Compresión"},
];

const DEFAULT_STATUS_OPTIONS = [
    {value: "Pendiente", label: "Pendiente"},

    {value: "En maquina", label: "En Máquina"},

    {value: "Listo", label: "Listo"},

    {value: "Listo-BackUp", label: "Listo - BackUp"},

    {value: "Reparando", label: "Reparando"},

    {value: "Calentando", label: "Calentando"},

    {value: "Baja", label: "Baja / Obsoleto"},
];

const COLADA_OPTIONS = [
    {value: "Null", label: "Sin especificar"},

    {value: "fria", label: "Fría"},

    {value: "caliente", label: "Caliente (Hot Runner)"},

    {value: "semi-caliente", label: "Semi-Caliente"},

    {value: "valvula", label: "Válvula (Valve Gate)"},
];

const ENFRIAMIENTO_OPTIONS = [
    {value: "Null", label: "Sin especificar"},

    {value: "agua", label: "Agua"},

    {value: "aceite", label: "Aceite"},

    {value: "mixto", label: "Mixto"},
];

const EXPULSION_OPTIONS = [
    {value: "Null", label: "Sin especificar"},

    {value: "pines", label: "Pines"},

    {value: "placa", label: "Placa"},

    {value: "aire", label: "Aire"},

    {value: "hidraulica", label: "Hidráulica"},

    {value: "mixto", label: "Mixto"},
];

const DEFAULT_MACHINE_STATUS_OPTIONS = [
    {value: "activa", label: "Activa"},

    {value: "mantenimiento", label: "En Mantenimiento"},

    {value: "inactiva", label: "Inactiva"},
];

// Image compression utility

const compressImage = (
    file,
    {maxWidth = 1200, maxHeight = 1200, quality = 0.7} = {},
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
            let {width, height} = img;

            if (width > maxWidth || height > maxHeight) {
                const ratio = Math.min(maxWidth / width, maxHeight / height);

                width = Math.round(width * ratio);

                height = Math.round(height * ratio);
            }

            canvas.width = width;

            canvas.height = height;

            ctx.drawImage(img, 0, 0, width, height);

            const mimeType =
                file.type === "image/png" ? "image/png" : "image/jpeg";

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
    ({title, icon, isExpanded, onToggle, children, isRequired}) => {
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

                background: isExpanded
                    ? "rgba(0, 255, 136, 0.08)"
                    : "transparent",

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
                            <span style={sectionStyles.requiredBadge}>
                                REQUERIDO
                            </span>
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

    const [machineOptions, setMachineOptions] = useState(
        DEFAULT_MACHINE_OPTIONS,
    );

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

        tipo_molde: "Null",

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

    const [message, setMessage] = useState({type: "", text: ""});

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

    // Input handler

    const handleInputChange = useCallback((field, value) => {
        setFormData((prev) => ({...prev, [field]: value}));
    }, []);

    const handleMaquinaInputChange = useCallback((field, value) => {
        setMaquinaFormData((prev) => ({...prev, [field]: value}));
    }, []);

    const handleModeloInputChange = useCallback((field, value) => {
        setModeloFormData((prev) => ({...prev, [field]: value}));
    }, []);

    // Fetch dropdown options

    useEffect(() => {
        const fetchOptions = async () => {
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

                if (maquinasRes && Array.isArray(maquinasRes))
                    setMachineOptions(maquinasRes);

                if (tiposRes && Array.isArray(tiposRes)) {
                    setMoldTypeOptions([
                        {value: "Null", label: "Sin especificar"},
                        ...tiposRes,
                    ]);
                }
            } catch (error) {
                console.error("Error loading options:", error);
            } finally {
                setOptionsLoading(false);
            }
        };

        fetchOptions();
    }, []);

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
        }
    }, [activeTab, fetchMolds, fetchStats, fetchMaquinas, fetchModelos]);

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

            setFormData((prev) => ({...prev, image_url: compressed}));

            setImagePreview(compressed);
        } catch {
            setMessage({type: "error", text: "Error al procesar la imagen"});
        } finally {
            setIsCompressing(false);
        }
    }, []);

    // Submit mold form
    //handleMoldSubmit
    const handleSubmit = useCallback(
        async (e) => {
            e?.preventDefault();

            if (
                !formData.id.trim() ||
                !formData.name.trim() ||
                !formData.year
            ) {
                setMessage({
                    type: "error",
                    text: "ID, Nombre y Año son campos requeridos",
                });

                return;
            }

            setIsSubmitting(true);

            setMessage({type: "", text: ""});

            try {
                const apiData = mapMoldFormToApi(formData);

                const isEditing = !!editingMold;

                const url = isEditing
                    ? `${API_BASE}/moldes/${editingMold.id_molde || editingMold.id}`
                    : `${API_BASE}/moldes`;

                const method = isEditing ? "PUT" : "POST";

                const res = await fetch(url, {
                    method,

                    headers: {"Content-Type": "application/json"},

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

                    if (!isEditing) {
                        resetForm();
                    }
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

            tipo_molde: "Null",
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

        setMessage({type: "", text: ""});
    }, []);

    // Edit mold

    const handleEdit = useCallback(
        (mold) => {
            setFormData(mapApiToMoldForm(mold));

            setEditingMold(mold);

            setImagePreview(mold.image_url || null);

            setActiveTab("register");

            expandAllSections();
        },
        [expandAllSections],
    );

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
            setMessage({type: "error", text: "Error de conexión"});
        } finally {
            setShowDeleteModal(false);

            setMoldToDelete(null);
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

            return;
        }

        try {
            const isEditing = !!editingMaquina;

            const url = isEditing
                ? `${API_BASE}/maquinas/crud`
                : `${API_BASE}/maquinas/crud`;

            const method = isEditing ? "PUT" : "POST";

            const body = isEditing
                ? {...maquinaFormData, id_maquina: editingMaquina.id_maquina}
                : maquinaFormData;

            const res = await fetch(url, {
                method,

                headers: {"Content-Type": "application/json"},

                body: JSON.stringify(body),
            });

            const result = await res.json();

            if (res.ok && (result.success || result.id_maquina)) {
                setMessage({
                    type: "success",
                    text: isEditing
                        ? "Máquina actualizada"
                        : "Máquina registrada",
                });

                resetMaquinaForm();

                fetchMaquinas();
            } else {
                setMessage({
                    type: "error",
                    text: result.message || "Error al guardar máquina",
                });
            }
        } catch {
            setMessage({type: "error", text: "Error de conexión"});
        }
    }, [maquinaFormData, editingMaquina, fetchMaquinas]);

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
                {method: "DELETE"},
            );

            const result = await res.json();

            if (res.ok && result.success) {
                setMessage({
                    type: "success",
                    text: "Máquina eliminada exitosamente",
                });

                fetchMaquinas();
            } else {
                setMessage({
                    type: "error",
                    text: result.message || "Error al eliminar",
                });
            }
        } catch {
            setMessage({type: "error", text: "Error de conexión"});
        } finally {
            setShowDeleteMaquinaModal(false);

            setMaquinaToDelete(null);
        }
    }, [maquinaToDelete, fetchMaquinas]);

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

            return;
        }

        try {
            const isEditing = !!editingModelo;

            const url = `${API_BASE}/modelos-molde`;

            const method = isEditing ? "PUT" : "POST";

            const body = isEditing
                ? {...modeloFormData, id_modelo: editingModelo.id_modelo}
                : modeloFormData;

            const res = await fetch(url, {
                method,

                headers: {"Content-Type": "application/json"},

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
            setMessage({type: "error", text: "Error de conexión"});
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
                {method: "DELETE"},
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
            setMessage({type: "error", text: "Error de conexión"});
        } finally {
            setShowDeleteModeloModal(false);

            setModeloToDelete(null);
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

            const matchMolde =
                !modeloFilterMolde || m.molde_id === modeloFilterMolde;

            return matchSearch && matchMolde;
        });
    }, [modelos, modeloSearchTerm, modeloFilterMolde]);

    // Helper: render input field
    const renderField = (
        label,
        field,
        type = "text",
        placeholder = "",
        options = null,
    ) => (
        <div style={styles.formGrid}>
            <label style={styles.label}>{label}</label>
            {options ? (
                <select
                    style={{
                        ...styles.input,
                        ...(focusedField === field ? styles.inputFocus : {}),
                    }}
                    value={formData[field]}
                    onChange={(e) => handleInputChange(field, e.target.value)}
                    onFocus={() => setFocusedField(field)}
                    onBlur={() => setFocusedField(null)}
                >
                    {options.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
            ) : (
                <input
                    type={type}
                    style={{
                        ...styles.input,

                        ...(focusedField === field ? styles.inputFocus : {}),
                    }}
                    value={formData[field]}
                    onChange={(e) => handleInputChange(field, e.target.value)}
                    onFocus={() => setFocusedField(field)}
                    onBlur={() => setFocusedField(null)}
                    placeholder={placeholder}
                />
            )}
        </div>
    );

    // RENDER
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


            {/* Messages */}

            {message.text && (
                <div
                    style={{
                        ...styles.message,

                        ...(message.type === "success"
                            ? styles.messageSuccess
                            : styles.messageError),
                    }}
                >
                    {message.text}
                </div>
            )}

            {/* Main Content */}

            <main style={styles.main}>
                {/* ===== REGISTER/EDIT TAB ===== */}

                {activeTab === "register" && (
                    <form onSubmit={handleSubmit}>
                        {editingMold && (
                            <div
                                style={{
                                    marginBottom: "16px",
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                }}
                            >
                                <span
                                    style={{color: "#00ff88", fontWeight: 600}}
                                >
                                    Editando molde:{" "}
                                    {editingMold.id_molde || editingMold.id}
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

                        {/* Información Básica */}

                        <CollapsibleSection
                            title="Información Básica"
                            icon=""
                            isExpanded={expandedSections.basicInfo}
                            onToggle={() => toggleSection("basicInfo")}
                            isRequired
                        >
                            <div style={styles.formGrid}>
                                {renderField(
                                    "ID del Molde *",
                                    "id",
                                    "text",
                                    "Ej: M001",
                                )}
                                {renderField(
                                    "Nombre *",
                                    "name",
                                    "text",
                                    "Nombre del molde",
                                )}
                                {renderField(
                                    "Estado",
                                    "status",
                                    "text",
                                    "",
                                    statusOptions,
                                )}
                                {renderField("Año *", "year", "number", "")}
                                {renderField(
                                    "Modelo Producción",
                                    "model",
                                    "text",
                                    "Modelo actual",
                                )}
                                {renderField(
                                    "Tipo de Molde",
                                    "tipo_molde",
                                    "text",
                                    "",
                                    moldTypeOptions,
                                )}
                                {renderField(
                                    "Máquina Asignada",
                                    "maquina_asignada",
                                    "text",
                                    "",
                                    machineOptions,
                                )}
                                {renderField(
                                    "Ubicación",
                                    "ubicacion",
                                    "text",
                                    "Rack, almacén, etc.",
                                )}
                                {renderField(
                                    "No. Serie",
                                    "numero_serie",
                                    "text",
                                    "",
                                )}
                                {renderField(
                                    "Proveedor",
                                    "proveedor",
                                    "text",
                                    "Fabricante del molde",
                                )}
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
                                {renderField(
                                    "Ciclos Inyección",
                                    "ciclos_inyeccion",
                                    "text",
                                    "Ciclos del periodo",
                                )}

                                {renderField(
                                    "Ciclos Acumulados",
                                    "ciclos_acumulados",
                                    "text",
                                    "Total acumulado",
                                )}

                                {renderField(
                                    "Capacidad Ciclos",
                                    "capacidad_ciclos",
                                    "text",
                                    "Máx antes de manto.",
                                )}

                                {renderField(
                                    "Mant. Preventivos",
                                    "mantenimientos_preventivos",
                                    "text",
                                    "0",
                                )}
                            </div>
                        </CollapsibleSection>

                        {/* Parámetros de Inyección */}

                        <CollapsibleSection
                            title="Parámetros de Inyección"
                            icon=""
                            isExpanded={expandedSections.injection}
                            onToggle={() => toggleSection("injection")}
                        >
                            <div style={styles.formGrid}>
                                {renderField(
                                    "Número de Cavidades",
                                    "num_cavidades",
                                    "text",
                                    "",
                                )}

                                {renderField(
                                    "Material Inyección",
                                    "material_inyeccion",
                                    "text",
                                    "PP, ABS, Nylon...",
                                )}

                                {renderField(
                                    "Peso Pieza (g)",
                                    "peso_pieza_g",
                                    "text",
                                    "Gramos",
                                )}

                                {renderField(
                                    "Peso Colada (g)",
                                    "peso_colada_g",
                                    "text",
                                    "Gramos",
                                )}

                                {renderField(
                                    "Tiempo Ciclo (seg)",
                                    "tiempo_ciclo_seg",
                                    "text",
                                    "Segundos",
                                )}

                                {renderField(
                                    "Temp. Molde (°C)",
                                    "temperatura_molde_c",
                                    "text",
                                    "°C",
                                )}

                                {renderField(
                                    "Presión Iny. (bar)",
                                    "presion_inyeccion_bar",
                                    "text",
                                    "bar",
                                )}

                                {renderField(
                                    "Tonelaje Requerido",
                                    "tonelaje_requerido",
                                    "text",
                                    "Toneladas",
                                )}
                            </div>
                        </CollapsibleSection>

                        {/* Sistema de Colada */}

                        <CollapsibleSection
                            title="Sistema de Colada / Enfriamento / Expulsión"
                            icon=""
                            isExpanded={expandedSections.colada}
                            onToggle={() => toggleSection("colada")}
                        >
                            <div style={styles.formGrid}>
                                {renderField(
                                    "Tipo de Colada",
                                    "tipo_colada",
                                    "text",
                                    "",
                                    COLADA_OPTIONS,
                                )}
                                {renderField(
                                    "Puntos de Inyección",
                                    "num_puntos_inyeccion",
                                    "text",
                                    "",
                                )}
                                {renderField(
                                    "Marca Hot Runner",
                                    "marca_colada_caliente",
                                    "text",
                                    "Si aplica",
                                )}
                                {renderField(
                                    "Tipo Enfriamiento",
                                    "tipo_enfriamiento",
                                    "text",
                                    "",
                                    ENFRIAMIENTO_OPTIONS,
                                )}
                                {renderField(
                                    "Circuitos de Enfriamiento",
                                    "circuitos_enfriamiento",
                                    "text",
                                    "Cantidad",
                                )}
                                {renderField(
                                    "Tipo Expulsión",
                                    "tipo_expulsion",
                                    "text",
                                    "",
                                    EXPULSION_OPTIONS,
                                )}
                                {renderField(
                                    "Carrera Expulsión (mm)",
                                    "carrera_expulsion_mm",
                                    "text",
                                    "mm",
                                )}
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
                                {renderField(
                                    "Peso (kg)",
                                    "peso_kg",
                                    "text",
                                    "",
                                )}

                                {renderField(
                                    "Dimensiones",
                                    "dimensiones",
                                    "text",
                                    "LxAxH mm",
                                )}

                                {renderField(
                                    "Material Base",
                                    "material_base",
                                    "text",
                                    "P20, H13, etc.",
                                )}

                                {renderField(
                                    "Color Pieza",
                                    "color",
                                    "text",
                                    "",
                                )}
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
                                {renderField(
                                    "N° Parte 1",
                                    "n_parte_1",
                                    "text",
                                    "",
                                )}

                                {renderField(
                                    "N° Parte 2",
                                    "n_parte_2",
                                    "text",
                                    "",
                                )}

                                {renderField(
                                    "N° Parte 3",
                                    "n_parte_3",
                                    "text",
                                    "",
                                )}

                                {renderField(
                                    "N° Parte 4",
                                    "n_parte_4",
                                    "text",
                                    "",
                                )}

                                {renderField(
                                    "N° Parte 5",
                                    "n_parte_5",
                                    "text",
                                    "",
                                )}

                                {renderField(
                                    "N° Parte 6",
                                    "n_parte_6",
                                    "text",
                                    "",
                                )}
                            </div>
                        </CollapsibleSection>

                        {/* Imagen */}

                        <CollapsibleSection
                            title="Imagen del Molde"
                            icon=""
                            isExpanded={expandedSections.image}
                            onToggle={() => toggleSection("image")}
                        >
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                style={{marginBottom: "12px", color: "#ccc"}}
                            />

                            {isCompressing && (
                                <p style={{color: "#ffc800"}}>
                                    Comprimiendo imagen...
                                </p>
                            )}

                            {imagePreview && (
                                <div style={{marginTop: "8px"}}>
                                    <img
                                        src={imagePreview}
                                        alt="Preview"
                                        style={{
                                            maxWidth: "200px",
                                            maxHeight: "200px",
                                            borderRadius: "8px",
                                            border: "1px solid rgba(0,255,136,0.3)",
                                        }}
                                    />

                                    <button
                                        type="button"
                                        style={{
                                            ...styles.btnSecondary,
                                            marginLeft: "12px",
                                        }}
                                        onClick={() => {
                                            setImagePreview(null);
                                            handleInputChange("image_url", "");
                                        }}
                                    >
                                        Quitar Imagen
                                    </button>
                                </div>
                            )}
                        </CollapsibleSection>

                        {/* Notas */}

                        <CollapsibleSection
                            title="Notas y Comentarios"
                            icon=""
                            isExpanded={expandedSections.notes}
                            onToggle={() => toggleSection("notes")}
                        >
                            <textarea
                                style={{
                                    ...styles.input,
                                    minHeight: "100px",
                                    resize: "vertical",
                                }}
                                value={formData.notes}
                                onChange={(e) =>
                                    handleInputChange("notes", e.target.value)
                                }
                                placeholder="Notas adicionales sobre el molde..."
                            />
                        </CollapsibleSection>

                        {/* Submit buttons */}

                        <div
                            style={{
                                display: "flex",
                                gap: "12px",
                                marginTop: "20px",
                            }}
                        >
                            <button
                                type="submit"
                                style={styles.btnPrimary}
                                disabled={isSubmitting}
                            >
                                {isSubmitting
                                    ? "Guardando..."
                                    : editingMold
                                      ? "Actualizar Molde"
                                      : "Registrar Molde"}
                            </button>

                            <button
                                type="button"
                                style={styles.btnSecondary}
                                onClick={resetForm}
                            >
                                Limpiar
                            </button>
                        </div>
                    </form>
                )}

                {/* ===== LIST TAB ===== */}

                {activeTab === "list" && (
                    <div>
                        {/* Stats */}

                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(4, 1fr)",
                                gap: "12px",
                                marginBottom: "20px",
                            }}
                        >
                            {[
                                {
                                    label: "Total",
                                    value: stats.total,
                                    color: "#00ff88",
                                },

                                {
                                    label: "Activos",
                                    value: stats.activos,
                                    color: "#64ff64",
                                },

                                {
                                    label: "Reparando",
                                    value: stats.reparando,
                                    color: "#ffc800",
                                },

                                {
                                    label: "Pendientes",
                                    value: stats.pendientes,
                                    color: "#ff6b6b",
                                },
                            ].map((s) => (
                                <div
                                    key={s.label}
                                    style={{
                                        background: "rgba(0,0,0,0.3)",

                                        borderRadius: "12px",

                                        padding: "16px",

                                        textAlign: "center",

                                        border: `1px solid ${s.color}33`,
                                    }}
                                >
                                    <div
                                        style={{
                                            fontSize: "24px",
                                            fontWeight: 700,
                                            color: s.color,
                                        }}
                                    >
                                        {s.value}
                                    </div>

                                    <div
                                        style={{
                                            fontSize: "12px",
                                            color: "#888",
                                            marginTop: "4px",
                                        }}
                                    >
                                        {s.label}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Filters */}

                        <div
                            style={{
                                display: "flex",
                                gap: "12px",
                                marginBottom: "16px",
                                flexWrap: "wrap",
                            }}
                        >
                            <input
                                style={{
                                    ...styles.input,
                                    flex: 1,
                                    minWidth: "200px",
                                }}
                                placeholder="Buscar por ID, nombre, modelo, material..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />

                            <select
                                style={{...styles.input, width: "140px"}}
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
                                style={{...styles.input, width: "160px"}}
                                value={filterStatus}
                                onChange={(e) =>
                                    setFilterStatus(e.target.value)
                                }
                            >
                                <option value="">Todos los estados</option>

                                {statusOptions.map((s) => (
                                    <option key={s.value} value={s.value}>
                                        {s.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Table */}

                        {isLoading ? (
                            <p style={{color: "#888", textAlign: "center"}}>
                                Cargando moldes...
                            </p>
                        ) : (
                            <>
                                <div style={{overflowX: "auto"}}>
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
                                                    <th
                                                        key={h}
                                                        style={styles.th}
                                                    >
                                                        {h}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {filteredMolds.map((mold) => (
                                                <tr
                                                    key={mold.id_molde}
                                                    style={styles.tr}
                                                >
                                                    <td style={styles.td}>
                                                        {mold.id_molde}
                                                    </td>

                                                    <td style={styles.td}>
                                                        {mold.nombre}
                                                    </td>

                                                    <td style={styles.td}>
                                                        <span
                                                            style={{
                                                                ...getStatusStyle(
                                                                    mold.estado,
                                                                ),

                                                                padding:
                                                                    "4px 10px",

                                                                borderRadius:
                                                                    "12px",

                                                                fontSize:
                                                                    "11px",

                                                                fontWeight: 600,
                                                            }}
                                                        >
                                                            {mold.estado}
                                                        </span>
                                                    </td>

                                                    <td style={styles.td}>
                                                        {mold.año}
                                                    </td>

                                                    <td style={styles.td}>
                                                        {mold.modelo || "-"}
                                                    </td>

                                                    <td style={styles.td}>
                                                        {mold.tipo_molde || "-"}
                                                    </td>

                                                    <td style={styles.td}>
                                                        {mold.material_inyeccion ||
                                                            "-"}
                                                    </td>

                                                    <td style={styles.td}>
                                                        {mold.num_cavidades ||
                                                            "-"}
                                                    </td>

                                                    <td style={styles.td}>
                                                        {mold.maquina_asignada ||
                                                            "-"}
                                                    </td>

                                                    <td style={styles.td}>
                                                        <button
                                                            style={
                                                                styles.actionBtn
                                                            }
                                                            onClick={() =>
                                                                handleEdit(mold)
                                                            }
                                                        >
                                                            Editar
                                                        </button>

                                                        <button
                                                            style={{
                                                                ...styles.actionBtn,
                                                                color: "#ff6b6b",
                                                            }}
                                                            onClick={() =>
                                                                handleDeleteClick(
                                                                    mold,
                                                                )
                                                            }
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
                                        Mostrando {filteredMolds.length} de{" "}
                                        {molds.length} moldes
                                    </span>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* ===== MACHINES TAB ===== */}

                {activeTab === "maquinas" && (
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: "24px",
                        }}
                    >
                        {/* Form */}

                        <div>
                            <h3
                                style={{color: "#00ff88", marginBottom: "16px"}}
                            >
                                {editingMaquina
                                    ? "Editar Máquina"
                                    : "Nueva Máquina"}
                            </h3>

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
                                    <div style={{marginBottom: "12px"}}>
                                        <label style={styles.label}>
                                            Identificador *
                                        </label>

                                        <input
                                            style={styles.input}
                                            value={
                                                maquinaFormData.identificador_maquina
                                            }
                                            onChange={(e) =>
                                                handleMaquinaInputChange(
                                                    "identificador_maquina",
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Ej: INY-01"
                                            disabled={!!editingMaquina}
                                        />
                                    </div>

                                    <div style={{marginBottom: "12px"}}>
                                        <label style={styles.label}>
                                            Nombre *
                                        </label>

                                        <input
                                            style={styles.input}
                                            value={maquinaFormData.nombre}
                                            onChange={(e) =>
                                                handleMaquinaInputChange(
                                                    "nombre",
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Nombre de la máquina"
                                        />
                                    </div>

                                    <div style={{marginBottom: "12px"}}>
                                        <label style={styles.label}>
                                            Estado
                                        </label>

                                        <select
                                            style={styles.input}
                                            value={maquinaFormData.estado}
                                            onChange={(e) =>
                                                handleMaquinaInputChange(
                                                    "estado",
                                                    e.target.value,
                                                )
                                            }
                                        >
                                            {DEFAULT_MACHINE_STATUS_OPTIONS.map(
                                                (o) => (
                                                    <option
                                                        key={o.value}
                                                        value={o.value}
                                                    >
                                                        {o.label}
                                                    </option>
                                                ),
                                            )}
                                        </select>
                                    </div>

                                    <div style={{marginBottom: "12px"}}>
                                        <label style={styles.label}>
                                            Marca
                                        </label>

                                        <input
                                            style={styles.input}
                                            value={maquinaFormData.marca}
                                            onChange={(e) =>
                                                handleMaquinaInputChange(
                                                    "marca",
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Fabricante"
                                        />
                                    </div>

                                    <div style={{marginBottom: "12px"}}>
                                        <label style={styles.label}>
                                            Modelo
                                        </label>

                                        <input
                                            style={styles.input}
                                            value={maquinaFormData.modelo}
                                            onChange={(e) =>
                                                handleMaquinaInputChange(
                                                    "modelo",
                                                    e.target.value,
                                                )
                                            }
                                        />
                                    </div>

                                    <div style={{marginBottom: "12px"}}>
                                        <label style={styles.label}>
                                            Ubicación
                                        </label>

                                        <input
                                            style={styles.input}
                                            value={maquinaFormData.ubicacion}
                                            onChange={(e) =>
                                                handleMaquinaInputChange(
                                                    "ubicacion",
                                                    e.target.value,
                                                )
                                            }
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
                                    <div style={{marginBottom: "12px"}}>
                                        <label style={styles.label}>
                                            Tonelaje Cierre
                                        </label>

                                        <input
                                            style={styles.input}
                                            value={
                                                maquinaFormData.tonelaje_cierre
                                            }
                                            onChange={(e) =>
                                                handleMaquinaInputChange(
                                                    "tonelaje_cierre",
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Toneladas"
                                        />
                                    </div>

                                    <div style={{marginBottom: "12px"}}>
                                        <label style={styles.label}>
                                            Capacidad Inyección (g)
                                        </label>

                                        <input
                                            style={styles.input}
                                            value={
                                                maquinaFormData.capacidad_inyeccion_g
                                            }
                                            onChange={(e) =>
                                                handleMaquinaInputChange(
                                                    "capacidad_inyeccion_g",
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Gramos"
                                        />
                                    </div>

                                    <div style={{marginBottom: "12px"}}>
                                        <label style={styles.label}>
                                            Diámetro Husillo (mm)
                                        </label>

                                        <input
                                            style={styles.input}
                                            value={
                                                maquinaFormData.diametro_husillo_mm
                                            }
                                            onChange={(e) =>
                                                handleMaquinaInputChange(
                                                    "diametro_husillo_mm",
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="mm"
                                        />
                                    </div>
                                </div>
                            </CollapsibleSection>

                            <div
                                style={{
                                    display: "flex",
                                    gap: "12px",
                                    marginTop: "16px",
                                }}
                            >
                                <button
                                    style={styles.btnPrimary}
                                    onClick={handleMaquinaSubmit}
                                >
                                    {editingMaquina
                                        ? "Actualizar"
                                        : "Registrar"}
                                </button>

                                {editingMaquina && (
                                    <button
                                        style={styles.btnSecondary}
                                        onClick={resetMaquinaForm}
                                    >
                                        Cancelar
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Table */}

                        <div>
                            <h3 style={{color: "#ccc", marginBottom: "16px"}}>
                                Máquinas Registradas ({maquinas.length})
                            </h3>

                            <div
                                style={{
                                    display: "flex",
                                    gap: "8px",
                                    marginBottom: "12px",
                                }}
                            >
                                <input
                                    style={{...styles.input, flex: 1}}
                                    placeholder="Buscar..."
                                    value={maquinaSearchTerm}
                                    onChange={(e) =>
                                        setMaquinaSearchTerm(e.target.value)
                                    }
                                />

                                <select
                                    style={{...styles.input, width: "140px"}}
                                    value={maquinaFilterStatus}
                                    onChange={(e) =>
                                        setMaquinaFilterStatus(e.target.value)
                                    }
                                >
                                    <option value="">Todos</option>

                                    {DEFAULT_MACHINE_STATUS_OPTIONS.map((o) => (
                                        <option key={o.value} value={o.value}>
                                            {o.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {maquinasLoading ? (
                                <p style={{color: "#888"}}>Cargando...</p>
                            ) : (
                                <div style={{overflowX: "auto"}}>
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
                                                    <th
                                                        key={h}
                                                        style={styles.th}
                                                    >
                                                        {h}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {filteredMaquinas.map((maq) => (
                                                <tr
                                                    key={maq.id_maquina}
                                                    style={styles.tr}
                                                >
                                                    <td style={styles.td}>
                                                        {
                                                            maq.identificador_maquina
                                                        }
                                                    </td>

                                                    <td style={styles.td}>
                                                        {maq.nombre}
                                                    </td>

                                                    <td style={styles.td}>
                                                        {maq.marca || "-"}
                                                    </td>

                                                    <td style={styles.td}>
                                                        {maq.tonelaje_cierre ||
                                                            "-"}
                                                    </td>

                                                    <td style={styles.td}>
                                                        {maq.estado}
                                                    </td>

                                                    <td style={styles.td}>
                                                        <button
                                                            style={
                                                                styles.actionBtn
                                                            }
                                                            onClick={() =>
                                                                handleEditMaquina(
                                                                    maq,
                                                                )
                                                            }
                                                        >
                                                            Editar
                                                        </button>

                                                        <button
                                                            style={{
                                                                ...styles.actionBtn,
                                                                color: "#ff6b6b",
                                                            }}
                                                            onClick={() =>
                                                                handleDeleteMaquinaClick(
                                                                    maq,
                                                                )
                                                            }
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

                {/* ===== MODELOS TAB ===== */}

                {activeTab === "modelos" && (
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: "24px",
                        }}
                    >
                        <div>
                            <h3
                                style={{color: "#00ff88", marginBottom: "16px"}}
                            >
                                {editingModelo
                                    ? "Editar Modelo"
                                    : "Nuevo Modelo"}
                            </h3>

                            <div style={{marginBottom: "12px"}}>
                                <label style={styles.label}>
                                    Nombre del Modelo *
                                </label>

                                <input
                                    style={styles.input}
                                    value={modeloFormData.nombre_modelo}
                                    onChange={(e) =>
                                        handleModeloInputChange(
                                            "nombre_modelo",
                                            e.target.value,
                                        )
                                    }
                                    placeholder="Nombre del modelo"
                                />
                            </div>

                            <div style={{marginBottom: "12px"}}>
                                <label style={styles.label}>
                                    Molde Asignado *
                                </label>

                                <select
                                    style={styles.input}
                                    value={modeloFormData.molde_id}
                                    onChange={(e) =>
                                        handleModeloInputChange(
                                            "molde_id",
                                            e.target.value,
                                        )
                                    }
                                >
                                    <option value="">
                                        Seleccionar molde...
                                    </option>

                                    {molds.map((m) => (
                                        <option
                                            key={m.id_molde}
                                            value={m.id_molde}
                                        >
                                            {m.id_molde} - {m.nombre}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div style={{marginBottom: "12px"}}>
                                <label style={styles.label}>Descripción</label>

                                <textarea
                                    style={{...styles.input, minHeight: "80px"}}
                                    value={modeloFormData.descripcion}
                                    onChange={(e) =>
                                        handleModeloInputChange(
                                            "descripcion",
                                            e.target.value,
                                        )
                                    }
                                    placeholder="Descripción opcional"
                                />
                            </div>

                            <div style={{display: "flex", gap: "12px"}}>
                                <button
                                    style={styles.btnPrimary}
                                    onClick={handleModeloSubmit}
                                >
                                    {editingModelo
                                        ? "Actualizar"
                                        : "Crear Modelo"}
                                </button>

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
                            </div>
                        </div>

                        <div>
                            <h3 style={{color: "#ccc", marginBottom: "16px"}}>
                                Modelos ({modelos.length})
                            </h3>

                            <div
                                style={{
                                    display: "flex",
                                    gap: "8px",
                                    marginBottom: "12px",
                                }}
                            >
                                <input
                                    style={{...styles.input, flex: 1}}
                                    placeholder="Buscar..."
                                    value={modeloSearchTerm}
                                    onChange={(e) =>
                                        setModeloSearchTerm(e.target.value)
                                    }
                                />
                            </div>

                            {modelosLoading ? (
                                <p style={{color: "#888"}}>Cargando...</p>
                            ) : (
                                <div style={{overflowX: "auto"}}>
                                    <table style={styles.table}>
                                        <thead>
                                            <tr>
                                                {[
                                                    "Modelo",
                                                    "Molde",
                                                    "Descripción",
                                                    "Acciones",
                                                ].map((h) => (
                                                    <th
                                                        key={h}
                                                        style={styles.th}
                                                    >
                                                        {h}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {filteredModelos.map((mod) => (
                                                <tr
                                                    key={mod.id_modelo}
                                                    style={styles.tr}
                                                >
                                                    <td style={styles.td}>
                                                        {mod.nombre_modelo}
                                                    </td>

                                                    <td style={styles.td}>
                                                        {mod.molde_id}
                                                    </td>

                                                    <td style={styles.td}>
                                                        {mod.descripcion || "-"}
                                                    </td>

                                                    <td style={styles.td}>
                                                        <button
                                                            style={
                                                                styles.actionBtn
                                                            }
                                                            onClick={() => {
                                                                setEditingModelo(
                                                                    mod,
                                                                );

                                                                setModeloFormData(
                                                                    {
                                                                        nombre_modelo:
                                                                            mod.nombre_modelo,

                                                                        molde_id:
                                                                            mod.molde_id,

                                                                        descripcion:
                                                                            mod.descripcion ||
                                                                            "",
                                                                    },
                                                                );
                                                            }}
                                                        >
                                                            Editar
                                                        </button>

                                                        <button
                                                            style={{
                                                                ...styles.actionBtn,
                                                                color: "#ff6b6b",
                                                            }}
                                                            onClick={() =>
                                                                handleDeleteModeloClick(
                                                                    mod,
                                                                )
                                                            }
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

            {/* Delete Mold Modal */}

            {showDeleteModal && (
                <div
                    style={styles.modalOverlay}
                    onClick={() => setShowDeleteModal(false)}
                >
                    <div
                        style={styles.modal}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 style={styles.modalTitle}>Confirmar Eliminación</h2>

                        <p style={styles.modalText}>
                            ¿Está seguro de que desea eliminar el molde{" "}
                            <strong style={{color: "#00ff88"}}>
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

                            <button
                                style={styles.btnDanger}
                                onClick={handleDeleteConfirm}
                            >
                                Eliminar Molde
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Machine Modal */}

            {showDeleteMaquinaModal && (
                <div
                    style={styles.modalOverlay}
                    onClick={() => setShowDeleteMaquinaModal(false)}
                >
                    <div
                        style={styles.modal}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 style={styles.modalTitle}>Confirmar Eliminación</h2>

                        <p style={styles.modalText}>
                            ¿Está seguro de que desea eliminar la máquina{" "}
                            <strong style={{color: "#00ff88"}}>
                                {maquinaToDelete?.identificador_maquina}
                            </strong>{" "}
                            ({maquinaToDelete?.nombre})?
                            <br />
                            <br />
                            Esta acción puede afectar los moldes asignados a
                            esta máquina.
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

            {/* Delete Modelo Modal */}

            {showDeleteModeloModal && (
                <div
                    style={styles.modalOverlay}
                    onClick={() => setShowDeleteModeloModal(false)}
                >
                    <div
                        style={styles.modal}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 style={styles.modalTitle}>Confirmar Eliminación</h2>

                        <p style={styles.modalText}>
                            ¿Está seguro de que desea eliminar el modelo{" "}
                            <strong style={{color: "#00ff88"}}>
                                {modeloToDelete?.nombre_modelo}
                            </strong>{" "}
                            del molde{" "}
                            <strong style={{color: "#00c8ff"}}>
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

            {/* CSS Animations */}
            <style>{cssAnimations}</style>
        </div>
    );
};

export default AdminMoldRegistration;
