import React, { useState, useCallback } from 'react';
import EKanban from './components/EKanban';
import Login from './components/login';
import AdminDieRegistration from './components/adminDieRegistration';

// Navigation states
const PAGES = {
  DASHBOARD: 'dashboard',
  LOGIN: 'login',
  ADMIN: 'admin',
};

const App = () => {
  const [currentPage, setCurrentPage] = useState(PAGES.DASHBOARD);
  const [user, setUser] = useState(null);

  // Navigate to login when logo is clicked on EKanban
  const handleLogoClick = useCallback(() => {
    // If already logged in, go directly to admin
    if (user) {
      setCurrentPage(PAGES.ADMIN);
    } else {
      setCurrentPage(PAGES.LOGIN);
    }
  }, [user]);

  // Handle successful login
  const handleLoginSuccess = useCallback((userData) => {
    setUser(userData);
    setCurrentPage(PAGES.ADMIN);
  }, []);

  // Navigate back to dashboard from login
  const handleBackFromLogin = useCallback(() => {
    setCurrentPage(PAGES.DASHBOARD);
  }, []);

  // Navigate back to dashboard from admin (and optionally logout)
  const handleBackFromAdmin = useCallback(() => {
    // Optional: uncomment to logout when going back
    // setUser(null);
    setCurrentPage(PAGES.DASHBOARD);
  }, []);

  // Render current page
  const renderPage = () => {
    switch (currentPage) {
      case PAGES.LOGIN:
        return (
          <Login
            onLoginSuccess={handleLoginSuccess}
            onNavigateBack={handleBackFromLogin}
          />
        );
      
      case PAGES.ADMIN:
        return (
          <AdminDieRegistration
            onNavigateBack={handleBackFromAdmin}
            user={user}
          />
        );
      
      case PAGES.DASHBOARD:
      default:
        return (
          <EKanban
            onLogoClick={handleLogoClick}
          />
        );
    }
  };

  return (
    <div className="app">
      {renderPage()}
    </div>
  );
};

export default App;