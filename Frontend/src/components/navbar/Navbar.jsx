import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, ChevronDown, User, Settings, LogOut, X, Globe } from 'lucide-react';
import { useUser } from '../../context/UserContext';
import { useSettings } from '../../context/SettingsContext';
import { getT } from '../../i18n';
import { logout } from '../../services/auth-service';
import { getNotifications, deleteNotification } from '../../services/notifications-service';
import './Navbar.css';

export default function Navbar() {
  const navigate = useNavigate();
  const { user, clearUser } = useUser();
  const { settings, updateSettings } = useSettings();
  const t = getT(settings.language);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifs, setLoadingNotifs] = useState(false);

  const userMenuRef = useRef(null);
  const notiMenuRef = useRef(null);
  const langMenuRef = useRef(null);

  // Cargar notificaciones del usuario
  const loadNotifications = async () => {
    try {
      setLoadingNotifs(true);
      const data = await getNotifications();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error cargando notificaciones:', error);
      setNotifications([]);
    } finally {
      setLoadingNotifs(false);
    }
  };

  // Eliminar una notificación
  const handleDeleteNotification = async (e, notificationId) => {
    e.stopPropagation();
    try {
      await deleteNotification(notificationId);
      // Recargar notificaciones después de eliminar
      await loadNotifications();
    } catch (error) {
      console.error('Error eliminando notificación:', error);
    }
  };

  // Cargar notificaciones al montar el componente
  useEffect(() => {
    loadNotifications();
    
    // Recargar cada 30 segundos
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Recargar notificaciones cuando el usuario cambia de pestaña
  useEffect(() => {
    const handleFocus = () => {
      loadNotifications();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showUserMenu && userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
      if (showNotifications && notiMenuRef.current && !notiMenuRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (showLangMenu && langMenuRef.current && !langMenuRef.current.contains(event.target)) {
        setShowLangMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu, showNotifications, showLangMenu]);

  const handleLogout = () => {
    clearUser();
    logout();
    navigate('/login');
  };

  // Avatar por defecto con iniciales
  const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'U')}&background=ff6b35&color=fff&size=40`;
  
  // Agregar timestamp para evitar caché del navegador
  const avatarUrl = user.avatarUrl 
    ? (user.avatarUrl.includes('?') ? `${user.avatarUrl}&t=${Date.now()}` : `${user.avatarUrl}?t=${Date.now()}`)
    : defaultAvatar;

  return (
    <header className="navbar-top">
      <div className="navbar-actions">
        
        <div className="notification-container" ref={notiMenuRef}>
          <div 
            className="icon-bell" 
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowUserMenu(false);
            }}
          >
            <Bell size={20} />
            {notifications.length > 0 && <span className="notification-dot"></span>}
          </div>

          {showNotifications && (
            <div className="notifications-dropdown">
              <div className="dropdown-header">{t.common?.notifications || 'Notificaciones'}</div>
              <div className="dropdown-content">
                {loadingNotifs ? (
                  <p className="no-data">{t.common?.loading || 'Cargando...'}</p>
                ) : notifications.length > 0 ? (
                  notifications.map((n) => (
                    <div 
                      key={n.id} 
                      className="noti-item"
                      onClick={() => {
                        navigate('/amigos');
                        setShowNotifications(false);
                      }}
                    >
                      <div className="noti-item-content">
                        {n.message}
                      </div>
                      <button
                        className="noti-delete-btn"
                        onClick={(e) => handleDeleteNotification(e, n.id)}
                        title="Eliminar notificación"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="no-data">{t.common?.noNotifications || 'No hay notificaciones'}</p>
                )}
              </div>
            </div>
          )}
        </div>
        
        <div className="lang-container" ref={langMenuRef}>
          <div
            className="lang-toggle"
            onClick={(e) => {
              e.stopPropagation();
              setShowLangMenu(!showLangMenu);
              setShowUserMenu(false);
              setShowNotifications(false);
            }}
            title={t.settings?.language || 'Language'}
          >
            <Globe size={18} />
          </div>

          {showLangMenu && (
            <div className="lang-dropdown">
              <div className="lang-option" onClick={(e) => { e.stopPropagation(); updateSettings({ language: 'es' }); setShowLangMenu(false); }}>Español</div>
              <div className="lang-option" onClick={(e) => { e.stopPropagation(); updateSettings({ language: 'en' }); setShowLangMenu(false); }}>English</div>
              <div className="lang-option" onClick={(e) => { e.stopPropagation(); updateSettings({ language: 'fr' }); setShowLangMenu(false); }}>Français</div>
            </div>
          )}
        </div>

        <div 
          className="user-pill" 
          ref={userMenuRef}
          onClick={() => {
            setShowUserMenu(!showUserMenu);
            setShowNotifications(false);
          }}
        >
          <div className="user-avatar-container">
            <img 
              src={avatarUrl} 
              alt="Avatar" 
              className="user-avatar-img"
              onError={(e) => { e.target.src = defaultAvatar; }}
            />
          </div>
          <span className="user-name">{user.name}</span>
          <ChevronDown size={14} className={showUserMenu ? 'rotate' : ''} />

          {showUserMenu && (
            <div className="user-dropdown">
              <div 
                className="dropdown-opt" 
                onClick={() => {
                  navigate('/perfil');
                  setShowUserMenu(false);
                }}
              >
                <User size={14}/> {t.profile?.title || 'Mi Perfil'}
              </div>
              
              <div 
                className="dropdown-opt" 
                onClick={() => {
                  navigate('/ajustes');
                  setShowUserMenu(false);
                }}
              >
                <Settings size={14}/> {t.settings?.title || 'Ajustes'}
              </div>

              <hr className="divider" />
              
              <div className="dropdown-opt logout-opt" onClick={handleLogout}>
                <LogOut size={14}/> {t.profile?.logout || 'Cerrar sesión'}
              </div>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}