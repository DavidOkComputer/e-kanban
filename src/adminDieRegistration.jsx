import React, { useState, useCallback, useMemo, useEffect, memo } from 'react'; 
const API_BASE = 'http://localhost:3001/api'; 

const createStyles = () => ({ 
  container: { 
    minHeight: '100vh', 
    background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #0f0f23 100%)', 
    color: '#e0e0e0', 
    fontFamily: "'Segoe UI', system-ui, sans-serif", 
    position: 'relative', 
    overflow: 'hidden', 
  }, 

  gridOverlay: { 
    position: 'fixed', 
    top: 0, 
    left: 0, 
    right: 0, 
    bottom: 0, 
    backgroundImage: ` 
      linear-gradient(rgba(0, 255, 136, 0.03) 1px, transparent 1px), 
      linear-gradient(90deg, rgba(0, 255, 136, 0.03) 1px, transparent 1px) 
    `, 
    backgroundSize: '50px 50px', 
    pointerEvents: 'none', 
    zIndex: 0, 
  }, 

  scanLine: { 
    position: 'fixed', 
    top: 0, 
    left: 0, 
    right: 0, 
    height: '2px', 
    background: 'linear-gradient(90deg, transparent, rgba(0, 255, 136, 0.4), transparent)', 
    animation: 'scanLine 4s linear infinite', 
    pointerEvents: 'none', 
    zIndex: 1, 
  }, 

  header: { 
    background: 'linear-gradient(180deg, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.8) 100%)', 
    borderBottom: '2px solid #00ff88', 
    padding: '16px 40px', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    position: 'sticky', 
    top: 0, 
    zIndex: 100, 
    boxShadow: '0 4px 30px rgba(0, 255, 136, 0.2)', 
  }, 

  logoSection: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '16px', 
  }, 

  logoIcon: { 
    width: '50px', 
    height: '50px', 
    background: 'linear-gradient(135deg, #00ff88 0%, #00cc6a 100%)', 
    borderRadius: '12px', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    fontSize: '24px', 
    fontWeight: 'bold', 
    color: '#0a0a0a', 
    boxShadow: '0 0 20px rgba(0, 255, 136, 0.4)', 
  }, 

  logoText: { 
    display: 'flex', 
    flexDirection: 'column', 
  }, 

  logoTitle: { 
    fontSize: '22px', 
    fontWeight: 700, 
    color: '#00ff88', 
    textShadow: '0 0 10px rgba(0, 255, 136, 0.5)', 
    letterSpacing: '2px', 
  }, 

  logoSubtitle: { 
    fontSize: '11px', 
    color: '#888', 
    letterSpacing: '3px', 
    textTransform: 'uppercase', 
  }, 

  headerRight: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '16px', 
  }, 

  adminBadge: { 
    background: 'rgba(255, 107, 107, 0.15)', 
    border: '1px solid #ff6b6b', 
    borderRadius: '20px', 
    padding: '8px 16px', 
    fontSize: '11px', 
    color: '#ff6b6b', 
    fontWeight: 600, 
    letterSpacing: '1px', 
    textTransform: 'uppercase', 
    display: 'flex', 
    alignItems: 'center', 
    gap: '6px', 
  }, 

  backButton: { 
    background: 'transparent', 
    border: '1px solid #00ff88', 
    borderRadius: '8px', 
    padding: '10px 20px', 
    color: '#00ff88', 
    fontSize: '13px', 
    cursor: 'pointer', 
    transition: 'all 0.3s ease', 
    display: 'flex', 
    alignItems: 'center', 
    gap: '8px', 
    fontWeight: 500, 
  }, 

  //contenido principal 
  mainContent: { 
    position: 'relative', 
    zIndex: 5, 
    padding: '30px 40px 60px', 
    maxWidth: '1600px', 
    margin: '0 auto', 
  }, 
  pageHeader: { 
    marginBottom: '30px', 
  }, 

  pageTitle: { 
    fontSize: '28px', 
    fontWeight: 700, 
    color: '#00ff88', 
    marginBottom: '8px', 
    textShadow: '0 0 20px rgba(0, 255, 136, 0.3)', 
    display: 'flex', 
    alignItems: 'center', 
    gap: '14px', 
  }, 

  pageSubtitle: { 
    fontSize: '13px', 
    color: '#888', 
    letterSpacing: '0.5px', 
  }, 

  //navegacion entre pestanas 
  tabsContainer: { 
    display: 'flex', 
    gap: '4px', 
    marginBottom: '24px', 
    background: 'rgba(0, 0, 0, 0.3)', 
    padding: '4px', 
    borderRadius: '12px', 
    width: 'fit-content', 
  }, 

  tab: { 
    padding: '12px 24px', 
    fontSize: '13px', 
    fontWeight: 500, 
    color: '#888', 
    background: 'transparent', 
    border: 'none', 
    borderRadius: '8px', 
    cursor: 'pointer', 
    transition: 'all 0.3s ease', 
    display: 'flex', 
    alignItems: 'center', 
    gap: '8px', 
  }, 

  tabActive: { 
    background: 'rgba(0, 255, 136, 0.15)', 
    color: '#00ff88', 
    boxShadow: '0 0 20px rgba(0, 255, 136, 0.1)', 
  }, 
 
  //contenedor del form 
  formContainer: { 
    background: 'rgba(15, 15, 25, 0.9)', 
    borderRadius: '16px', 
    border: '1px solid rgba(0, 255, 136, 0.15)', 
    padding: '32px', 
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255,255,255,0.03)', 
    backdropFilter: 'blur(10px)', 
  }, 

  formGrid: { 
    display: 'grid', 
    gridTemplateColumns: 'repeat(4, 1fr)', 
    gap: '20px', 
  }, 

  formSection: { 
    marginBottom: '32px', 
  }, 

  sectionTitle: { 
    fontSize: '15px', 
    fontWeight: 600, 
    color: '#00ff88', 
    marginBottom: '20px', 
    paddingBottom: '10px', 
    borderBottom: '1px solid rgba(0, 255, 136, 0.2)', 
    display: 'flex', 
    alignItems: 'center', 
    gap: '10px', 
    textTransform: 'uppercase', 
    letterSpacing: '1px', 
  }, 

  sectionIcon: { 
    width: '28px', 
    height: '28px', 
    background: 'rgba(0, 255, 136, 0.12)', 
    borderRadius: '6px', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    fontSize: '14px', 
  }, 

  //elemento del form 
  inputGroup: { 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '6px', 
  }, 

  label: { 
    fontSize: '11px', 
    fontWeight: 600, 
    color: '#999', 
    letterSpacing: '0.5px', 
    textTransform: 'uppercase', 
  }, 

  requiredStar: { 
    color: '#ff6b6b', 
    marginLeft: '3px', 
  }, 

  input: { 
    background: 'rgba(0, 0, 0, 0.5)', 
    border: '1px solid rgba(255, 255, 255, 0.08)', 
    borderRadius: '8px', 
    padding: '12px 14px', 
    fontSize: '14px', 
    color: '#fff', 
    transition: 'all 0.3s ease', 
    outline: 'none', 
  }, 

  inputFocus: { 
    borderColor: '#00ff88', 
    boxShadow: '0 0 0 3px rgba(0, 255, 136, 0.1), 0 0 20px rgba(0, 255, 136, 0.1)', 
  }, 

  inputError: { 
    borderColor: '#ff6b6b', 
    boxShadow: '0 0 0 3px rgba(255, 107, 107, 0.1)', 
  }, 

  inputDisabled: { 
    opacity: 0.5, 
    cursor: 'not-allowed', 
  }, 

  select: { 
    background: 'rgba(0, 0, 0, 0.5)', 
    border: '1px solid rgba(255, 255, 255, 0.08)', 
    borderRadius: '8px', 
    padding: '12px 14px', 
    fontSize: '14px', 
    color: '#fff', 
    transition: 'all 0.3s ease', 
    outline: 'none', 
    cursor: 'pointer', 
    appearance: 'none', 
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2300ff88' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`, 
    backgroundRepeat: 'no-repeat', 
    backgroundPosition: 'right 14px center', 
    paddingRight: '36px', 
  }, 

  textarea: { 
    background: 'rgba(0, 0, 0, 0.5)', 
    border: '1px solid rgba(255, 255, 255, 0.08)', 
    borderRadius: '8px', 
    padding: '12px 14px', 
    fontSize: '14px', 
    color: '#fff', 
    transition: 'all 0.3s ease', 
    outline: 'none', 
    resize: 'vertical', 
    minHeight: '80px', 
    fontFamily: 'inherit', 
  }, 

  //imagen subida 
  imageUploadArea: { 
    border: '2px dashed rgba(0, 255, 136, 0.25)', 
    borderRadius: '12px', 
    padding: '30px', 
    textAlign: 'center', 
    cursor: 'pointer', 
    transition: 'all 0.3s ease', 
    background: 'rgba(0, 0, 0, 0.2)', 
    gridColumn: 'span 2', 
  }, 

  imageUploadIcon: { 

    fontSize: '36px', 

    marginBottom: '12px', 

  }, 

  imageUploadText: { 
    fontSize: '13px', 
    color: '#888', 
    marginBottom: '6px', 
  }, 

  imageUploadHint: { 
    fontSize: '11px', 
    color: '#666', 
  }, 

  imagePreview: { 
    position: 'relative', 
    borderRadius: '12px', 
    overflow: 'hidden', 
    border: '2px solid rgba(0, 255, 136, 0.3)', 
    gridColumn: 'span 2', 
  }, 

  imagePreviewImg: { 
    width: '100%', 
    height: '180px', 
    objectFit: 'cover', 
    display: 'block', 
  }, 

  imageRemoveBtn: { 
    position: 'absolute', 
    top: '8px', 
    right: '8px', 
    background: 'rgba(255, 107, 107, 0.9)', 
    border: 'none', 
    borderRadius: '50%', 
    width: '28px', 
    height: '28px', 
    color: '#fff', 
    fontSize: '14px', 
    cursor: 'pointer', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    transition: 'all 0.2s ease', 
  }, 

  //Botones 
  buttonGroup: { 
    display: 'flex', 
    gap: '12px', 
    justifyContent: 'flex-end', 
    marginTop: '32px', 
    paddingTop: '24px', 
    borderTop: '1px solid rgba(255, 255, 255, 0.08)', 
  }, 

  btnPrimary: { 
    background: 'linear-gradient(135deg, #00ff88 0%, #00cc6a 100%)', 
    border: 'none', 
    borderRadius: '10px', 
    padding: '14px 32px', 
    fontSize: '14px', 
    fontWeight: 600, 
    color: '#0a0a0a', 
    cursor: 'pointer', 
    transition: 'all 0.3s ease', 
    boxShadow: '0 4px 20px rgba(0, 255, 136, 0.25)', 
    display: 'flex', 
    alignItems: 'center', 
    gap: '8px', 
  }, 

  btnSecondary: { 
    background: 'transparent', 
    border: '1px solid rgba(255, 255, 255, 0.15)', 
    borderRadius: '10px', 
    padding: '14px 28px', 
    fontSize: '14px', 
    fontWeight: 500, 
    color: '#aaa', 
    cursor: 'pointer', 
    transition: 'all 0.3s ease', 
  }, 

  btnDanger: { 
    background: 'rgba(255, 107, 107, 0.15)', 
    border: '1px solid rgba(255, 107, 107, 0.3)', 
    borderRadius: '10px', 
    padding: '14px 28px', 
    fontSize: '14px', 
    fontWeight: 500, 
    color: '#ff6b6b', 
    cursor: 'pointer', 
    transition: 'all 0.3s ease', 
  }, 

  //mensajes 
  successMessage: { 
    background: 'rgba(0, 255, 136, 0.08)', 
    border: '1px solid rgba(0, 255, 136, 0.3)', 
    borderRadius: '12px', 
    padding: '16px 20px', 
    marginBottom: '24px', 
    display: 'flex', 
    alignItems: 'center', 
    gap: '14px', 
    animation: 'slideIn 0.3s ease', 
  }, 

  errorMessage: { 
    background: 'rgba(255, 107, 107, 0.08)', 
    border: '1px solid rgba(255, 107, 107, 0.3)', 
    borderRadius: '12px', 
    padding: '16px 20px', 
    marginBottom: '24px', 
    display: 'flex', 
    alignItems: 'center', 
    gap: '14px', 
  }, 

  messageIcon: { 
    width: '36px', 
    height: '36px', 
    borderRadius: '50%', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    fontSize: '18px', 
    flexShrink: 0, 
  }, 

  //utilidades del grid 
  fullWidth: { gridColumn: '1 / -1' }, 
  twoColumns: { gridColumn: 'span 2' }, 
  threeColumns: { gridColumn: 'span 3' }, 
 
  // Table Styles 
  tableContainer: { 
    background: 'rgba(15, 15, 25, 0.9)', 
    borderRadius: '16px', 
    border: '1px solid rgba(0, 255, 136, 0.15)', 
    overflow: 'hidden', 
  }, 

  tableHeader: { 
    background: 'rgba(0, 255, 136, 0.08)', 
    padding: '16px 24px', 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    borderBottom: '1px solid rgba(0, 255, 136, 0.15)', 
    flexWrap: 'wrap', 
    gap: '12px', 
  }, 

  tableTitle: { 
    fontSize: '14px', 
    fontWeight: 600, 
    color: '#00ff88', 
    display: 'flex', 
    alignItems: 'center', 
    gap: '10px', 
  }, 

  tableControls: { 
    display: 'flex', 
    gap: '12px', 
    alignItems: 'center', 
    flexWrap: 'wrap', 
  }, 

  tableSearch: { 
    background: 'rgba(0, 0, 0, 0.4)', 
    border: '1px solid rgba(255, 255, 255, 0.1)', 
    borderRadius: '8px', 
    padding: '8px 14px', 
    fontSize: '13px', 
    color: '#fff', 
    width: '200px', 
    outline: 'none', 
  }, 

  tableFilter: { 
    background: 'rgba(0, 0, 0, 0.4)', 
    border: '1px solid rgba(255, 255, 255, 0.1)', 
    borderRadius: '8px', 
    padding: '8px 14px', 
    fontSize: '13px', 
    color: '#fff', 
    outline: 'none', 
    cursor: 'pointer', 
  }, 

  table: { 
    width: '100%', 
    borderCollapse: 'collapse', 
  }, 

  th: { 
    padding: '14px 20px', 
    textAlign: 'left', 
    fontSize: '11px', 
    fontWeight: 600, 
    color: '#00ff88', 
    textTransform: 'uppercase', 
    letterSpacing: '1px', 
    borderBottom: '1px solid rgba(0, 255, 136, 0.15)', 
    background: 'rgba(0, 0, 0, 0.2)', 
  }, 

  td: { 
    padding: '14px 20px', 
    fontSize: '13px', 
    color: '#e0e0e0', 
    borderBottom: '1px solid rgba(255, 255, 255, 0.04)', 
  }, 

  tableRow: { 
    transition: 'background 0.2s ease', 
    cursor: 'pointer', 
  }, 

  statusBadge: { 
    padding: '5px 10px', 
    borderRadius: '20px', 
    fontSize: '10px', 
    fontWeight: 600, 
    textTransform: 'uppercase', 
    letterSpacing: '0.5px', 
    display: 'inline-block', 
  }, 

  actionBtn: { 
    background: 'transparent', 
    border: '1px solid rgba(255, 255, 255, 0.15)', 
    borderRadius: '6px', 
    padding: '6px 12px', 
    fontSize: '11px', 
    color: '#aaa', 
    cursor: 'pointer', 
    transition: 'all 0.2s ease', 
    marginRight: '6px', 
  }, 

  loadingSpinner: { 
    display: 'inline-block', 
    width: '18px', 
    height: '18px', 
    border: '2px solid rgba(10, 10, 10, 0.3)', 
    borderTopColor: '#0a0a0a', 
    borderRadius: '50%', 
    animation: 'spin 0.8s linear infinite', 
  }, 

  //seccion de estadisticas 
  statsRow: { 
    display: 'grid', 
    gridTemplateColumns: 'repeat(4, 1fr)', 
    gap: '16px', 
    marginBottom: '24px', 
  }, 

  statCard: { 
    background: 'rgba(15, 15, 25, 0.9)', 
    borderRadius: '12px', 
    border: '1px solid rgba(0, 255, 136, 0.1)', 
    padding: '20px', 
    display: 'flex', 
    alignItems: 'center', 
    gap: '16px', 
  }, 

  statIcon: { 
    width: '48px', 
    height: '48px', 
    borderRadius: '10px', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    fontSize: '22px', 
  }, 

  statValue: { 
    fontSize: '28px', 
    fontWeight: 700, 
    color: '#fff', 
    lineHeight: 1, 
  }, 

  statLabel: { 
    fontSize: '11px', 
    color: '#888', 
    textTransform: 'uppercase', 
    letterSpacing: '0.5px', 
    marginTop: '4px', 
  }, 

  //vacio 
  emptyState: { 
    textAlign: 'center', 
    padding: '60px 20px', 
    color: '#666', 
  }, 

  emptyIcon: { 
    fontSize: '48px', 
    marginBottom: '16px', 
    opacity: 0.5, 
  }, 

  emptyText: { 
    fontSize: '14px', 
    marginBottom: '8px', 
  }, 

  // Modal 

  modalOverlay: { 
    position: 'fixed', 
    top: 0, 
    left: 0, 
    right: 0, 
    bottom: 0, 
    background: 'rgba(0, 0, 0, 0.8)', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    zIndex: 1000, 
    backdropFilter: 'blur(4px)', 
  }, 

  modal: { 
    background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 100%)', 
    borderRadius: '16px', 
    border: '1px solid rgba(0, 255, 136, 0.2)', 
    padding: '32px', 
    maxWidth: '500px', 
    width: '90%', 
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)', 
  }, 

  modalTitle: { 
    fontSize: '20px', 
    fontWeight: 600, 
    color: '#00ff88', 
    marginBottom: '16px', 
    display: 'flex', 
    alignItems: 'center', 
    gap: '10px', 
  }, 

  modalText: { 
    fontSize: '14px', 
    color: '#aaa', 
    marginBottom: '24px', 
    lineHeight: 1.6, 
  }, 

  modalButtons: { 
    display: 'flex', 
    gap: '12px', 
    justifyContent: 'flex-end', 
  }, 

  // Paginacion 
  pagination: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: '16px 24px', 
    borderTop: '1px solid rgba(255, 255, 255, 0.05)', 
  }, 

  pageInfo: { 
    fontSize: '12px', 
    color: '#888', 
  }, 
}); 

// colores dependiendo del estado 
const getStatusStyle = (status) => { 
  const statusColors = { 
    'En prensa': { background: 'rgba(0, 255, 136, 0.15)', color: '#00ff88', border: '1px solid rgba(0, 255, 136, 0.3)' }, 
    'Listo-BackUp': { background: 'rgba(0, 200, 255, 0.15)', color: '#00c8ff', border: '1px solid rgba(0, 200, 255, 0.3)' }, 
    'Listo': { background: 'rgba(100, 255, 100, 0.15)', color: '#64ff64', border: '1px solid rgba(100, 255, 100, 0.3)' }, 
    'Reparando': { background: 'rgba(255, 200, 0, 0.15)', color: '#ffc800', border: '1px solid rgba(255, 200, 0, 0.3)' }, 
    'Pendiente': { background: 'rgba(255, 107, 107, 0.15)', color: '#ff6b6b', border: '1px solid rgba(255, 107, 107, 0.3)' }, 
    'Baja': { background: 'rgba(128, 128, 128, 0.15)', color: '#888', border: '1px solid rgba(128, 128, 128, 0.3)' }, 
  }; 
  return statusColors[status] || statusColors['Pendiente']; 
}; 

//generar array de años 
const generateYears = () => { 
  const currentYear = new Date().getFullYear(); 
  const years = []; 
  for (let i = currentYear - 15; i <= currentYear + 5; i++) { 
    years.push(i); 
  } 
  return years.reverse(); 
}; 

//opciones de prensa 
const PRESS_OPTIONS = [ 
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

//opciones de tipo de troquel 
const DIE_TYPE_OPTIONS = [ 
  { value: 'progresivo', label: 'Progresivo' }, 
  { value: 'transfer', label: 'Transfer' }, 
  { value: 'compound', label: 'Compound' }, 
  { value: 'simple', label: 'Simple' }, 
]; 

//opciones del cliente 
const CLIENT_OPTIONS = [ 
  { value: '', label: 'Seleccionar cliente' }, 
  { value: 'interno', label: 'Uso Interno' }, 
  { value: 'cliente_a', label: 'Cliente A' }, 
  { value: 'cliente_b', label: 'Cliente B' }, 
  { value: 'cliente_c', label: 'Cliente C' }, 
]; 

const AdminDieRegistration = ({ onNavigateBack }) => { 
  const styles = useMemo(() => createStyles(), []); 
  const years = useMemo(() => generateYears(), []); 

  //estado de pestaña 
  const [activeTab, setActiveTab] = useState('register'); 

  //estado del form 
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

    //campos extendidos 
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

  //estado de lista 
  const [dies, setDies] = useState([]); 
  const [isLoading, setIsLoading] = useState(false); 
  const [searchTerm, setSearchTerm] = useState(''); 
  const [filterYear, setFilterYear] = useState(''); 
  const [filterStatus, setFilterStatus] = useState(''); 

  //estado del modal 
  const [showDeleteModal, setShowDeleteModal] = useState(false); 
  const [dieToDelete, setDieToDelete] = useState(null); 
  const [editingDie, setEditingDie] = useState(null); 

  //estadisticas 
  const [stats, setStats] = useState({ 
    total: 0, 
    activos: 0, 
    reparando: 0, 
    pendientes: 0, 
  }); 
 
  //obtener troqueles cuando se cambie a la pestaña de administracion 

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

        //calcular estadisticas 
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

      //reiniciar form 
      handleReset(); 
      setEditingDie(null); 

      //refrescar lista si se esta en pestaña de manejo
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

  //troqueles filtrados 
  const filteredDies = useMemo(() => { 
    return dies.filter(die => { 
      const matchesSearch = !searchTerm ||  
        die.id?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        die.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        die.model?.toLowerCase().includes(searchTerm.toLowerCase()); 
      return matchesSearch; 
    }); 
  }, [dies, searchTerm]); 

  //helper en estilo de inpout 

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

 

        {/* REGISTER TAB */} 

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

 

        {/* MANAGE TAB */} 

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
                    style={{...styles.btnPrimary, padding: '10px 20px', fontSize: '13px'}} 
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

                                ✏️ Editar 

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

                                🗑️ Eliminar 

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

              <span>⚠️</span> 

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

      <style>{` 

        @keyframes spin { 

          to { transform: rotate(360deg); } 

        } 

        @keyframes slideIn { 

          from { 

            opacity: 0; 

            transform: translateY(-10px); 

          } 

          to { 

            opacity: 1; 

            transform: translateY(0); 

          } 

        } 

        @keyframes scanLine { 

          0% { top: 0; opacity: 1; } 

          50% { opacity: 0.5; } 

          100% { top: 100vh; opacity: 1; } 

        } 

        option { 

          background: #1a1a2e; 

          color: #fff; 

        } 

        input[type="date"]::-webkit-calendar-picker-indicator { 

          filter: invert(0.8); 

          cursor: pointer; 

        } 

        ::-webkit-scrollbar { 

          width: 8px; 

          height: 8px; 

        } 

        ::-webkit-scrollbar-track { 

          background: rgba(0, 0, 0, 0.2); 

        } 

        ::-webkit-scrollbar-thumb { 

          background: rgba(0, 255, 136, 0.3); 

          border-radius: 4px; 

        } 

        ::-webkit-scrollbar-thumb:hover { 

          background: rgba(0, 255, 136, 0.5); 

        } 

      `}</style> 

    </div> 

  ); 

}; 
export default AdminDieRegistration; 