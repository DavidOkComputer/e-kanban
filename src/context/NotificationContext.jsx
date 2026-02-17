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

  const notify = { 
    success: (message, duration) => addNotification(message, 'success', duration), 
    error: (message, duration) => addNotification(message, 'error', duration), 
    warning: (message, duration) => addNotification(message, 'warning', duration), 
    info: (message, duration) => addNotification(message, 'info', duration), 
  }; 

  return ( 
    <NotificationContext.Provider value={notify}> 
      {children} 
      <NotificationContainer  
        notifications={notifications}  
        onClose={removeNotification}  
      /> 
    </NotificationContext.Provider> 
  ); 
}; 

const NotificationContainer = ({ notifications, onClose }) => { 
  if (notifications.length === 0) return null; 

  return ( 
    <div style={{ 
      position: 'fixed', 
      top: 20, 
      right: 20, 
      zIndex: 10000, 
      display: 'flex', 
      flexDirection: 'column', 
      gap: 12, 
      maxWidth: '400px', 
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
      border: '2px solid #00ff88', 
      color: '#000', 
      icon: '✓', 
      shadow: '0 0 30px rgba(0,255,136,0.6)', 
    }, 

    error: { 
      background: 'linear-gradient(135deg, rgba(255,68,102,0.95), rgba(220,50,80,0.95))', 
      border: '2px solid #ff4466', 
      color: '#fff', 
      icon: '✕', 
      shadow: '0 0 30px rgba(255,68,102,0.6)', 
    },
    
    warning: { 
      background: 'linear-gradient(135deg, rgba(255,170,0,0.95), rgba(230,150,0,0.95))', 
      border: '2px solid #ffaa00', 
      color: '#000', 
      icon: '⚠', 
      shadow: '0 0 30px rgba(255,170,0,0.6)', 
    }, 

    info: { 
      background: 'linear-gradient(135deg, rgba(0,200,255,0.95), rgba(0,170,230,0.95))', 
      border: '2px solid #00c8ff', 
      color: '#000', 
      icon: 'ℹ', 
      shadow: '0 0 30px rgba(0,200,255,0.6)', 
    }, 
  }; 

  const style = typeStyles[type] || typeStyles.info; 

  return ( 
    <div 
      style={{ 
        background: style.background, 
        border: style.border, 
        borderRadius: 12, 
        padding: '16px 20px', 
        boxShadow: style.shadow, 
        display: 'flex', 
        alignItems: 'center', 
        gap: 12, 
        minWidth: 300, 
        animation: 'slideInRight 0.3s ease-out', 
        backdropFilter: 'blur(10px)', 
        pointerEvents: 'auto', 
      }} 
    > 

      <div style={{ 
        fontSize: 24, 
        fontWeight: 'bold', 
        color: style.color, 
        flexShrink: 0, 
      }}> 
        {style.icon} 
      </div> 

      <div style={{ 
        flex: 1, 
        color: style.color, 
        fontSize: 13, 
        fontWeight: 600, 
        lineHeight: 1.4, 
      }}> 
        {message} 
      </div> 
      <button 
        onClick={onClose} 
        style={{ 
          background: 'rgba(0,0,0,0.2)', 
          border: `1px solid ${style.color}40`, 
          borderRadius: 6, 
          color: style.color, 
          fontSize: 18, 
          fontWeight: 'bold', 
          width: 28, 
          height: 28, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          cursor: 'pointer', 
          flexShrink: 0, 
          transition: 'all 0.2s', 
        }} 

        onMouseEnter={(e) => { 
          e.target.style.background = 'rgba(0,0,0,0.4)'; 
          e.target.style.transform = 'scale(1.1)'; 
        }} 
        onMouseLeave={(e) => { 
          e.target.style.background = 'rgba(0,0,0,0.2)'; 
          e.target.style.transform = 'scale(1)'; 
        }} 
      > 
        × 
      </button> 
    </div> 
  ); 
}; 
export default NotificationProvider; 