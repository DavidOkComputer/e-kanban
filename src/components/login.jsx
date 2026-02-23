import React, { useState, useMemo, useCallback } from 'react';
import createStyles, { cssAnimations } from '../styles/Login.styles';
import NidecLogo from '../assets/Nidec_Institutional_Logo_White_Version.png';

<link rel="icon" href="public/favicon.ico" type="image/x-icon"></link>

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
      <div style={styles.gridOverlay} />
      <div style={styles.scanLine} />

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

      <div style={styles.loginWrapper}>
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

        {/*tarjeta de login*/}
        <div style={styles.loginCard}>

          {/*logo dentro de la tarjeta*/}
          <div style={styles.logoRectangle}>
            <img
              src={NidecLogo}
              alt="Nidec ACIM"
              style={styles.logoImg}
            />
          </div>

          {/*seccion de texto E-KANBAN*/}
          <div style={styles.logoTextSection}>
            <span style={styles.logoTitle}>E-KANBAN</span>
            <span style={styles.logoSubtitle}>Administracion Tool Room</span>
          </div>

          {/*titulo*/}
          <div style={styles.titleSection}>
            <h1 style={styles.title}>Acceso Administrativo</h1>
            <p style={styles.subtitle}>Ingrese sus credenciales para continuar</p>
          </div>

          {error && (
            <div style={styles.errorMessage}>
              <span style={styles.errorIcon}>⚠</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Usuario</label>
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
              <label style={styles.label}>Contraseña</label>
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

        </div>

      </div>

      <style>{cssAnimations}</style>
    </div>
  );
};

export default Login;