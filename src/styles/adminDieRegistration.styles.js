// AdminDieRegistration.styles.js estilos para el componente de registro de troqueles 

// Status color mapping  

 

export const getStatusStyle = (status) => {  

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

  

// Generate year options  

export const generateYears = () => {  

  const currentYear = new Date().getFullYear();  

  const years = [];  

  for (let i = currentYear - 15; i <= currentYear + 5; i++) {  

    years.push(i);  

  }  

  return years.reverse();  

};  

 

// Press options  

export const PRESS_OPTIONS = [  

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

 

// Die type options  

export const DIE_TYPE_OPTIONS = [  

  { value: 'progresivo', label: 'Progresivo' },  

  { value: 'transfer', label: 'Transfer' },  

  { value: 'compound', label: 'Compound' },  

  { value: 'simple', label: 'Simple' },  

];  

 

// Client options  

export const CLIENT_OPTIONS = [  

  { value: '', label: 'Seleccionar cliente' },  

  { value: 'interno', label: 'Uso Interno' },  

  { value: 'cliente_a', label: 'Cliente A' },  

  { value: 'cliente_b', label: 'Cliente B' },  

  { value: 'cliente_c', label: 'Cliente C' },  

];  

 

// CSS animations as string 

export const cssAnimations = `  

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

`;  

 

// Main styles object 

export const createStyles = () => ({  

 

  // Container 

  container: {  

    minHeight: '100vh',  

    background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #0f0f23 100%)',  

    color: '#e0e0e0',  

    fontFamily: "'Segoe UI', system-ui, sans-serif",  

    position: 'relative',  
    
    overflow: 'hidden',

    flexDirection:'column'
  },  

 

  // Grid overlay  

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

 

  // Scan line effect  

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

 

  // Header  

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

 

  // Main content  

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

 

  // Tabs 

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

 

  // Form container  

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

 

  // Form elements  

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

 

  // Image upload  

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

 

  // Buttons  

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

 

  // Messages  

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

 

  // Grid utilities  

  fullWidth: { gridColumn: '1 / -1' },  

  twoColumns: { gridColumn: 'span 2' },  

  threeColumns: { gridColumn: 'span 3' },  

 

  // Table styles  

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

 

  // Stats section  

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

 

  // Empty state  

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

 

  // Pagination  

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

 

export default createStyles; 

 