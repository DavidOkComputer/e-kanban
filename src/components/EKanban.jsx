import React, { useState, useEffect, memo, useCallback } from 'react'; 
import {  
  statusColors,  
  statuses,  
  injectStyles,  
  styles  
} from '../styles/EKanban.styles'; 
 
const API_BASE = 'http://localhost:3001/api'; 
const MAX_ITEMS = 8; 

//componente de item del kanban
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

//componente de columna del kanban
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

// Troqueles Table Component 
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

//componente de prioridad de reparacion 
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

//componente de leyenda de estado 
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

//componente de modal de detalles 
  const DetailModal = memo(({ item, fallas, onClose, onSaveAction }) => { 
  const [activeTab, setActiveTab] = useState('acciones'); 
  const [action, setAction] = useState('limpieza'); 
  const [formData, setFormData] = useState({ 
    falla_id: '', 
    modelo_nuevo: '', 
    nivel_setup: '', 
    grupo: '1', 
    comentarios: '', 
    motivo: '', 
    comentarios_supervisor: '' 
  }); 

  const [history, setHistory] = useState([]); 
  const [loadingHistory, setLoadingHistory] = useState(false); 

  useEffect(() => { 
    if (activeTab === 'historial' && item) { 
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
  }, [activeTab, item]); 

  if (!item) return null; 
  const statusColor = statusColors[item.status] || '#00ff88'; 
  const handleSubmit = async () => { 
    const actionData = { 
      troquel_id: item.id, 
      action_type: action === 'limpieza' ? 'Limpieza General' : action === 'cambio' ? 'Cambio de Modelo' : 'Falla de Troquel', 
      ...formData 
    }; 

    try { 
      const res = await fetch(`${API_BASE}/actions`, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(actionData) 
      }); 

      if (res.ok) { 
        alert('Acción guardada exitosamente'); 
        onSaveAction && onSaveAction(); 
      } 

    } catch (err) { 
      console.error('Error saving action:', err); 
      alert('Error al guardar la acción'); 
    } 
  }; 

  const SelectBox = ({ label, value, onChange, children, mt }) => ( 
    <div style={{ marginTop: mt || 0 }}> 
      {label && <label style={styles.formSelectLabel}>{label}</label>} 
      <select  
        className="form-el"  
        value={value}  
        onChange={onChange}  
        style={{  
          width: '100%',  
          padding: '8px 10px',  
          background: 'rgba(0,0,0,0.3)',  
          border: '1px solid rgba(0,255,136,0.3)',  
          borderRadius: 6,  
          color: '#fff',  
          fontSize: 11  
        }} 
      > 
        {children} 
      </select> 
    </div> 
  ); 

  const TextArea = ({ label, value, onChange, h, mt }) => ( 
    <div style={{ marginTop: mt || 0 }}> 
      {label && <label style={styles.formSelectLabel}>{label}</label>} 
      <textarea  
        className="form-el"  
        value={value}  
        onChange={onChange}  
        style={{ ...styles.formTextarea, height: h || 60 }}  
      /> 
    </div> 
  ); 

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
          {/*panel izquierdo*/} 
          <div style={styles.modalLeftPanel}> 
            <div style={styles.modalImage}> 
              <span style={styles.modalImagePlaceholder}>Image</span> 
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

          {/*Panel derecho*/} 
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
                            value={opt.id === 'cambio' ? formData.modelo_nuevo : formData.falla_id} 
                            onChange={(e) => setFormData({...formData, [opt.id === 'cambio' ? 'modelo_nuevo' : 'falla_id']: e.target.value})} 
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

                    <SelectBox label="Nivel:" value={formData.nivel_setup} onChange={(e) => setFormData({...formData, nivel_setup: e.target.value})} mt={12}> 
                      <option value="">Seleccionar Nivel de Setup</option> 
                      <option value="1">Nivel 1</option> 
                      <option value="2">Nivel 2</option> 
                      <option value="3">Nivel 3</option> 
                    </SelectBox> 

                    <TextArea label="Comentarios:" value={formData.comentarios} onChange={(e) => setFormData({...formData, comentarios: e.target.value})} h={60} mt={12} /> 

                    <SelectBox label="Grupo:" value={formData.grupo} onChange={(e) => setFormData({...formData, grupo: e.target.value})} mt={12}> 
                      <option value="1">1</option> 
                      <option value="2">2</option> 
                      <option value="3">3</option> 
                    </SelectBox> 
                  </div> 

                  <div style={styles.actionsColumn}> 
                    <div style={{ ...styles.actionHeader, background: 'rgba(100,150,100,0.2)', border: '1px solid rgba(0,255,136,0.2)' }}> 
                      <span style={{ ...styles.actionHeaderText, color: '#ccc' }}>Asistencia en Prensa:</span> 
                    </div> 

                    <SelectBox label="Motivo:" value={formData.motivo} onChange={(e) => setFormData({...formData, motivo: e.target.value})}> 
                      <option value="">Seleccionar Motivo</option> 
                      <option value="Mantenimiento">Mantenimiento</option> 
                      <option value="Ajuste">Ajuste</option> 
                      <option value="Otro">Otro</option> 
                    </SelectBox> 

                    <TextArea label="Comentarios (Supervisor / Operador):" value={formData.comentarios_supervisor} onChange={(e) => setFormData({...formData, comentarios_supervisor: e.target.value})} h={140} mt={12} /> 
                    <button onClick={handleSubmit} style={styles.submitButton}> 
                      Guardar Acción 
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
                        <div key={i} style={styles.historyItem}> 
                          <div style={styles.historyItemHeader}> 
                            <span style={styles.historyItemType}>{h.action_type}</span> 
                            <span style={styles.historyItemDate}>{new Date(h.created_at).toLocaleString()}</span> 
                          </div> 
                          {h.falla_description && <div style={styles.historyItemFalla}>Falla: {h.falla_description}</div>} 
                          {h.comentarios && <div style={styles.historyItemComment}>{h.comentarios}</div>} 
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
            <span style={{ fontSize: 14 }}></span> 
          </div> 
          <button className="close-btn" onClick={onClose} style={styles.modalCloseBtn}> 
            Cerrar (Esc) 
          </button> 
        </div> 
      </div> 
    </div> 
  ); 
}); 

//componente principal del ekanban 
const EKanban = ({ onLogoClick }) => { 
  const [selectedItem, setSelectedItem] = useState(null); 
  const [searchQuery, setSearchQuery] = useState(''); 
  const [troqueles, setTroqueles] = useState({}); 
  const [priorityRepairs, setPriorityRepairs] = useState([]); 
  const [troquelesSum, setTroquelesSum] = useState([]); 
  const [fallas, setFallas] = useState([]); 
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState(null); 
  const fetchData = useCallback(async () => { 

    try { 
      setLoading(true); 
      const [troquelsRes, priorityRes, summaryRes, fallasRes] = await Promise.all([ 
        fetch(`${API_BASE}/troqueles`), 
        fetch(`${API_BASE}/priority-repairs`), 
        fetch(`${API_BASE}/troqueles-summary`), 
        fetch(`${API_BASE}/fallas`) 
      ]); 

      if (!troquelsRes.ok || !priorityRes.ok || !summaryRes.ok || !fallasRes.ok) { 
        throw new Error('Failed to fetch data'); 
      } 

      const [troquelsData, priorityData, summaryData, fallasData] = await Promise.all([ 
        troquelsRes.json(), 
        priorityRes.json(), 
        summaryRes.json(), 
        fallasRes.json() 
      ]); 

      setTroqueles(troquelsData); 
      setPriorityRepairs(priorityData); 
      setTroquelesSum(summaryData); 
      setFallas(fallasData); 
      setError(null); 

    } catch (err) { 
      console.error('Error fetching data:', err); 
      setError('Error connecting to server. Using fallback data.'); 

      //informacion en caso de error 
      setTroqueles({ 
        2025: [ 
          { id: 'T951', name: 'Alpha', status: 'En prensa', model: 'G3-VSS', golpes: '257,540', golpesAcum: '121,442,752', capacidadGolpes: '250,000,000', rectificaciones: '15', prensas: [] } 
        ] 
      }); 

      setPriorityRepairs([{ priority: 1, name: 'Alpha' }]); 

      setTroquelesSum([ 
        { label: 'UP', count: '-', goal: '-', perf: '-' },  
        { label: 'BACKUP', count: '-', goal: '-', perf: '-' },  
        { label: 'TOTAL', count: '-', goal: '-', perf: '-' } 
      ]); 

      setFallas([]); 

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

  return ( 
    <div style={styles.container}> 
      {/* Grid overlay */} 
      <div style={styles.gridOverlay} /> 

      {/* Header */} 
      <header style={styles.header}> 
        {/*logo donde se puede hacer clic*/} 
        <div> 
          <div  
            className="logo-btn" 
            onClick={onLogoClick} 
            title="Panel de Administración" 
            style={styles.logoButton} 
          > 
            <span style={styles.logoIcon}>
              <img src="../assets/Nidec Institutional Logo_White Version.jpg" alt="" /></span> 
          </div> 
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
      {/* paneles inferiores*/} 
      <div style={styles.bottomPanels}> 
        <TroquelesTable data={troquelesSum} /> 
        <PriorityRepairs data={priorityRepairs} /> 
        <StatusLegend /> 
      </div> 

      {/* Modal */} 
      {selectedItem && <DetailModal item={selectedItem} fallas={fallas} onClose={handleClose} onSaveAction={fetchData} />} 
    </div> 
  ); 
}; 

export default EKanban; 
import React, { useState, useEffect, memo, useCallback } from 'react';
import { 
  statusColors, 
  statuses, 
  injectStyles, 
  styles 
} from '../styles/EKanban.styles';

const API_BASE = 'http://localhost:3001/api';
const MAX_ITEMS = 8;

// Kanban Item Component
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

// Kanban Column Component
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

// Troqueles Table Component
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

// Priority Repairs Component
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

// Status Legend Component
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

// Detail Modal Component
const DetailModal = memo(({ item, fallas, onClose, onSaveAction }) => {
  const [activeTab, setActiveTab] = useState('acciones');
  const [action, setAction] = useState('limpieza');
  const [formData, setFormData] = useState({
    falla_id: '',
    modelo_nuevo: '',
    nivel_setup: '',
    grupo: '1',
    comentarios: '',
    motivo: '',
    comentarios_supervisor: ''
  });
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    if (activeTab === 'historial' && item) {
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
  }, [activeTab, item]);

  if (!item) return null;
  const statusColor = statusColors[item.status] || '#00ff88';

  const handleSubmit = async () => {
    const actionData = {
      troquel_id: item.id,
      action_type: action === 'limpieza' ? 'Limpieza General' : action === 'cambio' ? 'Cambio de Modelo' : 'Falla de Troquel',
      ...formData
    };
    
    try {
      const res = await fetch(`${API_BASE}/actions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(actionData)
      });
      if (res.ok) {
        alert('Acción guardada exitosamente');
        onSaveAction && onSaveAction();
      }
    } catch (err) {
      console.error('Error saving action:', err);
      alert('Error al guardar la acción');
    }
  };

  const SelectBox = ({ label, value, onChange, children, mt }) => (
    <div style={{ marginTop: mt || 0 }}>
      {label && <label style={styles.formSelectLabel}>{label}</label>}
      <select 
        className="form-el" 
        value={value} 
        onChange={onChange} 
        style={{ 
          width: '100%', 
          padding: '8px 10px', 
          background: 'rgba(0,0,0,0.3)', 
          border: '1px solid rgba(0,255,136,0.3)', 
          borderRadius: 6, 
          color: '#fff', 
          fontSize: 11 
        }}
      >
        {children}
      </select>
    </div>
  );

  const TextArea = ({ label, value, onChange, h, mt }) => (
    <div style={{ marginTop: mt || 0 }}>
      {label && <label style={styles.formSelectLabel}>{label}</label>}
      <textarea 
        className="form-el" 
        value={value} 
        onChange={onChange} 
        style={{ ...styles.formTextarea, height: h || 60 }} 
      />
    </div>
  );

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

        {/* Content */}
        <div style={styles.modalContent}>
          {/* Left Panel */}
          <div style={styles.modalLeftPanel}>
            <div style={styles.modalImage}>
              <span style={styles.modalImagePlaceholder}>Image</span>
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

          {/* Right Panel */}
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
                            value={opt.id === 'cambio' ? formData.modelo_nuevo : formData.falla_id}
                            onChange={(e) => setFormData({...formData, [opt.id === 'cambio' ? 'modelo_nuevo' : 'falla_id']: e.target.value})}
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
                    <SelectBox label="Nivel:" value={formData.nivel_setup} onChange={(e) => setFormData({...formData, nivel_setup: e.target.value})} mt={12}>
                      <option value="">Seleccionar Nivel de Setup</option>
                      <option value="1">Nivel 1</option>
                      <option value="2">Nivel 2</option>
                      <option value="3">Nivel 3</option>
                    </SelectBox>
                    <TextArea label="Comentarios:" value={formData.comentarios} onChange={(e) => setFormData({...formData, comentarios: e.target.value})} h={60} mt={12} />
                    <SelectBox label="Grupo:" value={formData.grupo} onChange={(e) => setFormData({...formData, grupo: e.target.value})} mt={12}>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                    </SelectBox>
                  </div>
                  <div style={styles.actionsColumn}>
                    <div style={{ ...styles.actionHeader, background: 'rgba(100,150,100,0.2)', border: '1px solid rgba(0,255,136,0.2)' }}>
                      <span style={{ ...styles.actionHeaderText, color: '#ccc' }}>Asistencia en Prensa:</span>
                    </div>
                    <SelectBox label="Motivo:" value={formData.motivo} onChange={(e) => setFormData({...formData, motivo: e.target.value})}>
                      <option value="">Seleccionar Motivo</option>
                      <option value="Mantenimiento">Mantenimiento</option>
                      <option value="Ajuste">Ajuste</option>
                      <option value="Otro">Otro</option>
                    </SelectBox>
                    <TextArea label="Comentarios (Supervisor / Operador):" value={formData.comentarios_supervisor} onChange={(e) => setFormData({...formData, comentarios_supervisor: e.target.value})} h={140} mt={12} />
                    <button onClick={handleSubmit} style={styles.submitButton}>
                      Guardar Acción
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
                        <div key={i} style={styles.historyItem}>
                          <div style={styles.historyItemHeader}>
                            <span style={styles.historyItemType}>{h.action_type}</span>
                            <span style={styles.historyItemDate}>{new Date(h.created_at).toLocaleString()}</span>
                          </div>
                          {h.falla_description && <div style={styles.historyItemFalla}>Falla: {h.falla_description}</div>}
                          {h.comentarios && <div style={styles.historyItemComment}>{h.comentarios}</div>}
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
            <span style={{ fontSize: 14 }}></span>
          </div>
          <button className="close-btn" onClick={onClose} style={styles.modalCloseBtn}>
            Cerrar (Esc)
          </button>
        </div>
      </div>
    </div>
  );
});

// Main EKanban Component
const EKanban = ({ onLogoClick }) => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [troqueles, setTroqueles] = useState({});
  const [priorityRepairs, setPriorityRepairs] = useState([]);
  const [troquelesSum, setTroquelesSum] = useState([]);
  const [fallas, setFallas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [troquelsRes, priorityRes, summaryRes, fallasRes] = await Promise.all([
        fetch(`${API_BASE}/troqueles`),
        fetch(`${API_BASE}/priority-repairs`),
        fetch(`${API_BASE}/troqueles-summary`),
        fetch(`${API_BASE}/fallas`)
      ]);

      if (!troquelsRes.ok || !priorityRes.ok || !summaryRes.ok || !fallasRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const [troquelsData, priorityData, summaryData, fallasData] = await Promise.all([
        troquelsRes.json(),
        priorityRes.json(),
        summaryRes.json(),
        fallasRes.json()
      ]);

      setTroqueles(troquelsData);
      setPriorityRepairs(priorityData);
      setTroquelesSum(summaryData);
      setFallas(fallasData);
      setError(null);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Error connecting to server. Using fallback data.');
      // Fallback data
      setTroqueles({
        2025: [
          { id: 'T951', name: 'Alpha', status: 'En prensa', model: 'G3-VSS', golpes: '257,540', golpesAcum: '121,442,752', capacidadGolpes: '250,000,000', rectificaciones: '15', prensas: [] }
        ]
      });
      setPriorityRepairs([{ priority: 1, name: 'Alpha' }]);
      setTroquelesSum([
        { label: 'UP', count: '-', goal: '-', perf: '-' }, 
        { label: 'BACKUP', count: '-', goal: '-', perf: '-' }, 
        { label: 'TOTAL', count: '-', goal: '-', perf: '-' }
      ]);
      setFallas([]);
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

  return (
    <div style={styles.container}>
      {/* Grid overlay */}
      <div style={styles.gridOverlay} />

      {/* Header */}
      <header style={styles.header}>
        {/* Clickable Logo */}
        <div>
          <div 
            className="logo-btn"
            onClick={onLogoClick}
            title="Panel de Administración"
            style={styles.logoButton}
          >
            <span style={styles.logoIcon}>⚙</span>
          </div>
        </div>
        <h1 style={styles.title}>
          <span style={styles.titleHighlight}>E-Kanban</span> Tool Room
        </h1>
        <div style={styles.searchContainer}>
          <div style={styles.searchWrapper}>
            <span style={styles.searchIcon}>🔍</span>
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

      {/* Bottom panels */}
      <div style={styles.bottomPanels}>
        <TroquelesTable data={troquelesSum} />
        <PriorityRepairs data={priorityRepairs} />
        <StatusLegend />
      </div>

      {/* Modal */}
      {selectedItem && <DetailModal item={selectedItem} fallas={fallas} onClose={handleClose} onSaveAction={fetchData} />}
    </div>
  );
};

export default EKanban;