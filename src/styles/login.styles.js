// Login.styles.js - Estilos para el componente de Login

export const cssAnimations = `
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  @keyframes scanLine {
    0% { top: 0; opacity: 1; }
    50% { opacity: 0.5; }
    100% { top: 100vh; opacity: 1; }
  }
  @keyframes float {
    0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0; }
    10% { opacity: 1; }
    90% { opacity: 1; }
    100% { transform: translateY(-100vh) rotate(720deg); opacity: 0; }
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
  @keyframes glow {
    0%, 100% { box-shadow: 0 0 20px rgba(0, 255, 136, 0.3), 0 0 40px rgba(0, 255, 136, 0.1); }
    50% { box-shadow: 0 0 30px rgba(0, 255, 136, 0.5), 0 0 60px rgba(0, 255, 136, 0.2); }
  }
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  input::placeholder {
    color: rgba(255, 255, 255, 0.3);
  }
  input:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const createStyles = () => ({
  container: {
    minHeight: "100vh",
    background:
      "linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #0f0f23 100%)",
    color: "#e0e0e0",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
    position: "relative",
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  gridOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: `
      linear-gradient(rgba(0, 255, 136, 0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0, 255, 136, 0.03) 1px, transparent 1px)
    `,
    backgroundSize: "50px 50px",
    pointerEvents: "none",
    zIndex: 0,
  },

  scanLine: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    height: "2px",
    background:
      "linear-gradient(90deg, transparent, rgba(0, 255, 136, 0.4), transparent)",
    animation: "scanLine 4s linear infinite",
    pointerEvents: "none",
    zIndex: 1,
  },

  particlesContainer: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: "hidden",
    pointerEvents: "none",
    zIndex: 1,
  },

  particle: {
    position: "absolute",
    bottom: "-20px",
    width: "4px",
    height: "4px",
    background: "#00ff88",
    borderRadius: "50%",
    animation: "float 6s ease-in-out infinite",
    boxShadow: "0 0 10px #00ff88, 0 0 20px rgba(0, 255, 136, 0.5)",
  },

  loginWrapper: {
    position: "relative",
    zIndex: 10,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "10px",
  },

  backButton: {
    position: "absolute",
    top: "-30px",
    left: "50%",
    transform: "translateX(-50%)",
    background: "transparent",
    border: "1px solid rgba(0, 255, 136, 0.3)",
    borderRadius: "8px",
    padding: "10px 20px",
    color: "#00ff88",
    fontSize: "13px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontWeight: 500,
    whiteSpace: "nowrap",
  },

  loginCard: {
    background: "rgba(15, 15, 25, 0.95)",
    borderRadius: "20px",
    border: "1px solid rgba(0, 255, 136, 0.2)",
    padding: "30px",
    width: "100%",
    maxWidth: "420px",
    boxShadow:
      "0 20px 60px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255,255,255,0.05)",
    backdropFilter: "blur(20px)",
    animation: "slideIn 0.5s ease-out, glow 3s ease-in-out infinite",
  },

  logoRectangle: {
    width: "200px",
    height: "100px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 10px auto",
    overflow: "hidden",
  },

  logoImg: {
    maxWidth: "100%",
    maxHeight: "100%",
    objectFit: "cover",
  },

  logoTextSection: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginBottom: "32px",
  },

  logoTitle: {
    fontSize: "28px",
    fontWeight: 700,
    color: "#00ff88",
    textShadow: "0 0 20px rgba(0, 255, 136, 0.5)",
    letterSpacing: "3px",
  },

  logoSubtitle: {
    fontSize: "10px",
    color: "#888",
    letterSpacing: "2px",
    textTransform: "uppercase",
    marginTop: "6px",
  },

  titleSection: {
    textAlign: "center",
    marginBottom: "28px",
  },

  title: {
    fontSize: "22px",
    fontWeight: 600,
    color: "#fff",
    marginBottom: "8px",
    margin: 0,
  },

  title2: {
    fontSize: "30px",
    fontWeight: 800,
    color: "#fff",
    marginBottom: "8px",
    margin: 0,
  },

  subtitle: {
    fontSize: "13px",
    color: "#888",
    margin: 0,
  },

  errorMessage: {
    background: "rgba(255, 107, 107, 0.1)",
    border: "1px solid rgba(255, 107, 107, 0.3)",
    borderRadius: "10px",
    padding: "12px 16px",
    marginBottom: "20px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    color: "#ff6b6b",
    fontSize: "13px",
    animation: "slideIn 0.3s ease",
  },

  errorIcon: {
    fontSize: "16px",
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },

  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },

  label: {
    fontSize: "12px",
    fontWeight: 600,
    color: "#aaa",
    letterSpacing: "0.5px",
    textTransform: "uppercase",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },

  input: {
    background: "rgba(0, 0, 0, 0.5)",
    border: "2px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "10px",
    padding: "14px 16px",
    fontSize: "15px",
    color: "#fff",
    transition: "all 0.3s ease",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
  },

  inputFocus: {
    borderColor: "#00ff88",
    boxShadow:
      "0 0 0 4px rgba(0, 255, 136, 0.1), 0 0 30px rgba(0, 255, 136, 0.15)",
  },

  passwordWrapper: {
    position: "relative",
  },

  togglePassword: {
    position: "absolute",
    right: "14px",
    top: "50%",
    transform: "translateY(-50%)",
    background: "transparent",
    border: "none",
    cursor: "pointer",
    fontSize: "18px",
    padding: "4px",
    opacity: 0.7,
    transition: "opacity 0.2s",
  },

  submitButton: {
    background: "linear-gradient(135deg, #00ff88 0%, #00cc6a 100%)",
    border: "none",
    borderRadius: "12px",
    padding: "16px 32px",
    fontSize: "15px",
    fontWeight: 600,
    color: "#0a0a0a",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 20px rgba(0, 255, 136, 0.3)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    marginTop: "8px",
  },

  loadingSpinner: {
    display: "inline-block",
    width: "18px",
    height: "18px",
    border: "2px solid rgba(10, 10, 10, 0.3)",
    borderTopColor: "#0a0a0a",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },

  demoHint: {
    marginTop: "24px",
    padding: "12px 16px",
    background: "rgba(0, 255, 136, 0.05)",
    border: "1px dashed rgba(0, 255, 136, 0.2)",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    fontSize: "12px",
    color: "#888",
  },

  footer: {
    marginTop: "24px",
    display: "flex",
    justifyContent: "center",
  },

  securityBadge: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "11px",
    color: "#00ff88",
    opacity: 0.7,
  },

  versionInfo: {
    marginTop: "24px",
    fontSize: "11px",
    color: "#555",
    letterSpacing: "1px",
  },
});

export default createStyles;
