
 

// RepairModal.jsx - Modal for dies with status different from "En prensa" 

import React, { useState, useEffect, memo, useCallback } from 'react'; 

import { statusColors } from '../styles/EKanban.styles'; 

 

const API_BASE = 'http://localhost:3001/api'; 

 

// Repair modal styles 

const repairModalStyles = { 

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

    display: 'flex', 

    flexDirection: 'column', 

    gap: '12px', 

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

}; 

 

const RepairModal = memo(({ item, fallas, onClose, onSaveAction }) => { 

  const [activeTab, setActiveTab] = useState('acciones'); 

  const [history, setHistory] = useState([]); 

  const [loadingHistory, setLoadingHistory] = useState(false); 

  const [imageError, setImageError] = useState(false); 

   

  // Repair process data 

  const [repairProcess, setRepairProcess] = useState({ 

    bajado: null, 

    recepcionTaller: null, 

    inicioReparacion: null, 

    termino: null, 

  }); 

   

  // Technicians participating 

  const [technicians, setTechnicians] = useState([]); 

  const [newTechnician, setNewTechnician] = useState({ 

    nombre: '', 

    grupo: '', 

  }); 

   

  // Additional options 

  const [additionalOptions, setAdditionalOptions] = useState({ 

    detalleId: '', 

    cambioModeloId: '', 

    pendienteReparar: false, 

    fechaLiberacion: '', 

    motivoPendiente: '', 

    prioridadReparacion: '', 

  }); 

   

  // Motivos list (from history or predefined) 

  const [motivos, setMotivos] = useState([]); 

   

  // Saving states 

  const [savingTechnician, setSavingTechnician] = useState(false); 

  const [savingOptions, setSavingOptions] = useState(false); 

  const [savingComplete, setSavingComplete] = useState(false); 

 

  // Load history and repair process data 

  const loadHistory = useCallback(() => { 

    if (item) { 

      setLoadingHistory(true); 

      fetch(`${API_BASE}/troqueles/${item.id}/history`) 

        .then(res => res.json()) 

        .then(data => { 

          setHistory(data); 

          // Extract motivos from history 

          const uniqueMotivos = [...new Set(data.map(h => h.action_type).filter(Boolean))]; 

          setMotivos(uniqueMotivos); 

          setLoadingHistory(false); 

        }) 

        .catch(err => { 

          console.error('Error loading history:', err); 

          setLoadingHistory(false); 

        }); 

    } 

  }, [item]); 

 

  // Load repair process details 

  const loadRepairProcess = useCallback(() => { 

    if (item) { 

      fetch(`${API_BASE}/troqueles/${item.id}/repair-process`) 

        .then(res => res.ok ? res.json() : null) 

        .then(data => { 

          if (data) { 

            setRepairProcess({ 

              bajado: data.bajado || null, 

              recepcionTaller: data.recepcion_taller || null, 

              inicioReparacion: data.inicio_reparacion || null, 

              termino: data.termino || null, 

            }); 

            setTechnicians(data.technicians || []); 

          } 

        }) 

        .catch(err => console.error('Error loading repair process:', err)); 

    } 

  }, [item]); 

 

  useEffect(() => { 

    if (activeTab === 'historial' && item) { 

      loadHistory(); 

    } 

  }, [activeTab, item, loadHistory]); 

 

  useEffect(() => { 

    if (item) { 

      loadRepairProcess(); 

      loadHistory(); 

    } 

  }, [item, loadRepairProcess, loadHistory]); 

 

  useEffect(() => { 

    setImageError(false); 

  }, [item]); 

 

  if (!item) return null; 

  const statusColor = statusColors[item.status] || '#00ff88'; 

  const hasImage = item.imageUrl && !imageError; 

 

  // Format date for display 

  const formatDateTime = (dateStr) => { 

    if (!dateStr) return '-'; 

    const date = new Date(dateStr); 

    return date.toLocaleString('es-MX', { 

      day: '2-digit', 

      month: '2-digit', 

      year: 'numeric', 

      hour: '2-digit', 

      minute: '2-digit', 

      second: '2-digit', 

      hour12: true, 

    }); 

  }; 

 

  // Handle adding technician 

  const handleAddTechnician = async () => { 

    if (!newTechnician.nombre.trim()) { 

      alert('Por favor ingrese el nombre del técnico'); 

      return; 

    } 

    if (!newTechnician.grupo) { 

      alert('Por favor seleccione un grupo'); 

      return; 

    } 

 

    setSavingTechnician(true); 

    try { 

      const res = await fetch(`${API_BASE}/troqueles/${item.id}/technicians`, { 

        method: 'POST', 

        headers: { 'Content-Type': 'application/json' }, 

        body: JSON.stringify({ 

          troquel_id: item.id, 

          nombre: newTechnician.nombre, 

          grupo: newTechnician.grupo, 

          tipo: 'REP', 

        }), 

      }); 

 

      if (res.ok) { 

        const data = await res.json(); 

        setTechnicians([...technicians, data]); 

        setNewTechnician({ nombre: '', grupo: '' }); 

      } else { 

        alert('Error al agregar técnico'); 

      } 

    } catch (err) { 

      console.error('Error adding technician:', err); 

      alert('Error al agregar técnico'); 

    } finally { 

      setSavingTechnician(false); 

    } 

  }; 

 

  // Handle removing technician 

  const handleRemoveTechnician = async (techId) => { 

    try { 

      await fetch(`${API_BASE}/technicians/${techId}`, { method: 'DELETE' }); 

      setTechnicians(technicians.filter(t => t.id !== techId)); 

    } catch (err) { 

      console.error('Error removing technician:', err); 

    } 

  }; 

 

  // Handle marking repair step complete 

  const handleMarkStep = async (step) => { 

    try { 

      const res = await fetch(`${API_BASE}/troqueles/${item.id}/repair-step`, { 

        method: 'POST', 

        headers: { 'Content-Type': 'application/json' }, 

        body: JSON.stringify({ step }), 

      }); 

 

      if (res.ok) { 

        const data = await res.json(); 

        setRepairProcess(prev => ({ 

          ...prev, 

          [step]: data.timestamp, 

        })); 

      } 

    } catch (err) { 

      console.error('Error marking step:', err); 

    } 

  }; 

 

  // Handle completing repair 

  const handleCompleteRepair = async () => { 

    if (!window.confirm('¿Está seguro de marcar la reparación como completada? El estado cambiará a "Listo"')) { 

      return; 

    } 

 

    setSavingComplete(true); 

    try { 

      const res = await fetch(`${API_BASE}/troqueles/${item.id}/complete-repair`, { 

        method: 'POST', 

        headers: { 'Content-Type': 'application/json' }, 

        body: JSON.stringify({ 

          additionalOptions, 

          technicians: technicians.map(t => t.id), 

        }), 

      }); 

 

      if (res.ok) { 

        alert('Reparación completada exitosamente'); 

        onSaveAction && onSaveAction(); 

        onClose(); 

      } else { 

        alert('Error al completar reparación'); 

      } 

    } catch (err) { 

      console.error('Error completing repair:', err); 

      alert('Error al completar reparación'); 

    } finally { 

      setSavingComplete(false); 

    } 

  }; 

 

  // Handle saving pending repair 

  const handleSavePendingRepair = async () => { 

    if (!additionalOptions.fechaLiberacion) { 

      alert('Por favor seleccione una fecha de liberación'); 

      return; 

    } 

 

    setSavingOptions(true); 

    try { 

      const res = await fetch(`${API_BASE}/troqueles/${item.id}/pending-repair`, { 

        method: 'POST', 

        headers: { 'Content-Type': 'application/json' }, 

        body: JSON.stringify({ 

          fecha_liberacion: additionalOptions.fechaLiberacion, 

          motivo: additionalOptions.motivoPendiente, 

          prioridad: additionalOptions.prioridadReparacion, 

        }), 

      }); 

 

      if (res.ok) { 

        alert('Pendiente de reparación guardado'); 

        onSaveAction && onSaveAction(); 

      } else { 

        alert('Error al guardar'); 

      } 

    } catch (err) { 

      console.error('Error:', err); 

      alert('Error al guardar'); 

    } finally { 

      setSavingOptions(false); 

    } 

  }; 

 

  // Input components 

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

          opacity: disabled ? 0.5 : 1, 

        }} 

      /> 

    </div> 

  ); 

 

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

          opacity: disabled ? 0.5 : 1, 

        }} 

      > 

        {children} 

      </select> 

    </div> 

  ); 

 

  const TextArea = ({ label, value, onChange, h, mt, disabled, placeholder }) => ( 

    <div style={{ marginTop: mt || 0 }}> 

      {label && <label style={{ display: 'block', color: '#888', fontSize: 10, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</label>} 

      <textarea 

        className="form-el" 

        value={value} 

        onChange={onChange} 

        disabled={disabled} 

        placeholder={placeholder} 

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

          opacity: disabled ? 0.5 : 1, 

        }} 

      /> 

    </div> 

  ); 

 

  // History item component 

  const HistoryItem = ({ h }) => { 

    const isAsistencia = h.tipo_registro === 'asistencia_prensa'; 

    const borderColor = isAsistencia ? '#00c8ff' : '#00ff88'; 

    const titleColor = isAsistencia ? '#00c8ff' : '#00ff88'; 

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

        <div style={{ 

          display: 'flex', 

          justifyContent: 'space-between', 

          alignItems: 'flex-start', 

          marginBottom: 10, 

          flexWrap: 'wrap', 

          gap: 8, 

        }}> 

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}> 

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

        </div> 

      </div> 

    ); 

  }; 

 

  return ( 

    <div onClick={onClose} style={repairModalStyles.overlay}> 

      <div onClick={e => e.stopPropagation()} style={repairModalStyles.modal}> 

        {/* Header */} 

        <div style={{ 

          display: 'flex', 

          justifyContent: 'space-between', 

          alignItems: 'center', 

          padding: '14px 20px', 

          borderBottom: '1px solid rgba(0,255,136,0.2)', 

          background: 'rgba(0,255,136,0.05)', 

        }}> 

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}> 

            <span style={{ color: '#888', fontSize: 12 }}>Estatus:</span> 

            <span style={{ 

              color: statusColor, 

              fontWeight: 700, 

              fontSize: 14, 

              textShadow: `0 0 10px ${statusColor}`, 

              textTransform: 'uppercase', 

            }}>{item.status}</span> 

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

 

        {/* Content */} 

        <div style={repairModalStyles.content}> 

          {/* Left Panel */} 

          <div style={repairModalStyles.leftPanel}> 

            {/* Image */} 

            <div style={{ 

              width: '100%', 

              height: '140px', 

              borderRadius: 8, 

              overflow: 'hidden', 

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

 

            {/* ID and Model */} 

            <div style={{ 

              textAlign: 'center', 

              padding: '10px', 

              background: 'rgba(0,255,136,0.1)', 

              borderRadius: 8, 

              border: '1px solid rgba(0,255,136,0.2)', 

            }}> 

              <div style={{ color: '#00ff88', fontSize: 24, fontWeight: 800, textShadow: '0 0 20px rgba(0,255,136,0.5)' }}>{item.id}</div> 

              <div style={{ color: '#888', fontSize: 12, marginTop: 4 }}>{item.model || '-'}</div> 

            </div> 

 

            {/* Información del Troquel */} 

            <div style={{ 

              background: 'rgba(0,0,0,0.3)', 

              borderRadius: 8, 

              border: '1px solid rgba(0,255,136,0.15)', 

              overflow: 'hidden', 

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

                  ['Capacidad Golpes:', item.capacidadGolpes], 

                  ['No. Rectificaciones:', item.rectificaciones], 

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

 

            {/* Prensas y Modelos */} 

            <div style={{ 

              background: 'rgba(0,0,0,0.3)', 

              borderRadius: 8, 

              border: '1px solid rgba(0,255,136,0.15)', 

              overflow: 'hidden', 

              flex: 1, 

            }}> 

              <div style={{ 

                display: 'grid', 

                gridTemplateColumns: '1fr 1fr', 

                borderBottom: '1px solid rgba(0,255,136,0.15)', 

              }}> 

                <div style={{ 

                  padding: '8px 12px', 

                  fontSize: 10, 

                  fontWeight: 600, 

                  color: '#00ff88', 

                  textTransform: 'uppercase', 

                  background: 'rgba(0,255,136,0.1)', 

                  borderRight: '1px solid rgba(0,255,136,0.15)', 

                }}>Prensas</div> 

                <div style={{ 

                  padding: '8px 12px', 

                  fontSize: 10, 

                  fontWeight: 600, 

                  color: '#00ff88', 

                  textTransform: 'uppercase', 

                  background: 'rgba(0,255,136,0.1)', 

                }}>Modelos</div> 

              </div> 

              <div style={{ maxHeight: '120px', overflowY: 'auto' }}> 

                {item.prensas && item.prensas.length > 0 ? ( 

                  item.prensas.map((p, i) => ( 

                    <div key={i} style={{ 

                      display: 'grid', 

                      gridTemplateColumns: '1fr 1fr', 

                      borderBottom: '1px solid rgba(0,255,136,0.05)', 

                    }}> 

                      <div style={{ padding: '6px 12px', color: '#fff', fontSize: 10, borderRight: '1px solid rgba(0,255,136,0.1)' }}> 

                        {p.year || p.id || '-'} 

                      </div> 

                      <div style={{ padding: '6px 12px', color: '#aaa', fontSize: 10 }}> 

                        {p.modelo || item.model || '-'} 

                      </div> 

                    </div> 

                  )) 

                ) : ( 

                  <div style={{ padding: '12px', color: 'rgba(255,255,255,0.3)', fontSize: 10, textAlign: 'center' }}> 

                    Sin prensas asignadas 

                  </div> 

                )} 

              </div> 

            </div> 

          </div> 

 

          {/* Right Panel */} 

          <div style={repairModalStyles.rightPanel}> 

            {/* Tabs */} 

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

 

            <div style={repairModalStyles.tabContent}> 

              {activeTab === 'acciones' ? ( 

                <div style={{ display: 'flex', gap: '20px', height: '100%', overflow: 'hidden' }}> 

                  {/* Main Actions Area */} 

                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto' }}> 

                    {/* Proceso de Reparación */} 

                    <div style={{ 

                      background: 'rgba(0,0,0,0.2)', 

                      borderRadius: 10, 

                      border: '1px solid rgba(0,255,136,0.15)', 

                      overflow: 'hidden', 

                    }}> 

                      <div style={{ 

                        background: 'rgba(0,255,136,0.1)', 

                        padding: '10px 14px', 

                        fontSize: 11, 

                        fontWeight: 600, 

                        color: '#00ff88', 

                        textTransform: 'uppercase', 

                      }}>Proceso de Reparación:</div> 

                      <div style={{ padding: '12px 14px' }}> 

                        {[ 

                          { key: 'bajado', label: 'Bajado:', value: repairProcess.bajado }, 

                          { key: 'recepcionTaller', label: 'Recepción en Taller:', value: repairProcess.recepcionTaller }, 

                          { key: 'inicioReparacion', label: 'Inicio Reparación:', value: repairProcess.inicioReparacion }, 

                          { key: 'termino', label: 'Terminó:', value: repairProcess.termino }, 

                        ].map((step, i) => ( 

                          <div key={step.key} style={{ 

                            display: 'flex', 

                            justifyContent: 'space-between', 

                            alignItems: 'center', 

                            padding: '6px 0', 

                            borderBottom: i < 3 ? '1px solid rgba(0,255,136,0.1)' : 'none', 

                          }}> 

                            <span style={{ color: '#888', fontSize: 11 }}>{step.label}</span> 

                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}> 

                              <span style={{ color: step.value ? '#00ff88' : '#666', fontSize: 11, fontWeight: 500 }}> 

                                {formatDateTime(step.value)} 

                              </span> 

                              {!step.value && ( 

                                <button 

                                  onClick={() => handleMarkStep(step.key)} 

                                  style={{ 

                                    background: 'rgba(0,255,136,0.2)', 

                                    border: '1px solid rgba(0,255,136,0.4)', 

                                    borderRadius: 4, 

                                    padding: '2px 8px', 

                                    color: '#00ff88', 

                                    fontSize: 9, 

                                    cursor: 'pointer', 

                                  }} 

                                > 

                                  Marcar 

                                </button> 

                              )} 

                            </div> 

                          </div> 

                        ))} 

                      </div> 

                    </div> 

 

                    {/* Motivos */} 

                    <div style={{ 

                      background: 'rgba(0,0,0,0.2)', 

                      borderRadius: 10, 

                      border: '1px solid rgba(0,255,136,0.15)', 

                      overflow: 'hidden', 

                    }}> 

                      <div style={{ 

                        background: 'rgba(0,255,136,0.1)', 

                        padding: '10px 14px', 

                        fontSize: 11, 

                        fontWeight: 600, 

                        color: '#00ff88', 

                        textTransform: 'uppercase', 

                      }}>Motivos:</div> 

                      <div style={{ padding: '8px 14px', maxHeight: '80px', overflowY: 'auto' }}> 

                        {motivos.length > 0 ? motivos.map((m, i) => ( 

                          <div key={i} style={{ 

                            color: '#fff', 

                            fontSize: 11, 

                            padding: '4px 0', 

                            borderBottom: i < motivos.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none', 

                          }}> 

                            {m} 

                          </div> 

                        )) : ( 

                          <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11 }}>Sin motivos registrados</div> 

                        )} 

                      </div> 

                    </div> 

 

                    {/* Técnicos Participantes */} 

                    <div style={{ 

                      background: 'rgba(0,0,0,0.2)', 

                      borderRadius: 10, 

                      border: '1px solid rgba(0,255,136,0.15)', 

                      overflow: 'hidden', 

                      flex: 1, 

                    }}> 

                      <div style={{ 

                        background: 'rgba(0,255,136,0.1)', 

                        padding: '10px 14px', 

                        fontSize: 11, 

                        fontWeight: 600, 

                        color: '#00ff88', 

                        textTransform: 'uppercase', 

                      }}>Técnicos Participantes:</div> 

                       

                      {/* Table Header */} 

                      <div style={{ 

                        display: 'grid', 

                        gridTemplateColumns: '2fr 0.5fr 1fr 1fr 0.5fr 0.5fr', 

                        background: 'rgba(0,0,0,0.2)', 

                        borderBottom: '1px solid rgba(0,255,136,0.15)', 

                      }}> 

                        {['Nombre', 'Grupo', 'Inicio', 'Fin', 'Tipo', 'Acción'].map(h => ( 

                          <div key={h} style={{ 

                            padding: '8px 10px', 

                            color: '#888', 

                            fontSize: 9, 

                            fontWeight: 600, 

                            textTransform: 'uppercase', 

                          }}>{h}</div> 

                        ))} 

                      </div> 

                       

                      {/* Table Body */} 

                      <div style={{ maxHeight: '120px', overflowY: 'auto' }}> 

                        {technicians.length > 0 ? technicians.map((t, i) => ( 

                          <div key={t.id || i} style={{ 

                            display: 'grid', 

                            gridTemplateColumns: '2fr 0.5fr 1fr 1fr 0.5fr 0.5fr', 

                            borderBottom: '1px solid rgba(255,255,255,0.05)', 

                          }}> 

                            <div style={{ padding: '8px 10px', color: '#fff', fontSize: 10 }}>{t.nombre}</div> 

                            <div style={{ padding: '8px 10px', color: '#aaa', fontSize: 10 }}>{t.grupo}</div> 

                            <div style={{ padding: '8px 10px', color: '#aaa', fontSize: 9 }}>{formatDateTime(t.inicio)}</div> 

                            <div style={{ padding: '8px 10px', color: '#aaa', fontSize: 9 }}>{formatDateTime(t.fin)}</div> 

                            <div style={{ padding: '8px 10px', color: '#00ff88', fontSize: 10 }}>{t.tipo || 'REP'}</div> 

                            <div style={{ padding: '8px 10px' }}> 

                              <button 

                                onClick={() => handleRemoveTechnician(t.id)} 

                                style={{ 

                                  background: 'rgba(255,68,102,0.2)', 

                                  border: 'none', 

                                  borderRadius: 4, 

                                  color: '#ff4466', 

                                  padding: '2px 6px', 

                                  cursor: 'pointer', 

                                  fontSize: 10, 

                                }} 

                              >×</button> 

                            </div> 

                          </div> 

                        )) : ( 

                          <div style={{ padding: '20px', color: 'rgba(255,255,255,0.3)', fontSize: 11, textAlign: 'center' }}> 

                            Sin técnicos asignados 

                          </div> 

                        )} 

                      </div> 

                    </div> 

 

                    {/* Add Technician */} 

                    <div style={{ 

                      display: 'flex', 

                      gap: '12px', 

                      alignItems: 'flex-end', 

                    }}> 

                      <div style={{ flex: 2 }}> 

                        <InputBox 

                          label="Técnico / Supervisor:" 

                          value={newTechnician.nombre} 

                          onChange={(e) => setNewTechnician({ ...newTechnician, nombre: e.target.value })} 

                          placeholder="Buscar por No. Empleado o Nombre" 

                        /> 

                      </div> 

                      <div style={{ flex: 1 }}> 

                        <SelectBox 

                          label="Grupo:" 

                          value={newTechnician.grupo} 

                          onChange={(e) => setNewTechnician({ ...newTechnician, grupo: e.target.value })} 

                        > 

                          <option value="">Seleccionar grupo</option> 

                          <option value="1">1</option> 

                          <option value="2">2</option> 

                          <option value="3">3</option> 

                        </SelectBox> 

                      </div> 

                      <button 

                        onClick={handleAddTechnician} 

                        disabled={savingTechnician} 

                        style={{ 

                          background: 'rgba(0,255,136,0.2)', 

                          border: '1px solid rgba(0,255,136,0.4)', 

                          borderRadius: 6, 

                          padding: '8px 16px', 

                          color: '#00ff88', 

                          fontSize: 11, 

                          fontWeight: 600, 

                          cursor: savingTechnician ? 'not-allowed' : 'pointer', 

                          opacity: savingTechnician ? 0.5 : 1, 

                          whiteSpace: 'nowrap', 

                        }} 

                      > 

                        {savingTechnician ? '...' : '+ Agregar'} 

                      </button> 

                    </div> 

                  </div> 

 

                  {/* Additional Options Sidebar */} 

                  <div style={{ 

                    width: '280px', 

                    minWidth: '280px', 

                    background: 'rgba(0,0,0,0.2)', 

                    borderRadius: 10, 

                    border: '1px solid rgba(0,255,136,0.15)', 

                    padding: '14px', 

                    display: 'flex', 

                    flexDirection: 'column', 

                    gap: '14px', 

                    overflowY: 'auto', 

                  }}> 

                    <div style={{ 

                      background: 'rgba(0,255,136,0.1)', 

                      padding: '10px 12px', 

                      borderRadius: 6, 

                      fontSize: 11, 

                      fontWeight: 600, 

                      color: '#00ff88', 

                      textTransform: 'uppercase', 

                      textAlign: 'center', 

                    }}>Opciones Adicionales:</div> 

 

                    {/* A) Agregar Detalle */} 

                    <div> 

                      <label style={{ display: 'block', color: '#888', fontSize: 10, marginBottom: 4 }}>A) Agregar Detalle:</label> 

                      <SelectBox 

                        value={additionalOptions.detalleId} 

                        onChange={(e) => setAdditionalOptions({ ...additionalOptions, detalleId: e.target.value })} 

                      > 

                        <option value="">Seleccionar detalle...</option> 

                        {fallas.map(f => ( 

                          <option key={f.id} value={f.id}>{f.description}</option> 

                        ))} 

                      </SelectBox> 

                    </div> 

 

                    {/* B) Cambio de Modelo */} 

                    <div> 

                      <label style={{ display: 'block', color: '#888', fontSize: 10, marginBottom: 4 }}>B) Cambio de Modelo:</label> 

                      <SelectBox 

                        value={additionalOptions.cambioModeloId} 

                        onChange={(e) => setAdditionalOptions({ ...additionalOptions, cambioModeloId: e.target.value })} 

                      > 

                        <option value="">Seleccionar Modelo</option> 

                        {/* Add model options here */} 

                      </SelectBox> 

                    </div> 

 

                    {/* C) Pendiente de Reparar */} 

                    <div style={{ 

                      background: 'rgba(255,170,0,0.1)', 

                      border: '1px solid rgba(255,170,0,0.2)', 

                      borderRadius: 8, 

                      padding: '12px', 

                    }}> 

                      <label style={{ display: 'block', color: '#ffaa00', fontSize: 10, marginBottom: 8, fontWeight: 600 }}>C) Pendiente de Reparar:</label> 

                       

                      <div style={{ marginBottom: 8 }}> 

                        <label style={{ display: 'block', color: '#888', fontSize: 10, marginBottom: 4 }}>Fecha Liberación:</label> 

                        <input 

                          type="date" 

                          className="form-el" 

                          value={additionalOptions.fechaLiberacion} 

                          onChange={(e) => setAdditionalOptions({ ...additionalOptions, fechaLiberacion: e.target.value })} 

                          style={{ 

                            width: '100%', 

                            padding: '7px 10px', 

                            background: 'rgba(0,0,0,0.3)', 

                            border: '1px solid rgba(0,255,136,0.3)', 

                            borderRadius: 6, 

                            color: '#fff', 

                            fontSize: 11, 

                          }} 

                        /> 

                      </div> 

 

                      <TextArea 

                        label="Motivo:" 

                        value={additionalOptions.motivoPendiente} 

                        onChange={(e) => setAdditionalOptions({ ...additionalOptions, motivoPendiente: e.target.value })} 

                        h={60} 

                        placeholder="Ingrese el motivo..." 

                      /> 

                    </div> 

 

                    {/* Prioridad de Reparación */} 

                    <SelectBox 

                      label="Prioridad de Reparación:" 

                      value={additionalOptions.prioridadReparacion} 

                      onChange={(e) => setAdditionalOptions({ ...additionalOptions, prioridadReparacion: e.target.value })} 

                    > 

                      <option value="">Seleccionar prioridad</option> 

                      <option value="1">1 - Alta</option> 

                      <option value="2">2 - Media</option> 

                      <option value="3">3 - Baja</option> 

                    </SelectBox> 

 

                    {/* Save Pending Button */} 

                    {additionalOptions.fechaLiberacion && ( 

                      <button 

                        onClick={handleSavePendingRepair} 

                        disabled={savingOptions} 

                        style={{ 

                          width: '100%', 

                          padding: '10px', 

                          background: savingOptions ? 'rgba(100,100,100,0.3)' : 'linear-gradient(135deg, #ffaa00, #ff8800)', 

                          border: '1px solid #ffaa00', 

                          borderRadius: 6, 

                          color: '#000', 

                          fontSize: 11, 

                          fontWeight: 700, 

                          cursor: savingOptions ? 'not-allowed' : 'pointer', 

                          textTransform: 'uppercase', 

                        }} 

                      > 

                        {savingOptions ? 'Guardando...' : 'Guardar Pendiente'} 

                      </button> 

                    )} 

 

                    {/* Complete Repair Button */} 

                    <button 

                      onClick={handleCompleteRepair} 

                      disabled={savingComplete || !repairProcess.termino} 

                      style={{ 

                        width: '100%', 

                        padding: '12px', 

                        background: savingComplete || !repairProcess.termino ? 'rgba(100,100,100,0.3)' : 'linear-gradient(135deg, #00ff88, #00cc6a)', 

                        border: '1px solid #00ff88', 

                        borderRadius: 6, 

                        color: savingComplete || !repairProcess.termino ? '#666' : '#0a0f0d', 

                        fontSize: 12, 

                        fontWeight: 700, 

                        cursor: savingComplete || !repairProcess.termino ? 'not-allowed' : 'pointer', 

                        textTransform: 'uppercase', 

                        marginTop: 'auto', 

                      }} 

                    > 

                      {savingComplete ? 'Completando...' : 'Completar Reparación'} 

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

 

export default RepairModal; 

 