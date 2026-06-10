import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Globe, Moon, Eye, ShieldCheck, Trash2 } from 'lucide-react';
import Swal from 'sweetalert2';
import { useSettings } from '../../context/SettingsContext';
import { useUser } from '../../context/UserContext';
import api from '../../services/api-config';
import { logout } from '../../services/auth-service';
import { getT } from '../../i18n';
import './Ajustes.css';

export default function Ajustes() {
  const navigate = useNavigate();
  const { settings, updateSettings } = useSettings();
  const { clearUser } = useUser();
  const t = getT(settings.language).settings;
  
  // Estados para los interruptores (toggles)
  const [emailNotif, setEmailNotif] = useState(true);

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
            
        </section>

        {/* NOTIFICACIONES: eliminada por solicitud del usuario */}

        {/* PRIVACIDAD Y CUENTA */}
        <section className="ajustes-section">
          <div className="section-header">
            <ShieldCheck size={20} />
            <h3>{t.privacy}</h3>
          </div>
          
          {/* Opción 'perfil privado' eliminada según solicitud */}

          <div className="ajuste-item delete-action">
            <div className="ajuste-info">
              <div className="ajuste-icon-bg danger"><Trash2 size={18} /></div>
              <div>
                <strong>{t.deleteAccount}</strong>
                <p>{t.deleteAccountDesc}</p>
              </div>
            </div>
            <button className="btn-danger-outline" onClick={async () => {
              const swalBg = settings.theme === 'dark' ? '#2a2a2a' : '#fff';
              const swalColor = settings.theme === 'dark' ? '#f0f0f0' : '#333';

              const result = await Swal.fire({
                title: '¿Eliminar cuenta?',
                text: 'Esta acción no se puede deshacer. Tu cuenta y todos los datos asociados serán eliminados.',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#ff4d4d',
                cancelButtonColor: '#ccc',
                confirmButtonText: 'Sí, eliminar',
                cancelButtonText: 'Cancelar',
                background: swalBg,
                color: swalColor,
                customClass: {
                  popup: 'swal-popup',
                  title: 'swal-title',
                  confirmButton: 'swal-confirm-btn',
                  cancelButton: 'swal-cancel-btn'
                }
              });

              if (!result.isConfirmed) return;

              try {
                Swal.fire({
                  title: 'Eliminando cuenta...',
                  allowOutsideClick: false,
                  didOpen: () => Swal.showLoading(),
                  background: swalBg,
                  color: swalColor,
                  customClass: { popup: 'swal-popup' }
                });

                await api.delete('/users/me');
                Swal.close();

                Swal.fire({
                  title: 'Cuenta eliminada',
                  text: 'Tu cuenta ha sido eliminada correctamente.',
                  icon: 'success',
                  confirmButtonColor: '#ff6b35',
                  background: swalBg,
                  color: swalColor,
                  customClass: {
                    popup: 'swal-popup',
                    title: 'swal-title',
                    confirmButton: 'swal-confirm-btn'
                  }
                });

                // cerrar sesión y limpiar estado
                logout();
                clearUser();
                navigate('/login');
              } catch (err) {
                console.error('Error eliminando cuenta:', err);
                Swal.fire({
                  title: 'Error',
                  text: 'No se pudo eliminar la cuenta. Intenta de nuevo más tarde.',
                  icon: 'error',
                  confirmButtonColor: '#ff6b35',
                  background: swalBg,
                  color: swalColor,
                  customClass: { popup: 'swal-popup', title: 'swal-title', confirmButton: 'swal-confirm-btn' }
                });
              }
            }}>{t.deleteBtn}</button>
          </div>
        </section>
      </div>
    </div>
  );
}