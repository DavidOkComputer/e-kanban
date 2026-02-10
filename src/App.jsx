import React, { useState, useCallback, useEffect, useRef } from 'react'; 
import EKanban from './components/EKanban'; 
import Login from './components/Login'; 
import AdminDieRegistration from './components/adminDieRegistration'; 

//estados de navegacion 
const PAGES = { 
  DASHBOARD: 'dashboard', 
  LOGIN: 'login', 
  ADMIN: 'admin', 
}; 

function NewApp() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [user, setUser] = useState(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  //revisar si existe una sesion
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('user');
      }
    }
    setIsCheckingSession(false);
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setCurrentView('admin');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    setCurrentView('dashboard');
  };

  const handleLogoClick = () => {
    setCurrentView('login');
  };

  const handleNavigateBack = () => {
    setCurrentView('dashboard');
  };

  // Show loading while checking session
  if (isCheckingSession) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #0a0f0d 0%, #0d1a14 50%, #081210 100%)',
        color: '#00ff88',
        fontSize: '16px',
      }}>
        Cargando...
      </div>
    );
  }

  return (
    <>
      {currentView === 'dashboard' && (
        <EKanban 
          onLogoClick={handleLogoClick} 
          user={user}
          onLogout={handleLogout}
        />
      )}
      {currentView === 'login' && (
        <Login 
          onLoginSuccess={handleLoginSuccess} 
          onNavigateBack={handleNavigateBack}
        />
      )}
      {currentView === 'admin' && (
        <AdminDieRegistration 
          onNavigateBack={handleNavigateBack} 
          user={user}
          onLogout={handleLogout}
        />
      )}
    </>
  );
}

//duracion de  transicion
const TRANSITION_DURATION = 800; 

//estilos de transicion 
const transitionStyles = ` 
  /* ===== GLITCH EFFECT KEYFRAMES ===== */ 
  @keyframes glitchText { 
    0% { transform: translate(0); } 
    20% { transform: translate(-3px, 3px); } 
    40% { transform: translate(-3px, -3px); } 
    60% { transform: translate(3px, 3px); } 
    80% { transform: translate(3px, -3px); } 
    100% { transform: translate(0); } 
  } 

  @keyframes glitchSkew { 
    0% { transform: skew(0deg); } 
    20% { transform: skew(2deg); } 
    40% { transform: skew(-2deg); } 
    60% { transform: skew(1deg); } 
    80% { transform: skew(-1deg); } 
    100% { transform: skew(0deg); } 
  } 

  @keyframes rgbSplit { 
    0%, 100% {  
      text-shadow: -2px 0 #ff0000, 2px 0 #00ffff; 
      filter: none; 
    } 

    25% {  
      text-shadow: 2px 0 #ff0000, -2px 0 #00ffff; 
      filter: hue-rotate(10deg); 
    } 

    50% {  
      text-shadow: -1px 2px #ff0000, 1px -2px #00ffff; 
      filter: hue-rotate(-10deg); 
    } 

    75% {  
      text-shadow: 1px -1px #ff0000, -1px 1px #00ffff; 
      filter: hue-rotate(5deg); 
    } 
  } 

  @keyframes scanlineMove { 
    0% { transform: translateY(-100vh); } 
    100% { transform: translateY(100vh); } 
  } 

  @keyframes horizontalGlitch { 
    0% { clip-path: inset(0 0 100% 0); } 
    10% { clip-path: inset(40% 0 30% 0); } 
    20% { clip-path: inset(10% 0 60% 0); } 
    30% { clip-path: inset(70% 0 10% 0); } 
    40% { clip-path: inset(20% 0 50% 0); } 
    50% { clip-path: inset(50% 0 20% 0); } 
    60% { clip-path: inset(30% 0 40% 0); } 
    70% { clip-path: inset(60% 0 20% 0); } 
    80% { clip-path: inset(15% 0 55% 0); } 
    90% { clip-path: inset(80% 0 5% 0); } 
    100% { clip-path: inset(0 0 0 0); } 
  } 

  @keyframes dataStream { 
    0% { background-position: 0 0; } 
    100% { background-position: 0 1000px; } 
  } 

  @keyframes flickerIn { 
    0% { opacity: 0; } 
    10% { opacity: 0.8; } 
    15% { opacity: 0.2; } 
    20% { opacity: 0.9; } 
    25% { opacity: 0.4; } 
    30% { opacity: 1; } 
    50% { opacity: 0.9; } 
    55% { opacity: 1; } 
    100% { opacity: 1; } 
  } 

  @keyframes flickerOut { 
    0% { opacity: 1; } 
    10% { opacity: 0.8; } 
    20% { opacity: 1; } 
    30% { opacity: 0.6; } 
    40% { opacity: 0.9; } 
    50% { opacity: 0.3; } 
    60% { opacity: 0.7; } 
    70% { opacity: 0.2; } 
    80% { opacity: 0.5; } 
    90% { opacity: 0.1; } 
    100% { opacity: 0; } 
  } 

  @keyframes bootSequence { 
    0% {  
      opacity: 0; 
      transform: scale(0.95); 
      filter: blur(8px) brightness(1.5); 
    } 

    50% { 
      opacity: 0.7; 
      transform: scale(0.98); 
      filter: blur(2px) brightness(1.2); 
    } 

    100% {  
      opacity: 1; 
      transform: scale(1); 
      filter: blur(0) brightness(1); 
    } 
  } 

  @keyframes shutdownSequence { 
    0% {  
      opacity: 1; 
      transform: scale(1); 
      filter: brightness(1); 
    } 

    50% { 
      opacity: 0.5; 
      transform: scale(0.98); 
      filter: brightness(1.5); 
    } 

    100% {  
      opacity: 0; 
      transform: scale(0.95); 
      filter: brightness(2); 
    } 
  } 

  @keyframes hexReveal { 
    0% {  
      clip-path: polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%, 50% 50%, 50% 50%); 
    } 
    100% {  
      clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%); 
    } 
  } 

  @keyframes matrixRain { 
    0% { background-position: 0% 0%; } 
    100% { background-position: 0% 100%; } 
  } 

  @keyframes pulseGlow { 
    0%, 100% { box-shadow: 0 0 20px rgba(0, 255, 136, 0.5), inset 0 0 20px rgba(0, 255, 136, 0.1); } 
    50% { box-shadow: 0 0 60px rgba(0, 255, 136, 0.8), inset 0 0 40px rgba(0, 255, 136, 0.2); } 
  } 

  @keyframes borderTrace { 
    0% {  
      background-position: 0% 0%; 
    } 

    100% {  
      background-position: 400% 0%; 
    } 
  } 

  @keyframes noiseFlicker { 
    0%, 100% { opacity: 0.03; } 
    10% { opacity: 0.05; } 
    30% { opacity: 0.02; } 
    50% { opacity: 0.04; } 
    70% { opacity: 0.03; } 
    90% { opacity: 0.05; } 
  } 

  .page-transition-wrapper { 
    position: fixed; 
    top: 0; 
    left: 0; 
    right: 0; 
    bottom: 0; 
    overflow: hidden; 
  } 

  .page-idle { 
    opacity: 1; 
    transform: none; 
    filter: none; 
  } 

  .page-exiting { 
    animation: shutdownSequence 350ms ease-in forwards; 
  } 

  .page-entering { 
    animation: bootSequence 350ms ease-out forwards; 
  } 

  .cyber-glitch-overlay { 
    position: fixed; 
    top: 0; 
    left: 0; 
    right: 0; 
    bottom: 0; 
    pointer-events: none; 
    z-index: 10000; 
    opacity: 0; 
    mix-blend-mode: screen; 
  } 

  .cyber-glitch-overlay.active { 
    opacity: 1; 
  } 

  .cyber-glitch-overlay::before { 
    content: ''; 
    position: absolute; 
    top: 0; 
    left: 0; 
    right: 0; 
    bottom: 0; 
    background: linear-gradient( 
      90deg, 
      rgba(255, 0, 0, 0.1) 0%, 
      transparent 15%, 
      transparent 85%, 
      rgba(0, 255, 255, 0.1) 100% 
    ); 
    animation: glitchSkew 200ms infinite; 
  } 

  .cyber-glitch-overlay::after { 
    content: ''; 
    position: absolute; 
    top: 0; 
    left: 0; 
    right: 0; 
    bottom: 0; 
    background: repeating-linear-gradient( 
      0deg, 
      rgba(0, 0, 0, 0.15) 0px, 
      rgba(0, 0, 0, 0.15) 1px, 
      transparent 1px, 
      transparent 2px 
    ); 
  } 

  .cyber-scanline { 
    position: fixed; 
    top: -10px; 
    left: 0; 
    right: 0; 
    height: 8px; 
    background: linear-gradient( 
      180deg, 
      transparent, 
      rgba(0, 255, 136, 0.8), 
      rgba(0, 255, 200, 1), 
      rgba(0, 255, 136, 0.8), 
      transparent 
    ); 
    z-index: 10001; 
    opacity: 0; 
    box-shadow:  
      0 0 20px rgba(0, 255, 136, 0.8), 
      0 0 40px rgba(0, 255, 136, 0.5), 
      0 0 60px rgba(0, 255, 136, 0.3); 
  } 
 
  .cyber-scanline.active { 
    opacity: 1; 
    animation: scanlineMove 500ms linear; 
  } 
 
  .data-stream { 
    position: fixed; 
    top: 0; 
    left: 0; 
    right: 0; 
    bottom: 0; 
    z-index: 9999; 
    opacity: 0; 
    pointer-events: none; 
    background-image:  
      repeating-linear-gradient( 
        0deg, 
        transparent, 
        transparent 2px, 
        rgba(0, 255, 136, 0.03) 2px, 
        rgba(0, 255, 136, 0.03) 4px 
      ), 
      repeating-linear-gradient( 
        90deg, 
        transparent, 
        transparent 50px, 
        rgba(0, 255, 136, 0.02) 50px, 
        rgba(0, 255, 136, 0.02) 51px 
      ); 
    background-size: 100% 100%, 100% 100%; 
  } 

  .data-stream.active { 
    opacity: 1; 
    animation: dataStream 500ms linear; 
  } 

  .noise-overlay { 
    position: fixed; 
    top: 0; 
    left: 0; 
    right: 0; 
    bottom: 0; 
    z-index: 10002; 
    pointer-events: none; 
    opacity: 0; 
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E"); 
    background-repeat: repeat; 
    mix-blend-mode: overlay; 
  } 

  .noise-overlay.active { 
    opacity: 0.15; 
    animation: noiseFlicker 100ms infinite; 
  } 

  .cyber-loading-text { 
    position: fixed; 
    top: 50%; 
    left: 50%; 
    transform: translate(-50%, -50%); 
    z-index: 10003; 
    font-family: 'Courier New', monospace; 
    font-size: 14px; 
    color: #00ff88; 
    text-transform: uppercase; 
    letter-spacing: 4px; 
    opacity: 0; 
    text-shadow:  
      0 0 10px rgba(0, 255, 136, 0.8), 
      0 0 20px rgba(0, 255, 136, 0.5), 
      0 0 30px rgba(0, 255, 136, 0.3); 
  } 

  .cyber-loading-text.active { 
    opacity: 1; 
    animation: flickerIn 400ms ease-out forwards, rgbSplit 200ms infinite; 
  } 

  .cyber-loading-text::before { 
    content: '[ '; 
  } 

  .cyber-loading-text::after { 
    content: ' ]'; 
  } 

  .cyber-frame { 
    position: fixed; 
    top: 10px; 
    left: 10px; 
    right: 10px; 
    bottom: 10px; 
    border: 1px solid transparent; 
    z-index: 10001; 
    pointer-events: none; 
    opacity: 0; 
    background: linear-gradient(90deg, #00ff88, #00ffcc, #00ff88, #00ffcc) border-box; 
    -webkit-mask:  
      linear-gradient(#fff 0 0) padding-box,  
      linear-gradient(#fff 0 0); 
    -webkit-mask-composite: xor; 
    mask-composite: exclude; 
    background-size: 400% 100%; 
  } 

  .cyber-frame.active { 
    opacity: 1; 
    animation: borderTrace 800ms linear forwards; 
  } 

  .cyber-frame::before, 
  .cyber-frame::after { 
    content: ''; 
    position: absolute; 
    width: 20px; 
    height: 20px; 
    border: 2px solid #00ff88; 
  } 

  .cyber-frame::before { 
    top: -2px; 
    left: -2px; 
    border-right: none; 
    border-bottom: none; 
    box-shadow: 0 0 10px rgba(0, 255, 136, 0.5); 
  } 

  .cyber-frame::after { 
    bottom: -2px; 
    right: -2px; 
    border-left: none; 
    border-top: none; 
    box-shadow: 0 0 10px rgba(0, 255, 136, 0.5); 
  } 

  .glitch-slice { 
    position: fixed; 
    left: 0; 
    right: 0; 
    height: 20%; 
    z-index: 9998; 
    pointer-events: none; 
    opacity: 0; 
    background: rgba(0, 255, 136, 0.03); 
  } 

  .glitch-slice.active { 
    animation: horizontalGlitch 400ms steps(1) forwards; 
  } 


  .glitch-slice:nth-child(1) { top: 0; animation-delay: 0ms; } 
  .glitch-slice:nth-child(2) { top: 20%; animation-delay: 50ms; } 
  .glitch-slice:nth-child(3) { top: 40%; animation-delay: 100ms; } 
  .glitch-slice:nth-child(4) { top: 60%; animation-delay: 150ms; } 
  .glitch-slice:nth-child(5) { top: 80%; animation-delay: 200ms; } 

  .glitch-slice.active:nth-child(odd) { 
    transform: translateX(5px); 
    background: rgba(255, 0, 0, 0.02); 
  } 

  .glitch-slice.active:nth-child(even) { 
    transform: translateX(-5px); 
    background: rgba(0, 255, 255, 0.02); 
  } 
`; 

//menaje de carga en la transicion entre pestanias 
const LOADING_MESSAGES = [ 
  'INITIALIZING', 
  'DECRYPTING', 
  'LOADING MODULE', 
  'ACCESSING', 
  'CONNECTING', 
  'SYNCING DATA', 
  'BOOTING', 
]; 

const App = () => { 
  const [currentPage, setCurrentPage] = useState(PAGES.DASHBOARD); 
  const [displayedPage, setDisplayedPage] = useState(PAGES.DASHBOARD); 
  const [user, setUser] = useState(null); 
  const [transitionState, setTransitionState] = useState('idle'); 
  const [isTransitioning, setIsTransitioning] = useState(false); 
  const [loadingMessage, setLoadingMessage] = useState(''); 
  const stylesInjected = useRef(false); 
  const transitionRef = useRef(null); 

  //insertar estilos de transicion una vez 
  useEffect(() => { 
    if (!stylesInjected.current) { 
      const styleEl = document.createElement('style'); 
      styleEl.textContent = transitionStyles; 
      document.head.appendChild(styleEl); 
      stylesInjected.current = true; 
    } 
  }, []); 

  const performTransition = useCallback((targetPage) => { 

  //limpiar cualquier transicion existente 
    if (transitionRef.current) { 
      clearTimeout(transitionRef.current.timer1); 
      clearTimeout(transitionRef.current.timer2); 
      clearTimeout(transitionRef.current.timer3); 
    } 

    //escoger mensaje de carga al azar
    const message = LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)]; 
    setLoadingMessage(message); 
  
    //iniciar transicion 
    setIsTransitioning(true); 
    setTransitionState('exiting'); 

    const timer1 = setTimeout(() => { 
      setDisplayedPage(targetPage); 
      setCurrentPage(targetPage); 
      setTransitionState('entering'); 
    }, 350); 

    const timer2 = setTimeout(() => { 
      setTransitionState('idle'); 
    }, 700); 

    const timer3 = setTimeout(() => { 
      setIsTransitioning(false); 
    }, 750); 

    transitionRef.current = { timer1, timer2, timer3 }; 
  }, []); 

  //navegar al login cuando se hace clic en logo
  const handleLogoClick = useCallback(() => { 
    if (isTransitioning) return; 
    const targetPage = user ? PAGES.ADMIN : PAGES.LOGIN; 
    performTransition(targetPage); 
  }, [user, isTransitioning, performTransition]); 

  //manejo de login exitoso
  const handleLoginSuccess = useCallback((userData) => { 
    if (isTransitioning) return; 
    setUser(userData); 
    performTransition(PAGES.ADMIN); 
  }, [isTransitioning, performTransition]); 

  //navegar al dashboard hasta el login 
  const handleBackFromLogin = useCallback(() => { 
    if (isTransitioning) return; 
    performTransition(PAGES.DASHBOARD); 
  }, [isTransitioning, performTransition]); 

  //navegar hasta el dashboard desde admin
  const handleBackFromAdmin = useCallback(() => { 
    if (isTransitioning) return; 
    performTransition(PAGES.DASHBOARD); 
  }, [isTransitioning, performTransition]); 

  //obtener la clase de transicion basado en el estado
  const getTransitionClass = () => { 
    switch (transitionState) { 
      case 'exiting': 
        return 'page-exiting'; 
      case 'entering': 
        return 'page-entering'; 
      case 'idle': 
      default: 
        return 'page-idle'; 
    } 
  }; 

  //cargar paginas actuales 
  const renderPage = () => { 
    switch (displayedPage) { 
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

  const activeClass = isTransitioning ? 'active' : ''; 
  return ( 
  <> 
      {/*laminas del glitch*/} 
      <div className={`glitch-slice ${activeClass}`} /> 
      <div className={`glitch-slice ${activeClass}`} /> 
      <div className={`glitch-slice ${activeClass}`} /> 
      <div className={`glitch-slice ${activeClass}`} /> 
      <div className={`glitch-slice ${activeClass}`} /> 

      {/*fondo de manejo de la info*/} 
      <div className={`data-stream ${activeClass}`} /> 

      {/* Main glitch overlay */} 
      <div className={`cyber-glitch-overlay ${activeClass}`} /> 

      {/*linea de scaneo*/} 
      <div className={`cyber-scanline ${activeClass}`} /> 

      {/* textura de ruido */} 
      <div className={`noise-overlay ${activeClass}`} /> 

      {/* animacion de frame del borde */} 
      <div className={`cyber-frame ${activeClass}`} /> 

      {/*texto de carga*/} 
      <div className={`cyber-loading-text ${activeClass}`}> 
        {loadingMessage} 
      </div> 

      {/*contenedor de la pagina con transiciones*/} 
      <div className={`page-transition-wrapper ${getTransitionClass()}`}> 
        {renderPage()} 
      </div> 
    </> 
  );
}; 
export default NewApp; 