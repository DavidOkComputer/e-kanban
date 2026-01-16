import React, { useState, useCallback, useMemo, useEffect, memo } from 'react'; 

import createStyles, { 
  getStatusStyle, 
  generateYears, 
  PRESS_OPTIONS, 
  DIE_TYPE_OPTIONS, 
  CLIENT_OPTIONS, 
  cssAnimations 
} from '../styles/adminDieRegistration.styles'; 

const API_BASE = 'http://localhost:3001/api'; 

const AdminDieRegistration = ({ onNavigateBack, user }) => { 
  const styles = useMemo(() => createStyles(), []); 
  const years = useMemo(() => generateYears(), []); 

  // Tab state 
  const [activeTab, setActiveTab] = useState('register'); 

  // Form state
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
    // Additional fields 
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
 
  const [focusedField, setFocusedField] = useState(null); 
  const [isSubmitting, setIsSubmitting] = useState(false); 
  const [message, setMessage] = useState({ type: '', text: '' }); 
  const [imagePreview, setImagePreview] = useState(null); 

  // List state 
  const [dies, setDies] = useState([]); 
  const [isLoading, setIsLoading] = useState(false); 
  const [searchTerm, setSearchTerm] = useState(''); 
  const [filterYear, setFilterYear] = useState(''); 
  const [filterStatus, setFilterStatus] = useState(''); 

  // Modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false); 
  const [dieToDelete, setDieToDelete] = useState(null); 
  const [editingDie, setEditingDie] = useState(null); 

  // Statistics 
  const [stats, setStats] = useState({ 
    total: 0, 
    activos: 0, 
    reparando: 0, 
    pendientes: 0, 
  }); 

  // Fetch dies when switching to manage tab
  useEffect(() => { 
    if (activeTab === 'manage') { 
      fetchDies(); 
    } 
  }, [activeTab, filterYear, filterStatus]); 
 
  const fetchDies = async () => { 
    setIsLoading(true); 
    try { 
      let url = `${API_BASE}/troqueles`; 
      const params = new URLSearchParams(); 
      if (filterYear) params.append('year', filterYear); 
      if (filterStatus) params.append('status', filterStatus); 
      if (params.toString()) url = `${API_BASE}/troqueles/search?${params.toString()}`; 

      const response = await fetch(url); 

      if (response.ok) { 
        const data = await response.json(); 
        setDies(Array.isArray(data) ? data : []); 

        // Calculate statistics 
        const allDies = Array.isArray(data) ? data : []; 

        setStats({ 
          total: allDies.length, 
          activos: allDies.filter(d => d.status === 'En prensa' || d.status === 'Listo').length, 
          reparando: allDies.filter(d => d.status === 'Reparando').length, 
          pendientes: allDies.filter(d => d.status === 'Pendiente').length, 
        }); 
      } 
    } catch (error) { 
      console.error('Error fetching dies:', error); 
    } finally { 
      setIsLoading(false); 
    } 
  }; 

  const handleInputChange = useCallback((e) => { 
    const { name, value } = e.target; 
    setFormData(prev => ({ ...prev, [name]: value })); 
  }, []); 

  const handleImageUrlChange = useCallback((e) => { 
    const url = e.target.value; 
    setFormData(prev => ({ ...prev, image_url: url })); 
    setImagePreview(url || null); 
  }, []); 

  const handleImageUpload = useCallback((e) => { 
    const file = e.target.files[0]; 
    if (file) { 
      const reader = new FileReader(); 
      reader.onloadend = () => { 
        setImagePreview(reader.result); 
        setFormData(prev => ({ ...prev, image_url: reader.result })); 
      }; 
      reader.readAsDataURL(file); 
    } 
  }, []); 

  const removeImage = useCallback(() => { 
    setImagePreview(null); 
    setFormData(prev => ({ ...prev, image_url: '' })); 
  }, []); 

  const validateForm = useCallback(() => { 
    if (!formData.id.trim()) return 'El ID del troquel es requerido'; 
    if (!formData.name.trim()) return 'El nombre del troquel es requerido'; 
    if (!formData.year) return 'El año es requerido'; 
    if (!/^T\d+$/i.test(formData.id.trim())) return 'El ID debe comenzar con "T" seguido de números (ej: T001)'; 
    return null; 
  }, [formData]); 

  const handleSubmit = useCallback(async (e) => { 
    e.preventDefault(); 
    const validationError = validateForm(); 
 
    if (validationError) { 
      setMessage({ type: 'error', text: validationError }); 
      return; 
    } 
    setIsSubmitting(true); 
    setMessage({ type: '', text: '' }); 

    try { 
      const isEditing = !!editingDie; 
      const url = isEditing 
        ? `${API_BASE}/troqueles/${editingDie.id}` 
        : `${API_BASE}/troqueles`; 
      const method = isEditing ? 'PUT' : 'POST'; 
      const response = await fetch(url, { 
        method, 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ 
          id: formData.id.trim().toUpperCase(), 
          name: formData.name.trim(), 
          status: formData.status, 
          year: parseInt(formData.year), 
          model: formData.model.trim() || null, 
          golpes: formData.golpes || '-', 
          golpes_acum: formData.golpes_acum || '-', 
          capacidad_golpes: formData.capacidad_golpes || '-', 
          rectificaciones: formData.rectificaciones || '0', 
          image_url: formData.image_url || null, 
        }), 
      }); 

      if (!response.ok) { 
        const errorData = await response.json(); 
        throw new Error(errorData.message || 'Error al procesar el troquel'); 
      } 

      const actionText = isEditing ? 'actualizado' : 'registrado'; 
      setMessage({ type: 'success', text: `¡Troquel ${formData.id} ${actionText} exitosamente!` }); 

      // Reset form 
      handleReset(); 
      setEditingDie(null); 

      // Refresh list if on manage tab
      if (activeTab === 'manage') { 
        fetchDies(); 
      } 
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
  }, []); 

  const handleEdit = useCallback((die) => { 
    setEditingDie(die); 
    setFormData({ 
      id: die.id || '', 
      name: die.name || '', 
      status: die.status || 'Pendiente', 
      year: die.year || new Date().getFullYear(), 
      model: die.model || '', 
      golpes: die.golpes || '', 
      golpes_acum: die.golpes_acum || '', 
      capacidad_golpes: die.capacidad_golpes || '', 
      rectificaciones: die.rectificaciones || '0', 
      image_url: die.image_url || '', 
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

    setImagePreview(die.image_url || null); 
    setActiveTab('register'); 
    setMessage({ type: '', text: '' }); 
  }, []); 

  const handleDeleteClick = useCallback((die) => { 
    setDieToDelete(die); 
    setShowDeleteModal(true); 
  }, []); 

  const handleDeleteConfirm = useCallback(async () => { 
    if (!dieToDelete) return; 
    try { 
      const response = await fetch(`${API_BASE}/troqueles/${dieToDelete.id}`, { 
        method: 'DELETE', 
      }); 

      if (response.ok) { 
        setMessage({ type: 'success', text: `Troquel ${dieToDelete.id} eliminado correctamente` }); 
        fetchDies(); 
      } else { 
        throw new Error('Error al eliminar'); 
      } 

    } catch (error) { 
      setMessage({ type: 'error', text: 'Error al eliminar el troquel' }); 
    } finally { 
      setShowDeleteModal(false); 
      setDieToDelete(null); 
    } 
  }, [dieToDelete]); 

  // Filtered dies
  const filteredDies = useMemo(() => { 
    return dies.filter(die => { 
      const matchesSearch = !searchTerm || 
        die.id?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        die.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        die.model?.toLowerCase().includes(searchTerm.toLowerCase()); 
      return matchesSearch; 
    }); 
  }, [dies, searchTerm]); 

  // Input style helper 
  const getInputStyle = useCallback((fieldName, disabled = false) => ({ 
    ...styles.input, 
    ...(focusedField === fieldName ? styles.inputFocus : {}), 
    ...(disabled ? styles.inputDisabled : {}), 
  }), [focusedField, styles]); 

  const getSelectStyle = useCallback((fieldName) => ({ 
    ...styles.select, 
    ...(focusedField === fieldName ? styles.inputFocus : {}), 
  }), [focusedField, styles]); 

  return ( 
    <div style={styles.container}> 
      {/* Grid Overlay */} 
      <div style={styles.gridOverlay} /> 
      <div style={styles.scanLine} /> 

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
              👤 {user.username}
            </span>
          )}
          <span style={styles.adminBadge}> 
            Modo Administrador 
          </span> 
          {onNavigateBack && ( 
            <button 
              style={styles.backButton} 
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

      {/* Main Content */} 
      <main style={styles.mainContent}> 
        {/* Page Header */} 
        <div style={styles.pageHeader}> 
          <h1 style={styles.pageTitle}> 
            <span></span> 
            Gestión de Troqueles 
          </h1> 
          <p style={styles.pageSubtitle}> 
            Registre, administre y monitoree todos los troqueles del sistema 
          </p> 
        </div> 

        {/* Tab Navigation */} 
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

        {/* Messages */} 
        {message.type === 'success' && ( 
          <div style={styles.successMessage}> 
            <div style={{ ...styles.messageIcon, background: 'rgba(0, 255, 136, 0.15)' }}>✓</div> 
            <div> 
              <strong style={{ color: '#00ff88', fontSize: '14px' }}>{message.text}</strong> 
            </div> 
          </div> 
        )} 

        {message.type === 'error' && ( 
          <div style={styles.errorMessage}> 
            <div style={{ ...styles.messageIcon, background: 'rgba(255, 107, 107, 0.15)' }}>✕</div> 
            <div> 
              <strong style={{ color: '#ff6b6b', fontSize: '14px' }}>{message.text}</strong> 
            </div> 
          </div> 
        )} 

        {/* Register Tab */} 
        {activeTab === 'register' && ( 
          <form onSubmit={handleSubmit}> 
            <div style={styles.formContainer}> 
              {/* Basic Information */} 
              <div style={styles.formSection}> 
                <h2 style={styles.sectionTitle}> 
                  Información Básica 
                </h2> 
                <div style={styles.formGrid}> 
                  <div style={styles.inputGroup}> 
                    <label style={styles.label}> 
                      ID del Troquel<span style={styles.requiredStar}>*</span> 
                    </label> 
                    <input 
                      type="text" 
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
                      Nombre del Troquel<span style={styles.requiredStar}>*</span> 
                    </label> 
                    <input 
                      type="text" 
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
                      Año de Registro<span style={styles.requiredStar}>*</span> 
                    </label> 
                    <select 
                      name="year" 
                      value={formData.year} 
                      onChange={handleInputChange} 
                      onFocus={() => setFocusedField('year')} 
                      onBlur={() => setFocusedField(null)} 
                      style={getSelectStyle('year')} 
                    > 
                      {years.map(year => ( 
                        <option key={year} value={year}>{year}</option> 
                      ))} 
                    </select> 
                  </div> 
 
                  <div style={styles.inputGroup}> 
                    <label style={styles.label}>Estado</label> 
                    <select 
                      name="status" 
                      value={formData.status} 
                      onChange={handleInputChange} 
                      onFocus={() => setFocusedField('status')} 
                      onBlur={() => setFocusedField(null)} 
                      style={getSelectStyle('status')} 
                    > 
                      <option value="Pendiente">Pendiente</option> 
                      <option value="En prensa">En Prensa</option> 
                      <option value="Listo">Listo</option> 
                      <option value="Listo-BackUp">Listo - BackUp</option> 
                      <option value="Reparando">Reparando</option> 
                      <option value="Baja">Baja / Obsoleto</option> 
                    </select> 
                  </div> 
                  <div style={{ ...styles.inputGroup, ...styles.twoColumns }}> 
                    <label style={styles.label}>Modelo / Número de Parte</label> 
                    <input 
                      type="text" 
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
                    <select 
                      name="tipo_troquel" 
                      value={formData.tipo_troquel} 
                      onChange={handleInputChange} 
                      onFocus={() => setFocusedField('tipo_troquel')} 
                      onBlur={() => setFocusedField(null)} 
                      style={getSelectStyle('tipo_troquel')} 
                    > 
                      {DIE_TYPE_OPTIONS.map(opt => ( 
                        <option key={opt.value} value={opt.value}>{opt.label}</option> 
                      ))} 
                    </select> 
                  </div> 

                  <div style={styles.inputGroup}> 
                    <label style={styles.label}>Cliente</label> 
                    <select 
                      name="cliente" 
                      value={formData.cliente} 
                      onChange={handleInputChange} 
                      onFocus={() => setFocusedField('cliente')} 
                      onBlur={() => setFocusedField(null)} 
                      style={getSelectStyle('cliente')} 
                    > 
                      {CLIENT_OPTIONS.map(opt => ( 
                        <option key={opt.value} value={opt.value}>{opt.label}</option> 
                      ))} 
                    </select> 
                  </div> 
                </div> 
              </div> 

              {/* Production Metrics */} 
              <div style={styles.formSection}> 
                <h2 style={styles.sectionTitle}> 
                  Métricas de Producción 
                </h2> 
                <div style={styles.formGrid}> 
                  <div style={styles.inputGroup}> 
                    <label style={styles.label}>Golpes Actuales</label> 
                    <input 
                      type="text" 
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
                    <input 
                      type="text" 
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
                    <input 
                      type="text" 
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
                    <input 
                      type="text" 
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
                    <input 
                      type="text" 
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
                    <input 
                      type="text" 
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
                    <select 
                      name="prensa_asignada" 
                      value={formData.prensa_asignada} 
                      onChange={handleInputChange} 
                      onFocus={() => setFocusedField('prensa_asignada')} 
                      onBlur={() => setFocusedField(null)} 
                      style={getSelectStyle('prensa_asignada')} 
                    > 
                      {PRESS_OPTIONS.map(opt => ( 
                        <option key={opt.value} value={opt.value}>{opt.label}</option> 
                      ))} 
                    </select> 
                  </div> 

                  <div style={styles.inputGroup}> 
                    <label style={styles.label}>Ubicación Actual</label> 
                    <input 
                      type="text" 
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
              </div> 

              {/* Technical Details */} 
              <div style={styles.formSection}> 
                <h2 style={styles.sectionTitle}> 
                  Detalles Técnicos 
                </h2> 
                <div style={styles.formGrid}> 
                  <div style={styles.inputGroup}> 
                    <label style={styles.label}>Número de Serie</label> 
                    <input 
                      type="text" 
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
                    <input 
                      type="text" 
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
                    <input 
                      type="date" 
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
                    <input 
                      type="text" 
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
                    <input 
                      type="text" 
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
                    <input 
                      type="text" 
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
              </div> 

              {/* Image Section */} 
              <div style={styles.formSection}> 
                <h2 style={styles.sectionTitle}> 
                  Imagen del Troquel 
                </h2> 
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}> 
                  <div style={styles.inputGroup}> 
                    <label style={styles.label}>URL de la Imagen</label> 
                    <input 
                      type="text" 
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
                        <img 
                          src={imagePreview} 
                          alt="Preview" 
                          style={styles.imagePreviewImg} 
                          onError={() => setImagePreview(null)} 
                        /> 
                        <button 
                          type="button" 
                          style={styles.imageRemoveBtn} 
                          onClick={removeImage} 
                        > 
                          ✕ 
                        </button> 
                      </div> 
                    ) : ( 
                      <label 
                        style={styles.imageUploadArea} 
                        onMouseEnter={(e) => { 
                          e.currentTarget.style.borderColor = '#00ff88'; 
                          e.currentTarget.style.background = 'rgba(0, 255, 136, 0.05)'; 
                        }} 
                        onMouseLeave={(e) => { 
                          e.currentTarget.style.borderColor = 'rgba(0, 255, 136, 0.25)'; 
                          e.currentTarget.style.background = 'rgba(0, 0, 0, 0.2)'; 
                        }} 
                      > 
                        <input 
                          type="file" 
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
              </div> 

              {/* Notes Section */} 
              <div style={styles.formSection}> 
                <h2 style={styles.sectionTitle}> 
                  Observaciones 
                </h2> 
                <div style={styles.inputGroup}> 
                  <label style={styles.label}>Notas Adicionales (Opcional)</label> 
                  <textarea 
                    name="notes" 
                    value={formData.notes} 
                    onChange={handleInputChange} 
                    onFocus={() => setFocusedField('notes')} 
                    onBlur={() => setFocusedField(null)} 
                    style={{ 
                      ...styles.textarea, 
                      ...(focusedField === 'notes' ? styles.inputFocus : {}), 
                    }} 
                    placeholder="Ingrese cualquier observación adicional sobre el troquel..." 
                  /> 
                </div> 
              </div> 

              {/* Action Buttons */} 
              <div style={styles.buttonGroup}> 
                <button 
                  type="button" 
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
                <button 
                  type="submit" 
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
                      <span style={styles.loadingSpinner} /> 
                      Procesando... 
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

        {/* Manage Tab */} 
        {activeTab === 'manage' && ( 
          <> 
            {/* Stats Row */} 
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

            {/* Table */} 
            <div style={styles.tableContainer}> 
              <div style={styles.tableHeader}> 
                <div style={styles.tableTitle}> 
                  Lista de Troqueles Registrados 
                </div> 
                <div style={styles.tableControls}> 
                  <select 
                    value={filterYear} 
                    onChange={(e) => setFilterYear(e.target.value)} 
                    style={{ ...styles.tableFilter, width: '130px' }} 
                  > 
                    <option value="">Todos los años</option> 
                    {years.slice(0, 10).map(year => ( 
                      <option key={year} value={year}>{year}</option> 
                    ))} 
                  </select> 
                  <select 
                    value={filterStatus} 
                    onChange={(e) => setFilterStatus(e.target.value)} 
                    style={{ ...styles.tableFilter, width: '150px' }} 
                  > 
                    <option value="">Todos los estados</option> 
                    <option value="En prensa">En Prensa</option> 
                    <option value="Listo">Listo</option> 
                    <option value="Listo-BackUp">Listo - BackUp</option> 
                    <option value="Reparando">Reparando</option> 
                    <option value="Pendiente">Pendiente</option> 
                    <option value="Baja">Baja</option> 
                  </select> 
                  <input 
                    type="text" 
                    placeholder="Buscar troquel..." 
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)} 
                    style={styles.tableSearch} 
                  /> 
                  <button 
                    style={{ ...styles.btnPrimary, padding: '10px 20px', fontSize: '13px' }} 
                    onClick={fetchDies} 
                  > 
                    Actualizar 
                  </button> 
                </div> 
              </div> 

              {isLoading ? ( 
                <div style={{ textAlign: 'center', padding: '60px' }}> 
                  <div style={{ ...styles.loadingSpinner, width: '40px', height: '40px', borderWidth: '3px', margin: '0 auto 16px' }} /> 
                  <p style={{ color: '#888' }}>Cargando troqueles...</p> 
                </div> 
              ) : filteredDies.length === 0 ? ( 
                <div style={styles.emptyState}> 
                  <div style={styles.emptyIcon}></div> 
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
                        {filteredDies.map((die) => ( 
                          <tr 
                            key={die.id} 
                            style={styles.tableRow} 
                            onMouseEnter={(e) => { 
                              e.currentTarget.style.background = 'rgba(0, 255, 136, 0.03)'; 
                            }} 
                            onMouseLeave={(e) => { 
                              e.currentTarget.style.background = 'transparent'; 
                            }} 
                          > 
                            <td style={{ ...styles.td, color: '#00ff88', fontWeight: 600 }}>{die.id}</td> 
                            <td style={styles.td}>{die.name}</td> 
                            <td style={styles.td}>{die.year}</td> 
                            <td style={styles.td}>{die.model || '-'}</td> 
                            <td style={styles.td}> 
                              <span style={{ ...styles.statusBadge, ...getStatusStyle(die.status) }}> 
                                {die.status} 
                              </span> 
                            </td> 
                            <td style={styles.td}>{die.golpes_acum || '-'}</td> 
                            <td style={styles.td}> 
                              <button 
                                style={styles.actionBtn} 
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
                        ))} 
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

      {/* Delete Confirmation Modal */} 
      {showDeleteModal && ( 
        <div style={styles.modalOverlay} onClick={() => setShowDeleteModal(false)}> 
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}> 
            <h2 style={styles.modalTitle}> 
              Confirmar Eliminación 
            </h2> 
            <p style={styles.modalText}> 
              ¿Está seguro de que desea eliminar el troquel <strong style={{ color: '#00ff88' }}>{dieToDelete?.id}</strong> ({dieToDelete?.name})? 
              <br /><br /> 
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
                Eliminar Troquel 
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

export default AdminDieRegistration;