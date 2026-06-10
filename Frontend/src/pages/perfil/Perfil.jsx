
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Mail, Lock, Camera, Trash2, Save, LogOut, CheckCircle, AlertCircle } from 'lucide-react';
import Swal from 'sweetalert2';
import { getProfile, updateProfile, changePassword, updateAvatar, deleteAvatar } from '../../services/profile-service';
import { logout } from '../../services/auth-service';
import { useSettings } from '../../context/SettingsContext';
import { useUser } from '../../context/UserContext';
import { getT } from '../../i18n';
import './Perfil.css';

export default function Perfil() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const { settings } = useSettings();
  const { user, updateUser } = useUser();
  const t = getT(settings.language).profile;

  // Datos del perfil
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  // Contraseña
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // Feedback
  const [profileMsg, setProfileMsg] = useState(null); 
  const [passwordMsg, setPasswordMsg] = useState(null);
  const [avatarMsg, setAvatarMsg] = useState(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  // Cargar perfil al montar
  useEffect(() => {
    const loadProfile = async () => {
      try {
        console.log('Iniciando carga de perfil...');
        const data = await getProfile();
        console.log('Perfil cargado:', data);
        setNombre(data.name || '');
        setCorreo(data.email || '');
        setAvatarUrl(data.avatarUrl || null);
      } catch (error) {
        console.error('Error cargando perfil:', error);
        setProfileMsg({ type: 'error', text: 'Error al cargar el perfil: ' + (error.response?.data || error.message) });
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  // ── Guardar datos personales ──────────────────────────────────────────
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!nombre.trim() || !correo.trim()) {
      setProfileMsg({ type: 'error', text: t.nameEmailRequired });
      return;
    }
    setSavingProfile(true);
    try {
      await updateProfile(nombre.trim(), correo.trim());
      setProfileMsg({ type: 'ok', text: t.profileUpdated });
      // Actualizar el contexto de usuario
      updateUser({ name: nombre.trim(), email: correo.trim() });
      window.dispatchEvent(new CustomEvent('profileUpdated', { detail: { name: nombre.trim() } }));
    } catch (err) {
      setProfileMsg({ type: 'error', text: err.response?.data || t.profileError });
    } finally {
      setSavingProfile(false);
      setTimeout(() => setProfileMsg(null), 4000);
    }
  };

  // ── Cambiar contraseña ────────────────────────────────────────────────
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setPasswordMsg({ type: 'error', text: t.fillAllFields });
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPasswordMsg({ type: 'error', text: t.passwordsMismatch });
      return;
    }
    if (newPassword.length < 8) {
      setPasswordMsg({ type: 'error', text: t.passwordTooShort });
      return;
    }
    if (!/[A-Z]/.test(newPassword)) {
      setPasswordMsg({ type: 'error', text: t.passwordNoUpper });
      return;
    }
    if (!/[!@#$%&*.,]/.test(newPassword)) {
      setPasswordMsg({ type: 'error', text: t.passwordNoSpecial });
      return;
    }
    setSavingPassword(true);
    try {
      await changePassword(currentPassword, newPassword);
      setPasswordMsg({ type: 'ok', text: t.passwordUpdated });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err) {
      setPasswordMsg({ type: 'error', text: err.response?.data || t.passwordUpdated });
    } finally {
      setSavingPassword(false);
      setTimeout(() => setPasswordMsg(null), 4000);
    }
  };

  // ── Cambiar foto ──────────────────────────────────────────────────────
  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setAvatarUrl(reader.result);
    reader.readAsDataURL(file);
    try {
      const response = await updateAvatar(file);
      setAvatarMsg({ type: 'ok', text: t.photoUpdated });
      // Actualizar el contexto de usuario con la URL del servidor
      updateUser({ avatarUrl: response.avatarUrl });
      // Actualizar el estado local con la URL del servidor (sin data URL)
      setAvatarUrl(response.avatarUrl);
    } catch {
      setAvatarMsg({ type: 'error', text: t.photoError });
    } finally {
      setTimeout(() => setAvatarMsg(null), 3000);
    }
  };

  // ── Borrar foto ───────────────────────────────────────────────────────
  const handleDeleteAvatar = async () => {
    const swalBg = settings.theme === 'dark' ? '#2a2a2a' : '#fff';
    const swalColor = settings.theme === 'dark' ? '#f0f0f0' : '#333';

    const result = await Swal.fire({
      title: '¿Eliminar foto de perfil?',
      text: 'Esta acción no se puede deshacer',
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
      await deleteAvatar();
      setAvatarUrl(null);
      setAvatarMsg({ type: 'ok', text: t.photoDeleted });
      // Actualizar el contexto de usuario
      updateUser({ avatarUrl: null });
      
      Swal.fire({
        title: '¡Eliminado!',
        text: 'Tu foto de perfil ha sido eliminada',
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
    } catch {
      setAvatarMsg({ type: 'error', text: t.photoDeleteError });
      Swal.fire({
        title: 'Error',
        text: 'No se pudo eliminar la foto',
        icon: 'error',
        confirmButtonColor: '#ff6b35',
        background: swalBg,
        color: swalColor,
        customClass: {
          popup: 'swal-popup',
          title: 'swal-title',
          confirmButton: 'swal-confirm-btn'
        }
      });
    } finally {
      setTimeout(() => setAvatarMsg(null), 3000);
    }
  };

  const handleLogout = () => {
    updateUser({ name: 'Usuario', email: '', avatarUrl: null });
    logout();
    navigate('/login');
  };

  // Generar avatar por defecto con las iniciales
  const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(nombre || 'U')}&background=ff6b35&color=fff&size=150`;
  
  // Agregar timestamp para evitar caché del navegador en avatares del servidor
  const displayAvatarUrl = avatarUrl && !avatarUrl.startsWith('data:') 
    ? (avatarUrl.includes('?') ? `${avatarUrl}&t=${Date.now()}` : `${avatarUrl}?t=${Date.now()}`)
    : avatarUrl;

  if (loading) {
    return (
      <div className="perfil-container">
        <p style={{ color: '#aaa', padding: '2rem' }}>{t.loading}</p>
      </div>
    );
  }

  return (
    <div className="perfil-container">
      <header className="reco-header">
        <div className="reco-title-row">
          <button className="back-btn" onClick={() => navigate('/inicio')}>
            <ArrowLeft size={20} />
          </button>
          <h1>{t.title}</h1>
        </div>
        <p>{t.subtitle}</p>
      </header>

      <div className="perfil-content">
        <aside className="perfil-sidebar-info">
          <div className="avatar-wrapper">
            <img src={displayAvatarUrl || defaultAvatar} alt="Avatar" className="perfil-avatar" onError={(e) => { e.target.src = defaultAvatar; }} />
            <button className="change-photo-btn" onClick={() => fileInputRef.current?.click()} title="Cambiar foto">
              <Camera size={18} />
            </button>
            {avatarUrl && (
              <button className="delete-photo-btn" onClick={handleDeleteAvatar} title="Eliminar foto">
                <Trash2 size={18} />
              </button>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarChange} />
          </div>

          {avatarMsg && (
            <p style={{ fontSize: '0.8rem', color: avatarMsg.type === 'ok' ? '#4caf50' : '#e55a25', marginBottom: '0.5rem' }}>
              {avatarMsg.text}
            </p>
          )}

          <h2>{nombre || 'Usuario'}</h2>
          <p>{correo}</p>

          <button className="logout-perfil-btn" onClick={handleLogout}>
            <LogOut size={18} /> {t.logout}
          </button>
        </aside>

        <div className="perfil-forms">
          {/* INFORMACIÓN PERSONAL */}
          <section className="perfil-card">
            <h3><User size={20} /> {t.personalInfo}</h3>
            <form onSubmit={handleSaveProfile}>
              <div className="form-group">
                <label>{t.name}</label>
                <div className="input-with-icon">
                  <User size={18} className="input-icon" />
                  <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder={t.namePlaceholder} />
                </div>
              </div>
              <div className="form-group">
                <label>{t.email}</label>
                <div className="input-with-icon">
                  <Mail size={18} className="input-icon" />
                  <input type="email" value={correo} onChange={(e) => setCorreo(e.target.value)} placeholder={t.emailPlaceholder} />
                </div>
              </div>

              {profileMsg && (
                <div className={`perfil-msg ${profileMsg.type}`}>
                  {profileMsg.type === 'ok' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                  {profileMsg.text}
                </div>
              )}

              <button type="submit" className="save-btn" disabled={savingProfile}>
                <Save size={18} /> {savingProfile ? t.saving : t.saveChanges}
              </button>
            </form>
          </section>

          {/* SEGURIDAD */}
          <section className="perfil-card">
            <h3><Lock size={20} /> {t.security}</h3>
            <form onSubmit={handleChangePassword}>
              <div className="form-group">
                <label>{t.currentPassword}</label>
                <div className="input-with-icon">
                  <Lock size={18} className="input-icon" />
                  <input type="password" placeholder="••••••••" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
                </div>
              </div>
              <div className="form-group">
                <label>{t.newPassword}</label>
                <div className="input-with-icon">
                  <Lock size={18} className="input-icon" />
                  <input type="password" placeholder={t.newPassword} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                </div>
                <p style={{ fontSize: '0.75rem', color: '#aaa', marginTop: '0.25rem', lineHeight: '1.4' }}>
                  {t.newPasswordHint}
                </p>
              </div>
              <div className="form-group">
                <label>{t.confirmPassword}</label>
                <div className="input-with-icon">
                  <Lock size={18} className="input-icon" />
                  <input type="password" placeholder={t.confirmPassword} value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} />
                </div>
              </div>

              {passwordMsg && (
                <div className={`perfil-msg ${passwordMsg.type}`}>
                  {passwordMsg.type === 'ok' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                  {passwordMsg.text}
                </div>
              )}

              <button type="submit" className="save-btn secondary" disabled={savingPassword}>
                {savingPassword ? t.updating : t.updatePassword}
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}
