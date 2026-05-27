import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, ArrowLeft, Film, Tv, Eye, X, Trash2 } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { useMedia } from '../../context/MediaContext';
import { getT } from '../../i18n';
import './Favoritos.css';

export default function Favoritos() {
  const navigate = useNavigate();
  const { settings } = useSettings();
  const t = getT(settings.language);
  const { favoriteMovies, favoriteSeries, watchedMovies, watchedSeries, toggleMovieWatched, toggleSeriesWatched } = useMedia();

  const [stats, setStats] = useState({
    moviesWatchedThisYear: 0,
    seriesWatchedThisYear: 0
  });

  const [selectedItem, setSelectedItem] = useState(null);
  const [showWatchedSeriesModal, setShowWatchedSeriesModal] = useState(false);
  const [showWatchedMoviesModal, setShowWatchedMoviesModal] = useState(false);

  useEffect(() => {
    // Actualizar estadísticas basadas en películas/series vistas
    setStats({
      moviesWatchedThisYear: watchedMovies.length,
      seriesWatchedThisYear: watchedSeries.length
    });
  }, [watchedMovies, watchedSeries]);

  const renderMovieSection = (title, movies, icon) => {
    if (movies.length === 0) return null;

    return (
      <section className="favoritos-section">
        <div className="section-head">
          <h3>
            {icon && <icon size={20} style={{ marginRight: '0.5rem' }} />}
            {title}
          </h3>
          <span className="section-count">{movies.length}</span>
        </div>
        <div className="favoritos-list">
          {movies.map((movie) => (
            <div 
              key={movie.tmdbId} 
              className="favorito-item"
              onClick={() => setSelectedItem({ ...movie, type: 'movie' })}
            >
              <img
                src={movie.posterUrl || 'https://via.placeholder.com/80x120?text=Sin+portada'}
                alt={movie.title}
                className="favorito-poster"
              />
              <div className="favorito-details">
                <h4>{movie.title}</h4>
                <p>{movie.director || 'Director desconocido'}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  };

  const renderSeriesSection = (title, series, icon) => {
    if (series.length === 0) return null;

    return (
      <section className="favoritos-section">
        <div className="section-head">
          <h3>
            {icon && <icon size={20} style={{ marginRight: '0.5rem' }} />}
            {title}
          </h3>
          <span className="section-count">{series.length}</span>
        </div>
        <div className="favoritos-list">
          {series.map((show) => (
            <div 
              key={show.tmdbId} 
              className="favorito-item"
              onClick={() => setSelectedItem({ ...show, type: 'series' })}
            >
              <img
                src={show.posterUrl || 'https://via.placeholder.com/80x120?text=Sin+portada'}
                alt={show.title}
                className="favorito-poster"
              />
              <div className="favorito-details">
                <h4>{show.title}</h4>
                <p>{show.creator || 'Creador desconocido'}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  };

  const totalFavorites = favoriteMovies.length + favoriteSeries.length + watchedMovies.length + watchedSeries.length;

  return (
    <div className="favoritos-container">
      <header className="reco-header">
        <div className="reco-title-row">
          <button className="back-btn" onClick={() => navigate('/inicio')}>
            <ArrowLeft size={20} />
          </button>
          <h1>Mis Favoritos</h1>
        </div>
        <p>Tus películas y series favoritas, guardadas y vistas</p>
      </header>

      {/* ESTADÍSTICAS */}
      <div className="stats-grid">
        <div className="stat-card" onClick={() => setShowWatchedMoviesModal(true)} style={{ cursor: 'pointer' }}>
          <div className="stat-icon-circle">
            <Film color="#ff6b35" size={24} />
          </div>
          <div className="stat-info">
            <h3>Películas 2026</h3>
            <p className="big-number">{stats.moviesWatchedThisYear}</p>
          </div>
        </div>

        <div className="stat-card" onClick={() => setShowWatchedSeriesModal(true)} style={{ cursor: 'pointer' }}>
          <div className="stat-icon-circle">
            <Tv color="#ff6b35" size={24} />
          </div>
          <div className="stat-info">
            <h3>Series 2026</h3>
            <p className="big-number">{stats.seriesWatchedThisYear}</p>
          </div>
        </div>
      </div>

      {/* PELÍCULAS Y SERIES FAVORITAS EN 2 COLUMNAS */}
      <div className="favoritos-two-columns">
        <div className="column">
          {renderMovieSection('Películas Favoritas', favoriteMovies, Film)}
        </div>
        <div className="column">
          {renderSeriesSection('Series Favoritas', favoriteSeries, Tv)}
        </div>
      </div>

      {/* MENSAJE CUANDO NO HAY NADA */}
      {totalFavorites === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#aaa' }}>
          <Heart size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
          <p>No tienes favoritos aún</p>
          <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
            Agrega películas o series a tus favoritos para verlos aquí
          </p>
        </div>
      )}

      {/* MODAL DE DETALLES */}
      {selectedItem && (
        <div className="modal-overlay" onClick={() => setSelectedItem(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal" onClick={() => setSelectedItem(null)}>
              <X size={24} />
            </button>
            <div className="modal-body">
              <img
                src={selectedItem.posterUrl || 'https://via.placeholder.com/150x220?text=Sin+portada'}
                alt={selectedItem.title}
                className="modal-img"
              />
              <div className="modal-details">
                <h2>{selectedItem.title}</h2>
                <p className="modal-author">
                  {selectedItem.type === 'movie' 
                    ? `Dirigida por ${selectedItem.director || 'Director desconocido'}`
                    : `Creada por ${selectedItem.creator || 'Creador desconocido'}`
                  }
                </p>
                {selectedItem.genre && (
                  <p style={{ fontSize: '0.8rem', color: '#ff6b35', marginBottom: '0.5rem' }}>
                    {selectedItem.genre}
                  </p>
                )}
                {selectedItem.rating && (
                  <p style={{ fontSize: '0.75rem', color: '#999', marginBottom: '0.5rem' }}>
                    ⭐ Calificación: {selectedItem.rating.toFixed(1)}/10
                  </p>
                )}
                <div className="modal-section">
                  <h3 className="modal-label">Sinopsis</h3>
                  <p className="modal-text">{selectedItem.plot || 'Sin sinopsis disponible'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE PELÍCULAS VISTAS */}
      {showWatchedMoviesModal && (
        <div className="modal-overlay" onClick={() => setShowWatchedMoviesModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal" onClick={() => setShowWatchedMoviesModal(false)}>
              <X size={24} />
            </button>
            <h2 style={{ textAlign: 'center', marginBottom: '2rem', position: 'sticky', top: 0, backgroundColor: 'white', paddingTop: '20px', zIndex: 10 }}>Películas Vistas en 2026</h2>
            <div className="modal-scrollable-content">
              {watchedMovies.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#aaa' }}>No has visto películas aún</p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
                  {watchedMovies.map((movie) => (
                    <div 
                      key={movie.tmdbId}
                      className="modal-card"
                      style={{ position: 'relative' }}
                    >
                      <button
                        className="modal-card-delete-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleMovieWatched(movie);
                        }}
                        title="Eliminar de vistas"
                      >
                        <Trash2 size={16} />
                      </button>
                      <div onClick={() => {
                        setSelectedItem({ ...movie, type: 'movie' });
                        setShowWatchedMoviesModal(false);
                      }}>
                        <img
                          src={movie.posterUrl || 'https://via.placeholder.com/120x180?text=Sin+portada'}
                          alt={movie.title}
                        />
                        <h4>{movie.title}</h4>
                        <p>{movie.director || 'Director desconocido'}</p>
                        {movie.rating && (
                          <p className="rating">⭐ {movie.rating.toFixed(1)}/10</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE SERIES VISTAS */}
      {showWatchedSeriesModal && (
        <div className="modal-overlay" onClick={() => setShowWatchedSeriesModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal" onClick={() => setShowWatchedSeriesModal(false)}>
              <X size={24} />
            </button>
            <h2 style={{ textAlign: 'center', marginBottom: '2rem', position: 'sticky', top: 0, backgroundColor: 'white', paddingTop: '20px', zIndex: 10 }}>Series Vistas en 2026</h2>
            <div className="modal-scrollable-content">
              {watchedSeries.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#aaa' }}>No has visto series aún</p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
                  {watchedSeries.map((series) => (
                    <div 
                      key={series.tmdbId}
                      className="modal-card"
                      style={{ position: 'relative' }}
                    >
                      <button
                        className="modal-card-delete-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSeriesWatched(series);
                        }}
                        title="Eliminar de vistas"
                      >
                        <Trash2 size={16} />
                      </button>
                      <div onClick={() => {
                        setSelectedItem({ ...series, type: 'series' });
                        setShowWatchedSeriesModal(false);
                      }}>
                        <img
                          src={series.posterUrl || 'https://via.placeholder.com/120x180?text=Sin+portada'}
                          alt={series.title}
                        />
                        <h4>{series.title}</h4>
                        <p>{series.creator || 'Creador desconocido'}</p>
                        {series.rating && (
                          <p className="rating">⭐ {series.rating.toFixed(1)}/10</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
