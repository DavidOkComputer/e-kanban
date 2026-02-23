// EKanban.styles.js  
//mapeo de color de estado 
export const statusColors = {
	'En prensa': '#009b4a',
	'Listo-BackUp': '#00d4ff',
	'Listo': '#00e5ff',
	'Reparando': '#ff4466',
	'Pendiente': '#ffaa00',
	'Baja':'#666666'
};

//opciones de estatus con colores 
export const statuses = [{
	name: 'En prensa',
	color: '#009b4a'
}, {
	name: 'Listo-BackUp',
	color: '#009b4a'
}, {
	name: 'Listo',
	color: '#009b4a'
}, {
	name: 'Reparando',
	color: '#ff4466'
}, {
	name: 'Pendiente',
	color: '#ffaa00'
}, {
	name: 'Set up',
	color: '#00e5ff'
}, {
	name: 'Por reparar',
	color: '#ffee00'
},{
	name: 'Baja',
	color: '#cccccc'
}, ];

export const injectStyles = () => {
	if (document.getElementById('ekanban-styles')) return;
	const style = document.createElement('style');
	style.id = 'ekanban-styles';
	style.textContent = `  
    @keyframes neonPulse {  
    	0%, 100% { opacity: 1; box-shadow: 0 0 8px var(--sc, #009b4a), 0 0 16px var(--sc-fade, rgba(0,255,136,0.4)); }  
    	50% { opacity: 0.85; box-shadow: 0 0 4px var(--sc, #009b4a), 0 0 8px var(--sc-fade, rgba(0,255,136,0.2)); }  
    }  
    
    @keyframes fadeIn { 
    	from { opacity: 0; } 
    	to { opacity: 1; } 
    }  
    
    @keyframes pulse { 
    	0%, 100% { opacity: 1; } 
    	50% { opacity: 0.5; } 
    }  
    
    @keyframes modalIn { 
    	from { opacity: 0; transform: scale(0.95); } 
    	to { opacity: 1; transform: scale(1); } 
    }  
    
    @keyframes slideInRight {
    	from {
        	transform: translateX(400px);
        	opacity: 0;
    	}
    	to {
        	transform: translateX(0);
        	opacity: 1;
    	}
    }
    
    @keyframes slideOutRight {
    	from {
        	transform: translateX(0);
        	opacity: 1;
    	}
    	to {
        	transform: translateX(400px);
        	opacity: 0;
    	}
    }
    
    .ki { 
    	animation: neonPulse 2.5s ease-in-out infinite; 
    	transition: transform 0.2s, box-shadow 0.2s; 
    }  
    
    .ki:hover { 
    	transform: translateY(-4px) scale(1.08); 
    	box-shadow: 0 0 20px var(--sc, #00ff88), 0 0 40px var(--sc-fade, rgba(0,255,136,0.5)) !important; 
    }  
    
    .search-input:focus { 
    	border-color: #009b4a !important; 
    	box-shadow: 0 0 12px rgba(0,255,136,0.4) !important; 
    }  
    
    .kanban-scroll::-webkit-scrollbar { height: 6px; }  
    .kanban-scroll::-webkit-scrollbar-track { background: rgba(0,0,0,0.3); border-radius: 3px; }  
    .kanban-scroll::-webkit-scrollbar-thumb { background: #00ff88; border-radius: 3px; }  
    
    .col-card:hover { 
    	box-shadow: 0 0 16px rgba(0,255,136,0.2), 0 6px 24px rgba(0,0,0,0.3); 
    }  
    
    .pri:hover { 
    	background: rgba(0,255,136,0.12) !important; 
    	transform: translateY(-1px); 
    }  
    
    .tab-btn:hover { 
    	background: rgba(0,255,136,0.1) !important; 
    }  
    
    .form-el:focus { 
    	border-color: #00ff88 !important; 
    	box-shadow: 0 0 8px rgba(0,255,136,0.3) !important; 
    	outline: none; 
    }  
    
    .close-btn:hover { 
    	background: rgba(255,68,102,0.9) !important; 
    }  
    
    .loading { 
    	animation: pulse 1s infinite; 
    }  
    
    .logo-btn { 
    	transition: all 0.3s ease; 
    }  
    
    .logo-btn:hover { 
    	transform: scale(1.05); 
    	box-shadow: 0 0 25px rgba(0,255,136,0.5) !important; 
    }  
	`;
	document.head.appendChild(style);
};

//estilos del componente  
export const styles = {
	//contenedor principal 
	container: {
		height: '100vh',
		background: 'linear-gradient(135deg, #0a0f0d 0%, #0d1a14 50%, #081210 100%)',
		fontFamily: "'Segoe UI', Roboto, -apple-system, BlinkMacSystemFont, sans-serif",
		display: 'flex',
		flexDirection: 'column',
		overflow: 'hidden',
		position: 'relative',
	},
	gridOverlay: {
		position: 'absolute',
		inset: 0,
		backgroundImage: 'linear-gradient(rgba(0,255,136,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,136,0.02) 1px, transparent 1px)',
		backgroundSize: '50px 50px',
		pointerEvents: 'none',
	},
	// Header  
	header: {
		display: 'grid',
		gridTemplateColumns: '1fr auto 1fr',
		alignItems: 'center',
		padding: '12px 24px',
		background: 'rgba(10,20,15,0.9)',
		borderBottom: '2px solid #00ff88',
		boxShadow: '0 4px 24px rgba(0,255,136,0.15)',
		flexShrink: 0,
		position: 'relative',
		zIndex: 10,
	},
	//boton de logo 
	logoButton: {
		width: 48,
		height: 48,
		background: 'linear-gradient(135deg, #00ff88 0%, #00cc6a 100%)',
		borderRadius: 10,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		boxShadow: '0 0 20px rgba(0,255,136,0.4)',
		cursor: 'pointer',
		border: '2px solid #00ff88',
	},
	logoIcon: {
		fontSize: 22,
		fontWeight: 800,
		color: '#0a0f0d',
		textShadow: '0 1px 2px rgba(0,0,0,0.2)',
	},
	//titulo  
	title: {
		fontSize: 26,
		fontWeight: 800,
		color: '#fff',
		margin: 0,
		letterSpacing: 1,
		textAlign: 'center',
		textShadow: '0 0 24px rgba(0,255,136,0.5)',
	},
	titleHighlight: {
		color: '#00ff88',
	},
	//contenedor de busqueda  
	searchContainer: {
		display: 'flex',
		justifyContent: 'flex-end',
	},
	searchWrapper: {
		position: 'relative',
	},
	searchIcon: {
		position: 'absolute',
		left: 12,
		top: '50%',
		transform: 'translateY(-50%)',
		color: '#00ff88',
		fontSize: 14,
	},
	searchInput: {
		padding: '10px 16px 10px 36px',
		fontSize: 13,
		border: '2px solid rgba(0,255,136,0.3)',
		borderRadius: 10,
		width: 240,
		outline: 'none',
		transition: 'all 0.2s',
		background: 'rgba(0,255,136,0.05)',
		fontWeight: 500,
		color: '#fff',
	},
	//banner de error  
	errorBanner: {
		background: 'rgba(255,68,102,0.2)',
		color: '#ff4466',
		padding: '8px 24px',
		fontSize: 12,
		textAlign: 'center',
	},
	//area de scroll de kabnab 
	kanbanScroll: {
		padding: '20px 24px',
		overflowX: 'auto',
		flex: 1,
		position: 'relative',
		zIndex: 5,
	},
	kanbanContainer: {
		display: 'flex',
		gap: 16,
		minWidth: 'fit-content',
	},
	//estado de carga  
	loadingContainer: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		height: '100%',
		color: '#00ff88',
		fontSize: 16,
	},
	//paneles inferiores 
	bottomPanels: {
		padding: '0 24px 16px',
		display: 'flex',
		gap: 12,
		flexShrink: 0,
		position: 'relative',
		zIndex: 5,
		alignItems: 'flex-start',
	},
	//items del kanban 
	kanbanItem: {
		background: 'rgba(0,40,20,0.85)',
		color: '#00ff88',
		width: 72,
		height: 72,
		borderRadius: 10,
		cursor: 'pointer',
		position: 'relative',
		border: '2px solid #00ff88',
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		justifyContent: 'center',
		padding: 6,
		boxSizing: 'border-box',
	},
	kanbanItemTooltip: {
		position: 'absolute',
		bottom: 'calc(100% + 8px)',
		left: '50%',
		transform: 'translateX(-50%)',
		background: 'rgba(0,20,10,0.95)',
		color: '#00ff88',
		padding: '8px 12px',
		borderRadius: 6,
		fontSize: 11,
		whiteSpace: 'nowrap',
		zIndex: 100,
		border: '1px solid #00ff88',
		boxShadow: '0 0 16px rgba(0,255,136,0.4)',
	},
	kanbanItemTooltipArrow: {
		position: 'absolute',
		bottom: -5,
		left: '50%',
		transform: 'translateX(-50%)',
		borderLeft: '5px solid transparent',
		borderRight: '5px solid transparent',
		borderTop: '5px solid #00ff88',
	},
	kanbanItemId: {
		fontSize: 10,
		fontWeight: 700,
		textShadow: '0 0 8px rgba(0,255,136,0.7)',
	},
	kanbanItemName: {
		fontSize: 11,
		fontWeight: 600,
		marginTop: 3,
		textShadow: '0 0 8px rgba(0,255,136,0.7)',
	},
	//columna del kanban 
	column: {
		background: 'rgba(10,20,15,0.85)',
		borderRadius: 12,
		padding: 14,
		minWidth: 180,
		maxWidth: 180,
		boxShadow: '0 4px 20px rgba(0,0,0,0.35)',
		border: '1px solid rgba(0,255,136,0.2)',
		transition: 'box-shadow 0.2s',
	},
	columnHeader: {
		fontSize: 18,
		fontWeight: 700,
		color: '#fff',
		marginBottom: 12,
		paddingBottom: 8,
		borderBottom: '2px solid #00ff88',
		display: 'flex',
		justifyContent: 'space-between',
		alignItems: 'center',
		textShadow: '0 0 16px rgba(0,255,136,0.4)',
	},
	columnCount: {
		fontSize: 11,
		fontWeight: 600,
		color: '#000',
		background: '#00ff88',
		padding: '2px 8px',
		borderRadius: 10,
		boxShadow: '0 0 10px rgba(0,255,136,0.5)',
	},
	columnItems: {
		display: 'flex',
		flexWrap: 'wrap',
		gap: 8,
	},
	columnEmpty: {
		color: 'rgba(0,255,136,0.4)',
		fontSize: 11,
		textAlign: 'center',
		padding: 16,
		width: '100%',
		fontStyle: 'italic',
	},
	columnMore: {
		color: '#00ff88',
		fontSize: 10,
		textAlign: 'center',
		padding: 4,
		fontWeight: 600,
		background: 'rgba(0,255,136,0.1)',
		borderRadius: 6,
		width: '100%',
		border: '1px solid rgba(0,255,136,0.3)',
	},
	//base del panel 
	panel: {
		background: 'rgba(10,20,15,0.85)',
		borderRadius: 10,
		padding: 12,
		boxShadow: '0 4px 20px rgba(0,0,0,0.35)',
		border: '1px solid rgba(0,255,136,0.2)',
	},
	panelTitle: {
		fontSize: 11,
		fontWeight: 700,
		color: '#fff',
		marginBottom: 8,
		paddingBottom: 6,
		borderBottom: '2px solid #00ff88',
		margin: 0,
		textTransform: 'uppercase',
		letterSpacing: 0.5,
	},
	//tabla de troqueles 
	tableHeader: {
		padding: '4px 8px',
		fontWeight: 600,
		color: '#00ff88',
		fontSize: 9,
		textTransform: 'uppercase',
		borderBottom: '1px solid rgba(0,255,136,0.2)',
	},
	tableCell: {
		padding: '6px 8px',
		fontSize: 10,
	},
	//prioridad de reparacion 
	priorityPanel: {
		flex: 1,
	},
	priorityTitle: {
		display: 'flex',
		alignItems: 'center',
		gap: 6,
	},
	priorityIndicator: {
		width: 6,
		height: 6,
		background: '#ff4466',
		borderRadius: '50%',
		animation: 'pulse 1s infinite',
		boxShadow: '0 0 6px #ff4466',
	},
	priorityItems: {
		display: 'flex',
		gap: 8,
		flexWrap: 'wrap',
	},
	priorityItem: {
		display: 'flex',
		alignItems: 'center',
		gap: 6,
		padding: '6px 10px',
		borderRadius: 6,
		background: 'rgba(0,255,136,0.05)',
		border: '1px solid rgba(0,255,136,0.15)',
		cursor: 'pointer',
		transition: 'all 0.15s',
	},
	priorityBadge: (priority) => ({
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		width: 20,
		height: 20,
		background: priority === 1 ? '#ff4466' : priority === 2 ? '#ffaa00' : '#00ff88',
		color: '#000',
		borderRadius: 4,
		fontSize: 10,
		fontWeight: 700,
		boxShadow: `0 0 8px ${priority === 1 ? 'rgba(255,68,102,0.5)' : priority === 2 ? 'rgba(255,170,0,0.5)' : 'rgba(0,255,136,0.5)'}`,
	}),
	priorityName: {
		fontSize: 11,
		fontWeight: 600,
		color: '#fff',
	},
	//leyuenda de status 
	statusGrid: {
		display: 'grid',
		gridTemplateColumns: '1fr 1fr',
		gap: 6,
	},
	statusItem: {
		display: 'flex',
		alignItems: 'center',
		gap: 6,
	},
	statusColor: (color) => ({
		width: 16,
		height: 16,
		background: color,
		borderRadius: 3,
		boxShadow: `0 0 6px ${color}80`,
		flexShrink: 0,
	}),
	statusName: {
		fontSize: 9,
		fontWeight: 500,
		color: '#ccc',
		whiteSpace: 'nowrap',
	},
	// Modal  
	modalOverlay: {
		position: 'fixed',
		inset: 0,
		background: 'rgba(0,0,0,0.85)',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		zIndex: 1000,
		backdropFilter: 'blur(8px)',
	},
	modal: {
		background: 'rgba(10,20,15,0.98)',
		borderRadius: 14,
		width: 1000,
		height: 620,
		maxWidth: '96vw',
		maxHeight: '94vh',
		boxShadow: '0 0 50px rgba(0,255,136,0.25), 0 20px 60px rgba(0,0,0,0.5)',
		animation: 'modalIn 0.25s ease-out',
		border: '1px solid rgba(0,255,136,0.3)',
		display: 'flex',
		flexDirection: 'column',
	},
	modalHeader: {
		display: 'flex',
		justifyContent: 'space-between',
		alignItems: 'center',
		padding: '12px 20px',
		borderBottom: '2px solid rgba(0,255,136,0.3)',
		background: 'rgba(0,255,136,0.05)',
		flexShrink: 0,
	},
	modalStatusLabel: {
		display: 'flex',
		alignItems: 'center',
		gap: 10,
	},
	modalStatusText: {
		fontSize: 16,
		fontWeight: 700,
		color: '#fff',
	},
	modalStatusValue: (color) => ({
		fontSize: 16,
		fontWeight: 700,
		color: color,
		textShadow: `0 0 12px ${color}80`,
	}),
	modalCloseButton: {
		background: 'transparent',
		border: '2px solid rgba(255,255,255,0.3)',
		color: '#fff',
		fontSize: 20,
		cursor: 'pointer',
		padding: '2px 10px',
		borderRadius: 6,
		lineHeight: 1,
	},
	modalContent: {
		display: 'flex',
		flex: 1,
		overflow: 'hidden',
	},
	// panel izquierdo del modal 
	modalLeftPanel: {
		width: 260,
		borderRight: '1px solid rgba(0,255,136,0.2)',
		padding: 16,
		display: 'flex',
		flexDirection: 'column',
		gap: 12,
		overflowY: 'auto',
		flexShrink: 0,
	},
	modalImage: {
		width: '100%',
		height: 120,
		background: 'rgba(0,255,136,0.05)',
		borderRadius: 8,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		border: '2px solid rgba(0,255,136,0.2)',
	},
	modalImagePlaceholder: {
		color: 'rgba(0,255,136,0.4)',
		fontSize: 11,
	},
	modalItemInfo: {
		textAlign: 'center',
	},
	modalItemId: {
		fontSize: 26,
		fontWeight: 800,
		color: '#fff',
		textShadow: '0 0 16px rgba(0,255,136,0.4)',
	},
	modalItemModel: {
		fontSize: 13,
		color: '#00ff88',
		marginTop: 2,
	},
	modalInfoBox: {
		background: 'rgba(0,255,136,0.05)',
		borderRadius: 6,
		overflow: 'hidden',
		border: '1px solid rgba(0,255,136,0.2)',
	},
	modalInfoBoxHeader: {
		background: 'rgba(0,255,136,0.15)',
		padding: '6px 10px',
		fontSize: 10,
		fontWeight: 700,
		color: '#00ff88',
		textTransform: 'uppercase',
		textAlign: 'center',
	},
	modalInfoBoxContent: {
		padding: '8px 10px',
	},
	modalInfoRow: (isLast) => ({
		display: 'flex',
		justifyContent: 'space-between',
		padding: '4px 0',
		borderBottom: isLast ? 'none' : '1px solid rgba(0,255,136,0.1)',
	}),
	modalInfoLabel: {
		fontSize: 10,
		color: '#aaa',
	},
	modalInfoValue: {
		fontSize: 10,
		color: '#fff',
		fontWeight: 600,
	},
	//panel derecho del modal 
	modalRightPanel: {
		flex: 1,
		display: 'flex',
		flexDirection: 'column',
		overflow: 'hidden',
	},
	//pestanias del modal  
	modalTabs: {
		display: 'flex',
		borderBottom: '1px solid rgba(0,255,136,0.2)',
		flexShrink: 0,
	},
	modalTab: (isActive) => ({
		flex: 1,
		padding: '12px 16px',
		background: isActive ? 'rgba(0,255,136,0.15)' : 'transparent',
		border: 'none',
		borderBottom: isActive ? '3px solid #00ff88' : '3px solid transparent',
		color: isActive ? '#00ff88' : '#888',
		fontSize: 12,
		fontWeight: 600,
		cursor: 'pointer',
		transition: 'all 0.15s',
		textTransform: 'capitalize',
	}),
	modalTabContent: {
		flex: 1,
		padding: 16,
		overflowY: 'auto',
	},
	//form de accion 
	actionsForm: {
		display: 'flex',
		gap: 20,
	},
	actionsColumn: {
		flex: 1,
	},
	actionHeader: {
		background: 'rgba(0,155,74,0.3)',
		padding: '8px 14px',
		borderRadius: 6,
		marginBottom: 12,
		border: '1px solid rgba(0,255,136,0.3)',
	},
	actionHeaderText: {
		fontSize: 11,
		fontWeight: 600,
		color: '#fff',
	},
	actionOption: (isSelected) => ({
		display: 'flex',
		flexDirection: 'column',
		gap: 6,
		padding: '6px 10px',
		borderRadius: 6,
		cursor: 'pointer',
		background: isSelected ? 'rgba(0,255,136,0.08)' : 'transparent',
		marginBottom: 8,
	}),
	actionRadioRow: {
		display: 'flex',
		alignItems: 'center',
		gap: 8,
	},
	actionLabel: {
		fontSize: 12,
		color: '#fff',
	},
	formSelect: {
		width: '100%',
		padding: '6px 10px',
		background: 'rgba(0,0,0,0.3)',
		border: '1px solid rgba(0,255,136,0.3)',
		borderRadius: 6,
		color: '#fff',
		fontSize: 11,
		marginLeft: 20,
	},
	formSelectLabel: {
		fontSize: 11,
		color: '#aaa',
		display: 'block',
		marginBottom: 4,
	},
	formTextarea: {
		width: '100%',
		padding: '8px 10px',
		background: 'rgba(0,0,0,0.3)',
		border: '1px solid rgba(0,255,136,0.3)',
		borderRadius: 6,
		color: '#fff',
		fontSize: 11,
		resize: 'none',
	},
	submitButton: {
		marginTop: 16,
		width: '100%',
		padding: '10px',
		background: '#00ff88',
		border: 'none',
		borderRadius: 6,
		color: '#000',
		fontSize: 12,
		fontWeight: 700,
		cursor: 'pointer',
		boxShadow: '0 0 15px rgba(0,255,136,0.4)',
	},
	//pestania de historial 
	historyContainer: {
		height: '100%',
	},
	historyLoading: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		height: '100%',
		color: '#00ff88',
	},
	historyList: {
		display: 'flex',
		flexDirection: 'column',
		gap: 8,
	},
	historyItem: {
		background: 'rgba(0,255,136,0.05)',
		borderRadius: 6,
		padding: 12,
		border: '1px solid rgba(0,255,136,0.15)',
	},
	historyItemHeader: {
		display: 'flex',
		justifyContent: 'space-between',
		marginBottom: 6,
	},
	historyItemType: {
		color: '#00ff88',
		fontWeight: 600,
		fontSize: 12,
	},
	historyItemDate: {
		color: '#888',
		fontSize: 10,
	},
	historyItemFalla: {
		color: '#fff',
		fontSize: 11,
	},
	historyItemComment: {
		color: '#ccc',
		fontSize: 11,
		marginTop: 4,
	},
	historyEmpty: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		height: '100%',
		color: 'rgba(0,255,136,0.4)',
		fontSize: 13,
		fontStyle: 'italic',
	},
	// Modal footer  
	modalFooter: {
		display: 'flex',
		justifyContent: 'space-between',
		alignItems: 'center',
		padding: '10px 20px',
		borderTop: '1px solid rgba(0,255,136,0.2)',
		background: 'rgba(0,0,0,0.2)',
		flexShrink: 0,
	},
	modalFooterIcon: {
		width: 28,
		height: 28,
		borderRadius: '50%',
		background: '#00ff88',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		boxShadow: '0 0 10px rgba(0,255,136,0.4)',
	},
	modalCloseBtn: {
		background: '#ff4466',
		border: 'none',
		color: '#fff',
		padding: '8px 20px',
		borderRadius: 6,
		fontSize: 12,
		fontWeight: 600,
		cursor: 'pointer',
		transition: 'all 0.15s',
		boxShadow: '0 0 12px rgba(255,68,102,0.4)',
	},
};

export default styles;