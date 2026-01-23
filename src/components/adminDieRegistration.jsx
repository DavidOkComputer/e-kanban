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
	tipo_troquel: formData.tipo_troquel || 'progresivo', 
	ubicacion: formData.ubicacion || null, 
	prensa_asignada: formData.prensa_asignada || null, 
	numero_serie: formData.numero_serie || null, 
	proveedor: formData.proveedor || null, 
	peso_kg: formData.peso_kg || null, 
	dimensiones: formData.dimensiones || null, 
	material_base: formData.material_base || null, 
	num_estaciones: formData.num_estaciones || null, 
	vida_util_estimada: formData.vida_util_estimada || null, 
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
	tipo_troquel: apiData.tipo_troquel || 'progresivo', 
	ubicacion: apiData.ubicacion || '', 
	prensa_asignada: apiData.prensa_asignada || '', 
	numero_serie: apiData.numero_serie || '', 
	proveedor: apiData.proveedor || '', 
	peso_kg: apiData.peso_kg || '', 
	dimensiones: apiData.dimensiones || '', 
	material_base: apiData.material_base || '', 
	num_estaciones: apiData.num_estaciones || '', 
	vida_util_estimada: apiData.vida_util_estimada || '', 
	notes: apiData.notes || apiData.comentarios || '', 
	image_url: apiData.image_url || '', 
	cliente: apiData.cliente || '', 
	fecha_fabricacion: apiData.fecha_fabricacion || '', 
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
	{ value: 'progresivo', label: 'Progresivo' }, 
	{ value: 'transfer', label: 'Transfer' }, 
	{ value: 'compound', label: 'Compound' }, 
	{ value: 'simple', label: 'Simple' }, 
]; 

const DEFAULT_STATUS_OPTIONS = [ 
	{ value: 'Pendiente', label: 'Pendiente' }, 
	{ value: 'En prensa', label: 'En Prensa' }, 
	{ value: 'Listo', label: 'Listo' }, 
	{ value: 'Listo-BackUp', label: 'Listo - BackUp' }, 
	{ value: 'Reparando', label: 'Reparando' }, 
	{ value: 'Baja', label: 'Baja / Obsoleto' }, 
]; 

// Componente de sección colapsable 
const CollapsibleSection = ({ title, icon, isExpanded, onToggle, children, isRequired }) => { 
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
			<div style={sectionStyles.header} onClick={onToggle} onMouseEnter={(e) => { 
				if (!isExpanded) {e.currentTarget.style.background = 'rgba(0, 255, 136, 0.05)';} 
				}} 
				onMouseLeave={(e) => { if (!isExpanded) {e.currentTarget.style.background = 'transparent';} 
				}} 
			> 
				<div style={sectionStyles.headerLeft}> 
					<div style={sectionStyles.icon}>{icon}</div> 
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
}; 

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
		image: false, 
		notes: false, 
	}); 

	// Estado para opciones de dropdowns (cargadas desde la base de datos) 
	const [pressOptions, setPressOptions] = useState(DEFAULT_PRESS_OPTIONS); 
	const [dieTypeOptions, setDieTypeOptions] = useState(DEFAULT_DIE_TYPE_OPTIONS); 
	const [statusOptions, setStatusOptions] = useState(DEFAULT_STATUS_OPTIONS); 
	const [optionsLoading, setOptionsLoading] = useState(true); 

	// Estado del formulario 
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
		tipo_troquel: 'progresivo', 
		ubicacion: '', 
		proveedor: '', 
		peso_kg: '', 
		dimensiones: '', 
		material_base: '', 
		num_estaciones: '', 
		vida_util_estimada: '', 
		numero_serie: '', 
		fecha_fabricacion: '', 
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

	// Toggle para secciones colapsables 
	const toggleSection = useCallback((sectionKey) => {setExpandedSections(prev => ({ ...prev, [sectionKey]: !prev[sectionKey] })); }, []); 

	// Expandir todas las secciones 
	const expandAllSections = useCallback(() => { 
		setExpandedSections({ 
			basicInfo: true, 
			production: true, 
			technical: true, 
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
			image: false, 
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
				if (prensasResponse.ok) 
					{ 
						const prensasData = await prensasResponse.json(); 
						if (Array.isArray(prensasData) && prensasData.length > 0) 
							{
								setPressOptions(prensasData);
							} 
					}	 
				
				// Fetch tipos de troquel 
				const tiposResponse = await fetch(`${API_BASE}/tipos_troquel.php`, {credentials: 'include',}); 
					if (tiposResponse.ok) 
					{ 
						const tiposData = await tiposResponse.json(); 
						if (Array.isArray(tiposData) && tiposData.length > 0) 
							{ 
								setDieTypeOptions(tiposData); 
							} 
					} 
				
				// Fetch estados 
				const estadosResponse = await fetch(`${API_BASE}/estados.php`, {credentials: 'include',}); 
				if (estadosResponse.ok) 
					{ 
						const estadosData = await estadosResponse.json(); 
						if (Array.isArray(estadosData) && estadosData.length > 0) 
							{ 
								setStatusOptions(estadosData); 
							} 
					} 
			} 
			catch (error) 
				{ 
					console.error('Error fetching dropdown options:', error); 
				} 
			finally 
				{ 
					setOptionsLoading(false); 
				} 
		}; 
		fetchDropdownOptions(); 
	}, []); 

	// Obtener troqueles cuando se cambia a pestaña de administración 
	useEffect(() => { 
		if (activeTab === 'manage') 
			{ 
				fetchDies(); 
			} 
	}, [activeTab, filterYear, filterStatus]); 

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
					Object.keys(data).forEach(year => { 
						if (Array.isArray(data[year])) { 
							data[year].forEach(item => { 
								flattened.push({ 
									...item, 
									id_troquel: item.id || item.id_troquel, 
									nombre: item.name || item.nombre, 
									estado: item.status || item.estado, 
									año: item.year || year, 
									modelo: item.model || item.modelo, 
								}); 
							}); 
						} 
					}); 
					return flattened; 
				} 
				return []; 
			}; 

			if (response.ok) { 
				const data = await response.json(); 
				const diesArray = handleResponse(data); 
				setDies(diesArray); 
				setStats({ 
					total: diesArray.length, 
					activos: diesArray.filter(d => 
						d.status === 'En prensa' || d.estado === 'En prensa' || 
						d.status === 'Listo' || d.estado === 'Listo' 
					).length, 

					reparando: diesArray.filter(d => d.status === 'Reparando' || d.estado === 'Reparando').length, 
						pendientes: diesArray.filter(d => 
						d.status === 'Pendiente' || d.estado === 'Pendiente' 
					).length, 
				}); 
			} 
			else { 
				const errorData = await response.json().catch(() => ({})); 
				console.error('Error response:', errorData); 
				setMessage({ type: 'error', text: errorData.message || 'Error al cargar troqueles' }); 
			} 
		} catch (error) { 
			console.error('Error fetching dies:', error); 
			setMessage({ type: 'error', text: 'Error de conexión al servidor' }); 
		} finally { 
			setIsLoading(false); 
		} 
	}; 

	const handleInputChange = useCallback((e) => { 
		const { name, value } = e.target; 
		setFormData(prev => ({...prev, [name]: value })); 
	}, []); 

	const handleImageUrlChange = useCallback((e) => { 
		const url = e.target.value; 
		setFormData(prev => ({...prev, image_url: url })); 
		setImagePreview(url || null); 
	}, []); 

	const handleImageUpload = useCallback((e) => { 
		const file = e.target.files[0]; 
			if (file) { 
				const reader = new FileReader(); 
				reader.onloadend = () => { 
					setImagePreview(reader.result); 
					setFormData(prev => ({...prev,image_url: reader.result})); 
				}; 
				reader.readAsDataURL(file); 
			} 
	}, []); 

	const removeImage = useCallback(() => { 
		setImagePreview(null); 
			setFormData(prev => ({...prev, image_url: ''})); 
	}, []); 

	const validateForm = useCallback(() => { 
		if (!formData.id.trim()) return 'El ID del troquel es requerido'; 
		if (!formData.name.trim()) return 'El nombre del troquel es requerido'; 
		if (!formData.year) return 'El año es requerido'; 
		return null; 
	}, [formData]); 

	const handleSubmit = useCallback(async (e) => { 
		e.preventDefault(); 
		const validationError = validateForm(); 
			if (validationError) { 
				setMessage({ type: 'error', text: validationError }); 
				// Expandir la sección básica si hay error de validación 
				setExpandedSections(prev => ({ ...prev, basicInfo: true })); 
				return; 
			} 
		setIsSubmitting(true); 
		setMessage({ type: '', text: '' }); 

		try { 
			const isEditing = !!editingDie; 
			const troquelId = formData.id.trim().toUpperCase(); 
			const url = isEditing 
			? `${API_BASE}/troqueles.php/${encodeURIComponent(editingDie.id || editingDie.id_troquel)}` 
			: `${API_BASE}/troqueles.php`; 
			const method = isEditing ? 'PUT' : 'POST'; 
			const apiData = mapFormToApi(formData); 
			console.log('Sending data to API:', apiData); 
			
			const response = await fetch(url, { 
				method, headers: { 'Content-Type': 'application/json',}, 
				credentials: 'include', body: JSON.stringify(apiData),}); 
			const responseData = await response.json(); 
			if (!response.ok) { 
				throw new Error(responseData.message || 'Error al procesar el troquel'); 
			} 
			const actionText = isEditing ? 'actualizado' : 'registrado'; 
			setMessage({ type: 'success', text: `¡Troquel ${troquelId} ${actionText} exitosamente!` }); 
			handleReset(); 
			setEditingDie(null); 
			
			if (activeTab === 'manage') {fetchDies();} 

		} catch (error) { 
			console.error('Error submitting form:', error); 
			setMessage({ type: 'error', text: error.message || 'Error al procesar el troquel.' }); 
		} finally { 
			setIsSubmitting(false); 
		} 
	}, [formData, validateForm, editingDie, activeTab]); 

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
			cliente: '', 
			prensa_asignada: '', 
			tipo_troquel: 'progresivo', 
			ubicacion: '', 
			numero_serie: '', 
			proveedor: '', 
			fecha_fabricacion: '', 
			peso_kg: '', 
			dimensiones: '', 
			material_base: '', 
			num_estaciones: '', 
			vida_util_estimada: '', 
		}); 

		setImagePreview(null); 
		setMessage({ type: '', text: '' }); 
		setEditingDie(null); 

		// Resetear secciones colapsables 
		collapseAllSections(); 
	}, [collapseAllSections]); 

	const handleEdit = useCallback((die) => { 
		setEditingDie(die); 
		const mappedData = mapApiToForm(die); 
		setFormData(mappedData); 
		setImagePreview(die.image_url || null); 
		setActiveTab('register'); 
		setMessage({ type: '', text: '' }); 

		// Expandir todas las secciones al editar 
		expandAllSections(); 
	}, [expandAllSections]); 

	const handleDeleteClick = useCallback((die) => { 
		setDieToDelete(die); 
		setShowDeleteModal(true); 
	}, []); 

	const handleDeleteConfirm = useCallback(async () => { 
		if (!dieToDelete) return; 
		try { 
			const dieId = dieToDelete.id || dieToDelete.id_troquel; 
			const response = await fetch(`${API_BASE}/troqueles.php/${encodeURIComponent(dieId)}`, { 
				method: 'DELETE', 
				credentials: 'include', 
			}); 

			const responseData = await response.json(); 

			if (response.ok && responseData.success !== false) { 
				setMessage({ type: 'success', text: `Troquel ${dieId} eliminado correctamente` }); 
				fetchDies(); 
			} else { 
				throw new Error(responseData.message || 'Error al eliminar'); 
			} 
		} catch (error) { 
			console.error('Error deleting die:', error); 
			setMessage({ type: 'error', text: error.message || 'Error al eliminar el troquel' }); 
		} finally { 
			setShowDeleteModal(false); 
			setDieToDelete(null); 
		} 
	}, [dieToDelete]); 

	const filteredDies = useMemo(() => { 
		return dies.filter(die => { 
			const dieId = (die.id || die.id_troquel || '').toLowerCase(); 
			const dieName = (die.name || die.nombre || '').toLowerCase(); 
			const dieModel = (die.model || die.modelo || '').toLowerCase(); 
			const search = searchTerm.toLowerCase(); 
			const matchesSearch = !searchTerm || 
				dieId.includes(search) || 
				dieName.includes(search) || 
				dieModel.includes(search); 
			return matchesSearch; 
		}); 
	}, [dies, searchTerm]); 

	const getInputStyle = useCallback((fieldName, disabled = false) => { 
		const baseStyle = { ...styles.input, ...(disabled ? styles.inputDisabled : {}),}; 

		if (focusedField === fieldName) { 
			return { ...baseStyle, 
				borderColor: '#00ff88', 
				borderWidth: '1px', 
				borderStyle: 'solid', 
				boxShadow: '0 0 15px rgba(0, 255, 136, 0.2)', 
			}; 
		} 
		return baseStyle; 
	}, [focusedField, styles]); 

	const getSelectStyle = useCallback((fieldName) => { 
		const baseStyle = styles.select; 

		if (focusedField === fieldName) { 
			return { 
				...baseStyle, 
				borderColor: '#00ff88', 
				borderWidth: '1px', 
				borderStyle: 'solid', 
				boxShadow: '0 0 15px rgba(0, 255, 136, 0.2)', 
			}; 
		} 
		return baseStyle; 
	}, [focusedField, styles]); 

	// Estilos adicionales para controles de secciones 
	const sectionControlStyles = { 
		container: { 
			display: 'flex', 
			justifyContent: 'flex-end', 
			gap: '8px', 
			marginBottom: '16px', 
		}, 
		button: { 
			background: 'transparent', 
			border: '1px solid rgba(0, 255, 136, 0.3)', 
			borderRadius: '6px', 
			padding: '6px 12px', 
			fontSize: '11px', 
			color: '#00ff88', 
			cursor: 'pointer', 
			transition: 'all 0.2s ease', 
			display: 'flex', 
			alignItems: 'center', 
			gap: '6px', 
		}, 
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
							Gestión de Troqueles 
						</h1> 
						<p style={styles.pageSubtitle}> 
							Registre, administre y monitoree todos los troqueles del sistema 
						</p> 
					</div> 

					{/* Navegación entre pestañas */} 
					<div style={styles.tabsContainer}> 
						<button 
							style={{ ...styles.tab, ...(activeTab === 'register' ? styles.tabActive : {}) }} 
							onClick={() => { setActiveTab('register'); setEditingDie(null); handleReset(); }} 
						> 
							{editingDie ? 'Editar Troquel' : 'Nuevo Registro'} 
						</button> 
						<button 
							style={{ ...styles.tab, ...(activeTab === 'manage' ? styles.tabActive : {}) }} 
							onClick={() => setActiveTab('manage')} 
						> 
							Administrar Troqueles 
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

					{/* Pestaña de registro */} 
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
							onToggle={() => toggleSection('basicInfo')} 
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
											onFocus={() => setFocusedField('id')} 
											onBlur={() => setFocusedField(null)} 
											style={getInputStyle('id', !!editingDie)} 
											placeholder="Ej: T001" 
											maxLength={10} 
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
											onFocus={() => setFocusedField('name')} 
											onBlur={() => setFocusedField(null)} 
											style={getInputStyle('name')} 
											placeholder="Ej: Alpha" 
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
											onFocus={() => setFocusedField('year')} 
											onBlur={() => setFocusedField(null)} 
											style={getSelectStyle('year')} 
									> 
										{years.map(year => (<option key={year} value={year}>{year}</option> ))} 
									</select> 
								</div> 
								<div style={styles.inputGroup}> 
									<label style={styles.label}>Estado</label> 
										<select name="status" 
												value={formData.status} 
												onChange={handleInputChange} 
												onFocus={() => setFocusedField('status')} 
												onBlur={() => setFocusedField(null)} 
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
								<div style={{ ...styles.inputGroup, ...styles.twoColumns }}> 
									<label style={styles.label}>Modelo / Número de Parte</label> 
									<input type="text" 
											name="model" 
											value={formData.model} 
											onChange={handleInputChange} 
											onFocus={() => setFocusedField('model')} 
											onBlur={() => setFocusedField(null)} 
											style={getInputStyle('model')} 
											placeholder="Ej: G3-VSS - G3-VSS" 
									/> 
								</div> 
								<div style={styles.inputGroup}> 
									<label style={styles.label}>Tipo de Troquel</label> 
									<select name="tipo_troquel" 
											value={formData.tipo_troquel} 
											onChange={handleInputChange} 
											onFocus={() => setFocusedField('tipo_troquel')} 
											onBlur={() => setFocusedField(null)} 
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
							</div> 
						</CollapsibleSection> 
						{/* Métricas de producción */} 
						<CollapsibleSection 
							title="Métricas de Producción" 
							isExpanded={expandedSections.production} 
							onToggle={() => toggleSection('production')} 
						> 
							<div style={styles.formGrid}> 
								<div style={styles.inputGroup}> 
									<label style={styles.label}>Golpes Actuales</label> 
										<input type="text" 
												name="golpes" 
												value={formData.golpes} 
												onChange={handleInputChange} 
												onFocus={() => setFocusedField('golpes')} 
												onBlur={() => setFocusedField(null)} 
												style={getInputStyle('golpes')} 
												placeholder="Ej: 257,540" 
										/> 
								</div> 
								<div style={styles.inputGroup}> 
									<label style={styles.label}>Golpes Acumulados</label> 
										<input type="text" 
												name="golpes_acum" 
												value={formData.golpes_acum} 
												onChange={handleInputChange} 
												onFocus={() => setFocusedField('golpes_acum')} 
												onBlur={() => setFocusedField(null)} 
												style={getInputStyle('golpes_acum')} 
												placeholder="Ej: 121,442,752" 
										/> 
								</div> 
								<div style={styles.inputGroup}> 
									<label style={styles.label}>Capacidad de Golpes</label> 
										<input type="text" 
												name="capacidad_golpes" 
												value={formData.capacidad_golpes} 
												onChange={handleInputChange} 
												onFocus={() => setFocusedField('capacidad_golpes')} 
												onBlur={() => setFocusedField(null)} 
												style={getInputStyle('capacidad_golpes')} 
												placeholder="Ej: 250,000,000" 
										/> 
								</div> 
								<div style={styles.inputGroup}> 
									<label style={styles.label}>Vida Útil Estimada</label> 
										<input type="text" 
												name="vida_util_estimada" 
												value={formData.vida_util_estimada} 
												onChange={handleInputChange} 
												onFocus={() => setFocusedField('vida_util_estimada')} 
												onBlur={() => setFocusedField(null)} 
												style={getInputStyle('vida_util_estimada')} 
												placeholder="Ej: 5 años" 
										/> 
								</div> 
								<div style={styles.inputGroup}> 
									<label style={styles.label}>Rectificaciones</label> 
										<input type="text" 
												name="rectificaciones" 
												value={formData.rectificaciones} 
												onChange={handleInputChange} 
												onFocus={() => setFocusedField('rectificaciones')} 
												onBlur={() => setFocusedField(null)} 
												style={getInputStyle('rectificaciones')} 
												placeholder="Ej: 15 - (28/10/2025)" 
										/> 
								</div> 
								<div style={styles.inputGroup}> 
									<label style={styles.label}>Número de Estaciones</label> 
										<input type="text" 
												name="num_estaciones" 
												value={formData.num_estaciones} 
												onChange={handleInputChange} 
												onFocus={() => setFocusedField('num_estaciones')} 
												onBlur={() => setFocusedField(null)} 
												style={getInputStyle('num_estaciones')} 
												placeholder="Ej: 12" 
										/> 
								</div> 
								<div style={styles.inputGroup}> 
									<label style={styles.label}>Prensa Asignada</label> 
										<select name="prensa_asignada" 
												value={formData.prensa_asignada} 
												onChange={handleInputChange} 
												onFocus={() => setFocusedField('prensa_asignada')} 
												onBlur={() => setFocusedField(null)} 
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
									<label style={styles.label}>Ubicación Actual</label> 
										<input type="text" 
												name="ubicacion" 
												value={formData.ubicacion} 
												onChange={handleInputChange} 
												onFocus={() => setFocusedField('ubicacion')} 
												onBlur={() => setFocusedField(null)} 
												style={getInputStyle('ubicacion')} 
												placeholder="Ej: Rack A-12" 
										/> 
								</div> 
							</div> 
						</CollapsibleSection> 
						
						{/* Detalles técnicos */} 
						<CollapsibleSection title="Detalles Técnicos" 
											isExpanded={expandedSections.technical} 
											onToggle={() => toggleSection('technical')} 
						> 
							<div style={styles.formGrid}> 
								<div style={styles.inputGroup}> 
									<label style={styles.label}>Número de Serie</label> 
									<input type="text" 
											name="numero_serie" 
											value={formData.numero_serie} 
											onChange={handleInputChange} 
											onFocus={() => setFocusedField('numero_serie')} 
											onBlur={() => setFocusedField(null)} 
											style={getInputStyle('numero_serie')} 
											placeholder="Ej: SN-2024-00123" 
									/> 
								</div> 

								<div style={styles.inputGroup}> 
									<label style={styles.label}>Proveedor / Fabricante</label> 
									<input type="text" 
											name="proveedor" 
											value={formData.proveedor} 
											onChange={handleInputChange} 
											onFocus={() => setFocusedField('proveedor')} 
											onBlur={() => setFocusedField(null)} 
											style={getInputStyle('proveedor')} 
											placeholder="Ej: Troqueles MX S.A." 
									/> 
								</div> 
								<div style={styles.inputGroup}> 
									<label style={styles.label}>Fecha de Fabricación</label> 
									<input type="date" 
											name="fecha_fabricacion" 
											value={formData.fecha_fabricacion} 
											onChange={handleInputChange} 
											onFocus={() => setFocusedField('fecha_fabricacion')} 
											onBlur={() => setFocusedField(null)} 
											style={getInputStyle('fecha_fabricacion')} 
									/> 
								</div> 
								<div style={styles.inputGroup}> 
									<label style={styles.label}>Peso (kg)</label> 
									<input type="text" 
											name="peso_kg" 
											value={formData.peso_kg} 
											onChange={handleInputChange} 
											onFocus={() => setFocusedField('peso_kg')} 
											onBlur={() => setFocusedField(null)} 
											style={getInputStyle('peso_kg')} 
											placeholder="Ej: 1,250" 
									/> 
								</div> 
								<div style={styles.inputGroup}> 
									<label style={styles.label}>Dimensiones (L x A x H)</label> 
									<input type="text" 
											name="dimensiones" 
											value={formData.dimensiones} 
											onChange={handleInputChange} 
											onFocus={() => setFocusedField('dimensiones')} 
											onBlur={() => setFocusedField(null)} 
											style={getInputStyle('dimensiones')} 
											placeholder="Ej: 1200 x 800 x 600 mm" 
									/> 
								</div> 
								<div style={styles.inputGroup}> 
									<label style={styles.label}>Material Base</label> 
									<input type="text" 
											name="material_base" 
											value={formData.material_base} 
											onChange={handleInputChange} 
											onFocus={() => setFocusedField('material_base')} 
											onBlur={() => setFocusedField(null)} 
											style={getInputStyle('material_base')} 
											placeholder="Ej: Acero D2, SKD11" 
									/> 
								</div> 
							</div> 
						</CollapsibleSection> 

						{/* Sección para la imagen */} 
						<CollapsibleSection title="Imagen del Troquel" 
											isExpanded={expandedSections.image} 
											onToggle={() => toggleSection('image')} 
						> 
							<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}> 
								<div style={styles.inputGroup}> 
									<label style={styles.label}>URL de la Imagen</label> 
										<input type="text" 
												name="image_url" 
												value={formData.image_url} 
												onChange={handleImageUrlChange} 
												onFocus={() => setFocusedField('image_url')} 
												onBlur={() => setFocusedField(null)} 
												style={getInputStyle('image_url')} 
												placeholder="https://ejemplo.com/imagen.jpg" 
										/> 
								</div> 
								<div style={styles.inputGroup}> 
									{imagePreview ? ( 
										<div style={styles.imagePreview}> 
											<img src={imagePreview} 
												alt="Preview" 
												style={styles.imagePreviewImg} 
												onError={() => setImagePreview(null)} 
											/> 
											<button type="button" 
												style={styles.imageRemoveBtn} 
												onClick={removeImage} 
											> 
												✕ 
											</button> 
										</div> 
									) : ( 
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
											<input type="file" 
													accept="image/*" 
													onChange={handleImageUpload} 
													style={{ display: 'none' }} 
											/>	 
											<p style={styles.imageUploadText}>Click para subir imagen</p> 
											<p style={styles.imageUploadHint}>O ingrese una URL</p> 
										</label> 
									)} 
								</div> 
							</div> 
						</CollapsibleSection> 

						{/* Sección de notas */} 
						<CollapsibleSection title="Observaciones" 
											isExpanded={expandedSections.notes} 
											onToggle={() => toggleSection('notes')} 
						> 
							<div style={styles.inputGroup}> 
								<label style={styles.label}>Notas Adicionales (Opcional)</label> 
								<textarea name="notes" 
											value={formData.notes} 
											onChange={handleInputChange} 
											onFocus={() => setFocusedField('notes')} 
											onBlur={() => setFocusedField(null)} 
											style={{...styles.textarea, ...(focusedField === 'notes' ? styles.inputFocus : {}),}} 
											placeholder="Ingrese cualquier observación adicional sobre el troquel..." 
								/> 
							</div> 
						</CollapsibleSection> 

						{/* Botones de acción */} 
						<div style={styles.buttonGroup}> 
							<button type="button" 
									style={styles.btnSecondary} 
									onClick={handleReset} 
									onMouseEnter={(e) => { 
										e.target.style.borderColor = '#888'; 
										e.target.style.color = '#fff'; 
									}} 
									onMouseLeave={(e) => { 
										e.target.style.borderColor = 'rgba(255, 255, 255, 0.15)'; 
										e.target.style.color = '#aaa'; 
									}} 
							> 
								{editingDie ? 'Cancelar Edición' : 'Limpiar Formulario'} 
							</button> 
							<button type="submit" 
									style={{ 
										...styles.btnPrimary, 
										opacity: isSubmitting ? 0.7 : 1, 
										cursor: isSubmitting ? 'not-allowed' : 'pointer', 
									}} 
									disabled={isSubmitting} 
									onMouseEnter={(e) => { 
										if (!isSubmitting) { 
											e.target.style.transform = 'translateY(-2px)'; 
											e.target.style.boxShadow = '0 8px 30px rgba(0, 255, 136, 0.4)'; 
										} 
									}} 
									onMouseLeave={(e) => { 
										e.target.style.transform = 'translateY(0)'; 
										e.target.style.boxShadow = '0 4px 20px rgba(0, 255, 136, 0.25)'; 
									}} 
							> 	
								{isSubmitting ? ( 
									<> 
										<span style={styles.loadingSpinner} />	Procesando... 
									</> 
								) : ( 
									<> 
										✓ {editingDie ? 'Actualizar Troquel' : 'Registrar Troquel'} 
									</> 
								)} 
							</button> 
						</div> 
					</div> 
					</form> 
					)} 

					{/* Página de administración */} 
					{activeTab === 'manage' && ( 
					<> 
						{/* Fila con estadísticas */} 
						<div style={styles.statsRow}> 
							<div style={styles.statCard}> 
								<div> 
									<div style={styles.statValue}>{stats.total}</div> 
									<div style={styles.statLabel}>Total Troqueles</div> 
								</div> 
							</div> 
							<div style={styles.statCard}> 
								<div> 
									<div style={{ ...styles.statValue, color: '#64ff64' }}>{stats.activos}</div> 
									<div style={styles.statLabel}>Activos</div> 
								</div> 
							</div> 
							<div style={styles.statCard}> 
								<div> 
									<div style={{ ...styles.statValue, color: '#ffc800' }}>{stats.reparando}</div> 
									<div style={styles.statLabel}>En Reparación</div> 
								</div> 
							</div> 
							<div style={styles.statCard}> 
								<div> 
									<div style={{ ...styles.statValue, color: '#ff6b6b' }}>{stats.pendientes}</div> 
									<div style={styles.statLabel}>Pendientes</div> 
								</div> 
							</div> 
						</div> 

						{/* Tabla */} 
						<div style={styles.tableContainer}> 
							<div style={styles.tableHeader}> 
								<div style={styles.tableTitle}> 
									Lista de Troqueles Registrados 
								</div> 
								<div style={styles.tableControls}> 
									<select value={filterYear} 
										onChange={(e) => setFilterYear(e.target.value)} 
										style={{ ...styles.tableFilter, width: '130px' }} 
									> 
										<option value="">Todos los años</option> 
										{years.slice(0, 10).map(year => ( <option key={year} value={year}>{year}</option> ))} 
									</select> 
									<select value={filterStatus} 
											onChange={(e) => setFilterStatus(e.target.value)} 
											style={{ ...styles.tableFilter, width: '150px' }} 
									> 
										<option value="">Todos los estados</option> 
										{statusOptions.map(opt => ( 
											<option key={opt.value} value={opt.value}> 
													{opt.label} 
											</option> 
										))} 
									</select> 
									<input type="text" 
											placeholder="Buscar troquel..." 
											value={searchTerm} 
											onChange={(e) => setSearchTerm(e.target.value)} 
											style={styles.tableSearch} 
									/> 
									<button style={{ ...styles.btnPrimary, padding: '10px 20px', fontSize: '13px' }} 
											onClick={fetchDies} 
									> 
										Actualizar 
									</button> 
								</div> 
							</div> 
							{isLoading ? ( 
								<div style={{ textAlign: 'center', padding: '60px' }}> 
									<div style={{ ...styles.loadingSpinner, 
													width: '40px', 
													height: '40px', 
													borderWidth: '3px', 
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
			</main> 

			{/* Modal de confirmación de eliminación */} 
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

			{/* Animación CSS */} 
			<style>{cssAnimations}</style> 
		</div> 
	); 
}; 

export default AdminDieRegistration; 