import React, { useState } from 'react'; 

const sampleData = { 

  2025: [ 

    { id: 'DIE-001', name: 'Alpha Press', type: 'Die', material: 'Aluminum 6061', status: 'Active', year: 2025, notes: 'Primary stamping die for chassis components', image: null }, 

    { id: 'DIE-002', name: 'Beta Mold', type: 'Mold', material: 'Steel Sheet', status: 'Active', year: 2025, notes: 'Injection mold for housing units', image: null }, 

    { id: 'MCH-001', name: 'Gamma Cut', type: 'Machine', material: 'Multi-material', status: 'Maintenance', year: 2025, notes: 'CNC cutting machine - scheduled maintenance Q2', image: null }, 

    { id: 'DIE-003', name: 'Delta Form', type: 'Die', material: 'Copper Sheet', status: 'Active', year: 2025, notes: 'Progressive die for connector plates', image: null }, 

    { id: 'DIE-004', name: 'Echo Stamp', type: 'Die', material: 'Aluminum 5052', status: 'Active', year: 2025, notes: 'High-speed stamping for brackets', image: null }, 

  ], 

  2026: [ 

    { id: 'DIE-005', name: 'Zeta Press', type: 'Die', material: 'Stainless Steel', status: 'Planned', year: 2026, notes: 'New acquisition - deep draw capability', image: null }, 

    { id: 'MCH-002', name: 'Eta Laser', type: 'Machine', material: 'Multi-material', status: 'Planned', year: 2026, notes: 'Fiber laser cutting system', image: null }, 

    { id: 'DIE-006', name: 'Theta Mold', type: 'Mold', material: 'Aluminum 7075', status: 'Planned', year: 2026, notes: 'Precision mold for aerospace parts', image: null }, 

  ], 

  2027: [ 

    { id: 'DIE-007', name: 'Iota Form', type: 'Die', material: 'Titanium Sheet', status: 'Planned', year: 2027, notes: 'Specialty forming die', image: null }, 

    { id: 'MCH-003', name: 'Kappa Bend', type: 'Machine', material: 'Multi-material', status: 'Planned', year: 2027, notes: 'Automated bending station', image: null }, 

    { id: 'DIE-008', name: 'Lambda Cut', type: 'Die', material: 'Steel Sheet', status: 'Planned', year: 2027, notes: 'Blanking die for panels', image: null }, 

    { id: 'DIE-009', name: 'Mu Press', type: 'Die', material: 'Aluminum 6061', status: 'Planned', year: 2027, notes: 'Transfer die system', image: null }, 

    { id: 'MCH-004', name: 'Nu Weld', type: 'Machine', material: 'Multi-material', status: 'Planned', year: 2027, notes: 'Robotic welding cell', image: null }, 

    { id: 'DIE-010', name: 'Xi Mold', type: 'Mold', material: 'Zinc Alloy', status: 'Planned', year: 2027, notes: 'Die casting mold', image: null }, 

  ], 

  2028: [ 

    { id: 'DIE-011', name: 'Omicron Die', type: 'Die', material: 'Brass Sheet', status: 'Planned', year: 2028, notes: 'Decorative forming die', image: null }, 

    { id: 'MCH-005', name: 'Pi Assembly', type: 'Machine', material: 'Multi-material', status: 'Planned', year: 2028, notes: 'Automated assembly line', image: null }, 

  ], 

  2029: [ 

    { id: 'DIE-012', name: 'Rho Stamp', type: 'Die', material: 'Aluminum 2024', status: 'Planned', year: 2029, notes: 'High-precision aerospace die', image: null }, 

  ], 

}; 

 

const MAX_ITEMS_PER_COLUMN = 8; 

 

const styles = { 

  container: { 

    minHeight: '100vh', 

    backgroundColor: '#e9e9e9', 

    fontFamily: "'Segoe UI', 'Roboto', -apple-system, BlinkMacSystemFont, sans-serif", 

  }, 

  header: { 

    display: 'flex', 

    alignItems: 'center', 

    justifyContent: 'space-between', 

    padding: '16px 32px', 

    backgroundColor: '#ffffff', 

    borderBottom: '3px solid #009b4a', 

    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)', 

  }, 

  headerLeft: { 

    display: 'flex', 

    alignItems: 'center', 

    gap: '20px', 

  }, 

  logoPlaceholder: { 

    width: '48px', 

    height: '48px', 

    backgroundColor: '#e9e9e9', 

    border: '2px dashed #666666', 

    borderRadius: '4px', 

    display: 'flex', 

    alignItems: 'center', 

    justifyContent: 'center', 

    fontSize: '10px', 

    color: '#666666', 

    textTransform: 'uppercase', 

    letterSpacing: '0.5px', 

  }, 

  title: { 

    fontSize: '24px', 

    fontWeight: '600', 

    color: '#000000', 

    margin: 0, 

    letterSpacing: '-0.5px', 

  }, 

  titleAccent: { 

    color: '#009b4a', 

  }, 

  searchContainer: { 

    position: 'relative', 

  }, 

  searchInput: { 

    padding: '10px 16px 10px 40px', 

    fontSize: '14px', 

    border: '2px solid #e9e9e9', 

    borderRadius: '6px', 

    width: '280px', 

    outline: 'none', 

    transition: 'border-color 0.2s ease, box-shadow 0.2s ease', 

    backgroundColor: '#ffffff', 

  }, 

  searchIcon: { 

    position: 'absolute', 

    left: '14px', 

    top: '50%', 

    transform: 'translateY(-50%)', 

    color: '#666666', 

    fontSize: '16px', 

  }, 

  kanbanContainer: { 

    padding: '32px', 

    overflowX: 'auto', 

  }, 

  kanbanBoard: { 

    display: 'flex', 

    gap: '24px', 

    minWidth: 'fit-content', 

  }, 

  column: { 

    backgroundColor: '#ffffff', 

    borderRadius: '8px', 

    padding: '20px', 

    minWidth: '200px', 

    maxWidth: '200px', 

    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)', 

    border: '1px solid rgba(0, 0, 0, 0.06)', 

  }, 

  columnHeader: { 

    fontSize: '18px', 

    fontWeight: '600', 

    color: '#000000', 

    marginBottom: '16px', 

    paddingBottom: '12px', 

    borderBottom: '2px solid #009b4a', 

    display: 'flex', 

    alignItems: 'center', 

    justifyContent: 'space-between', 

  }, 

  columnCount: { 

    fontSize: '12px', 

    fontWeight: '500', 

    color: '#666666', 

    backgroundColor: '#e9e9e9', 

    padding: '2px 8px', 

    borderRadius: '10px', 

  }, 

  itemsContainer: { 

    display: 'flex', 

    flexDirection: 'column', 

    gap: '10px', 

  }, 

  item: { 

    backgroundColor: '#009b4a', 

    color: '#ffffff', 

    padding: '12px 14px', 

    borderRadius: '6px', 

    cursor: 'pointer', 

    transition: 'transform 0.15s ease, box-shadow 0.15s ease, background-color 0.15s ease', 

    position: 'relative', 

  }, 

  itemHover: { 

    transform: 'translateY(-2px)', 

    boxShadow: '0 4px 12px rgba(0, 155, 74, 0.35)', 

    backgroundColor: '#00b356', 

  }, 

  itemId: { 

    fontSize: '11px', 

    fontWeight: '600', 

    opacity: 0.85, 

    marginBottom: '4px', 

    letterSpacing: '0.5px', 

  }, 

  itemName: { 

    fontSize: '14px', 

    fontWeight: '500', 

  }, 

  tooltip: { 

    position: 'absolute', 

    bottom: 'calc(100% + 8px)', 

    left: '50%', 

    transform: 'translateX(-50%)', 

    backgroundColor: '#000000', 

    color: '#ffffff', 

    padding: '8px 12px', 

    borderRadius: '4px', 

    fontSize: '12px', 

    whiteSpace: 'nowrap', 

    zIndex: 100, 

    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)', 

  }, 

  tooltipArrow: { 

    position: 'absolute', 

    bottom: '-6px', 

    left: '50%', 

    transform: 'translateX(-50%)', 

    width: 0, 

    height: 0, 

    borderLeft: '6px solid transparent', 

    borderRight: '6px solid transparent', 

    borderTop: '6px solid #000000', 

  }, 

  emptyColumn: { 

    color: '#666666', 

    fontSize: '13px', 

    textAlign: 'center', 

    padding: '20px 10px', 

    fontStyle: 'italic', 

  }, 

  modalOverlay: { 

    position: 'fixed', 

    top: 0, 

    left: 0, 

    right: 0, 

    bottom: 0, 

    backgroundColor: 'rgba(0, 0, 0, 0.6)', 

    display: 'flex', 

    alignItems: 'center', 

    justifyContent: 'center', 

    zIndex: 1000, 

    backdropFilter: 'blur(4px)', 

  }, 

  modal: { 

    backgroundColor: '#ffffff', 

    borderRadius: '12px', 

    width: '480px', 

    maxWidth: '90vw', 

    maxHeight: '85vh', 

    overflow: 'hidden', 

    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)', 

    animation: 'modalSlideIn 0.25s ease-out', 

  }, 

  modalHeader: { 

    backgroundColor: '#009b4a', 

    color: '#ffffff', 

    padding: '20px 24px', 

    display: 'flex', 

    alignItems: 'center', 

    justifyContent: 'space-between', 

  }, 

  modalTitle: { 

    fontSize: '20px', 

    fontWeight: '600', 

    margin: 0, 

  }, 

  modalClose: { 

    background: 'none', 

    border: 'none', 

    color: '#ffffff', 

    fontSize: '24px', 

    cursor: 'pointer', 

    padding: '4px 8px', 

    borderRadius: '4px', 

    transition: 'background-color 0.15s ease', 

    lineHeight: 1, 

  }, 

  modalBody: { 

    padding: '24px', 

    overflowY: 'auto', 

  }, 

  modalField: { 

    marginBottom: '18px', 

  }, 

  modalLabel: { 

    fontSize: '12px', 

    fontWeight: '600', 

    color: '#666666', 

    textTransform: 'uppercase', 

    letterSpacing: '0.5px', 

    marginBottom: '6px', 

    display: 'block', 

  }, 

  modalValue: { 

    fontSize: '15px', 

    color: '#000000', 

    lineHeight: 1.5, 

  }, 

  modalImagePlaceholder: { 

    width: '100%', 

    height: '140px', 

    backgroundColor: '#e9e9e9', 

    borderRadius: '6px', 

    display: 'flex', 

    alignItems: 'center', 

    justifyContent: 'center', 

    color: '#666666', 

    fontSize: '13px', 

    border: '2px dashed #cccccc', 

  }, 

  statusBadge: { 

    display: 'inline-block', 

    padding: '4px 12px', 

    borderRadius: '20px', 

    fontSize: '13px', 

    fontWeight: '500', 

  }, 

  statusActive: { 

    backgroundColor: 'rgba(0, 155, 74, 0.12)', 

    color: '#009b4a', 

  }, 

  statusMaintenance: { 

    backgroundColor: 'rgba(255, 152, 0, 0.12)', 

    color: '#e68a00', 

  }, 

  statusPlanned: { 

    backgroundColor: 'rgba(102, 102, 102, 0.12)', 

    color: '#666666', 

  }, 

  modalDivider: { 

    height: '1px', 

    backgroundColor: '#e9e9e9', 

    margin: '20px 0', 

  }, 

}; 

 


const injectStyles = () => { 

  if (typeof document !== 'undefined' && !document.getElementById('ekanban-styles')) { 

    const styleSheet = document.createElement('style'); 

    styleSheet.id = 'ekanban-styles'; 

    styleSheet.textContent = ` 

      @keyframes modalSlideIn { 

        from { 

          opacity: 0; 

          transform: translateY(-20px) scale(0.97); 

        } 

        to { 

          opacity: 1; 

          transform: translateY(0) scale(1); 

        } 

      } 

       

      .search-input:focus { 

        border-color: #009b4a !important; 

        box-shadow: 0 0 0 3px rgba(0, 155, 74, 0.15) !important; 

      } 

       

      .modal-close:hover { 

        background-color: rgba(255, 255, 255, 0.15) !important; 

      } 

       

      /* Scrollbar styling */ 

      .kanban-scroll::-webkit-scrollbar { 

        height: 10px; 

      } 

       

      .kanban-scroll::-webkit-scrollbar-track { 

        background: #e9e9e9; 

        border-radius: 5px; 

      } 

       

      .kanban-scroll::-webkit-scrollbar-thumb { 

        background: #009b4a; 

        border-radius: 5px; 

      } 

       

      .kanban-scroll::-webkit-scrollbar-thumb:hover { 

        background: #007a3a; 

      } 

    `; 

    document.head.appendChild(styleSheet); 

  } 

}; 

 

const KanbanItem = ({ item, onClick }) => { 

  const [isHovered, setIsHovered] = useState(false); 

 

  return ( 

    <div 

      style={{ 

        ...styles.item, 

        ...(isHovered ? styles.itemHover : {}), 

      }} 

      onMouseEnter={() => setIsHovered(true)} 

      onMouseLeave={() => setIsHovered(false)} 

      onClick={() => onClick(item)} 

    > 

      {isHovered && ( 

        <div style={styles.tooltip}> 

          Click to view details 

          <div style={styles.tooltipArrow}></div> 

        </div> 

      )} 

      <div style={styles.itemId}>{item.id}</div> 

      <div style={styles.itemName}>{item.name}</div> 

    </div> 

  ); 

}; 

 

const KanbanColumn = ({ year, items, onItemClick }) => { 

  const displayItems = items.slice(0, MAX_ITEMS_PER_COLUMN); 

   

  return ( 

    <div style={styles.column}> 

      <div style={styles.columnHeader}> 

        <span>{year}</span> 

        <span style={styles.columnCount}>{items.length}</span> 

      </div> 

      <div style={styles.itemsContainer}> 

        {displayItems.length > 0 ? ( 

          displayItems.map((item) => ( 

            <KanbanItem key={item.id} item={item} onClick={onItemClick} /> 

          )) 

        ) : ( 

          <div style={styles.emptyColumn}>No items</div> 

        )} 

        {items.length > MAX_ITEMS_PER_COLUMN && ( 

          <div style={{ ...styles.emptyColumn, fontStyle: 'normal', color: '#009b4a' }}> 

            +{items.length - MAX_ITEMS_PER_COLUMN} more 

          </div> 

        )} 

      </div> 

    </div> 

  ); 

}; 

 

const DetailModal = ({ item, onClose }) => { 

  if (!item) return null; 

 

  const getStatusStyle = (status) => { 

    switch (status) { 

      case 'Active': 

        return { ...styles.statusBadge, ...styles.statusActive }; 

      case 'Maintenance': 

        return { ...styles.statusBadge, ...styles.statusMaintenance }; 

      default: 

        return { ...styles.statusBadge, ...styles.statusPlanned }; 

    } 

  }; 

 

  return ( 

    <div style={styles.modalOverlay} onClick={onClose}> 

      <div style={styles.modal} onClick={(e) => e.stopPropagation()}> 

        <div style={styles.modalHeader}> 

          <h2 style={styles.modalTitle}>{item.name}</h2> 

          <button 

            className="modal-close" 

            style={styles.modalClose} 

            onClick={onClose} 

          > 

            × 

          </button> 

        </div> 

        <div style={styles.modalBody}> 

          <div style={styles.modalField}> 

            <span style={styles.modalLabel}>ID</span> 

            <div style={styles.modalValue}>{item.id}</div> 

          </div> 

 

          <div style={styles.modalField}> 

            <span style={styles.modalLabel}>Type</span> 

            <div style={styles.modalValue}>{item.type}</div> 

          </div> 

 

          <div style={styles.modalField}> 

            <span style={styles.modalLabel}>Status</span> 

            <div style={getStatusStyle(item.status)}>{item.status}</div> 

          </div> 

 

          <div style={styles.modalField}> 

            <span style={styles.modalLabel}>Material</span> 

            <div style={styles.modalValue}>{item.material}</div> 

          </div> 

 

          <div style={styles.modalField}> 

            <span style={styles.modalLabel}>Year of Assignment</span> 

            <div style={styles.modalValue}>{item.year}</div> 

          </div> 

 

          <div style={styles.modalDivider}></div> 

 

          <div style={styles.modalField}> 

            <span style={styles.modalLabel}>Notes / Specifications</span> 

            <div style={styles.modalValue}>{item.notes || 'No notes available'}</div> 

          </div> 

 

          <div style={styles.modalField}> 

            <span style={styles.modalLabel}>Image</span> 

            <div style={styles.modalImagePlaceholder}> 

              No image available 

            </div> 

          </div> 

        </div> 

      </div> 

    </div> 

  ); 

}; 

 

const EKanban = () => { 

  const [selectedItem, setSelectedItem] = useState(null); 

  const [searchQuery, setSearchQuery] = useState(''); 

 


  React.useEffect(() => { 

    injectStyles(); 

  }, []); 

 


  const years = Object.keys(sampleData).sort((a, b) => Number(a) - Number(b)); 

 

  return ( 

    <div style={styles.container}> 

      {/* Header */} 

      <header style={styles.header}> 

        <div style={styles.headerLeft}> 

          <div style={styles.logoPlaceholder}>Logo</div> 

          <h1 style={styles.title}> 

            <span style={styles.titleAccent}>E-Kanban</span> Tool Room 

          </h1> 

        </div> 

        <div style={styles.searchContainer}> 

          <span style={styles.searchIcon}>🔍</span> 

          <input 

            type="text" 

            className="search-input" 

            style={styles.searchInput} 

            placeholder="Search machines or dies..." 

            value={searchQuery} 

            onChange={(e) => setSearchQuery(e.target.value)} 

          /> 

        </div> 

      </header> 

 

      {/* Kanban Board */} 

      <div className="kanban-scroll" style={styles.kanbanContainer}> 

        <div style={styles.kanbanBoard}> 

          {years.map((year) => ( 

            <KanbanColumn 

              key={year} 

              year={year} 

              items={sampleData[year] || []} 

              onItemClick={setSelectedItem} 

            /> 

          ))} 

        </div> 

      </div> 

 

      {/* Detail Modal */} 

      <DetailModal item={selectedItem} onClose={() => setSelectedItem(null)} /> 

    </div> 

  ); 

}; 

 

export default EKanban; 