import React, {     
    useState,     
    useCallback,     
    useMemo,     
    useEffect,     
} from 'react';     

import createStyles, {     
    getStatusStyle,     
    generateYears,     
    cssAnimations     
} from '../styles/adminDieRegistration.styles';     

// Configuración de la API     
const API_BASE = 'http://localhost/ekanban-toolroom/src/api';     

// Mapear datos del formulario al formato de la API     
const mapFormToApi = (formData) => {     
    return {     
        id_troquel: formData.id?.trim().toUpperCase(),     
        nombre: formData.name?.trim(),     
        estado: formData.status,     
        año: parseInt(formData.year),     
        modelo: formData.model?.trim() || null,     
        golpes: formData.golpes || '-',     
        golpes_acum: formData.golpes_acum || '-',     
        capacidad_golpes: formData.capacidad_golpes || '-',     
        rectificaciones: formData.rectificaciones || '0',     
        tipo_troquel: formData.tipo_troquel || 'Null',     
        ubicacion: formData.ubicacion || null,     
        prensa_asignada: formData.prensa_asignada || null,     
        numero_serie: formData.numero_serie || null,     
        proveedor: formData.proveedor || null,     
        peso_kg: formData.peso_kg || null,     
        dimensiones: formData.dimensiones || null,     
        material_base: formData.material_base || null,     
        num_estaciones: formData.num_estaciones || null,     
        cavidades: formData.cavidades || null,    
        color: formData.color || null,    
        ciclos: formData.ciclos || null,    
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
const mapApiToForm = (apiData) => {     
    return {     
        id: apiData.id || apiData.id_troquel || '',     
        name: apiData.name || apiData.nombre || '',     
        status: apiData.status || apiData.estado || 'Pendiente',     
        year: apiData.year || apiData.año || new Date().getFullYear(),     
        model: apiData.model || apiData.modelo || '',     
        golpes: apiData.golpes || '',     
        golpes_acum: apiData.golpes_acum || '',     
        capacidad_golpes: apiData.capacidad_golpes || '',     
        rectificaciones: apiData.rectificaciones || '0',     
        tipo_troquel: apiData.tipo_troquel || 'Null',     
        ubicacion: apiData.ubicacion || '',     

        prensa_asignada: apiData.prensa_asignada || '',     

        numero_serie: apiData.numero_serie || '',     

        proveedor: apiData.proveedor || '',     

        peso_kg: apiData.peso_kg || '',     

        dimensiones: apiData.dimensiones || '',     

        material_base: apiData.material_base || '',     

        num_estaciones: apiData.num_estaciones || '',     

        cavidades: apiData.cavidades || '',    

        color: apiData.color || '',    

        ciclos: apiData.ciclos || '',    

        n_parte_1: apiData.n_parte_1 || '',    

        n_parte_2: apiData.n_parte_2 || '',    

        n_parte_3: apiData.n_parte_3 || '',    

        n_parte_4: apiData.n_parte_4 || '',    

        n_parte_5: apiData.n_parte_5 || '',    

        n_parte_6: apiData.n_parte_6 || '',    

        notes: apiData.notes || apiData.comentarios || '',     

        image_url: apiData.image_url || '',     

    };     

};     

 

// Valores por defecto para las opciones (fallback)     

const DEFAULT_PRESS_OPTIONS = [     

    { value: '', label: 'Sin asignar' },     

    { value: 'P1', label: 'Prensa 1 (P1)' },     

    { value: 'P2', label: 'Prensa 2 (P2)' },     

    { value: 'P3', label: 'Prensa 3 (P3)' },     

    { value: 'P4', label: 'Prensa 4 (P4)' },     

    { value: 'P5', label: 'Prensa 5 (P5)' },     

    { value: 'P6', label: 'Prensa 6 (P6)' },     

    { value: 'P7', label: 'Prensa 7 (P7)' },     

    { value: 'P8', label: 'Prensa 8 (P8)' },     

];     

 

const DEFAULT_DIE_TYPE_OPTIONS = [     

    { value: 'Null', label: 'Sin especificar' },    

    { value: 'progresivo', label: 'Progresivo' },     

    { value: 'transfer', label: 'Transfer' },     

    { value: 'simple', label: 'Simple' },    

    { value: 'compuesto', label: 'Compuesto' },    

    { value: 'multiple', label: 'Múltiple' },    

];     

 

const DEFAULT_STATUS_OPTIONS = [     

    { value: 'Pendiente', label: 'Pendiente' },     

    { value: 'En prensa', label: 'En Prensa' },     

    { value: 'Listo', label: 'Listo' },     

    { value: 'Listo-BackUp', label: 'Listo - BackUp' },     

    { value: 'Reparando', label: 'Reparando' },     

    { value: 'Baja', label: 'Baja / Obsoleto' },     

];     

 

const DEFAULT_PRESS_STATUS_OPTIONS = [  

    { value: 'Activa', label: 'Activa' },  

    { value: 'En mantenimiento', label: 'En Mantenimiento' },  

    { value: 'Inactiva', label: 'Inactiva' },  

    { value: 'Fuera de servicio', label: 'Fuera de Servicio' },  

];  

 

// Componente de sección colapsable - Moved outside and memoized   

const CollapsibleSection = React.memo(({ title, icon, isExpanded, onToggle, children, isRequired }) => {     

    const sectionStyles = {     

        container: {     

            marginBottom: '16px',     

            background: 'rgba(0, 0, 0, 0.2)',     

            borderRadius: '12px',     

            border: '1px solid rgba(0, 255, 136, 0.1)',     

            overflow: 'hidden',     

            transition: 'all 0.3s ease',     

        },     

 

        header: {     

            display: 'flex',     

            alignItems: 'center',     

            justifyContent: 'space-between',     

            padding: '16px 20px',     

            cursor: 'pointer',     

            background: isExpanded ? 'rgba(0, 255, 136, 0.08)' : 'transparent',     

            borderBottom: isExpanded ? '1px solid rgba(0, 255, 136, 0.15)' : '1px solid transparent',     

            transition: 'all 0.3s ease',     

            userSelect: 'none',     

        },     

 

        headerLeft: {     

            display: 'flex',     

            alignItems: 'center',     

            gap: '12px',     

        },     

 

        icon: {     

            width: '32px',     

            height: '32px',     

            background: isExpanded ? 'rgba(0, 255, 136, 0.2)' : 'rgba(0, 255, 136, 0.1)',     

            borderRadius: '8px',     

            display: 'flex',     

            alignItems: 'center',     

            justifyContent: 'center',     

            fontSize: '16px',     

            transition: 'all 0.3s ease',     

        },     

 

        title: {     

            fontSize: '14px',     

            fontWeight: 600,     

            color: isExpanded ? '#00ff88' : '#aaa',     

            textTransform: 'uppercase',     

            letterSpacing: '1px',     

            transition: 'color 0.3s ease',     

        },     

 

        requiredBadge: {     

            background: 'rgba(255, 107, 107, 0.15)',     

            color: '#ff6b6b',     

            fontSize: '9px',     

            padding: '3px 8px',     

            borderRadius: '10px',     

            fontWeight: 600,     

            letterSpacing: '0.5px',     

        },     

 

        chevron: {     

            width: '24px',     

            height: '24px',     

            display: 'flex',     

            alignItems: 'center',     

            justifyContent: 'center',     

            color: isExpanded ? '#00ff88' : '#666',     

            transition: 'transform 0.3s ease, color 0.3s ease',     

            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',     

            fontSize: '18px',     

        },     

 

        content: {     

            maxHeight: isExpanded ? '2000px' : '0',     

            opacity: isExpanded ? 1 : 0,     

            overflow: 'hidden',     

            transition: 'max-height 0.4s ease, opacity 0.3s ease, padding 0.3s ease',     

            padding: isExpanded ? '20px' : '0 20px',     

        },     

    };     

 

    return (     

        <div style={sectionStyles.container}>     

            <div style={sectionStyles.header} onClick={onToggle}>            

                <div style={sectionStyles.headerLeft}>     

                    <div style={sectionStyles.icon}>{icon || ''}</div>     

                    <span style={sectionStyles.title}>{title}</span>     

                    {isRequired && <span style={sectionStyles.requiredBadge}>REQUERIDO</span>}     

                </div>     

                <div style={sectionStyles.chevron}>▼</div>     

            </div>     

            <div style={sectionStyles.content}>     

                {children} 

 

           </div>     

        </div> 

 

    );     

 

});   

 

  

 

CollapsibleSection.displayName = 'CollapsibleSection';   

 

  

 

const AdminDieRegistration = ({onNavigateBack, user }) => {     

 

    const styles = useMemo(() => createStyles(), []);     

 

    const years = useMemo(() => generateYears(), []);     

 

       

 

    // Estado de la pestaña     

 

    const [activeTab, setActiveTab] = useState('register');     

 

       

 

    // Estado para secciones colapsables     

 

    const [expandedSections, setExpandedSections] = useState({     

 

        basicInfo: true,      // Abierta por defecto (requerida)     

 

        production: false,     

 

        technical: false,    

 

        partNumbers: false,    

 

        image: false,     

 

        notes: false,     

 

    });     

 

  

 

    // Estado para opciones de dropdowns (cargadas desde la base de datos)     

 

    const [pressOptions, setPressOptions] = useState(DEFAULT_PRESS_OPTIONS);     

 

    const [dieTypeOptions, setDieTypeOptions] = useState(DEFAULT_DIE_TYPE_OPTIONS);     

 

    const [statusOptions, setStatusOptions] = useState(DEFAULT_STATUS_OPTIONS);     

 

    const [optionsLoading, setOptionsLoading] = useState(true);     

 

  

 

    // Estado del formulario - Updated to match database schema    

 

    const [formData, setFormData] = useState({     

 

        id: '',     

 

        name: '',     

 

        status: 'Pendiente',     

 

        year: new Date().getFullYear(),     

 

        model: '',     

 

        golpes: '',     

 

        golpes_acum: '',     

 

        capacidad_golpes: '',     

 

        rectificaciones: '0',     

 

        image_url: '',     

 

        notes: '',     

 

        prensa_asignada: '',     

 

        tipo_troquel: 'Null',     

 

        ubicacion: '',     

 

        proveedor: '',     

 

        peso_kg: '',     

 

        dimensiones: '',     

 

        material_base: '',     

 

        num_estaciones: '',     

 

        numero_serie: '',    

 

        cavidades: '',    

 

        color: '',    

 

        ciclos: '',    

 

        n_parte_1: '',    

 

        n_parte_2: '',    

 

        n_parte_3: '',    

 

        n_parte_4: '',    

 

        n_parte_5: '',    

 

        n_parte_6: '',    

 

    });     

 

  

 

    const [focusedField, setFocusedField] = useState(null);     

 

    const [isSubmitting, setIsSubmitting] = useState(false);     

 

    const [message, setMessage] = useState({ type: '', text: '' });     

 

    const [imagePreview, setImagePreview] = useState(null);     

 

  

 

    // Estado de lista     

 

    const [dies, setDies] = useState([]);     

 

    const [isLoading, setIsLoading] = useState(false);     

 

    const [searchTerm, setSearchTerm] = useState('');     

 

    const [filterYear, setFilterYear] = useState('');     

 

    const [filterStatus, setFilterStatus] = useState('');     

 

  

 

    // Estado del modal     

 

    const [showDeleteModal, setShowDeleteModal] = useState(false);     

 

    const [dieToDelete, setDieToDelete] = useState(null);     

 

    const [editingDie, setEditingDie] = useState(null);     

 

  

 

    // Estadísticas     

 

    const [stats, setStats] = useState({     

 

        total: 0,     

 

        activos: 0,     

 

        reparando: 0,     

 

        pendientes: 0,     

 

    });     

 

  

 

    // ==================== ESTADOS PARA PRENSAS ====================  

 

    const [prensas, setPrensas] = useState([]);  

 

    const [prensasLoading, setPrensasLoading] = useState(false);  

 

    const [prensaSearchTerm, setPrensaSearchTerm] = useState('');  

 

    const [prensaFilterStatus, setPrensaFilterStatus] = useState('');  

 

    const [editingPrensa, setEditingPrensa] = useState(null);  

 

    const [showDeletePrensaModal, setShowDeletePrensaModal] = useState(false);  

 

    const [prensaToDelete, setPrensaToDelete] = useState(null);  

 

      

 

    // Formulario de prensa  

 

    const [prensaFormData, setPrensaFormData] = useState({  

 

        identificador_prensa: '',  

 

        nombre: '',  

 

        estado: 'Activa',  

 

        tonelaje: '',  

 

        marca: '',  

 

        modelo: '',  

 

        año_fabricacion: new Date().getFullYear(),  

 

        numero_serie: '',  

 

        ubicacion: '',  

 

        velocidad_max: '',  

 

        carrera: '',  

 

        area_trabajo: '',  

 

        fecha_ultimo_mantenimiento: '',  

 

        notas: '',  

 

    });  

 

  

 

    const [prensaExpandedSections, setPrensaExpandedSections] = useState({  

 

        basicInfo: true,  

 

        technical: false,  

 

        maintenance: false,  

 

        notes: false,  

 

    });  

 

     

    // ==================== ESTADOS PARA MODELOS ==================== 

    const [modelos, setModelos] = useState([]); 

    const [modelosLoading, setModelosLoading] = useState(false); 

    const [modeloSearchTerm, setModeloSearchTerm] = useState(''); 

    const [modeloFilterTroquel, setModeloFilterTroquel] = useState(''); 

    const [editingModelo, setEditingModelo] = useState(null); 

    const [showDeleteModeloModal, setShowDeleteModeloModal] = useState(false); 

    const [modeloToDelete, setModeloToDelete] = useState(null); 

     

    // Formulario de modelo 

    const [modeloFormData, setModeloFormData] = useState({ 

        nombre_modelo: '', 

        troquel_id: '', 

        descripcion: '', 

    }); 

 

    // Toggle para secciones colapsables - memoized callbacks   

 

    const toggleSection = useCallback((sectionKey) => {   

 

        setExpandedSections(prev => ({ ...prev, [sectionKey]: !prev[sectionKey] }));    

 

    }, []);     

 

       

 

    // Expandir todas las secciones     

 

    const expandAllSections = useCallback(() => {     

 

        setExpandedSections({     

 

            basicInfo: true,     

 

            production: true,     

 

            technical: true,    

 

            partNumbers: true,    

 

            image: true,     

 

            notes: true,     

 

        });     

 

    }, []);     

 

  

 

    // Colapsar todas las secciones excepto la básica     

 

    const collapseAllSections = useCallback(() => {     

 

        setExpandedSections({     

 

            basicInfo: true,     

 

            production: false,     

 

            technical: false,    

 

            partNumbers: false,    

 

            image: false,     

 

            notes: false,     

 

        });     

 

    }, []);     

 

  

 

    // Toggle para secciones de prensa  

 

    const togglePrensaSection = useCallback((sectionKey) => {  

 

        setPrensaExpandedSections(prev => ({ ...prev, [sectionKey]: !prev[sectionKey] }));  

 

    }, []);  

 

  

 

    const expandAllPrensaSections = useCallback(() => {  

 

        setPrensaExpandedSections({  

 

            basicInfo: true,  

 

            technical: true,  

 

            maintenance: true,  

 

            notes: true,  

 

        });  

 

    }, []);  

 

  

 

    const collapseAllPrensaSections = useCallback(() => {  

 

        setPrensaExpandedSections({  

 

            basicInfo: true,  

 

            technical: false,  

 

            maintenance: false,  

 

            notes: false,  

 

        });  

 

    }, []);  

 

  

 

    // Cargar opciones de dropdowns desde la base de datos     

 

    useEffect(() => {     

 

        const fetchDropdownOptions = async () => {     

 

            setOptionsLoading(true);     

 

            try {     

 

  

 

                // Fetch prensas     

 

                const prensasResponse = await fetch(`${API_BASE}/prensas.php`, {     

 

                    credentials: 'include',     

 

                });     

 

                if (prensasResponse.ok) {     

 

                    const prensasData = await prensasResponse.json();     

 

                    if (Array.isArray(prensasData) && prensasData.length > 0) {    

 

                        setPressOptions(prensasData);    

 

                    }     

 

                }	     

 

  

 

                // Fetch tipos de troquel     

 

                const tiposResponse = await fetch(`${API_BASE}/tipos_troquel.php`, {credentials: 'include',});     

 

                if (tiposResponse.ok) {     

 

                    const tiposData = await tiposResponse.json();     

 

                    if (Array.isArray(tiposData) && tiposData.length > 0) {     

 

                        setDieTypeOptions(tiposData);     

 

                    }     

 

                }     

 

  

 

                // Fetch estados     

 

                const estadosResponse = await fetch(`${API_BASE}/estados.php`, {credentials: 'include',});     

 

                if (estadosResponse.ok) {     

 

                    const estadosData = await estadosResponse.json();     

 

                    if (Array.isArray(estadosData) && estadosData.length > 0) {     

 

                        setStatusOptions(estadosData);     

 

                    }     

 

                }     

 

            } catch (error) {     

 

                console.error('Error fetching dropdown options:', error);     

 

            } finally {     

 

                setOptionsLoading(false);     

 

            }     

 

        };     

 

        fetchDropdownOptions();     

 

    }, []);     

 

  

 

    // Obtener troqueles cuando se cambia a pestaña de administración     

 

    useEffect(() => {     

 

        if (activeTab === 'manage') {     

 

            fetchDies();     

 

        }     

 

    }, [activeTab, filterYear, filterStatus]);     

 

  

 

    // Obtener prensas cuando se cambia a pestaña de prensas  

 

    useEffect(() => {  

 

        if (activeTab === 'prensas' || activeTab === 'prensas-manage') {  

 

            fetchPrensas();  

 

        }  

 

    }, [activeTab, prensaFilterStatus]);  

 

     

    // Obtener modelos cuando se cambia a pestaña de modelos 

    useEffect(() => { 

        if (activeTab === 'modelos') { 

            fetchModelos(); 

            fetchDiesForModelos(); 

        } 

    }, [activeTab, modeloFilterTroquel]); 

 

    const fetchDies = async () => {     

 

        setIsLoading(true);     

 

            try {     

 

                let url = `${API_BASE}/troqueles.php`;     

 

                const params = new URLSearchParams();     

 

                if (filterYear) params.append('year', filterYear);     

 

                if (filterStatus) params.append('status', filterStatus);     

 

                       

 

                //usar el endpoint de busqueda si se aplican los filtros, sino usar el endpoint principal    

 

                if (params.toString()) {     

 

                    url = `${API_BASE}/troqueles.php/search?${params.toString()}`;     

 

                }     

 

  

 

                const response = await fetch(url, {credentials: 'include',});     

 

                   

 

                //manejar respuestas tanto en objeto como array    

 

                const handleResponse = (data) => {     

 

                    if (Array.isArray(data)) { return data;}     

 

                           

 

                    //si estan agrupadas por año hacerlo array o aplanar    

 

                    if (typeof data === 'object' && data !== null) {     

 

                        const flattened = [];     

 

                        Object.values(data).forEach(yearGroup => {     

 

                            if (Array.isArray(yearGroup)) {     

 

                                flattened.push(...yearGroup);     

 

                            }     

 

                        });     

 

                        return flattened;     

 

                    }     

 

                    return [];     

 

                };     

 

                   

 

                const data = await response.json();     

 

                const processedData = handleResponse(data);     

 

                setDies(processedData);     

 

                   

 

                // Calcular estadísticas     

 

                const total = processedData.length;     

 

                const activos = processedData.filter(d => {     

 

                    const status = d.status || d.estado;     

 

                    return status === 'En prensa' || status === 'Listo' || status === 'Listo-BackUp';     

 

                }).length;     

 

                const reparando = processedData.filter(d => (d.status || d.estado) === 'Reparando').length;     

 

                const pendientes = processedData.filter(d => (d.status || d.estado) === 'Pendiente').length;     

 

                   

 

                setStats({ total, activos, reparando, pendientes });     

 

            } catch (error) {     

 

                console.error('Error fetching dies:', error);     

 

                setMessage({ type: 'error', text: 'Error al cargar los troqueles' });     

 

            } finally {     

 

                setIsLoading(false);     

 

            }     

 

    };     

 

  

 

    // ==================== FUNCIONES PARA PRENSAS ====================  

 

    const fetchPrensas = async () => {  

 

        setPrensasLoading(true);  

 

        try {  

 

            let url = `${API_BASE}/prensas_crud.php`;  

 

            const params = new URLSearchParams();  

 

            if (prensaFilterStatus) params.append('estado', prensaFilterStatus);  

 

              

 

            if (params.toString()) {  

 

                url = `${url}?${params.toString()}`;  

 

            }  

 

  

 

            const response = await fetch(url, { credentials: 'include' });  

 

            const data = await response.json();  

 

              

 

            if (Array.isArray(data)) {  

 

                setPrensas(data);  

 

            } else if (data.data && Array.isArray(data.data)) {  

 

                setPrensas(data.data);  

 

            } else {  

 

                setPrensas([]);  

 

            }  

 

        } catch (error) {  

 

            console.error('Error fetching prensas:', error);  

 

            setMessage({ type: 'error', text: 'Error al cargar las prensas' });  

 

        } finally {  

 

            setPrensasLoading(false);  

 

        }  

 

    };  

 

  

 

    const handlePrensaInputChange = useCallback((e) => {  

 

        const { name, value } = e.target;  

 

        setPrensaFormData(prev => ({ ...prev, [name]: value }));  

 

    }, []);  

 

  

 

    const handlePrensaSubmit = async (e) => {  

 

        e.preventDefault();  

 

          

 

        // Validaciones  

 

        if (!prensaFormData.identificador_prensa?.trim()) {  

 

            setMessage({ type: 'error', text: 'El identificador de la prensa es requerido' });  

 

            return;  

 

        }  

 

        if (!prensaFormData.nombre?.trim()) {  

 

            setMessage({ type: 'error', text: 'El nombre de la prensa es requerido' });  

 

            return;  

 

        }  

 

  

 

        setIsSubmitting(true);  

 

        setMessage({ type: '', text: '' });  

 

  

 

        try {  

 

            const url = `${API_BASE}/prensas_crud.php`;  

 

            const method = editingPrensa ? 'PUT' : 'POST';  

 

              

 

            const payload = {  

 

                ...prensaFormData, 

 

                id_prensa: editingPrensa?.id_prensa, 

 

            };  

 

  

 

            const response = await fetch(url, {  

 

                method,  

 

                headers: { 'Content-Type': 'application/json' },  

 

                credentials: 'include',  

 

                body: JSON.stringify(payload),  

 

            });  

 

  

 

            const result = await response.json();  

 

  

 

            if (response.ok && result.success) {  

 

                setMessage({  

 

                    type: 'success',  

 

                    text: editingPrensa  

 

                        ? `Prensa ${prensaFormData.identificador_prensa} actualizada exitosamente`  

 

                        : `Prensa ${prensaFormData.identificador_prensa} registrada exitosamente`  

 

                });  

 

                handlePrensaReset();  

 

                fetchPrensas();  

 

                if (editingPrensa) {  

 

                    setEditingPrensa(null);  

 

                }  

 

            } else {  

 

                throw new Error(result.message || 'Error al guardar la prensa');  

 

            }  

 

        } catch (error) {  

 

            console.error('Error saving prensa:', error);  

 

            setMessage({ type: 'error', text: error.message || 'Error al guardar la prensa' });  

 

        } finally {  

 

            setIsSubmitting(false);  

 

            setTimeout(() => setMessage({ type: '', text: '' }), 5000);  

 

        }  

 

    };  

 

  

 

    const handlePrensaReset = useCallback(() => {  

 

        setPrensaFormData({  

 

            identificador_prensa: '',  

 

            nombre: '',  

 

            estado: 'Activa',  

 

            tonelaje: '',  

 

            marca: '',  

 

            modelo: '',  

 

            año_fabricacion: new Date().getFullYear(),  

 

            numero_serie: '',  

 

            ubicacion: '',  

 

            velocidad_max: '',  

 

            carrera: '',  

 

            area_trabajo: '',  

 

            fecha_ultimo_mantenimiento: '',  

 

            notas: '',  

 

        });  

 

        setEditingPrensa(null);  

 

    }, []);  

 

  

 

    const handleEditPrensa = (prensa) => {  

 

        setEditingPrensa(prensa);  

 

        setPrensaFormData({  

 

            identificador_prensa: prensa.identificador_prensa || '',  

 

            nombre: prensa.nombre || '',  

 

            estado: prensa.estado || 'Activa',  

 

            tonelaje: prensa.tonelaje || '',  

 

            marca: prensa.marca || '',  

 

            modelo: prensa.modelo || '',  

 

            año_fabricacion: prensa.año_fabricacion || new Date().getFullYear(),  

 

            numero_serie: prensa.numero_serie || '',  

 

            ubicacion: prensa.ubicacion || '',  

 

            velocidad_max: prensa.velocidad_max || '',  

 

            carrera: prensa.carrera || '',  

 

            area_trabajo: prensa.area_trabajo || '',  

 

            fecha_ultimo_mantenimiento: prensa.fecha_ultimo_mantenimiento || '',  

 

            notas: prensa.notas || '',  

 

        });  

 

        setActiveTab('prensas');  

 

        setPrensaExpandedSections({  

 

            basicInfo: true,  

 

            technical: true,  

 

            maintenance: true,  

 

            notes: true,  

 

        });  

 

    };  

 

  

 

    const handleDeletePrensaClick = (prensa) => {  

 

        setPrensaToDelete(prensa);  

 

        setShowDeletePrensaModal(true);  

 

    };  

 

  

 

    const handleDeletePrensaConfirm = async () => {  

 

        if (!prensaToDelete) return;  

 

  

 

        try {  

 

            const response = await fetch(`${API_BASE}/prensas_crud.php?id=${prensaToDelete.id_prensa}`, {  

 

                method: 'DELETE',  

 

                credentials: 'include',  

 

            });  

 

  

 

            const result = await response.json();  

 

  

 

            if (response.ok && result.success) {  

 

                setMessage({ type: 'success', text: `Prensa ${prensaToDelete.identificador_prensa} eliminada exitosamente` });  

 

                fetchPrensas();  

 

            } else {  

 

                throw new Error(result.message || 'Error al eliminar la prensa');  

 

            }  

 

        } catch (error) {  

 

            console.error('Error deleting prensa:', error);  

 

            setMessage({ type: 'error', text: error.message || 'Error al eliminar la prensa' });  

 

        } finally {  

 

            setShowDeletePrensaModal(false);  

 

            setPrensaToDelete(null);  

 

            setTimeout(() => setMessage({ type: '', text: '' }), 5000);  

 

        }  

 

    };  

 

  

 

    // Filtrar prensas  

 

    const filteredPrensas = useMemo(() => {  

 

        return prensas.filter(prensa => {  

 

            const prensaId = (prensa.identificador_prensa || '').toLowerCase();  

 

            const prensaNombre = (prensa.nombre || '').toLowerCase();  

 

            const term = prensaSearchTerm.toLowerCase();  

 

            return prensaId.includes(term) || prensaNombre.includes(term);  

 

        });  

 

    }, [prensas, prensaSearchTerm]);  

 

     

    // ==================== FUNCIONES PARA MODELOS ==================== 

    const [diesForModelos, setDiesForModelos] = useState([]); 

     

    const fetchDiesForModelos = async () => { 

        try { 

            const response = await fetch(`${API_BASE}/troqueles.php`, { credentials: 'include' }); 

            const data = await response.json(); 

             

            const handleResponse = (data) => { 

                if (Array.isArray(data)) return data; 

                if (typeof data === 'object' && data !== null) { 

                    const flattened = []; 

                    Object.values(data).forEach(yearGroup => { 

                        if (Array.isArray(yearGroup)) { 

                            flattened.push(...yearGroup); 

                        } 

                    }); 

                    return flattened; 

                } 

                return []; 

            }; 

             

            setDiesForModelos(handleResponse(data)); 

        } catch (error) { 

            console.error('Error fetching dies for modelos:', error); 

        } 

    }; 

     

    const fetchModelos = async () => { 

        setModelosLoading(true); 

        try { 

            let url = `${API_BASE}/modelos_troquel.php`; 

            const params = new URLSearchParams(); 

            if (modeloFilterTroquel) params.append('troquel_id', modeloFilterTroquel); 

             

            if (params.toString()) { 

                url = `${url}?${params.toString()}`; 

            } 

             

            const response = await fetch(url, { credentials: 'include' }); 

            const data = await response.json(); 

             

            if (Array.isArray(data)) { 

                setModelos(data); 

            } else if (data.data && Array.isArray(data.data)) { 

                setModelos(data.data); 

            } else { 

                setModelos([]); 

            } 

        } catch (error) { 

            console.error('Error fetching modelos:', error); 

            setMessage({ type: 'error', text: 'Error al cargar los modelos' }); 

        } finally { 

            setModelosLoading(false); 

        } 

    }; 

     

    const handleModeloInputChange = useCallback((e) => { 

        const { name, value } = e.target; 

        setModeloFormData(prev => ({ ...prev, [name]: value })); 

    }, []); 

     

    const handleModeloSubmit = async (e) => { 

        e.preventDefault(); 

         

        // Validaciones 

        if (!modeloFormData.nombre_modelo?.trim()) { 

            setMessage({ type: 'error', text: 'El nombre del modelo es requerido' }); 

            return; 

        } 

        if (!modeloFormData.troquel_id) { 

            setMessage({ type: 'error', text: 'Debe seleccionar un troquel' }); 

            return; 

        } 

         

        setIsSubmitting(true); 

        setMessage({ type: '', text: '' }); 

         

        try { 

            const url = `${API_BASE}/modelos_troquel.php`; 

            const method = editingModelo ? 'PUT' : 'POST'; 

             

            const payload = { 

                ...modeloFormData, 

                id_modelo: editingModelo?.id_modelo, 

            }; 

             

            const response = await fetch(url, { 

                method, 

                headers: { 'Content-Type': 'application/json' }, 

                credentials: 'include', 

                body: JSON.stringify(payload), 

            }); 

             

            const result = await response.json(); 

             

            if (response.ok && result.success) { 

                setMessage({ 

                    type: 'success', 

                    text: editingModelo 

                        ? `Modelo "${modeloFormData.nombre_modelo}" actualizado exitosamente` 

                        : `Modelo "${modeloFormData.nombre_modelo}" registrado exitosamente` 

                }); 

                handleModeloReset(); 

                fetchModelos(); 

            } else { 

                throw new Error(result.message || 'Error al guardar el modelo'); 

            } 

        } catch (error) { 

            console.error('Error saving modelo:', error); 

            setMessage({ type: 'error', text: error.message || 'Error al guardar el modelo' }); 

        } finally { 

            setIsSubmitting(false); 

            setTimeout(() => setMessage({ type: '', text: '' }), 5000); 

        } 

    }; 

     

    const handleModeloReset = useCallback(() => { 

        setModeloFormData({ 

            nombre_modelo: '', 

            troquel_id: '', 

            descripcion: '', 

        }); 

        setEditingModelo(null); 

    }, []); 

     

    const handleEditModelo = (modelo) => { 

        setEditingModelo(modelo); 

        setModeloFormData({ 

            nombre_modelo: modelo.nombre_modelo || '', 

            troquel_id: modelo.troquel_id || '', 

            descripcion: modelo.descripcion || '', 

        }); 

    }; 

     

    const handleDeleteModeloClick = (modelo) => { 

        setModeloToDelete(modelo); 

        setShowDeleteModeloModal(true); 

    }; 

     

    const handleDeleteModeloConfirm = async () => { 

        if (!modeloToDelete) return; 

         

        try { 

            const response = await fetch(`${API_BASE}/modelos_troquel.php?id=${modeloToDelete.id_modelo}`, { 

                method: 'DELETE', 

                credentials: 'include', 

            }); 

             

            const result = await response.json(); 

             

            if (response.ok && result.success) { 

                setMessage({ type: 'success', text: `Modelo "${modeloToDelete.nombre_modelo}" eliminado exitosamente` }); 

                fetchModelos(); 

            } else { 

                throw new Error(result.message || 'Error al eliminar el modelo'); 

            } 

        } catch (error) { 

            console.error('Error deleting modelo:', error); 

            setMessage({ type: 'error', text: error.message || 'Error al eliminar el modelo' }); 

        } finally { 

            setShowDeleteModeloModal(false); 

            setModeloToDelete(null); 

            setTimeout(() => setMessage({ type: '', text: '' }), 5000); 

        } 

    }; 

     

    // Filtrar modelos 

    const filteredModelos = useMemo(() => { 

        return modelos.filter(modelo => { 

            const modeloNombre = (modelo.nombre_modelo || '').toLowerCase(); 

            const troquelId = (modelo.troquel_id || '').toLowerCase(); 

            const term = modeloSearchTerm.toLowerCase(); 

            return modeloNombre.includes(term) || troquelId.includes(term); 

        }); 

    }, [modelos, modeloSearchTerm]); 

 

    // Manejar entrada del formulario     

 

    const handleInputChange = useCallback((e) => {     

 

        const { name, value } = e.target;     

 

        setFormData(prev => ({ ...prev, [name]: value }));     

 

    }, []);     

 

  

 

    const handleFocus = useCallback((field) => {     

 

        setFocusedField(field);     

 

    }, []);     

 

  

 

    const handleBlur = useCallback(() => {     

 

        setFocusedField(null);     

 

    }, []);     

 

  

 

    // Manejar cambio de imagen     

 

    const handleImageChange = useCallback((e) => {     

 

        const file = e.target.files?.[0];     

 

        if (file) {     

 

            if (file.size > 5 * 1024 * 1024) {     

 

                setMessage({ type: 'error', text: 'La imagen no debe superar los 5MB' });     

 

                return;     

 

            }     

 

            const reader = new FileReader();     

 

            reader.onloadend = () => {     

 

                setImagePreview(reader.result);     

 

                setFormData(prev => ({ ...prev, image_url: reader.result }));     

 

            };     

 

            reader.readAsDataURL(file);     

 

        }     

 

    }, []);     

 

  

 

    const handleRemoveImage = useCallback(() => {     

 

        setImagePreview(null);     

 

        setFormData(prev => ({ ...prev, image_url: '' }));     

 

    }, []);     

 

  

 

    // Manejar envío del formulario     

 

    const handleSubmit = async (e) => {     

 

        e.preventDefault();     

 

  

 

        // Validaciones     

 

        if (!formData.id?.trim()) {     

 

            setMessage({ type: 'error', text: 'El ID del troquel es requerido' });     

 

            return;     

 

        }     

 

        if (!formData.name?.trim()) {     

 

            setMessage({ type: 'error', text: 'El nombre del troquel es requerido' });     

 

            return;     

 

        }     

 

  

 

        setIsSubmitting(true);     

 

        setMessage({ type: '', text: '' });     

 

  

 

        try {     

 

            const apiData = mapFormToApi(formData);     

 

            const url = editingDie     

 

                ? `${API_BASE}/troqueles.php/${formData.id}`     

 

                : `${API_BASE}/troqueles.php`;     

 

            const method = editingDie ? 'PUT' : 'POST';     

 

  

 

            const response = await fetch(url, {     

 

                method,     

 

                headers: { 'Content-Type': 'application/json' },     

 

                credentials: 'include',     

 

                body: JSON.stringify(apiData),     

 

            });     

 

  

 

            const result = await response.json();     

 

  

 

            if (response.ok && result.success) {     

 

                setMessage({     

 

                    type: 'success',     

 

                    text: editingDie     

 

                        ? `Troquel ${formData.id} actualizado exitosamente`     

 

                        : `Troquel ${formData.id} registrado exitosamente`     

 

                });     

 

                handleReset();     

 

                if (editingDie) {     

 

                    setEditingDie(null);     

 

                    setActiveTab('manage');     

 

                    fetchDies();     

 

                }     

 

            } else {     

 

                throw new Error(result.message || 'Error al guardar el troquel');     

 

            }     

 

        } catch (error) {     

 

            console.error('Error saving die:', error);     

 

            setMessage({ type: 'error', text: error.message || 'Error al guardar el troquel' });     

 

        } finally {     

 

            setIsSubmitting(false);     

 

            setTimeout(() => setMessage({ type: '', text: '' }), 5000);     

 

        }     

 

    };     

 

  

 

    // Resetear formulario     

 

    const handleReset = useCallback(() => {     

 

        setFormData({     

 

            id: '',     

 

            name: '',     

 

            status: 'Pendiente',     

 

            year: new Date().getFullYear(),     

 

            model: '',     

 

            golpes: '',     

 

            golpes_acum: '',     

 

            capacidad_golpes: '',     

 

            rectificaciones: '0',     

 

            image_url: '',     

 

            notes: '',     

 

            prensa_asignada: '',     

 

            tipo_troquel: 'Null',     

 

            ubicacion: '',     

 

            proveedor: '',     

 

            peso_kg: '',     

 

            dimensiones: '',     

 

            material_base: '',     

 

            num_estaciones: '',     

 

            numero_serie: '',    

 

            cavidades: '',    

 

            color: '',    

 

            ciclos: '',    

 

            n_parte_1: '',    

 

            n_parte_2: '',    

 

            n_parte_3: '',    

 

            n_parte_4: '',    

 

            n_parte_5: '',    

 

            n_parte_6: '',    

 

        });     

 

        setImagePreview(null);     

 

        setEditingDie(null);     

 

        collapseAllSections();     

 

    }, [collapseAllSections]);     

 

  

 

    // Editar troquel     

 

    const handleEdit = (die) => {     

 

        setEditingDie(die);     

 

        const formMapped = mapApiToForm(die);     

 

        setFormData(formMapped);     

 

        if (formMapped.image_url) {     

 

            setImagePreview(formMapped.image_url);     

 

        }     

 

        setActiveTab('register');     

 

        expandAllSections();     

 

    };     

 

  

 

    // Abrir modal de eliminación     

 

    const handleDeleteClick = (die) => {     

 

        setDieToDelete(die);     

 

        setShowDeleteModal(true);     

 

    };     

 

  

 

    // Confirmar eliminación     

 

    const handleDeleteConfirm = async () => {     

 

        if (!dieToDelete) return;     

 

  

 

        const dieId = dieToDelete.id || dieToDelete.id_troquel;     

 

        try {     

 

            const response = await fetch(`${API_BASE}/troqueles.php/${dieId}`, {     

 

                method: 'DELETE',     

 

                credentials: 'include',     

 

            });     

 

  

 

            const result = await response.json();     

 

  

 

            if (response.ok && result.success) {     

 

                setMessage({ type: 'success', text: `Troquel ${dieId} eliminado exitosamente` });     

 

                fetchDies();     

 

            } else {     

 

                throw new Error(result.message || 'Error al eliminar el troquel');     

 

            }     

 

        } catch (error) {     

 

            console.error('Error deleting die:', error);     

 

            setMessage({ type: 'error', text: error.message || 'Error al eliminar el troquel' });     

 

        } finally {     

 

            setShowDeleteModal(false);     

 

            setDieToDelete(null);     

 

            setTimeout(() => setMessage({ type: '', text: '' }), 5000);     

 

        }     

 

    };     

 

  

 

    // Filtrar troqueles  

 

    const filteredDies = useMemo(() => {     

 

        return dies.filter(die => {     

 

            const dieId = (die.id || die.id_troquel || '').toLowerCase();     

 

            const dieName = (die.name || die.nombre || '').toLowerCase();     

 

            const term = searchTerm.toLowerCase();     

 

            return dieId.includes(term) || dieName.includes(term);     

 

        });     

 

    }, [dies, searchTerm]);     

 

  

 

    // Dynamic input styles  

 

    const getInputStyle = useCallback((fieldName, disabled = false) => ({     

 

        ...styles.input,     

 

        borderColor: focusedField === fieldName ? '#00ff88' : 'rgba(255, 255, 255, 0.1)',     

 

        boxShadow: focusedField === fieldName ? '0 0 15px rgba(0, 255, 136, 0.2)' : 'none',     

 

        opacity: disabled ? 0.6 : 1,     

 

        cursor: disabled ? 'not-allowed' : 'text',     

 

    }), [focusedField, styles.input]);     

 

  

 

    const getSelectStyle = useCallback((fieldName) => ({     

 

        ...styles.select,     

 

        borderColor: focusedField === fieldName ? '#00ff88' : 'rgba(255, 255, 255, 0.1)',     

 

        boxShadow: focusedField === fieldName ? '0 0 15px rgba(0, 255, 136, 0.2)' : 'none',     

 

    }), [focusedField, styles.select]);     

 

  

 

    // Estilos para controles de sección     

 

    const sectionControlStyles = {     

 

        container: {     

 

            display: 'flex',     

 

            gap: '12px',     

 

            marginBottom: '20px',     

 

            justifyContent: 'flex-end',     

 

        },     

 

        button: {     

 

            background: 'transparent',     

 

            border: '1px solid rgba(0, 255, 136, 0.3)',     

 

            color: '#00ff88',     

 

            padding: '8px 16px',     

 

            borderRadius: '8px',     

 

            fontSize: '12px',     

 

            cursor: 'pointer',     

 

            transition: 'all 0.2s ease',     

 

            display: 'flex',     

 

            alignItems: 'center',     

 

            gap: '6px',     

 

        },     

 

    };     

 

     

    // Callbacks memoizados para toggles 

    const toggleBasicInfo = useCallback(() => toggleSection('basicInfo'), [toggleSection]); 

    const toggleProduction = useCallback(() => toggleSection('production'), [toggleSection]); 

    const toggleTechnical = useCallback(() => toggleSection('technical'), [toggleSection]); 

    const togglePartNumbers = useCallback(() => toggleSection('partNumbers'), [toggleSection]); 

    const toggleImage = useCallback(() => toggleSection('image'), [toggleSection]); 

    const toggleNotes = useCallback(() => toggleSection('notes'), [toggleSection]); 

     

    const togglePrensaBasicInfo = useCallback(() => togglePrensaSection('basicInfo'), [togglePrensaSection]); 

    const togglePrensaTechnical = useCallback(() => togglePrensaSection('technical'), [togglePrensaSection]); 

    const togglePrensaMaintenance = useCallback(() => togglePrensaSection('maintenance'), [togglePrensaSection]); 

    const togglePrensaNotes = useCallback(() => togglePrensaSection('notes'), [togglePrensaSection]); 

     

    // Estilos para status de prensa 

    const getPrensaStatusStyle = (status) => { 

        const statusColors = { 

            'Activa': { 

                background: 'rgba(0, 255, 136, 0.15)', 

                color: '#00ff88', 

                border: '1px solid rgba(0, 255, 136, 0.3)' 

            }, 

            'En mantenimiento': { 

                background: 'rgba(255, 200, 0, 0.15)', 

                color: '#ffc800', 

                border: '1px solid rgba(255, 200, 0, 0.3)' 

            }, 

            'Inactiva': { 

                background: 'rgba(255, 107, 107, 0.15)', 

                color: '#ff6b6b', 

                border: '1px solid rgba(255, 107, 107, 0.3)' 

            }, 

            'Fuera de servicio': { 

                background: 'rgba(128, 128, 128, 0.15)', 

                color: '#888', 

                border: '1px solid rgba(128, 128, 128, 0.3)' 

            }, 

        }; 

        return statusColors[status] || statusColors['Activa']; 

    }; 

 

    return (     

 

        <div style={styles.container}>     

 

            <div style={styles.gridOverlay}/>     

 

            <div style={styles.scanLine}/>     

 

            {/* Header */}     

 

            <header style={styles.header}>     

 

                <div style={styles.logoSection}>     

 

                    <div style={styles.logoIcon}>⚙</div>     

 

                    <div style={styles.logoText}>     

 

                        <span style={styles.logoTitle}>E-KANBAN</span>     

 

                        <span style={styles.logoSubtitle}>Administración de Troqueles</span>     

 

                    </div>     

 

                </div>     

 

                <div style={styles.headerRight}>     

 

                    {user && (     

 

                        <span style={{     

 

                                ...styles.adminBadge,     

 

                                background: 'rgba(0, 255, 136, 0.15)',     

 

                                borderColor: '#00ff88',     

 

                                color: '#00ff88',     

 

                            }}>     

 

                            {user.username}     

 

                        </span>     

 

                    )}     

 

                    {onNavigateBack && (     

 

                        <button style={styles.backButton}     

 

                            onClick={onNavigateBack}     

 

                            onMouseEnter={(e) => {     

 

                                e.target.style.background = 'rgba(0, 255, 136, 0.1)';     

 

                                e.target.style.boxShadow = '0 0 20px rgba(0, 255, 136, 0.2)';     

 

                            }}     

 

                            onMouseLeave={(e) => {     

 

                                e.target.style.background = 'transparent';     

 

                                e.target.style.boxShadow = 'none';     

 

                            }}     

 

                        >     

 

                            ← Volver al Dashboard     

 

                        </button>     

 

                    )}     

 

                </div>     

 

            </header>     

 

  

 

            {/* Contenido principal */}     

 

            <main style={styles.mainContent}>     

 

               

 

            {/* Header de la página */}     

 

            <div style={styles.pageHeader}>     

 

                <h1 style={styles.pageTitle}>     

 

                    Gestión de Troqueles, Prensas y Modelos     

 

                </h1>     

 

                <p style={styles.pageSubtitle}>     

 

                    Registre, administre y monitoree todos los troqueles, prensas y modelos del sistema     

 

                </p>     

 

            </div>     

 

  

 

            {/* Navegación entre pestañas */}     

 

            <div style={styles.tabsContainer}>     

 

                <button     

 

                    style={{ ...styles.tab, ...(activeTab === 'register' ? styles.tabActive : {}) }}     

 

                    onClick={() => { setActiveTab('register'); setEditingDie(null); handleReset(); }}     

 

                >     

 

                    {editingDie ? 'Editar Troquel' : 'Nuevo Troquel'}     

 

                </button>     

 

                <button     

 

                    style={{ ...styles.tab, ...(activeTab === 'manage' ? styles.tabActive : {}) }}     

 

                    onClick={() => setActiveTab('manage')}     

 

                >     

 

                    Administrar Troqueles     

 

                </button>  

 

                <button     

 

                    style={{ ...styles.tab, ...(activeTab === 'prensas' ? styles.tabActive : {}) }}     

 

                    onClick={() => { setActiveTab('prensas'); setEditingPrensa(null); handlePrensaReset(); }}     

 

                >     

 

                    {editingPrensa ? 'Editar Prensa' : 'Nueva Prensa'}     

 

                </button>  

 

                <button     

 

                    style={{ ...styles.tab, ...(activeTab === 'prensas-manage' ? styles.tabActive : {}) }}     

 

                    onClick={() => setActiveTab('prensas-manage')}     

 

                >     

 

                    Administrar Prensas     

 

                </button> 

                <button     

 

                    style={{ ...styles.tab, ...(activeTab === 'modelos' ? styles.tabActive : {}) }}     

 

                    onClick={() => { setActiveTab('modelos'); setEditingModelo(null); handleModeloReset(); }}     

 

                >     

 

                    Modelos de Troquel     

 

                </button>  

 

            </div>     

 

  

 

            {/* Mensajes */}     

 

            {message.type === 'success' && (     

 

                <div style={styles.successMessage}>     

 

                    <div style={{ ...styles.messageIcon, background: 'rgba(0, 255, 136, 0.15)' }}>✓</div>     

 

                    <div>     

 

                        <strong style={{ color: '#00ff88', fontSize: '14px' }}>     

 

                            {message.text}     

 

                        </strong>     

 

                    </div>     

 

                </div>     

 

            )}     

 

  

 

            {message.type === 'error' && (     

 

                <div style={styles.errorMessage}>     

 

                    <div style={{ ...styles.messageIcon, background: 'rgba(255, 107, 107, 0.15)' }}>✕</div>     

 

                    <div>     

 

                        <strong style={{ color: '#ff6b6b', fontSize: '14px' }}>     

 

                            {message.text}     

 

                        </strong>     

 

                    </div>     

 

                </div>     

 

            )}     

 

  

 

            {/* Pestaña de registro de troquel */}     

 

            {activeTab === 'register' && (     

 

                <form onSubmit={handleSubmit}>     

 

                    <div style={styles.formContainer}>     

 

                   

 

                    {/* Controles de secciones */}     

 

                    <div style={sectionControlStyles.container}>     

 

                        <button type="button"     

 

                            style={sectionControlStyles.button}     

 

                            onClick={expandAllSections}     

 

                            onMouseEnter={(e) => {     

 

                                e.target.style.background = 'rgba(0, 255, 136, 0.1)';     

 

                            }}     

 

                            onMouseLeave={(e) => {     

 

                                e.target.style.background = 'transparent';     

 

                            }}     

 

                        >     

 

                            ▼ Expandir Todo     

 

                        </button>     

 

                        <button type="button"     

 

                            style={sectionControlStyles.button}     

 

                            onClick={collapseAllSections}     

 

                            onMouseEnter={(e) => {     

 

                                e.target.style.background = 'rgba(0, 255, 136, 0.1)';     

 

                            }}     

 

                            onMouseLeave={(e) => {     

 

                                e.target.style.background = 'transparent';     

 

                            }}     

 

                        >     

 

                            ▲ Colapsar Todo     

 

                        </button>     

 

                    </div>     

 

  

 

                    {/* Información básica */}     

 

                    <CollapsibleSection     

 

                        title="Información Básica"     

 

                        isExpanded={expandedSections.basicInfo}     

 

                        onToggle={toggleBasicInfo}     

 

                        isRequired={true}     

 

                    >     

 

                    <div style={styles.formGrid}>     

 

                        <div style={styles.inputGroup}>     

 

                            <label style={styles.label}>     

 

                                    ID del Troquel     

 

                                <span style={styles.requiredStar}>*</span>     

 

                            </label>     

 

                            <input type="text"     

 

                                name="id"     

 

                                value={formData.id}     

 

                                onChange={handleInputChange}     

 

                                onFocus={() => handleFocus('id')}     

 

                                onBlur={handleBlur}     

 

                                style={getInputStyle('id', !!editingDie)}     

 

                                placeholder="Ej: T001"     

 

                                maxLength={50}     

 

                                disabled={!!editingDie}     

 

                            />     

 

                        </div>     

 

                        <div style={styles.inputGroup}>     

 

                            <label style={styles.label}>     

 

                                Nombre del Troquel     

 

                                <span style={styles.requiredStar}>*</span>     

 

                            </label>     

 

                            <input type="text"     

 

                                    name="name"     

 

                                    value={formData.name}     

 

                                    onChange={handleInputChange}     

 

                                    onFocus={() => handleFocus('name')}     

 

                                    onBlur={handleBlur}     

 

                                    style={getInputStyle('name')}     

 

                                    placeholder="Ej: Alpha"     

 

                                    maxLength={100}    

 

                            />     

 

                        </div>     

 

                        <div style={styles.inputGroup}>     

 

                            <label style={styles.label}>     

 

                                Año de Registro     

 

                                <span style={styles.requiredStar}>*</span>     

 

                            </label>     

 

                            <select name="year"     

 

                                    value={formData.year}     

 

                                    onChange={handleInputChange}     

 

                                    onFocus={() => handleFocus('year')}     

 

                                    onBlur={handleBlur}     

 

                                    style={getSelectStyle('year')}     

 

                            >     

 

                                {years.map(y => (     

 

                                    <option key={y} value={y}>{y}</option>     

 

                                ))}     

 

                            </select>     

 

                        </div>     

 

                        <div style={styles.inputGroup}>     

 

                            <label style={styles.label}>Modelo / Part Number</label>     

 

                            <input type="text"     

 

                                name="model"     

 

                                value={formData.model}     

 

                                onChange={handleInputChange}     

 

                                onFocus={() => handleFocus('model')}     

 

                                onBlur={handleBlur}     

 

                                style={getInputStyle('model')}     

 

                                placeholder="Ej: F180 - 645101-31-F180"     

 

                                maxLength={100}     

 

                            />     

 

                        </div>     

 

                        <div style={styles.inputGroup}>     

 

                            <label style={styles.label}>Estado</label>     

 

                            <select name="status"     

 

                                value={formData.status}     

 

                                onChange={handleInputChange}     

 

                                onFocus={() => handleFocus('status')}     

 

                                onBlur={handleBlur}     

 

                                style={getSelectStyle('status')}     

 

                                disabled={optionsLoading}     

 

                            >     

 

                                {statusOptions.map(opt => (     

 

                                    <option key={opt.value} value={opt.value}>     

 

                                        {opt.label}     

 

                                    </option>     

 

                                ))}     

 

                            </select>     

 

                        </div>     

 

                        <div style={styles.inputGroup}>     

 

                            <label style={styles.label}>Tipo de Troquel</label>     

 

                            <select name="tipo_troquel"     

 

                                value={formData.tipo_troquel}     

 

                                onChange={handleInputChange}     

 

                                onFocus={() => handleFocus('tipo_troquel')}     

 

                                onBlur={handleBlur}     

 

                                style={getSelectStyle('tipo_troquel')}     

 

                                disabled={optionsLoading}     

 

                            >     

 

                                {dieTypeOptions.map(opt => (     

 

                                    <option key={opt.value} value={opt.value}>     

 

                                        {opt.label}     

 

                                    </option>     

 

                                ))}     

 

                            </select>     

 

                        </div>     

 

                        <div style={styles.inputGroup}>     

 

                            <label style={styles.label}>Prensa Asignada</label>     

 

                            <select name="prensa_asignada"     

 

                                value={formData.prensa_asignada}     

 

                                onChange={handleInputChange}     

 

                                onFocus={() => handleFocus('prensa_asignada')}     

 

                                onBlur={handleBlur}     

 

                                style={getSelectStyle('prensa_asignada')}     

 

                                disabled={optionsLoading}     

 

                            >     

 

                                {pressOptions.map(opt => (     

 

                                    <option key={opt.value} value={opt.value}>     

 

                                        {opt.label}     

 

                                    </option>     

 

                                ))}     

 

                            </select>     

 

                        </div>     

 

                        <div style={styles.inputGroup}>     

 

                            <label style={styles.label}>Ubicación</label>     

 

                            <input type="text"     

 

                                name="ubicacion"     

 

                                value={formData.ubicacion}     

 

                                onChange={handleInputChange}     

 

                                onFocus={() => handleFocus('ubicacion')}     

 

                                onBlur={handleBlur}     

 

                                style={getInputStyle('ubicacion')}     

 

                                placeholder="Ej: Rack A-12"     

 

                                maxLength={100}     

 

                            />     

 

                        </div>     

 

                    </div>     

 

                    </CollapsibleSection>     

 

  

 

                    {/* Información de producción */}     

 

                    <CollapsibleSection     

 

                        title="Información de Producción"     

 

                        isExpanded={expandedSections.production}     

 

                        onToggle={toggleProduction}     

 

                    >     

 

                        <div style={styles.formGrid}>     

 

                            <div style={styles.inputGroup}>     

 

                                <label style={styles.label}>Golpes Actuales</label>     

 

                                <input type="text"     

 

                                    name="golpes"     

 

                                    value={formData.golpes}     

 

                                    onChange={handleInputChange}     

 

                                    onFocus={() => handleFocus('golpes')}     

 

                                    onBlur={handleBlur}     

 

                                    style={getInputStyle('golpes')}     

 

                                    placeholder="Ej: 15000"     

 

                                />     

 

                            </div>     

 

                            <div style={styles.inputGroup}>     

 

                                <label style={styles.label}>Golpes Acumulados</label>     

 

                                <input type="text"     

 

                                    name="golpes_acum"     

 

                                    value={formData.golpes_acum}     

 

                                    onChange={handleInputChange}     

 

                                    onFocus={() => handleFocus('golpes_acum')}     

 

                                    onBlur={handleBlur}     

 

                                    style={getInputStyle('golpes_acum')}     

 

                                    placeholder="Ej: 150000"     

 

                                />     

 

                            </div>     

 

                            <div style={styles.inputGroup}>     

 

                                <label style={styles.label}>Capacidad de Golpes</label>     

 

                                <input type="text"     

 

                                    name="capacidad_golpes"     

 

                                    value={formData.capacidad_golpes}     

 

                                    onChange={handleInputChange}     

 

                                    onFocus={() => handleFocus('capacidad_golpes')}     

 

                                    onBlur={handleBlur}     

 

                                    style={getInputStyle('capacidad_golpes')}     

 

                                    placeholder="Ej: 500000"     

 

                                />     

 

                            </div>     

 

                            <div style={styles.inputGroup}>     

 

                                <label style={styles.label}>Rectificaciones</label>     

 

                                <input type="text"     

 

                                    name="rectificaciones"     

 

                                    value={formData.rectificaciones}     

 

                                    onChange={handleInputChange}     

 

                                    onFocus={() => handleFocus('rectificaciones')}     

 

                                    onBlur={handleBlur}     

 

                                    style={getInputStyle('rectificaciones')}     

 

                                    placeholder="Ej: 3"     

 

                                />     

 

                            </div>    

 

                            <div style={styles.inputGroup}>    

 

                                <label style={styles.label}>Ciclos</label>    

 

                                <input type="text"    

 

                                    name="ciclos"    

 

                                    value={formData.ciclos}    

 

                                    onChange={handleInputChange}    

 

                                    onFocus={() => handleFocus('ciclos')}    

 

                                    onBlur={handleBlur}    

 

                                    style={getInputStyle('ciclos')}    

 

                                    placeholder="Ej: 5"    

 

                                />    

 

                            </div>    

 

                        </div>     

 

                    </CollapsibleSection>     

 

  

 

                    {/* Especificaciones técnicas */}     

 

                    <CollapsibleSection     

 

                        title="Especificaciones Técnicas"     

 

                        isExpanded={expandedSections.technical}     

 

                        onToggle={toggleTechnical}     

 

                    >     

 

                        <div style={styles.formGrid}>     

 

                            <div style={styles.inputGroup}>     

 

                                <label style={styles.label}>Número de Serie</label>     

 

                                <input type="text"     

 

                                    name="numero_serie"     

 

                                    value={formData.numero_serie}     

 

                                    onChange={handleInputChange}     

 

                                    onFocus={() => handleFocus('numero_serie')}     

 

                                    onBlur={handleBlur}     

 

                                    style={getInputStyle('numero_serie')}     

 

                                    placeholder="Ej: SN-2024-001"     

 

                                    maxLength={100}     

 

                                />     

 

                            </div>     

 

                            <div style={styles.inputGroup}>     

 

                                <label style={styles.label}>Proveedor</label>     

 

                                <input type="text"     

 

                                    name="proveedor"     

 

                                    value={formData.proveedor}     

 

                                    onChange={handleInputChange}     

 

                                    onFocus={() => handleFocus('proveedor')}     

 

                                    onBlur={handleBlur}     

 

                                    style={getInputStyle('proveedor')}     

 

                                    placeholder="Ej: ToolMaster Inc."     

 

                                    maxLength={100}     

 

                                />     

 

                            </div>     

 

                            <div style={styles.inputGroup}>     

 

                                <label style={styles.label}>Peso (kg)</label>     

 

                                <input type="text"     

 

                                    name="peso_kg"     

 

                                    value={formData.peso_kg}     

 

                                    onChange={handleInputChange}     

 

                                    onFocus={() => handleFocus('peso_kg')}     

 

                                    onBlur={handleBlur}     

 

                                    style={getInputStyle('peso_kg')}     

 

                                    placeholder="Ej: 250"     

 

                                />     

 

                            </div>     

 

                            <div style={styles.inputGroup}>     

 

                                <label style={styles.label}>Dimensiones</label>     

 

                                <input type="text"     

 

                                    name="dimensiones"     

 

                                    value={formData.dimensiones}     

 

                                    onChange={handleInputChange}     

 

                                    onFocus={() => handleFocus('dimensiones')}     

 

                                    onBlur={handleBlur}     

 

                                    style={getInputStyle('dimensiones')}     

 

                                    placeholder="Ej: 500x400x300 mm"     

 

                                    maxLength={100}     

 

                                />     

 

                            </div>     

 

                            <div style={styles.inputGroup}>     

 

                                <label style={styles.label}>Material Base</label>     

 

                                <input type="text"     

 

                                    name="material_base"     

 

                                    value={formData.material_base}     

 

                                    onChange={handleInputChange}     

 

                                    onFocus={() => handleFocus('material_base')}     

 

                                    onBlur={handleBlur}     

 

                                    style={getInputStyle('material_base')}     

 

                                    placeholder="Ej: Acero D2"     

 

                                    maxLength={100}     

 

                                />     

 

                            </div>     

 

                            <div style={styles.inputGroup}>     

 

                                <label style={styles.label}>Número de Estaciones</label>     

 

                                <input type="text"     

 

                                    name="num_estaciones"     

 

                                    value={formData.num_estaciones}     

 

                                    onChange={handleInputChange}     

 

                                    onFocus={() => handleFocus('num_estaciones')}     

 

                                    onBlur={handleBlur}     

 

                                    style={getInputStyle('num_estaciones')}     

 

                                    placeholder="Ej: 8"     

 

                                />     

 

                            </div>    

 

                            <div style={styles.inputGroup}>    

 

                                <label style={styles.label}>Cavidades</label>    

 

                                <input type="text"    

 

                                    name="cavidades"    

 

                                    value={formData.cavidades}    

 

                                    onChange={handleInputChange}    

 

                                    onFocus={() => handleFocus('cavidades')}    

 

                                    onBlur={handleBlur}    

 

                                    style={getInputStyle('cavidades')}    

 

                                    placeholder="Ej: 4"    

 

                                />    

 

                            </div>    

 

                            <div style={styles.inputGroup}>    

 

                                <label style={styles.label}>Color</label>    

 

                                <input type="text"    

 

                                    name="color"    

 

                                    value={formData.color}    

 

                                    onChange={handleInputChange}    

 

                                    onFocus={() => handleFocus('color')}    

 

                                    onBlur={handleBlur}    

 

                                    style={getInputStyle('color')}    

 

                                    placeholder="Ej: Azul"    

 

                                    maxLength={50}    

 

                                />    

 

                            </div>    

 

                        </div>     

 

                    </CollapsibleSection>     

 

  

 

                    {/* Números de parte */}    

 

                    <CollapsibleSection    

 

                        title="Números de Parte"    

 

                        isExpanded={expandedSections.partNumbers}    

 

                        onToggle={togglePartNumbers}    

 

                    >    

 

                        <div style={styles.formGrid}>    

 

                            <div style={styles.inputGroup}>    

 

                                <label style={styles.label}>N° Parte 1</label>    

 

                                <input type="text"    

 

                                    name="n_parte_1"    

 

                                    value={formData.n_parte_1}    

 

                                    onChange={handleInputChange}    

 

                                    onFocus={() => handleFocus('n_parte_1')}    

 

                                    onBlur={handleBlur}    

 

                                    style={getInputStyle('n_parte_1')}    

 

                                    placeholder="Número de parte 1"    

 

                                    maxLength={100}    

 

                                />    

 

                            </div>    

 

                            <div style={styles.inputGroup}>    

 

                                <label style={styles.label}>N° Parte 2</label>    

 

                                <input type="text"    

 

                                    name="n_parte_2"    

 

                                    value={formData.n_parte_2}    

 

                                    onChange={handleInputChange}    

 

                                    onFocus={() => handleFocus('n_parte_2')}    

 

                                    onBlur={handleBlur}    

 

                                    style={getInputStyle('n_parte_2')}    

 

                                    placeholder="Número de parte 2"    

 

                                    maxLength={100}    

 

                                />    

 

                            </div>    

 

                            <div style={styles.inputGroup}>    

 

                                <label style={styles.label}>N° Parte 3</label>    

 

                                <input type="text"    

 

                                    name="n_parte_3"    

 

                                    value={formData.n_parte_3}    

 

                                    onChange={handleInputChange}    

 

                                    onFocus={() => handleFocus('n_parte_3')}    

 

                                    onBlur={handleBlur}    

 

                                    style={getInputStyle('n_parte_3')}    

 

                                    placeholder="Número de parte 3"    

 

                                    maxLength={100}    

 

                                />    

 

                            </div>    

 

                            <div style={styles.inputGroup}>    

 

                                <label style={styles.label}>N° Parte 4</label>    

 

                                <input type="text"    

 

                                    name="n_parte_4"    

 

                                    value={formData.n_parte_4}    

 

                                    onChange={handleInputChange}    

 

                                    onFocus={() => handleFocus('n_parte_4')}    

 

                                    onBlur={handleBlur}    

 

                                    style={getInputStyle('n_parte_4')}    

 

                                    placeholder="Número de parte 4"    

 

                                    maxLength={100}    

 

                                />    

 

                            </div>    

 

                            <div style={styles.inputGroup}>    

 

                                <label style={styles.label}>N° Parte 5</label>    

 

                                <input type="text"    

 

                                    name="n_parte_5"    

 

                                    value={formData.n_parte_5}    

 

                                    onChange={handleInputChange}    

 

                                    onFocus={() => handleFocus('n_parte_5')}    

 

                                    onBlur={handleBlur}    

 

                                    style={getInputStyle('n_parte_5')}    

 

                                    placeholder="Número de parte 5"    

 

                                    maxLength={100}    

 

                                />    

 

                            </div>    

 

                            <div style={styles.inputGroup}>    

 

                                <label style={styles.label}>N° Parte 6</label>    

 

                                <input type="text"    

 

                                    name="n_parte_6"    

 

                                    value={formData.n_parte_6}    

 

                                    onChange={handleInputChange}    

 

                                    onFocus={() => handleFocus('n_parte_6')}    

 

                                    onBlur={handleBlur}    

 

                                    style={getInputStyle('n_parte_6')}    

 

                                    placeholder="Número de parte 6"    

 

                                    maxLength={100}    

 

                                />    

 

                            </div>    

 

                        </div>    

 

                    </CollapsibleSection>    

 

  

 

                    {/* Imagen */}     

 

                    <CollapsibleSection     

 

                        title="Imagen del Troquel"     

 

                        isExpanded={expandedSections.image}     

 

                        onToggle={toggleImage}     

 

                    >     

 

                        <div style={styles.formGrid}>     

 

                            {!imagePreview ? (     

 

                                <label style={styles.imageUploadArea}     

 

                                    onMouseEnter={(e) => {     

 

                                        e.currentTarget.style.borderColor = '#00ff88';     

 

                                        e.currentTarget.style.background = 'rgba(0, 255, 136, 0.05)';     

 

                                    }}     

 

                                    onMouseLeave={(e) => {     

 

                                        e.currentTarget.style.borderColor = 'rgba(0, 255, 136, 0.25)';     

 

                                        e.currentTarget.style.background = 'rgba(0, 0, 0, 0.2)';     

 

                                    }}     

 

                                >     

 

                                    <input type="file" accept="image/*" onChange={handleImageChange}     

 

                                        style={{ display: 'none' }} />     

 

                                    <div style={styles.imageUploadIcon}>📷</div>     

 

                                    <p style={styles.imageUploadText}>Haga clic para subir imagen</p>     

 

                                    <p style={styles.imageUploadHint}>PNG, JPG hasta 5MB</p>     

 

                                </label>     

 

                            ) : (     

 

                                <div style={styles.imagePreview}>     

 

                                    <img src={imagePreview} alt="Preview" style={styles.imagePreviewImg} />     

 

                                    <button type="button" style={styles.imageRemoveBtn}     

 

                                        onClick={handleRemoveImage}>✕</button>     

 

                                </div>     

 

                            )}     

 

                        </div>     

 

                    </CollapsibleSection>     

 

  

 

                    {/* Notas */}     

 

                    <CollapsibleSection     

 

                        title="Notas y Comentarios"     

 

                        isExpanded={expandedSections.notes}     

 

                        onToggle={toggleNotes}     

 

                    >     

 

                        <div style={styles.formGrid}>     

 

                            <div style={{ ...styles.inputGroup, gridColumn: '1 / -1' }}>     

 

                                <label style={styles.label}>Notas Adicionales</label>     

 

                                <textarea     

 

                                    name="notes"     

 

                                    value={formData.notes}     

 

                                    onChange={handleInputChange}     

 

                                    onFocus={() => handleFocus('notes')}     

 

                                    onBlur={handleBlur}     

 

                                    style={{     

 

                                        ...styles.textarea,     

 

                                        borderColor: focusedField === 'notes' ? '#00ff88' : 'rgba(255, 255, 255, 0.1)',     

 

                                        boxShadow: focusedField === 'notes' ? '0 0 15px rgba(0, 255, 136, 0.2)' : 'none',     

 

                                    }}     

 

                                    placeholder="Información adicional sobre el troquel..."     

 

                                    rows={4}     

 

                                />     

 

                            </div>     

 

                        </div>     

 

                    </CollapsibleSection>     

 

  

 

                    {/* Botones */}     

 

                    <div style={styles.buttonGroup}>     

 

                        <button type="button" style={styles.btnSecondary}     

 

                            onClick={handleReset}     

 

                            onMouseEnter={(e) => {     

 

                                e.target.style.borderColor = '#aaa';     

 

                                e.target.style.color = '#fff';     

 

                            }}     

 

                            onMouseLeave={(e) => {     

 

                                e.target.style.borderColor = 'rgba(255, 255, 255, 0.15)';     

 

                                e.target.style.color = '#aaa';     

 

                            }}     

 

                        >     

 

                            {editingDie ? 'Cancelar Edición' : 'Limpiar Formulario'}     

 

                        </button>     

 

                        <button type="submit" style={styles.btnPrimary}     

 

                            disabled={isSubmitting}     

 

                            onMouseEnter={(e) => {     

 

                                if (!isSubmitting) {     

 

                                    e.target.style.transform = 'translateY(-2px)';     

 

                                    e.target.style.boxShadow = '0 6px 25px rgba(0, 255, 136, 0.35)';     

 

                                }     

 

                            }}     

 

                            onMouseLeave={(e) => {     

 

                                e.target.style.transform = 'translateY(0)';     

 

                                e.target.style.boxShadow = '0 4px 20px rgba(0, 255, 136, 0.25)';     

 

                            }}     

 

                        >     

 

                            {isSubmitting ? (     

 

                                <>     

 

                                    <div style={styles.loadingSpinner}/>     

 

                                    Guardando...     

 

                                </>     

 

                            ) : (     

 

                                editingDie ? 'Actualizar Troquel' : 'Registrar Troquel'     

 

                            )}     

 

                        </button>     

 

                    </div>     

 

                    </div>     

 

                </form>     

 

            )}     

 

  

 

            {/* Pestaña de administración de troqueles */}     

 

            {activeTab === 'manage' && (     

 

                <>     

 

                    {/* Estadísticas */}     

 

                    <div style={styles.statsRow}>     

 

                        <div style={styles.statCard}>     

 

                            <div style={{ ...styles.statIcon, background: 'rgba(0, 255, 136, 0.15)', color: '#00ff88' }}>⚙</div>     

 

                            <div>     

 

                                <div style={styles.statValue}>{stats.total}</div>     

 

                                <div style={styles.statLabel}>Total Troqueles</div>     

 

                            </div>     

 

                        </div>     

 

                        <div style={styles.statCard}>     

 

                            <div style={{ ...styles.statIcon, background: 'rgba(100, 255, 100, 0.15)', color: '#64ff64' }}>✓</div>     

 

                            <div>     

 

                                <div style={styles.statValue}>{stats.activos}</div>     

 

                                <div style={styles.statLabel}>Activos</div>     

 

                            </div>     

 

                        </div>     

 

                        <div style={styles.statCard}>     

 

                            <div style={{ ...styles.statIcon, background: 'rgba(255, 200, 0, 0.15)', color: '#ffc800' }}>🔧</div>     

 

                            <div>     

 

                                <div style={styles.statValue}>{stats.reparando}</div>     

 

                                <div style={styles.statLabel}>En Reparación</div>     

 

                            </div>     

 

                        </div>     

 

                        <div style={styles.statCard}>     

 

                            <div style={{ ...styles.statIcon, background: 'rgba(255, 107, 107, 0.15)', color: '#ff6b6b' }}>⏳</div>     

 

                            <div>     

 

                                <div style={styles.statValue}>{stats.pendientes}</div>     

 

                                <div style={styles.statLabel}>Pendientes</div>     

 

                            </div>     

 

                        </div>     

 

                    </div>     

 

  

 

                    {/* Tabla de troqueles */}     

 

                    <div style={styles.tableContainer}>     

 

                        <div style={styles.tableHeader}>     

 

                            <div style={styles.tableTitle}>     
                                Lista de Troqueles     
                            </div>     

 

                            <div style={styles.tableControls}>     

 

                                <input     

 

                                    type="text"     

 

                                    placeholder="Buscar por ID o nombre..."     

 

                                    value={searchTerm}     

 

                                    onChange={(e) => setSearchTerm(e.target.value)}     

 

                                    style={styles.tableSearch}     

 

                                />     

 

                                <select     

 

                                    value={filterYear}     

 

                                    onChange={(e) => setFilterYear(e.target.value)}     

 

                                    style={styles.tableFilter}     

 

                                >     

 

                                    <option value="">Todos los años</option>     

 

                                    {years.map(y => (     

 

                                        <option key={y} value={y}>{y}</option>     

 

                                    ))}     

 

                                </select>     

 

                                <select     

 

                                    value={filterStatus}     

 

                                    onChange={(e) => setFilterStatus(e.target.value)}     

 

                                    style={styles.tableFilter}     

 

                                >     

 

                                    <option value="">Todos los estados</option>     

 

                                    {statusOptions.map(opt => (     

 

                                        <option key={opt.value} value={opt.value}>{opt.label}</option>     

 

                                    ))}     

 

                                </select>     

 

                            </div>     

 

                        </div>     

 

  

 

                        {isLoading ? (     

 

                            <div style={{ padding: '60px 20px', textAlign: 'center' }}>     

 

                                <div style={{     

 

                                    width: '40px',     

 

                                    height: '40px',     

 

                                    border: '3px solid rgba(0, 255, 136, 0.2)',     

 

                                    borderTopColor: '#00ff88',     

 

                                    borderRadius: '50%',     

 

                                    animation: 'spin 1s linear infinite',     

 

                                    margin: '0 auto 16px'     

 

                                }} />     

 

                                <p style={{ color: '#888' }}>Cargando troqueles...</p>     

 

                            </div>     

 

                        ) : filteredDies.length === 0 ? (     

 

                            <div style={styles.emptyState}>     

 

                                <p style={styles.emptyText}>No se encontraron troqueles</p>     

 

                                <p style={{ fontSize: '12px', color: '#666' }}>     

 

                                    {searchTerm ? 'Intente con otra búsqueda' : 'Registre un nuevo troquel para comenzar'}     

 

                                </p>     

 

                            </div>     

 

                        ) : (     

 

                            <>     

 

                                <div style={{ overflowX: 'auto' }}>     

 

                                    <table style={styles.table}>     

 

                                        <thead>     

 

                                            <tr>     

 

                                                <th style={styles.th}>ID</th>     

 

                                                <th style={styles.th}>Nombre</th>     

 

                                                <th style={styles.th}>Año</th>     

 

                                                <th style={styles.th}>Modelo</th>     

 

                                                <th style={styles.th}>Estado</th>     

 

                                                <th style={styles.th}>Golpes Acum.</th>     

 

                                                <th style={styles.th}>Acciones</th>     

 

                                            </tr>     

 

                                        </thead>     

 

                                        <tbody>     

 

                                            {filteredDies.map((die) => {     

 

                                                const dieId = die.id || die.id_troquel;     

 

                                                const dieName = die.name || die.nombre;     

 

                                                const dieYear = die.year || die.año;     

 

                                                const dieModel = die.model || die.modelo || '-';     

 

                                                const dieStatus = die.status || die.estado;     

 

                                                const dieGolpesAcum = die.golpes_acum || '-';     

 

                                                return (     

 

                                                    <tr key={dieId}     

 

                                                        style={styles.tableRow}     

 

                                                        onMouseEnter={(e) => {     

 

                                                            e.currentTarget.style.background = 'rgba(0, 255, 136, 0.03)';     

 

                                                        }}     

 

                                                        onMouseLeave={(e) => {     

 

                                                            e.currentTarget.style.background = 'transparent';     

 

                                                        }}     

 

                                                    >     

 

                                                        <td style={{ ...styles.td, color: '#00ff88', fontWeight: 600 }}>     

 

                                                            {dieId}     

 

                                                        </td>     

 

                                                        <td style={styles.td}>{dieName}</td>     

 

                                                        <td style={styles.td}>{dieYear}</td>     

 

                                                        <td style={styles.td}>{dieModel}</td>     

 

                                                        <td style={styles.td}>     

 

                                                            <span style={{ ...styles.statusBadge, ...getStatusStyle(dieStatus) }}>     

 

                                                                {dieStatus}     

 

                                                            </span>     

 

                                                        </td>     

 

                                                        <td style={styles.td}>{dieGolpesAcum}</td>     

 

                                                        <td style={styles.td}>     

 

                                                            <button style={styles.actionBtn}     

 

                                                                    onClick={() => handleEdit(die)}     

 

                                                                    onMouseEnter={(e) => {     

 

                                                                        e.target.style.borderColor = '#00ff88';     

 

                                                                        e.target.style.color = '#00ff88';     

 

                                                                    }}     

 

                                                                    onMouseLeave={(e) => {     

 

                                                                        e.target.style.borderColor = 'rgba(255, 255, 255, 0.15)';     

 

                                                                        e.target.style.color = '#aaa';     

 

                                                                    }}     

 

                                                            >     

 

                                                                Editar     

 

                                                            </button>     

 

                                                            <button     

 

                                                                style={{ ...styles.actionBtn, color: '#ff6b6b' }}     

 

                                                                onClick={() => handleDeleteClick(die)}     

 

                                                                onMouseEnter={(e) => {     

 

                                                                    e.target.style.borderColor = '#ff6b6b';     

 

                                                                    e.target.style.background = 'rgba(255, 107, 107, 0.1)';     

 

                                                                }}     

 

                                                                onMouseLeave={(e) => {     

 

                                                                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.15)';     

 

                                                                    e.target.style.background = 'transparent';     

 

                                                                }}     

 

                                                            >     

 

                                                                Eliminar     

 

                                                            </button>     

 

                                                        </td>     

 

                                                    </tr>     

 

                                                );     

 

                                            })}     

 

                                        </tbody>     

 

                                    </table>     

 

                                </div>     

 

                                <div style={styles.pagination}>     

 

                                    <span style={styles.pageInfo}>     

 

                                        Mostrando {filteredDies.length} de {dies.length} troqueles     

 

                                    </span>     

 

                                </div>         

 

                            </>     

 

                        )}         

 

                    </div>         

 

                </>     

 

            )}     

 

  

 

            {/* ==================== PESTAÑA DE REGISTRO DE PRENSAS ==================== */}  

 

            {activeTab === 'prensas' && (  

 

                <form onSubmit={handlePrensaSubmit}>  

 

                    <div style={styles.formContainer}>  

 

                      

 

                    {/* Controles de secciones */}  

 

                    <div style={sectionControlStyles.container}>  

 

                        <button type="button"  

 

                            style={sectionControlStyles.button}  

 

                            onClick={expandAllPrensaSections}  

 

                            onMouseEnter={(e) => {  

 

                                e.target.style.background = 'rgba(0, 255, 136, 0.1)';  

 

                            }}  

 

                            onMouseLeave={(e) => {  

 

                                e.target.style.background = 'transparent';  

 

                            }}  

 

                        >  

 

                            ▼ Expandir Todo  

 

                        </button>  

 

                        <button type="button"  

 

                            style={sectionControlStyles.button}  

 

                            onClick={collapseAllPrensaSections}  

 

                            onMouseEnter={(e) => {  

 

                                e.target.style.background = 'rgba(0, 255, 136, 0.1)';  

 

                            }}  

 

                            onMouseLeave={(e) => {  

 

                                e.target.style.background = 'transparent';  

 

                            }}  

 

                        >  

 

                            ▲ Colapsar Todo  

 

                        </button>  

 

                    </div>  

 

  

 

                    {/* Información básica de prensa */}  

 

                    <CollapsibleSection  

 

                        title="Información Básica"  

 

                        isExpanded={prensaExpandedSections.basicInfo}  

 

                        onToggle={togglePrensaBasicInfo}  

 

                        isRequired={true}  

 

                    >  

 

                        <div style={styles.formGrid}>  

 

                            <div style={styles.inputGroup}>  

 

                                <label style={styles.label}>  

 

                                    Identificador de Prensa  

 

                                    <span style={styles.requiredStar}>*</span>  

 

                                </label>  

 

                                <input type="text"  

 

                                    name="identificador_prensa"  

 

                                    value={prensaFormData.identificador_prensa}  

 

                                    onChange={handlePrensaInputChange}  

 

                                    onFocus={() => handleFocus('identificador_prensa')}  

 

                                    onBlur={handleBlur}  

 

                                    style={getInputStyle('identificador_prensa', !!editingPrensa)}  

 

                                    placeholder="Ej: P01, PRENSA-01"  

 

                                    maxLength={50}  

 

                                    disabled={!!editingPrensa}  

 

                                />  

 

                            </div>  

 

                            <div style={styles.inputGroup}>  

 

                                <label style={styles.label}>  

 

                                    Nombre de la Prensa  

 

                                    <span style={styles.requiredStar}>*</span>  

 

                                </label>  

 

                                <input type="text"  

 

                                    name="nombre"  

 

                                    value={prensaFormData.nombre}  

 

                                    onChange={handlePrensaInputChange}  

 

                                    onFocus={() => handleFocus('nombre')}  

 

                                    onBlur={handleBlur}  

 

                                    style={getInputStyle('nombre')}  

 

                                    placeholder="Ej: Prensa Hidráulica 01"  

 

                                    maxLength={100}  

 

                                />  

 

                            </div>  

 

                            <div style={styles.inputGroup}>  

 

                                <label style={styles.label}>Estado</label>  

 

                                <select name="estado"  

 

                                    value={prensaFormData.estado}  

 

                                    onChange={handlePrensaInputChange}  

 

                                    onFocus={() => handleFocus('estado')}  

 

                                    onBlur={handleBlur}  

 

                                    style={getSelectStyle('estado')}  

 

                                >  

 

                                    {DEFAULT_PRESS_STATUS_OPTIONS.map(opt => (  

 

                                        <option key={opt.value} value={opt.value}>  

 

                                            {opt.label}  

 

                                        </option>  

 

                                    ))}  

 

                                </select>  

 

                            </div>  

 

                            <div style={styles.inputGroup}>  

 

                                <label style={styles.label}>Marca</label>  

 

                                <input type="text"  

 

                                    name="marca"  

 

                                    value={prensaFormData.marca}  

 

                                    onChange={handlePrensaInputChange}  

 

                                    onFocus={() => handleFocus('marca')}  

 

                                    onBlur={handleBlur}  

 

                                    style={getInputStyle('marca')}  

 

                                    placeholder="Ej: AIDA"  

 

                                    maxLength={100}  

 

                                />  

 

                            </div>  

 

                            <div style={styles.inputGroup}>  

 

                                <label style={styles.label}>Modelo</label>  

 

                                <input type="text"  

 

                                    name="modelo"  

 

                                    value={prensaFormData.modelo}  

 

                                    onChange={handlePrensaInputChange}  

 

                                    onFocus={() => handleFocus('modelo')}  

 

                                    onBlur={handleBlur}  

 

                                    style={getInputStyle('modelo')}  

 

                                    placeholder="Ej: NC1-2000"  

 

                                    maxLength={100}  

 

                                />  

 

                            </div>  

 

                            <div style={styles.inputGroup}>  

 

                                <label style={styles.label}>Ubicación</label>  

 

                                <input type="text"  

 

                                    name="ubicacion"  

 

                                    value={prensaFormData.ubicacion}  

 

                                    onChange={handlePrensaInputChange}  

 

                                    onFocus={() => handleFocus('ubicacion')}  

 

                                    onBlur={handleBlur}  

 

                                    style={getInputStyle('ubicacion')}  

 

                                    placeholder="Ej: Nave A - Línea 1"  

 

                                    maxLength={100}  

 

                                />  

 

                            </div>  

 

                        </div>  

 

                    </CollapsibleSection>  

 

  

 

                    {/* Especificaciones técnicas de prensa */}  

 

                    <CollapsibleSection  

 

                        title="Especificaciones Técnicas"  

 

                        isExpanded={prensaExpandedSections.technical}  

 

                        onToggle={togglePrensaTechnical}  

 

                    >  

 

                        <div style={styles.formGrid}>  

 

                            <div style={styles.inputGroup}>  

 

                                <label style={styles.label}>Tonelaje</label>  

 

                                <input type="text"  

 

                                    name="tonelaje"  

 

                                    value={prensaFormData.tonelaje}  

 

                                    onChange={handlePrensaInputChange}  

 

                                    onFocus={() => handleFocus('tonelaje')}  

 

                                    onBlur={handleBlur}  

 

                                    style={getInputStyle('tonelaje')}  

 

                                    placeholder="Ej: 200 ton"  

 

                                />  

 

                            </div>  

 

                            <div style={styles.inputGroup}>  

 

                                <label style={styles.label}>Año de Fabricación</label>  

 

                                <select name="año_fabricacion"  

 

                                    value={prensaFormData.año_fabricacion}  

 

                                    onChange={handlePrensaInputChange}  

 

                                    onFocus={() => handleFocus('año_fabricacion')}  

 

                                    onBlur={handleBlur}  

 

                                    style={getSelectStyle('año_fabricacion')}  

 

                                >  

 

                                    {years.map(y => (  

 

                                        <option key={y} value={y}>{y}</option>  

 

                                    ))}  

 

                                </select>  

 

                            </div>  

 

                            <div style={styles.inputGroup}>  

 

                                <label style={styles.label}>Número de Serie</label>  

 

                                <input type="text"  

 

                                    name="numero_serie"  

 

                                    value={prensaFormData.numero_serie}  

 

                                    onChange={handlePrensaInputChange}  

 

                                    onFocus={() => handleFocus('numero_serie')}  

 

                                    onBlur={handleBlur}  

 

                                    style={getInputStyle('numero_serie')}  

 

                                    placeholder="Ej: SN-2024-001"  

 

                                    maxLength={100}  

 

                                />  

 

                            </div>  

 

                            <div style={styles.inputGroup}>  

 

                                <label style={styles.label}>Velocidad Máx. (SPM)</label>  

 

                                <input type="text"  

 

                                    name="velocidad_max"  

 

                                    value={prensaFormData.velocidad_max}  

 

                                    onChange={handlePrensaInputChange}  

 

                                    onFocus={() => handleFocus('velocidad_max')}  

 

                                    onBlur={handleBlur}  

 

                                    style={getInputStyle('velocidad_max')}  

 

                                    placeholder="Ej: 60"  

 

                                />  

 

                            </div>  

 

                            <div style={styles.inputGroup}>  

 

                                <label style={styles.label}>Carrera (mm)</label>  

 

                                <input type="text"  

 

                                    name="carrera"  

 

                                    value={prensaFormData.carrera}  

 

                                    onChange={handlePrensaInputChange}  

 

                                    onFocus={() => handleFocus('carrera')}  

 

                                    onBlur={handleBlur}  

 

                                    style={getInputStyle('carrera')}  

 

                                    placeholder="Ej: 300"  

 

                                />  

 

                            </div>  

 

                            <div style={styles.inputGroup}>  

 

                                <label style={styles.label}>Área de Trabajo (mm)</label>  

 

                                <input type="text"  

 

                                    name="area_trabajo"  

 

                                    value={prensaFormData.area_trabajo}  

 

                                    onChange={handlePrensaInputChange}  

 

                                    onFocus={() => handleFocus('area_trabajo')}  

 

                                    onBlur={handleBlur}  

 

                                    style={getInputStyle('area_trabajo')}  

 

                                    placeholder="Ej: 2000x1200"  

 

                                />  

 

                            </div>  

 

                        </div>  

 

                    </CollapsibleSection>  

 

  

 

                    {/* Mantenimiento */}  

 

                    <CollapsibleSection  

 

                        title="Mantenimiento"  

 

                        isExpanded={prensaExpandedSections.maintenance}  

 

                        onToggle={togglePrensaMaintenance}  

 

                    >  

 

                        <div style={styles.formGrid}>  

 

                            <div style={styles.inputGroup}>  

 

                                <label style={styles.label}>Fecha Último Mantenimiento</label>  

 

                                <input type="date"  

 

                                    name="fecha_ultimo_mantenimiento"  

 

                                    value={prensaFormData.fecha_ultimo_mantenimiento}  

 

                                    onChange={handlePrensaInputChange}  

 

                                    onFocus={() => handleFocus('fecha_ultimo_mantenimiento')}  

 

                                    onBlur={handleBlur}  

 

                                    style={getInputStyle('fecha_ultimo_mantenimiento')}  

 

                                />  

 

                            </div>  

 

                        </div>  

 

                    </CollapsibleSection>  

 

  

 

                    {/* Notas de prensa */}  

 

                    <CollapsibleSection  

 

                        title="Notas y Comentarios"  

 

                        isExpanded={prensaExpandedSections.notes}  

 

                        onToggle={togglePrensaNotes}  

 

                    >  

 

                        <div style={styles.formGrid}>  

 

                            <div style={{ ...styles.inputGroup, gridColumn: '1 / -1' }}>  

 

                                <label style={styles.label}>Notas Adicionales</label>  

 

                                <textarea  

 

                                    name="notas"  

 

                                    value={prensaFormData.notas}  

 

                                    onChange={handlePrensaInputChange}  

 

                                    onFocus={() => handleFocus('notas')}  

 

                                    onBlur={handleBlur}  

 

                                    style={{  

 

                                        ...styles.textarea,  

 

                                        borderColor: focusedField === 'notas' ? '#00ff88' : 'rgba(255, 255, 255, 0.1)',  

 

                                        boxShadow: focusedField === 'notas' ? '0 0 15px rgba(0, 255, 136, 0.2)' : 'none',  

 

                                    }}  

 

                                    placeholder="Información adicional sobre la prensa..."  

 

                                    rows={4}  

 

                                />  

 

                            </div>  

 

                        </div>  

 

                    </CollapsibleSection>  

 

  

 

                    {/* Botones de prensa */}  

 

                    <div style={styles.buttonGroup}>  

 

                        <button type="button" style={styles.btnSecondary}  

 

                            onClick={handlePrensaReset}  

 

                            onMouseEnter={(e) => {  

 

                                e.target.style.borderColor = '#aaa';  

 

                                e.target.style.color = '#fff';  

 

                            }}  

 

                            onMouseLeave={(e) => {  

 

                                e.target.style.borderColor = 'rgba(255, 255, 255, 0.15)';  

 

                                e.target.style.color = '#aaa';  

 

                            }}  

 

                        >  

 

                            {editingPrensa ? 'Cancelar Edición' : 'Limpiar Formulario'}  

 

                        </button>  

 

                        <button type="submit" style={styles.btnPrimary}  

 

                            disabled={isSubmitting}  

 

                            onMouseEnter={(e) => {  

 

                                if (!isSubmitting) {  

 

                                    e.target.style.transform = 'translateY(-2px)';  

 

                                    e.target.style.boxShadow = '0 6px 25px rgba(0, 255, 136, 0.35)';  

 

                                }  

 

                            }}  

 

                            onMouseLeave={(e) => {  

 

                                e.target.style.transform = 'translateY(0)';  

 

                                e.target.style.boxShadow = '0 4px 20px rgba(0, 255, 136, 0.25)';  

 

                            }}  

 

                        >  

 

                            {isSubmitting ? (  

 

                                <>  

 

                                    <div style={styles.loadingSpinner}/>  

 

                                    Guardando...  

 

                                </>  

 

                            ) : (  

 

                                editingPrensa ? 'Actualizar Prensa' : 'Registrar Prensa'  

 

                            )}  

 

                        </button>  

 

                    </div>  

 

                    </div>  

 

                </form>  

 

            )}  

 

  

 

            {/* ==================== PESTAÑA DE ADMINISTRACIÓN DE PRENSAS ==================== */}  

 

            {activeTab === 'prensas-manage' && (  

 

                <>  

 

                    {/* Tabla de prensas */}  

 

                    <div style={styles.tableContainer}>  

 

                        <div style={styles.tableHeader}>  

 

                            <div style={styles.tableTitle}>  

 

                                <span>🏭</span> Lista de Prensas  

 

                            </div>  

 

                            <div style={styles.tableControls}>  

 

                                <input  

 

                                    type="text"  

 

                                    placeholder="Buscar por ID o nombre..."  

 

                                    value={prensaSearchTerm}  

 

                                    onChange={(e) => setPrensaSearchTerm(e.target.value)}  

 

                                    style={styles.tableSearch}  

 

                                />  

 

                                <select  

 

                                    value={prensaFilterStatus}  

 

                                    onChange={(e) => setPrensaFilterStatus(e.target.value)}  

 

                                    style={styles.tableFilter}  

 

                                >  

 

                                    <option value="">Todos los estados</option>  

 

                                    {DEFAULT_PRESS_STATUS_OPTIONS.map(opt => (  

 

                                        <option key={opt.value} value={opt.value}>{opt.label}</option>  

 

                                    ))}  

 

                                </select>  

 

                            </div>  

 

                        </div>  

 

  

 

                        {prensasLoading ? (  

 

                            <div style={{ padding: '60px 20px', textAlign: 'center' }}>  

 

                                <div style={{  

 

                                    width: '40px',  

 

                                    height: '40px',  

 

                                    border: '3px solid rgba(0, 255, 136, 0.2)',  

 

                                    borderTopColor: '#00ff88',  

 

                                    borderRadius: '50%',  

 

                                    animation: 'spin 1s linear infinite',  

 

                                    margin: '0 auto 16px'  

 

                                }} />  

 

                                <p style={{ color: '#888' }}>Cargando prensas...</p>  

 

                            </div>  

 

                        ) : filteredPrensas.length === 0 ? (  

 

                            <div style={styles.emptyState}>  

 

                                <p style={styles.emptyText}>No se encontraron prensas</p>  

 

                                <p style={{ fontSize: '12px', color: '#666' }}>  

 

                                    {prensaSearchTerm ? 'Intente con otra búsqueda' : 'Registre una nueva prensa para comenzar'}  

 

                                </p>  

 

                            </div>  

 

                        ) : (  

 

                            <>  

 

                                <div style={{ overflowX: 'auto' }}>  

 

                                    <table style={styles.table}>  

 

                                        <thead>  

 

                                            <tr>  

 

                                                <th style={styles.th}>ID</th>  

 

                                                <th style={styles.th}>Nombre</th>  

 

                                                <th style={styles.th}>Marca</th>  

 

                                                <th style={styles.th}>Tonelaje</th>  

 

                                                <th style={styles.th}>Estado</th>  

 

                                                <th style={styles.th}>Ubicación</th>  

 

                                                <th style={styles.th}>Acciones</th>  

 

                                            </tr>  

 

                                        </thead>  

 

                                        <tbody>  

 

                                            {filteredPrensas.map((prensa) => (  

 

                                                <tr key={prensa.id_prensa}  

 

                                                    style={styles.tableRow}  

 

                                                    onMouseEnter={(e) => {  

 

                                                        e.currentTarget.style.background = 'rgba(0, 255, 136, 0.03)';  

 

                                                    }}  

 

                                                    onMouseLeave={(e) => {  

 

                                                        e.currentTarget.style.background = 'transparent';  

 

                                                    }}  

 

                                                >  

 

                                                    <td style={{ ...styles.td, color: '#00ff88', fontWeight: 600 }}>  

 

                                                        {prensa.identificador_prensa}  

 

                                                    </td>  

 

                                                    <td style={styles.td}>{prensa.nombre}</td>  

 

                                                    <td style={styles.td}>{prensa.marca || '-'}</td>  

 

                                                    <td style={styles.td}>{prensa.tonelaje || '-'}</td>  

 

                                                    <td style={styles.td}>  

 

                                                        <span style={{ ...styles.statusBadge, ...getPrensaStatusStyle(prensa.estado) }}>  

 

                                                            {prensa.estado}  

 

                                                        </span>  

 

                                                    </td>  

 

                                                    <td style={styles.td}>{prensa.ubicacion || '-'}</td>  

 

                                                    <td style={styles.td}>  

 

                                                        <button style={styles.actionBtn}  

 

                                                            onClick={() => handleEditPrensa(prensa)}  

 

                                                            onMouseEnter={(e) => {  

 

                                                                e.target.style.borderColor = '#00ff88';  

 

                                                                e.target.style.color = '#00ff88';  

 

                                                            }}  

 

                                                            onMouseLeave={(e) => {  

 

                                                                e.target.style.borderColor = 'rgba(255, 255, 255, 0.15)';  

 

                                                                e.target.style.color = '#aaa';  

 

                                                            }}  

 

                                                        >  

 

                                                            Editar  

 

                                                        </button>  

 

                                                        <button  

 

                                                            style={{ ...styles.actionBtn, color: '#ff6b6b' }}  

 

                                                            onClick={() => handleDeletePrensaClick(prensa)}  

 

                                                            onMouseEnter={(e) => {  

 

                                                                e.target.style.borderColor = '#ff6b6b';  

 

                                                                e.target.style.background = 'rgba(255, 107, 107, 0.1)';  

 

                                                            }}  

 

                                                            onMouseLeave={(e) => {  

 

                                                                e.target.style.borderColor = 'rgba(255, 255, 255, 0.15)';  

 

                                                                e.target.style.background = 'transparent';  

 

                                                            }}  

 

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

 

                                        Mostrando {filteredPrensas.length} de {prensas.length} prensas  

 

                                    </span>  

 

                                </div>  

 

                            </>  

 

                        )}  

 

                    </div>  

 

                </>  

 

            )}  

 

             

            {/* ==================== PESTAÑA DE MODELOS DE TROQUEL ==================== */} 

            {activeTab === 'modelos' && ( 

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '24px' }}> 

                    {/* Formulario de registro/edición */} 

                    <form onSubmit={handleModeloSubmit}> 

                        <div style={styles.formContainer}> 

                            <h3 style={{ 

                                color: '#00ff88', 

                                fontSize: '16px', 

                                fontWeight: 600, 

                                marginBottom: '20px', 

                                paddingBottom: '12px', 

                                borderBottom: '1px solid rgba(0, 255, 136, 0.2)', 

                                display: 'flex', 

                                alignItems: 'center', 

                                gap: '10px' 

                            }}> 

                                {editingModelo ? 'Editar Modelo' : 'Registrar Nuevo Modelo'} 

                            </h3> 
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}> 

                                <div style={styles.inputGroup}> 

                                    <label style={styles.label}> 

                                        Nombre del Modelo 

                                        <span style={styles.requiredStar}>*</span> 

                                    </label> 

                                    <input type="text" 

                                        name="nombre_modelo" 

                                        value={modeloFormData.nombre_modelo} 

                                        onChange={handleModeloInputChange} 

                                        onFocus={() => handleFocus('nombre_modelo')} 

                                        onBlur={handleBlur} 

                                        style={getInputStyle('nombre_modelo')} 

                                        placeholder="Ej: F180, G3-VSS, H2-PRO" 

                                        maxLength={100} 

                                    /> 

                                </div> 

                                 

                                <div style={styles.inputGroup}> 

                                    <label style={styles.label}> 

                                        Troquel Asociado 

                                        <span style={styles.requiredStar}>*</span> 

                                    </label> 

                                    <select name="troquel_id" 

                                        value={modeloFormData.troquel_id} 

                                        onChange={handleModeloInputChange} 

                                        onFocus={() => handleFocus('troquel_id')} 

                                        onBlur={handleBlur} 

                                        style={getSelectStyle('troquel_id')} 

                                    > 

                                        <option value="">Seleccione un troquel...</option> 

                                        {diesForModelos.map(die => { 

                                            const dieId = die.id || die.id_troquel; 

                                            const dieName = die.name || die.nombre; 

                                            return ( 

                                                <option key={dieId} value={dieId}> 

                                                    {dieId} - {dieName} 

                                                </option> 

                                            ); 

                                        })} 

                                    </select> 

                                </div> 

                                 

                                <div style={styles.inputGroup}> 

                                    <label style={styles.label}>Descripción (opcional)</label> 

                                    <textarea 

                                        name="descripcion" 

                                        value={modeloFormData.descripcion} 

                                        onChange={handleModeloInputChange} 

                                        onFocus={() => handleFocus('descripcion')} 

                                        onBlur={handleBlur} 

                                        style={{ 

                                            ...styles.textarea, 

                                            borderColor: focusedField === 'descripcion' ? '#00ff88' : 'rgba(255, 255, 255, 0.1)', 

                                            boxShadow: focusedField === 'descripcion' ? '0 0 15px rgba(0, 255, 136, 0.2)' : 'none', 

                                            minHeight: '60px', 

                                        }} 

                                        placeholder="Descripción adicional del modelo..." 

                                        rows={3} 

                                    /> 

                                </div> 

                            </div> 

                             

                            {/* Botones */} 

                            <div style={{ ...styles.buttonGroup, marginTop: '20px' }}> 

                                {editingModelo && ( 

                                    <button type="button" style={styles.btnSecondary} 

                                        onClick={handleModeloReset} 

                                        onMouseEnter={(e) => { 

                                            e.target.style.borderColor = '#aaa'; 

                                            e.target.style.color = '#fff'; 

                                        }} 

                                        onMouseLeave={(e) => { 

                                            e.target.style.borderColor = 'rgba(255, 255, 255, 0.15)'; 

                                            e.target.style.color = '#aaa'; 

                                        }} 

                                    > 

                                        Cancelar 

                                    </button> 

                                )} 

                                <button type="submit" style={styles.btnPrimary} 

                                    disabled={isSubmitting} 

                                    onMouseEnter={(e) => { 

                                        if (!isSubmitting) { 

                                            e.target.style.transform = 'translateY(-2px)'; 

                                            e.target.style.boxShadow = '0 6px 25px rgba(0, 255, 136, 0.35)'; 

                                        } 

                                    }} 

                                    onMouseLeave={(e) => { 

                                        e.target.style.transform = 'translateY(0)'; 

                                        e.target.style.boxShadow = '0 4px 20px rgba(0, 255, 136, 0.25)'; 

                                    }} 

                                > 

                                    {isSubmitting ? ( 

                                        <> 

                                            <div style={styles.loadingSpinner}/> 

                                            Guardando... 

                                        </> 

                                    ) : ( 

                                        editingModelo ? 'Actualizar Modelo' : 'Registrar Modelo' 

                                    )} 

                                </button> 

                            </div> 

                        </div> 

                    </form> 

                     

                    {/* Tabla de modelos */} 

                    <div style={styles.tableContainer}> 

                        <div style={styles.tableHeader}> 

                            <div style={styles.tableTitle}> 
                                Lista de Modelos 

                            </div> 

                            <div style={styles.tableControls}> 

                                <input 

                                    type="text" 

                                    placeholder="Buscar modelo..." 

                                    value={modeloSearchTerm} 

                                    onChange={(e) => setModeloSearchTerm(e.target.value)} 

                                    style={styles.tableSearch} 

                                /> 

                                <select 

                                    value={modeloFilterTroquel} 

                                    onChange={(e) => setModeloFilterTroquel(e.target.value)} 

                                    style={styles.tableFilter} 

                                > 

                                    <option value="">Todos los troqueles</option> 

                                    {diesForModelos.map(die => { 

                                        const dieId = die.id || die.id_troquel; 

                                        return ( 

                                            <option key={dieId} value={dieId}>{dieId}</option> 

                                        ); 

                                    })} 

                                </select> 

                            </div> 

                        </div> 

                         

                        {modelosLoading ? ( 

                            <div style={{ padding: '60px 20px', textAlign: 'center' }}> 

                                <div style={{ 

                                    width: '40px', 

                                    height: '40px', 

                                    border: '3px solid rgba(0, 255, 136, 0.2)', 

                                    borderTopColor: '#00ff88', 

                                    borderRadius: '50%', 

                                    animation: 'spin 1s linear infinite', 

                                    margin: '0 auto 16px' 

                                }} /> 

                                <p style={{ color: '#888' }}>Cargando modelos...</p> 

                            </div> 

                        ) : filteredModelos.length === 0 ? ( 

                            <div style={styles.emptyState}> 

                                <p style={styles.emptyText}>No se encontraron modelos</p> 

                                <p style={{ fontSize: '12px', color: '#666' }}> 

                                    {modeloSearchTerm ? 'Intente con otra búsqueda' : 'Registre un nuevo modelo para comenzar'} 

                                </p> 

                            </div> 

                        ) : ( 

                            <> 

                                <div style={{ overflowX: 'auto' }}> 

                                    <table style={styles.table}> 

                                        <thead> 

                                            <tr> 

                                                <th style={styles.th}>ID</th> 

                                                <th style={styles.th}>Nombre del Modelo</th> 

                                                <th style={styles.th}>Troquel</th> 

                                                <th style={styles.th}>Descripción</th> 

                                                <th style={styles.th}>Acciones</th> 

                                            </tr> 

                                        </thead> 

                                        <tbody> 

                                            {filteredModelos.map((modelo) => ( 

                                                <tr key={modelo.id_modelo} 

                                                    style={styles.tableRow} 

                                                    onMouseEnter={(e) => { 

                                                        e.currentTarget.style.background = 'rgba(0, 255, 136, 0.03)'; 

                                                    }} 

                                                    onMouseLeave={(e) => { 

                                                        e.currentTarget.style.background = 'transparent'; 

                                                    }} 

                                                > 

                                                    <td style={{ ...styles.td, color: '#888', fontSize: '12px' }}> 

                                                        {modelo.id_modelo} 

                                                    </td> 

                                                    <td style={{ ...styles.td, color: '#00ff88', fontWeight: 600 }}> 

                                                        {modelo.nombre_modelo} 

                                                    </td> 

                                                    <td style={styles.td}> 

                                                        <span style={{ 

                                                            background: 'rgba(0, 200, 255, 0.15)', 

                                                            color: '#00c8ff', 

                                                            padding: '4px 10px', 

                                                            borderRadius: '12px', 

                                                            fontSize: '11px', 

                                                            fontWeight: 600, 

                                                        }}> 

                                                            {modelo.troquel_id} 

                                                        </span> 

                                                    </td> 

                                                    <td style={{ ...styles.td, maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}> 

                                                        {modelo.descripcion || '-'} 

                                                    </td> 

                                                    <td style={styles.td}> 

                                                        <button style={styles.actionBtn} 

                                                            onClick={() => handleEditModelo(modelo)} 

                                                            onMouseEnter={(e) => { 

                                                                e.target.style.borderColor = '#00ff88'; 

                                                                e.target.style.color = '#00ff88'; 

                                                            }} 

                                                            onMouseLeave={(e) => { 

                                                                e.target.style.borderColor = 'rgba(255, 255, 255, 0.15)'; 

                                                                e.target.style.color = '#aaa'; 

                                                            }} 

                                                        > 

                                                            Editar 

                                                        </button> 

                                                        <button 

                                                            style={{ ...styles.actionBtn, color: '#ff6b6b' }} 

                                                            onClick={() => handleDeleteModeloClick(modelo)} 

                                                            onMouseEnter={(e) => { 

                                                                e.target.style.borderColor = '#ff6b6b'; 

                                                                e.target.style.background = 'rgba(255, 107, 107, 0.1)'; 

                                                            }} 

                                                            onMouseLeave={(e) => { 

                                                                e.target.style.borderColor = 'rgba(255, 255, 255, 0.15)'; 

                                                                e.target.style.background = 'transparent'; 

                                                            }} 

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

                                        Mostrando {filteredModelos.length} de {modelos.length} modelos 

                                    </span> 

                                </div> 

                            </> 

                        )} 

                    </div> 

                </div> 

            )} 

 

        </main>     

 

  

 

        {/* Modal de confirmación de eliminación de troquel */}     

 

        {showDeleteModal && (     

 

            <div style={styles.modalOverlay} onClick={() => setShowDeleteModal(false)}>     

 

                <div style={styles.modal} onClick={(e) => e.stopPropagation()}>     

 

                    <h2 style={styles.modalTitle}>Confirmar Eliminación</h2>     

 

                    <p style={styles.modalText}>     

 

                        ¿Está seguro de que desea eliminar el troquel{' '}     

 

                        <strong style={{ color: '#00ff88' }}>     

 

                            {dieToDelete?.id || dieToDelete?.id_troquel}     

 

                        </strong>{' '}     

 

                        ({dieToDelete?.name || dieToDelete?.nombre})?     

 

                        <br /><br />     

 

                        Esta acción no se puede deshacer.     

 

                    </p>     

 

                    <div style={styles.modalButtons}>     

 

                        <button style={styles.btnSecondary}     

 

                            onClick={() => setShowDeleteModal(false)}     

 

                        >     

 

                            Cancelar     

 

                        </button>     

 

                        <button style={styles.btnDanger}     

 

                            onClick={handleDeleteConfirm}     

 

                        >     

 

                            Eliminar Troquel     

 

                        </button>     

 

                    </div>     

 

                </div>     

 

            </div>     

 

        )}     

 

  

 

        {/* Modal de confirmación de eliminación de prensa */}  

 

        {showDeletePrensaModal && (  

 

            <div style={styles.modalOverlay} onClick={() => setShowDeletePrensaModal(false)}>  

 

                <div style={styles.modal} onClick={(e) => e.stopPropagation()}>  

 

                    <h2 style={styles.modalTitle}>Confirmar Eliminación</h2>  

 

                    <p style={styles.modalText}>  

 

                        ¿Está seguro de que desea eliminar la prensa{' '}  

 

                        <strong style={{ color: '#00ff88' }}>  

 

                            {prensaToDelete?.identificador_prensa}  

 

                        </strong>{' '}  

 

                        ({prensaToDelete?.nombre})?  

 

                        <br /><br />  

 

                        Esta acción no se puede deshacer y puede afectar los troqueles asignados a esta prensa.  

 

                    </p>  

 

                    <div style={styles.modalButtons}>  

 

                        <button style={styles.btnSecondary}  

 

                            onClick={() => setShowDeletePrensaModal(false)}  

 

                        >  

 

                            Cancelar  

 

                        </button>  

 

                        <button style={styles.btnDanger}  

 

                            onClick={handleDeletePrensaConfirm}  

 

                        >  

 

                            Eliminar Prensa  

 

                        </button>  

 

                    </div>  

 

                </div>  

 

            </div>  

 

        )}  

 

         

        {/* Modal de confirmación de eliminación de modelo */} 

        {showDeleteModeloModal && ( 

            <div style={styles.modalOverlay} onClick={() => setShowDeleteModeloModal(false)}> 

                <div style={styles.modal} onClick={(e) => e.stopPropagation()}> 

                    <h2 style={styles.modalTitle}>Confirmar Eliminación</h2> 

                    <p style={styles.modalText}> 

                        ¿Está seguro de que desea eliminar el modelo{' '} 

                        <strong style={{ color: '#00ff88' }}> 

                            {modeloToDelete?.nombre_modelo} 

                        </strong> 

                        {' '}del troquel{' '} 

                        <strong style={{ color: '#00c8ff' }}> 

                            {modeloToDelete?.troquel_id} 

                        </strong>? 

                        <br /><br /> 

                        Esta acción no se puede deshacer. 

                    </p> 

                    <div style={styles.modalButtons}> 

                        <button style={styles.btnSecondary} 

                            onClick={() => setShowDeleteModeloModal(false)} 

                        > 

                            Cancelar 

                        </button> 

                        <button style={styles.btnDanger} 

                            onClick={handleDeleteModeloConfirm} 

                        > 

                            Eliminar Modelo 

                        </button> 

                    </div> 

                </div> 

            </div> 

        )} 

 

        {/* Animación CSS */}     

 

        <style>{cssAnimations}</style>     

 

        </div>     

 

    );     

 

};     

 

  

 

export default AdminDieRegistration; 

 
