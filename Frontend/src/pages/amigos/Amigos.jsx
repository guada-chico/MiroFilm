import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, UserPlus, MessageCircle, BookOpen, X, Heart, Eye, Trash2, Clock } from 'lucide-react';
import { 
  getMyFriends, 
  sendFriendRequest, 
  getPendingRequests, 
  getSentRequests,
  searchUsers,
  respondToRequest,
  cancelRequest,
  getFriendshipStatus,
  removeFriend
} from '../../services/friendship-service';
import { getFriendsActivity, getFriendFavorites, getFriendWatching } from '../../services/friend-activity-service';
import { useSettings } from '../../context/SettingsContext';
import { useUser } from '../../context/UserContext';
import { getT } from '../../i18n';
import './Amigos.css';

export default function Amigos() {
  const navigate = useNavigate();
  const { settings } = useSettings();
  const { user } = useUser();
  const t = getT(settings.language);
  
  // Estados principales
  const [activeTab, setActiveTab] = useState('friends'); // friends, requests, search, activity
  const [amigos, setAmigos] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [activity, setActivity] = useState([]);
  
  // Estados de carga
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  
  // Modal de perfil de amigo
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [friendFavorites, setFriendFavorites] = useState([]);
  const [friendWatching, setFriendWatching] = useState([]);
  const [friendshipStatus, setFriendshipStatus] = useState(null);
  const [loadingFriendProfile, setLoadingFriendProfile] = useState(false);

  // Modal de confirmación para eliminar amigo
  const [confirmDeleteModal, setConfirmDeleteModal] = useState(null);

  // Cargar datos iniciales
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      console.log('Cargando datos de amigos...');
      const [friendsData, pendingData, sentData, activityData] = await Promise.all([
        getMyFriends(),
        getPendingRequests(),
        getSentRequests(),
        getFriendsActivity()
      ]);
      
      console.log('Amigos:', friendsData);
      console.log('Solicitudes pendientes:', pendingData);
      console.log('Solicitudes enviadas:', sentData);
      
      setAmigos(friendsData);
      setPendingRequests(pendingData);
      setSentRequests(sentData);
      setActivity(activityData);
    } catch (err) {
      console.error('Error cargando datos:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    try {
      const results = await searchUsers(searchQuery);
      // Filtrar el usuario actual
      setSearchResults(results.filter(u => u.id !== user.id));
    } catch (err) {
      console.error('Error en búsqueda:', err);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSendRequest = async (receiverId) => {
    try {
      console.log('Enviando solicitud a usuario:', receiverId);
      const result = await sendFriendRequest(receiverId);
      console.log('Respuesta del servidor:', result);
      alert(result.message || t.amigos?.requestSent || 'Solicitud enviada');
      
      // Pequeño delay para asegurar que el servidor procesó la solicitud
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log('Recargando datos...');
      // Recargar todos los datos incluyendo búsqueda
      await loadAllData();
      console.log('Datos recargados');
      
      // Si estamos en tab de búsqueda, recargar resultados
      if (activeTab === 'search' && searchQuery.trim()) {
        try {
          console.log('Recargando resultados de búsqueda');
          const results = await searchUsers(searchQuery);
          setSearchResults(results.filter(u => u.id !== user.id));
        } catch (err) {
          console.error('Error recargando búsqueda:', err);
        }
      } else {
        setSearchQuery('');
        setSearchResults([]);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.response?.data || t.amigos?.requestError || 'Error al enviar solicitud';
      console.error('Error completo:', err);
      console.error('Status:', err.response?.status);
      console.error('Data:', err.response?.data);
      alert(errorMessage);
    }
  };

  const handleRespondRequest = async (friendshipId, status) => {
    try {
      await respondToRequest(friendshipId, status);
      alert(status === 'Accepted' ? 'Solicitud aceptada' : 'Solicitud rechazada');
      await loadAllData();
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Error al responder solicitud';
      console.error('Error detalles:', err);
      alert(`Error: ${errorMessage}`);
    }
  };

  const handleCancelRequest = async (friendshipId) => {
    try {
      await cancelRequest(friendshipId);
      alert('Solicitud cancelada');
      await loadAllData();
    } catch (err) {
      alert('Error al cancelar solicitud');
    }
  };

  const handleRemoveFriend = async (friendshipId) => {
    console.log('Intentando eliminar amigo con friendshipId:', friendshipId);
    setConfirmDeleteModal({ friendshipId, isDeleting: false });
  };

  const confirmDeleteFriend = async () => {
    if (!confirmDeleteModal) return;

    setConfirmDeleteModal({ ...confirmDeleteModal, isDeleting: true });

    try {
      await removeFriend(confirmDeleteModal.friendshipId);
      alert('Amigo eliminado correctamente');
      setConfirmDeleteModal(null);
      await loadAllData();
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Error al eliminar amigo';
      console.error('Error detalles:', err);
      console.error('URL intentada:', err.config?.url);
      alert(`Error: ${errorMessage}`);
      setConfirmDeleteModal(null);
    }
  };

  const openFriendProfile = async (friend) => {
    setSelectedFriend(friend);
    setLoadingFriendProfile(true);
    try {
      const [favorites, watching, status] = await Promise.all([
        getFriendFavorites(friend.id || friend.userReceiveId || friend.userRequestId),
        getFriendWatching(friend.id || friend.userReceiveId || friend.userRequestId),
        getFriendshipStatus(friend.id || friend.userReceiveId || friend.userRequestId)
      ]);
      
      setFriendFavorites(favorites);
      setFriendWatching(watching);
      setFriendshipStatus(status);
    } catch (err) {
      console.error('Error cargando perfil:', err);
    } finally {
      setLoadingFriendProfile(false);
    }
  };

  const getFriendName = (friendship) => {
    if (friendship.userRequest?.name) return friendship.userRequest.name;
    if (friendship.userReceive?.name) return friendship.userReceive.name;
    return 'Usuario desconocido';
  };

  const getFriendEmail = (friendship) => {
    if (friendship.userRequest?.email) return friendship.userRequest.email;
    if (friendship.userReceive?.email) return friendship.userReceive.email;
    return '';
  };

  const getFriendId = (friendship) => {
    if (friendship.userRequest?.id) return friendship.userRequest.id;
    if (friendship.userReceive?.id) return friendship.userReceive.id;
    return friendship.id;
  };

  const getAvatarUrl = (user) => {
    if (user?.avatarUrl) {
      // El backend ahora devuelve URLs completas, pero agregamos timestamp para evitar caché
      return user.avatarUrl.includes('?') ? `${user.avatarUrl}&t=${Date.now()}` : `${user.avatarUrl}?t=${Date.now()}`;
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=ff6b35&color=fff&size=150`;
  };

  const getFriendAvatarUrl = (friendship) => {
    const friendUser = friendship.userRequest?.id === user.id ? friendship.userReceive : friendship.userRequest;
    return getAvatarUrl(friendUser);
  };

  return (
    <div className="amigos-container">
      <header className="reco-header">
        <div className="reco-title-row">
          <button className="back-btn" onClick={() => navigate('/inicio')}>
            <ArrowLeft size={20} />
          </button>
          <h1>{t.amigos?.title || 'Amigos'}</h1>
        </div>
        <p>{t.amigos?.subtitle || 'Conecta con otros usuarios'}</p>
      </header>

      {/* TABS DE NAVEGACIÓN */}
      <div className="amigos-tabs">
        <button 
          className={`tab-btn ${activeTab === 'friends' ? 'active' : ''}`}
          onClick={() => setActiveTab('friends')}
        >
          Amigos ({amigos.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'requests' ? 'active' : ''}`}
          onClick={() => setActiveTab('requests')}
        >
          Solicitudes ({pendingRequests.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'search' ? 'active' : ''}`}
          onClick={() => setActiveTab('search')}
        >
          Buscar
        </button>
        <button 
          className={`tab-btn ${activeTab === 'activity' ? 'active' : ''}`}
          onClick={() => setActiveTab('activity')}
        >
          Actividad
        </button>
      </div>

      {/* TAB: AMIGOS */}
      {activeTab === 'friends' && (
        <div className="tab-content">
          {loading ? (
            <p style={{ textAlign: 'center', color: '#aaa' }}>Cargando amigos...</p>
          ) : amigos.length > 0 ? (
            <div className="amigos-grid">
              {amigos.map((amigo) => (
                <div key={amigo.id} className="amigo-card">
                  <div className="amigo-header">
                    <div className="avatar-status-wrapper">
                      <img
                        src={getFriendAvatarUrl(amigo)}
                        alt={getFriendName(amigo)}
                        className="amigo-avatar"
                        onError={(e) => {
                          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(getFriendName(amigo) || 'U')}&background=ff6b35&color=fff&size=150`;
                        }}
                      />
                    </div>
                    <div className="amigo-main-info">
                      <h4>{getFriendName(amigo)}</h4>
                      <p>{getFriendEmail(amigo)}</p>
                    </div>
                  </div>

                  <div className="amigo-actions">
                    <button 
                      className="action-btn profile"
                      onClick={() => openFriendProfile(amigo)}
                    >
                      Ver Perfil
                    </button>
                    <button 
                      className="action-btn delete"
                      onClick={() => handleRemoveFriend(amigo.id)}
                      title="Eliminar amigo"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ textAlign: 'center', color: '#aaa', padding: '2rem' }}>
              No tienes amigos aún. ¡Busca usuarios para agregar!
            </p>
          )}
        </div>
      )}

      {/* TAB: SOLICITUDES */}
      {activeTab === 'requests' && (
        <div className="tab-content">
          <div className="requests-section">
            <h3>Solicitudes Recibidas</h3>
            {pendingRequests.length > 0 ? (
              <div className="requests-list">
                {pendingRequests.map((req) => (
                  <div key={req.id} className="request-item">
                    <div className="request-info">
                      <img
                        src={getAvatarUrl(req.userRequest)}
                        alt={req.userRequest?.name}
                        className="request-avatar"
                        onError={(e) => {
                          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(req.userRequest?.name || 'U')}&background=ff6b35&color=fff&size=50`;
                        }}
                      />
                      <div>
                        <h4>{req.userRequest?.name}</h4>
                        <p>{req.userRequest?.email}</p>
                      </div>
                    </div>
                    <div className="request-actions">
                      <button 
                        className="btn-accept"
                        onClick={() => handleRespondRequest(req.id, 'Accepted')}
                      >
                        Aceptar
                      </button>
                      <button 
                        className="btn-reject"
                        onClick={() => handleRespondRequest(req.id, 'Rejected')}
                      >
                        Rechazar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: '#aaa' }}>No tienes solicitudes pendientes</p>
            )}
          </div>

          <div className="requests-section">
            <h3>Solicitudes Enviadas</h3>
            {sentRequests.length > 0 ? (
              <div className="requests-list">
                {sentRequests.map((req) => (
                  <div key={req.id} className="request-item">
                    <div className="request-info">
                      <img
                        src={getAvatarUrl(req.userReceive)}
                        alt={req.userReceive?.name}
                        className="request-avatar"
                        onError={(e) => {
                          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(req.userReceive?.name || 'U')}&background=ff6b35&color=fff&size=50`;
                        }}
                      />
                      <div>
                        <h4>{req.userReceive?.name}</h4>
                        <p>{req.userReceive?.email}</p>
                        <small style={{ color: '#ff6b35' }}>Pendiente</small>
                      </div>
                    </div>
                    <div className="request-actions">
                      <button 
                        className="btn-cancel"
                        onClick={() => handleCancelRequest(req.id)}
                      >
                        <Trash2 size={16} /> Cancelar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: '#aaa' }}>No has enviado solicitudes</p>
            )}
          </div>
        </div>
      )}

      {/* TAB: BUSCAR */}
      {activeTab === 'search' && (
        <div className="tab-content">
          <form onSubmit={handleSearch} className="search-form">
            <div className="search-bar-amigos">
              <Search size={20} color="#bbb" />
              <input
                type="text"
                placeholder="Busca por nombre o email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button type="submit" className="search-btn">Buscar</button>
          </form>

          {searchLoading ? (
            <p style={{ textAlign: 'center', color: '#aaa' }}>Buscando...</p>
          ) : searchResults.length > 0 ? (
            <div className="search-results">
              {searchResults.map((result) => (
                <div key={result.id} className="search-result-item">
                  <div className="result-info">
                    <img
                      src={getAvatarUrl(result)}
                      alt={result.name}
                      className="result-avatar"
                      onError={(e) => {
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(result.name || 'U')}&background=ff6b35&color=fff&size=50`;
                      }}
                    />
                    <div>
                      <h4>{result.name}</h4>
                      <p>{result.email}</p>
                    </div>
                  </div>
                  <button 
                    className="btn-add-friend"
                    onClick={() => handleSendRequest(result.id)}
                  >
                    <UserPlus size={16} /> Agregar
                  </button>
                </div>
              ))}
            </div>
          ) : searchQuery && (
            <p style={{ textAlign: 'center', color: '#aaa', padding: '2rem' }}>
              No se encontraron usuarios
            </p>
          )}
        </div>
      )}

      {/* TAB: ACTIVIDAD */}
      {activeTab === 'activity' && (
        <div className="tab-content">
          {activity.length > 0 ? (
            <div className="activity-list">
              {activity.map((act, idx) => (
                <div key={idx} className="activity-item">
                  <img
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(act.userName || 'U')}&background=ff6b35&color=fff&size=50`}
                    alt={act.userName}
                    className="activity-avatar"
                  />
                  <div className="activity-content">
                    <div className="activity-header">
                      <h4>{act.userName}</h4>
                      <span className="activity-type">{act.activityType}</span>
                    </div>
                    <p className="activity-description">
                      {act.activityDescription} <strong>{act.contentTitle}</strong>
                    </p>
                  </div>
                  {act.contentPosterUrl && (
                    <img
                      src={act.contentPosterUrl}
                      alt={act.contentTitle}
                      className="activity-poster"
                    />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p style={{ textAlign: 'center', color: '#aaa', padding: '2rem' }}>
              No hay actividad reciente de tus amigos
            </p>
          )}
        </div>
      )}

      {/* MODAL: PERFIL DE AMIGO */}
      {selectedFriend && (
        <div className="modal-overlay" onClick={() => setSelectedFriend(null)}>
          <div className="modal-content friend-profile-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal" onClick={() => setSelectedFriend(null)}>
              <X size={24} />
            </button>

            {loadingFriendProfile ? (
              <p style={{ textAlign: 'center', color: '#aaa' }}>Cargando perfil...</p>
            ) : (
              <div className="friend-profile-content">
                <div className="friend-profile-header">
                  <img
                    src={getFriendAvatarUrl(selectedFriend)}
                    alt={getFriendName(selectedFriend)}
                    className="friend-profile-avatar"
                    onError={(e) => {
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(getFriendName(selectedFriend) || 'U')}&background=ff6b35&color=fff&size=150`;
                    }}
                  />
                  <div className="friend-profile-info">
                    <h2>{getFriendName(selectedFriend)}</h2>
                    <p>{getFriendEmail(selectedFriend)}</p>
                  </div>
                </div>

                {/* Películas que está viendo */}
                {friendWatching.length > 0 && (
                  <div className="friend-section">
                    <h3>
                      <Eye size={18} /> Viendo Ahora
                    </h3>
                    <div className="friend-content-grid">
                      {friendWatching.map((movie) => (
                        <div key={movie.id} className="friend-content-item">
                          <img src={movie.posterUrl} alt={movie.title} />
                          <div className="progress-bar">
                            <div 
                              className="progress-fill" 
                              style={{ width: `${movie.progress}%` }}
                            ></div>
                          </div>
                          <p className="progress-text">{movie.progress}%</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Favoritos */}
                {friendFavorites.length > 0 && (
                  <div className="friend-section">
                    <h3>
                      <Heart size={18} /> Favoritos
                    </h3>
                    <div className="friend-content-grid">
                      {friendFavorites.slice(0, 6).map((fav) => (
                        <div key={fav.id} className="friend-content-item">
                          <img src={fav.posterUrl} alt={fav.title} />
                          <p className="content-title">{fav.title}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {friendWatching.length === 0 && friendFavorites.length === 0 && (
                  <p style={{ textAlign: 'center', color: '#aaa', padding: '2rem' }}>
                    Este amigo aún no tiene actividad
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: CONFIRMAR ELIMINACIÓN DE AMIGO */}
      {confirmDeleteModal && (
        <div className="modal-overlay" onClick={() => !confirmDeleteModal.isDeleting && setConfirmDeleteModal(null)}>
          <div className="modal-content confirm-delete-modal" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-delete-header">
              <div className="confirm-delete-icon">
                <Trash2 size={32} color="#d32f2f" />
              </div>
              <h2>Eliminar Amigo</h2>
            </div>

            <p className="confirm-delete-message">
              ¿Estás seguro de que deseas eliminar este amigo? Esta acción no se puede deshacer.
            </p>

            <div className="confirm-delete-actions">
              <button 
                className="btn-cancel-delete"
                onClick={() => setConfirmDeleteModal(null)}
                disabled={confirmDeleteModal.isDeleting}
              >
                Cancelar
              </button>
              <button 
                className="btn-confirm-delete"
                onClick={confirmDeleteFriend}
                disabled={confirmDeleteModal.isDeleting}
              >
                {confirmDeleteModal.isDeleting ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}