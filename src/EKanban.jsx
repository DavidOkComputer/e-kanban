import React, { useState } from 'react';

// mapa de los colores por estado
const statusColors = {
  'En prensa': '#009b4a',
  'Backup': '#009b4a',
  'En reparación': '#ff4466',
  'Pendiente': '#666666',
  'Siguiente orden': '#00f073',
  'Set up': '#00e5ff',
  'Por reparar': '#ff4466',
};

// info de ejemplo
const sampleData = {
  2025: [
    { id: 'DIE-001', name: 'Alpha', type: 'Die', material: 'Aluminum 6061', status: 'En prensa', year: 2025, notes: 'Primary stamping die for chassis components', image: null },
    { id: 'DIE-002', name: 'Beta', type: 'Mold', material: 'Steel Sheet', status: 'Backup', year: 2025, notes: 'Injection mold for housing units', image: null },
    { id: 'MCH-001', name: 'Gamma', type: 'Machine', material: 'Multi-material', status: 'En reparación', year: 2025, notes: 'CNC cutting machine - scheduled maintenance Q2', image: null },
    { id: 'DIE-003', name: 'Delta', type: 'Die', material: 'Copper Sheet', status: 'Pendiente', year: 2025, notes: 'Progressive die for connector plates', image: null },
    { id: 'DIE-004', name: 'Echo', type: 'Die', material: 'Aluminum 5052', status: 'En prensa', year: 2025, notes: 'High-speed stamping for brackets', image: null },
  ],
  2026: [
    { id: 'DIE-005', name: 'Zeta', type: 'Die', material: 'Stainless Steel', status: 'Siguiente orden', year: 2026, notes: 'New acquisition - deep draw capability', image: null },
    { id: 'MCH-002', name: 'Eta', type: 'Machine', material: 'Multi-material', status: 'Set up', year: 2026, notes: 'Fiber laser cutting system', image: null },
    { id: 'DIE-006', name: 'Theta', type: 'Mold', material: 'Aluminum 7075', status: 'Por reparar', year: 2026, notes: 'Precision mold for aerospace parts', image: null },
  ],
  2027: [
    { id: 'DIE-007', name: 'Iota', type: 'Die', material: 'Titanium Sheet', status: 'Backup', year: 2027, notes: 'Specialty forming die', image: null },
    { id: 'MCH-003', name: 'Kappa', type: 'Machine', material: 'Multi-material', status: 'En prensa', year: 2027, notes: 'Automated bending station', image: null },
    { id: 'DIE-008', name: 'Lambda', type: 'Die', material: 'Steel Sheet', status: 'Pendiente', year: 2027, notes: 'Blanking die for panels', image: null },
    { id: 'DIE-009', name: 'Mu', type: 'Die', material: 'Aluminum 6061', status: 'En prensa', year: 2027, notes: 'Transfer die system', image: null },
    { id: 'MCH-004', name: 'Nu', type: 'Machine', material: 'Multi-material', status: 'Set up', year: 2027, notes: 'Robotic welding cell', image: null },
    { id: 'DIE-010', name: 'Xi', type: 'Mold', material: 'Zinc Alloy', status: 'Backup', year: 2027, notes: 'Die casting mold', image: null },
  ],
  2028: [
    { id: 'DIE-011', name: 'Omicron', type: 'Die', material: 'Brass Sheet', status: 'Siguiente orden', year: 2028, notes: 'Decorative forming die', image: null },
    { id: 'MCH-005', name: 'Pi', type: 'Machine', material: 'Multi-material', status: 'Por reparar', year: 2028, notes: 'Automated assembly line', image: null },
  ],
  2029: [
    { id: 'DIE-012', name: 'Rho', type: 'Die', material: 'Aluminum 2024', status: 'Pendiente', year: 2029, notes: 'High-precision aerospace die', image: null },
  ],
};

// Priority repair data
const priorityRepairData = [
  { priority: 1, name: 'Delta' },
  { priority: 2, name: 'Gamma' },
  { priority: 3, name: 'Alpha' },
  { priority: 4, name: 'Echo' },
  { priority: 5, name: 'Beta' },
];

const MAX_ITEMS_PER_COLUMN = 8;

//keyframes de animacion de css
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
      
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(5px); }
        to { opacity: 1; transform: translateY(0); }
      }

      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }

      @keyframes neonPulse {
        0%, 100% {
          box-shadow: 
            0 0 5px #00ff88,
            0 0 10px #00ff88,
            0 0 20px #00ff88,
            0 0 40px rgba(0, 255, 136, 0.3),
            inset 0 0 10px rgba(0, 255, 136, 0.1);
          border-color: #00ff88;
        }
        50% {
          box-shadow: 
            0 0 2px #00ff88,
            0 0 5px #00ff88,
            0 0 10px #00ff88,
            0 0 20px rgba(0, 255, 136, 0.2),
            inset 0 0 5px rgba(0, 255, 136, 0.05);
          border-color: rgba(0, 255, 136, 0.7);
        }
      }

      @keyframes scanline {
        0% { transform: translateY(-100%); }
        100% { transform: translateY(100vh); }
      }

      @keyframes glowLine {
        0%, 100% { opacity: 0.5; }
        50% { opacity: 1; }
      }
      
      .search-input:focus {
        border-color: #00ff88 !important;
        box-shadow: 0 0 15px rgba(0, 255, 136, 0.4), 0 0 30px rgba(0, 255, 136, 0.2) !important;
      }
      
      .modal-close:hover {
        background-color: rgba(0, 255, 136, 0.2) !important;
        box-shadow: 0 0 15px rgba(0, 255, 136, 0.5);
      }
      
      /* Modern scrollbar styling */
      .kanban-scroll::-webkit-scrollbar {
        height: 8px;
      }
      
      .kanban-scroll::-webkit-scrollbar-track {
        background: rgba(0, 0, 0, 0.3);
        border-radius: 4px;
      }
      
      .kanban-scroll::-webkit-scrollbar-thumb {
        background: linear-gradient(90deg, #00ff88 0%, #00cc6a 100%);
        border-radius: 4px;
        box-shadow: 0 0 10px rgba(0, 255, 136, 0.5);
      }
      
      .kanban-scroll::-webkit-scrollbar-thumb:hover {
        background: linear-gradient(90deg, #00ff99 0%, #00ff88 100%);
      }

      .kanban-item {
        animation: neonPulse 2s ease-in-out infinite, fadeIn 0.3s ease forwards;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .kanban-item:hover {
        transform: translateY(-6px) scale(1.1);
        box-shadow: 
          0 0 10px #00ff88,
          0 0 20px #00ff88,
          0 0 40px #00ff88,
          0 0 80px rgba(0, 255, 136, 0.5),
          inset 0 0 20px rgba(0, 255, 136, 0.2) !important;
        border-color: #00ff88 !important;
        z-index: 10;
      }

      .priority-row {
        transition: all 0.2s ease;
      }

      .priority-row:hover {
        background-color: rgba(0, 255, 136, 0.1) !important;
        transform: translateX(4px);
        box-shadow: 0 0 20px rgba(0, 255, 136, 0.2);
      }

      .column-card {
        transition: all 0.3s ease;
      }

      .column-card:hover {
        box-shadow: 
          0 0 20px rgba(0, 255, 136, 0.15),
          0 8px 32px rgba(0, 0, 0, 0.4);
        border-color: rgba(0, 255, 136, 0.3);
      }

      .status-box {
        transition: all 0.2s ease;
      }

      .status-box:hover {
        transform: scale(1.1);
        box-shadow: 0 0 20px currentColor;
      }
    `;
    document.head.appendChild(styleSheet);
  }
};

const KanbanItem = ({ item, onClick, index }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="kanban-item"
      style={{
        backgroundColor: 'rgba(0, 40, 20, 0.8)',
        color: '#00ff88',
        width: '72px',
        height: '72px',
        borderRadius: '10px',
        cursor: 'pointer',
        position: 'relative',
        border: '2px solid #00ff88',
        animationDelay: `${index * 0.1}s, ${index * 0.05}s`,
        opacity: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '6px',
        boxSizing: 'border-box',
        backdropFilter: 'blur(4px)',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onClick(item)}
    >
      {isHovered && (
        <div style={{
          position: 'absolute',
          bottom: 'calc(100% + 10px)',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: 'rgba(0, 20, 10, 0.95)',
          color: '#00ff88',
          padding: '10px 14px',
          borderRadius: '8px',
          fontSize: '11px',
          whiteSpace: 'nowrap',
          zIndex: 100,
          border: '1px solid #00ff88',
          boxShadow: '0 0 20px rgba(0, 255, 136, 0.4), 0 8px 32px rgba(0, 0, 0, 0.5)',
          fontWeight: '500',
          backdropFilter: 'blur(8px)',
        }}>
          {item.id} - {item.name}
          <div style={{
            position: 'absolute',
            bottom: '-6px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 0,
            height: 0,
            borderLeft: '6px solid transparent',
            borderRight: '6px solid transparent',
            borderTop: '6px solid #00ff88',
          }}></div>
        </div>
      )}
      <div style={{
        fontSize: '10px',
        fontWeight: '700',
        letterSpacing: '0.5px',
        textAlign: 'center',
        lineHeight: 1.2,
        textShadow: '0 0 10px rgba(0, 255, 136, 0.8)',
      }}>{item.id.split('-')[1]}</div>
      <div style={{
        fontSize: '11px',
        fontWeight: '600',
        textAlign: 'center',
        lineHeight: 1.2,
        marginTop: '4px',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        width: '100%',
        textShadow: '0 0 10px rgba(0, 255, 136, 0.8)',
      }}>{item.name}</div>
    </div>
  );
};

const KanbanColumn = ({ year, items, onItemClick }) => {
  const displayItems = items.slice(0, MAX_ITEMS_PER_COLUMN);
  
  return (
    <div 
      className="column-card"
      style={{
        backgroundColor: 'rgba(10, 20, 15, 0.85)',
        borderRadius: '12px',
        padding: '14px',
        minWidth: '180px',
        maxWidth: '180px',
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(0, 255, 136, 0.1)',
        border: '1px solid rgba(0, 255, 136, 0.2)',
        backdropFilter: 'blur(10px)',
      }}
    >
      <div style={{
        fontSize: '18px',
        fontWeight: '700',
        color: '#ffffff',
        marginBottom: '14px',
        paddingBottom: '10px',
        borderBottom: '2px solid #00ff88',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        textShadow: '0 0 20px rgba(0, 255, 136, 0.5)',
        boxShadow: '0 2px 0 rgba(0, 255, 136, 0.3)',
      }}>
        <span>{year}</span>
        <span style={{
          fontSize: '11px',
          fontWeight: '600',
          color: '#000000',
          backgroundColor: '#00ff88',
          padding: '3px 10px',
          borderRadius: '10px',
          boxShadow: '0 0 15px rgba(0, 255, 136, 0.6)',
        }}>{items.length}</span>
      </div>
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
        justifyContent: 'flex-start',
      }}>
        {displayItems.length > 0 ? (
          displayItems.map((item, index) => (
            <KanbanItem key={item.id} item={item} onClick={onItemClick} index={index} />
          ))
        ) : (
          <div style={{
            color: 'rgba(0, 255, 136, 0.5)',
            fontSize: '11px',
            textAlign: 'center',
            padding: '16px 8px',
            fontStyle: 'italic',
            width: '100%',
          }}>No items</div>
        )}
        {items.length > MAX_ITEMS_PER_COLUMN && (
          <div style={{
            color: '#00ff88',
            fontSize: '10px',
            textAlign: 'center',
            padding: '4px',
            fontWeight: '600',
            backgroundColor: 'rgba(0, 255, 136, 0.1)',
            borderRadius: '6px',
            width: '100%',
            border: '1px solid rgba(0, 255, 136, 0.3)',
          }}>
            +{items.length - MAX_ITEMS_PER_COLUMN} more
          </div>
        )}
      </div>
    </div>
  );
};

const PriorityRepairTable = () => {
  return (
    <div style={{
      backgroundColor: 'rgba(10, 20, 15, 0.85)',
      borderRadius: '12px',
      padding: '14px',
      boxShadow: '0 4px 24px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(0, 255, 136, 0.1)',
      border: '1px solid rgba(0, 255, 136, 0.2)',
      minWidth: '200px',
      backdropFilter: 'blur(10px)',
    }}>
      <h3 style={{
        fontSize: '13px',
        fontWeight: '700',
        color: '#ffffff',
        marginBottom: '12px',
        paddingBottom: '8px',
        borderBottom: '2px solid #00ff88',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        margin: 0,
        marginBottom: '12px',
        textShadow: '0 0 20px rgba(0, 255, 136, 0.5)',
      }}>
        <span style={{
          width: '8px',
          height: '8px',
          backgroundColor: '#ff4466',
          borderRadius: '50%',
          animation: 'pulse 1s infinite',
          boxShadow: '0 0 10px #ff4466, 0 0 20px rgba(255, 68, 102, 0.5)',
        }}></span>
        Priority Repairs
      </h3>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}>
        {priorityRepairData.map((item) => (
          <div 
            key={item.priority} 
            className="priority-row"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '8px 10px',
              borderRadius: '8px',
              backgroundColor: 'rgba(0, 255, 136, 0.05)',
              border: '1px solid rgba(0, 255, 136, 0.1)',
              cursor: 'pointer',
            }}
          >
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '24px',
              height: '24px',
              backgroundColor: item.priority === 1 ? '#ff4466' : item.priority === 2 ? '#ffaa00' : '#00ff88',
              color: item.priority <= 2 ? '#000000' : '#000000',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: '700',
              flexShrink: 0,
              boxShadow: item.priority === 1 
                ? '0 0 15px rgba(255, 68, 102, 0.6)' 
                : item.priority === 2 
                  ? '0 0 15px rgba(255, 170, 0, 0.6)' 
                  : '0 0 15px rgba(0, 255, 136, 0.6)',
            }}>{item.priority}</span>
            <span style={{
              fontSize: '13px',
              fontWeight: '600',
              color: '#ffffff',
              textShadow: '0 0 10px rgba(255, 255, 255, 0.3)',
            }}>{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const StatusLegend = () => {
  const statuses = [
    { name: 'En prensa', color: '#009b4a' },
    { name: 'Backup', color: '#009b4a' },
    { name: 'En reparación', color: '#ff4466' },
    { name: 'Pendiente', color: '#666666' },
    { name: 'Siguiente orden', color: '#00f073' },
    { name: 'Set up', color: '#00e5ff' },
    { name: 'Por reparar', color: '#ff4466' },
  ];

  return (
    <div style={{
      backgroundColor: 'rgba(10, 20, 15, 0.85)',
      borderRadius: '12px',
      padding: '14px',
      boxShadow: '0 4px 24px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(0, 255, 136, 0.1)',
      border: '1px solid rgba(0, 255, 136, 0.2)',
      flex: 1,
      backdropFilter: 'blur(10px)',
    }}>
      <h3 style={{
        fontSize: '13px',
        fontWeight: '700',
        color: '#ffffff',
        marginBottom: '12px',
        paddingBottom: '8px',
        borderBottom: '2px solid #00ff88',
        margin: 0,
        marginBottom: '12px',
        textShadow: '0 0 20px rgba(0, 255, 136, 0.5)',
      }}>
        Status Legend
      </h3>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '10px',
      }}>
        {statuses.map((status) => (
          <div 
            key={status.name}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <div 
              className="status-box"
              style={{
                width: '28px',
                height: '28px',
                backgroundColor: status.color,
                borderRadius: '6px',
                boxShadow: `0 0 15px ${status.color}80, 0 0 30px ${status.color}40`,
                flexShrink: 0,
                border: `1px solid ${status.color}`,
              }}
            ></div>
            <span style={{
              fontSize: '11px',
              fontWeight: '500',
              color: '#cccccc',
            }}>{status.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const DetailModal = ({ item, onClose }) => {
  if (!item) return null;

  const statusColor = statusColors[item.status] || '#00ff88';

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        backdropFilter: 'blur(12px)',
      }} 
      onClick={onClose}
    >
      <div 
        style={{
          backgroundColor: 'rgba(10, 20, 15, 0.95)',
          borderRadius: '16px',
          width: '420px',
          maxWidth: '90vw',
          maxHeight: '80vh',
          overflow: 'hidden',
          boxShadow: '0 0 40px rgba(0, 255, 136, 0.3), 0 25px 80px rgba(0, 0, 0, 0.5)',
          animation: 'modalSlideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          border: '1px solid rgba(0, 255, 136, 0.3)',
        }} 
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{
          backgroundColor: 'rgba(0, 255, 136, 0.15)',
          borderBottom: '2px solid #00ff88',
          color: '#00ff88',
          padding: '18px 22px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 4px 20px rgba(0, 255, 136, 0.2)',
        }}>
          <h2 style={{
            fontSize: '18px',
            fontWeight: '700',
            margin: 0,
            textShadow: '0 0 20px rgba(0, 255, 136, 0.8)',
          }}>{item.name}</h2>
          <button
            className="modal-close"
            style={{
              background: 'rgba(0, 255, 136, 0.1)',
              border: '1px solid rgba(0, 255, 136, 0.3)',
              color: '#00ff88',
              fontSize: '20px',
              cursor: 'pointer',
              padding: '6px 10px',
              borderRadius: '8px',
              transition: 'all 0.2s ease',
              lineHeight: 1,
            }}
            onClick={onClose}
          >
            ×
          </button>
        </div>
        <div style={{
          padding: '20px',
          overflowY: 'auto',
          maxHeight: 'calc(80vh - 60px)',
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <span style={{
                fontSize: '10px',
                fontWeight: '700',
                color: '#00ff88',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                marginBottom: '4px',
                display: 'block',
                textShadow: '0 0 10px rgba(0, 255, 136, 0.5)',
              }}>ID</span>
              <div style={{
                fontSize: '14px',
                color: '#ffffff',
                fontWeight: '600',
              }}>{item.id}</div>
            </div>

            <div>
              <span style={{
                fontSize: '10px',
                fontWeight: '700',
                color: '#00ff88',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                marginBottom: '4px',
                display: 'block',
                textShadow: '0 0 10px rgba(0, 255, 136, 0.5)',
              }}>Type</span>
              <div style={{
                fontSize: '14px',
                color: '#ffffff',
              }}>{item.type}</div>
            </div>

            <div>
              <span style={{
                fontSize: '10px',
                fontWeight: '700',
                color: '#00ff88',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                marginBottom: '4px',
                display: 'block',
                textShadow: '0 0 10px rgba(0, 255, 136, 0.5)',
              }}>Status</span>
              <div style={{
                display: 'inline-block',
                padding: '4px 10px',
                borderRadius: '12px',
                fontSize: '11px',
                fontWeight: '600',
                backgroundColor: statusColor,
                color: '#000000',
                boxShadow: `0 0 15px ${statusColor}80`,
              }}>{item.status}</div>
            </div>

            <div>
              <span style={{
                fontSize: '10px',
                fontWeight: '700',
                color: '#00ff88',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                marginBottom: '4px',
                display: 'block',
                textShadow: '0 0 10px rgba(0, 255, 136, 0.5)',
              }}>Year</span>
              <div style={{
                fontSize: '14px',
                color: '#ffffff',
              }}>{item.year}</div>
            </div>
          </div>

          <div style={{ marginTop: '16px' }}>
            <span style={{
              fontSize: '10px',
              fontWeight: '700',
              color: '#00ff88',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              marginBottom: '4px',
              display: 'block',
              textShadow: '0 0 10px rgba(0, 255, 136, 0.5)',
            }}>Material</span>
            <div style={{
              fontSize: '14px',
              color: '#ffffff',
            }}>{item.material}</div>
          </div>

          <div style={{
            height: '1px',
            background: 'linear-gradient(90deg, transparent, #00ff88, transparent)',
            margin: '16px 0',
            boxShadow: '0 0 10px rgba(0, 255, 136, 0.5)',
          }}></div>

          <div>
            <span style={{
              fontSize: '10px',
              fontWeight: '700',
              color: '#00ff88',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              marginBottom: '4px',
              display: 'block',
              textShadow: '0 0 10px rgba(0, 255, 136, 0.5)',
            }}>Notes / Specifications</span>
            <div style={{
              fontSize: '13px',
              color: '#cccccc',
              lineHeight: 1.5,
              backgroundColor: 'rgba(0, 255, 136, 0.05)',
              padding: '10px 12px',
              borderRadius: '8px',
              border: '1px solid rgba(0, 255, 136, 0.1)',
            }}>{item.notes || 'No notes available'}</div>
          </div>

          <div style={{ marginTop: '16px' }}>
            <span style={{
              fontSize: '10px',
              fontWeight: '700',
              color: '#00ff88',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              marginBottom: '4px',
              display: 'block',
              textShadow: '0 0 10px rgba(0, 255, 136, 0.5)',
            }}>Image</span>
            <div style={{
              width: '100%',
              height: '100px',
              backgroundColor: 'rgba(0, 255, 136, 0.05)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'rgba(0, 255, 136, 0.5)',
              fontSize: '11px',
              border: '2px dashed rgba(0, 255, 136, 0.2)',
            }}>
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

  // agregar las animaciones css
  React.useEffect(() => {
    injectStyles();
  }, []);

  // obtener los años 
  const years = Object.keys(sampleData).sort((a, b) => Number(a) - Number(b));

  return (
    <div style={{
      height: '100vh',
      background: 'linear-gradient(135deg, #0a0f0d 0%, #0d1a14 50%, #081210 100%)',
      fontFamily: "'Segoe UI', 'Roboto', -apple-system, BlinkMacSystemFont, sans-serif",
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      position: 'relative',
    }}>
      {}
      <div style={{
        position: 'absolute',
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
      }}></div>

      {}
      <header style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto 1fr',
        alignItems: 'center',
        padding: '12px 24px',
        backgroundColor: 'rgba(10, 20, 15, 0.9)',
        borderBottom: '2px solid #00ff88',
        boxShadow: '0 4px 30px rgba(0, 255, 136, 0.2), 0 0 60px rgba(0, 255, 136, 0.1)',
        flexShrink: 0,
        position: 'relative',
        zIndex: 10,
        backdropFilter: 'blur(10px)',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
        }}>
          <div style={{
            width: '44px',
            height: '44px',
            backgroundColor: 'rgba(0, 255, 136, 0.1)',
            border: '2px solid rgba(0, 255, 136, 0.4)',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '9px',
            color: '#00ff88',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            fontWeight: '600',
            boxShadow: '0 0 20px rgba(0, 255, 136, 0.2)',
          }}>Logo</div>
        </div>
        
        <h1 style={{
          fontSize: '26px',
          fontWeight: '800',
          color: '#ffffff',
          margin: 0,
          letterSpacing: '1px',
          textAlign: 'center',
          textShadow: '0 0 30px rgba(0, 255, 136, 0.6), 0 0 60px rgba(0, 255, 136, 0.3)',
        }}>
          <span style={{ color: '#00ff88' }}>E-Kanban</span> Tool Room
        </h1>
        
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
        }}>
          <div style={{ position: 'relative' }}>
            <span style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#00ff88',
              fontSize: '14px',
            }}>🔍</span>
            <input
              type="text"
              className="search-input"
              style={{
                padding: '10px 16px 10px 36px',
                fontSize: '13px',
                border: '2px solid rgba(0, 255, 136, 0.3)',
                borderRadius: '10px',
                width: '240px',
                outline: 'none',
                transition: 'all 0.3s ease',
                backgroundColor: 'rgba(0, 255, 136, 0.05)',
                fontWeight: '500',
                color: '#ffffff',
              }}
              placeholder="Search machines or dies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </header>

      {/* Kanban Board */}
      <div 
        className="kanban-scroll" 
        style={{
          padding: '20px 24px',
          overflowX: 'auto',
          flex: 1,
          position: 'relative',
          zIndex: 5,
        }}
      >
        <div style={{
          display: 'flex',
          gap: '16px',
          minWidth: 'fit-content',
        }}>
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

      {/* Bottom Section: Tables */}
      <div style={{
        padding: '0 24px 20px 24px',
        display: 'flex',
        gap: '16px',
        flexShrink: 0,
        position: 'relative',
        zIndex: 5,
      }}>
        <PriorityRepairTable />
        <StatusLegend />
      </div>

      {/* Detail Modal */}
      <DetailModal item={selectedItem} onClose={() => setSelectedItem(null)} />
    </div>
  );
};

export default EKanban;