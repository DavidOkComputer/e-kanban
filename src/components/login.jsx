import React, { useState, useMemo, useCallback } from 'react';
import createStyles, { cssAnimations } from '../styles/Login.styles';

const Login = ({ onLoginSuccess, onNavigateBack }) => {
  const styles = useMemo(() => createStyles(), []);
  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [focusedField, setFocusedField] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    if (!formData.username.trim() || !formData.password.trim()) {
        setError('Por favor ingrese usuario y contraseña');
        return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
        const response = await fetch('http://localhost/ekanban-toolroom/src/api/login.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
                username: formData.username,
                password: formData.password
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            //almacenar info del usuario en localstorage o manejo de estados
            localStorage.setItem('user', JSON.stringify(data.user));
            
            onLoginSuccess && onLoginSuccess(data.user);
        } else {
            setError(data.message || 'Usuario o contraseña incorrectos');
            setIsLoading(false);
        }
    } catch (error) {
        console.error('Login error:', error);
        setError('Error de conexión. Intente nuevamente');
        setIsLoading(false);
    }
  }, [formData, onLoginSuccess]);

  const getInputStyle = useCallback((fieldName) => ({
    ...styles.input,
    ...(focusedField === fieldName ? styles.inputFocus : {}),
  }), [focusedField, styles]);

  return (
    <div style={styles.container}>
      {/* Grid Overlay */}
      <div style={styles.gridOverlay} />
      <div style={styles.scanLine} />

      {/*efecto de particulas flotantes*/}
      <div style={styles.particlesContainer}>
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            style={{
              ...styles.particle,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      {/*contenido principal*/}
      <div style={styles.loginWrapper}>
        {/*boton de regreso*/}
        {onNavigateBack && (
          <button
            style={styles.backButton}
            onClick={onNavigateBack}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(0, 255, 136, 0.1)';
              e.target.style.borderColor = '#00ff88';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'transparent';
              e.target.style.borderColor = 'rgba(0, 255, 136, 0.3)';
            }}
          >
            ← Volver al Dashboard
          </button>
        )}

        {/*login*/}
        <div style={styles.loginCard}>
          {/*seccion de logo*/}
          <div style={styles.logoSection}>
            <div style={styles.logoIcon}>
              <span style={styles.logoSymbol}>⚙</span>
            </div>
            <div style={styles.logoText}>
              <span style={styles.logoTitle}>E-KANBAN</span>
              <span style={styles.logoSubtitle}>Administracion Tool Room</span>
            </div>
          </div>

          {/*titulo*/}
          <div style={styles.titleSection}>
            <h1 style={styles.title}>Acceso Administrativo</h1>
            <p style={styles.subtitle}>Ingrese sus credenciales para continuar</p>
          </div>

          {/*mensaje de error*/}
          {error && (
            <div style={styles.errorMessage}>
              <span style={styles.errorIcon}>⚠</span>
              {error}
            </div>
          )}

          {/*form de login*/}
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>
                <span style={styles.labelIcon}></span>
                Usuario
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                onFocus={() => setFocusedField('username')}
                onBlur={() => setFocusedField(null)}
                style={getInputStyle('username')}
                placeholder="Ingrese su usuario"
                autoComplete="username"
                disabled={isLoading}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>
                Contraseña
              </label>
              <div style={styles.passwordWrapper}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  style={getInputStyle('password')}
                  placeholder="Ingrese su contraseña"
                  autoComplete="current-password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  style={styles.togglePassword}
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? '' : ''}
                </button>
              </div>
            </div>

            <button
              type="submit"
              style={{
                ...styles.submitButton,
                opacity: isLoading ? 0.7 : 1,
                cursor: isLoading ? 'not-allowed' : 'pointer',
              }}
              disabled={isLoading}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 8px 30px rgba(0, 255, 136, 0.5)';
                }
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 20px rgba(0, 255, 136, 0.3)';
              }}
            >
              {isLoading ? (
                <>
                  <span style={styles.loadingSpinner} />
                  Verificando...
                </>
              ) : (
                <>
                  Iniciar Sesión
                </>
              )}
            </button>
          </form>

          {/*credenciales de prueba*/}
          <div style={styles.demoHint}>
            <span>Demo: admin / admin123</span>
          </div>

          {/* Footer */}
          <div style={styles.footer}>
            <div style={styles.securityBadge}>
              Conexión Segura
            </div>
          </div>
        </div>

        {/* Version info */}
        <div style={styles.versionInfo}>
          E-Kanban Tool Room v1.0
        </div>
      </div>

      {/*animacion css*/}
      <style>{cssAnimations}</style>
    </div>
  );
};

export default Login;