import { useNavigate, useLocation } from "react-router-dom";
import { Home, Film, Tv, Heart, List, Users, Settings, HelpCircle } from "lucide-react";
import logoMiroFilm from "../../assets/logo-mirofilm-sf.png";
import { useTranslation } from "../../hooks/useTranslation";
import "./Sidebar.css";

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const t = useTranslation();

  const menuItems = [
    { path: '/inicio', icon: Home, label: t.sidebar?.home || 'Inicio' },
    { path: '/peliculas', icon: Film, label: t.sidebar?.movies || 'Películas' },
    { path: '/series', icon: Tv, label: t.sidebar?.series || 'Series' },
    { path: '/mis-libros', icon: Heart, label: t.sidebar?.favorites || 'Favoritos' },
    { path: '/mis-listas', icon: List, label: t.sidebar?.lists || 'Mis Listas' },
    { path: '/amigos', icon: Users, label: t.sidebar?.friends || 'Amigos' },
  ];

  const otherItems = [
    { path: '/ajustes', icon: Settings, label: t.sidebar?.settings || 'Ajustes' },
    { path: '/ayuda', icon: HelpCircle, label: t.sidebar?.help || 'Ayuda' },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <img 
          src={logoMiroFilm} 
          alt="MiroFilm" 
          onClick={() => navigate('/inicio')} 
          style={{ cursor: 'pointer' }} 
        />
      </div>
      
      <nav className="sidebar-menu">
        <p className="label">{t.sidebar?.menu || 'MENU'}</p>
        <ul>
          {menuItems.map((item) => (
            <li 
              key={item.path}
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
            >
              <item.icon size={18}/> <span>{item.label}</span>
            </li>
          ))}
        </ul>

        <p className="label">{t.sidebar?.other || 'OTROS'}</p>
        <ul>
          {otherItems.map((item) => (
            <li 
              key={item.path}
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
            >
              <item.icon size={18}/> <span>{item.label}</span>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}