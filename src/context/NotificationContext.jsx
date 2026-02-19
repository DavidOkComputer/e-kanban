import React, { createContext, useContext, useState, useCallback } from 'react'; 

const NotificationContext = createContext(); 

export const useNotification = () => { 
  const context = useContext(NotificationContext); 

  if (!context) { 
    throw new Error('useNotification must be used within NotificationProvider'); 
  } 
  return context; 
}; 

export const NotificationProvider = ({ children }) => { 
  const [notifications, setNotifications] = useState([]); 
  const [confirmDialog, setConfirmDialog] = useState(null); 

  const addNotification = useCallback((message, type = 'info', duration = 4000) => { 
    const id = Date.now() + Math.random(); 
    const notification = { id, message, type, duration }; 
    setNotifications(prev => [...prev, notification]); 

    if (duration > 0) { 
      setTimeout(() => { 
        removeNotification(id); 
      }, duration); 
    } 
  }, []); 

  const removeNotification = useCallback((id) => { 
    setNotifications(prev => prev.filter(n => n.id !== id)); 
  }, []); 

  //devuelve una promise que es verdadero o falso
  const confirm = useCallback((options = {}) => { 
    return new Promise((resolve) => { 

      setConfirmDialog({ 
        title: options.title || '¿Confirmar acción?', 
        message: options.message || '¿Estás seguro de continuar?', 
        confirmLabel: options.confirmLabel || 'Confirmar', 
        cancelLabel: options.cancelLabel || 'Cancelar', 
        type: options.type || 'warning', 
        resolve, 
      }); 
    }); 
  }, []); 

  const closeConfirm = useCallback((result) => { 

    if (confirmDialog) { 
      confirmDialog.resolve(result); 
      setConfirmDialog(null); 
    } 
  }, [confirmDialog]); 

  const notify = { 
    success: (message, duration) => addNotification(message, 'success', duration), 
    error:   (message, duration) => addNotification(message, 'error',   duration), 
    warning: (message, duration) => addNotification(message, 'warning', duration), 
    info:    (message, duration) => addNotification(message, 'info',    duration), 
    confirm, 
  }; 

  return ( 
    <NotificationContext.Provider value={notify}> 
      {children} 
      <NotificationContainer notifications={notifications} onClose={removeNotification} /> 

      {confirmDialog && ( 
        <ConfirmDialog 
          {...confirmDialog} 
          onConfirm={() => closeConfirm(true)} 
          onCancel={() => closeConfirm(false)} 
        /> 
      )} 
    </NotificationContext.Provider> 
  ); 
}; 

//dialogo de confirmacion
const ConfirmDialog = ({ title, message, confirmLabel, cancelLabel, type, onConfirm, onCancel }) => { 

  const typeConfig = { 
    warning: { 
      accent:     '#ffaa00', 
      iconBg:     'rgba(255,170,0,0.15)', 
      icon:       '⚠', 
      btnBg:      'linear-gradient(135deg, #ffaa00, #ff8800)', 
      btnColor:   '#000', 
      glow:       '0 0 40px rgba(255,170,0,0.25)', 
    }, 

    danger: { 
      accent:     '#ff4466', 
      iconBg:     'rgba(255,68,102,0.15)', 
      icon:       '⚠', 
      btnBg:      'linear-gradient(135deg, #ff4466, #cc2244)', 
      btnColor:   '#fff', 
      glow:       '0 0 40px rgba(255,68,102,0.25)', 
    }, 

    info: { 
      accent:     '#00c8ff', 
      iconBg:     'rgba(0,200,255,0.15)', 
      icon:       'ℹ', 
      btnBg:      'linear-gradient(135deg, #00c8ff, #0099cc)', 
      btnColor:   '#000', 
      glow:       '0 0 40px rgba(0,200,255,0.25)', 
    }, 
  }; 

  const cfg = typeConfig[type] || typeConfig.warning; 

  return ( 
    <div 
      onClick={onCancel} 

      style={{ 
        position:       'fixed', 
        inset:          0, 
        background:     'rgba(0,0,0,0.75)', 
        backdropFilter: 'blur(6px)', 
        display:        'flex', 
        alignItems:     'center', 
        justifyContent: 'center', 
        zIndex:         20000, 
        animation:      'fadeIn 0.15s ease-out', 
      }} 
    > 

      <div 
        onClick={e => e.stopPropagation()} 

        style={{ 
          background:   'linear-gradient(145deg, rgba(15,25,20,0.99), rgba(10,15,13,0.99))', 
          border:       `1px solid ${cfg.accent}55`, 
          borderRadius: 16, 
          boxShadow:    `${cfg.glow}, 0 24px 48px rgba(0,0,0,0.6)`, 
          padding:      '32px 28px', 
          width:        360, 
          maxWidth:     '90vw', 
          animation:    'scaleIn 0.2s ease-out', 
        }} 
      > 

        {/* Icono */} 
        <div style={{ 
          width:          52, 
          height:         52, 
          borderRadius:   '50%', 
          background:     cfg.iconBg, 
          border:         `2px solid ${cfg.accent}66`, 
          display:        'flex', 
          alignItems:     'center', 
          justifyContent: 'center', 
          fontSize:       24, 
          margin:         '0 auto 20px', 
          boxShadow:      `0 0 20px ${cfg.accent}33`, 
        }}> 
          {cfg.icon} 
        </div> 

        {/* Titulo */} 
        <div style={{ 
          color:       cfg.accent, 
          fontSize:    15, 
          fontWeight:  700, 
          textAlign:   'center', 
          marginBottom: 10, 
          textTransform: 'uppercase', 
          letterSpacing: 1, 
          textShadow:  `0 0 12px ${cfg.accent}88`, 
        }}> 
          {title} 
        </div> 

        {/* Mensaje */} 
        <div style={{ 
          color:        'rgba(255,255,255,0.75)', 
          fontSize:     13, 
          textAlign:    'center', 
          lineHeight:   1.6, 
          marginBottom: 28, 
        }}> 
          {message} 
        </div> 

        {/*nota*/} 
        <div style={{ 
          background:   'rgba(255,255,255,0.04)', 
          border:       '1px solid rgba(255,255,255,0.08)', 
          borderRadius: 8, 
          padding:      '10px 14px', 
          marginBottom: 24, 
          display:      'flex', 
          alignItems:   'center', 
          gap:          8, 
        }}> 
          <span style={{ color: '#ff4466', fontSize: 12 }}>⚠</span> 
          <span style={{ color: '#888', fontSize: 11 }}> 
            Esta acción no puede deshacerse una vez confirmada. 
          </span> 
        </div> 

        {/*botones*/} 
        <div style={{ display: 'flex', gap: 10 }}> 
          <button 
            onClick={onCancel} 

            style={{ 
              flex:         1, 
              padding:      '11px', 
              background:   'rgba(255,255,255,0.06)', 
              border:       '1px solid rgba(255,255,255,0.15)', 
              borderRadius: 8, 
              color:        '#aaa', 
              fontSize:     12, 
              fontWeight:   600, 
              cursor:       'pointer', 
              textTransform: 'uppercase', 
              transition:   'all 0.2s', 
            }} 

            onMouseEnter={e => { 
              e.target.style.background = 'rgba(255,255,255,0.12)'; 
              e.target.style.color = '#fff'; 
            }} 

            onMouseLeave={e => { 
              e.target.style.background = 'rgba(255,255,255,0.06)'; 
              e.target.style.color = '#aaa'; 
            }} 
          > 
            {cancelLabel} 
          </button> 

          <button 
            onClick={onConfirm} 

            style={{ 
              flex:         1, 
              padding:      '11px', 
              background:   cfg.btnBg, 
              border:       'none', 
              borderRadius: 8, 
              color:        cfg.btnColor, 
              fontSize:     12, 
              fontWeight:   700, 
              cursor:       'pointer', 
              textTransform: 'uppercase', 
              boxShadow:    `0 0 16px ${cfg.accent}55`, 
              transition:   'all 0.2s', 
            }} 

            onMouseEnter={e => { e.target.style.opacity = '0.88'; e.target.style.transform = 'scale(1.02)'; }} 
            onMouseLeave={e => { e.target.style.opacity = '1';    e.target.style.transform = 'scale(1)'; }} 
          > 
            {confirmLabel} 
          </button> 
        </div> 
      </div> 

      <style>{` 
        @keyframes fadeIn  { from { opacity: 0 } to { opacity: 1 } } 
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.92) } to { opacity: 1; transform: scale(1) } } 
      `}</style> 
    </div> 
  ); 
}; 

//notificacion de tostada
const NotificationContainer = ({ notifications, onClose }) => { 

  if (notifications.length === 0) return null; 

  return ( 

    <div style={{ 
      position:      'fixed', 
      top:           20, 
      right:         20, 
      zIndex:        10000, 
      display:       'flex', 
      flexDirection: 'column', 
      gap:           12, 
      maxWidth:      '400px', 
      pointerEvents: 'none', 
    }}> 

      {notifications.map(notification => ( 
        <Notification 
          key={notification.id} 
          {...notification} 
          onClose={() => onClose(notification.id)} 
        /> 
      ))} 
    </div> 
  ); 
}; 

const Notification = ({ message, type, onClose }) => { 

  const typeStyles = { 
    success: { 
      background: 'linear-gradient(135deg, rgba(0,255,136,0.95), rgba(0,200,100,0.95))', 
      border:     '2px solid #00ff88', 
      color:      '#000', 
      icon:       '✓', 
      shadow:     '0 0 30px rgba(0,255,136,0.6)', 
    }, 

    error: { 
      background: 'linear-gradient(135deg, rgba(255,68,102,0.95), rgba(220,50,80,0.95))', 
      border:     '2px solid #ff4466', 
      color:      '#fff', 
      icon:       '✕', 
      shadow:     '0 0 30px rgba(255,68,102,0.6)', 
    }, 

    warning: { 
      background: 'linear-gradient(135deg, rgba(255,170,0,0.95), rgba(230,150,0,0.95))', 
      border:     '2px solid #ffaa00', 
      color:      '#000', 
      icon:       '⚠', 
      shadow:     '0 0 30px rgba(255,170,0,0.6)', 
    }, 

    info: { 
      background: 'linear-gradient(135deg, rgba(0,200,255,0.95), rgba(0,170,230,0.95))', 
      border:     '2px solid #00c8ff', 
      color:      '#000', 
      icon:       'ℹ', 
      shadow:     '0 0 30px rgba(0,200,255,0.6)', 
    }, 
  }; 

  const style = typeStyles[type] || typeStyles.info; 

  return ( 

    <div style={{ 
      background:     style.background, 
      border:         style.border, 
      borderRadius:   12, 
      padding:        '16px 20px', 
      boxShadow:      style.shadow, 
      display:        'flex', 
      alignItems:     'center', 
      gap:            12, 
      minWidth:       300, 
      animation:      'slideInRight 0.3s ease-out', 
      backdropFilter: 'blur(10px)', 
      pointerEvents:  'auto', 
    }}> 

      <div style={{ fontSize: 24, fontWeight: 'bold', color: style.color, flexShrink: 0 }}> 
        {style.icon} 
      </div> 

      <div style={{ flex: 1, color: style.color, fontSize: 13, fontWeight: 600, lineHeight: 1.4 }}> 
        {message} 
      </div> 

      <button 
        onClick={onClose} 
        style={{ 
          background:   'rgba(0,0,0,0.2)', 
          border:       `1px solid ${style.color}40`, 
          borderRadius: 6, 
          color:        style.color, 
          fontSize:     18, 
          fontWeight:   'bold', 
          width:        28, 
          height:       28, 
          display:      'flex', 
          alignItems:   'center', 
          justifyContent: 'center', 
          cursor:       'pointer', 
          flexShrink:   0, 
          transition:   'all 0.2s', 
        }} 

        onMouseEnter={e => { e.target.style.background = 'rgba(0,0,0,0.4)'; e.target.style.transform = 'scale(1.1)'; }} 
        onMouseLeave={e => { e.target.style.background = 'rgba(0,0,0,0.2)'; e.target.style.transform = 'scale(1)'; }} 
      > 
        × 
      </button> 
    </div> 
  ); 
}; 

export default NotificationProvider; 