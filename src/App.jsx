import React, { useState, useCallback } from 'react';
import EKanban from './Ekanban';
import AdminDieRegistration from './adminDieRegistration';
 
const App = () => {
  const [currentView, setCurrentView] = useState('dashboard');
 
  const navigateToAdmin = useCallback(() => {
    setCurrentView('admin');
  }, []);
 
  const navigateToDashboard = useCallback(() => {
    setCurrentView('dashboard');
  }, []);
 
  if (currentView === 'admin') {
    return <AdminDieRegistration onNavigateBack={navigateToDashboard} />;
  }
 
  return <AdminDieRegistration />;
};

export default App;