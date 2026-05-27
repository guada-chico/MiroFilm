import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, ArrowLeft, Film, Tv, Eye } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { useMedia } from '../../context/MediaContext';
import { getT } from '../../i18n';
import './Favoritos.css';

export default function Favoritos() {
  const navigate = useNavigate();
  const { settings } = useSettings();
  const t = getT(settings.language);
  const { favoriteMovies, favoriteSeries, watchedMovies, watchedSeries } = useMedia();

  const [stats, setStats] = useState({
    moviesWatchedThisYear: 0,
    seriesWatchedThisYear: 0
  });

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
            <div key={movie.tmdbId} className="favorito-item">
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
            <div key={show.tmdbId} className="favorito-item">
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
        <div className="stat-card">
          <div className="stat-icon-circle">
            <Film color="#ff6b35" size={24} />
          </div>
          <div className="stat-info">
            <h3>Películas 2026</h3>
            <p className="big-number">{stats.moviesWatchedThisYear}</p>
          </div>
        </div>

        <div className="stat-card">
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

      {/* PELÍCULAS Y SERIES VISTAS */}
      {renderMovieSection('Películas Vistas', watchedMovies, Eye)}

      {/* SERIES VISTAS */}
      {renderSeriesSection('Series Vistas', watchedSeries, Eye)}

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
    </div>
  );
}
