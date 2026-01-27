 

import React, { useState, useEffect, memo, useCallback } from 'react';   

 

import {    

  statusColors,    

  statuses,    

  injectStyles,    

  styles    

} from '../styles/EKanban.styles';   

 

// Import the new RepairModal component 

import RepairModal from './RepairModal'; 

 

const API_BASE = 'http://localhost:3001/api';   

const MAX_ITEMS = 8;   

 

// Item del componente de kanban  

const KanbanItem = memo(({ item, onClick }) => {   

  const [hovered, setHovered] = useState(false);   

 

  return (   

    <div   

      className="ki"   

      onClick={() => onClick(item)}   

      onMouseEnter={() => setHovered(true)}   

      onMouseLeave={() => setHovered(false)}   

      style={styles.kanbanItem}   

    >   

      {hovered && (   

        <div style={styles.kanbanItemTooltip}>   

          {item.id} - {item.name}   

          <div style={styles.kanbanItemTooltipArrow} />   

        </div>   

      )}   

      <div style={styles.kanbanItemId}>{item.id}</div>   

      <div style={styles.kanbanItemName}>{item.name}</div>   

    </div>   

  );   

});   

 

// Columna del componente de kanban  

const KanbanColumn = memo(({ year, items, onItemClick }) => {   

  const display = items.slice(0, MAX_ITEMS);   

  return (   

    <div className="col-card" style={styles.column}>   

      <div style={styles.columnHeader}>   

        <span>{year}</span>   

        <span style={styles.columnCount}>{items.length}</span>   

      </div>   

      <div style={styles.columnItems}>   

        {display.length > 0 ? display.map(item => (   

          <KanbanItem key={item.id} item={item} onClick={onItemClick} />   

        )) : (   

         <div style={styles.columnEmpty}>No items</div>   

        )}   

        {items.length > MAX_ITEMS && (   

          <div style={styles.columnMore}>   

            +{items.length - MAX_ITEMS} more   

          </div>   

        )}   

      </div>   

    </div>   

  );   

});   

 

// Componente de tabla de troqueles   

const TroquelesTable = memo(({ data }) => (   

  <div style={styles.panel}>   

    <h3 style={styles.panelTitle}>Troqueles</h3>   

    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10 }}>   

      <thead>   

        <tr>   

          {['', '#', 'GOAL', 'PERF'].map((h, i) => (   

            <th key={i} style={{    

              ...styles.tableHeader,    

              textAlign: i === 0 ? 'left' : 'center'    

            }}>{h}</th>   

          ))}   

        </tr>   

      </thead>   

      <tbody>   

        {data.map((r, i) => (   

          <tr key={r.label} style={{ borderBottom: i < 2 ? '1px solid rgba(0,255,136,0.1)' : 'none' }}>   

            <td style={{ ...styles.tableCell, fontWeight: 600, color: '#fff' }}>{r.label}</td>   

            <td style={{ ...styles.tableCell, textAlign: 'center', color: '#ccc' }}>{r.count}</td>   

            <td style={{ ...styles.tableCell, textAlign: 'center', color: '#ccc' }}>{r.goal}</td>   

            <td style={{ ...styles.tableCell, textAlign: 'center', color: '#ccc' }}>{r.perf}</td>   

          </tr>   

        ))}   

      </tbody>   

    </table>   

  </div>   

));   

 

// Componente de prioridades de reparacion  

const PriorityRepairs = memo(({ data }) => (   

  <div style={{ ...styles.panel, ...styles.priorityPanel }}>   

    <h3 style={{ ...styles.panelTitle, ...styles.priorityTitle }}>   

      <span style={styles.priorityIndicator} />   

      Prioridad de Reparación   

    </h3>   

    <div style={styles.priorityItems}>   

      {data.map(item => (   

        <div key={item.priority} className="pri" style={styles.priorityItem}>   

          <span style={styles.priorityBadge(item.priority)}>{item.priority}</span>   

          <span style={styles.priorityName}>{item.name}</span>   

        </div>   

      ))}   

    </div>   

  </div>   

));   

 

// Componente de leyenda de estatus   

const StatusLegend = memo(() => (   

  <div style={styles.panel}>   

    <h3 style={styles.panelTitle}>Estado</h3>   

    <div style={styles.statusGrid}>   

      {statuses.map(s => (   

        <div key={s.name} style={styles.statusItem}>   

          <div style={styles.statusColor(s.color)} />   

          <span style={styles.statusName}>{s.name}</span>   

        </div>   

      ))}   

    </div>   

  </div>   

));   

 

// Custom modal styles for larger modal  

const modalStyles = {  

  overlay: {  

    position: 'fixed',  

    top: 0,  

    left: 0,  

    right: 0,  

    bottom: 0,  

    background: 'rgba(0,0,0,0.85)',  

    backdropFilter: 'blur(8px)',  

    display: 'flex',  

    alignItems: 'center',  

    justifyContent: 'center',  

    zIndex: 1000,  

    padding: '20px',  

  },  

  modal: {  

    background: 'linear-gradient(145deg, rgba(15,25,20,0.98), rgba(10,15,13,0.98))',  

    borderRadius: 16,  

    border: '1px solid rgba(0,255,136,0.3)',  

    boxShadow: '0 0 60px rgba(0,255,136,0.2), 0 25px 50px rgba(0,0,0,0.5)',  

    width: '95vw',  

    maxWidth: '1400px',  

    height: '90vh',  

    maxHeight: '850px',  

    display: 'flex',  

    flexDirection: 'column',  

    overflow: 'hidden',  

  },  

  content: {  

    display: 'flex',  

    flex: 1,  

    overflow: 'hidden',  

    gap: 0,  

  },  

  leftPanel: {  

    width: '280px',  

    minWidth: '280px',  

    borderRight: '1px solid rgba(0,255,136,0.2)',  

    padding: '16px',  

    overflowY: 'auto',  

    background: 'rgba(0,0,0,0.2)',  

  },  

  rightPanel: {  

    flex: 1,  

    display: 'flex',  

    flexDirection: 'column',  

    overflow: 'hidden',  

    minWidth: 0,  

  },  

  tabContent: {  

    flex: 1,  

    overflow: 'hidden',  

    padding: '16px',  

  },  

  actionsForm: {  

    display: 'flex',  

    gap: '20px',  

    height: '100%',  

  },  

  actionsColumn: {  

    flex: 1,  

    display: 'flex',  

    flexDirection: 'column',  

    background: 'rgba(0,0,0,0.2)',  

    borderRadius: 12,  

    padding: '14px',  

    overflow: 'hidden',  

  },  

};  

 

// Componente de modal de detalles para "En prensa" status 

const DetailModal = memo(({ item, fallas, asistenciaMotivos, onClose, onSaveAction }) => {   

  const [activeTab, setActiveTab] = useState('acciones');   

  const [action, setAction] = useState('limpieza');   

    

  // Form data for Bajar Troquel (left column)  

  const [bajaTroquelData, setBajaTroquelData] = useState({   

    folio: '',  

    falla_id: '',   

    modelo_nuevo: '',   

    nivel_setup: '',   

    grupo: '1',   

    comentarios: '',  

    empleado: ''  

  });  

 

  // Form data for Asistencia en Prensa (right column)  

  const [asistenciaData, setAsistenciaData] = useState({  

    folio: '',  

    motivo: '',   

    comentarios: '',  

    empleado: ''  

  });   

 

  const [history, setHistory] = useState([]);   

  const [loadingHistory, setLoadingHistory] = useState(false);  

  const [imageError, setImageError] = useState(false);  

  const [savingBaja, setSavingBaja] = useState(false);  

  const [savingAsistencia, setSavingAsistencia] = useState(false);  

 

  // Load history when tab changes  

  const loadHistory = useCallback(() => {  

    if (item) {  

      setLoadingHistory(true);   

      fetch(`${API_BASE}/troqueles/${item.id}/history`)   

        .then(res => res.json())   

        .then(data => {   

          setHistory(data);   

          setLoadingHistory(false);   

        })   

        .catch(err => {   

          console.error('Error loading history:', err);   

          setLoadingHistory(false);   

        });   

    }  

  }, [item]);  

 

  useEffect(() => {   

    if (activeTab === 'historial' && item) {   

      loadHistory();  

    }   

  }, [activeTab, item, loadHistory]);  

 

  // Reset image error when item changes  

  useEffect(() => {  

    setImageError(false);  

  }, [item]);  

 

  if (!item) return null;   

  const statusColor = statusColors[item.status] || '#00ff88';   

    

  // Handle submit for Bajar Troquel (left column)  

  const handleSubmitBajaTroquel = async () => {  

    if (!bajaTroquelData.empleado.trim()) {  

      alert('Por favor ingrese el nombre del empleado que ejecuta la acción');  

      return;  

    }  

 

    if (!bajaTroquelData.folio.trim()) {  

      alert('Por favor ingrese el número de folio');  

      return;  

    }  

 

    setSavingBaja(true);  

      

    // Determine action type based on radio selection  

    let actionType = 'Limpieza General';  

    if (action === 'cambio') actionType = 'Cambio de Modelo';  

    if (action === 'falla') actionType = 'Falla de Troquel';  

 

    const actionData = {   

      troquel_id: item.id,   

      tipo_registro: 'baja_troquel',  

      action_type: actionType,  

      folio: bajaTroquelData.folio,  

      falla_id: action === 'falla' ? bajaTroquelData.falla_id : null,  

      modelo_nuevo: action === 'cambio' ? bajaTroquelData.modelo_nuevo : null,  

      nivel_setup: bajaTroquelData.nivel_setup,  

      grupo: bajaTroquelData.grupo,  

      comentarios: bajaTroquelData.comentarios,  

      empleado: bajaTroquelData.empleado  

    };   

 

    try {   

      const res = await fetch(`${API_BASE}/actions/baja-troquel`, {   

        method: 'POST',   

        headers: { 'Content-Type': 'application/json' },   

        body: JSON.stringify(actionData)   

      });   

 

      if (res.ok) {   

        alert('Baja de Troquel guardada exitosamente. Estado cambiado a "Reparando"');   

        // Reset form  

        setBajaTroquelData({  

          folio: '',  

          falla_id: '',   

          modelo_nuevo: '',   

          nivel_setup: '',   

          grupo: '1',   

          comentarios: '',  

          empleado: ''  

        });  

        setAction('limpieza');  

        onSaveAction && onSaveAction();  

        // Reload history if on that tab  

        if (activeTab === 'historial') loadHistory();  

      } else {  

        const errorData = await res.json();  

        alert(`Error: ${errorData.message || 'No se pudo guardar'}`);  

      }  

    } catch (err) {   

      console.error('Error saving baja troquel:', err);   

      alert('Error al guardar la baja de troquel');   

    } finally {  

      setSavingBaja(false);  

    }  

  };  

 

  // Handle submit for Asistencia en Prensa (right column)  

  const handleSubmitAsistencia = async () => {  

    if (!asistenciaData.empleado.trim()) {  

      alert('Por favor ingrese el nombre del empleado que ejecuta la acción');  

      return;  

    }  

 

    if (!asistenciaData.folio.trim()) {  

      alert('Por favor ingrese el número de folio');  

      return;  

    }  

 

    if (!asistenciaData.motivo) {  

      alert('Por favor seleccione un motivo de asistencia');  

      return;  

    }  

 

    setSavingAsistencia(true);  

 

    const actionData = {   

      troquel_id: item.id,   

      tipo_registro: 'asistencia_prensa',  

      folio: asistenciaData.folio,  

      motivo_id: asistenciaData.motivo,  

      comentarios: asistenciaData.comentarios,  

      empleado: asistenciaData.empleado  

    };   

 

    try {   

      const res = await fetch(`${API_BASE}/actions/asistencia-prensa`, {   

        method: 'POST',   

        headers: { 'Content-Type': 'application/json' },   

        body: JSON.stringify(actionData)   

      });   

 

      if (res.ok) {   

        alert('Asistencia en Prensa guardada exitosamente. Estado cambiado a "Reparando"');   

        // Reset form  

        setAsistenciaData({  

          folio: '',  

          motivo: '',   

          comentarios: '',  

          empleado: ''  

        });  

        onSaveAction && onSaveAction();  

        // Reload history if on that tab  

        if (activeTab === 'historial') loadHistory();  

      } else {  

        const errorData = await res.json();  

        alert(`Error: ${errorData.message || 'No se pudo guardar'}`);  

      }  

    } catch (err) {   

      console.error('Error saving asistencia:', err);   

      alert('Error al guardar la asistencia en prensa');   

    } finally {  

      setSavingAsistencia(false);  

    }  

  };  

 

  const SelectBox = ({ label, value, onChange, children, mt, disabled }) => (   

    <div style={{ marginTop: mt || 0 }}>   

      {label && <label style={{ display: 'block', color: '#888', fontSize: 10, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</label>}   

      <select    

        className="form-el"    

        value={value}    

        onChange={onChange}  

        disabled={disabled}  

        style={{    

          width: '100%',    

          padding: '7px 10px',    

          background: 'rgba(0,0,0,0.3)',    

          border: '1px solid rgba(0,255,136,0.3)',    

          borderRadius: 6,    

          color: '#fff',    

          fontSize: 11,  

          opacity: disabled ? 0.5 : 1  

        }}   

      >   

        {children}   

      </select>   

    </div>   

  );   

 

  const TextArea = ({ label, value, onChange, h, mt, disabled }) => (   

    <div style={{ marginTop: mt || 0 }}>   

      {label && <label style={{ display: 'block', color: '#888', fontSize: 10, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</label>}   

      <textarea    

        className="form-el"    

        value={value}    

        onChange={onChange}  

        disabled={disabled}  

        style={{   

          width: '100%',  

          padding: '8px 10px',  

          background: 'rgba(0,0,0,0.3)',  

          border: '1px solid rgba(0,255,136,0.3)',  

          borderRadius: 6,  

          color: '#fff',  

          fontSize: 11,  

          resize: 'none',  

          boxSizing: 'border-box',  

          height: h || 60,   

          opacity: disabled ? 0.5 : 1   

        }}    

      />   

    </div>   

  );  

 

  const InputBox = ({ label, value, onChange, placeholder, mt, disabled, type = 'text' }) => (  

    <div style={{ marginTop: mt || 0 }}>  

      {label && <label style={{ display: 'block', color: '#888', fontSize: 10, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</label>}  

      <input  

        type={type}  

        className="form-el"  

        value={value}  

        onChange={onChange}  

        placeholder={placeholder}  

        disabled={disabled}  

        style={{  

          width: '100%',  

          padding: '7px 10px',  

          background: 'rgba(0,0,0,0.3)',  

          border: '1px solid rgba(0,255,136,0.3)',  

          borderRadius: 6,  

          color: '#fff',  

          fontSize: 11,  

          outline: 'none',  

          boxSizing: 'border-box',  

          opacity: disabled ? 0.5 : 1  

        }}  

      />  

    </div>  

  );  

 

  // Button style helper  

  const getButtonStyle = (isLoading, baseColor = '#00ff88') => ({  

    width: '100%',  

    padding: '10px 16px',  

    background: isLoading ? 'rgba(100,100,100,0.3)' : `linear-gradient(135deg, ${baseColor}, ${baseColor}aa)`,  

    border: `1px solid ${baseColor}`,  

    borderRadius: 8,  

    color: isLoading ? '#888' : '#0a0f0d',  

    fontSize: 11,  

    fontWeight: 700,  

    cursor: isLoading ? 'not-allowed' : 'pointer',  

    textTransform: 'uppercase',  

    letterSpacing: 0.5,  

    transition: 'all 0.3s ease',  

    boxShadow: isLoading ? 'none' : `0 0 15px ${baseColor}40`,  

    marginTop: 'auto',  

  });  

 

  // Check if item has a valid image URL  

  const hasImage = item.imageUrl && !imageError;  

 

  // History item component for better organization  

  const HistoryItem = ({ h }) => {  

    const isAsistencia = h.tipo_registro === 'asistencia_prensa';  

    const borderColor = isAsistencia ? '#00c8ff' : '#00ff88';  

    const titleColor = isAsistencia ? '#00c8ff' : '#00ff88';  

    const icon = isAsistencia ? '' : '';  

    const typeLabel = isAsistencia ? 'Asistencia en Prensa' : 'Baja de Troquel';  

 

    return (  

      <div style={{  

        background: 'rgba(0,0,0,0.3)',  

        borderRadius: 10,  

        padding: '14px 16px',  

        marginBottom: 12,  

        borderLeft: `4px solid ${borderColor}`,  

        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',  

      }}>  

        {/* Header with type and date */}  

        <div style={{  

          display: 'flex',  

          justifyContent: 'space-between',  

          alignItems: 'flex-start',  

          marginBottom: 10,  

          flexWrap: 'wrap',  

          gap: 8,  

        }}>  

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>  

            <span style={{ fontSize: 16 }}>{icon}</span>  

            <span style={{ color: titleColor, fontWeight: 700, fontSize: 13, textTransform: 'uppercase' }}>  

              {typeLabel}  

            </span>  

            {h.folio && (  

              <span style={{  

                background: 'rgba(255,200,0,0.2)',  

                color: '#ffc800',  

                padding: '2px 8px',  

                borderRadius: 4,  

                fontSize: 10,  

                fontWeight: 600,  

              }}>  

                Folio: {h.folio}  

              </span>  

            )}  

          </div>  

          <span style={{ color: '#888', fontSize: 11, background: 'rgba(255,255,255,0.05)', padding: '3px 8px', borderRadius: 4 }}>  

            {new Date(h.created_at).toLocaleString()}  

          </span>  

        </div>  

 

        {/* Action type / Reason */}  

        <div style={{  

          background: 'rgba(255,255,255,0.05)',  

          borderRadius: 6,  

          padding: '10px 12px',  

          marginBottom: 10,  

        }}>  

          <div style={{ color: '#aaa', fontSize: 10, marginBottom: 2, textTransform: 'uppercase' }}>  

            {isAsistencia ? 'Motivo de Asistencia' : 'Tipo de Acción'}  

          </div>  

          <div style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>  

            {h.action_type || '-'}  

          </div>  

        </div>  

 

        {/* Only show Falla for baja_troquel records */}  

        {!isAsistencia && h.falla_description && (  

          <div style={{  

            background: 'rgba(255,107,107,0.1)',  

            borderRadius: 6,  

            padding: '10px 12px',  

            marginBottom: 10,  

            border: '1px solid rgba(255,107,107,0.2)',  

          }}>  

            <div style={{ color: '#ff6b6b', fontSize: 10, marginBottom: 2, textTransform: 'uppercase' }}>  

              Falla Registrada  

            </div>  

            <div style={{ color: '#fff', fontSize: 12, fontWeight: 500 }}>  

              {h.falla_description}  

            </div>  

          </div>  

        )}  

 

        {/* Comments */}  

        {h.comentarios && (  

          <div style={{  

            background: 'rgba(255,255,255,0.03)',  

            borderRadius: 6,  

            padding: '10px 12px',  

            marginBottom: 10,  

          }}>  

            <div style={{ color: '#aaa', fontSize: 10, marginBottom: 2, textTransform: 'uppercase' }}>  

              Comentarios  

            </div>  

            <div style={{ color: '#ddd', fontSize: 12, lineHeight: 1.4 }}>  

              {h.comentarios}  

            </div>  

          </div>  

        )}  

 

        {/* Footer with employee and additional info */}  

        <div style={{  

          display: 'flex',  

          justifyContent: 'space-between',  

          alignItems: 'center',  

          flexWrap: 'wrap',  

          gap: 10,  

          paddingTop: 8,  

          borderTop: '1px solid rgba(255,255,255,0.1)',  

        }}>  

          {h.empleado && (  

            <div style={{  

              display: 'flex',  

              alignItems: 'center',  

              gap: 6,  

              background: 'rgba(255,200,0,0.1)',  

              padding: '6px 10px',  

              borderRadius: 6,  

              border: '1px solid rgba(255,200,0,0.2)',  

            }}>  

              <span style={{ fontSize: 14 }}>👤</span>  

              <div>  

                <div style={{ color: '#888', fontSize: 9, textTransform: 'uppercase' }}>Ejecutado por</div>  

                <div style={{ color: '#ffc800', fontSize: 12, fontWeight: 600 }}>{h.empleado}</div>  

              </div>  

            </div>  

          )}  

 

          {!isAsistencia && (h.nivel_setup || h.grupo) && (  

            <div style={{ display: 'flex', gap: 8 }}>  

              {h.nivel_setup && (  

                <div style={{ background: 'rgba(100,255,100,0.1)', padding: '4px 10px', borderRadius: 4, border: '1px solid rgba(100,255,100,0.2)' }}>  

                  <span style={{ color: '#888', fontSize: 9 }}>Nivel: </span>  

                  <span style={{ color: '#64ff64', fontSize: 11, fontWeight: 600 }}>{h.nivel_setup}</span>  

                </div>  

              )}  

              {h.grupo && (  

                <div style={{ background: 'rgba(100,200,255,0.1)', padding: '4px 10px', borderRadius: 4, border: '1px solid rgba(100,200,255,0.2)' }}>  

                  <span style={{ color: '#888', fontSize: 9 }}>Grupo: </span>  

                  <span style={{ color: '#64c8ff', fontSize: 11, fontWeight: 600 }}>{h.grupo}</span>  

                </div>  

              )}  

            </div>  

          )}  

        </div>  

      </div>  

    );  

  };  

 

  return (   

    <div onClick={onClose} style={modalStyles.overlay}>   

      <div onClick={e => e.stopPropagation()} style={modalStyles.modal}>   

        {/* Header */}   

        <div style={{  

          display: 'flex',  

          justifyContent: 'space-between',  

          alignItems: 'center',  

          padding: '14px 20px',  

          borderBottom: '1px solid rgba(0,255,136,0.2)',  

          background: 'rgba(0,255,136,0.05)',  

        }}>   

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>  

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>  

              <span style={{ color: '#888', fontSize: 12 }}>Estatus:</span>   

              <span style={{  

                color: statusColor,  

                fontWeight: 700,  

                fontSize: 13,  

                textShadow: `0 0 10px ${statusColor}`,  

                textTransform: 'uppercase',  

              }}>{item.status}</span>  

            </div>  

            <div style={{  

              background: 'rgba(255,200,0,0.15)',  

              border: '1px solid rgba(255,200,0,0.3)',  

              borderRadius: 6,  

              padding: '4px 12px',  

              fontSize: 11,  

              color: '#ffc800',  

            }}>  

              ⚠️ Al guardar, el estado cambiará a "Reparando"  

            </div>  

          </div>  

          <button onClick={onClose} style={{  

            background: 'transparent',  

            border: 'none',  

            color: '#888',  

            fontSize: 24,  

            cursor: 'pointer',  

            padding: '0 8px',  

            lineHeight: 1,  

          }}>×</button>   

        </div>   

 

        {/* Contenido */}   

        <div style={modalStyles.content}>   

          {/* Panel izquierdo */}   

          <div style={modalStyles.leftPanel}>   

            {/* Image from database or placeholder */}  

            <div style={{  

              width: '100%',  

              height: '140px',  

              borderRadius: 8,  

              overflow: 'hidden',  

              marginBottom: 12,  

              border: '1px solid rgba(0,255,136,0.2)',  

            }}>   

              {hasImage ? (  

                <img   

                  src={item.imageUrl}   

                  alt={`Troquel ${item.id}`}  

                  onError={() => setImageError(true)}  

                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}  

                />  

              ) : (  

                <div style={{  

                  width: '100%',  

                  height: '100%',  

                  display: 'flex',  

                  flexDirection: 'column',  

                  alignItems: 'center',  

                  justifyContent: 'center',  

                  background: 'rgba(0,0,0,0.3)',  

                }}>  
 

                  <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11 }}>Sin imagen</span>  

                </div>  

              )}  

            </div>   

 

            <div style={{  

              textAlign: 'center',  

              marginBottom: 12,  

              padding: '10px',  

              background: 'rgba(0,255,136,0.1)',  

              borderRadius: 8,  

              border: '1px solid rgba(0,255,136,0.2)',  

            }}>   

              <div style={{ color: '#00ff88', fontSize: 22, fontWeight: 800, textShadow: '0 0 20px rgba(0,255,136,0.5)' }}>{item.id}</div>   

              <div style={{ color: '#888', fontSize: 12 }}>{item.model || '-'}</div>   

            </div>   

 

            <div style={{  

              background: 'rgba(0,0,0,0.3)',  

              borderRadius: 8,  

              border: '1px solid rgba(0,255,136,0.15)',  

              overflow: 'hidden',  

              marginBottom: 12,  

            }}>   

              <div style={{  

                background: 'rgba(0,255,136,0.1)',  

                padding: '8px 12px',  

                fontSize: 11,  

                fontWeight: 600,  

                color: '#00ff88',  

                textTransform: 'uppercase',  

                letterSpacing: 0.5,  

              }}>Información del Troquel</div>   

              <div style={{ padding: '8px 12px' }}>   

                {[   

                  ['Golpes:', item.golpes],    

                  ['Golpes Acum:', item.golpesAcum],    

                  ['Capacidad:', item.capacidadGolpes],    

                  ['Rectificaciones:', item.rectificaciones]   

                ].map(([l, v], i) => (   

                  <div key={i} style={{  

                    display: 'flex',  

                    justifyContent: 'space-between',  

                    padding: '4px 0',  

                    borderBottom: i < 3 ? '1px solid rgba(0,255,136,0.1)' : 'none',  

                  }}>   

                    <span style={{ color: '#888', fontSize: 10 }}>{l}</span>   

                    <span style={{ color: '#fff', fontSize: 10, fontWeight: 500 }}>{v || '-'}</span>   

                  </div>   

                ))}   

              </div>   

            </div>   

          </div>   

 

          {/* Panel derecho */}   

          <div style={modalStyles.rightPanel}>   

            <div style={{  

              display: 'flex',  

              borderBottom: '1px solid rgba(0,255,136,0.2)',  

            }}>   

              {['acciones', 'historial'].map(tab => (   

                <button    

                  key={tab}    

                  className="tab-btn"    

                  onClick={() => setActiveTab(tab)}    

                  style={{  

                    flex: 1,  

                    padding: '12px 20px',  

                    background: activeTab === tab ? 'rgba(0,255,136,0.1)' : 'transparent',  

                    border: 'none',  

                    borderBottom: activeTab === tab ? '2px solid #00ff88' : '2px solid transparent',  

                    color: activeTab === tab ? '#00ff88' : '#888',  

                    fontSize: 12,  

                    fontWeight: 600,  

                    textTransform: 'uppercase',  

                    letterSpacing: 1,  

                    cursor: 'pointer',  

                    transition: 'all 0.2s ease',  

                  }}   

                >   

                  {tab}   

                </button>   

              ))}   

            </div>   

 

            <div style={modalStyles.tabContent}>   

              {activeTab === 'acciones' ? (   

                <div style={modalStyles.actionsForm}>   

                  {/* LEFT COLUMN - Bajar Troquel */}  

                  <div style={modalStyles.actionsColumn}>   

                    <div style={{  

                      background: 'linear-gradient(135deg, rgba(0,255,136,0.2), rgba(0,255,136,0.1))',  

                      border: '1px solid rgba(0,255,136,0.3)',  

                      borderRadius: 8,  

                      padding: '10px 14px',  

                      marginBottom: 12,  

                    }}>   

                      <span style={{ color: '#00ff88', fontWeight: 700, fontSize: 12, textTransform: 'uppercase' }}> Bajar Troquel por:</span>   

                    </div>   

 

                    {/* Folio input */}  

                    <InputBox   

                      label="Folio: *"   

                      value={bajaTroquelData.folio}   

                      onChange={(e) => setBajaTroquelData({...bajaTroquelData, folio: e.target.value})}   

                      placeholder="Número de folio"  

                    />  

 

                    {/* Action type radio buttons */}  

                    <div style={{ marginTop: 10 }}>  

                      {[   

                        { id: 'limpieza', label: 'Limpieza General' },    

                        { id: 'cambio', label: 'Cambio de Modelo', select: true },    

                        { id: 'falla', label: 'Falla de Troquel', select: true }   

                      ].map(opt => (   

                        <label key={opt.id} style={{  

                          display: 'block',  

                          padding: '8px 10px',  

                          marginBottom: 4,  

                          background: action === opt.id ? 'rgba(0,255,136,0.1)' : 'transparent',  

                          border: `1px solid ${action === opt.id ? 'rgba(0,255,136,0.3)' : 'rgba(255,255,255,0.1)'}`,  

                          borderRadius: 6,  

                          cursor: 'pointer',  

                          transition: 'all 0.2s ease',  

                        }}>   

                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>   

                            <input    

                              type="radio"    

                              name="act"    

                              checked={action === opt.id}    

                              onChange={() => setAction(opt.id)}    

                              style={{ accentColor: '#00ff88' }}    

                            />   

                            <span style={{ color: '#fff', fontSize: 11 }}>{opt.label}</span>   

                          </div>   

 

                          {opt.select && action === opt.id && (   

                            <select    

                              className="form-el"    

                              value={opt.id === 'cambio' ? bajaTroquelData.modelo_nuevo : bajaTroquelData.falla_id}   

                              onChange={(e) => setBajaTroquelData({  

                                ...bajaTroquelData,   

                                [opt.id === 'cambio' ? 'modelo_nuevo' : 'falla_id']: e.target.value  

                              })}   

                              style={{  

                                width: '100%',  

                                marginTop: 8,  

                                padding: '6px 8px',  

                                background: 'rgba(0,0,0,0.3)',  

                                border: '1px solid rgba(0,255,136,0.3)',  

                                borderRadius: 4,  

                                color: '#fff',  

                                fontSize: 10,  

                              }}   

                            >   

                              {opt.id === 'cambio' ? (   

                                <option value="">Seleccionar Modelo</option>   

                              ) : (   

                                <>   

                                  <option value="">Seleccionar Falla</option>   

                                  {fallas.map(f => (   

                                    <option key={f.id} value={f.id}>{f.description}</option>   

                                  ))}   

                                </>   

                              )}   

                            </select>   

                          )}   

                        </label>   

                      ))}   

                    </div>  

 

                    {/* Two columns for Nivel and Grupo */}  

                    <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>  

                      <div style={{ flex: 1 }}>  

                        <SelectBox   

                          label="Nivel:"   

                          value={bajaTroquelData.nivel_setup}   

                          onChange={(e) => setBajaTroquelData({...bajaTroquelData, nivel_setup: e.target.value})}  

                        >   

                          <option value="">Seleccionar</option>   

                          <option value="1">Nivel 1</option>   

                          <option value="2">Nivel 2</option>   

                          <option value="3">Nivel 3</option>   

                        </SelectBox>  

                      </div>  

                      <div style={{ flex: 1 }}>  

                        <SelectBox   

                          label="Grupo:"   

                          value={bajaTroquelData.grupo}   

                          onChange={(e) => setBajaTroquelData({...bajaTroquelData, grupo: e.target.value})}  

                        >   

                          <option value="1">1</option>   

                          <option value="2">2</option>   

                          <option value="3">3</option>   

                        </SelectBox>  

                      </div>  

                    </div>  

 

                    <TextArea   

                      label="Comentarios:"   

                      value={bajaTroquelData.comentarios}   

                      onChange={(e) => setBajaTroquelData({...bajaTroquelData, comentarios: e.target.value})}   

                      h={50}   

                      mt={10}   

                    />   

 

                    <InputBox   

                      label="Ejecutado por: *"   

                      value={bajaTroquelData.empleado}   

                      onChange={(e) => setBajaTroquelData({...bajaTroquelData, empleado: e.target.value})}   

                      placeholder="Nombre del empleado"  

                      mt={10}  

                    />  

 

                    <button   

                      onClick={handleSubmitBajaTroquel}   

                      disabled={savingBaja}  

                      style={getButtonStyle(savingBaja)}  

                    >   

                      {savingBaja ? 'Guardando...' : 'Guardar Baja Troquel'}  

                    </button>  

                  </div>   

 

                  {/* RIGHT COLUMN - Asistencia en Prensa */}  

                  <div style={modalStyles.actionsColumn}>   

                    <div style={{  

                      background: 'linear-gradient(135deg, rgba(0,200,255,0.2), rgba(0,200,255,0.1))',  

                      border: '1px solid rgba(0,200,255,0.3)',  

                      borderRadius: 8,  

                      padding: '10px 14px',  

                      marginBottom: 12,  

                    }}>   

                      <span style={{ color: '#00c8ff', fontWeight: 700, fontSize: 12, textTransform: 'uppercase' }}> Asistencia en Prensa:</span>   

                    </div>   

 

                    {/* Folio input */}  

                    <InputBox   

                      label="Folio: *"   

                      value={asistenciaData.folio}   

                      onChange={(e) => setAsistenciaData({...asistenciaData, folio: e.target.value})}   

                      placeholder="Número de folio"  

                    />  

 

                    <SelectBox   

                      label="Motivo: *"   

                      value={asistenciaData.motivo}   

                      onChange={(e) => setAsistenciaData({...asistenciaData, motivo: e.target.value})}  

                      mt={10}  

                    >  

                      <option value="">Seleccionar Motivo</option>  

                      {asistenciaMotivos.map(m => (  

                        <option key={m.id} value={m.id}>{m.description}</option>  

                      ))}  

                    </SelectBox>  

 

                    <TextArea   

                      label="Comentarios (Supervisor / Operador):"   

                      value={asistenciaData.comentarios}   

                      onChange={(e) => setAsistenciaData({...asistenciaData, comentarios: e.target.value})}   

                      h={120}   

                      mt={10}   

                    />  

 

                    <InputBox   

                      label="Ejecutado por: *"   

                      value={asistenciaData.empleado}   

                      onChange={(e) => setAsistenciaData({...asistenciaData, empleado: e.target.value})}   

                      placeholder="Nombre del empleado"  

                      mt={10}  

                    />  

 

                    <button   

                      onClick={handleSubmitAsistencia}  

                      disabled={savingAsistencia}  

                      style={getButtonStyle(savingAsistencia, '#00c8ff')}  

                    >   

                      {savingAsistencia ? 'Guardando...' : 'Guardar Asistencia'}  

                    </button>   

                  </div>   

                </div>   

              ) : (   

                /* HISTORY TAB */  

                <div style={{ height: '100%', overflowY: 'auto', padding: '4px' }}>  

                  {loadingHistory ? (   

                    <div style={{  

                      display: 'flex',  

                      alignItems: 'center',  

                      justifyContent: 'center',  

                      height: '100%',  

                      color: '#00ff88',  

                      fontSize: 14,  

                    }}>  

                      <div style={{ textAlign: 'center' }}>  

                        <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>  

                        Cargando historial...  

                      </div>  

                    </div>  

                  ) : history.length > 0 ? (   

                    <div>  

                      <div style={{  

                        display: 'flex',  

                        justifyContent: 'space-between',  

                        alignItems: 'center',  

                        marginBottom: 14,  

                        padding: '10px 14px',  

                        background: 'rgba(255,255,255,0.05)',  

                        borderRadius: 8,  

                      }}>  

                        <span style={{ color: '#fff', fontSize: 12, fontWeight: 600 }}>  

                           Total: {history.length} registros  

                        </span>  

                        <div style={{ display: 'flex', gap: 12 }}>  

                          <span style={{ color: '#00ff88', fontSize: 11 }}>  

                             Bajas: {history.filter(h => h.tipo_registro === 'baja_troquel').length}  

                          </span>  

                          <span style={{ color: '#00c8ff', fontSize: 11 }}>  

                            Asistencias: {history.filter(h => h.tipo_registro === 'asistencia_prensa').length}  

                          </span>  

                        </div>  

                      </div>  

 

                      {history.map((h, i) => (  

                        <HistoryItem key={h.id || i} h={h} />  

                      ))}  

                    </div>  

                  ) : (   

                    <div style={{  

                      display: 'flex',  

                      alignItems: 'center',  

                      justifyContent: 'center',  

                      height: '100%',  

                      color: 'rgba(255,255,255,0.3)',  

                      fontSize: 14,  

                    }}>  

                      <div style={{ textAlign: 'center' }}>  

                        <div>No hay historial disponible</div>  

                        <div style={{ fontSize: 12, marginTop: 8, color: 'rgba(255,255,255,0.2)' }}>  

                          Los registros aparecerán aquí después de guardar acciones  

                        </div>  

                      </div>  

                    </div>  

                  )}   

                </div>   

              )}   

            </div>   

          </div>   

        </div>   

 

        {/* Footer */}   

        <div style={{  

          display: 'flex',  

          justifyContent: 'space-between',  

          alignItems: 'center',  

          padding: '12px 20px',  

          borderTop: '1px solid rgba(0,255,136,0.2)',  

          background: 'rgba(0,0,0,0.2)',  

        }}>   

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>  

            <span style={{ fontSize: 14 }}>⚙</span>  

            <span style={{ color: '#888', fontSize: 11 }}>E-Kanban Tool Room</span>  

          </div>  

          <button onClick={onClose} style={{  

            background: 'rgba(255,255,255,0.1)',  

            border: '1px solid rgba(255,255,255,0.2)',  

            borderRadius: 6,  

            padding: '8px 20px',  

            color: '#fff',  

            fontSize: 11,  

            cursor: 'pointer',  

            transition: 'all 0.2s ease',  

          }}>   

            Cerrar (Esc)   

          </button>   

        </div>   

      </div>   

    </div>   

  );   

});   

 

// Componente principal del ekanban   

const EKanban = ({ onLogoClick }) => {   

  const [selectedItem, setSelectedItem] = useState(null);   

  const [searchQuery, setSearchQuery] = useState('');   

  const [troqueles, setTroqueles] = useState({});   

  const [priorityRepairs, setPriorityRepairs] = useState([]);   

  const [troquelesSum, setTroquelesSum] = useState([]);   

  const [fallas, setFallas] = useState([]);  

  const [asistenciaMotivos, setAsistenciaMotivos] = useState([]);  

  const [loading, setLoading] = useState(true);   

  const [error, setError] = useState(null);  

  const [logoHovered, setLogoHovered] = useState(false);  

 

  const fetchData = useCallback(async () => {   

    try {   

      setLoading(true);   

      const [troquelsRes, priorityRes, summaryRes, fallasRes, asistenciaRes] = await Promise.all([   

        fetch(`${API_BASE}/troqueles`),   

        fetch(`${API_BASE}/priority-repairs`),   

        fetch(`${API_BASE}/troqueles-summary`),   

        fetch(`${API_BASE}/fallas`),  

        fetch(`${API_BASE}/asistencia-prensa`)  

      ]);   

 

      if (!troquelsRes.ok || !priorityRes.ok || !summaryRes.ok || !fallasRes.ok) {   

        throw new Error('Failed to fetch data');   

      }   

 

      const [troquelsData, priorityData, summaryData, fallasData, asistenciaData] = await Promise.all([   

        troquelsRes.json(),   

        priorityRes.json(),   

        summaryRes.json(),   

        fallasRes.json(),  

        asistenciaRes.ok ? asistenciaRes.json() : []  

      ]);   

 

      setTroqueles(troquelsData);   

      setPriorityRepairs(priorityData);   

      setTroquelesSum(summaryData);   

      setFallas(fallasData);  

      setAsistenciaMotivos(asistenciaData);  

      setError(null);   

 

    } catch (err) {   

      console.error('Error fetching data:', err);   

      setError('Error connecting to server. Using fallback data.');   

 

      setTroqueles({   

        2025: [   

          { id: 'T951', name: 'Alpha', status: 'En prensa', model: 'G3-VSS', golpes: '257,540', golpesAcum: '121,442,752', capacidadGolpes: '250,000,000', rectificaciones: '15', prensas: [], imageUrl: null }   

        ]   

      });   

 

      setPriorityRepairs([{ priority: 1, name: 'Alpha' }]);   

 

      setTroquelesSum([   

        { label: 'UP', count: '-', goal: '-', perf: '-' },    

        { label: 'BACKUP', count: '-', goal: '-', perf: '-' },    

        { label: 'TOTAL', count: '-', goal: '-', perf: '-' }   

      ]);   

 

      setFallas([]);  

        

      setAsistenciaMotivos([  

        { id: 1, description: 'Mantenimiento' },  

        { id: 2, description: 'Ajuste' },  

        { id: 3, description: 'Otro' }  

      ]);  

 

    } finally {   

      setLoading(false);   

    }   

  }, []);   

 

  useEffect(() => {   

    injectStyles();   

    fetchData();   

  }, [fetchData]);   

 

  const handleItemClick = useCallback((item) => setSelectedItem(item), []);   

  const handleClose = useCallback(() => setSelectedItem(null), []);   

  const years = Object.keys(troqueles).sort((a, b) => a - b);   

 

  const handleLogoClickInternal = useCallback(() => {  

    if (onLogoClick) {  

      onLogoClick();  

    }  

  }, [onLogoClick]);  

 

  // Determine which modal to show based on status 

  const isEnPrensa = selectedItem?.status === 'En prensa'; 

 

  return (   

    <div style={styles.container}>   

      <div style={styles.gridOverlay} />   

 

      <header style={styles.header}>   

        <div>   

          <div    

            className="logo-btn"   

            onClick={handleLogoClickInternal}  

            onMouseEnter={() => setLogoHovered(true)}  

            onMouseLeave={() => setLogoHovered(false)}  

            title="Acceso Administrativo - Click para iniciar sesión"   

            style={{  

              ...styles.logoButton,  

              transform: logoHovered ? 'scale(1.08)' : 'scale(1)',  

              boxShadow: logoHovered   

                ? '0 0 30px rgba(0,255,136,0.6), 0 0 60px rgba(0,255,136,0.3)'   

                : '0 0 20px rgba(0,255,136,0.4)',  

              cursor: 'pointer',  

              transition: 'all 0.3s ease',  

            }}   

          >   

            <span style={{  

              ...styles.logoIcon,  

              fontSize: 22,  

              fontWeight: 800,  

              color: '#0a0f0d',  

              textShadow: '0 1px 2px rgba(0,0,0,0.2)',  

            }}>⚙</span>  

          </div>  

          {logoHovered && (  

            <div style={{  

              position: 'absolute',  

              top: '65px',  

              left: '24px',  

              background: 'rgba(0,20,10,0.95)',  

              color: '#00ff88',  

              padding: '8px 14px',  

              borderRadius: 8,  

              fontSize: 11,  

              fontWeight: 500,  

              border: '1px solid #00ff88',  

              boxShadow: '0 0 20px rgba(0,255,136,0.4)',  

              zIndex: 100,  

              whiteSpace: 'nowrap',  

              animation: 'fadeIn 0.2s ease',  

            }}>  

              Panel de Administración  

              <div style={{  

                position: 'absolute',  

                top: -6,  

                left: 20,  

                width: 0,  

                height: 0,  

                borderLeft: '6px solid transparent',  

                borderRight: '6px solid transparent',  

                borderBottom: '6px solid #00ff88',  

              }} />  

            </div>  

          )}  

        </div>   

 

        <h1 style={styles.title}>   

          <span style={styles.titleHighlight}>E-Kanban</span> Tool Room   

        </h1>   

 

        <div style={styles.searchContainer}>   

          <div style={styles.searchWrapper}>   

            <input   

              type="text"   

              className="search-input"   

              style={styles.searchInput}   

              placeholder="Buscar maquinas o troqueles..."   

              value={searchQuery}   

              onChange={e => setSearchQuery(e.target.value)}   

            />   

          </div>   

        </div>   

      </header>   

 

      {error && (   

        <div style={styles.errorBanner}>   

          {error}   

        </div>   

      )}   

 

      <div className="kanban-scroll" style={styles.kanbanScroll}>   

        {loading ? (   

          <div className="loading" style={styles.loadingContainer}>   

            Cargando Información...   

          </div>   

        ) : (   

          <div style={styles.kanbanContainer}>   

            {years.map(year => (   

              <KanbanColumn key={year} year={year} items={troqueles[year] || []} onItemClick={handleItemClick} />   

            ))}   

          </div>   

        )}   

      </div>   

 

      <div style={styles.bottomPanels}>   

        <TroquelesTable data={troquelesSum} />   

        <PriorityRepairs data={priorityRepairs} />   

        <StatusLegend />   

      </div>   

 

      {/* Conditional Modal Rendering based on status */} 

      {selectedItem && ( 

        isEnPrensa ? ( 

          // Show DetailModal for "En prensa" status 

          <DetailModal   

            item={selectedItem}   

            fallas={fallas}   

            asistenciaMotivos={asistenciaMotivos}  

            onClose={handleClose}   

            onSaveAction={fetchData}   

          /> 

        ) : ( 

          // Show RepairModal for all other statuses 

          <RepairModal 

            item={selectedItem} 

            fallas={fallas} 

            onClose={handleClose} 

            onSaveAction={fetchData} 

          /> 

        ) 

      )} 

    </div>   

  );   

};   

 

export default EKanban; 
