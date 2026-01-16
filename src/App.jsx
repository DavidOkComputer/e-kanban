import React, { useState, useCallback } from 'react';
<<<<<<< HEAD
import EKanban from './EKanban';
import AdminDieRegistration from './adminDieRegistration';
=======
import EKanban from './components/EKanban';
import AdminDieRegistration from './components/adminDieRegistration';
>>>>>>> af3aa612c5383fedb7a10f702367a72f295ef5fa
 
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
 
  return <EKanban/>;
};

export default App;