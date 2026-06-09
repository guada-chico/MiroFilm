import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Globe, Moon, Bell, Eye, ShieldCheck, Trash2 } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { getT } from '../../i18n';
import './Ajustes.css';

export default function Ajustes() {
  const navigate = useNavigate();
  const { settings, updateSettings } = useSettings();
  const t = getT(settings.language).settings;
  
  // Estados para los interruptores (toggles)
  const [emailNotif, setEmailNotif] = useState(true);
  const [publicProfile, setPublicProfile] = useState(false);

  const handleDarkModeToggle = () => {
    updateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' });
  };

  const handleLanguageChange = (e) => {
    updateSettings({ language: e.target.value });
  };

  return (
    <div className="ajustes-container">
      <header className="reco-header">
        <div className="reco-title-row">
          <button className="back-btn" onClick={() => navigate('/inicio')}>
            <ArrowLeft size={20} />
          </button>
          <h1>{t.title}</h1>
        </div>
        <p>{t.subtitle}</p>
      </header>

      <div className="ajustes-content">
        {/* PREFERENCIAS DE INTERFAZ */}
        <section className="ajustes-section">
          <div className="section-header">
            <Eye size={20} />
            <h3>{t.appearance}</h3>
          </div>
          
          <div className="ajuste-item">
            <div className="ajuste-info">
              <div className="ajuste-icon-bg"><Moon size={18} /></div>
              <div>
                <strong>{t.darkMode}</strong>
                <p>{t.darkModeDesc}</p>
              </div>
            </div>
            <label className="switch">
              <input 
                type="checkbox" 
                checked={settings.theme === 'dark'} 
                onChange={handleDarkModeToggle} 
              />
              <span className="slider"></span>
            </label>
          </div>

          <div className="ajuste-item">
            <div className="ajuste-info">
              <div className="ajuste-icon-bg"><Globe size={18} /></div>
              <div>
                <strong>{t.language}</strong>
                <p>{t.languageDesc}</p>
              </div>
            </div>
            <select 
              className="ajuste-select"
              value={settings.language}
              onChange={handleLanguageChange}
            >
              <option value="es">Español</option>
              <option value="en">English</option>
              <option value="fr">Français</option>
            </select>
          </div>
        </section>

        {/* NOTIFICACIONES: eliminada por solicitud del usuario */}

        {/* PRIVACIDAD Y CUENTA */}
        <section className="ajustes-section">
          <div className="section-header">
            <ShieldCheck size={20} />
            <h3>{t.privacy}</h3>
          </div>
          
          <div className="ajuste-item">
            <div className="ajuste-info">
              <div className="ajuste-icon-bg"><Eye size={18} /></div>
              <div>
                <strong>{t.publicProfile}</strong>
                <p>{t.publicProfileDesc}</p>
              </div>
            </div>
            <label className="switch">
              <input type="checkbox" checked={publicProfile} onChange={() => setPublicProfile(!publicProfile)} />
              <span className="slider"></span>
            </label>
          </div>

          <div className="ajuste-item delete-action">
            <div className="ajuste-info">
              <div className="ajuste-icon-bg danger"><Trash2 size={18} /></div>
              <div>
                <strong>{t.deleteAccount}</strong>
                <p>{t.deleteAccountDesc}</p>
              </div>
            </div>
            <button className="btn-danger-outline">{t.deleteBtn}</button>
          </div>
        </section>
      </div>
    </div>
  );
}