import React, { useState, useEffect, memo, useCallback } from 'react';  

import {   

  statusColors,   

  statuses,   

  injectStyles,   

  styles   

} from '../styles/EKanban.styles';  

  

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

 

// Componente de modal de detalles 

const DetailModal = memo(({ item, fallas, asistenciaMotivos, onClose, onSaveAction }) => {  

  const [activeTab, setActiveTab] = useState('acciones');  

  const [action, setAction] = useState('limpieza');  

   

  // Form data for Bajar Troquel (left column) 

  const [bajaTroquelData, setBajaTroquelData] = useState({  

    falla_id: '',  

    modelo_nuevo: '',  

    nivel_setup: '',  

    grupo: '1',  

    comentarios: '', 

    empleado: '' 

  }); 

 

  // Form data for Asistencia en Prensa (right column) 

  const [asistenciaData, setAsistenciaData] = useState({ 

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

 

    setSavingBaja(true); 

     

    // Determine action type based on radio selection 

    let actionType = 'Limpieza General'; 

    if (action === 'cambio') actionType = 'Cambio de Modelo'; 

    if (action === 'falla') actionType = 'Falla de Troquel'; 

 

    const actionData = {  

      troquel_id: item.id,  

      tipo_registro: 'baja_troquel', 

      action_type: actionType, 

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

        alert('Baja de Troquel guardada exitosamente');  

        // Reset form 

        setBajaTroquelData({ 

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

 

    if (!asistenciaData.motivo) { 

      alert('Por favor seleccione un motivo de asistencia'); 

      return; 

    } 

 

    setSavingAsistencia(true); 

 

    const actionData = {  

      troquel_id: item.id,  

      tipo_registro: 'asistencia_prensa', 

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

        alert('Asistencia en Prensa guardada exitosamente');  

        // Reset form 

        setAsistenciaData({ 

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

      {label && <label style={styles.formSelectLabel}>{label}</label>}  

      <select   

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

          opacity: disabled ? 0.5 : 1 

        }}  

      >  

        {children}  

      </select>  

    </div>  

  );  

 

  const TextArea = ({ label, value, onChange, h, mt, disabled }) => (  

    <div style={{ marginTop: mt || 0 }}>  

      {label && <label style={styles.formSelectLabel}>{label}</label>}  

      <textarea   

        className="form-el"   

        value={value}   

        onChange={onChange} 

        disabled={disabled} 

        style={{ ...styles.formTextarea, height: h || 60, opacity: disabled ? 0.5 : 1 }}   

      />  

    </div>  

  ); 

 

  const InputBox = ({ label, value, onChange, placeholder, mt, disabled }) => ( 

    <div style={{ marginTop: mt || 0 }}> 

      {label && <label style={styles.formSelectLabel}>{label}</label>} 

      <input 

        type="text" 

        className="form-el" 

        value={value} 

        onChange={onChange} 

        placeholder={placeholder} 

        disabled={disabled} 

        style={{ 

          width: '100%', 

          padding: '8px 10px', 

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

    fontSize: 12, 

    fontWeight: 700, 

    cursor: isLoading ? 'not-allowed' : 'pointer', 

    textTransform: 'uppercase', 

    letterSpacing: 1, 

    transition: 'all 0.3s ease', 

    boxShadow: isLoading ? 'none' : `0 0 15px ${baseColor}40`, 

  }); 

 

  // Check if item has a valid image URL 

  const hasImage = item.imageUrl && !imageError; 

 

  return (  

    <div onClick={onClose} style={styles.modalOverlay}>  

      <div onClick={e => e.stopPropagation()} style={styles.modal}>  

        {/* Header */}  

        <div style={styles.modalHeader}>  

          <div style={styles.modalStatusLabel}>  

            <span style={styles.modalStatusText}>Estatus:</span>  

            <span style={styles.modalStatusValue(statusColor)}>{item.status}</span>  

          </div>  

          <button onClick={onClose} style={styles.modalCloseButton}>×</button>  

        </div>  

 

        {/* Contenido */}  

        <div style={styles.modalContent}>  

          {/* Panel izquierdo */}  

          <div style={styles.modalLeftPanel}>  

            {/* Image from database or placeholder */} 

            <div style={{ 

              ...styles.modalImage, 

              overflow: 'hidden', 

              position: 'relative', 

            }}>  

              {hasImage ? ( 

                <img  

                  src={item.imageUrl}  

                  alt={`Troquel ${item.id}`} 

                  onError={() => setImageError(true)} 

                  style={{ 

                    width: '100%', 

                    height: '100%', 

                    objectFit: 'cover', 

                    borderRadius: 8, 

                  }} 

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

                  borderRadius: 8, 

                }}> 

                  <span style={{ fontSize: 40, opacity: 0.3, marginBottom: 8 }}>📷</span> 

                  <span style={styles.modalImagePlaceholder}>Sin imagen</span> 

                </div> 

              )} 

            </div>  

 

            <div style={styles.modalItemInfo}>  

              <div style={styles.modalItemId}>{item.id}</div>  

              <div style={styles.modalItemModel}>{item.model || '-'}</div>  

            </div>  

 

            <div style={styles.modalInfoBox}>  

              <div style={styles.modalInfoBoxHeader}>Información del Troquel</div>  

              <div style={styles.modalInfoBoxContent}>  

                {[  

                  ['Golpes:', item.golpes],   

                  ['Golpes Acum:', item.golpesAcum],   

                  ['Capacidad Golpes:', item.capacidadGolpes],   

                  ['No. Rectificaciones:', item.rectificaciones]  

                ].map(([l, v], i) => (  

                  <div key={i} style={styles.modalInfoRow(i >= 3)}>  

                    <span style={styles.modalInfoLabel}>{l}</span>  

                    <span style={styles.modalInfoValue}>{v || '-'}</span>  

                  </div>  

                ))}  

              </div>  

            </div>  

 

            <div style={styles.modalInfoBox}>  

              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10 }}>  

                <thead>  

                  <tr>  

                    <th style={{ padding: 6, background: 'rgba(0,200,255,0.2)', color: '#00d4ff', fontWeight: 600, textAlign: 'center' }}>Prensas</th>  

                    <th style={{ padding: 6, background: 'rgba(255,200,100,0.2)', color: '#fc6', fontWeight: 600, textAlign: 'center' }}>Modelos</th>  

                  </tr>  

                </thead>  

                <tbody>  

                  {item.prensas?.length > 0 ? item.prensas.map((p, i) => (  

                    <tr key={i}>  

                      <td style={{ padding: '4px 6px', textAlign: 'center', color: p.current ? '#00ff88' : '#fff', fontWeight: p.current ? 700 : 400, borderBottom: '1px solid rgba(0,255,136,0.1)' }}>  

                        {p.current ? `*** ${p.year} ***` : p.year}  

                      </td>  

                      <td style={{ padding: '4px 6px', textAlign: 'center', color: '#ccc', borderBottom: '1px solid rgba(0,255,136,0.1)' }}>{p.model || '-'}</td>  

                    </tr>  

                  )) : (  

                    <tr><td colSpan={2} style={{ padding: 10, textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontStyle: 'italic' }}>No data</td></tr>  

                  )}  

                </tbody>  

              </table>  

            </div>  

          </div>  

 

          {/* Panel derecho */}  

          <div style={styles.modalRightPanel}>  

            <div style={styles.modalTabs}>  

              {['acciones', 'historial'].map(tab => (  

                <button   

                  key={tab}   

                  className="tab-btn"   

                  onClick={() => setActiveTab(tab)}   

                  style={styles.modalTab(activeTab === tab)}  

                >  

                  {tab}  

                </button>  

              ))}  

            </div>  

 

            <div style={styles.modalTabContent}>  

              {activeTab === 'acciones' ? (  

                <div style={styles.actionsForm}>  

                  {/* LEFT COLUMN - Bajar Troquel */} 

                  <div style={styles.actionsColumn}>  

                    <div style={styles.actionHeader}>  

                      <span style={styles.actionHeaderText}>Bajar Troquel por:</span>  

                    </div>  

 

                    {[  

                      { id: 'limpieza', label: 'Limpieza General' },   

                      { id: 'cambio', label: 'Cambio de Modelo', select: true },   

                      { id: 'falla', label: 'Falla de Troquel', select: true }  

                    ].map(opt => (  

                      <label key={opt.id} style={styles.actionOption(action === opt.id)}>  

                        <div style={styles.actionRadioRow}>  

                          <input   

                            type="radio"   

                            name="act"   

                            checked={action === opt.id}   

                            onChange={() => setAction(opt.id)}   

                            style={{ accentColor: '#00ff88' }}   

                          />  

                          <span style={styles.actionLabel}>{opt.label}</span>  

                        </div>  

 

                        {opt.select && (  

                          <select   

                            className="form-el"   

                            value={opt.id === 'cambio' ? bajaTroquelData.modelo_nuevo : bajaTroquelData.falla_id}  

                            onChange={(e) => setBajaTroquelData({ 

                              ...bajaTroquelData,  

                              [opt.id === 'cambio' ? 'modelo_nuevo' : 'falla_id']: e.target.value 

                            })}  

                            style={styles.formSelect}  

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

 

                    <SelectBox  

                      label="Nivel:"  

                      value={bajaTroquelData.nivel_setup}  

                      onChange={(e) => setBajaTroquelData({...bajaTroquelData, nivel_setup: e.target.value})}  

                      mt={12} 

                    >  

                      <option value="">Seleccionar Nivel de Setup</option>  

                      <option value="1">Nivel 1</option>  

                      <option value="2">Nivel 2</option>  

                      <option value="3">Nivel 3</option>  

                    </SelectBox>  

 

                    <TextArea  

                      label="Comentarios:"  

                      value={bajaTroquelData.comentarios}  

                      onChange={(e) => setBajaTroquelData({...bajaTroquelData, comentarios: e.target.value})}  

                      h={40}  

                      mt={8}  

                    />  

 

                    <SelectBox  

                      label="Grupo:"  

                      value={bajaTroquelData.grupo}  

                      onChange={(e) => setBajaTroquelData({...bajaTroquelData, grupo: e.target.value})}  

                      mt={8} 

                    >  

                      <option value="1">1</option>  

                      <option value="2">2</option>  

                      <option value="3">3</option>  

                    </SelectBox> 

 

                    {/* Employee input for Bajar Troquel */} 

                    <InputBox  

                      label="Ejecutado por: *"  

                      value={bajaTroquelData.empleado}  

                      onChange={(e) => setBajaTroquelData({...bajaTroquelData, empleado: e.target.value})}  

                      placeholder="Nombre del empleado" 

                      mt={8} 

                    /> 

 

                    {/* Save button for Bajar Troquel */} 

                    <button  

                      onClick={handleSubmitBajaTroquel}  

                      disabled={savingBaja} 

                      style={{...getButtonStyle(savingBaja), marginTop: 12}} 

                    >  

                      {savingBaja ? 'Guardando...' : 'Guardar Baja Troquel'} 

                    </button> 

                  </div>  

 

                  {/* RIGHT COLUMN - Asistencia en Prensa */} 

                  <div style={styles.actionsColumn}>  

                    <div style={{ ...styles.actionHeader, background: 'rgba(0,200,255,0.15)', border: '1px solid rgba(0,200,255,0.3)' }}>  

                      <span style={{ ...styles.actionHeaderText, color: '#00c8ff' }}>Asistencia en Prensa:</span>  

                    </div>  

 

                    {/* Motivo dropdown populated from tbl_asistencia_prensa */} 

                    <SelectBox  

                      label="Motivo: *"  

                      value={asistenciaData.motivo}  

                      onChange={(e) => setAsistenciaData({...asistenciaData, motivo: e.target.value})} 

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

                      h={100}  

                      mt={12}  

                    /> 

 

                    {/* Employee input for Asistencia en Prensa */} 

                    <InputBox  

                      label="Ejecutado por: *"  

                      value={asistenciaData.empleado}  

                      onChange={(e) => setAsistenciaData({...asistenciaData, empleado: e.target.value})}  

                      placeholder="Nombre del empleado" 

                      mt={12} 

                    /> 

 

                    {/* Save button for Asistencia en Prensa */} 

                    <button  

                      onClick={handleSubmitAsistencia} 

                      disabled={savingAsistencia} 

                      style={{ 

                        ...getButtonStyle(savingAsistencia, '#00c8ff'), 

                        marginTop: 12 

                      }} 

                    >  

                      {savingAsistencia ? 'Guardando...' : 'Guardar Asistencia'} 

                    </button>  

                  </div>  

                </div>  

              ) : (  

                <div style={styles.historyContainer}>  

                  {loadingHistory ? (  

                    <div className="loading" style={styles.historyLoading}>Cargando historial...</div>  

                  ) : history.length > 0 ? (  

                    <div style={styles.historyList}>  

                      {history.map((h, i) => (  

                        <div key={i} style={{ 

                          ...styles.historyItem, 

                          borderLeft: `3px solid ${h.tipo_registro === 'asistencia_prensa' ? '#00c8ff' : '#00ff88'}` 

                        }}>  

                          <div style={styles.historyItemHeader}>  

                            <span style={{ 

                              ...styles.historyItemType, 

                              color: h.tipo_registro === 'asistencia_prensa' ? '#00c8ff' : '#00ff88' 

                            }}> 

                              {h.tipo_registro === 'asistencia_prensa' ? 'Asistencia' : 'Baja Troquel'}: {h.action_type} 

                            </span>  

                            <span style={styles.historyItemDate}>{new Date(h.created_at).toLocaleString()}</span>  

                          </div>  

                          {h.falla_description && ( 

                            <div style={styles.historyItemFalla}>Falla: {h.falla_description}</div> 

                          )} 

                          {h.motivo_description && ( 

                            <div style={{ fontSize: 10, color: '#00c8ff', marginTop: 4 }}> 

                              Motivo: {h.motivo_description} 

                            </div> 

                          )} 

                          {h.comentarios && ( 

                            <div style={styles.historyItemComment}>{h.comentarios}</div> 

                          )} 

                          {h.empleado && ( 

                            <div style={{  

                              marginTop: 6,  

                              fontSize: 10,  

                              color: '#ffc800', 

                              display: 'flex', 

                              alignItems: 'center', 

                              gap: 4 

                            }}> 

                              <span>👤</span> 

                              <span>{h.empleado}</span> 

                            </div> 

                          )} 

                          {(h.nivel_setup || h.grupo) && ( 

                            <div style={{  

                              marginTop: 4,  

                              fontSize: 9,  

                              color: '#888', 

                              display: 'flex', 

                              gap: 12 

                            }}> 

                              {h.nivel_setup && <span>Nivel: {h.nivel_setup}</span>} 

                              {h.grupo && <span>Grupo: {h.grupo}</span>} 

                            </div> 

                          )} 

                        </div>  

                      ))}  

                    </div>  

                  ) : (  

                    <div style={styles.historyEmpty}>No hay historial disponible</div>  

                  )}  

                </div>  

              )}  

            </div>  

          </div>  

        </div>  

 

        {/* Footer */}  

        <div style={styles.modalFooter}>  

          <div style={styles.modalFooterIcon}>  

            <span style={{ fontSize: 14 }}>⚙</span>  

          </div>  

          <button className="close-btn" onClick={onClose} style={styles.modalCloseBtn}>  

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

 

      // Información en caso de falla en conexión 

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

       

      // Fallback asistencia motivos 

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

 

  // Manejo de click en logo para feedback visual 

  const handleLogoClickInternal = useCallback(() => { 

    if (onLogoClick) { 

      onLogoClick(); 

    } 

  }, [onLogoClick]); 

 

  return (  

    <div style={styles.container}>  

      {/* Overlay de grid */}  

      <div style={styles.gridOverlay} />  

 

      {/* Header */}  

      <header style={styles.header}>  

        {/* Se puede hacer clic en logo */}  

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

          {/* Tooltips de admin */} 

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

 

      {/* Error */}  

      {error && (  

        <div style={styles.errorBanner}>  

          {error}  

        </div>  

      )}  

 

      {/* Kanban */}  

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

 

      {/* Paneles inferiores */}  

      <div style={styles.bottomPanels}>  

        <TroquelesTable data={troquelesSum} />  

        <PriorityRepairs data={priorityRepairs} />  

        <StatusLegend />  

      </div>  

 

      {/* Modal */}  

      {selectedItem && ( 

        <DetailModal  

          item={selectedItem}  

          fallas={fallas}  

          asistenciaMotivos={asistenciaMotivos} 

          onClose={handleClose}  

          onSaveAction={fetchData}  

        /> 

      )}  

    </div>  

  );  

};  

 

export default EKanban; 
