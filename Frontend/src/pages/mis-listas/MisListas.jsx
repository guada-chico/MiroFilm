import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMedia } from '../../context/MediaContext';
import { useUser } from '../../context/UserContext';
import { useSettings } from '../../context/SettingsContext';
import { getT } from '../../i18n';
import { Clock, Play, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import './MisListas.css';

const ESTADOS = ['Pendiente', 'Viendo', 'Visto', 'Abandonado'];

const ESTADO_ICONS = {
  'Pendiente': <Clock size={16} />,
  'Viendo': <Play size={16} />,
  'Visto': <CheckCircle size={16} />,
  'Abandonado': <XCircle size={16} />
};

export default function MisListas() {
  const navigate = useNavigate();
  const { moviesByStatus, seriesByStatus, updateMovieWatchingStatus, updateSeriesWatchingStatus } = useMedia();
  const { user } = useUser();
  const { settings } = useSettings();
  const t = getT(settings.language).common;
  const [activeTab, setActiveTab] = useState('movies');

  return (
    <div className="mis-listas-content">
      <header className="reco-header">
        <div className="reco-title-row">
          <button className="back-btn" onClick={() => navigate('/inicio')}>
            <ArrowLeft size={20} />
          </button>
          <h1>Mis Listas</h1>
        </div>
      </header>
      
      <div className="listas-tabs">
        <div className="tabs-header">
          <button 
            className={`tab-btn ${activeTab === 'movies' ? 'active' : ''}`}
            onClick={() => setActiveTab('movies')}
          >
            Películas
          </button>
          <button 
            className={`tab-btn ${activeTab === 'series' ? 'active' : ''}`}
            onClick={() => setActiveTab('series')}
          >
            Series
          </button>
        </div>

        {activeTab === 'movies' && (
          <div className="estados-grid">
            {ESTADOS.map(estado => (
              <div key={`movie-${estado}`} className="estado-card">
                <div className="estado-header">
                  <span className="estado-icon">{ESTADO_ICONS[estado]}</span>
                  <h3>{estado}</h3>
                </div>
                <div className="items-list">
                  {moviesByStatus[estado]?.length > 0 ? (
                    moviesByStatus[estado].map(movie => (
                      <div key={movie.id || movie.tmdbId} className="item-row">
                        <div className="item-info">
                          <img 
                            src={movie.posterUrl || 'https://via.placeholder.com/50x75?text=No+image'}
                            alt={movie.title}
                            className="item-poster"
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/50x75?text=No+image';
                            }}
                          />
                          <div className="item-details">
                            <p className="item-title">{movie.title}</p>
                            <p className="item-meta">{movie.director}</p>
                          </div>
                        </div>
                        <div className="item-actions">
                          <select 
                            value={estado}
                            onChange={(e) => {
                              if (e.target.value !== estado) {
                                updateMovieWatchingStatus(movie, e.target.value);
                              }
                            }}
                            className="status-select"
                          >
                            {ESTADOS.map(est => (
                              <option key={est} value={est}>{est}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="empty-state">No hay películas en {estado.toLowerCase()}</p>
                  )}
                </div>
                <div className="estado-footer">
                  {moviesByStatus[estado]?.length || 0} película{moviesByStatus[estado]?.length !== 1 ? 's' : ''}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'series' && (
          <div className="estados-grid">
            {ESTADOS.map(estado => (
              <div key={`series-${estado}`} className="estado-card">
                <div className="estado-header">
                  <span className="estado-icon">{ESTADO_ICONS[estado]}</span>
                  <h3>{estado}</h3>
                </div>
                <div className="items-list">
                  {seriesByStatus[estado]?.length > 0 ? (
                    seriesByStatus[estado].map(serie => (
                      <div key={serie.id || serie.tmdbId} className="item-row">
                        <div className="item-info">
                          <img 
                            src={serie.posterUrl || 'https://via.placeholder.com/50x75?text=No+image'}
                            alt={serie.title}
                            className="item-poster"
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/50x75?text=No+image';
                            }}
                          />
                          <div className="item-details">
                            <p className="item-title">{serie.title}</p>
                            <p className="item-meta">{serie.creator}</p>
                          </div>
                        </div>
                        <div className="item-actions">
                          <select 
                            value={estado}
                            onChange={(e) => {
                              if (e.target.value !== estado) {
                                updateSeriesWatchingStatus(serie, e.target.value);
                              }
                            }}
                            className="status-select"
                          >
                            {ESTADOS.map(est => (
                              <option key={est} value={est}>{est}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="empty-state">No hay series en {estado.toLowerCase()}</p>
                  )}
                </div>
                <div className="estado-footer">
                  {seriesByStatus[estado]?.length || 0} serie{seriesByStatus[estado]?.length !== 1 ? 's' : ''}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
