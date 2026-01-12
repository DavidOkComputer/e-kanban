<<<<<<< HEAD
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
=======
import React, { useState, useEffect, memo, useCallback } from 'react';

const API_BASE = 'http://localhost:3001/api';

// Status colors
const statusColors = {
  'En prensa': '#00ff88',
  'Listo-BackUp': '#00d4ff',
  'Listo': '#00e5ff',
  'Reparando': '#ff4466',
  'Pendiente': '#ffaa00',
};

const statuses = [
  { name: 'En prensa', color: '#00ff88' },
  { name: 'Listo-BackUp', color: '#00d4ff' },
  { name: 'Listo', color: '#00e5ff' },
  { name: 'Reparando', color: '#ff4466' },
  { name: 'Pendiente', color: '#ffaa00' },
  { name: 'Set up', color: '#bf5fff' },
  { name: 'Por reparar', color: '#ffee00' },
];

const MAX_ITEMS = 8;

// Inject optimized styles once
const injectStyles = () => {
  if (document.getElementById('ekanban-styles')) return;
  const style = document.createElement('style');
  style.id = 'ekanban-styles';
  style.textContent = `
    @keyframes neonPulse {
      0%, 100% { opacity: 1; box-shadow: 0 0 8px #00ff88, 0 0 16px rgba(0,255,136,0.4); }
      50% { opacity: 0.85; box-shadow: 0 0 4px #00ff88, 0 0 8px rgba(0,255,136,0.2); }
    }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
    @keyframes modalIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
    .ki { animation: neonPulse 2.5s ease-in-out infinite; transition: transform 0.2s, box-shadow 0.2s; }
    .ki:hover { transform: translateY(-4px) scale(1.08); box-shadow: 0 0 20px #00ff88, 0 0 40px rgba(0,255,136,0.5) !important; }
    .search-input:focus { border-color: #00ff88 !important; box-shadow: 0 0 12px rgba(0,255,136,0.4) !important; }
    .kanban-scroll::-webkit-scrollbar { height: 6px; }
    .kanban-scroll::-webkit-scrollbar-track { background: rgba(0,0,0,0.3); border-radius: 3px; }
    .kanban-scroll::-webkit-scrollbar-thumb { background: #00ff88; border-radius: 3px; }
    .col-card:hover { box-shadow: 0 0 16px rgba(0,255,136,0.2), 0 6px 24px rgba(0,0,0,0.3); }
    .pri:hover { background: rgba(0,255,136,0.12) !important; transform: translateY(-1px); }
    .tab-btn:hover { background: rgba(0,255,136,0.1) !important; }
    .form-el:focus { border-color: #00ff88 !important; box-shadow: 0 0 8px rgba(0,255,136,0.3) !important; outline: none; }
    .close-btn:hover { background: rgba(255,68,102,0.9) !important; }
    .loading { animation: pulse 1s infinite; }
  `;
  document.head.appendChild(style);
};

// Memoized Kanban Item
const KanbanItem = memo(({ item, onClick }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className="ki"
      onClick={() => onClick(item)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'rgba(0,40,20,0.85)',
        color: '#00ff88',
        width: 72,
        height: 72,
        borderRadius: 10,
        cursor: 'pointer',
        position: 'relative',
        border: '2px solid #00ff88',
>>>>>>> 7ab2742be43702efea67d09e14df2246a28ae5f6
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
<<<<<<< HEAD
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
=======
        padding: 6,
        boxSizing: 'border-box',
      }}
    >
      {hovered && (
        <div style={{
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
>>>>>>> 7ab2742be43702efea67d09e14df2246a28ae5f6
        }}>
          {item.id} - {item.name}
          <div style={{
            position: 'absolute',
<<<<<<< HEAD
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
=======
            bottom: -5,
            left: '50%',
            transform: 'translateX(-50%)',
            borderLeft: '5px solid transparent',
            borderRight: '5px solid transparent',
            borderTop: '5px solid #00ff88',
          }} />
        </div>
      )}
      <div style={{ fontSize: 10, fontWeight: 700, textShadow: '0 0 8px rgba(0,255,136,0.7)' }}>{item.id}</div>
      <div style={{ fontSize: 11, fontWeight: 600, marginTop: 3, textShadow: '0 0 8px rgba(0,255,136,0.7)' }}>{item.name}</div>
    </div>
  );
});

// Memoized Column
const KanbanColumn = memo(({ year, items, onItemClick }) => {
  const display = items.slice(0, MAX_ITEMS);
  return (
    <div className="col-card" style={{
      background: 'rgba(10,20,15,0.85)',
      borderRadius: 12,
      padding: 14,
      minWidth: 180,
      maxWidth: 180,
      boxShadow: '0 4px 20px rgba(0,0,0,0.35)',
      border: '1px solid rgba(0,255,136,0.2)',
      transition: 'box-shadow 0.2s',
    }}>
      <div style={{
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
      }}>
        <span>{year}</span>
        <span style={{
          fontSize: 11,
          fontWeight: 600,
          color: '#000',
          background: '#00ff88',
          padding: '2px 8px',
          borderRadius: 10,
          boxShadow: '0 0 10px rgba(0,255,136,0.5)',
        }}>{items.length}</span>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {display.length > 0 ? display.map(item => (
          <KanbanItem key={item.id} item={item} onClick={onItemClick} />
        )) : (
          <div style={{ color: 'rgba(0,255,136,0.4)', fontSize: 11, textAlign: 'center', padding: 16, width: '100%', fontStyle: 'italic' }}>No items</div>
        )}
        {items.length > MAX_ITEMS && (
          <div style={{ color: '#00ff88', fontSize: 10, textAlign: 'center', padding: 4, fontWeight: 600, background: 'rgba(0,255,136,0.1)', borderRadius: 6, width: '100%', border: '1px solid rgba(0,255,136,0.3)' }}>
            +{items.length - MAX_ITEMS} more
>>>>>>> 7ab2742be43702efea67d09e14df2246a28ae5f6
          </div>
        )}
      </div>
    </div>
  );
<<<<<<< HEAD
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
=======
});

// Troqueles Table
const TroquelesTable = memo(({ data }) => (
  <div style={{
    background: 'rgba(10,20,15,0.85)',
    borderRadius: 10,
    padding: 12,
    boxShadow: '0 4px 20px rgba(0,0,0,0.35)',
    border: '1px solid rgba(0,255,136,0.2)',
  }}>
    <h3 style={{ fontSize: 11, fontWeight: 700, color: '#fff', marginBottom: 8, paddingBottom: 6, borderBottom: '2px solid #00ff88', margin: 0, textTransform: 'uppercase', letterSpacing: 0.5 }}>Troqueles</h3>
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10 }}>
      <thead>
        <tr>
          {['', '#', 'GOAL', 'PERF'].map((h, i) => (
            <th key={i} style={{ padding: '4px 8px', textAlign: i === 0 ? 'left' : 'center', fontWeight: 600, color: '#00ff88', fontSize: 9, textTransform: 'uppercase', borderBottom: '1px solid rgba(0,255,136,0.2)' }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((r, i) => (
          <tr key={r.label} style={{ borderBottom: i < 2 ? '1px solid rgba(0,255,136,0.1)' : 'none' }}>
            <td style={{ padding: '6px 8px', fontWeight: 600, color: '#fff', fontSize: 10 }}>{r.label}</td>
            <td style={{ padding: '6px 8px', textAlign: 'center', color: '#ccc' }}>{r.count}</td>
            <td style={{ padding: '6px 8px', textAlign: 'center', color: '#ccc' }}>{r.goal}</td>
            <td style={{ padding: '6px 8px', textAlign: 'center', color: '#ccc' }}>{r.perf}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
));

// Priority Repairs
const PriorityRepairs = memo(({ data }) => (
  <div style={{
    background: 'rgba(10,20,15,0.85)',
    borderRadius: 10,
    padding: 12,
    boxShadow: '0 4px 20px rgba(0,0,0,0.35)',
    border: '1px solid rgba(0,255,136,0.2)',
    flex: 1,
  }}>
    <h3 style={{ fontSize: 11, fontWeight: 700, color: '#fff', marginBottom: 8, paddingBottom: 6, borderBottom: '2px solid #00ff88', margin: 0, display: 'flex', alignItems: 'center', gap: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
      <span style={{ width: 6, height: 6, background: '#ff4466', borderRadius: '50%', animation: 'pulse 1s infinite', boxShadow: '0 0 6px #ff4466' }} />
      Priority Repairs
    </h3>
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {data.map(item => (
        <div key={item.priority} className="pri" style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '6px 10px',
          borderRadius: 6,
          background: 'rgba(0,255,136,0.05)',
          border: '1px solid rgba(0,255,136,0.15)',
          cursor: 'pointer',
          transition: 'all 0.15s',
        }}>
          <span style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 20,
            height: 20,
            background: item.priority === 1 ? '#ff4466' : item.priority === 2 ? '#ffaa00' : '#00ff88',
            color: '#000',
            borderRadius: 4,
            fontSize: 10,
            fontWeight: 700,
            boxShadow: `0 0 8px ${item.priority === 1 ? 'rgba(255,68,102,0.5)' : item.priority === 2 ? 'rgba(255,170,0,0.5)' : 'rgba(0,255,136,0.5)'}`,
          }}>{item.priority}</span>
          <span style={{ fontSize: 11, fontWeight: 600, color: '#fff' }}>{item.name}</span>
        </div>
      ))}
    </div>
  </div>
));

// Status Legend
const StatusLegend = memo(() => (
  <div style={{
    background: 'rgba(10,20,15,0.85)',
    borderRadius: 10,
    padding: 12,
    boxShadow: '0 4px 20px rgba(0,0,0,0.35)',
    border: '1px solid rgba(0,255,136,0.2)',
  }}>
    <h3 style={{ fontSize: 11, fontWeight: 700, color: '#fff', marginBottom: 8, paddingBottom: 6, borderBottom: '2px solid #00ff88', margin: 0, textTransform: 'uppercase', letterSpacing: 0.5 }}>Status</h3>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
      {statuses.map(s => (
        <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 16, height: 16, background: s.color, borderRadius: 3, boxShadow: `0 0 6px ${s.color}80`, flexShrink: 0 }} />
          <span style={{ fontSize: 9, fontWeight: 500, color: '#ccc', whiteSpace: 'nowrap' }}>{s.name}</span>
        </div>
      ))}
    </div>
  </div>
));

// Detail Modal
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
      {label && <label style={{ fontSize: 11, color: '#aaa', display: 'block', marginBottom: 4 }}>{label}</label>}
      <select className="form-el" value={value} onChange={onChange} style={{ width: '100%', padding: '8px 10px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(0,255,136,0.3)', borderRadius: 6, color: '#fff', fontSize: 11 }}>
        {children}
      </select>
    </div>
  );

  const TextArea = ({ label, value, onChange, h, mt }) => (
    <div style={{ marginTop: mt || 0 }}>
      {label && <label style={{ fontSize: 11, color: '#aaa', display: 'block', marginBottom: 4 }}>{label}</label>}
      <textarea className="form-el" value={value} onChange={onChange} style={{ width: '100%', height: h || 60, padding: '8px 10px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(0,255,136,0.3)', borderRadius: 6, color: '#fff', fontSize: 11, resize: 'none' }} />
    </div>
  );

  return (
    <div onClick={onClose} style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.85)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(8px)',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
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
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', borderBottom: '2px solid rgba(0,255,136,0.3)', background: 'rgba(0,255,136,0.05)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>Estatus:</span>
            <span style={{ fontSize: 16, fontWeight: 700, color: statusColor, textShadow: `0 0 12px ${statusColor}80` }}>{item.status}</span>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: '2px solid rgba(255,255,255,0.3)', color: '#fff', fontSize: 20, cursor: 'pointer', padding: '2px 10px', borderRadius: 6, lineHeight: 1 }}>×</button>
        </div>

        {/* Content */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Left Panel */}
          <div style={{ width: 260, borderRight: '1px solid rgba(0,255,136,0.2)', padding: 16, display: 'flex', flexDirection: 'column', gap: 12, overflowY: 'auto', flexShrink: 0 }}>
            <div style={{ width: '100%', height: 120, background: 'rgba(0,255,136,0.05)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid rgba(0,255,136,0.2)' }}>
              <span style={{ color: 'rgba(0,255,136,0.4)', fontSize: 11 }}>Image</span>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 26, fontWeight: 800, color: '#fff', textShadow: '0 0 16px rgba(0,255,136,0.4)' }}>{item.id}</div>
              <div style={{ fontSize: 13, color: '#00ff88', marginTop: 2 }}>{item.model || '-'}</div>
            </div>
            <div style={{ background: 'rgba(0,255,136,0.05)', borderRadius: 6, overflow: 'hidden', border: '1px solid rgba(0,255,136,0.2)' }}>
              <div style={{ background: 'rgba(0,255,136,0.15)', padding: '6px 10px', fontSize: 10, fontWeight: 700, color: '#00ff88', textTransform: 'uppercase', textAlign: 'center' }}>Información del Troquel</div>
              <div style={{ padding: '8px 10px' }}>
                {[['Golpes:', item.golpes], ['Golpes Acum:', item.golpesAcum], ['Capacidad Golpes:', item.capacidadGolpes], ['No. Rectificaciones:', item.rectificaciones]].map(([l, v], i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: i < 3 ? '1px solid rgba(0,255,136,0.1)' : 'none' }}>
                    <span style={{ fontSize: 10, color: '#aaa' }}>{l}</span>
                    <span style={{ fontSize: 10, color: '#fff', fontWeight: 600 }}>{v || '-'}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ background: 'rgba(0,255,136,0.05)', borderRadius: 6, overflow: 'hidden', border: '1px solid rgba(0,255,136,0.2)' }}>
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
                      <td style={{ padding: '4px 6px', textAlign: 'center', color: p.current ? '#00ff88' : '#fff', fontWeight: p.current ? 700 : 400, borderBottom: '1px solid rgba(0,255,136,0.1)' }}>{p.current ? `*** ${p.year} ***` : p.year}</td>
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
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ display: 'flex', borderBottom: '1px solid rgba(0,255,136,0.2)', flexShrink: 0 }}>
              {['acciones', 'historial'].map(tab => (
                <button key={tab} className="tab-btn" onClick={() => setActiveTab(tab)} style={{
                  flex: 1,
                  padding: '12px 16px',
                  background: activeTab === tab ? 'rgba(0,255,136,0.15)' : 'transparent',
                  border: 'none',
                  borderBottom: activeTab === tab ? '3px solid #00ff88' : '3px solid transparent',
                  color: activeTab === tab ? '#00ff88' : '#888',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  textTransform: 'capitalize',
                }}>{tab}</button>
              ))}
            </div>
            <div style={{ flex: 1, padding: 16, overflowY: 'auto' }}>
              {activeTab === 'acciones' ? (
                <div style={{ display: 'flex', gap: 20 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ background: 'rgba(0,155,74,0.3)', padding: '8px 14px', borderRadius: 6, marginBottom: 12, border: '1px solid rgba(0,255,136,0.3)' }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: '#fff' }}>Bajar Troquel por:</span>
                    </div>
                    {[{ id: 'limpieza', label: 'Limpieza General' }, { id: 'cambio', label: 'Cambio de Modelo', select: true }, { id: 'falla', label: 'Falla de Troquel', select: true }].map(opt => (
                      <label key={opt.id} style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '6px 10px', borderRadius: 6, cursor: 'pointer', background: action === opt.id ? 'rgba(0,255,136,0.08)' : 'transparent', marginBottom: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <input type="radio" name="act" checked={action === opt.id} onChange={() => setAction(opt.id)} style={{ accentColor: '#00ff88' }} />
                          <span style={{ fontSize: 12, color: '#fff' }}>{opt.label}</span>
                        </div>
                        {opt.select && (
                          <select 
                            className="form-el" 
                            value={opt.id === 'cambio' ? formData.modelo_nuevo : formData.falla_id}
                            onChange={(e) => setFormData({...formData, [opt.id === 'cambio' ? 'modelo_nuevo' : 'falla_id']: e.target.value})}
                            style={{ width: '100%', padding: '6px 10px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(0,255,136,0.3)', borderRadius: 6, color: '#fff', fontSize: 11, marginLeft: 20 }}
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
                  <div style={{ flex: 1 }}>
                    <div style={{ background: 'rgba(100,150,100,0.2)', padding: '8px 14px', borderRadius: 6, marginBottom: 12, border: '1px solid rgba(0,255,136,0.2)' }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: '#ccc' }}>Asistencia en Prensa:</span>
                    </div>
                    <SelectBox label="Motivo:" value={formData.motivo} onChange={(e) => setFormData({...formData, motivo: e.target.value})}>
                      <option value="">Seleccionar Motivo</option>
                      <option value="Mantenimiento">Mantenimiento</option>
                      <option value="Ajuste">Ajuste</option>
                      <option value="Otro">Otro</option>
                    </SelectBox>
                    <TextArea label="Comentarios (Supervisor / Operador):" value={formData.comentarios_supervisor} onChange={(e) => setFormData({...formData, comentarios_supervisor: e.target.value})} h={140} mt={12} />
                    <button onClick={handleSubmit} style={{ marginTop: 16, width: '100%', padding: '10px', background: '#00ff88', border: 'none', borderRadius: 6, color: '#000', fontSize: 12, fontWeight: 700, cursor: 'pointer', boxShadow: '0 0 15px rgba(0,255,136,0.4)' }}>
                      Guardar Acción
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ height: '100%' }}>
                  {loadingHistory ? (
                    <div className="loading" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#00ff88' }}>Cargando historial...</div>
                  ) : history.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {history.map((h, i) => (
                        <div key={i} style={{ background: 'rgba(0,255,136,0.05)', borderRadius: 6, padding: 12, border: '1px solid rgba(0,255,136,0.15)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                            <span style={{ color: '#00ff88', fontWeight: 600, fontSize: 12 }}>{h.action_type}</span>
                            <span style={{ color: '#888', fontSize: 10 }}>{new Date(h.created_at).toLocaleString()}</span>
                          </div>
                          {h.falla_description && <div style={{ color: '#fff', fontSize: 11 }}>Falla: {h.falla_description}</div>}
                          {h.comentarios && <div style={{ color: '#ccc', fontSize: 11, marginTop: 4 }}>{h.comentarios}</div>}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'rgba(0,255,136,0.4)', fontSize: 13, fontStyle: 'italic' }}>No hay historial disponible</div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 20px', borderTop: '1px solid rgba(0,255,136,0.2)', background: 'rgba(0,0,0,0.2)', flexShrink: 0 }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#00ff88', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 10px rgba(0,255,136,0.4)' }}>
            <span style={{ fontSize: 14 }}>👤</span>
          </div>
          <button className="close-btn" onClick={onClose} style={{ background: '#ff4466', border: 'none', color: '#fff', padding: '8px 20px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s', boxShadow: '0 0 12px rgba(255,68,102,0.4)' }}>Cerrar (Esc)</button>
        </div>
      </div>
    </div>
  );
});

// Main Component
const EKanban = () => {
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
      setTroquelesSum([{ label: 'UP', count: '-', goal: '-', perf: '-' }, { label: 'BACKUP', count: '-', goal: '-', perf: '-' }, { label: 'TOTAL', count: '-', goal: '-', perf: '-' }]);
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
>>>>>>> 7ab2742be43702efea67d09e14df2246a28ae5f6

  return (
    <div style={{
      height: '100vh',
      background: 'linear-gradient(135deg, #0a0f0d 0%, #0d1a14 50%, #081210 100%)',
<<<<<<< HEAD
      fontFamily: "'Segoe UI', 'Roboto', -apple-system, BlinkMacSystemFont, sans-serif",
=======
      fontFamily: "'Segoe UI', Roboto, -apple-system, BlinkMacSystemFont, sans-serif",
>>>>>>> 7ab2742be43702efea67d09e14df2246a28ae5f6
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      position: 'relative',
    }}>
<<<<<<< HEAD
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
=======
      {/* Grid overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'linear-gradient(rgba(0,255,136,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,136,0.02) 1px, transparent 1px)',
        backgroundSize: '50px 50px',
        pointerEvents: 'none',
      }} />

      {/* Header */}
>>>>>>> 7ab2742be43702efea67d09e14df2246a28ae5f6
      <header style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto 1fr',
        alignItems: 'center',
        padding: '12px 24px',
<<<<<<< HEAD
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
=======
        background: 'rgba(10,20,15,0.9)',
        borderBottom: '2px solid #00ff88',
        boxShadow: '0 4px 24px rgba(0,255,136,0.15)',
        flexShrink: 0,
        position: 'relative',
        zIndex: 10,
      }}>
        <div>
          <div style={{ width: 44, height: 44, background: 'rgba(0,255,136,0.1)', border: '2px solid rgba(0,255,136,0.4)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: '#00ff88', textTransform: 'uppercase', fontWeight: 600, boxShadow: '0 0 16px rgba(0,255,136,0.15)' }}>Logo</div>
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#fff', margin: 0, letterSpacing: 1, textAlign: 'center', textShadow: '0 0 24px rgba(0,255,136,0.5)' }}>
          <span style={{ color: '#00ff88' }}>E-Kanban</span> Tool Room
        </h1>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#00ff88', fontSize: 14 }}>🔍</span>
            <input
              type="text"
              className="search-input"
              style={{ padding: '10px 16px 10px 36px', fontSize: 13, border: '2px solid rgba(0,255,136,0.3)', borderRadius: 10, width: 240, outline: 'none', transition: 'all 0.2s', background: 'rgba(0,255,136,0.05)', fontWeight: 500, color: '#fff' }}
              placeholder="Search machines or dies..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
>>>>>>> 7ab2742be43702efea67d09e14df2246a28ae5f6
            />
          </div>
        </div>
      </header>

<<<<<<< HEAD
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
=======
      {/* Error Banner */}
      {error && (
        <div style={{ background: 'rgba(255,68,102,0.2)', color: '#ff4466', padding: '8px 24px', fontSize: 12, textAlign: 'center' }}>
          {error}
        </div>
      )}

      {/* Kanban Board */}
      <div className="kanban-scroll" style={{ padding: '20px 24px', overflowX: 'auto', flex: 1, position: 'relative', zIndex: 5 }}>
        {loading ? (
          <div className="loading" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#00ff88', fontSize: 16 }}>
            Loading data...
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 16, minWidth: 'fit-content' }}>
            {years.map(year => (
              <KanbanColumn key={year} year={year} items={troqueles[year] || []} onItemClick={handleItemClick} />
            ))}
          </div>
        )}
      </div>

      {/* Bottom Tables */}
      <div style={{ padding: '0 24px 16px', display: 'flex', gap: 12, flexShrink: 0, position: 'relative', zIndex: 5, alignItems: 'flex-start' }}>
        <TroquelesTable data={troquelesSum} />
        <PriorityRepairs data={priorityRepairs} />
        <StatusLegend />
      </div>

      {/* Modal */}
      {selectedItem && <DetailModal item={selectedItem} fallas={fallas} onClose={handleClose} onSaveAction={fetchData} />}
>>>>>>> 7ab2742be43702efea67d09e14df2246a28ae5f6
    </div>
  );
};

export default EKanban;