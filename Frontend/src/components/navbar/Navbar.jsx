import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, ChevronDown, User, Settings, LogOut } from 'lucide-react';
import { useUser } from '../../context/UserContext';
import { logout } from '../../services/auth-service';
import './Navbar.css';

export default function Navbar() {
  const navigate = useNavigate();
  const { user } = useUser();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const userMenuRef = useRef(null);
  const notiMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showUserMenu && userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
      if (showNotifications && notiMenuRef.current && !notiMenuRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu, showNotifications]);

  const notifications = [];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Avatar por defecto con iniciales
  const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'U')}&background=ff6b35&color=fff&size=40`; 

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
              <div className="dropdown-header">Notificaciones</div>
              <div className="dropdown-content">
                {notifications.length > 0 ? (
                  notifications.map((n, i) => <div key={i} className="noti-item">{n}</div>)
                ) : (
                  <p className="no-data">No hay notificaciones</p>
                )}
              </div>
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
              src={user.avatarUrl || defaultAvatar} 
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
                <User size={14}/> Mi Perfil
              </div>
              
              <div 
                className="dropdown-opt" 
                onClick={() => {
                  navigate('/ajustes');
                  setShowUserMenu(false);
                }}
              >
                <Settings size={14}/> Ajustes
              </div>

              <hr className="divider" />
              
              <div className="dropdown-opt logout-opt" onClick={handleLogout}>
                <LogOut size={14}/> Cerrar sesión
              </div>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}