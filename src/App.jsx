import React, { useState, useCallback } from 'react';  
import EKanban from './components/EKanban';  
import Login from './components/Login';  
import AdminDieRegistration from './components/adminDieRegistration';  


//estados de navegacion  
const PAGES = {  
  DASHBOARD: 'dashboard',  
  LOGIN: 'login',  
  ADMIN: 'admin',  
};  

const App = () => {  
  const [currentPage, setCurrentPage] = useState(PAGES.DASHBOARD);  

  //inicializador lento, obtiene la sesion desde el localstorage cada que se carga o recarga
  const [user, setUser] = useState(() => {  
    try {  
      const saved = localStorage.getItem('user');  
      return saved ? JSON.parse(saved) : null;  
    } catch {  
      localStorage.removeItem('user');  
      return null;  
    }  
  });  

  //navegar al login cuando se hace clic en logo 
  const handleLogoClick = useCallback(() => {  
    setCurrentPage(user ? PAGES.ADMIN : PAGES.LOGIN);  
  }, [user]);  

  //manejo de login exitoso 
  const handleLoginSuccess = useCallback((userData) => {  
    localStorage.setItem('user', JSON.stringify(userData));  
    setUser(userData);  
    setCurrentPage(PAGES.ADMIN);  
  }, []);  

  //cerrar sesion 
  const handleLogout = useCallback(() => {  
    localStorage.removeItem('user');  
    setUser(null);  
    setCurrentPage(PAGES.DASHBOARD);  
  }, []);  

  //navegar al dashboard desde login o admin 
  const handleNavigateBack = useCallback(() => {  
    setCurrentPage(PAGES.DASHBOARD);  
  }, []);  

  //cargar paginas actuales  
  const renderPage = () => {  
    switch (currentPage) {  
      case PAGES.LOGIN:  
        return (  
          <Login  
            onLoginSuccess={handleLoginSuccess}  
            onNavigateBack={handleNavigateBack}  
          />  
        );  

      case PAGES.ADMIN:  

        return (  
          <AdminDieRegistration  
            onNavigateBack={handleNavigateBack}  
            user={user}  
            onLogout={handleLogout}  
          />  
        );  

      case PAGES.DASHBOARD:  
      default:  
        return (  
          <EKanban  
            onLogoClick={handleLogoClick}  
            user={user}  
            onLogout={handleLogout}  
          />  
        );  
    }  
  };  

  return <>{renderPage()}</>;  
};  

export default App; 