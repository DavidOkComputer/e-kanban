import React, { 

    useState, 

    useCallback, 

    useMemo, 

    useEffect, 

} from 'react'; 


import createStyles, { 

    cssAnimations 

} from '../styles/adminDieRegistration.styles'; 

 

// Configuración de la API 

const API_BASE = 'http://localhost/ekanban-toolroom/src/api'; 

 

// Opciones de roles 

const ROL_OPTIONS = [ 

    { value: 'admin', label: 'Administrador' }, 

    { value: 'supervisor', label: 'Supervisor' }, 

    { value: 'operator', label: 'Operador' }, 

]; 

 

// Estilos de rol 

const getRolStyle = (rol) => { 

    const rolColors = { 

        'admin': { 

            background: 'rgba(255, 107, 107, 0.15)', 

            color: '#ff6b6b', 

            border: '1px solid rgba(255, 107, 107, 0.3)' 

        }, 

        'supervisor': { 

            background: 'rgba(0, 200, 255, 0.15)', 

            color: '#00c8ff', 

            border: '1px solid rgba(0, 200, 255, 0.3)' 

        }, 

        'operator': { 

            background: 'rgba(0, 255, 136, 0.15)', 

            color: '#00ff88', 

            border: '1px solid rgba(0, 255, 136, 0.3)' 

        }, 

    }; 

    return rolColors[rol] || rolColors['operator']; 

}; 

 

// Estilos de estado activo/inactivo 

const getActiveStyle = (activo) => { 

    if (activo) { 

        return { 

            background: 'rgba(0, 255, 136, 0.15)', 

            color: '#00ff88', 

            border: '1px solid rgba(0, 255, 136, 0.3)' 

        }; 

    } 

    return { 

        background: 'rgba(128, 128, 128, 0.15)', 

        color: '#888', 

        border: '1px solid rgba(128, 128, 128, 0.3)' 

    }; 

}; 

 

// Etiquetas de rol 

const getRolLabel = (rol) => { 

    const labels = { 

        'admin': 'Administrador', 

        'supervisor': 'Supervisor', 

        'operator': 'Operador', 

    }; 

    return labels[rol] || rol; 

}; 

 

// Componente de sección colapsable 

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

 

const AdminUserManagement = ({ onNavigateBack, user }) => { 

    const styles = useMemo(() => createStyles(), []); 

 

    // Estado de la pestaña 

    const [activeTab, setActiveTab] = useState('list'); 

 

    // Estado para secciones colapsables del formulario 

    const [expandedSections, setExpandedSections] = useState({ 

        accountInfo: true, 

        rolePermissions: true, 

    }); 

 

    // Formulario de usuario 

    const [formData, setFormData] = useState({ 

        nombre_usuario: '', 

        acceso: '', 

        acceso_confirm: '', 

        nombre_completo: '', 

        rol: 'operator', 

    }); 

 

    const [focusedField, setFocusedField] = useState(null); 

    const [isSubmitting, setIsSubmitting] = useState(false); 

    const [message, setMessage] = useState({ type: '', text: '' }); 

 

    // Estado de lista 

    const [usuarios, setUsuarios] = useState([]); 

    const [isLoading, setIsLoading] = useState(false); 

    const [searchTerm, setSearchTerm] = useState(''); 

    const [filterRol, setFilterRol] = useState(''); 

    const [filterActivo, setFilterActivo] = useState(''); 

 

    // Estado del modal 

    const [showDeleteModal, setShowDeleteModal] = useState(false); 

    const [userToDelete, setUserToDelete] = useState(null); 

    const [editingUser, setEditingUser] = useState(null); 

    const [showPasswordFields, setShowPasswordFields] = useState(false); 

 

    // Estadísticas 

    const [stats, setStats] = useState({ 

        total: 0, 

        admins: 0, 

        supervisors: 0, 

        operators: 0, 

        activos: 0, 

        inactivos: 0, 

    }); 

 

    // Toggle para secciones colapsables 

    const toggleSection = useCallback((sectionKey) => { 

        setExpandedSections(prev => ({ ...prev, [sectionKey]: !prev[sectionKey] })); 

    }, []); 

 

    // ─── Funciones de API ─── 

 

    const fetchUsuarios = useCallback(async () => { 

        setIsLoading(true); 

        try { 

            const response = await fetch(`${API_BASE}/usuarios/crud`); 

            if (!response.ok) throw new Error('Error al cargar usuarios'); 

            const data = await response.json(); 

            const userList = Array.isArray(data) ? data : []; 

            setUsuarios(userList); 

 

            // Calcular estadísticas 

            const total = userList.length; 

            const admins = userList.filter(u => u.rol === 'admin').length; 

            const supervisors = userList.filter(u => u.rol === 'supervisor').length; 

            const operators = userList.filter(u => u.rol === 'operator').length; 

            const activos = userList.filter(u => u.activo).length; 

            const inactivos = userList.filter(u => !u.activo).length; 

 

            setStats({ total, admins, supervisors, operators, activos, inactivos }); 

        } catch (error) { 

            console.error('Error fetching usuarios:', error); 

            setMessage({ type: 'error', text: 'Error al cargar la lista de usuarios' }); 

        } finally { 

            setIsLoading(false); 

        } 

    }, []); 

 

    // Cargar usuarios cuando cambia a la pestaña de lista 

    useEffect(() => { 

        if (activeTab === 'list') { 

            fetchUsuarios(); 

        } 

    }, [activeTab, fetchUsuarios]); 

 

    // Limpiar formulario 

    const resetForm = useCallback(() => { 

        setFormData({ 

            nombre_usuario: '', 

            acceso: '', 

            acceso_confirm: '', 

            nombre_completo: '', 

            rol: 'operator', 

        }); 

        setEditingUser(null); 

        setShowPasswordFields(false); 

        setMessage({ type: '', text: '' }); 

    }, []); 

 

    // Manejar cambios en el formulario 

    const handleInputChange = useCallback((field, value) => { 

        setFormData(prev => ({ ...prev, [field]: value })); 

    }, []); 

 

    // Validar formulario 

    const validateForm = useCallback(() => { 

        if (!formData.nombre_usuario.trim()) { 

            setMessage({ type: 'error', text: 'El nombre de usuario es requerido' }); 

            return false; 

        } 

        if (!formData.nombre_completo.trim()) { 

            setMessage({ type: 'error', text: 'El nombre completo es requerido' }); 

            return false; 

        } 

 

        // Para nuevo usuario, la contraseña es obligatoria 

        if (!editingUser) { 

            if (!formData.acceso.trim()) { 

                setMessage({ type: 'error', text: 'La contraseña es requerida' }); 

                return false; 

            } 

            if (formData.acceso.trim().length < 4) { 

                setMessage({ type: 'error', text: 'La contraseña debe tener al menos 4 caracteres' }); 

                return false; 

            } 

            if (formData.acceso !== formData.acceso_confirm) { 

                setMessage({ type: 'error', text: 'Las contraseñas no coinciden' }); 

                return false; 

            } 

        } 

 

        // Para edición, solo validar si se proporcionó nueva contraseña 

        if (editingUser && showPasswordFields && formData.acceso.trim()) { 

            if (formData.acceso.trim().length < 4) { 

                setMessage({ type: 'error', text: 'La contraseña debe tener al menos 4 caracteres' }); 

                return false; 

            } 

            if (formData.acceso !== formData.acceso_confirm) { 

                setMessage({ type: 'error', text: 'Las contraseñas no coinciden' }); 

                return false; 

            } 

        } 

 

        return true; 

    }, [formData, editingUser, showPasswordFields]); 

 

    // Enviar formulario (crear o actualizar) 

    const handleSubmit = useCallback(async () => { 

        if (!validateForm()) return; 

 

        setIsSubmitting(true); 

        setMessage({ type: '', text: '' }); 

 

        try { 

            const payload = { 

                nombre_usuario: formData.nombre_usuario.trim(), 

                nombre_completo: formData.nombre_completo.trim(), 

                rol: formData.rol, 

            }; 

 

            // Incluir contraseña solo si se proporcionó 

            if (!editingUser || (showPasswordFields && formData.acceso.trim())) { 

                payload.acceso = formData.acceso.trim(); 

            } 

 

            let url = `${API_BASE}/usuarios/crud`; 

            let method = 'POST'; 

 

            if (editingUser) { 

                payload.id_usuario = editingUser.id_usuario; 

                method = 'PUT'; 

            } 

 

            const response = await fetch(url, { 

                method, 

                headers: { 'Content-Type': 'application/json' }, 

                body: JSON.stringify(payload), 

            }); 

 

            const result = await response.json(); 

 

            if (response.ok && result.success) { 

                setMessage({ 

                    type: 'success', 

                    text: editingUser 

                        ? `Usuario "${formData.nombre_usuario}" actualizado exitosamente` 

                        : `Usuario "${formData.nombre_usuario}" creado exitosamente` 

                }); 

                resetForm(); 

                if (activeTab === 'list') fetchUsuarios(); 

            } else { 

                setMessage({ type: 'error', text: result.message || 'Error al guardar usuario' }); 

            } 

        } catch (error) { 

            console.error('Error saving usuario:', error); 

            setMessage({ type: 'error', text: 'Error de conexión al guardar usuario' }); 

        } finally { 

            setIsSubmitting(false); 

        } 

    }, [formData, editingUser, showPasswordFields, validateForm, resetForm, activeTab, fetchUsuarios]); 

 

    // Editar usuario 

    const handleEdit = useCallback((usuario) => { 

        setEditingUser(usuario); 

        setFormData({ 

            nombre_usuario: usuario.nombre_usuario || '', 

            acceso: '', 

            acceso_confirm: '', 

            nombre_completo: usuario.nombre_completo || '', 

            rol: usuario.rol || 'operator', 

        }); 

        setShowPasswordFields(false); 

        setActiveTab('register'); 

        setExpandedSections({ accountInfo: true, rolePermissions: true }); 

        setMessage({ type: '', text: '' }); 

    }, []); 

 

    // Toggle estado activo 

    const handleToggleActive = useCallback(async (usuario) => { 

        try { 

            const response = await fetch(`${API_BASE}/usuarios/crud/${usuario.id_usuario}/toggle-active`, { 

                method: 'PATCH', 

            }); 

            const result = await response.json(); 

 

            if (response.ok && result.success) { 

                setMessage({ type: 'success', text: result.message }); 

                fetchUsuarios(); 

            } else { 

                setMessage({ type: 'error', text: result.message || 'Error al cambiar estado' }); 

            } 

        } catch (error) { 

            console.error('Error toggling user status:', error); 

            setMessage({ type: 'error', text: 'Error de conexión' }); 

        } 

    }, [fetchUsuarios]); 

 

    // Eliminar usuario 

    const handleDelete = useCallback(async () => { 

        if (!userToDelete) return; 

 

        try { 

            const response = await fetch(`${API_BASE}/usuarios/crud?id=${userToDelete.id_usuario}`, { 

                method: 'DELETE', 

            }); 

            const result = await response.json(); 

 

            if (response.ok && result.success) { 

                setMessage({ type: 'success', text: `Usuario "${userToDelete.nombre_usuario}" eliminado exitosamente` }); 

                fetchUsuarios(); 

            } else { 

                setMessage({ type: 'error', text: result.message || 'Error al eliminar usuario' }); 

            } 

        } catch (error) { 

            console.error('Error deleting usuario:', error); 

            setMessage({ type: 'error', text: 'Error de conexión al eliminar usuario' }); 

        } finally { 

            setShowDeleteModal(false); 

            setUserToDelete(null); 

        } 

    }, [userToDelete, fetchUsuarios]); 

 

    // Filtrar usuarios 

    const filteredUsuarios = useMemo(() => { 

        return usuarios.filter(u => { 

            const matchSearch = !searchTerm || 

                u.nombre_usuario?.toLowerCase().includes(searchTerm.toLowerCase()) || 

                u.nombre_completo?.toLowerCase().includes(searchTerm.toLowerCase()); 

            const matchRol = !filterRol || u.rol === filterRol; 

            const matchActivo = filterActivo === '' || String(u.activo) === filterActivo; 

            return matchSearch && matchRol && matchActivo; 

        }); 

    }, [usuarios, searchTerm, filterRol, filterActivo]); 

 

    // Formatear fecha 

    const formatDate = (dateString) => { 

        if (!dateString) return '—'; 

        const date = new Date(dateString); 

        return date.toLocaleDateString('es-MX', { 

            year: 'numeric', 

            month: 'short', 

            day: 'numeric', 

            hour: '2-digit', 

            minute: '2-digit', 

        }); 

    }; 

 

    // ─── Estilos adicionales específicos de este componente ─── 

 

    const customStyles = { 

        passwordToggleBtn: { 

            background: 'rgba(0, 200, 255, 0.15)', 

            border: '1px solid rgba(0, 200, 255, 0.3)', 

            borderRadius: '8px', 

            padding: '8px 16px', 

            fontSize: '12px', 

            color: '#00c8ff', 

            cursor: 'pointer', 

            transition: 'all 0.3s ease', 

            display: 'flex', 

            alignItems: 'center', 

            gap: '6px', 

            marginTop: '8px', 

        }, 

        toggleActiveBtn: { 

            background: 'rgba(255, 200, 0, 0.15)', 

            border: '1px solid rgba(255, 200, 0, 0.3)', 

            borderRadius: '6px', 

            padding: '6px 12px', 

            fontSize: '11px', 

            color: '#ffc800', 

            cursor: 'pointer', 

            transition: 'all 0.2s ease', 

            marginRight: '6px', 

        }, 

        passwordHint: { 

            fontSize: '10px', 

            color: '#666', 

            marginTop: '4px', 

            fontStyle: 'italic', 

        }, 

    }; 

 

    // ─── RENDER ─── 

 

    // Render del formulario de registro/edición 

    const renderForm = () => ( 

        <div style={styles.formContainer}> 

            {/* Sección: Información de la cuenta */} 

            <CollapsibleSection 

                title="Información de la Cuenta" 

                icon="👤" 

                isExpanded={expandedSections.accountInfo} 

                onToggle={() => toggleSection('accountInfo')} 

                isRequired={true} 

            > 

                <div style={styles.formGrid}> 

                    {/* Nombre de usuario */} 

                    <div style={{ ...styles.inputGroup, ...styles.twoColumns }}> 

                        <label style={styles.label}> 

                            Nombre de Usuario <span style={styles.requiredStar}>*</span> 

                        </label> 

                        <input 

                            type="text" 

                            value={formData.nombre_usuario} 

                            onChange={(e) => handleInputChange('nombre_usuario', e.target.value)} 

                            onFocus={() => setFocusedField('nombre_usuario')} 

                            onBlur={() => setFocusedField(null)} 

                            style={{ 

                                ...styles.input, 

                                ...(focusedField === 'nombre_usuario' ? styles.inputFocus : {}), 

                            }} 

                            placeholder="Ej: jperez" 

                            autoComplete="off" 

                        /> 

                        <span style={{ fontSize: '10px', color: '#666', marginTop: '2px' }}> 

                            Se guardará en minúsculas. Sin espacios. 

                        </span> 

                    </div> 

 

                    {/* Nombre completo */} 

                    <div style={{ ...styles.inputGroup, ...styles.twoColumns }}> 

                        <label style={styles.label}> 

                            Nombre Completo <span style={styles.requiredStar}>*</span> 

                        </label> 

                        <input 

                            type="text" 

                            value={formData.nombre_completo} 

                            onChange={(e) => handleInputChange('nombre_completo', e.target.value)} 

                            onFocus={() => setFocusedField('nombre_completo')} 

                            onBlur={() => setFocusedField(null)} 

                            style={{ 

                                ...styles.input, 

                                ...(focusedField === 'nombre_completo' ? styles.inputFocus : {}), 

                            }} 

                            placeholder="Ej: Juan Pérez García" 

                            autoComplete="off" 

                        /> 

                    </div> 

 

                    {/* Contraseña - siempre visible para nuevos, toggle para edición */} 

                    {(!editingUser || showPasswordFields) && ( 

                        <> 

                            <div style={{ ...styles.inputGroup, ...styles.twoColumns }}> 

                                <label style={styles.label}> 

                                    Contraseña {!editingUser && <span style={styles.requiredStar}>*</span>} 

                                </label> 

                                <input 

                                    type="password" 

                                    value={formData.acceso} 

                                    onChange={(e) => handleInputChange('acceso', e.target.value)} 

                                    onFocus={() => setFocusedField('acceso')} 

                                    onBlur={() => setFocusedField(null)} 

                                    style={{ 

                                        ...styles.input, 

                                        ...(focusedField === 'acceso' ? styles.inputFocus : {}), 

                                    }} 

                                    placeholder={editingUser ? 'Nueva contraseña' : 'Contraseña'} 

                                    autoComplete="new-password" 

                                /> 

                                <span style={customStyles.passwordHint}> 

                                    Mínimo 4 caracteres 

                                </span> 

                            </div> 

 

                            <div style={{ ...styles.inputGroup, ...styles.twoColumns }}> 

                                <label style={styles.label}> 

                                    Confirmar Contraseña {!editingUser && <span style={styles.requiredStar}>*</span>} 

                                </label> 

                                <input 

                                    type="password" 

                                    value={formData.acceso_confirm} 

                                    onChange={(e) => handleInputChange('acceso_confirm', e.target.value)} 

                                    onFocus={() => setFocusedField('acceso_confirm')} 

                                    onBlur={() => setFocusedField(null)} 

                                    style={{ 

                                        ...styles.input, 

                                        ...(focusedField === 'acceso_confirm' ? styles.inputFocus : {}), 

                                        ...(formData.acceso_confirm && formData.acceso !== formData.acceso_confirm 

                                            ? styles.inputError 

                                            : {}), 

                                        ...(formData.acceso_confirm && formData.acceso === formData.acceso_confirm 

                                            ? { borderColor: '#00ff88', boxShadow: '0 0 0 3px rgba(0, 255, 136, 0.1)' } 

                                            : {}), 

                                    }} 

                                    placeholder="Repetir contraseña" 

                                    autoComplete="new-password" 

                                /> 

                                {formData.acceso_confirm && formData.acceso !== formData.acceso_confirm && ( 

                                    <span style={{ fontSize: '10px', color: '#ff6b6b', marginTop: '2px' }}> 

                                        ✗ Las contraseñas no coinciden 

                                    </span> 

                                )} 

                                {formData.acceso_confirm && formData.acceso === formData.acceso_confirm && ( 

                                    <span style={{ fontSize: '10px', color: '#00ff88', marginTop: '2px' }}> 

                                        ✓ Las contraseñas coinciden 

                                    </span> 

                                )} 

                            </div> 

                        </> 

                    )} 

 

                    {/* Botón para cambiar contraseña en modo edición */} 

                    {editingUser && !showPasswordFields && ( 

                        <div style={{ ...styles.inputGroup, gridColumn: '1 / -1' }}> 

                            <button 

                                type="button" 

                                onClick={() => setShowPasswordFields(true)} 

                                style={customStyles.passwordToggleBtn} 

                                onMouseEnter={(e) => { 

                                    e.target.style.background = 'rgba(0, 200, 255, 0.25)'; 

                                }} 

                                onMouseLeave={(e) => { 

                                    e.target.style.background = 'rgba(0, 200, 255, 0.15)'; 

                                }} 

                            > 

                                🔑 Cambiar Contraseña 

                            </button> 

                        </div> 

                    )} 

                </div> 

            </CollapsibleSection> 

 

            {/* Sección: Rol y Permisos */} 

            <CollapsibleSection 

                title="Rol y Permisos" 

                icon="🛡️" 

                isExpanded={expandedSections.rolePermissions} 

                onToggle={() => toggleSection('rolePermissions')} 

                isRequired={true} 

            > 

                <div style={styles.formGrid}> 

                    <div style={{ ...styles.inputGroup, ...styles.twoColumns }}> 

                        <label style={styles.label}> 

                            Rol <span style={styles.requiredStar}>*</span> 

                        </label> 

                        <select 

                            value={formData.rol} 

                            onChange={(e) => handleInputChange('rol', e.target.value)} 

                            style={styles.select} 

                        > 

                            {ROL_OPTIONS.map(opt => ( 

                                <option key={opt.value} value={opt.value}> 

                                    {opt.label} 

                                </option> 

                            ))} 

                        </select> 

                    </div> 

 

                    {/* Descripción del rol seleccionado */} 

                    <div style={{ ...styles.inputGroup, ...styles.twoColumns }}> 

                        <label style={styles.label}>Descripción del Rol</label> 

                        <div style={{ 

                            background: 'rgba(0, 0, 0, 0.3)', 

                            borderRadius: '8px', 

                            padding: '12px 14px', 

                            fontSize: '13px', 

                            color: '#aaa', 

                            lineHeight: 1.5, 

                            border: '1px solid rgba(255, 255, 255, 0.05)', 

                        }}> 

                            {formData.rol === 'admin' && ( 

                                <> 

                                    <span style={{ color: '#ff6b6b', fontWeight: 600 }}>Administrador:</span>{' '} 

                                    Acceso completo al sistema. Puede gestionar usuarios, troqueles, prensas, modelos y todas las configuraciones. 

                                </> 

                            )} 

                            {formData.rol === 'supervisor' && ( 

                                <> 

                                    <span style={{ color: '#00c8ff', fontWeight: 600 }}>Supervisor:</span>{' '} 

                                    Puede realizar acciones operativas como bajas de troquel, asistencia en prensa, gestión de reparaciones y ver reportes. 

                                </> 

                            )} 

                            {formData.rol === 'operator' && ( 

                                <> 

                                    <span style={{ color: '#00ff88', fontWeight: 600 }}>Operador:</span>{' '} 

                                    Acceso básico para registrar acciones operativas en el piso de producción. 

                                </> 

                            )} 

                        </div> 

                    </div> 

                </div> 

            </CollapsibleSection> 

 

            {/* Botones de acción */} 

            <div style={styles.buttonGroup}> 

                {editingUser && ( 

                    <button 

                        type="button" 

                        onClick={() => { 

                            resetForm(); 

                            setActiveTab('list'); 

                        }} 

                        style={styles.btnSecondary} 

                        onMouseEnter={(e) => { 

                            e.target.style.borderColor = '#fff'; 

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

                <button 

                    type="button" 

                    onClick={resetForm} 

                    style={styles.btnSecondary} 

                    onMouseEnter={(e) => { 

                        e.target.style.borderColor = '#fff'; 

                        e.target.style.color = '#fff'; 

                    }} 

                    onMouseLeave={(e) => { 

                        e.target.style.borderColor = 'rgba(255, 255, 255, 0.15)'; 

                        e.target.style.color = '#aaa'; 

                    }} 

                > 

                    🗑️ Limpiar 

                </button> 

                <button 

                    type="button" 

                    onClick={handleSubmit} 

                    disabled={isSubmitting} 

                    style={{ 

                        ...styles.btnPrimary, 

                        ...(isSubmitting ? { opacity: 0.6, cursor: 'not-allowed' } : {}), 

                    }} 

                    onMouseEnter={(e) => { 

                        if (!isSubmitting) e.target.style.boxShadow = '0 6px 30px rgba(0, 255, 136, 0.4)'; 

                    }} 

                    onMouseLeave={(e) => { 

                        e.target.style.boxShadow = '0 4px 20px rgba(0, 255, 136, 0.25)'; 

                    }} 

                > 

                    {isSubmitting ? ( 

                        <> 

                            <span style={styles.loadingSpinner}></span> 

                            Guardando... 

                        </> 

                    ) : ( 

                        <> 

                            {editingUser ? '💾 Actualizar Usuario' : '➕ Registrar Usuario'} 

                        </> 

                    )} 

                </button> 

            </div> 

        </div> 

    ); 

 

    // Render de la tabla de usuarios 

    const renderTable = () => ( 

        <div style={styles.tableContainer}> 

            {/* Header de la tabla */} 

            <div style={styles.tableHeader}> 

                <div style={styles.tableTitle}> 

                    👥 Lista de Usuarios ({filteredUsuarios.length}) 

                </div> 

                <div style={styles.tableControls}> 

                    <input 

                        type="text" 

                        placeholder="🔍 Buscar usuario..." 

                        value={searchTerm} 

                        onChange={(e) => setSearchTerm(e.target.value)} 

                        style={styles.tableSearch} 

                    /> 

                    <select 

                        value={filterRol} 

                        onChange={(e) => setFilterRol(e.target.value)} 

                        style={styles.tableFilter} 

                    > 

                        <option value="">Todos los roles</option> 

                        {ROL_OPTIONS.map(opt => ( 

                            <option key={opt.value} value={opt.value}>{opt.label}</option> 

                        ))} 

                    </select> 

                    <select 

                        value={filterActivo} 

                        onChange={(e) => setFilterActivo(e.target.value)} 

                        style={styles.tableFilter} 

                    > 

                        <option value="">Todos los estados</option> 

                        <option value="1">Activos</option> 

                        <option value="0">Inactivos</option> 

                    </select> 

                    <button 

                        onClick={fetchUsuarios} 

                        style={{ 

                            ...styles.actionBtn, 

                            color: '#00ff88', 

                            borderColor: 'rgba(0, 255, 136, 0.3)', 

                        }} 

                        onMouseEnter={(e) => { 

                            e.target.style.background = 'rgba(0, 255, 136, 0.15)'; 

                        }} 

                        onMouseLeave={(e) => { 

                            e.target.style.background = 'transparent'; 

                        }} 

                    > 

                        🔄 Refrescar 

                    </button> 

                </div> 

            </div> 

 

            {/* Tabla */} 

            {isLoading ? ( 

                <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}> 

                    <div style={{ 

                        ...styles.loadingSpinner, 

                        width: '30px', 

                        height: '30px', 

                        borderColor: 'rgba(0, 255, 136, 0.3)', 

                        borderTopColor: '#00ff88', 

                        margin: '0 auto 12px', 

                    }}></div> 

                    Cargando usuarios... 

                </div> 

            ) : filteredUsuarios.length === 0 ? ( 

                <div style={styles.emptyState}> 

                    <div style={styles.emptyIcon}>👤</div> 

                    <div style={styles.emptyText}> 

                        {searchTerm || filterRol || filterActivo 

                            ? 'No se encontraron usuarios con los filtros aplicados' 

                            : 'No hay usuarios registrados'} 

                    </div> 

                </div> 

            ) : ( 

                <div style={{ overflowX: 'auto' }}> 

                    <table style={styles.table}> 

                        <thead> 

                            <tr> 

                                <th style={styles.th}>ID</th> 

                                <th style={styles.th}>Usuario</th> 

                                <th style={styles.th}>Nombre Completo</th> 

                                <th style={styles.th}>Rol</th> 

                                <th style={styles.th}>Estado</th> 

                                <th style={styles.th}>Último Acceso</th> 

                                <th style={styles.th}>Creado</th> 

                                <th style={styles.th}>Acciones</th> 

                            </tr> 

                        </thead> 

                        <tbody> 

                            {filteredUsuarios.map((usuario) => { 

                                const rolStyle = getRolStyle(usuario.rol); 

                                const activeStyle = getActiveStyle(usuario.activo); 

                                const isCurrentUser = user && user.id === usuario.id_usuario; 

 

                                return ( 

                                    <tr 

                                        key={usuario.id_usuario} 

                                        style={{ 

                                            ...styles.tableRow, 

                                            ...(isCurrentUser ? { background: 'rgba(0, 255, 136, 0.05)' } : {}), 

                                        }} 

                                        onMouseEnter={(e) => { 

                                            e.currentTarget.style.background = isCurrentUser 

                                                ? 'rgba(0, 255, 136, 0.08)' 

                                                : 'rgba(255, 255, 255, 0.03)'; 

                                        }} 

                                        onMouseLeave={(e) => { 

                                            e.currentTarget.style.background = isCurrentUser 

                                                ? 'rgba(0, 255, 136, 0.05)' 

                                                : 'transparent'; 

                                        }} 

                                    > 

                                        <td style={styles.td}> 

                                            <span style={{ color: '#00ff88', fontFamily: 'monospace' }}> 

                                                #{usuario.id_usuario} 

                                            </span> 

                                        </td> 

                                        <td style={styles.td}> 

                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}> 

                                                <span style={{ fontWeight: 600, color: '#fff' }}> 

                                                    {usuario.nombre_usuario} 

                                                </span> 

                                                {isCurrentUser && ( 

                                                    <span style={{ 

                                                        background: 'rgba(0, 255, 136, 0.2)', 

                                                        color: '#00ff88', 

                                                        fontSize: '9px', 

                                                        padding: '2px 6px', 

                                                        borderRadius: '8px', 

                                                        fontWeight: 600, 

                                                    }}> 

                                                        TÚ 

                                                    </span> 

                                                )} 

                                            </div> 

                                        </td> 

                                        <td style={styles.td}>{usuario.nombre_completo}</td> 

                                        <td style={styles.td}> 

                                            <span style={{ 

                                                ...styles.statusBadge, 

                                                ...rolStyle, 

                                            }}> 

                                                {getRolLabel(usuario.rol)} 

                                            </span> 

                                        </td> 

                                        <td style={styles.td}> 

                                            <span style={{ 

                                                ...styles.statusBadge, 

                                                ...activeStyle, 

                                            }}> 

                                                {usuario.activo ? 'Activo' : 'Inactivo'} 

                                            </span> 

                                        </td> 

                                        <td style={{ ...styles.td, fontSize: '12px', color: '#888' }}> 

                                            {formatDate(usuario.ultimo_acceso)} 

                                        </td> 

                                        <td style={{ ...styles.td, fontSize: '12px', color: '#888' }}> 

                                            {formatDate(usuario.fecha_creacion)} 

                                        </td> 

                                        <td style={styles.td}> 

                                            <button 

                                                onClick={() => handleEdit(usuario)} 

                                                style={{ 

                                                    ...styles.actionBtn, 

                                                    color: '#00c8ff', 

                                                    borderColor: 'rgba(0, 200, 255, 0.3)', 

                                                }} 

                                                onMouseEnter={(e) => { 

                                                    e.target.style.background = 'rgba(0, 200, 255, 0.15)'; 

                                                    e.target.style.color = '#fff'; 

                                                }} 

                                                onMouseLeave={(e) => { 

                                                    e.target.style.background = 'transparent'; 

                                                    e.target.style.color = '#00c8ff'; 

                                                }} 

                                            > 

                                                ✏️ Editar 

                                            </button> 

                                            <button 

                                                onClick={() => handleToggleActive(usuario)} 

                                                style={customStyles.toggleActiveBtn} 

                                                onMouseEnter={(e) => { 

                                                    e.target.style.background = 'rgba(255, 200, 0, 0.25)'; 

                                                }} 

                                                onMouseLeave={(e) => { 

                                                    e.target.style.background = 'rgba(255, 200, 0, 0.15)'; 

                                                }} 

                                                title={usuario.activo ? 'Desactivar usuario' : 'Activar usuario'} 

                                            > 

                                                {usuario.activo ? '🔒 Desactivar' : '🔓 Activar'} 

                                            </button> 

                                            <button 

                                                onClick={() => { 

                                                    setUserToDelete(usuario); 

                                                    setShowDeleteModal(true); 

                                                }} 

                                                disabled={isCurrentUser} 

                                                style={{ 

                                                    ...styles.actionBtn, 

                                                    color: isCurrentUser ? '#555' : '#ff6b6b', 

                                                    borderColor: isCurrentUser 

                                                        ? 'rgba(85, 85, 85, 0.3)' 

                                                        : 'rgba(255, 107, 107, 0.3)', 

                                                    cursor: isCurrentUser ? 'not-allowed' : 'pointer', 

                                                    opacity: isCurrentUser ? 0.5 : 1, 

                                                }} 

                                                onMouseEnter={(e) => { 

                                                    if (!isCurrentUser) { 

                                                        e.target.style.background = 'rgba(255, 107, 107, 0.15)'; 

                                                        e.target.style.color = '#fff'; 

                                                    } 

                                                }} 

                                                onMouseLeave={(e) => { 

                                                    if (!isCurrentUser) { 

                                                        e.target.style.background = 'transparent'; 

                                                        e.target.style.color = '#ff6b6b'; 

                                                    } 

                                                }} 

                                                title={isCurrentUser ? 'No puedes eliminar tu propia cuenta' : 'Eliminar usuario'} 

                                            > 

                                                🗑️ Eliminar 

                                            </button> 

                                        </td> 

                                    </tr> 

                                ); 

                            })} 

                        </tbody> 

                    </table> 

                </div> 

            )} 

 

            {/* Paginación / info */} 

            <div style={styles.pagination}> 

                <div style={styles.pageInfo}> 

                    Mostrando {filteredUsuarios.length} de {usuarios.length} usuarios 

                </div> 

            </div> 

        </div> 

    ); 

 

    // Render del modal de confirmación de eliminación 

    const renderDeleteModal = () => { 

        if (!showDeleteModal || !userToDelete) return null; 

 

        return ( 

            <div 

                style={styles.modalOverlay} 

                onClick={() => { 

                    setShowDeleteModal(false); 

                    setUserToDelete(null); 

                }} 

            > 

                <div 

                    style={styles.modal} 

                    onClick={(e) => e.stopPropagation()} 

                > 

                    <div style={styles.modalTitle}> 

                        ⚠️ Confirmar Eliminación 

                    </div> 

                    <div style={styles.modalText}> 

                        ¿Estás seguro de que deseas eliminar al usuario{' '} 

                        <span style={{ color: '#ff6b6b', fontWeight: 600 }}> 

                            "{userToDelete.nombre_usuario}" 

                        </span>{' '} 

                        ({userToDelete.nombre_completo})? 

                        <br /><br /> 

                        <span style={{ color: '#ff6b6b', fontSize: '12px' }}> 

                            ⚠️ Esta acción no se puede deshacer. Si solo deseas impedir el acceso, 

                            considera desactivar la cuenta en lugar de eliminarla. 

                        </span> 

                    </div> 

                    <div style={styles.modalButtons}> 

                        <button 

                            onClick={() => { 

                                setShowDeleteModal(false); 

                                setUserToDelete(null); 

                            }} 

                            style={styles.btnSecondary} 

                            onMouseEnter={(e) => { 

                                e.target.style.borderColor = '#fff'; 

                                e.target.style.color = '#fff'; 

                            }} 

                            onMouseLeave={(e) => { 

                                e.target.style.borderColor = 'rgba(255, 255, 255, 0.15)'; 

                                e.target.style.color = '#aaa'; 

                            }} 

                        > 

                            Cancelar 

                        </button> 

                        <button 

                            onClick={handleDelete} 

                            style={styles.btnDanger} 

                            onMouseEnter={(e) => { 

                                e.target.style.background = 'rgba(255, 107, 107, 0.3)'; 

                                e.target.style.color = '#fff'; 

                            }} 

                            onMouseLeave={(e) => { 

                                e.target.style.background = 'rgba(255, 107, 107, 0.15)'; 

                                e.target.style.color = '#ff6b6b'; 

                            }} 

                        > 

                            🗑️ Sí, Eliminar 

                        </button> 

                    </div> 

                </div> 

            </div> 

        ); 

    }; 

 

    return ( 

        <div style={styles.container}> 

            <style>{cssAnimations}</style> 

            <div style={styles.gridOverlay}></div> 

            <div style={styles.scanLine}></div> 

 

            {/* Header */} 

            <header style={styles.header}> 

                <div style={styles.logoSection}> 

                    <div style={styles.logoIcon}> 

                        <img 

                            src="/logo.png" 

                            alt="Logo" 

                            style={{ width: '100%', height: '100%', objectFit: 'contain' }} 

                            onError={(e) => { e.target.style.display = 'none'; }} 

                        /> 

                    </div> 

                    <div style={styles.logoText}> 

                        <div style={styles.logoTitle}>E-KANBAN TOOLROOM</div> 

                        <div style={styles.logoSubtitle}>GESTIÓN DE USUARIOS</div> 

                    </div> 

                </div> 

 

                <div style={styles.headerRight}> 

                    {user && ( 

                        <div style={styles.adminBadge}> 

                            🔐 {user.nombre || user.username} 

                        </div> 

                    )} 

                    <button 

                        onClick={onNavigateBack} 

                        style={styles.backButton} 

                        onMouseEnter={(e) => { 

                            e.target.style.background = 'rgba(0, 255, 136, 0.15)'; 

                            e.target.style.boxShadow = '0 0 20px rgba(0, 255, 136, 0.2)'; 

                        }} 

                        onMouseLeave={(e) => { 

                            e.target.style.background = 'transparent'; 

                            e.target.style.boxShadow = 'none'; 

                        }} 

                    > 

                        ← Volver 

                    </button> 

                </div> 

            </header> 

 

            {/* Contenido principal */} 

            <div style={styles.mainContent}> 

                {/* Título de la página */} 

                <div style={styles.pageHeader}> 

                    <h1 style={styles.pageTitle}> 

                        👥 Gestión de Usuarios 

                    </h1> 

                    <p style={styles.pageSubtitle}> 

                        Administra las cuentas de acceso al sistema E-Kanban Toolroom 

                    </p> 

                </div> 

 

                {/* Tarjetas de estadísticas */} 

                <div style={styles.statsRow}> 

                    <div style={styles.statCard}> 

                        <div style={{ 

                            ...styles.statIcon, 

                            background: 'rgba(0, 255, 136, 0.15)', 

                        }}> 

                            👥 

                        </div> 

                        <div> 

                            <div style={styles.statValue}>{stats.total}</div> 

                            <div style={styles.statLabel}>Total Usuarios</div> 

                        </div> 

                    </div> 

                    <div style={styles.statCard}> 

                        <div style={{ 

                            ...styles.statIcon, 

                            background: 'rgba(255, 107, 107, 0.15)', 

                        }}> 

                            🛡️ 

                        </div> 

                        <div> 

                            <div style={styles.statValue}>{stats.admins}</div> 

                            <div style={styles.statLabel}>Administradores</div> 

                        </div> 

                    </div> 

                    <div style={styles.statCard}> 

                        <div style={{ 

                            ...styles.statIcon, 

                            background: 'rgba(0, 200, 255, 0.15)', 

                        }}> 

                            📋 

                        </div> 

                        <div> 

                            <div style={styles.statValue}>{stats.supervisors}</div> 

                            <div style={styles.statLabel}>Supervisores</div> 

                        </div> 

                    </div> 

                    <div style={styles.statCard}> 

                        <div style={{ 

                            ...styles.statIcon, 

                            background: 'rgba(0, 255, 136, 0.15)', 

                        }}> 

                            {stats.activos > 0 

                                ? <span style={{ color: '#00ff88' }}>✓</span> 

                                : <span style={{ color: '#888' }}>—</span> 

                            } 

                        </div> 

                        <div> 

                            <div style={styles.statValue}>{stats.activos}</div> 

                            <div style={styles.statLabel}>Activos</div> 

                        </div> 

                    </div> 

                </div> 

 

                {/* Pestañas */} 

                <div style={styles.tabsContainer}> 

                    <button 

                        onClick={() => { 

                            setActiveTab('list'); 

                            resetForm(); 

                        }} 

                        style={{ 

                            ...styles.tab, 

                            ...(activeTab === 'list' ? styles.tabActive : {}), 

                        }} 

                    > 

                        📋 Lista de Usuarios 

                    </button> 

                    <button 

                        onClick={() => { 

                            setActiveTab('register'); 

                            resetForm(); 

                        }} 

                        style={{ 

                            ...styles.tab, 

                            ...(activeTab === 'register' ? styles.tabActive : {}), 

                        }} 

                    > 

                        ➕ {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'} 

                    </button> 

                </div> 

 

                {/* Mensaje de éxito/error */} 

                {message.text && ( 

                    <div style={message.type === 'success' ? styles.successMessage : styles.errorMessage}> 

                        <div style={{ 

                            ...styles.messageIcon, 

                            background: message.type === 'success' 

                                ? 'rgba(0, 255, 136, 0.2)' 

                                : 'rgba(255, 107, 107, 0.2)', 

                        }}> 

                            {message.type === 'success' ? '✓' : '✗'} 

                        </div> 

                        <div> 

                            <div style={{ 

                                fontSize: '13px', 

                                fontWeight: 600, 

                                color: message.type === 'success' ? '#00ff88' : '#ff6b6b', 

                                marginBottom: '2px', 

                            }}> 

                                {message.type === 'success' ? 'Éxito' : 'Error'} 

                            </div> 

                            <div style={{ fontSize: '12px', color: '#aaa' }}> 

                                {message.text} 

                            </div> 

                        </div> 

                        <button 

                            onClick={() => setMessage({ type: '', text: '' })} 

                            style={{ 

                                marginLeft: 'auto', 

                                background: 'transparent', 

                                border: 'none', 

                                color: '#666', 

                                cursor: 'pointer', 

                                fontSize: '16px', 

                                padding: '4px', 

                            }} 

                        > 

                            ✕ 

                        </button> 

                    </div> 

                )} 

 

                {/* Contenido de la pestaña activa */} 

                {activeTab === 'list' && renderTable()} 

                {activeTab === 'register' && renderForm()} 

            </div> 

 

            {/* Modal de eliminación */} 

            {renderDeleteModal()} 

        </div> 

    ); 

}; 

 

export default AdminUserManagement; 